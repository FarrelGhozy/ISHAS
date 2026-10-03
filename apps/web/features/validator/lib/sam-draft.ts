// Penunjuk draft pengamatan SAM-iSAFE aktif per Validator (localStorage).
// Halaman "Pengamatan baru" melanjutkan pengisian setelah reload; penunjuk
// dihapus hanya saat pengamatan selesai atau draft dihapus (reset manual).

const KEY = "ishas-sam-draft";

type Peta = Record<string, string>;

function baca(): Peta {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === "object" ? (parsed as Peta) : {};
  } catch {
    return {};
  }
}

function tulis(peta: Peta): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(peta));
  } catch {
    // penyimpanan tak tersedia — abaikan
  }
}

export function bacaSamDraftId(userId?: string): string | null {
  if (!userId || typeof localStorage === "undefined") return null;
  return baca()[userId] ?? null;
}

export function ingatSamDraft(userId: string | undefined, assessmentId: string): void {
  if (!userId) return;
  const peta = baca();
  peta[userId] = assessmentId;
  tulis(peta);
}

export function lupakanSamDraft(userId?: string): void {
  if (!userId) return;
  const peta = baca();
  if (!(userId in peta)) return;
  delete peta[userId];
  tulis(peta);
}
