// Test store V2-01 — kebijakan tampil tervalidasi + syarat minimal aksi (docs DATA_MODEL §3–§4).

import { describe, expect, test, beforeEach } from "bun:test";
import { storeActions, getState } from "./mock-store";
import {
  selectRegisteredInstitutions,
  selectValidationQueue,
  selectValidatedReports,
  selectReportsByInstitution,
  selectReportsForManager,
} from "./selectors";

describe("selector", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("terdaftar = Aktif DAN pesantren aktif", () => {
    const codes = selectRegisteredInstitutions(getState()).map((i) => i.code);
    // PSN-0020 Aktif tanpa pesantren → tidak terdaftar; PSN-0021 Persiapan → tidak.
    expect(codes).toEqual(["PSN-0018", "PSN-0019"]);
  });

  test("Diterima dan Terbit menjadi sumber tervalidasi", () => {
    const validated = selectValidatedReports(getState());
    expect(
      validated.every(
        (r) => r.validationStatus === "Diterima" || r.validationStatus === "Terbit",
      ),
    ).toBe(true);
    expect(validated.some((r) => r.id === "RPT-0001")).toBe(false);
    expect(validated.some((r) => r.id === "RPT-0006")).toBe(false);
    // Penilaian mandiri terbit langsung (D-32).
    expect(validated.some((r) => r.id === "RPT-0002")).toBe(true);
  });

  test("antrean validasi hanya lapor-cepat, terfilter scope dan terurut terbaru", () => {
    const queue = selectValidationQueue(getState(), "PSN-0018");
    expect(queue.map((r) => r.id)).toEqual(["RPT-0001"]);
    // RPT-0002 penilaian mandiri Terbit tidak masuk antrean.
    expect(selectValidationQueue(getState(), "PSN-0019").map((r) => r.id)).toEqual(["RPT-0016"]);
  });

  test("filter pesantren mempersempit hasil tervalidasi", () => {
    const all = selectReportsByInstitution(getState(), null);
    const one = selectReportsByInstitution(getState(), "PSN-0018");
    expect(one.every((r) => r.institutionCode === "PSN-0018")).toBe(true);
    expect(one.length).toBeLessThan(all.length);
  });
});

describe("aturan aksi", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("terima tanpa severity/priority ditolak sistem", () => {
    const result = storeActions.acceptReport(
      { name: "uji" },
      "RPT-0001",
      undefined as never,
      undefined as never,
    );
    expect(result.ok).toBe(false);
  });

  test("terima dengan placeholder Belum ditentukan ditolak sistem", () => {
    const result = storeActions.acceptReport(
      { id: "USR-003", name: "uji", role: "Pesantren" },
      "RPT-0001",
      "Belum ditentukan" as never,
      "Belum ditentukan" as never,
    );
    expect(result.ok).toBe(false);
  });

  test("tolak tanpa alasan minimal 10 karakter ditolak sistem", () => {
    const result = storeActions.rejectReport({ name: "uji" }, "RPT-0001", "pendek");
    expect(result.ok).toBe(false);
    expect(selectValidationQueue(getState(), "PSN-0018").length).toBe(1);
  });

  test("tolak dengan alasan sah mengubah status + menyimpan alasan", () => {
    const result = storeActions.rejectReport(
      { name: "uji", id: "USR-003", role: "Pesantren" },
      "RPT-0001",
      "Temuan sudah ditangani sejak Agustus.",
    );
    expect(result.ok).toBe(true);
    const report = getState().reports.find((r) => r.id === "RPT-0001");
    expect(report?.validationStatus).toBe("Ditolak");
    expect(report?.handlingStatus).toBe("Ditolak");
  });

  test("pesantren tidak dapat memoderasi laporan di luar scope", () => {
    const result = storeActions.acceptReport(
      { id: "USR-003", name: "Uji", role: "Pesantren" },
      "RPT-0016",
      "Sedang",
      "Sedang",
      undefined,
      "Rekomendasi yang cukup panjang.",
    );
    expect(result.ok).toBe(false);
    expect(getState().reports.find((report) => report.id === "RPT-0016")?.validationStatus).toBe(
      "Menunggu validasi",
    );
  });

  test("reset mengembalikan seed konsisten", () => {
    storeActions.resetMockData();
    const state = getState();
    expect(state.schemaVersion).toBe(16);
    expect(selectRegisteredInstitutions(state).length).toBe(2);
  });
});

