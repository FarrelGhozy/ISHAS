// Test kategori/aspek K3 (D-15): single source, rekap per kategori, Ekstrem, migrasi v6.

import { describe, expect, test } from "bun:test";
import { K3_CATEGORIES, K3_ASPECT_MAP, KATEGORI_BELUM_DIPETAKAN } from "../kategori-k3";
import {
  hitungRekapKategori,
  hitungRisikoPrioritas,
  kategoriOfFinding,
  pilihTemuanPrioritas,
} from "./dashboard-aggregate";
import { migrateV5 } from "../store/state";
import { SEED } from "../seed/seed";
import type { RiskFinding } from "../types";

describe("K3_CATEGORIES single source of truth", () => {
  test("tepat 6 kategori dengan ID/nama/ikon stabil", () => {
    expect(K3_CATEGORIES.map((c) => c.id)).toEqual([
      "KAT-KESELAMATAN",
      "KAT-DARURAT",
      "KAT-KESEHATAN",
      "KAT-LINGKUNGAN",
      "KAT-PSIKOSOSIAL",
      "KAT-AKSESIBILITAS",
    ]);
    expect(K3_CATEGORIES.map((c) => c.name)).toEqual([
      "Keselamatan dan Keamanan Gedung & Asrama",
      "Sistem Tanggap Darurat & Antisipasi Kebencanaan",
      "Kesehatan",
      "Kesehatan Lingkungan",
      "Psikososial: Bullying & Kesehatan Mental",
      "Fasilitas Disabilitas & Aksesibilitas",
    ]);
    expect(K3_CATEGORIES.map((c) => c.icon)).toEqual([
      "ShieldCheck",
      "Siren",
      "HeartPulse",
      "Leaf",
      "Brain",
      "Accessibility",
    ]);
    for (const c of K3_CATEGORIES) {
      expect(c.description.length).toBeGreaterThan(10);
      expect(c.aspects.length).toBeGreaterThan(0);
    }
  });

  test("aspek terdaftar konsisten dengan kategorinya", () => {
    expect(K3_ASPECT_MAP["ASP-KES-001"].categoryId).toBe("KAT-KESELAMATAN");
    expect(K3_ASPECT_MAP["ASP-PSI-001"].categoryId).toBe("KAT-PSIKOSOSIAL");
  });
});

