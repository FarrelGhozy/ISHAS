// Test store V2-01 — kebijakan tampil tervalidasi + syarat minimal aksi (docs DATA_MODEL §3–§4).

import { describe, expect, test, beforeEach } from "bun:test";
import { storeActions, getState } from "./mock-store";
import {
  selectRegisteredInstitutions,
  selectValidationQueue,
  selectValidatedReports,
  selectReportsByInstitution,
} from "./selectors";

describe("selector", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("terdaftar = Aktif DAN pengelola aktif", () => {
    const codes = selectRegisteredInstitutions(getState()).map((i) => i.code);
    // PSN-0020 Aktif tanpa pengelola → tidak terdaftar; PSN-0021 Persiapan → tidak.
    expect(codes).toEqual(["PSN-0018", "PSN-0019"]);
  });

  test("hanya Diterima yang menjadi sumber tervalidasi", () => {
    const validated = selectValidatedReports(getState());
    expect(validated.every((r) => r.validationStatus === "Diterima")).toBe(true);
    expect(validated.some((r) => r.id === "RPT-0001")).toBe(false);
    expect(validated.some((r) => r.id === "RPT-0006")).toBe(false);
  });

  test("antrean validasi terfilter scope dan terurut terbaru", () => {
    const queue = selectValidationQueue(getState(), "PSN-0018");
    expect(queue.map((r) => r.id)).toEqual(["RPT-0001"]);
    expect(selectValidationQueue(getState(), "PSN-0019").map((r) => r.id)).toEqual(["RPT-0002"]);
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
    const result = storeActions.acceptReport({ name: "uji" }, "RPT-0001", undefined as never, undefined as never);
    expect(result.ok).toBe(false);
  });

  test("terima dengan placeholder Belum ditentukan ditolak sistem", () => {
    const result = storeActions.acceptReport(
      { id: "USR-003", name: "uji", role: "Pengelola Pesantren" },
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
    const result = storeActions.rejectReport({ name: "uji", id: "USR-003", role: "Pengelola Pesantren" }, "RPT-0001", "Temuan sudah ditangani sejak Agustus.");
    expect(result.ok).toBe(true);
    const report = getState().reports.find((r) => r.id === "RPT-0001");
    expect(report?.validationStatus).toBe("Ditolak");
    expect(report?.handlingStatus).toBe("Ditolak");
  });

  test("pengelola tidak dapat memoderasi laporan di luar scope", () => {
    const result = storeActions.acceptReport(
      { id: "USR-003", name: "Uji", role: "Pengelola Pesantren" },
      "RPT-0002",
      "Sedang",
      "Sedang",
    );
    expect(result.ok).toBe(false);
    expect(getState().reports.find((report) => report.id === "RPT-0002")?.validationStatus).toBe("Menunggu validasi");
  });

  test("reset mengembalikan seed konsisten", () => {
    storeActions.resetMockData();
    const state = getState();
    expect(state.schemaVersion).toBe(4);
    expect(selectRegisteredInstitutions(state).length).toBe(2);
  });
});

describe("lifecycle tindak lanjut V2-06", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pengelola Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("Pending memerlukan PIC, tenggat, dan rencana sebelum menjadi Proses", () => {
    expect(storeActions.updateHandlingStatus(manager, "RPT-0003", "Proses").ok).toBe(false);
    expect(storeActions.updateHandlingStatus(manager, "RPT-0003", "Proses", { owner: "Tim Sarana", dueDate: "2099-10-01", note: "Perbaikan tangga dijadwalkan pekan ini." }).ok).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0003")?.handlingStatus).toBe("Proses");
    expect(getState().recommendations.find((item) => item.reportId === "RPT-0003")?.owner).toBe("Tim Sarana");
  });

  test("laporan hanya Completed setelah semua temuan terverifikasi dan bukti tersedia", () => {
    expect(storeActions.updateHandlingStatus(manager, "RPT-0004", "Completed", { progress: 100, evidenceName: "perbaikan.jpg", note: "Perbaikan telah diperiksa." }).ok).toBe(false);
    expect(storeActions.verifyFinding(manager, "RSK-RPT-0004-1", "Kabel sudah terlindungi dengan baik.").ok).toBe(true);
    expect(storeActions.updateHandlingStatus(manager, "RPT-0004", "Completed", { progress: 100, evidenceName: "perbaikan.jpg", note: "Perbaikan telah diperiksa." }).ok).toBe(true);
    expect(getState().recommendations.find((item) => item.reportId === "RPT-0004")?.completionEvidence).toBe("perbaikan.jpg");
  });

  test("arsip menjaga data dan menghilangkannya dari sumber publik", () => {
    expect(storeActions.deleteCompletedReport(manager, "RPT-0005", "Arsip laporan lama").ok).toBe(false);
    const otherManager = { id: "USR-004", name: "H. Siti Aminah", role: "Pengelola Pesantren" };
    expect(storeActions.deleteCompletedReport(otherManager, "RPT-0005", "Arsip laporan lama").ok).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0005")?.archivedAt).toBeTruthy();
    expect(selectValidatedReports(getState()).some((report) => report.id === "RPT-0005")).toBe(false);
    expect(getState().auditEvents.some((event) => event.objectId === "RPT-0005" && event.action === "Mengarsipkan laporan selesai")).toBe(true);
  });
});

