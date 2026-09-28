// Test komposisi seed demo presentasi (D-26.f revisi seed).
// Mengunci kondisi yang wajib ada agar demo ke dosen selalu siap.

import { describe, expect, test } from "bun:test";
import { SEED } from "./seed";
import {
  selectPublicReports,
  selectRegisteredInstitutions,
  selectReportsForManager,
} from "../store/selectors";

describe("komposisi seed demo", () => {
  test("19 laporan, 5 pesantren, 6 pengguna", () => {
    expect(SEED.reports).toHaveLength(19);
    expect(SEED.institutions).toHaveLength(5);
    expect(SEED.users).toHaveLength(6);
  });

  test("RPT-0017 contoh arsip Completed", () => {
    const arsip = SEED.reports.find((item) => item.id === "RPT-0017");
    expect(arsip?.handlingStatus).toBe("Completed");
    expect(arsip?.archivedAt).toBeTruthy();
    expect(arsip?.archivedReason?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(selectPublicReports(SEED, null).some((item) => item.id === "RPT-0017")).toBe(false);
  });

  test("RPT-0018 Pending prioritas Rendah + bukti", () => {
    const item = SEED.reports.find((entry) => entry.id === "RPT-0018");
    expect(item?.priority).toBe("Rendah");
    expect(item?.evidenceName).toBeTruthy();
  });

  test("RPT-0019 Nonaktif tersembunyi publik tapi terbaca internal (D-08)", () => {
    expect(SEED.institutions.find((item) => item.code === "PSN-0023")?.status).toBe("Nonaktif");
    expect(selectPublicReports(SEED, null).some((item) => item.id === "RPT-0019")).toBe(false);
    expect(
      selectReportsForManager(SEED, "PSN-0023").some((item) => item.id === "RPT-0019"),
    ).toBe(true);
  });

  test("USR-006 Menunggu belum membuat terdaftar", () => {
    expect(SEED.users.find((item) => item.id === "USR-006")?.status).toBe("Menunggu");
    expect(selectRegisteredInstitutions(SEED).map((item) => item.code)).toEqual([
      "PSN-0018",
      "PSN-0019",
    ]);
  });

  test("SAM-0004 Berlangsung dengan jawaban sebagian", () => {
    const item = SEED.samAssessments.find((entry) => entry.id === "SAM-0004");
    expect(item?.status).toBe("Berlangsung");
    const terjawab = Object.keys(item?.answers ?? {}).length;
    expect(terjawab).toBeGreaterThan(0);
    expect(terjawab).toBeLessThan(SEED.samQuestions.length);
  });

  test("draft SELF-PSN-0018 tersedia untuk demo lanjutan", () => {
    const draft = SEED.selfAssessmentDrafts["SELF-PSN-0018"];
    expect(draft?.reporterName.trim().length ?? 0).toBeGreaterThanOrEqual(2);
    expect(Object.keys(draft?.answers ?? {}).length).toBeGreaterThan(0);
  });

  test("invarian status laporan vs rekomendasi (D-23)", () => {
    for (const report of SEED.reports) {
      if (report.handlingStatus !== "Pending" && report.handlingStatus !== "Proses") continue;
      const recs = SEED.recommendations.filter((item) => item.reportId === report.id);
      if (report.handlingStatus === "Pending") {
        // Pending hanya sah bila belum ada perbaikan berjalan.
        expect(
          recs.every(
            (item) =>
              item.status === "Belum ditindaklanjuti" || item.status === "Dibatalkan",
          ),
        ).toBe(true);
      } else {
        // Proses harus punya minimal satu rekomendasi yang sudah berjalan.
        expect(
          recs.some(
            (item) =>
              item.status === "Berjalan" ||
              item.status === "Menunggu verifikasi" ||
              item.status === "Terverifikasi",
          ),
        ).toBe(true);
      }
    }
  });

  test("draft demo memakai checksum bank saat seed (D-24)", () => {
    const draft = SEED.selfAssessmentDrafts["SELF-PSN-0018"];
    expect(SEED.instrument.checksum).toBeTruthy();
    expect(draft.instrumentChecksum).toBe(SEED.instrument.checksum);
  });
});
