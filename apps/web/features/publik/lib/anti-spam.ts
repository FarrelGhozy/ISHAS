// Penahan spam sisi klien D-50: cooldown 60 detik per perangkat.
// Backend tetap sumber kebenaran (rate limit per IP); helper ini hanya UX
// agar tombol kirim terkunci + hitung mundur sebelum request sia-sia.

export const COOLDOWN_LAPOR_MS = 60_000;
export const COOLDOWN_MANDIRI_MS = 60_000;

export const KEY_COOLDOWN_LAPOR = "ishas-lapor-cooldown";
export const KEY_COOLDOWN_MANDIRI = "ishas-mandiri-cooldown";

function storageAman(): boolean {
  return typeof localStorage !== "undefined";
}

// Detik tersisa sebelum boleh kirim lagi (0 = boleh kirim).
export function sisaCooldown(key: string, jendelaMs: number, kini = Date.now()): number {
  if (!storageAman()) return 0;
  try {
    const mentah = localStorage.getItem(key);
    if (!mentah) return 0;
    const terakhir = Number.parseInt(mentah, 10);
    if (!Number.isFinite(terakhir)) return 0;
    const sisa = jendelaMs - (kini - terakhir);
    return sisa > 0 ? Math.ceil(sisa / 1000) : 0;
  } catch {
    return 0;
  }
}

export function simpanCooldown(key: string, kini = Date.now()): void {
  if (!storageAman()) return;
  try {
    localStorage.setItem(key, String(kini));
  } catch {
    // penyimpanan penuh/ditolak — abaikan, server tetap menegakkan batas
  }
}

// "0:42" untuk label tombol/hint.
export function formatSisa(detik: number): string {
  const aman = Math.max(0, Math.floor(detik));
  const menit = Math.floor(aman / 60);
  const sisa = aman % 60;
  return `${menit}:${String(sisa).padStart(2, "0")}`;
}
