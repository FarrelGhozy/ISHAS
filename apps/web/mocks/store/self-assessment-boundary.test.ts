// Test regresi boundary penilaian-mandiri + turunan terima + publik D-08.
// Menutup temuan flow.md §13: D-03 di kanal mandiri, lokasi manual D-11,
// validasi scope/versi draft, syarat PIC/tenggat satu sumber, arsip di agregat,
// turunan temuan saat Terima, dan nama pelapor tanpa kata "Anonim" (D-02).

import { describe, expect, test, beforeEach } from "bun:test";
import { storeActions, getState } from "./mock-store";
import {
  selectPublicReports,
  selectValidatedReports,
} from "./selectors";
import { pilihSnapshotTerbaruDiterima } from "../processors/dashboard-aggregate";
import { SEED } from "../seed/seed";
import type { SelfAssessmentDraft } from "../types";

const PENGELOLA = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal", email: "pengelola@ishas.demo", role: "Pengelola Pesantren" };
const ADMIN = { id: "USR-001", name: "Nadia Permata", role: "Super Admin" };

function draftLengkap(id: string, overrides: Partial<SelfAssessmentDraft> = {}): SelfAssessmentDraft {
  return {
    id,
    institutionCode: "PSN-0018",
    reporterName: "Penguji Mandiri",
    instrumentVersionId: "INS-v1.0",
    answers: {
      "IND-K3L-001": { value: "3", note: "", evidenceName: "", areaId: "AREA-001", planPoint: null },
      "IND-K3L-002": { value: "2", note: "", evidenceName: "kabel.jpg", areaId: "AREA-001", planPoint: null },
      "IND-K3L-003": { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-004": { value: "3", note: "", evidenceName: "", areaId: "", planPoint: null },
      "IND-K3L-005": { value: "Ya", note: "", evidenceName: "", areaId: "AREA-002", planPoint: null },
      "IND-K3L-006": { value: "4", note: "", evidenceName: "", areaId: "", planPoint: null },
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

  test("admin/peneliti/akun tak dikenal ditolak di lapisan data", () => {
    simpan("SELF-PSN-0018");
    for (const actor of [
      ADMIN,
      { id: "USR-002", name: "Dr. M. Ridwan", role: "Peneliti" },
      { id: "USR-tidak-ada", name: "uji" },
    ]) {
      expect(storeActions.submitSelfAssessment(actor, "SELF-PSN-0018").ok).toBe(false);
    }
    expect(getState().reports.length).toBe(7);
  });

  test("publik tanpa login dan pengelola aktif lolos + email akun tersimpan", () => {
    simpan("SELF-PSN-0018");
    const publik = storeActions.submitSelfAssessment({ name: "Warga", role: "Publik" }, "SELF-PSN-0018");
    expect(publik.ok).toBe(true);
    if (!publik.ok || !publik.id) return;
    expect(getState().reports.find((r) => r.id === publik.id)?.validationStatus).toBe("Menunggu validasi");

    simpan("SELF-PSN-0018");
    const kelola = storeActions.submitSelfAssessment(PENGELOLA, "SELF-PSN-0018");
    expect(kelola.ok).toBe(true);
    if (!kelola.ok || !kelola.id) return;
    expect(getState().reports.find((r) => r.id === kelola.id)?.reporterAccountEmail).toBe("pengelola@ishas.demo");
  });
});

describe("lokasi manual + scope/versi draft (D-10/D-11)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("jawaban locationRequired boleh memakai manualLocation tanpa areaId", () => {
    simpan("SELF-PSN-0018", {
      answers: {
        ...draftLengkap("x").answers,
        "IND-K3L-001": { value: "2", note: "", evidenceName: "", areaId: "", manualLocation: "Sisi barat asrama", planPoint: null },
      },
    });
    const r = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(r.ok).toBe(true);
  });

  test("draft scope tak terdaftar / versi non-Published ditolak", () => {
    expect(
      storeActions.saveSelfAssessmentDraft(draftLengkap("SELF-PSN-9999", { institutionCode: "PSN-9999" })).ok,
    ).toBe(false);
    expect(
      storeActions.saveSelfAssessmentDraft(draftLengkap("SELF-PSN-0018", { instrumentVersionId: "INS-tak-ada" })).ok,
    ).toBe(false);
  });

  test("draft versi lama yang sudah diarsip tidak boleh dikirim (D-10)", () => {
    simpan("SELF-PSN-0018");
    const created = storeActions.createInstrumentDraft();
    expect(created.ok).toBe(true);
    if (!created.ok || !created.id) return;
    expect(storeActions.publishInstrument(created.id).ok).toBe(true);
    const r = storeActions.submitSelfAssessment({ name: "Warga" }, "SELF-PSN-0018");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("diarsipkan");
    // Draft lama bisa dibuang agar pelapor mulai baru.
    expect(storeActions.deleteSelfAssessmentDraft("SELF-PSN-0018").ok).toBe(true);
  });
});

