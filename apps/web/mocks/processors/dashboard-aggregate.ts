// Processor agregat dashboard publik — ATURAN ILUSTRASI D-04 (DECISIONS.md, 8 Sep 2026),
// bukan rumus final. Sumber skor HANYA snapshot penilaian mandiri dengan laporan `Diterima`;
// laporan cepat tidak menjadi sumber skor. Per pesantren dipakai SATU snapshot `Diterima`
// terbaru. Angka selalu tampil dengan periode + versi instrumen + label data ilustrasi.

import type {
  Area,
  Building,
  IndexPoint,
  Institution,
  InstrumentVersion,
  Recommendation,
  Report,
  RiskFinding,
  SelfAssessmentSnapshot,
  User,
} from "../types";

export const PERIODE_BERJALAN = "Sep 2026"; // ilustratif; kebijakan periode menunggu D-04

// Daftar periode yang dikenal (riwayat ilustratif + periode berjalan) untuk preset
// `?periode=` (ROUTES §1). Filtering rinci menunggu D-04 final; param ini dipakai
// sebagai konteks tampilan + fallback notice, bukan agregat ilmiah baru.
export function knownPeriods(
  indexHistory: Record<string, IndexPoint[]> | undefined,
): string[] {
  const seen = new Set<string>();
  for (const points of Object.values(indexHistory ?? {})) {
    for (const point of points) seen.add(point.period);
  }
  seen.add(PERIODE_BERJALAN);
  return [...seen];
}

export function resolvePeriodeParam(
  requested: string | null | undefined,
  known: string[],
): { selected: string | undefined; invalid: string | undefined } {
  if (!requested) return { selected: undefined, invalid: undefined };
  if (known.includes(requested)) return { selected: requested, invalid: undefined };
  return { selected: undefined, invalid: requested };
}

const LIKERT_MAX = 5;
const SKOR_LIKERT_TERENDAH = 20; // likert 1 → 20 pada skala 0–100 (aturan ilustrasi)

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Normalisasi jawaban → 0–100: likert 1–5 → 20–100; `Ya` = 100, `Tidak` = 20.
// Kosong/N/A dilewati (tidak dihitung nol) — aturan ilustrasi D-04.
export function normalisasiJawaban(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  if (v === "Ya") return 100;
  if (v === "Tidak") return SKOR_LIKERT_TERENDAH;
  const numeric = Number(v);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= LIKERT_MAX) {
    return (numeric / LIKERT_MAX) * 100;
  }
  return null;
}

export type SnapshotSkor = {
  index: number | null; // null bila seluruh jawaban tidak terhitung (mis. semua N/A)
  byDimension: Record<string, number | null>;
  instrumentVersionId: string;
  submittedAt: string;
};

export function skorSnapshot(
  versions: InstrumentVersion[],
  snapshot: SelfAssessmentSnapshot,
): SnapshotSkor {
  const version = versions.find((v) => v.id === snapshot.instrumentVersionId);
  if (!version) {
    return { index: null, byDimension: {}, instrumentVersionId: snapshot.instrumentVersionId, submittedAt: snapshot.submittedAt };
  }
  const byDimension: Record<string, number | null> = {};
  const all: number[] = [];
  for (const dim of version.dimensions) {
    const scores: number[] = [];
    for (const ind of dim.indicators) {
      const answer = snapshot.answers[ind.id];
      if (!answer) continue;
      const score = normalisasiJawaban(answer.value);
      if (score === null) continue;
      scores.push(score);
      all.push(score);
    }
    byDimension[dim.id] = scores.length ? mean(scores) : null;
  }
  return {
    index: all.length ? mean(all) : null,
    byDimension,
    instrumentVersionId: snapshot.instrumentVersionId,
    submittedAt: snapshot.submittedAt,
  };
}

// Satu snapshot `Diterima` terbaru per pesantren (aturan ilustrasi D-04:
// kiriman lain tidak menggandakan bobot lembaga).
export function pilihSnapshotTerbaruDiterima(
  reports: Report[],
  snapshots: SelfAssessmentSnapshot[],
  institutionCode: string,
): SelfAssessmentSnapshot | null {
  const acceptedIds = new Set(
    reports
      .filter((r) => r.institutionCode === institutionCode && r.channel === "penilaian-mandiri" && r.validationStatus === "Diterima" && !r.archivedAt)
      .map((r) => r.id),
  );
  return (
    snapshots
      .filter((s) => acceptedIds.has(s.reportId))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] ?? null
  );
}

