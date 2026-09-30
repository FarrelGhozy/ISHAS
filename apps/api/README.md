# ISHAS API (backend)

Backend prototipe ISHAS — Bun + TypeScript + MySQL 8.0.13+ (D-30).
Scope: **Fase 0** (koneksi DB, migrasi schema v15, seed demo/kosong, health) +
**Fase 1** (baca publik, lapor-cepat, penilaian-mandiri, unggah bukti, berkas) +
**Fase 2** (validasi/lifecycle Pesantren, lokasi/denah, tindak lanjut) +
**Fase 3** (bank instrumen live, dokumen indikator PDF, dataset/impor, audit
publikasi) +
**Fase 4** (SAM-iSAFE: bank kategori/soal, pengamatan, tindak lanjut, bukti foto) +
**Fase 5** (Super Admin: pesantren/pengguna/audit/reset, notifikasi, storage lokal
dengan staging + sweep, migrasi aset IndexedDB) +
**Fase 6** (auth server: bcrypt + cookie sesi HttpOnly + RBAC prefix + CSRF
double-submit + rate limit + `/auth/demo-login` dev).
Kontrak dan model data: `docs/BACKEND_DATA_MODEL.md`, `docs/BACKEND_API_CONTRACT.md`.
Keputusan: D-30.b…D-30.h di `docs/DECISIONS.md`.

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
bun run seed --mode=empty  # akun inti + 1 pesantren aktif + bank minimal; data lain kosong
bun run dev                # server dev (watch) di http://localhost:3004
bun run sweep              # job storage + sesi kedaluwarsa
```

Health check:

```bash
curl -s http://localhost:3004/health
# {"ok":true,"data":{"status":"ok","db":"ok","version":"0.3.0","uptime":1}}
```

## Auth (Fase 6)

Cookie sesi `ishas_session` (HttpOnly) adalah sumber utama; header
`X-Demo-Account: USR-xxx` hanya fallback pengembangan (mati di production).

| Metode | Path | Akses |
|---|---|---|
| GET | `/auth/methods` | publik; `{ password, demo }` untuk `/login` |
| POST | `/auth/login` | email + sandi (rate limit 5/menit) |
| POST | `/auth/demo-login` | kartu dev (hanya non-production / `DEMO_AUTH_ENABLED`) |
| POST | `/auth/logout` | cookie sesi |
| GET | `/auth/me` | cookie sesi |
| POST | `/auth/password` | cookie sesi (sandi lama + baru ≥8) |

Mutasi dengan cookie wajib header `X-CSRF-Token` = cookie `ishas_csrf`.

## Endpoint Fase 1–5

Semua di bawah prefix `/api/v1` (kecuali `/health`).

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
| GET | `/validator/sam/bank` | Validator aktif |
| POST/PATCH/DELETE | `/validator/sam/categories[/:id]`, `/validator/sam/questions[/:id]` | Validator aktif |
| POST | `/validator/sam/questions/:id/move`, `/validator/sam/questions/:id/active` | Validator aktif |
| POST/PUT/DELETE | `/validator/sam/assessments[/:id]`, `/validator/sam/assessments/:id/answers|complete|review` | Validator aktif |
| POST/PATCH | `/validator/sam/follow-ups[/:fid]`, `/validator/sam/follow-ups/:fid/cancel` | Validator aktif |
| POST | `/uploads/sam-evidence` | Validator aktif |
| GET | `/admin/state`, `/admin/audit`, `/admin/migrate/status` | Super Admin |
| POST | `/admin/institutions`, `/admin/institutions/:code/status` | Super Admin |
| POST/PATCH | `/admin/users`, `/admin/users/:id` | Super Admin |
| POST | `/admin/users/:id/status|reset-password|delete` | Super Admin |
| POST | `/admin/reset-demo`, `/admin/storage/sweep`, `/admin/migrate/assets` | Super Admin |
| GET/POST | `/notifications`, `/notifications/read` | akun sesi |

## Pemeriksaan teknis

```bash
bun run lint
bun run typecheck
DB_NAME=ishas_test bun run migrate   # sekali: siapkan database uji terpisah
DB_NAME=ishas_test bun test          # unit + integrasi DB; auto-skip tanpa MySQL/DB uji
```

Test integrasi memakai **database uji** (bukan `ishas`) karena seed melakukan
`TRUNCATE`; tanpa `DB_NAME` berisi `test` atau tanpa MySQL, test integrasi
di-skip dan itu dilaporkan.

Cakupan test: `tests/checksum.test.ts` (vektor checksum mock↔backend),
`tests/helpers.test.ts` (normalisasi nilai), `tests/domain.test.ts` (validasi
lapor + proyeksi publik + deteksi gambar), `tests/app.test.ts` (handler `/health`
dengan dependensi disuntik), `tests/db.integration.test.ts` (skema, komposisi seed
demo/empty, invarian relasi, dan alur HTTP Fase 1–4 termasuk checksum bank,
dokumen indikator, dataset, audit publikasi, serta bank/pengamatan/tindak
lanjut SAM-iSAFE; butuh MySQL hidup).

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
| `SEED_DEFAULT_PASSWORD` | `ishas-demo` | Sandi awal seed/akun baru (prototipe) |
| `SESSION_TTL_MS` | `604800000` | Masa berlaku sesi (ms) |
| `LOGIN_RATE_LIMIT` | `5` | Batas login per IP+email per jendela |
| `LOGIN_RATE_WINDOW_MS` | `60000` | Jendela rate limit (ms) |

## Struktur

- `migrations/` — DDL bernomor (`0001_schema_v15.sql`, `0002_sam_followup_active.sql`, `0003_app_settings.sql`).
- `src/config.ts` — konfigurasi environment.
- `src/db.ts` — pool MySQL + health ping.
- `src/migrate.ts` — runner migrasi.
- `src/checksum.ts` — port `hitungChecksumInstrument` (vektor uji dengan frontend).
- `src/auth/` — password (bcrypt), token sesi, cookie/CSRF, rate limit.
- `src/repo/sessions.ts` — akses tabel `sessions`.
- `src/seed/` — seed demo (impor `SEED` mock 1:1) dan empty (akun inti).
- `src/app.ts` — handler HTTP + RBAC prefix + CSRF (dependensi disuntik).
- `src/server.ts` — server HTTP (health + auth).
- `tests/` — unit (checksum, helper, handler, auth) + integrasi (skema, seed, invarian, auth).

## Catatan prototipe

- Seed demo mengimpor `apps/web/mocks/seed/seed.ts` agar komposisi identik
  dengan frontend; saat backend mandiri (fase lanjut), seed dapat dipindah ke
  modul `apps/api` tanpa mengubah data.
- Aset denah/dokumen demo baris `file_assets` dibuat sebagai metadata seed;
  blob fisik disiapkan pada fase storage (5).
- Auth Fase 6 aktif: login kartu dev lewat `/auth/demo-login` (non-production),
  produksi memakai `/auth/login`. Frontend tetap menampilkan kartu peran saat
  pengembangan (D-30.h).