describe("turunan temuan saat Terima (flow peta/rekomendasi)", () => {
  beforeEach(() => storeActions.resetMockData());

  test("lapor-cepat Diterima langsung punya 1 temuan + 1 rekomendasi Belum ditindaklanjuti", () => {
    const r = storeActions.acceptReport(PENGELOLA, "RPT-0001", "Tinggi", "Tinggi");
    expect(r.ok).toBe(true);
    expect(getState().findings.filter((f) => f.reportId === "RPT-0001").length).toBe(1);
    const rec = getState().recommendations.filter((x) => x.reportId === "RPT-0001");
    expect(rec.length).toBe(1);
    expect(rec[0].status).toBe("Belum ditindaklanjuti");
    expect(rec[0].location).toContain("Koridor");
  });

  test("turunan seed tidak digandakan saat transisi lain berjalan", () => {
    storeActions.acceptReport(PENGELOLA, "RPT-0001", "Sedang", "Sedang");
    expect(storeActions.updateHandlingStatus(PENGELOLA, "RPT-0001", "Proses", {
      owner: "Tim Sarana", dueDate: "2099-10-01", note: "Rencana perbaikan koridor.",
    }).ok).toBe(true);
    expect(getState().findings.filter((f) => f.reportId === "RPT-0001").length).toBe(1);
  });
});

describe("satu sumber syarat PIC/tenggat + guard tindak lanjut", () => {
  beforeEach(() => storeActions.resetMockData());

  test("rencana tanpa catatan / PIC pendek / tenggat lampau ditolak", () => {
    storeActions.acceptReport(PENGELOLA, "RPT-0001", "Sedang", "Sedang");
    const id = getState().recommendations.find((x) => x.reportId === "RPT-0001")!.id;
    expect(storeActions.updateRecommendation(PENGELOLA, id, { owner: "Tim", dueDate: "2099-10-01", note: "" }).ok).toBe(false);
    expect(storeActions.updateRecommendation(PENGELOLA, id, { owner: "A", dueDate: "2099-10-01", note: "Rencana." }).ok).toBe(false);
    expect(storeActions.updateRecommendation(PENGELOLA, id, { owner: "Tim", dueDate: "2000-01-01", note: "Rencana." }).ok).toBe(false);
  });

  test("tindak lanjut laporan yang sudah diarsip ditolak", () => {
    const other = { id: "USR-004", name: "H. Siti Aminah", role: "Pengelola Pesantren" };
    const id = "REC-RPT-0005-1"; // RPT-0005 Completed, rekomendasi Terverifikasi
    expect(storeActions.updateRecommendation(other, id, { note: "Cek ulang.", progress: 100, evidenceName: "bukti.jpg" }).ok).toBe(true);
    expect(storeActions.archiveCompletedReport(other, "RPT-0005", "Arsip akhir periode").ok).toBe(true);
    expect(storeActions.updateRecommendation(other, id, { note: "Cek ulang lagi.", progress: 100, evidenceName: "bukti.jpg" }).ok).toBe(false);
  });
});

describe("publik D-08 + arsip di agregat", () => {
  beforeEach(() => storeActions.resetMockData());

  test("hasil pesantren yang kehilangan pengelola hilang dari publik, tetap internal", () => {
    expect(selectPublicReports(getState(), null).some((r) => r.institutionCode === "PSN-0018")).toBe(true);
    expect(storeActions.setUserStatus("USR-003", "Nonaktif").ok).toBe(true);
    const publik = selectPublicReports(getState(), null);
    expect(publik.some((r) => r.institutionCode === "PSN-0018")).toBe(false);
    expect(selectValidatedReports(getState()).some((r) => r.institutionCode === "PSN-0018")).toBe(true);
  });

  test("snapshot laporan yang diarsip tidak menjadi sumber indeks", () => {
    const sebelum = pilihSnapshotTerbaruDiterima(getState().reports, getState().selfAssessmentSnapshots, "PSN-0018");
    expect(sebelum?.reportId).toBe("RPT-0004");
    const withArchive = getState().reports.map((r) =>
      r.id === "RPT-0004" ? { ...r, archivedAt: "2026-09-09T00:00:00.000Z" } : r,
    );
    expect(pilihSnapshotTerbaruDiterima(withArchive, getState().selfAssessmentSnapshots, "PSN-0018")).toBeNull();
  });

  test("archiveCompletedReport + alias lama mengarsipkan (bukan menghapus)", () => {
    const other = { id: "USR-004", name: "H. Siti Aminah", role: "Pengelola Pesantren" };
    expect(storeActions.archiveCompletedReport(other, "RPT-0005", "abcd").ok).toBe(false);
    expect(storeActions.archiveCompletedReport(other, "RPT-0005", "Arsip akhir periode").ok).toBe(true);
    const report = getState().reports.find((r) => r.id === "RPT-0005");
    expect(report?.archivedAt).toBeTruthy();
    expect(getState().reports.some((r) => r.id === "RPT-0005")).toBe(true);
  });
});

describe("seed D-02", () => {
  test("tidak ada nama pelapor berawalan kata Anonim", () => {
    expect(SEED.reports.some((r) => r.reporterName.trim().toLowerCase().startsWith("anonim"))).toBe(false);
  });
});
