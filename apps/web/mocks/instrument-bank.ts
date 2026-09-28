// Bank instrumen live — D-24 (28 September 2026).
// Satu-satunya sumber soal penilaian mandiri. Tanpa Draft/Published/Archived.
// Tiap opsi jawaban membawa bobot 0–100 + flag temuan yang diatur Validator.

import type {
  FrozenIndicator,
  IndicatorAnswer,
  Instrument,
  InstrumentAnswerType,
  InstrumentDimension,
  InstrumentIndicator,
  InstrumentOption,
  InstrumentVersion,
} from "./types";

export const BANK_ID = "INS-LIVE";
export const BANK_LABEL = "Bank Instrumen Live";

// Opsi bawaan tiap tipe jawaban baru (Validator boleh mengubah label/bobot/flag).
export function defaultOptionsForType(type: InstrumentAnswerType): InstrumentOption[] {
  if (type === "ya-tidak")
    return [
      { value: "Ya", label: "Ya", weight: 100, isFinding: false },
      { value: "Tidak", label: "Tidak", weight: 20, isFinding: true },
    ];
  if (type === "frekuensi")
    return [
      { value: "Tidak pernah", label: "Tidak pernah", weight: 100, isFinding: false },
      { value: "Jarang", label: "Jarang", weight: 80, isFinding: false },
      { value: "Kadang", label: "Kadang-kadang", weight: 60, isFinding: false },
      { value: "Sering", label: "Sering", weight: 40, isFinding: true },
      { value: "Selalu", label: "Selalu", weight: 20, isFinding: true },
    ];
  if (type === "keparahan")
    return [
      { value: "Ringan", label: "Ringan", weight: 80, isFinding: false },
      { value: "Sedang", label: "Sedang", weight: 60, isFinding: false },
      { value: "Berat", label: "Berat", weight: 40, isFinding: true },
      { value: "Kritis", label: "Kritis", weight: 20, isFinding: true },
    ];
  // Warisan likert-1-2-tidak (kabel + beban kerja): nilai lama tetap sah.
  if (type === "likert-1-2-tidak") return optionsDariWarisan(type, "1");
  // kualitas-1-5 + warisan likert-1-5
  return [
    { value: "1", label: "1 — Sangat kurang", weight: 20, isFinding: true },
    { value: "2", label: "2 — Kurang", weight: 40, isFinding: true },
    { value: "3", label: "3 — Cukup", weight: 60, isFinding: false },
    { value: "4", label: "4 — Baik", weight: 80, isFinding: false },
    { value: "5", label: "5 — Sangat baik", weight: 100, isFinding: false },
    { value: "N/A", label: "Tidak dapat dinilai", weight: 0, isFinding: false },
  ];
}

// Checksum ringan untuk mendeteksi perubahan bank (draft basi = ulang dari awal).
export function hitungChecksumInstrument(dimensions: InstrumentDimension[]): string {
  const canonical = JSON.stringify(
    dimensions.map((d) => ({
      id: d.id,
      indicators: d.indicators.map((i) => ({
        id: i.id,
        t: i.answerType,
        o: i.options.map((o) => [o.value, o.weight, o.isFinding ? 1 : 0]),
        w: i.weight,
        r: i.required ? 1 : 0,
        e: i.evidenceRequired ? 1 : 0,
        l: i.locationRequired ? 1 : 0,
      })),
    })),
  );
  let hash = 5381;
  for (let n = 0; n < canonical.length; n += 1) {
    hash = ((hash << 5) + hash + canonical.charCodeAt(n)) | 0;
  }
  return `ck-${(hash >>> 0).toString(16)}`;
}

// Bobot jawaban: cari di opsi beku; fallback aturan ilustrasi lama (Ya=100,
// Tidak=20, angka 1–5 → 20–100). N/A/kosong/tak dikenal = null (dilewati).
export function bobotJawaban(
  indicator: Pick<InstrumentIndicator | FrozenIndicator, "options" | "answerType">,
  value: string,
): number | null {
  const v = value.trim();
  if (!v || v === "N/A") return null;
  const option = indicator.options.find((o) => o.value === v);
  if (option) return option.weight;
  if (v === "Ya") return 100;
  if (v === "Tidak") return 20;
  const numeric = Number(v);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) return (numeric / 5) * 100;
  return null;
}