describe("lifecycle tindak lanjut V2-06", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("Pending memerlukan PIC, tenggat, dan rencana sebelum menjadi Proses", () => {
    const pengelolaB = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };
    expect(storeActions.updateHandlingStatus(pengelolaB, "RPT-0013", "Proses").ok).toBe(false);
    expect(
      storeActions.updateHandlingStatus(pengelolaB, "RPT-0013", "Proses", {
        owner: "Tim Sarana",
        dueDate: "2099-10-01",
        note: "Perbaikan ventilasi dijadwalkan pekan ini.",
      }).ok,
    ).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0013")?.handlingStatus).toBe(
      "Proses",
    );
    expect(getState().recommendations.find((item) => item.reportId === "RPT-0013")?.owner).toBe(
      "Tim Sarana",
    );
  });

  test("laporan hanya Completed setelah semua temuan terverifikasi dan bukti tersedia", () => {
    expect(
      storeActions.updateHandlingStatus(manager, "RPT-0003", "Completed", {
        progress: 100,
        evidenceName: "perbaikan.jpg",
        note: "Perbaikan telah diperiksa.",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Perbaikan tangga selesai dengan bukti.",
        progress: 100,
        evidenceName: "perbaikan.jpg",
      }).ok,
    ).toBe(true);
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Bukti diperiksa pesantren.",
        verify: true,
      }).ok,
    ).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0003")?.handlingStatus).toBe(
      "Completed",
    );
    expect(
      getState().recommendations.find((item) => item.reportId === "RPT-0003")?.completionEvidence,
    ).toBe("perbaikan.jpg");
  });

  test("arsip menjaga data dan menghilangkannya dari sumber publik", () => {
    expect(storeActions.deleteCompletedReport(manager, "RPT-0005", "Arsip laporan lama").ok).toBe(
      false,
    );
    const otherManager = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };
    expect(
      storeActions.deleteCompletedReport(otherManager, "RPT-0005", "Arsip laporan lama").ok,
    ).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0005")?.archivedAt).toBeTruthy();
    expect(selectValidatedReports(getState()).some((report) => report.id === "RPT-0005")).toBe(
      false,
    );
    expect(
      getState().auditEvents.some(
        (event) => event.objectId === "RPT-0005" && event.action === "Mengarsipkan laporan selesai",
      ),
    ).toBe(true);
  });
});

