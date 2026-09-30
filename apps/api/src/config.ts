// Konfigurasi backend ISHAS dari environment. Sumber tunggal nilai adalah
// `.env` root repo (lihat `.env.example`); fallback di sini hanya pengaman
// agar dev tanpa `.env` tetap jalan dengan default yang sama.

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (["true", "1", "ya", "yes", "on"].includes(raw)) return true;
  if (["false", "0", "tidak", "no", "off"].includes(raw)) return false;
  return fallback;
}

export const dbConfig: DbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: intEnv("DB_PORT", 3306),
  user: process.env.DB_USER ?? "ishas",
  password: process.env.DB_PASSWORD ?? "ishas",
  database: process.env.DB_NAME ?? "ishas",
};

export const apiPort = intEnv("API_PORT", 3004);

// --- Auth Fase 6 (D-30, BACKEND_API_CONTRACT §16) ---

export const SESSION_COOKIE = "ishas_session";
export const CSRF_COOKIE = "ishas_csrf";
export const CSRF_HEADER = "x-csrf-token";

// Masa berlaku sesi; default 7 hari.
export const sessionTtlMs = intEnv("SESSION_TTL_MS", 7 * 24 * 60 * 60 * 1000);

// Cookie `Secure` (butuh HTTPS). Dapat diatur lewat `COOKIE_SECURE`; default
// nonaktif agar prototipe lokal via http://localhost tetap bisa login, dan
// diaktifkan saat sudah di balik HTTPS.
export const cookieSecure = boolEnv("COOKIE_SECURE", false);

// Kartu login dev + endpoint demo. Default mengikuti NODE_ENV (mati di
// production); `DEMO_AUTH_ENABLED` menimpanya secara eksplisit.
export function demoAuthEnabled(): boolean {
  return boolEnv("DEMO_AUTH_ENABLED", process.env.NODE_ENV !== "production");
}

// Sandi awal akun seed / akun baru; hanya prototipe, wajib diganti lewat /auth/password.
export const seedDefaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "ishas-demo";

// Batas percobaan login per IP+email dalam `windowMs`.
export const loginRateLimit = {
  max: intEnv("LOGIN_RATE_LIMIT", 5),
  windowMs: intEnv("LOGIN_RATE_WINDOW_MS", 60_000),
};

// --- Hosting (Cloudflare Tunnel / reverse proxy) ---

// Origin yang diizinkan untuk CORS (dipisah koma), mis.
// `CORS_ALLOWED_ORIGINS=https://ishas.utc.web.id`. Kosong (bawaan) = tanpa
// header CORS, sesuai arsitektur satu domain lewat proxy nginx. Isi hanya bila
// backend dipisah ke subdomain lain. Dibaca saat request agar dapat diuji.
export function corsAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Domain cookie opsional, mis. `COOKIE_DOMAIN=.utc.web.id`. Kosong (bawaan) =
// cookie host-only. Perlu diisi agar cookie CSRF dapat dibaca JavaScript
// frontend saat backend berada di subdomain berbeda (domain API terpisah).
export function cookieDomain(): string {
  return process.env.COOKIE_DOMAIN?.trim() ?? "";
}
