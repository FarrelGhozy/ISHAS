// Penunjuk draft inspeksi kantor aktif per Validator (localStorage).
// Halaman "Pengamatan baru" melanjutkan pengisian setelah reload; penunjuk
// dihapus hanya saat pengamatan selesai atau draft dihapus (reset manual).

const KEY = "ishas-office-draft";

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

export function bacaOfficeDraftId(userId?: string): string | null {
  if (!userId || typeof localStorage === "undefined") return null;
  return baca()[userId] ?? null;
}

export function ingatOfficeDraft(userId: string | undefined, assessmentId: string): void {
  if (!userId) return;
  const peta = baca();
  peta[userId] = assessmentId;
  tulis(peta);
}

export function lupakanOfficeDraft(userId?: string): void {
  if (!userId) return;
  const peta = baca();
  if (!(userId in peta)) return;
  delete peta[userId];
  tulis(peta);
}
