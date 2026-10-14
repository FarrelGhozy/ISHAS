// Rate limit kirim publik anti-spam D-50 (per IP, in-memory).
// Reuse `RateLimiter` milik auth login; cukup untuk prototipe satu proses.
// Produksi multi-replika perlu store bersama (catatan D-50).

import { RateLimiter } from "../auth/rate-limit";
import {
  draftRateLimit,
  laporRateLimit,
  mandiriRateLimit,
  uploadRateLimit,
} from "../config";

export const laporLimiter = new RateLimiter(
  laporRateLimit.max,
  laporRateLimit.windowMs,
);

export const mandiriLimiter = new RateLimiter(
  mandiriRateLimit.max,
  mandiriRateLimit.windowMs,
);

export const draftLimiter = new RateLimiter(
  draftRateLimit.max,
  draftRateLimit.windowMs,
);

export const uploadLimiter = new RateLimiter(
  uploadRateLimit.max,
  uploadRateLimit.windowMs,
);

export type SpamCheck = { ok: true } | { ok: false; error: string };

// Pesan di bawah dipetakan ke 429 (`http.ts`) dan diuji persis di test.
export function cekLapor(ip: string, now = Date.now()): SpamCheck {
  if (laporLimiter.check(`lapor:${ip}`, now)) return { ok: true };
  return {
    ok: false,
    error: "Terlalu sering mengirim laporan. Coba lagi dalam beberapa menit.",
  };
}

export function cekMandiri(ip: string, now = Date.now()): SpamCheck {
  if (mandiriLimiter.check(`mandiri:${ip}`, now)) return { ok: true };
  return {
    ok: false,
    error:
      "Terlalu sering mengirim penilaian. Penilaian mandiri langsung terbit, coba lagi dalam 1 jam.",
  };
}

export function cekDraft(ip: string, draftId: string, now = Date.now()): SpamCheck {
  if (draftLimiter.check(`draft:${ip}:${draftId}`, now)) return { ok: true };
  return {
    ok: false,
    error: "Terlalu sering menyimpan draft. Tunggu sebentar.",
  };
}

export function cekUpload(ip: string, now = Date.now()): SpamCheck {
  if (uploadLimiter.check(`upload:${ip}`, now)) return { ok: true };
  return {
    ok: false,
    error: "Terlalu sering mengunggah gambar. Coba lagi nanti.",
  };
}

// Isolasi antar-test: suite integrasi memakai DB uji bersama.
export function resetAntiSpamLimiters(): void {
  laporLimiter.reset();
  mandiriLimiter.reset();
  draftLimiter.reset();
  uploadLimiter.reset();
}
