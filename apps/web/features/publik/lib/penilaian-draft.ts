// Bantuan draft penilaian mandiri: ingat pesantren + bandingkan isi draft.
// Mencegah loop autosave (hanya tulis bila isi benar-benar berubah) dan
// draft hilang saat reload tanpa param/tautan.

import type { IndicatorAnswer, SelfAssessmentDraft } from "~/mocks/types";

const KONTEKS_KEY = "ishas-penilaian-pesantren";

// Pesantren terakhir yang dipilih penilai pada perangkat ini.
export function bacaPesantrenTerakhir(terdaftar: string[]): string {
  try {
    const saved = localStorage.getItem(KONTEKS_KEY);
    if (saved && terdaftar.includes(saved)) return saved;
  } catch {
    // penyimpanan tak tersedia — abaikan, minta pilih manual
  }
  return "";
}

export function ingatPesantren(code: string): void {
  try {
    if (code) localStorage.setItem(KONTEKS_KEY, code);
    else localStorage.removeItem(KONTEKS_KEY);
  } catch {
    // abaikan kegagalan ingat-ingat
  }
}

type IsiDraft = Pick<
  SelfAssessmentDraft,
  "reporterName" | "contact" | "instrumentChecksum" | "answers" | "activeIndex"
>;

// true bila payload sama dengan draft tersimpan (tulis akan mubazir).
export function draftPenilaianSama(
  tersimpan:
    | Pick<
      SelfAssessmentDraft,
      "reporterName" | "contact" | "instrumentChecksum" | "answers" | "activeIndex"
    >
    | undefined,
  payload: IsiDraft,
): boolean {
  if (!tersimpan) return false;
  if ((tersimpan.reporterName ?? "") !== (payload.reporterName ?? "")) return false;
  if ((tersimpan.contact ?? "") !== (payload.contact ?? "")) return false;
  if ((tersimpan.instrumentChecksum ?? "") !== (payload.instrumentChecksum ?? "")) return false;
  if ((tersimpan.activeIndex ?? 0) !== (payload.activeIndex ?? 0)) return false;
  return jawabanSama(tersimpan.answers ?? {}, payload.answers ?? {});
}

function jawabanSama(
  a: Record<string, Partial<IndicatorAnswer>>,
  b: Record<string, Partial<IndicatorAnswer>>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    const x = a[key];
    const y = b[key];
    if (!y) return false;
    if (
      (x.value ?? "") !== (y.value ?? "") ||
      (x.note ?? "") !== (y.note ?? "") ||
      (x.evidenceName ?? "") !== (y.evidenceName ?? "") ||
      (x.evidenceAssetId ?? "") !== (y.evidenceAssetId ?? "") ||
      (x.areaId ?? "") !== (y.areaId ?? "") ||
      (x.manualLocation ?? "") !== (y.manualLocation ?? "") ||
      JSON.stringify(x.planPoint ?? null) !== JSON.stringify(y.planPoint ?? null)
    )
      return false;
  }
  return true;
}

// Aturan kelengkapan tinggal satu di `~/mocks/self-assessment-completeness`
// (dipakai form, hint, store mock, dan backend).
export { jawabanLengkap, kurangJawaban as kurangApa } from "~/mocks/self-assessment-completeness";