export type DimensiSkor = { id: string; name: string; score: number | null };

export type IndexSummary = {
  currentIndex: number | null;
  delta: number | null; // dibanding titik riwayat terakhir
  arah: "naik" | "turun" | "tetap" | "belum-bisa-dibandingkan";
  series: IndexPoint[]; // riwayat lampau (rata-rata antarlembaga) + titik periode berjalan
  dimensions: DimensiSkor[];
  periode: string;
  instrumentVersionIds: string[]; // versi sumber angka (untuk label)
};

export type IndexInput = {
  reports: Report[];
  selfAssessmentSnapshots: SelfAssessmentSnapshot[];
  instrumentVersions: InstrumentVersion[];
  indexHistory: Record<string, IndexPoint[]> | undefined;
};

export function hitungIndexSummary(input: IndexInput, institutionCodes: string[]): IndexSummary {
  const perLembaga = institutionCodes
    .map((code) => {
      const snapshot = pilihSnapshotTerbaruDiterima(
        input.reports,
        input.selfAssessmentSnapshots,
        code,
      );
      return snapshot ? skorSnapshot(input.instrumentVersions, snapshot) : null;
    })
    .filter((s): s is SnapshotSkor => s !== null && s.index !== null);

  const currentIndex = perLembaga.length ? mean(perLembaga.map((s) => s.index as number)) : null;

  // Dimensi: rata-rata antarlembaga yang punya skor untuk dimensi sama (bobot sama per lembaga).
  const dimMap = new Map<string, { name: string; scores: number[] }>();
  for (const skor of perLembaga) {
    const version = input.instrumentVersions.find((v) => v.id === skor.instrumentVersionId);
    if (!version) continue;
    for (const dim of version.dimensions) {
      const score = skor.byDimension[dim.id];
      if (score === null || score === undefined) continue;
      const entry = dimMap.get(dim.id) ?? { name: dim.name, scores: [] };
      entry.scores.push(score);
      dimMap.set(dim.id, entry);
    }
  }
  const dimensions: DimensiSkor[] = [...dimMap.entries()].map(([id, v]) => ({
    id,
    name: v.name,
    score: mean(v.scores),
  }));

  // Riwayat lampau: rata-rata antarlembaga per periode (urutan kemunculan dipertahankan).
  const periodeOrder: string[] = [];
  const periodeValues = new Map<string, number[]>();
  for (const code of institutionCodes) {
    const snapshot = pilihSnapshotTerbaruDiterima(input.reports, input.selfAssessmentSnapshots, code);
    if (!snapshot || skorSnapshot(input.instrumentVersions, snapshot).index === null) continue;
    for (const point of input.indexHistory?.[code] ?? []) {
      if (!periodeValues.has(point.period)) periodeOrder.push(point.period);
      const list = periodeValues.get(point.period) ?? [];
      list.push(point.index);
      periodeValues.set(point.period, list);
    }
  }
  const riwayat: IndexPoint[] = periodeOrder.map((period) => ({
    period,
    index: Math.round(mean(periodeValues.get(period) as number[])),
  }));

  let delta: number | null = null;
  let arah: IndexSummary["arah"] = "belum-bisa-dibandingkan";
  if (currentIndex !== null && riwayat.length > 0) {
    delta = Math.round(currentIndex) - riwayat[riwayat.length - 1].index;
    arah = delta > 0 ? "naik" : delta < 0 ? "turun" : "tetap";
  }

  const series: IndexPoint[] =
    currentIndex !== null
      ? [...riwayat, { period: PERIODE_BERJALAN, index: Math.round(currentIndex) }]
      : riwayat;

  return {
    currentIndex,
    delta,
    arah,
    series,
    dimensions,
    periode: PERIODE_BERJALAN,
    instrumentVersionIds: [...new Set(perLembaga.map((s) => s.instrumentVersionId))],
  };
}

const URUTAN_LEVEL: Record<RiskFinding["level"], number> = { Tinggi: 0, Sedang: 1, Rendah: 2 };