describe("hitungRekapKategori", () => {
  const reports = SEED.reports.filter(
    (r) =>
      (r.validationStatus === "Diterima" || r.validationStatus === "Terbit") &&
      !r.archivedAt &&
      r.handlingStatus !== "Completed",
  );
  const ids = new Set(reports.map((r) => r.id));
  const findings = SEED.findings.filter((f) => ids.has(f.reportId));
  const snapshots = SEED.selfAssessmentSnapshots.filter((s) => ids.has(s.reportId));
  const input = { reports, findings, snapshots, versions: SEED.instrumentVersions };

  test("katalog indikator unik: 10 + 10 + 10 + 10 + 8 + 11", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName["Keselamatan dan Keamanan Gedung & Asrama"].jumlahIndikator).toBe(10);
    expect(byName["Sistem Tanggap Darurat & Antisipasi Kebencanaan"].jumlahIndikator).toBe(10);
    expect(byName["Kesehatan"].jumlahIndikator).toBe(10);
    expect(byName["Kesehatan Lingkungan"].jumlahIndikator).toBe(10);
    expect(byName["Psikososial: Bullying & Kesehatan Mental"].jumlahIndikator).toBe(8);
    expect(byName["Fasilitas Disabilitas & Aksesibilitas"].jumlahIndikator).toBe(11);
    expect(byName[KATEGORI_BELUM_DIPETAKAN].jumlahIndikator).toBe(0);
  });

  test("temuan terpetakan ke seluruh kategori + Belum dipetakan (lapor-cepat)", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    // D-32: penilaian mandiri tidak lagi menyumbang temuan. Tersisa lapor-cepat:
    // Keselamatan: RPT-0019; Tanggap Darurat: RPT-0008 (APAR);
    // Kesehatan: RPT-0013 + RPT-0015 + RPT-0018; Lingkungan: RPT-0009;
    // Psikososial/Aksesibilitas: (kosong); Belum dipetakan: RPT-0003.
    expect(byName["Keselamatan dan Keamanan Gedung & Asrama"].jumlahTemuan).toBe(1);
    expect(byName["Sistem Tanggap Darurat & Antisipasi Kebencanaan"].jumlahTemuan).toBe(1);
    expect(byName["Kesehatan"].jumlahTemuan).toBe(3);
    expect(byName["Kesehatan Lingkungan"].jumlahTemuan).toBe(1);
    expect(byName["Psikososial: Bullying & Kesehatan Mental"].jumlahTemuan).toBe(0);
    expect(byName["Fasilitas Disabilitas & Aksesibilitas"].jumlahTemuan).toBe(0);
    expect(byName[KATEGORI_BELUM_DIPETAKAN].jumlahTemuan).toBe(1);
  });

  test("risiko Ekstrem terisi satu (temuan APAR musala) dan konsisten dengan total", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName["Sistem Tanggap Darurat & Antisipasi Kebencanaan"].risiko.Ekstrem).toBe(1);
    for (const row of rows) {
      if (row.name !== "Sistem Tanggap Darurat & Antisipasi Kebencanaan")
        expect(row.risiko.Ekstrem).toBe(0);
      expect(row.jumlahTemuan).toBe(
        row.risiko.Ekstrem + row.risiko.Tinggi + row.risiko.Sedang + row.risiko.Rendah,
      );
    }
  });

  test("sesuai/tidak sesuai hanya dari snapshot Diterima/Terbit", () => {
    const rows = hitungRekapKategori(input);
    const total = rows.reduce((n, r) => n + r.jumlahSesuai + r.jumlahTidakSesuai, 0);
    // D-44: 5 snapshot penilaian mandiri × 59 indikator = 295 jawaban terklasifikasi.
    expect(total).toBe(295);
  });

  test("Draft tidak memperbesar katalog dan tidak mengganti definisi jawaban historis", () => {
    const historical = structuredClone(
      SEED.instrumentVersions.find((version) => version.id === snapshots[0].instrumentVersionId)!,
    );
    // Versi asal snapshot bukan lagi satu-satunya Published (INS-v2.0); tandai
    // arsip agar katalog hanya dihitung dari versi Published.
    historical.status = "Archived";
    const indicator = historical.dimensions[0].indicators[0];
    indicator.answerType = "likert-1-2-tidak";
    indicator.categoryId = "KAT-PSIKOSOSIAL";
    const draft = structuredClone(historical);
    draft.id = "INS-test-draft";
    draft.status = "Draft";
    draft.dimensions[0].indicators[0].answerType = "likert-1-5";
    draft.dimensions[0].indicators[0].categoryId = "KAT-KESELAMATAN";
    const snapshot = {
      ...snapshots[0],
      answers: { [indicator.id]: { ...Object.values(snapshots[0].answers)[0], value: "2" } },
    };
    const rows = hitungRekapKategori({
      ...input,
      findings: [],
      snapshots: [snapshot],
      versions: [draft, historical],
    });
    expect(
      rows.find((row) => row.name === "Psikososial: Bullying & Kesehatan Mental")!.jumlahSesuai,
    ).toBe(1);
    expect(rows.reduce((sum, row) => sum + row.jumlahTidakSesuai, 0)).toBe(0);
    expect(rows.reduce((sum, row) => sum + row.jumlahIndikator, 0)).toBe(0);
  });

  test("laporan pending, ditolak, dan Completed tidak mengisi rekap meskipun input tercampur", () => {
    const excluded = ["Menunggu validasi", "Ditolak"] as const;
    for (const validationStatus of excluded) {
      const rows = hitungRekapKategori({
        ...input,
        reports: reports.map((report) => ({ ...report, validationStatus })),
      });
      expect(
        rows.reduce(
          (sum, row) => sum + row.jumlahTemuan + row.jumlahSesuai + row.jumlahTidakSesuai,
          0,
        ),
      ).toBe(0);
    }
    const rows = hitungRekapKategori({
      ...input,
      reports: reports.map((report) => ({ ...report, handlingStatus: "Completed" })),
    });
    expect(rows.reduce((sum, row) => sum + row.jumlahTemuan, 0)).toBe(0);
  });
});