describe("lokasi dan tindak lanjut V2-07", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("gedung baru membuat lantai awal, area langsung tersimpan, dan denah menyimpan versi", () => {
    const building = storeActions.addBuilding(manager, { code: "LAB-1", name: "Lab Baru" });
    expect(building.ok).toBe(true);
    if (!building.ok || !building.id) return;
    const id = building.id;
    expect(getState().buildings.find((item) => item.id === id)?.floors[0]?.name).toBe("Lantai 1");
    expect(
      storeActions.addArea(manager, {
        buildingId: id,
        floor: "Lantai 1",
        name: "Ruang Kelas",
        zone: "Zona A",
      }).ok,
    ).toBe(true);
    const floorId = getState().buildings.find((item) => item.id === id)!.floors[0]!.id;
    expect(storeActions.savePlanVersion(manager, id, floorId, "denah.png").ok).toBe(true);
    expect(storeActions.savePlanVersion(manager, id, floorId, "denah-baru.pdf").ok).toBe(true);
    expect(
      getState()
        .buildings.find((item) => item.id === id)
        ?.floors[0]?.planHistory?.map((item) => item.version),
    ).toEqual(["DENAH-v1", "DENAH-v2"]);
  });

  test("rekomendasi bergerak dari rencana sampai verifikasi dan menutup laporan", () => {
    const id = "REC-RPT-0003-1";
    expect(
      storeActions.updateRecommendation(manager, id, {
        note: "Progres perbaikan telah selesai.",
        progress: 100,
        evidenceName: "bukti.jpg",
      }).ok,
    ).toBe(true);
    expect(getState().recommendations.find((item) => item.id === id)?.status).toBe(
      "Menunggu verifikasi",
    );
    expect(
      storeActions.updateRecommendation(manager, id, {
        note: "Bukti diperiksa pesantren.",
        verify: true,
      }).ok,
    ).toBe(true);
    expect(getState().recommendations.find((item) => item.id === id)?.status).toBe("Terverifikasi");
    expect(getState().reports.find((item) => item.id === "RPT-0003")?.handlingStatus).toBe(
      "Completed",
    );
  });

  test("progres dinormalisasi ke titik slider terdekat (D-20)", () => {
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Progres dibulatkan ke titik slider.",
        progress: 30,
      }).ok,
    ).toBe(true);
    expect(getState().recommendations.find((item) => item.id === "REC-RPT-0003-1")?.progress).toBe(
      25,
    );
  });

  test("rekomendasi terminal (Terverifikasi/Dibatalkan) menolak pembaruan progres", () => {
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0011-1", {
        note: "Coba ubah yang sudah selesai.",
        progress: 50,
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0009-1", {
        note: "Coba ubah yang dibatalkan.",
        progress: 50,
      }).ok,
    ).toBe(false);
  });

  test("bukti 100% menerima assetId sah dan menolak format palsu (D-21)", () => {
    const valid = "evidence-asset-123e4567-e89b-12d3-a456-426614174000";
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Selesai dengan bukti upload.",
        progress: 100,
        evidenceName: "tangga.jpg",
        evidenceAssetId: valid,
      }).ok,
    ).toBe(true);
    expect(
      getState().recommendations.find((item) => item.id === "REC-RPT-0003-1")
        ?.completionEvidenceAssetId,
    ).toBe(valid);
    storeActions.resetMockData();
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Selesai dengan bukti palsu.",
        progress: 100,
        evidenceName: "tangga.jpg",
        evidenceAssetId: "evidence-asset-palsu",
      }).ok,
    ).toBe(false);
  });
});

describe("pembatalan tindak lanjut D-21", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pesantren" };
  const otherManager = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("alasan pendek ditolak; alasan sah membatalkan + temuan ikut + audit", () => {
    expect(storeActions.cancelRecommendation(manager, "REC-RPT-0003-1", "pendek").ok).toBe(false);
    expect(
      storeActions.cancelRecommendation(manager, "REC-RPT-0003-1", "Perbaikan dialihkan ke program kerja bakti mingguan.").ok,
    ).toBe(true);
    const rec = getState().recommendations.find((item) => item.id === "REC-RPT-0003-1");
    expect(rec?.status).toBe("Dibatalkan");
    expect(rec?.canceledReason).toContain("kerja bakti");
    expect(rec?.canceledBy).toBe("USR-003");
    expect(rec?.canceledAt).toBeTruthy();
    expect(
      getState().findings.find((item) => item.recommendationId === "REC-RPT-0003-1")?.status,
    ).toBe("Dibatalkan");
    expect(
      getState().auditEvents.some(
        (event) =>
          event.objectId === "REC-RPT-0003-1" && event.action === "Membatalkan tindak lanjut",
      ),
    ).toBe(true);
    // Laporan induk tetap pada status berjalan (seed RPT-0003 Proses), tidak menjadi Completed.
    expect(getState().reports.find((item) => item.id === "RPT-0003")?.handlingStatus).toBe(
      "Proses",
    );
  });

  test("batal dari Menunggu verifikasi bisa; dari Terverifikasi/Dibatalkan ditolak", () => {
    expect(
      storeActions.cancelRecommendation(otherManager, "REC-RPT-0015-1", "Tandon sudah berfungsi normal sehingga penanganan lanjutan tidak diperlukan.").ok,
    ).toBe(true);
    expect(
      getState().recommendations.find((item) => item.id === "REC-RPT-0015-1")?.status,
    ).toBe("Dibatalkan");
    expect(
      storeActions.cancelRecommendation(otherManager, "REC-RPT-0005-1", "Alasan pembatalan yang cukup panjang.").ok,
    ).toBe(false);
    expect(
      storeActions.cancelRecommendation(manager, "REC-RPT-0009-1", "Alasan pembatalan yang cukup panjang.").ok,
    ).toBe(false);
  });

  test("Dibatalkan menghalangi Completed otomatis", () => {
    expect(
      storeActions.cancelRecommendation(
        manager,
        "REC-RPT-0003-1",
        "Perbaikan dialihkan ke rute lain yang sudah ada.",
      ).ok,
    ).toBe(true);
    // Rekomendasi satu-satunya Dibatalkan → laporan tidak boleh Completed otomatis.
    expect(
      storeActions.updateHandlingStatus(manager, "RPT-0003", "Completed", {
        progress: 100,
        evidenceName: "tangga.jpg",
        note: "Coba selesaikan meski ada tindak lanjut dibatalkan.",
      }).ok,
    ).toBe(false);
    expect(getState().reports.find((item) => item.id === "RPT-0003")?.handlingStatus).toBe(
      "Proses",
    );
  });

  test("pesantren tidak dapat membatalkan di luar scope", () => {
    expect(
      storeActions.cancelRecommendation(manager, "REC-RPT-0013-1", "Alasan pembatalan yang cukup panjang untuk uji scope.").ok,
    ).toBe(false);
    expect(
      getState().recommendations.find((item) => item.id === "REC-RPT-0013-1")?.status,
    ).toBe("Belum ditindaklanjuti");
  });
});

