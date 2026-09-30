# ISHAS backend (apps/api) — Bun + TypeScript + MySQL.
# Build context adalah ROOT repo (bukan apps/api) karena seed backend mengimpor
# data dari `apps/web/mocks/` (seed demo 1:1 dengan frontend). Lihat docker-compose.yml.
# Konfigurasi environment (DB_*, API_PORT, dst.) dipasok lewat `env_file`/`environment`
# dari `.env` root; jangan hardcode nilai di sini.

ARG BUN_IMAGE_TAG=1

FROM oven/bun:${BUN_IMAGE_TAG}
WORKDIR /app
# Install dependensi backend dari manifest-nya sendiri.
COPY apps/api/package.json apps/api/bun.lock ./
RUN bun install --frozen-lockfile
# Salin seluruh repo agar `apps/web/mocks/` (dipakai seed) tersedia.
COPY . .
WORKDIR /app/apps/api
EXPOSE 3004
# `dev` memakai watch agar perubahan kode backend ter-reload otomatis.
CMD ["bun", "run", "dev"]
