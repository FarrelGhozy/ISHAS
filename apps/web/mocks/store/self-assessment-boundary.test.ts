// Test regresi boundary penilaian-mandiri + turunan terima + publik D-08.
// Menutup temuan flow.md §13: D-03 di kanal mandiri, lokasi manual D-11,
// validasi scope/versi draft, syarat PIC/tenggat satu sumber, arsip di agregat,
// turunan temuan saat Terima, dan nama pelapor tanpa kata "Anonim" (D-02).

import { describe, expect, test, beforeEach } from "bun:test";
import { storeActions, getState } from "./mock-store";
import { selectPublicReports, selectValidatedReports } from "./selectors";
import { pilihSnapshotTerbaruDiterima } from "../processors/dashboard-aggregate";
import { SEED } from "../seed/seed";
import type { SelfAssessmentDraft } from "../types";

const PENGELOLA = {
  id: "USR-003",
  name: "Ust. K.H. Mustofa Kamal",
  email: "pesantren@ishas.demo",
  role: "Pesantren",
};
const ADMIN = { id: "USR-001", name: "Nadia Permata", role: "Super Admin" };

function draftLengkap(
  id: string,
  overrides: Partial<SelfAssessmentDraft> = {},
): SelfAssessmentDraft {
  return {
    id,
    institutionCode: "PSN-0018",
    reporterName: "Penguji Mandiri",
    instrumentVersionId: SEED.activeInstrumentVersionId ?? "INS-v1.1",
    answers: {
      "IND-K3L-001": {
        value: "3",
        note: "",
        evidenceName: "",
        areaId: "AREA-001",
        planPoint: null,
      },
      "IND-K3L-002": {
        value: "2",
        note: "",
        evidenceName: "kabel.jpg",
        areaId: "AREA-001",
        planPoint: null,
      },
      "IND-K3L-003": { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-004": { value: "3", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-005": {
        value: "Ya",
        note: "",
        evidenceName: "",
        areaId: "AREA-002",
        planPoint: null,
      },
      "IND-K3L-006": { value: "4", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-007": { value: "4", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-008": { value: "4", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-009": { value: "2", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-010": { value: "4", note: "", evidenceName: "", areaId: "", planPoint: null },
    },
    activeIndex: 0,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function simpan(id: string, overrides: Partial<SelfAssessmentDraft> = {}) {
  const r = storeActions.saveSelfAssessmentDraft(draftLengkap(id, overrides));
  expect(r.ok).toBe(true);
  return id;
}

describe("boundary pengirim penilaian-mandiri (D-03)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("admin/validator/akun tak dikenal ditolak di lapisan data", () => {
    simpan("SELF-PSN-0018");
    for (const actor of [
      ADMIN,
      { id: "USR-002", name: "M. Ridwan", role: "Validator" },
      { id: "USR-tidak-ada", name: "uji" },
    ]) {
      expect(storeActions.submitSelfAssessment(actor, "SELF-PSN-0018").ok).toBe(false);
    }
    expect(getState().reports.length).toBe(19);
  });

  test("publik tanpa login dan pesantren aktif lolos + email akun tersimpan", () => {
    simpan("SELF-PSN-0018");
    const publik = storeActions.submitSelfAssessment(
      { name: "Warga", role: "Publik" },
      "SELF-PSN-0018",
    );
    expect(publik.ok).toBe(true);
    if (!publik.ok || !publik.id) return;
    expect(getState().reports.find((r) => r.id === publik.id)?.validationStatus).toBe("Terbit");

    simpan("SELF-PSN-0018");
    const kelola = storeActions.submitSelfAssessment(PENGELOLA, "SELF-PSN-0018");
    expect(kelola.ok).toBe(true);
    if (!kelola.ok || !kelola.id) return;
    expect(getState().reports.find((r) => r.id === kelola.id)?.reporterAccountEmail).toBe(
      "pesantren@ishas.demo",
    );
  });

  test("snapshot kiriman membawa cacah jawabanTerisi (D-35)", () => {
    simpan("SELF-PSN-0018");
    const kirim = storeActions.submitSelfAssessment({ name: "Warga", role: "Publik" }, "SELF-PSN-0018");
    expect(kirim.ok).toBe(true);
    if (!kirim.ok || !kirim.id) return;
    const snapshot = getState().selfAssessmentSnapshots.find((s) => s.reportId === kirim.id);
    // Draft uji mengisi 10 jawaban → cacah bawaan 10 untuk proyeksi publik D-02.
    expect(snapshot?.jawabanTerisi).toBe(10);
  });
});

describe("lokasi manual + scope/checksum draft (D-24/D-11)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("jawaban locationRequired boleh memakai manualLocation tanpa areaId", () => {
    simpan("SELF-PSN-0018", {
      answers: {
        ...draftLengkap("x").answers,
        "IND-K3L-001": {
          value: "2",
          note: "",
          evidenceName: "",
          areaId: "",
          manualLocation: "Sisi barat asrama",
          planPoint: null,
        },
      },
    });
    const r = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(r.ok).toBe(true);
  });

  test("draft scope tak terdaftar ditolak; kirim memakai bank live", () => {
    expect(
      storeActions.saveSelfAssessmentDraft(
        draftLengkap("SELF-PSN-9999", { institutionCode: "PSN-9999" }),
      ).ok,
    ).toBe(false);
    // Versioning dihapus (D-24): nilai instrumentVersionId warisan diabaikan,
    // draft tersimpan dengan checksum bank live.
    expect(
      storeActions.saveSelfAssessmentDraft(
        draftLengkap("SELF-PSN-0018", { instrumentVersionId: "INS-tak-ada" }),
      ).ok,
    ).toBe(true);
  });

  test("draft tanpa nama tetap tersimpan (nama divalidasi saat kirim)", () => {
    const r = storeActions.saveSelfAssessmentDraft(
      draftLengkap("SELF-PSN-0018", { reporterName: "" }),
    );
    expect(r.ok).toBe(true);
    const kirim = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(kirim.ok).toBe(false);
  });

  test("draft basi (soal berubah) tidak boleh dikirim, wajib ulang dari awal (D-24)", () => {
    simpan("SELF-PSN-0018");
    const added = storeActions.addBankDimension("Dimensi Uji Basi");
    expect(added.ok).toBe(true);
    const r = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("berubah");
    // Draft basi bisa dibuang agar pelapor mulai baru.
    expect(storeActions.deleteSelfAssessmentDraft("SELF-PSN-0018").ok).toBe(true);
  });
});