describe("lapor-cepat V2-03", () => {
  const VALID = {
    institutionCode: "PSN-0018",
    reporterName: "Santri Blok B",
    title: "Kabel terbuka di koridor lantai 2",
    description: "Kabel listrik menggantung di koridor lantai 2 asrama sejak kemarin.",
    areaId: "AREA-001",
    evidenceName: "koridor.jpg",
    contact: "08123456789",
  };

  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("kirim sah → RPT berurutan + Menunggu validasi ganda + Belum ditentukan + audit + notifikasi scope", () => {
    const result = storeActions.submitPublicReport({ name: "Santri Blok B" }, VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.id).toBe("RPT-0020"); // seed kini 19 laporan (RPT-0001–0019)

    const report = getState().reports.find((r) => r.id === result.id);
    expect(report?.channel).toBe("lapor-cepat");
    expect(report?.validationStatus).toBe("Menunggu validasi");
    expect(report?.handlingStatus).toBe("Menunggu validasi");
    expect(report?.severity).toBe("Belum ditentukan");
    expect(report?.priority).toBe("Belum ditentukan");

    const audit = getState().auditEvents.find(
      (a) => a.objectId === result.id && a.action === "Mengirim laporan publik",
    );
    expect(audit).toBeDefined();

    // Notifikasi hanya ke pesantren pemilik scope (USR-003), bukan ke scope lain.
    const notes = getState().notifications.filter((n) => n.sourceObjectId === result.id);
    expect(notes.length).toBe(1);
    expect(notes[0].recipientAccountId).toBe("USR-003");
    expect(notes[0].targetUrl).toBe("/pesantren/validasi-laporan");
  });

  test("laporan baru TIDAK masuk selector validated (dashboard steril)", () => {
    const result = storeActions.submitPublicReport({ name: "Santri Blok B" }, VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const validated = selectValidatedReports(getState());
    expect(validated.some((r) => r.id === result.id)).toBe(false);
  });

  test("nama/judul/deskripsi tak memenuhi syarat → ditolak dengan pesan persis", () => {
    expect(storeActions.submitPublicReport({ name: "x" }, { ...VALID, reporterName: "A" }).ok).toBe(
      false,
    );
    const short = storeActions.submitPublicReport(
      { name: "x" },
      { ...VALID, title: "Rusak", description: "pendek" },
    );
    expect(short.ok).toBe(false);
    if (!short.ok) expect(short.error).toBe("Judul minimal 10 karakter.");
  });

  test("pesantren tak dikenal/nonaktif → Pesantren tidak tersedia untuk pelaporan.", () => {
    for (const code of ["PSN-9999", "PSN-0021"]) {
      const result = storeActions.submitPublicReport(
        { name: "x" },
        { ...VALID, institutionCode: code },
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("Pesantren tidak tersedia untuk pelaporan.");
    }
  });

  test("area milik pesantren lain → ditolak (scope isolation sisi data)", () => {
    const result = storeActions.submitPublicReport({ name: "x" }, { ...VALID, areaId: "AREA-005" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Lokasi/area tidak sah untuk pesantren ini.");
  });

  test("kirim ganda dengan requestId sama → satu record, id sama", () => {
    const first = storeActions.submitPublicReport(
      { name: "x" },
      { ...VALID, clientRequestId: "req-abc" },
    );
    const second = storeActions.submitPublicReport(
      { name: "x" },
      { ...VALID, clientRequestId: "req-abc" },
    );
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.id).toBe(first.id);
    expect(getState().reports.filter((r) => r.id === first.id).length).toBe(1);
  });

  test("usulan mandiri tersimpan terpisah; keputusan final tetap Belum ditentukan", () => {
    const result = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, reporterSeverity: "Tinggi", reporterPriority: "Sedang" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const report = getState().reports.find((r) => r.id === result.id);
    expect(report?.reporterSeverity).toBe("Tinggi");
    expect(report?.reporterPriority).toBe("Sedang");
    expect(report?.severity).toBe("Belum ditentukan");
    expect(report?.priority).toBe("Belum ditentukan");
  });

  test("usulan tak dikenal ditolak dengan pesan persis", () => {
    const result = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, reporterSeverity: "Kritis" },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Usulan tingkat keparahan tidak dikenal.");
  });

  test("usulan rekomendasi opsional tersimpan; pendek/panjang ditolak (D-29)", () => {
    const kosong = storeActions.submitPublicReport({ name: "Santri Blok B" }, VALID);
    expect(kosong.ok).toBe(true);
    if (!kosong.ok) return;
    expect(
      getState().reports.find((r) => r.id === kosong.id)?.reporterRecommendation,
    ).toBeUndefined();
    const pendek = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, reporterRecommendation: "pendek" },
    );
    expect(pendek.ok).toBe(false);
    if (!pendek.ok) expect(pendek.error).toBe("Usulan rekomendasi minimal 10 karakter.");
    const panjang = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, reporterRecommendation: "x".repeat(501) },
    );
    expect(panjang.ok).toBe(false);
    if (!panjang.ok) expect(panjang.error).toBe("Usulan rekomendasi maksimal 500 karakter.");
    const sah = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, reporterRecommendation: "Amankan kabel lalu jadwalkan perbaikan teknisi." },
    );
    expect(sah.ok).toBe(true);
    if (!sah.ok) return;
    expect(
      getState().reports.find((r) => r.id === sah.id)?.reporterRecommendation,
    ).toBe("Amankan kabel lalu jadwalkan perbaikan teknisi.");
  });

  test("aspek di luar kategori ditolak tanpa menyebut indikator", () => {
    const result = storeActions.submitPublicReport(
      { name: "Santri Blok B" },
      { ...VALID, categoryId: "KAT-KESEHATAN", aspectId: "ASP-KES-001" },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Kategori/aspek tidak konsisten.");
  });

  test("pesantren yang mengirim → email akun tersimpan, nama laporan tetap editable", () => {
    const result = storeActions.submitPublicReport(
      {
        id: "USR-003",
        name: "Ust. K.H. Mustofa Kamal",
        email: "pesantren@ishas.demo",
        role: "Pesantren",
      },
      { ...VALID, reporterName: "Nama diubah manual" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const report = getState().reports.find((r) => r.id === result.id);
    expect(report?.reporterName).toBe("Nama diubah manual");
    expect(report?.reporterAccountEmail).toBe("pesantren@ishas.demo");
  });
});

describe("perbaikan pesantren D-23", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pesantren" };
  const otherManager = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("kelola tidak memuat arsip Completed", () => {
    expect(
      selectReportsForManager(getState(), "PSN-0019").some((r) => r.id === "RPT-0005"),
    ).toBe(true);
    expect(
      storeActions.archiveCompletedReport(otherManager, "RPT-0005", "Arsip laporan lama").ok,
    ).toBe(true);
    expect(
      selectReportsForManager(getState(), "PSN-0019").some((r) => r.id === "RPT-0005"),
    ).toBe(false);
  });

  test("level Ekstrem eksplisit per temuan + teraudit + scope", () => {
    expect(storeActions.setFindingLevel(manager, "RSK-RPT-0003-1", "Ekstrem").ok).toBe(true);
    expect(getState().findings.find((f) => f.id === "RSK-RPT-0003-1")?.level).toBe("Ekstrem");
    expect(
      getState().auditEvents.some(
        (e) => e.objectId === "RSK-RPT-0003-1" && e.action === "Mengubah tingkat risiko temuan",
      ),
    ).toBe(true);
    expect(storeActions.setFindingLevel(otherManager, "RSK-RPT-0003-1", "Tinggi").ok).toBe(false);
    expect(storeActions.setFindingLevel(manager, "RSK-RPT-0003-1", "Kritis" as never).ok).toBe(
      false,
    );
  });

  test("progres tepi dinormalisasi ke titik slider (12→0, 88→100)", () => {
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Progres kecil dibulatkan ke nol.",
        progress: 12,
      }).ok,
    ).toBe(true);
    expect(getState().recommendations.find((r) => r.id === "REC-RPT-0003-1")?.progress).toBe(0);
    storeActions.resetMockData();
    expect(
      storeActions.updateRecommendation(manager, "REC-RPT-0003-1", {
        note: "Progres besar dibulatkan ke seratus dengan bukti.",
        progress: 88,
        evidenceName: "tangga.jpg",
      }).ok,
    ).toBe(true);
    const rec = getState().recommendations.find((r) => r.id === "REC-RPT-0003-1");
    expect(rec?.progress).toBe(100);
    expect(rec?.status).toBe("Menunggu verifikasi");
  });
});