describe("lokasi dan tindak lanjut V2-07", () => {
  const manager = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", role: "Pengelola Pesantren" };

  beforeEach(() => storeActions.resetMockData());

  test("gedung baru membuat lantai awal, area langsung tersimpan, dan denah menyimpan versi", () => {
    const building = storeActions.addBuilding(manager, { code: "KLS-1", name: "Kelas Baru" });
    expect(building.ok).toBe(true);
    if (!building.ok || !building.id) return;
    const id = building.id;
    expect(getState().buildings.find((item) => item.id === id)?.floors[0]?.name).toBe("Lantai 1");
    expect(storeActions.addArea(manager, { buildingId: id, floor: "Lantai 1", name: "Ruang Kelas", zone: "Zona A" }).ok).toBe(true);
    const floorId = getState().buildings.find((item) => item.id === id)!.floors[0]!.id;
    expect(storeActions.savePlanVersion(manager, id, floorId, "denah.png").ok).toBe(true);
    expect(storeActions.savePlanVersion(manager, id, floorId, "denah-baru.pdf").ok).toBe(true);
    expect(getState().buildings.find((item) => item.id === id)?.floors[0]?.planHistory?.map((item) => item.version)).toEqual(["DENAH-v1", "DENAH-v2"]);
  });

  test("rekomendasi bergerak dari rencana sampai verifikasi dan menutup laporan", () => {
    const id = "REC-RPT-0003-1";
    expect(storeActions.updateRecommendation(manager, id, { note: "Progres perbaikan telah selesai.", progress: 100, evidenceName: "bukti.jpg" }).ok).toBe(true);
    expect(getState().recommendations.find((item) => item.id === id)?.status).toBe("Menunggu verifikasi");
    expect(storeActions.updateRecommendation(manager, id, { note: "Bukti diperiksa pengelola.", verify: true }).ok).toBe(true);
    expect(getState().recommendations.find((item) => item.id === id)?.status).toBe("Terverifikasi");
    expect(getState().reports.find((item) => item.id === "RPT-0003")?.handlingStatus).toBe("Completed");
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
    expect(result.id).toBe("RPT-0008");

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

    // Notifikasi hanya ke pengelola pemilik scope (USR-003), bukan ke scope lain.
    const notes = getState().notifications.filter((n) => n.sourceObjectId === result.id);
    expect(notes.length).toBe(1);
    expect(notes[0].recipientAccountId).toBe("USR-003");
    expect(notes[0].targetUrl).toBe("/pengelola/validasi-laporan");
  });

  test("laporan baru TIDAK masuk selector validated (dashboard steril)", () => {
    const result = storeActions.submitPublicReport({ name: "Santri Blok B" }, VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const validated = selectValidatedReports(getState());
    expect(validated.some((r) => r.id === result.id)).toBe(false);
  });

  test("nama/judul/deskripsi tak memenuhi syarat → ditolak dengan pesan persis", () => {
    expect(
      storeActions.submitPublicReport({ name: "x" }, { ...VALID, reporterName: "A" }).ok,
    ).toBe(false);
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
    const result = storeActions.submitPublicReport(
      { name: "x" },
      { ...VALID, areaId: "AREA-005" },
    );
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

  test("pengelola yang mengirim → email akun tersimpan, nama laporan tetap editable", () => {
    const result = storeActions.submitPublicReport(
      { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", email: "pengelola@ishas.demo", role: "Pengelola Pesantren" },
      { ...VALID, reporterName: "Nama diubah manual" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const report = getState().reports.find((r) => r.id === result.id);
    expect(report?.reporterName).toBe("Nama diubah manual");
    expect(report?.reporterAccountEmail).toBe("pengelola@ishas.demo");
  });
});

describe("regresi review frontend", () => {
  const input = { institutionCode: "PSN-0018", reporterName: "Pelapor uji", title: "Lantai koridor licin", description: "Lantai koridor licin sejak pagi dan dilalui para santri.", areaId: "AREA-001" };
  beforeEach(() => storeActions.resetMockData());

  test("Super Admin/Peneliti dan akun tak dikenal ditolak di lapisan data", () => {
    for (const id of ["USR-001", "USR-002", "USR-tidak-ada"]) {
      expect(storeActions.submitPublicReport({ id, name: "uji" }, input).ok).toBe(false);
    }
    expect(getState().reports.length).toBe(7);
  });

  test("kegagalan penyimpanan tidak membuat record/audit/notifikasi atau menghabiskan nomor", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    const before = structuredClone(getState());
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { setItem() { throw new Error("quota"); } } });
    try {
      const result = storeActions.submitPublicReport({ name: "uji" }, { ...input, clientRequestId: "retry-after-quota" });
      expect(result.ok).toBe(false);
      expect(getState()).toEqual(before);
    } finally {
      if (original) Object.defineProperty(globalThis, "localStorage", original);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
    const retry = storeActions.submitPublicReport({ name: "uji" }, { ...input, clientRequestId: "retry-after-quota" });
    expect(retry).toEqual({ ok: true, id: "RPT-0008" });
  });
});