describe("turunan temuan saat Terima (flow peta/rekomendasi)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("lapor-cepat Diterima langsung punya 1 temuan + 1 rekomendasi Belum ditindaklanjuti", () => {
    const r = storeActions.acceptReport(
      PENGELOLA,
      "RPT-0001",
      "Tinggi",
      "Tinggi",
      undefined,
      "Amankan kabel dengan pelindung lalu jadwalkan perbaikan instalasi.",
    );
    expect(r.ok).toBe(true);
    expect(getState().findings.filter((f) => f.reportId === "RPT-0001").length).toBe(1);
    const rec = getState().recommendations.filter((x) => x.reportId === "RPT-0001");
    expect(rec.length).toBe(1);
    expect(rec[0].status).toBe("Belum ditindaklanjuti");
    expect(rec[0].location).toContain("Koridor");
    expect(rec[0].action).toContain("pelindung");
  });

  test("lapor-cepat tanpa rekomendasi final ditolak; usulan pendek juga ditolak", () => {
    expect(storeActions.acceptReport(PENGELOLA, "RPT-0001", "Tinggi", "Tinggi").ok).toBe(false);
    expect(
      storeActions.acceptReport(PENGELOLA, "RPT-0001", "Tinggi", "Tinggi", undefined, "pendek").ok,
    ).toBe(false);
    expect(getState().reports.find((x) => x.id === "RPT-0001")?.validationStatus).toBe(
      "Menunggu validasi",
    );
  });

  test("turunan seed tidak digandakan saat transisi lain berjalan", () => {
    storeActions.acceptReport(
      PENGELOLA,
      "RPT-0001",
      "Sedang",
      "Sedang",
      undefined,
      "Amankan kabel dengan pelindung lalu jadwalkan perbaikan instalasi.",
    );
    expect(
      storeActions.updateHandlingStatus(PENGELOLA, "RPT-0001", "Proses", {
        owner: "Tim Sarana",
        dueDate: "2099-10-01",
        note: "Rencana perbaikan koridor.",
      }).ok,
    ).toBe(true);
    expect(getState().findings.filter((f) => f.reportId === "RPT-0001").length).toBe(1);
  });
});