// Temuan aktif (belum Terverifikasi) untuk panel tindak lanjut, prioritas level tertinggi dulu.
export function pilihTemuanPrioritas(findings: RiskFinding[], limit = 4): RiskFinding[] {
  return findings
    .filter((f) => f.status !== "Terverifikasi")
    .sort(
      (a, b) =>
        URUTAN_LEVEL[a.level] - URUTAN_LEVEL[b.level] ||
        b.observedAt.localeCompare(a.observedAt),
    )
    .slice(0, limit);
}

export function hitungRisikoTinggi(findings: RiskFinding[]): number {
  return findings.filter((f) => f.level === "Tinggi" && f.status !== "Terverifikasi").length;
}

export type RingkasanTindakLanjut = { rataProgress: number | null; pekerjaan: number; terverifikasi: number };

export function ringkasTindakLanjut(recommendations: Recommendation[]): RingkasanTindakLanjut {
  return {
    rataProgress: recommendations.length
      ? Math.round(mean(recommendations.map((r) => r.progress)))
      : null,
    pekerjaan: recommendations.length,
    terverifikasi: recommendations.filter((r) => r.status === "Terverifikasi").length,
  };
}

export type DashboardOverview = {
  pesantrenTercakup: number;
  penggunaAktif: number;
  laporanTervalidasi: number;
  lokasiDipantau: number;
};

export type DashboardDistribution = {
  risiko: { label: RiskFinding["level"]; value: number }[];
  kanal: { label: "Lapor cepat" | "Penilaian mandiri"; value: number }[];
  tindakLanjut: { label: Recommendation["status"]; value: number }[];
  aktivitas: { period: string; value: number }[];
};

export type DashboardInsightInput = {
  reports: Report[];
  findings: RiskFinding[];
  recommendations: Recommendation[];
  institutions: Institution[];
  users: User[];
  buildings: Building[];
  areas: Area[];
  scopeCodes: string[];
};

const BULAN_SINGKAT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function enamBulanSampai(isoDates: string[]): { key: string; label: string }[] {
  const latest = isoDates
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date("2026-09-01T00:00:00.000Z");

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth() - (5 - index), 1));
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: `${BULAN_SINGKAT[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(-2)}`,
    };
  });
}

// Input laporan wajib sudah melewati selectValidatedReports/selectReportsByInstitution.
// Processor ini tidak pernah membaca antrean validasi atau data pelapor.
export function buatDashboardInsight(input: DashboardInsightInput): {
  overview: DashboardOverview;
  distribution: DashboardDistribution;
} {
  const scope = new Set(input.scopeCodes);
  const activeInstitutions = input.institutions.filter((institution) => scope.has(institution.code));
  const penggunaAktif = input.users.filter(
    (user) =>
      user.status === "Aktif" &&
      (user.institutionCodes.length === 0 || user.institutionCodes.some((code) => scope.has(code))),
  ).length;
  const buildingIds = new Set(
    input.buildings.filter((building) => scope.has(building.institutionCode)).map((building) => building.id),
  );
  const lokasiDipantau = input.areas.filter(
    (area) => scope.has(area.institutionCode) && buildingIds.has(area.buildingId),
  ).length;

  const riskLevels: RiskFinding["level"][] = ["Tinggi", "Sedang", "Rendah"];
  const recommendationStatuses: Recommendation["status"][] = [
    "Belum ditindaklanjuti",
    "Berjalan",
    "Menunggu verifikasi",
    "Terverifikasi",
  ];
  const months = enamBulanSampai(input.reports.map((report) => report.createdAt));

  return {
    overview: {
      pesantrenTercakup: activeInstitutions.length,
      penggunaAktif,
      laporanTervalidasi: input.reports.length,
      lokasiDipantau,
    },
    distribution: {
      risiko: riskLevels.map((label) => ({
        label,
        value: input.findings.filter((finding) => finding.level === label).length,
      })),
      kanal: [
        {
          label: "Lapor cepat",
          value: input.reports.filter((report) => report.channel === "lapor-cepat").length,
        },
        {
          label: "Penilaian mandiri",
          value: input.reports.filter((report) => report.channel === "penilaian-mandiri").length,
        },
      ],
      tindakLanjut: recommendationStatuses.map((label) => ({
        label,
        value: input.recommendations.filter((recommendation) => recommendation.status === label).length,
      })),
      aktivitas: months.map((month) => ({
        period: month.label,
        value: input.reports.filter((report) => report.createdAt.slice(0, 7) === month.key).length,
      })),
    },
  };
}
