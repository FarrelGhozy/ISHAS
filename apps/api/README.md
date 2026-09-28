# ISHAS API (backend)

Backend prototipe ISHAS — Bun + TypeScript + MySQL 8.0.13+ (D-30).
Scope: **Fase 0** (koneksi DB, migrasi schema v15, seed demo/kosong, health) +
**Fase 1** (baca publik, lapor-cepat, penilaian-mandiri, unggah bukti, berkas) +
**Fase 2** (validasi/lifecycle Pesantren, lokasi/denah, tindak lanjut) +
**Fase 3** (bank instrumen live, dokumen indikator PDF, dataset/impor, audit
publikasi).
Kontrak dan model data: `docs/BACKEND_DATA_MODEL.md`, `docs/BACKEND_API_CONTRACT.md`.
Keputusan: D-30.b/D-30.c/D-30.d di `docs/DECISIONS.md`.

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

## Endpoint Fase 1–3

Semua di bawah prefix `/api/v1` (kecuali `/health`). Identitas pengembangan:
header `X-Demo-Account: USR-xxx` (non-production); publik tanpa header.

| Metode | Path | Akses |
|---|---|---|
| GET | `/public/state` | publik (proyeksi adapter, D-30.b) |
| GET | `/public/institutions`, `/public/institutions/:code` | publik |
| GET | `/public/dashboard`, `/public/results`, `/public/risk-map`, `/public/recommendations`, `/public/follow-ups` | publik |
| GET | `/public/docs`, `/public/reports/:id/pdf-data` | publik |
| GET | `/instrument/bank` | publik (tanpa bobot/flag) |
| POST | `/reports/lapor-cepat` | publik / Pesantren aktif (`X-Request-Id` idempoten) |
| POST/DELETE | `/uploads/report-evidence[/:assetId]` | publik / Pesantren scope |
| POST/DELETE | `/self-assessments/drafts[/:id]` | publik / Pesantren |
| POST | `/self-assessments/submit` | publik / Pesantren |
| POST | `/uploads/self-evidence` | publik / Pesantren |
| GET | `/files/:assetId`, `/docs/:indicatorId/blob` | sesuai visibility/scope |
| GET | `/pesantren/state`, `/pesantren/queue`, `/pesantren/reports/:id` | Pesantren scope (internal, D-30.c) |
| POST | `/pesantren/reports/:id/accept|reject|status|archive` | Pesantren scope |
| PATCH | `/pesantren/findings/:id/level` | Pesantren scope |
| POST | `/pesantren/buildings`, `/buildings/:id/floors`, `/areas` | Pesantren scope |
| POST | `/uploads/campus-plan`, `/pesantren/campus-plans/publish` | Pesantren scope |
| POST | `/uploads/completion-evidence`, `/pesantren/recommendations/:id/progress|verify|cancel` | Pesantren scope |
| GET | `/validator/state`, `/validator/bank/dimensions` | Validator aktif |
| POST/PATCH/DELETE | `/validator/bank/dimensions[/:id]`, `/validator/bank/indicators[/:id]`, `/validator/bank/indicators/:id/options` | Validator aktif |
| POST | `/uploads/instrument-doc`, `/validator/docs` | Validator aktif |
| PUT/PATCH/DELETE | `/validator/docs/:indicatorId[/visibility]` | Validator aktif |
| GET | `/validator/dataset`, `/validator/dataset/export`, `/validator/publication-audit` | Validator aktif |
| POST | `/validator/dataset/import` | Validator aktif |

## Pemeriksaan teknis

```bash
bun run lint
bun run typecheck
bun test          # unit + integrasi DB; integrasi auto-skip tanpa MySQL
```

Cakupan test: `tests/checksum.test.ts` (vektor checksum mock↔backend),
`tests/helpers.test.ts` (normalisasi nilai), `tests/domain.test.ts` (validasi
lapor + proyeksi publik + deteksi gambar), `tests/app.test.ts` (handler `/health`
dengan dependensi disuntik), `tests/db.integration.test.ts` (skema, komposisi seed
demo/empty, invarian relasi, dan alur HTTP Fase 1–3 termasuk checksum bank,
dokumen indikator, dataset, dan audit publikasi; butuh MySQL hidup).

## Konfigurasi (environment)

| Variabel | Default | Keterangan |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_NAME` | `ishas` | Nama database |
| `DB_USER` | `ishas` | User database |
| `DB_PASSWORD` | `ishas` | Sandi database |
| `API_PORT` | `3004` | Port server backend |
| `STORAGE_DIR` | `<cwd>/storage` | Direktori blob lokal (bukti/denah/PDF) |

## Struktur

- `migrations/` — DDL bernomor (`0001_schema_v15.sql`).
- `src/config.ts` — konfigurasi environment.
- `src/db.ts` — pool MySQL + health ping.
- `src/migrate.ts` — runner migrasi.
- `src/checksum.ts` — port `hitungChecksumInstrument` (vektor uji dengan frontend).
- `src/seed/` — seed demo (impor `SEED` mock 1:1) dan empty.
- `src/app.ts` — handler HTTP (dapat diuji dengan dependensi disuntik).
- `src/server.ts` — server HTTP Fase 0 (`GET /health`).
- `tests/` — unit (checksum, helper, handler) + integrasi (skema, seed, invarian).

## Catatan prototipe

- Seed demo mengimpor `apps/web/mocks/seed/seed.ts` agar komposisi identik
  dengan frontend; saat backend mandiri (fase lanjut), seed dapat dipindah ke
  modul `apps/api` tanpa mengubah data.
- Aset denah/dokumen demo baris `file_assets` dibuat sebagai metadata seed;
  blob fisik disiapkan pada fase storage (5).
- Auth belum aktif (fase 6); endpoint lain menyusul per fase di issue GitHub.