describe("regresi review frontend", () => {
  const input = {
    institutionCode: "PSN-0018",
    reporterName: "Pelapor uji",
    title: "Lantai koridor licin",
    description: "Lantai koridor licin sejak pagi dan dilalui para santri.",
    areaId: "AREA-001",
  };
  beforeEach(() => storeActions.resetMockData());

  test("Super Admin/Validator dan akun tak dikenal ditolak di lapisan data", () => {
    for (const id of ["USR-001", "USR-002", "USR-tidak-ada"]) {
      expect(storeActions.submitPublicReport({ id, name: "uji" }, input).ok).toBe(false);
    }
    expect(getState().reports.length).toBe(19);
  });

  test("kegagalan penyimpanan tidak membuat record/audit/notifikasi atau menghabiskan nomor", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    const before = structuredClone(getState());
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        setItem() {
          throw new Error("quota");
        },
      },
    });
    try {
      const result = storeActions.submitPublicReport(
        { name: "uji" },
        { ...input, clientRequestId: "retry-after-quota" },
      );
      expect(result.ok).toBe(false);
      expect(getState()).toEqual(before);
    } finally {
      if (original) Object.defineProperty(globalThis, "localStorage", original);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
    const retry = storeActions.submitPublicReport(
      { name: "uji" },
      { ...input, clientRequestId: "retry-after-quota" },
    );
    expect(retry).toEqual({ ok: true, id: "RPT-0020" });
  });
});

describe("notifikasi tandai dibaca (Fase 5)", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("menandai semua notifikasi akun lalu menghormati filter ids", () => {
    const sebelum = getState().notifications.filter((n) => n.recipientAccountId === "USR-003");
    expect(sebelum.length).toBeGreaterThan(0);
    expect(sebelum.some((n) => !n.read)).toBe(true);

    expect(storeActions.markNotificationsRead("USR-003").ok).toBe(true);
    expect(
      getState()
        .notifications.filter((n) => n.recipientAccountId === "USR-003")
        .every((n) => n.read),
    ).toBe(true);

    // Akun lain tidak ikut terpengaruh.
    expect(
      getState()
        .notifications.filter((n) => n.recipientAccountId === "USR-004")
        .some((n) => !n.read),
    ).toBe(true);
  });
});