describe("satu sumber syarat PIC/tenggat + guard tindak lanjut", () => {
  beforeEach(() => storeActions.resetMockData());

  test("rencana tanpa catatan / PIC pendek / tenggat lampau ditolak", () => {
    storeActions.acceptReport(
      PENGELOLA,
      "RPT-0001",
      "Sedang",
      "Sedang",
      undefined,
      "Amankan kabel dengan pelindung lalu jadwalkan perbaikan instalasi.",
    );
    const id = getState().recommendations.find((x) => x.reportId === "RPT-0001")!.id;
    expect(
      storeActions.updateRecommendation(PENGELOLA, id, {
        owner: "Tim",
        dueDate: "2099-10-01",
        note: "",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateRecommendation(PENGELOLA, id, {
        owner: "A",
        dueDate: "2099-10-01",
        note: "Rencana.",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateRecommendation(PENGELOLA, id, {
        owner: "Tim",
        dueDate: "2000-01-01",
        note: "Rencana.",
      }).ok,
    ).toBe(false);
  });

  test("tindak lanjut laporan yang sudah diarsip ditolak", () => {
    const other = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };
    // RPT-0013 (lapor-cepat) satu rekomendasi: Belum → Berjalan → 100% → verifikasi → Completed → arsip.
    const id = "REC-RPT-0013-1";
    expect(
      storeActions.updateRecommendation(other, id, {
        owner: "Tim Kesehatan",
        dueDate: "2099-10-01",
        note: "Rencana perbaikan ventilasi kamar.",
      }).ok,
    ).toBe(true);
    expect(
      storeActions.updateRecommendation(other, id, {
        note: "Selesai, bukti terlampir.",
        progress: 100,
        evidenceName: "ventilasi.jpg",
      }).ok,
    ).toBe(true);
    expect(
      storeActions.updateRecommendation(other, id, {
        note: "Verifikasi akhir.",
        verify: true,
      }).ok,
    ).toBe(true);
    expect(getState().reports.find((report) => report.id === "RPT-0013")?.handlingStatus).toBe(
      "Completed",
    );
    expect(
      storeActions.archiveCompletedReport(other, "RPT-0013", "Arsip akhir periode").ok,
    ).toBe(true);
    expect(
      storeActions.updateRecommendation(other, id, {
        note: "Cek ulang lagi.",
        progress: 100,
        evidenceName: "bukti.jpg",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.cancelRecommendation(other, id, "Alasan pembatalan yang cukup panjang.").ok,
    ).toBe(false);
  });
});

describe("publik D-08 + arsip di agregat", () => {
  beforeEach(() => storeActions.resetMockData());

  test("hasil pesantren yang kehilangan pesantren hilang dari publik, tetap internal", () => {
    expect(
      selectPublicReports(getState(), null).some((r) => r.institutionCode === "PSN-0018"),
    ).toBe(true);
    expect(storeActions.setUserStatus("USR-003", "Nonaktif").ok).toBe(true);
    const publik = selectPublicReports(getState(), null);
    expect(publik.some((r) => r.institutionCode === "PSN-0018")).toBe(false);
    expect(selectValidatedReports(getState()).some((r) => r.institutionCode === "PSN-0018")).toBe(
      true,
    );
  });

  test("snapshot laporan yang diarsip tidak menjadi sumber indeks", () => {
    const sebelum = pilihSnapshotTerbaruDiterima(
      getState().reports,
      getState().selfAssessmentSnapshots,
      "PSN-0018",
    );
    expect(sebelum?.reportId).toBe("RPT-0010");
    const withArchive = getState().reports.map((r) =>
      r.id === "RPT-0010" ? { ...r, archivedAt: "2026-09-09T00:00:00.000Z" } : r,
    );
    // Arsip snapshot terbaru → mundur ke snapshot Diterima sebelumnya (RPT-0004, INS-v1.0).
    expect(
      pilihSnapshotTerbaruDiterima(withArchive, getState().selfAssessmentSnapshots, "PSN-0018")
        ?.reportId,
    ).toBe("RPT-0004");
    const withAllArchived = withArchive.map((r) =>
      r.id === "RPT-0004" ? { ...r, archivedAt: "2026-09-09T00:00:00.000Z" } : r,
    );
    expect(
      pilihSnapshotTerbaruDiterima(withAllArchived, getState().selfAssessmentSnapshots, "PSN-0018"),
    ).toBeNull();
  });

  test("archiveCompletedReport + alias lama mengarsipkan (bukan menghapus)", () => {
    const other = { id: "USR-004", name: "H. Siti Aminah", role: "Pesantren" };
    expect(storeActions.archiveCompletedReport(other, "RPT-0005", "abcd").ok).toBe(false);
    expect(storeActions.archiveCompletedReport(other, "RPT-0005", "Arsip akhir periode").ok).toBe(
      true,
    );
    const report = getState().reports.find((r) => r.id === "RPT-0005");
    expect(report?.archivedAt).toBeTruthy();
    expect(getState().reports.some((r) => r.id === "RPT-0005")).toBe(true);
  });
});

describe("seed D-02", () => {
  test("tidak ada nama pelapor berawalan kata Anonim", () => {
    expect(SEED.reports.some((r) => r.reporterName.trim().toLowerCase().startsWith("anonim"))).toBe(
      false,
    );
  });
});

describe("bank live + snapshot beku + PDF (D-24)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("kirim membekukan soal + skor % + waktu PDF pada laporan", () => {
    simpan("SELF-PSN-0018");
    const r = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(r.ok).toBe(true);
    if (!r.ok || !r.id) return;
    const report = getState().reports.find((x) => x.id === r.id)!;
    expect(report.instrumentVersionId).toBe("INS-LIVE");
    expect(report.instrumentChecksum).toBe(getState().instrument.checksum);
    expect(typeof report.scorePercent).toBe("number");
    expect(report.pdfGeneratedAt).toBeTruthy();
    const snapshot = getState().selfAssessmentSnapshots.find((s) => s.reportId === r.id)!;
    expect(snapshot.frozenIndicators?.length).toBe(10);
    expect(snapshot.scorePercent).toBe(report.scorePercent);
    // Beku: ubah bank tidak mengubah skor tersimpan.
    expect(storeActions.deleteBankIndicator("IND-K3L-010").ok).toBe(true);
    const sesudah = getState().selfAssessmentSnapshots.find((s) => s.reportId === r.id)!;
    expect(sesudah.scorePercent).toBe(report.scorePercent);
    expect(sesudah.frozenIndicators?.length).toBe(10);
  });

  test("validator kelola penuh: tambah/edit/hapus dimensi + indikator + atur bobot", () => {
    const dim = storeActions.addBankDimension("Dimensi Uji", "KAT-KESELAMATAN");
    expect(dim.ok).toBe(true);
    if (!dim.ok || !dim.id) return;
    expect(storeActions.addBankDimension("x").ok).toBe(false);
    const ind = storeActions.addBankIndicator(dim.id, {
      code: "IND-UJI-001",
      title: "Indikator uji coba bobot",
      prompt: "Apakah kondisi uji sudah memenuhi standar minimal?",
      answerType: "frekuensi",
      required: true,
      evidenceRequired: false,
      locationRequired: false,
    });
    expect(ind.ok).toBe(true);
    if (!ind.ok || !ind.id) return;
    expect(
      storeActions.addBankIndicator(dim.id, {
        code: "IND-UJI-001",
        title: "Duplikat kode indikator",
        prompt: "Prompt duplikat yang cukup panjang.",
        answerType: "ya-tidak",
        required: true,
        evidenceRequired: false,
        locationRequired: false,
      }).ok,
    ).toBe(false);
    // Atur bobot: tolak bobot di luar 0–100 dan opsi ganda.
    expect(
      storeActions.setBankIndicatorOptions(ind.id, [
        { value: "Ya", label: "Ya", weight: 101, isFinding: false },
        { value: "Tidak", label: "Tidak", weight: 20, isFinding: true },
      ]).ok,
    ).toBe(false);
    expect(
      storeActions.setBankIndicatorOptions(
        ind.id,
        [
          { value: "Ya", label: "Ya", weight: 100, isFinding: false },
          { value: "Tidak", label: "Tidak", weight: 10, isFinding: true },
        ],
        2,
      ).ok,
    ).toBe(true);
    const live = getState().instrument.dimensions
      .flatMap((d) => d.indicators)
      .find((i) => i.id === ind.id)!;
    expect(live.options.find((o) => o.value === "Tidak")?.weight).toBe(10);
    expect(live.weight).toBe(2);
    expect(storeActions.updateBankIndicator(ind.id, { title: "Judul diubah" }).ok).toBe(true);
    expect(storeActions.deleteBankIndicator(ind.id).ok).toBe(true);
    expect(storeActions.deleteBankDimension(dim.id).ok).toBe(true);
  });
});
