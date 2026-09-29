// Processor agregat dashboard publik — ATURAN ILUSTRASI D-04 (DECISIONS.md, 8 Sep 2026),
// bukan rumus final. Sumber skor HANYA snapshot penilaian mandiri dengan laporan
// `Diterima`/`Terbit` (D-32); laporan cepat tidak menjadi sumber skor. Per pesantren
// dipakai SATU snapshot `Diterima`/`Terbit` terbaru. Angka selalu tampil dengan
// periode + versi instrumen + label data ilustrasi.

import type {
  Area,
  Building,
  FrozenIndicator,
  IndexPoint,
  Institution,
  Instrument,
  InstrumentVersion,
  Recommendation,
  Report,
  RiskFinding,
  RiskLevel,
  SelfAssessmentSnapshot,
  User,
} from "../types";
import { isJawabanTemuan } from "../instrument-bank";
import {
  K3_CATEGORIES,
  K3_CATEGORY_MAP,
  KATEGORI_BELUM_DIPETAKAN,
  type K3CategoryId,
} from "../kategori-k3";

export const PERIODE_BERJALAN = "Sep 2026"; // ilustratif; kebijakan periode menunggu D-04

// Daftar periode yang dikenal (riwayat ilustratif + periode berjalan) untuk preset
// `?periode=` (ROUTES §1). Filtering rinci menunggu D-04 final; param ini dipakai
// sebagai konteks tampilan + fallback notice, bukan agregat ilmiah baru.
export function knownPeriods(indexHistory: Record<string, IndexPoint[]> | undefined): string[] {
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

// D-24: snapshot beku diutamakan (skor % tersimpan, tidak dihitung ulang);
// snapshot lama tanpa beku memakai lookup versi warisan.
export function skorSnapshot(
  versions: InstrumentVersion[],
  snapshot: SelfAssessmentSnapshot,
): SnapshotSkor {
  if (snapshot.frozenIndicators && snapshot.scorePercent !== undefined) {
    return {
      index: snapshot.scorePercent,
      byDimension: snapshot.byDimension ?? {},
      instrumentVersionId: snapshot.instrumentVersionId,
      submittedAt: snapshot.submittedAt,
    };
  }
  const version = versions.find((v) => v.id === snapshot.instrumentVersionId);
  if (!version) {
    return {
      index: null,
      byDimension: {},
      instrumentVersionId: snapshot.instrumentVersionId,
      submittedAt: snapshot.submittedAt,
    };
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

// Satu snapshot `Diterima`/`Terbit` terbaru per pesantren (aturan ilustrasi D-04:
// kiriman lain tidak menggandakan bobot lembaga; D-32: penilaian mandiri `Terbit`).
export function pilihSnapshotTerbaruDiterima(
  reports: Report[],
  snapshots: SelfAssessmentSnapshot[],
  institutionCode: string,
): SelfAssessmentSnapshot | null {
  const acceptedIds = new Set(
    reports
      .filter(
        (r) =>
          r.institutionCode === institutionCode &&
          r.channel === "penilaian-mandiri" &&
          (r.validationStatus === "Diterima" || r.validationStatus === "Terbit") &&
          !r.archivedAt,
      )
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
  instrument?: Instrument; // D-24: bank live (nama dimensi baru)
};

export function hitungIndexSummary(input: IndexInput, institutionCodes: string[]): IndexSummary {
  const perLembaga = institutionCodes
    .map((code) => {
      const snapshot = pilihSnapshotTerbaruDiterima(
        input.reports,
        input.selfAssessmentSnapshots,
        code,
      );
      return snapshot ? { snapshot, skor: skorSnapshot(input.instrumentVersions, snapshot) } : null;
    })
    .filter((s): s is { snapshot: SelfAssessmentSnapshot; skor: SnapshotSkor } => s !== null && s.skor.index !== null);

  const currentIndex = perLembaga.length ? mean(perLembaga.map((s) => s.skor.index as number)) : null;

  // Dimensi: rata-rata antarlembaga yang punya skor untuk dimensi sama (bobot sama per lembaga).
  // Nama dimensi dari snapshot beku dulu, lalu bank live, lalu versi warisan.
  const dimMap = new Map<string, { name: string; scores: number[] }>();
  for (const { snapshot, skor } of perLembaga) {
    for (const [dimId, score] of Object.entries(skor.byDimension)) {
      if (score === null || score === undefined) continue;
      const name =
        snapshot.frozenIndicators?.find((f) => f.dimensionId === dimId)?.dimensionName ??
        input.instrument?.dimensions.find((d) => d.id === dimId)?.name ??
        input.instrumentVersions
          .find((v) => v.id === skor.instrumentVersionId)
          ?.dimensions.find((d) => d.id === dimId)?.name ??
        dimId;
      const entry = dimMap.get(dimId) ?? { name, scores: [] };
      entry.scores.push(score);
      dimMap.set(dimId, entry);
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
    const snapshot = pilihSnapshotTerbaruDiterima(
      input.reports,
      input.selfAssessmentSnapshots,
      code,
    );
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
    instrumentVersionIds: [...new Set(perLembaga.map((s) => s.skor.instrumentVersionId))],
  };
}

const URUTAN_LEVEL: Record<RiskLevel, number> = { Ekstrem: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };

// Temuan aktif (belum Terverifikasi/Dibatalkan) untuk panel tindak lanjut, prioritas level tertinggi dulu.
export function pilihTemuanPrioritas(findings: RiskFinding[], limit = 4): RiskFinding[] {
  return findings
    .filter((f) => f.status !== "Terverifikasi" && f.status !== "Dibatalkan")
    .sort(
      (a, b) =>
        URUTAN_LEVEL[a.level] - URUTAN_LEVEL[b.level] || b.observedAt.localeCompare(a.observedAt),
    )
    .slice(0, limit);
}

export function hitungRisikoTinggi(findings: RiskFinding[]): number {
  return findings.filter(
    (f) => f.level === "Tinggi" && f.status !== "Terverifikasi" && f.status !== "Dibatalkan",
  ).length;
}

export function hitungRisikoPrioritas(findings: RiskFinding[]): number {
  return findings.filter(
    (f) =>
      (f.level === "Tinggi" || f.level === "Ekstrem") &&
      f.status !== "Terverifikasi" &&
      f.status !== "Dibatalkan",
  ).length;
}

export type RingkasanTindakLanjut = {
  rataProgress: number | null;
  pekerjaan: number;
  terverifikasi: number;
  dibatalkan: number;
};

export function ringkasTindakLanjut(recommendations: Recommendation[]): RingkasanTindakLanjut {
  return {
    rataProgress: recommendations.length
      ? Math.round(mean(recommendations.map((r) => r.progress)))
      : null,
    pekerjaan: recommendations.length,
    terverifikasi: recommendations.filter((r) => r.status === "Terverifikasi").length,
    dibatalkan: recommendations.filter((r) => r.status === "Dibatalkan").length,
  };
}

export type DashboardOverview = {
  pesantrenTercakup: number;
  penggunaAktif: number;
  laporanTervalidasi: number;
  lokasiDipantau: number;
};

export type DashboardDistribution = {
  risiko: { label: RiskLevel; value: number }[];
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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function enamBulanSampai(isoDates: string[]): { key: string; label: string }[] {
  const latest =
    isoDates
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
  const activeInstitutions = input.institutions.filter((institution) =>
    scope.has(institution.code),
  );
  const penggunaAktif = input.users.filter(
    (user) =>
      user.status === "Aktif" &&
      (user.institutionCodes.length === 0 || user.institutionCodes.some((code) => scope.has(code))),
  ).length;
  const buildingIds = new Set(
    input.buildings
      .filter((building) => scope.has(building.institutionCode))
      .map((building) => building.id),
  );
  const lokasiDipantau = input.areas.filter(
    (area) => scope.has(area.institutionCode) && buildingIds.has(area.buildingId),
  ).length;

  const riskLevels: RiskLevel[] = ["Ekstrem", "Tinggi", "Sedang", "Rendah"];
  const recommendationStatuses: Recommendation["status"][] = [
    "Belum ditindaklanjuti",
    "Berjalan",
    "Menunggu verifikasi",
    "Terverifikasi",
    "Dibatalkan",
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
        value: input.recommendations.filter((recommendation) => recommendation.status === label)
          .length,
      })),
      aktivitas: months.map((month) => ({
        period: month.label,
        value: input.reports.filter((report) => report.createdAt.slice(0, 7) === month.key).length,
      })),
    },
  };
}

// ---- Rekapitulasi per kategori K3 (D-15) ----
// Satu-satunya pemetaan indikator → kategori/aspek berasal dari versi instrumen
// (field categoryId/aspectId), bukan kata kunci judul. Indikator tanpa relasi
// (lapor-cepat) dihitung pada baris `Belum dipetakan`.

export type RekapKategori = {
  categoryId: K3CategoryId | null;
  name: string;
  jumlahIndikator: number;
  jumlahTemuan: number;
  jumlahSesuai: number;
  jumlahTidakSesuai: number;
  risiko: Record<RiskLevel, number>;
};

export type RekapKategoriInput = {
  reports: Report[];
  findings: RiskFinding[];
  snapshots: SelfAssessmentSnapshot[];
  versions: InstrumentVersion[];
  instrument?: Instrument; // D-24: bank live (katalog + definisi baru)
};

function kategoriOfIndicator(
  versions: InstrumentVersion[],
  indicatorId: string,
  instrument?: Instrument,
): { categoryId: K3CategoryId | null; aspectId?: string } {
  if (instrument) {
    for (const dim of instrument.dimensions) {
      const ind = dim.indicators.find((i) => i.id === indicatorId);
      if (ind)
        return {
          categoryId: (ind.categoryId ?? dim.categoryId ?? null) as K3CategoryId | null,
          aspectId: ind.aspectId,
        };
    }
  }
  for (const version of versions) {
    for (const dim of version.dimensions) {
      const ind = dim.indicators.find((i) => i.id === indicatorId);
      if (ind)
        return {
          categoryId: (ind.categoryId ?? dim.categoryId ?? null) as K3CategoryId | null,
          aspectId: ind.aspectId,
        };
    }
  }
  return { categoryId: null };
}

/** Kategori sebuah temuan: field langsung dulu, lalu relasi indikator, lalu laporan. */
export function kategoriOfFinding(
  finding: RiskFinding,
  versions: InstrumentVersion[],
  reportsById?: Map<string, Report>,
  instrument?: Instrument,
): K3CategoryId | null {
  if (finding.categoryId) return finding.categoryId;
  if (finding.indicator && finding.indicator !== "Tidak menggunakan instrumen") {
    const rel = kategoriOfIndicator(versions, finding.indicator, instrument);
    if (rel.categoryId) return rel.categoryId;
  }
  const report = reportsById?.get(finding.reportId);
  return report?.categoryId ?? null;
}

function memicuTemuan(
  versions: InstrumentVersion[],
  snapshot: SelfAssessmentSnapshot,
  indicatorId: string,
  value: string,
): boolean {
  // D-24: snapshot beku diutamakan (flag per opsi).
  const frozen = snapshot.frozenIndicators?.find((f) => f.id === indicatorId);
  if (frozen) return isJawabanTemuan(frozen, value);
  const version = versions.find((item) => item.id === snapshot.instrumentVersionId);
  const indicator = version?.dimensions
    .flatMap((dimension) => dimension.indicators)
    .find((item) => item.id === indicatorId);
  if (indicator && "options" in indicator && Array.isArray((indicator as { options?: unknown }).options))
    return isJawabanTemuan(
      indicator as unknown as Pick<FrozenIndicator, "options" | "answerType">,
      value,
    );
  const answerType = indicator?.answerType;
  if (answerType === "likert-1-5" || answerType === "kualitas-1-5") return ["1", "2"].includes(value);
  if (answerType === "likert-1-2-tidak") return ["1", "Tidak"].includes(value);
  if (answerType === "boolean-ya-tidak" || answerType === "ya-tidak") return value === "Tidak";
  if (answerType === "frekuensi") return ["Sering", "Selalu"].includes(value);
  if (answerType === "keparahan") return ["Berat", "Kritis"].includes(value);
  return false;
}

export function hitungRekapKategori(input: RekapKategoriInput): RekapKategori[] {
  const acceptedIds = new Set(
    input.reports
      .filter(
        (report) =>
          (report.validationStatus === "Diterima" || report.validationStatus === "Terbit") &&
          !report.archivedAt &&
          report.handlingStatus !== "Completed",
      )
      .map((report) => report.id),
  );
  const reportsById = new Map(input.reports.map((r) => [r.id, r]));

  const rows = new Map<string, RekapKategori>();
  for (const cat of K3_CATEGORIES) {
    rows.set(cat.id, {
      categoryId: cat.id,
      name: cat.name,
      jumlahIndikator: 0,
      jumlahTemuan: 0,
      jumlahSesuai: 0,
      jumlahTidakSesuai: 0,
      risiko: { Ekstrem: 0, Tinggi: 0, Sedang: 0, Rendah: 0 },
    });
  }
  rows.set(KATEGORI_BELUM_DIPETAKAN, {
    categoryId: null,
    name: KATEGORI_BELUM_DIPETAKAN,
    jumlahIndikator: 0,
    jumlahTemuan: 0,
    jumlahSesuai: 0,
    jumlahTidakSesuai: 0,
    risiko: { Ekstrem: 0, Tinggi: 0, Sedang: 0, Rendah: 0 },
  });

  // D-24: katalog = bank live; fallback Published warisan bila bank kosong.
  const seenIndicator = new Set<string>();
  const katalogDims =
    input.instrument && input.instrument.dimensions.length
      ? input.instrument.dimensions
      : input.versions
          .filter((item) => item.status === "Published")
          .flatMap((item) => item.dimensions);
  for (const dim of katalogDims) {
    for (const ind of dim.indicators) {
      if (seenIndicator.has(ind.id)) continue;
      seenIndicator.add(ind.id);
      const catId = (ind.categoryId ?? dim.categoryId ?? null) as K3CategoryId | null;
      const row =
        rows.get(catId ?? KATEGORI_BELUM_DIPETAKAN) ?? rows.get(KATEGORI_BELUM_DIPETAKAN)!;
      row.jumlahIndikator += 1;
    }
  }

  // Sesuai / tidak sesuai dari snapshot laporan Diterima.
  for (const snapshot of input.snapshots) {
    if (!acceptedIds.has(snapshot.reportId)) continue;
    const frozenById = new Map((snapshot.frozenIndicators ?? []).map((f) => [f.id, f]));
    const version = input.versions.find((item) => item.id === snapshot.instrumentVersionId);
    for (const [indicatorId, answer] of Object.entries(snapshot.answers)) {
      const value = answer.value?.trim() ?? "";
      if (!value || value === "N/A") continue;
      const frozen = frozenById.get(indicatorId);
      const legacy = version?.dimensions
        .flatMap((dimension) => dimension.indicators)
        .find((item) => item.id === indicatorId);
      const live = input.instrument?.dimensions
        .flatMap((d) => d.indicators)
        .find((item) => item.id === indicatorId);
      const indicator = frozen ?? legacy ?? live;
      if (!indicator) continue;
      const validOptions =
        frozen?.options.map((o) => o.value) ??
        ("options" in indicator && Array.isArray((indicator as { options?: unknown }).options)
          ? ((indicator as unknown as FrozenIndicator).options.map((o) => o.value) as string[])
          : null);
      const valid =
        validOptions !== null && validOptions !== undefined
          ? validOptions.includes(value)
          : indicator.answerType === "boolean-ya-tidak" || indicator.answerType === "ya-tidak"
            ? ["Ya", "Tidak"].includes(value)
            : indicator.answerType === "likert-1-2-tidak"
              ? ["1", "2", "Tidak"].includes(value)
              : indicator.answerType === "frekuensi"
                ? ["Tidak pernah", "Jarang", "Kadang", "Sering", "Selalu"].includes(value)
                : indicator.answerType === "keparahan"
                  ? ["Ringan", "Sedang", "Berat", "Kritis"].includes(value)
                  : ["1", "2", "3", "4", "5"].includes(value);
      if (!valid) continue;
      // Definisi jawaban historis milik versi asal snapshot (draft tidak menimpa).
      const asal = version ? [version] : input.versions;
      const { categoryId } =
        frozen?.categoryId
          ? { categoryId: frozen.categoryId }
          : kategoriOfIndicator(asal, indicatorId, input.instrument);
      const row =
        rows.get(categoryId ?? KATEGORI_BELUM_DIPETAKAN) ?? rows.get(KATEGORI_BELUM_DIPETAKAN)!;
      if (memicuTemuan(input.versions, snapshot, indicatorId, value)) row.jumlahTidakSesuai += 1;
      else row.jumlahSesuai += 1;
    }
  }

  // Temuan + sebaran risiko (satu hitung per ID temuan).
  for (const finding of input.findings) {
    if (!acceptedIds.has(finding.reportId)) continue;
    const catId = kategoriOfFinding(finding, input.versions, reportsById, input.instrument);
    const row = rows.get(catId ?? KATEGORI_BELUM_DIPETAKAN) ?? rows.get(KATEGORI_BELUM_DIPETAKAN)!;
    row.jumlahTemuan += 1;
    row.risiko[finding.level] += 1;
  }

  return [...rows.values()];
}

export { K3_CATEGORIES, K3_CATEGORY_MAP, KATEGORI_BELUM_DIPETAKAN };
