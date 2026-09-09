// Test processor agregat dashboard — aturan ilustrasi D-04 + ketentuan tampil publik.

import { describe, expect, test } from "bun:test";
import {
  buatDashboardInsight,
  hitungIndexSummary,
  hitungRisikoTinggi,
  normalisasiJawaban,
  pilihSnapshotTerbaruDiterima,
  pilihTemuanPrioritas,
  ringkasTindakLanjut,
  skorSnapshot,
} from "./dashboard-aggregate";
import { SEED } from "../seed/seed";

describe("normalisasiJawaban", () => {
  test("likert 1–5 → 20–100; Ya=100; Tidak=20", () => {
    expect(normalisasiJawaban("1")).toBe(20);
    expect(normalisasiJawaban("3")).toBe(60);
    expect(normalisasiJawaban("5")).toBe(100);
    expect(normalisasiJawaban("Ya")).toBe(100);
    expect(normalisasiJawaban("Tidak")).toBe(20);
  });

  test("kosong / N/A / di luar rentang dilewati (null), bukan nol", () => {
    expect(normalisasiJawaban("")).toBeNull();
    expect(normalisasiJawaban("N/A")).toBeNull();
    expect(normalisasiJawaban("0")).toBeNull();
    expect(normalisasiJawaban("6")).toBeNull();
  });
});