describe("kategoriOfFinding", () => {
  test("field langsung diutamakan; fallback relasi indikator; lalu Belum dipetakan", () => {
    const direct = {
      reportId: "RPT-0004",
      indicator: "IND-K3L-002",
      categoryId: "KAT-LINGKUNGAN",
    } as RiskFinding;
    expect(kategoriOfFinding(direct, SEED.instrumentVersions)).toBe("KAT-LINGKUNGAN");
    const viaIndicator = { reportId: "RPT-0004", indicator: "IND-K3L-002" } as RiskFinding;
    expect(kategoriOfFinding(viaIndicator, SEED.instrumentVersions)).toBe("KAT-KESELAMATAN");
    const unmapped = {
      reportId: "RPT-0003",
      indicator: "Tidak menggunakan instrumen",
    } as RiskFinding;
    expect(kategoriOfFinding(unmapped, SEED.instrumentVersions)).toBeNull();
  });

  test("meneruskan bank live untuk indikator yang tak ada di versi warisan", () => {
    const bank = structuredClone(SEED.instrument);
    bank.dimensions[0].indicators.push({
      id: "IND-K3L-099",
      code: "IND-K3L-099",
      title: "Indikator bank baru",
      prompt: "Prompt indikator bank baru.",
      categoryId: "KAT-PSIKOSOSIAL",
      answerType: "ya-tidak",
      required: true,
      evidenceRequired: false,
      locationRequired: false,
      weight: 1,
      options: [{ value: "Ya", label: "Ya", weight: 100, isFinding: false }],
    });
    const finding = { reportId: "RPT-0004", indicator: "IND-K3L-099" } as RiskFinding;
    expect(kategoriOfFinding(finding, SEED.instrumentVersions)).toBeNull();
    expect(kategoriOfFinding(finding, SEED.instrumentVersions, undefined, bank)).toBe(
      "KAT-PSIKOSOSIAL",
    );
  });
});

describe("level Ekstrem", () => {
  test("kartu tindakan segera mencakup Tinggi dan Ekstrem yang belum Terverifikasi", () => {
    expect(
      hitungRisikoPrioritas([
        { level: "Tinggi", status: "Berjalan" },
        { level: "Ekstrem", status: "Belum ditindaklanjuti" },
        { level: "Ekstrem", status: "Terverifikasi" },
        { level: "Sedang", status: "Berjalan" },
      ] as RiskFinding[]),
    ).toBe(2);
  });
  test("prioritas: Ekstrem di atas Tinggi", () => {
    const items = [
      { id: "a", level: "Rendah", status: "Berjalan", observedAt: "2026-09-01T00:00:00.000Z" },
      { id: "b", level: "Ekstrem", status: "Berjalan", observedAt: "2026-09-01T00:00:00.000Z" },
      { id: "c", level: "Tinggi", status: "Berjalan", observedAt: "2026-09-01T00:00:00.000Z" },
    ] as RiskFinding[];
    expect(pilihTemuanPrioritas(items, 3).map((f) => f.level)).toEqual([
      "Ekstrem",
      "Tinggi",
      "Rendah",
    ]);
  });
});

describe("migrateV5", () => {
  test("v5 dipertahankan dan dinaikkan ke v6 tanpa menghapus record", () => {
    const v5 = { ...structuredClone(SEED), schemaVersion: 5 };
    const migrated = migrateV5(v5) as typeof SEED;
    expect(migrated.schemaVersion).toBe(6);
    expect(migrated.reports.length).toBe(SEED.reports.length);
    expect(migrated.findings.length).toBe(SEED.findings.length);
  });

  test("non-v5 dilewati apa adanya", () => {
    expect(migrateV5({ schemaVersion: 6 })).toEqual({ schemaVersion: 6 });
    expect(migrateV5(null)).toBeNull();
  });
});