// Apakah jawaban memicu kandidat temuan ilustratif.
export function isJawabanTemuan(
  indicator: Pick<InstrumentIndicator | FrozenIndicator, "options" | "answerType">,
  value: string,
): boolean {
  const v = value.trim();
  if (!v || v === "N/A") return false;
  const option = indicator.options.find((o) => o.value === v);
  if (option) return option.isFinding;
  if (indicator.answerType === "likert-1-5" || indicator.answerType === "kualitas-1-5")
    return ["1", "2"].includes(v);
  if (indicator.answerType === "likert-1-2-tidak") return ["1", "Tidak"].includes(v);
  return v === "Tidak";
}

// Skor % laporan dari indikator beku + jawaban (rata-rata terbobot).
export function skorLaporanBeku(
  frozen: FrozenIndicator[],
  answers: Record<string, Partial<IndicatorAnswer>>,
): { scorePercent: number | null; byDimension: Record<string, number | null> } {
  const byDimension: Record<string, number | null> = {};
  const grouped = new Map<string, { name: string; scores: number[] }>();
  const all: number[] = [];
  for (const ind of frozen) {
    const answer = answers[ind.id];
    if (!answer?.value) continue;
    const base = bobotJawaban(ind, answer.value);
    if (base === null) continue;
    const score = base * (ind.weight || 1);
    all.push(score);
    const entry = grouped.get(ind.dimensionId) ?? { name: ind.dimensionName, scores: [] };
    entry.scores.push(score);
    grouped.set(ind.dimensionId, entry);
  }
  for (const [id, entry] of grouped)
    byDimension[id] = entry.scores.length ? mean(entry.scores) : null;
  return { scorePercent: all.length ? mean(all) : null, byDimension };
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Nilai opsi yang sah untuk validasi + render form (termasuk N/A bila ada).
export function nilaiSahIndikator(indicator: InstrumentIndicator | FrozenIndicator): string[] {
  return indicator.options.map((o) => o.value);
}

// Bangun bank live dari satu versi lama (migrasi v10→v11 + seed).
// Tipe warisan dipetakan: likert-1-5 → kualitas-1-5, boolean-ya-tidak → ya-tidak,
// likert-1-2-tidak → ya-tidak dengan opsi tambahan sesuai seed.
export function buildBankLiveDariVersi(source: InstrumentVersion | undefined): Instrument {
  if (!source)
    return { id: BANK_ID, label: BANK_LABEL, updatedAt: "", checksum: "ck-0", dimensions: [] };
  const dimensions: InstrumentDimension[] = source.dimensions.map((dim) => ({
    id: dim.id,
    name: dim.name,
    categoryId: dim.categoryId,
    description: dim.description,
    aspects: dim.aspects ? [...dim.aspects] : undefined,
    indicators: dim.indicators.map((ind) => {
      const answerType = mapTipeWarisan(ind.answerType);
      return {
        id: ind.id,
        code: ind.code,
        title: ind.title,
        prompt: ind.prompt,
        categoryId: ind.categoryId,
        aspectId: ind.aspectId,
        answerType,
        required: ind.required,
        evidenceRequired: ind.evidenceRequired,
        locationRequired: ind.locationRequired,
        weight: 1,
        options: optionsDariWarisan(ind.answerType, ind.findingTrigger),
      };
    }),
  }));
  return {
    id: BANK_ID,
    label: BANK_LABEL,
    updatedAt: "2026-09-28T00:00:00.000Z",
    checksum: hitungChecksumInstrument(dimensions),
    dimensions,
  };
}

function mapTipeWarisan(legacy: InstrumentAnswerType): InstrumentAnswerType {
  // Nilai jawaban lama dipertahankan apa adanya (kabel + beban kerja tetap
  // memakai 1/2/Tidak); Validator dapat mengganti ke frekuensi/keparahan
  // lewat editor (opsi kembali ke bawaan tipe baru).
  if (legacy === "likert-1-5") return "kualitas-1-5";
  if (legacy === "boolean-ya-tidak") return "ya-tidak";
  return legacy;
}

function optionsDariWarisan(
  legacy: InstrumentAnswerType,
  findingTrigger: string,
): InstrumentOption[] {
  if (legacy === "boolean-ya-tidak" || legacy === "ya-tidak") return defaultOptionsForType("ya-tidak");
  if (legacy === "likert-1-2-tidak")
    return [
      { value: "1", label: "1 — Belum sesuai", weight: 20, isFinding: true },
      { value: "2", label: "2 — Sesuai", weight: 100, isFinding: false },
      { value: "Tidak", label: "Tidak tersedia", weight: 20, isFinding: findingTrigger === "Tidak" },
      { value: "N/A", label: "Tidak dapat dinilai", weight: 0, isFinding: false },
    ];
  return defaultOptionsForType("kualitas-1-5");
}
