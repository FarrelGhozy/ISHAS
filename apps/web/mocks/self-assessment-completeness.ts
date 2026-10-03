// Aturan kelengkapan satu jawaban penilaian mandiri — sumber tunggal yang
// dipakai form publik (`penilaian-mandiri-page`), hint draft, store mock, dan
// backend (`apps/api/src/domain/self-assessment.ts`). Mencegah aturan ditulis
// terpisah lalu menyimpang antarjalur (D-24).

import type { IndicatorAnswer } from "./types";

// Indikator minimal yang dibutuhkan aturan ini; `InstrumentIndicator` dan
// `FrozenIndicator` sama-sama memenuhi (flag opsional dianggap nonaktif).
export type KelengkapanIndikator = {
  options: { value: string }[];
  required?: boolean;
  evidenceRequired?: boolean;
  locationRequired?: boolean;
};

// Daftar field yang masih kurang agar satu jawaban dinilai lengkap.
export function kurangJawaban(
  indicator: KelengkapanIndikator,
  answer?: Partial<IndicatorAnswer>,
): string[] {
  const kurang: string[] = [];
  const nilaiSah = indicator.options.map((o) => o.value);
  if (!answer?.value || (indicator.required !== false && !nilaiSah.includes(answer.value)))
    kurang.push("jawaban");
  if (indicator.evidenceRequired && !answer?.evidenceName?.trim()) kurang.push("bukti");
  const adaLokasi = Boolean(answer?.areaId) || (answer?.manualLocation?.trim().length ?? 0) >= 3;
  if (indicator.locationRequired && !adaLokasi) kurang.push("area/lokasi");
  if (answer?.value === "N/A" && (answer?.note?.trim().length ?? 0) < 10)
    kurang.push("catatan N/A (min 10 karakter)");
  return kurang;
}

export function jawabanLengkap(
  indicator: KelengkapanIndikator,
  answer?: Partial<IndicatorAnswer>,
): boolean {
  return kurangJawaban(indicator, answer).length === 0;
}
