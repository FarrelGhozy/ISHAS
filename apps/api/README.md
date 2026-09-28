# ISHAS API (backend)

Backend prototipe ISHAS — Bun + TypeScript + MySQL 8.0.13+ (D-30).
Scope Fase 0: koneksi DB, migrasi schema v15, seed demo/kosong, health check.
Kontrak dan model data: `docs/BACKEND_DATA_MODEL.md`, `docs/BACKEND_API_CONTRACT.md`.

## Prasyarat

- [Bun](https://bun.sh) ≥ 1.4
- MySQL 8.0.13+ (atau Docker untuk service `db`)

## Menjalankan MySQL (Docker)

```bash
# dari root repo
docker compose --profile api up -d db
```

Service `db` memakai image `mysql:8.4`, database `ishas`, user `ishas`/`ishas`
(dapat diubah lewat `.env` → `DB_*`).

## Menjalankan backend

```bash
cd apps/api
bun install
bun run migrate            # buat database + terapkan migrasi DDL
bun run migrate --fresh    # DROP + CREATE database lalu migrasi ulang
bun run seed --mode=demo   # isi data demo (port 1:1 seed frontend)
bun run seed --mode=empty  # struktur kosong tapi valid (1 admin + bank minimal)
bun run dev                # server dev (watch) di http://localhost:3004
```

Health check:

```bash
curl -s http://localhost:3004/health
# {"ok":true,"data":{"status":"ok","db":"ok","version":"0.1.0","uptime":1}}
```

## Pemeriksaan teknis

```bash
bun run lint
bun run typecheck
bun test          # uji checksum selalu; uji integrasi seed butuh MySQL hidup
```

## Konfigurasi (environment)

| Variabel | Default | Keterangan |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_NAME` | `ishas` | Nama database |
| `DB_USER` | `ishas` | User database |
| `DB_PASSWORD` | `ishas` | Sandi database |
| `API_PORT` | `3004` | Port server backend |

## Struktur

- `migrations/` — DDL bernomor (`0001_schema_v15.sql`).
- `src/config.ts` — konfigurasi environment.
- `src/db.ts` — pool MySQL + health ping.
- `src/migrate.ts` — runner migrasi.
- `src/checksum.ts` — port `hitungChecksumInstrument` (vektor uji dengan frontend).
- `src/seed/` — seed demo (impor `SEED` mock 1:1) dan empty.
- `src/server.ts` — server HTTP Fase 0 (`GET /health`).
- `tests/` — checksum + komposisi seed.

## Catatan prototipe

- Seed demo mengimpor `apps/web/mocks/seed/seed.ts` agar komposisi identik
  dengan frontend; saat backend mandiri (fase lanjut), seed dapat dipindah ke
  modul `apps/api` tanpa mengubah data.
- Aset denah/dokumen demo baris `file_assets` dibuat sebagai metadata seed;
  blob fisik disiapkan pada fase storage (5).
- Auth belum aktif (fase 6); endpoint lain menyusul per fase di issue GitHub.