describe("hitungIndexSummary dengan seed", () => {
  const input = {
    reports: SEED.reports,
    selfAssessmentSnapshots: SEED.selfAssessmentSnapshots,
    instrumentVersions: SEED.instrumentVersions,
    indexHistory: SEED.indexHistory,
  };

  test("satu pesantren: snapshot Diterima terbaru menjadi sumber", () => {
    const summary = hitungIndexSummary(input, ["PSN-0018"]);
    // RPT-0004 (Diterima): 1,2,Ya,3,Tidak,4 → (20+40+100+60+20+80)/6 ≈ 53,3
    expect(summary.currentIndex).toBeCloseTo(53.333, 2);
    expect(summary.series.at(-1)?.period).toBe("Sep 2026");
    expect(summary.instrumentVersionIds).toEqual(["INS-v1.0"]);
  });

  test("Menunggu validasi tidak memengaruhi angka dalam kondisi apa pun", () => {
    const base = hitungIndexSummary(input, ["PSN-0019"]).currentIndex;
    const denganMenunggu = hitungIndexSummary(
      {
        ...input,
        selfAssessmentSnapshots: [
          ...input.selfAssessmentSnapshots,
          {
            reportId: "RPT-0002", // status Menunggu validasi
            instrumentVersionId: "INS-v1.0",
            submittedAt: "2026-09-08T00:00:00.000Z",
            answers: {
              "IND-K3L-001": { value: "5", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
              "IND-K3L-002": { value: "5", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
              "IND-K3L-003": { value: "Ya", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
              "IND-K3L-004": { value: "5", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
              "IND-K3L-005": { value: "Ya", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
              "IND-K3L-006": { value: "5", note: "", evidenceName: "", areaId: "AREA-005", planPoint: null },
            },
          },
        ],
      },
      ["PSN-0019"],
    ).currentIndex;
    expect(denganMenunggu).toBe(base);
  });

  test("agregat dua lembaga = bobot sama per lembaga", () => {
    const satu = hitungIndexSummary(input, ["PSN-0018"]).currentIndex as number;
    const dua = hitungIndexSummary(input, ["PSN-0019"]).currentIndex as number;
    const gabungan = hitungIndexSummary(input, ["PSN-0018", "PSN-0019"]).currentIndex as number;
    expect(gabungan).toBeCloseTo((satu + dua) / 2, 6);
  });

  test("delta dihitung dari riwayat terakhir; arah konsisten", () => {
    const summary = hitungIndexSummary(input, ["PSN-0018"]);
    const terakhirRiwayat = summary.series[summary.series.length - 2].index;
    expect(summary.delta).toBe(Math.round(summary.currentIndex as number) - terakhirRiwayat);
    expect(["naik", "turun", "tetap"]).toContain(summary.arah);
  });

  test("pesantren tanpa hasil Diterima → null, bukan nol", () => {
    const summary = hitungIndexSummary(input, ["PSN-0020"]);
    expect(summary.currentIndex).toBeNull();
    expect(summary.arah).toBe("belum-bisa-dibandingkan");
  });

  test("tanpa riwayat → series hanya titik berjalan", () => {
    const summary = hitungIndexSummary({ ...input, indexHistory: undefined }, ["PSN-0018"]);
    expect(summary.series.length).toBe(1);
    expect(summary.delta).toBeNull();
  });

  test("dimensi terisi dari instrumen versi snapshot", () => {
    const summary = hitungIndexSummary(input, ["PSN-0018", "PSN-0019"]);
    expect(summary.dimensions.map((d) => d.id)).toEqual(["DIM-001", "DIM-002"]);
    expect(summary.dimensions.every((d) => d.score !== null)).toBe(true);
  });
});

describe("pilihSnapshotTerbaruDiterima", () => {
  test("hanya snapshot laporan Diterima", () => {
    const pilihan = pilihSnapshotTerbaruDiterima(SEED.reports, SEED.selfAssessmentSnapshots, "PSN-0019");
    expect(pilihan?.reportId).toBe("RPT-0007"); // RPT-0002 Menunggu validasi → dilewati
  });
});

describe("panel temuan dan tindak lanjut", () => {
  const diterima = SEED.reports.filter((r) => r.validationStatus === "Diterima");
  const ids = new Set(diterima.map((r) => r.id));
  const findings = SEED.findings.filter((f) => ids.has(f.reportId));
  const recs = SEED.recommendations.filter((r) => ids.has(r.reportId));

  test("temuan aktif terurut Tinggi → Sedang → Rendah dan membatasi jumlah", () => {
    const prioritas = pilihTemuanPrioritas(findings, 4);
    expect(prioritas.map((f) => f.level)).toEqual(["Tinggi", "Sedang", "Sedang"]);
    expect(prioritas.every((f) => f.status !== "Terverifikasi")).toBe(true);
  });

  test("risiko tinggi menghitung temuan aktif level Tinggi", () => {
    expect(hitungRisikoTinggi(findings)).toBe(1);
  });

  test("ringkasan tindak lanjut: rata-rata progres + count", () => {
    const ringkas = ringkasTindakLanjut(recs);
    expect(ringkas.pekerjaan).toBe(4);
    expect(ringkas.terverifikasi).toBe(1);
    expect(ringkas.rataProgress).toBe(Math.round((40 + 25 + 100 + 0) / 4));
  });
});

describe("skorSnapshot", () => {
  test("semua jawaban N/A → index null (tidak memaksa skor)", () => {
    const snapshot = SEED.selfAssessmentSnapshots[0];
    const kosong = {
      ...snapshot,
      answers: Object.fromEntries(
        Object.keys(snapshot.answers).map((k) => [
          k,
          { value: "", note: "", evidenceName: "", areaId: "", planPoint: null },
        ]),
      ),
    };
    const skor = skorSnapshot(SEED.instrumentVersions, kosong);
    expect(skor.index).toBeNull();
  });

  test("versi instrumen tak dikenal → index null, bukan crash", () => {
    const snapshot = { ...SEED.selfAssessmentSnapshots[0], instrumentVersionId: "INS-v9.9" };
    const skor = skorSnapshot(SEED.instrumentVersions, snapshot);
    expect(skor.index).toBeNull();
  });
});

test("riwayat lembaga tanpa penilaian Diterima tidak memengaruhi tren agregat", () => {
  const input = structuredClone(SEED);
  input.reports = input.reports.filter((r) => r.institutionCode !== "PSN-0019");
  const all = hitungIndexSummary(input, ["PSN-0018", "PSN-0019"]);
  const one = hitungIndexSummary(input, ["PSN-0018"]);
  expect(all.series).toEqual(one.series);
  expect(all.delta).toEqual(one.delta);
});

describe("insight dashboard publik", () => {
  test("menghitung cakupan dan distribusi hanya dari laporan Diterima", () => {
    const reports = SEED.reports.filter(
      (report) => report.validationStatus === "Diterima" && !report.archivedAt,
    );
    const ids = new Set(reports.map((report) => report.id));
    const result = buatDashboardInsight({
      reports,
      findings: SEED.findings.filter((finding) => ids.has(finding.reportId)),
      recommendations: SEED.recommendations.filter((recommendation) => ids.has(recommendation.reportId)),
      institutions: SEED.institutions,
      users: SEED.users,
      buildings: SEED.buildings,
      areas: SEED.areas,
      scopeCodes: ["PSN-0018", "PSN-0019"],
    });

    expect(result.overview.pesantrenTercakup).toBe(2);
    expect(result.overview.penggunaAktif).toBe(4);
    expect(result.overview.laporanTervalidasi).toBe(4);
    expect(result.distribution.kanal).toEqual([
      { label: "Lapor cepat", value: 2 },
      { label: "Penilaian mandiri", value: 2 },
    ]);
    expect(result.distribution.aktivitas.reduce((sum, item) => sum + item.value, 0)).toBe(4);
  });

  test("filter pesantren mempersempit seluruh angka insight", () => {
    const reports = SEED.reports.filter(
      (report) => report.validationStatus === "Diterima" && report.institutionCode === "PSN-0018",
    );
    const ids = new Set(reports.map((report) => report.id));
    const result = buatDashboardInsight({
      reports,
      findings: SEED.findings.filter((finding) => ids.has(finding.reportId)),
      recommendations: SEED.recommendations.filter((recommendation) => ids.has(recommendation.reportId)),
      institutions: SEED.institutions,
      users: SEED.users,
      buildings: SEED.buildings,
      areas: SEED.areas,
      scopeCodes: ["PSN-0018"],
    });

    expect(result.overview.pesantrenTercakup).toBe(1);
    expect(result.overview.penggunaAktif).toBe(3);
    expect(result.overview.laporanTervalidasi).toBe(2);
    expect(result.distribution.risiko.reduce((sum, item) => sum + item.value, 0)).toBe(2);
  });
});
