// Konfigurasi backend ISHAS dari environment. Default untuk pengembangan lokal
// (lihat docker-compose.yml service `db` dan .env.example).

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
