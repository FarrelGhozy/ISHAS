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

// Cookie `Secure` hanya pada production (butuh HTTPS).
export const cookieSecure = process.env.NODE_ENV === "production";

// Kartu login dev + endpoint demo hanya di luar production.
export function demoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

// Sandi awal akun seed / akun baru; hanya prototipe, wajib diganti lewat /auth/password.
export const seedDefaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "ishas-demo";

// Batas percobaan login per IP+email dalam `windowMs`.
export const loginRateLimit = {
  max: intEnv("LOGIN_RATE_LIMIT", 5),
  windowMs: intEnv("LOGIN_RATE_WINDOW_MS", 60_000),
};
