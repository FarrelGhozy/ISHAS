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
  test("tepat 4 kategori dengan ID/nama/ikon stabil", () => {
    expect(K3_CATEGORIES.map((c) => c.id)).toEqual([
      "KAT-KESELAMATAN",
      "KAT-KESEHATAN",
      "KAT-LINGKUNGAN",
      "KAT-PSIKOSOSIAL",
    ]);
    expect(K3_CATEGORIES.map((c) => c.name)).toEqual([
      "Keselamatan",
      "Kesehatan",
      "Lingkungan",
      "Psikososial",
    ]);
    expect(K3_CATEGORIES.map((c) => c.icon)).toEqual([
      "ShieldCheck",
      "HeartPulse",
      "Leaf",
      "Brain",
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
    (r) => r.validationStatus === "Diterima" && !r.archivedAt && r.handlingStatus !== "Completed",
  );
  const ids = new Set(reports.map((r) => r.id));
  const findings = SEED.findings.filter((f) => ids.has(f.reportId));
  const snapshots = SEED.selfAssessmentSnapshots.filter((s) => ids.has(s.reportId));
  const input = { reports, findings, snapshots, versions: SEED.instrumentVersions };

  test("katalog indikator unik: 4 Keselamatan + 2 + 2 + 2", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName["Keselamatan"].jumlahIndikator).toBe(4);
    expect(byName["Kesehatan"].jumlahIndikator).toBe(2);
    expect(byName["Lingkungan"].jumlahIndikator).toBe(2);
    expect(byName["Psikososial"].jumlahIndikator).toBe(2);
    expect(byName[KATEGORI_BELUM_DIPETAKAN].jumlahIndikator).toBe(0);
  });

  test("temuan terpetakan ke seluruh kategori + Belum dipetakan (lapor-cepat)", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    // Keselamatan: RPT-0004 + RPT-0008 + 3 turunan RPT-0010; Kesehatan: RPT-0007 + RPT-0013 + RPT-0015;
    // Lingkungan: RPT-0009 + turunan RPT-0010 + RPT-0014; Psikososial: turunan RPT-0014;
    // Belum dipetakan: RPT-0003 tanpa kategori/indikator.
    expect(byName["Keselamatan"].jumlahTemuan).toBe(5);
    expect(byName["Kesehatan"].jumlahTemuan).toBe(3);
    expect(byName["Lingkungan"].jumlahTemuan).toBe(3);
    expect(byName["Psikososial"].jumlahTemuan).toBe(1);
    expect(byName[KATEGORI_BELUM_DIPETAKAN].jumlahTemuan).toBe(1);
  });

  test("risiko Ekstrem terisi satu (temuan APAR musala) dan konsisten dengan total", () => {
    const rows = hitungRekapKategori(input);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName["Keselamatan"].risiko.Ekstrem).toBe(1);
    for (const row of rows) {
      if (row.name !== "Keselamatan") expect(row.risiko.Ekstrem).toBe(0);
      expect(row.jumlahTemuan).toBe(
        row.risiko.Ekstrem + row.risiko.Tinggi + row.risiko.Sedang + row.risiko.Rendah,
      );
    }
  });

  test("sesuai/tidak sesuai hanya dari snapshot Diterima", () => {
    const rows = hitungRekapKategori(input);
    const total = rows.reduce((n, r) => n + r.jumlahSesuai + r.jumlahTidakSesuai, 0);
    // 32 jawaban terisi; satu nilai legacy di luar skala versi asal tidak diklasifikasi.
    expect(total).toBe(31);
  });

  test("Draft tidak memperbesar katalog dan tidak mengganti definisi jawaban historis", () => {
    const historical = structuredClone(
      SEED.instrumentVersions.find((version) => version.id === snapshots[0].instrumentVersionId)!,
    );
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
    expect(rows.find((row) => row.name === "Psikososial")!.jumlahSesuai).toBe(1);
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
