# ISHAS — Integrated Safety and Health Assessment System for Boarding School

Prototipe platform pelaporan dan pemantauan K3L pesantren. Tahap saat ini fokus pada **validasi tampilan, alur, dan fitur memakai data dummy**. Backend tahap awal sudah berjalan (skema MySQL, seed, health check); formula ilmiah final belum ditetapkan.

> Semua angka, skor, dan rekomendasi di frontend adalah **data dummy** — bukan hasil penelitian final.

---

## Daftar Isi

- [Peran Pengguna](#peran-pengguna)
- [Tech Stack](#tech-stack)
- [Struktur Repository](#struktur-repository)
- [Mulai Cepat](#mulai-cepat)
- [Menjalankan dengan Docker](#menjalankan-dengan-docker)
- [Menjalankan Backend](#menjalankan-backend-fase-0)
- [Akun Demo](#akun-demo)
- [Dokumentasi](#dokumentasi)
- [Aturan Utama Prototipe](#aturan-utama-prototipe)

---

## Peran Pengguna

Halaman utama `/` adalah **dashboard publik tanpa login**. Login hanya untuk tiga peran lewat `/login`:

| Peran | Fokus |
| --- | --- |
| **Super Admin** | Kelola pesantren, akun Pesantren, audit, pengaturan demo |
| **Validator** | Kelola ilmu, instrumen, versi, konfigurasi penilaian |
| **Pesantren (mitra)** | Validasi laporan, kelola lokasi, tindak lanjut, laporan scope-nya |
| **Publik / Pelapor** (tanpa login) | Baca dashboard, kirim laporan (`/lapor`) dan penilaian mandiri |

Aturan moderasi: laporan `Menunggu validasi` / `Ditolak` **tidak pernah tampil** di dashboard, hasil, peta, rekomendasi, maupun laporan pimpinan.

---

## Tech Stack

### Sekilas

[![Tech Stack](https://skillicons.dev/icons?i=react,ts,vite,tailwind,bun,mysql,docker,nginx,nodejs,cloudflare,git&theme=light)](https://skillicons.dev)

### Rincian

| Lapisan | Teknologi | Versi / Keterangan |
| --- | --- | --- |
| <img src="https://skillicons.dev/icons?i=react" width="20" /> **Frontend** | React + React Router | React 19, React Router 7 (SSR + routing file-based di `apps/web`) |
| <img src="https://skillicons.dev/icons?i=vite" width="20" /> **Build** | Vite | Vite 7 via plugin React Router, dev server port `3003` (`host 0.0.0.0`) |
| <img src="https://skillicons.dev/icons?i=ts" width="20" /> **Bahasa** | TypeScript | TypeScript 5 di frontend + backend |
| <img src="https://skillicons.dev/icons?i=tailwind" width="20" /> **Styling** | Tailwind CSS | Tailwind CSS v4 (plugin Vite), identitas utama merah-marun |
| <img src="https://skillicons.dev/icons?i=react" width="20" /> **Ikon UI** | Lucide React | `lucide-react` untuk ikon antarmuka |
| <img src="https://skillicons.dev/icons?i=bun" width="20" /> **Backend** | Bun + TypeScript | `Bun.serve` native, REST di `http://localhost:3004`, tanpa framework tambahan |
| <img src="https://skillicons.dev/icons?i=mysql" width="20" /> **Database** | MySQL 8.4 + mysql2 | Migrasi + seed (`demo` / `empty`), driver `mysql2` |
| <img src="https://skillicons.dev/icons?i=nodejs" width="20" /> **Build Prod Web** | Node 22-slim | Dipakai hanya untuk tahap build image produksi |
| <img src="https://skillicons.dev/icons?i=nginx" width="20" /> **Server Prod** | Nginx (alpine) | Melayani frontend statis + proxy `/api` ke backend |
| <img src="https://skillicons.dev/icons?i=docker" width="20" /> **DevOps** | Docker Compose | Profile `dev` / `api` / `prod`, semua env terpusat di `.env` root |
| <img src="https://skillicons.dev/icons?i=cloudflare" width="20" /> **Hosting** | Cloudflare Tunnel | Satu public hostname ke `http://localhost:3003` (lihat `docs/DEPLOYMENT_CLOUDFLARE_TUNNEL.md`) |

Tooling: `bun` (runtime + package manager + test runner), `oxlint` (lint), `tsc` (typecheck), `bun test` (unit + integrasi).

---

## Struktur Repository

```text
apps/web/       → aplikasi frontend (React Router + TypeScript + Bun)
apps/api/       → backend (Bun + TypeScript + MySQL 8), lihat apps/api/README.md
docs/source/    → proposal asli sebagai acuan keilmuan
docs/           → sumber kebenaran produk (visi, peran, route, alur, model data)
planning/       → stage pembangunan (Stage 00–09)
docs/TODO.md    → kontrol pekerjaan aktif
AGENTS.md       → aturan tetap pengerjaan repo
```

---

## Mulai Cepat

### 1. Prasyarat

- [Bun](https://bun.sh) 1.x
- [Docker](https://www.docker.com) + Compose (untuk MySQL / mode container)
- MySQL 8 bila backend dijalankan langsung tanpa Docker

### 2. Siapkan environment

```bash
cp .env.example .env
```

Semua setting (port, versi image, kredensial DB, flag backend) cukup diubah di `.env` root. Cek hasil interpolasi dengan `docker compose config`.

### 3. Jalankan frontend (mode mock, tanpa backend)

```bash
cd apps/web
bun install
bun run dev
```

Buka `http://localhost:3003`. Pemeriksaan teknis:

```bash
bun run lint
bun run typecheck
bun test
bun run build
```

Data dummy tersimpan di browser (`ishas-mock-v16`) dan bisa dikembalikan ke seed awal lewat Pengaturan Admin → Reset data demo.

---

## Menjalankan dengan Docker

```bash
cp .env.example .env
docker compose --profile dev up --build    # dev + hot reload di localhost:3003
docker compose --profile prod up --build   # rilis statis (nginx) di localhost:3003
```

Service: `db` (MySQL), `api` (backend dev), `api-prod` (backend rilis), `web-dev` (frontend hot reload), `web-prod` (frontend nginx statis). Profile `dev` menyalakan db + backend + frontend sekaligus.

Perbedaan penting profile `prod`:

- Backend rilis (`NODE_ENV=production`), endpoint dan kartu demo **dimatikan**.
- `/login` memakai **form email + kata sandi** (bukan pemilih akun demo).
- Kata sandi awal akun seed = `SEED_DEFAULT_PASSWORD` di `.env`.
- Untuk akses HTTPS, set `COOKIE_SECURE=true`.

Siapkan data pada profile `prod`:

```bash
docker compose --profile prod run --rm api-prod bun run migrate --fresh
docker compose --profile prod run --rm api-prod bun run seed --mode=demo   # atau --mode=empty
```

### Hosting lewat Cloudflare Tunnel

Jalankan profile `prod`, lalu arahkan **satu** public hostname ke `http://localhost:3003` — `web-prod` melayani frontend sekaligus mem-proxy `/api` ke backend. Set `COOKIE_SECURE=true` karena diakses via HTTPS. Panduan lengkap: [docs/DEPLOYMENT_CLOUDFLARE_TUNNEL.md](docs/DEPLOYMENT_CLOUDFLARE_TUNNEL.md).

### Memilih container yang dinyalakan

| Kebutuhan | Perintah |
| --- | --- |
| Semua (db + backend + frontend) | `docker compose --profile dev up -d` |
| Database saja | `docker compose --profile api up -d db` |
| Database + backend (tanpa web) | `docker compose --profile api up -d` |
| Hanya web dev | `docker compose --profile dev up -d web-dev` |
| Hanya backend | `docker compose --profile api up -d api` |
| Versi rilis (backend + nginx statis) | `docker compose --profile prod up -d` |

Dev dan prod memakai port host yang sama (`WEB_PORT`), jadi jalankan bergantian.

---

## Menjalankan Backend (Fase 0)

Cara tercepat (db + backend bersamaan):

```bash
docker compose --profile api up --build   # backend di http://localhost:3004
```

Migrasi + seed di dalam container `api`:

```bash
docker compose --profile api run --rm api bun run migrate --fresh
docker compose --profile api run --rm api bun run seed --mode=demo   # atau --mode=empty
```

Tanpa Docker (MySQL sudah tersedia di port `3306`):

```bash
cd apps/api
bun install
bun run migrate
bun run seed --mode=demo
bun run dev    # http://localhost:3004/health
```

Rincian di `apps/api/README.md`. Auth dan endpoint domain menyusul per fase.

---

## Akun Demo

Mode ngoding memakai kartu akun (satu klik, tanpa kata sandi). Mode rilis memakai email + kata sandi (`SEED_DEFAULT_PASSWORD`).

| Peran | Email | Fokus |
| --- | --- | --- |
| Super Admin | `admin@ishas.demo` | Pesantren, akun, audit |
| Validator | `validator@ishas.demo` | Instrumen, versi, konfigurasi penilaian |
| Pesantren | `pesantren@ishas.demo` | Validasi laporan, lokasi, tindak lanjut (PSN-0018) |

Tidak ada peran Asesor. Pergantian peran dilakukan dengan keluar lalu masuk sebagai akun lain.

---

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [docs/README.md](docs/README.md) | Pintu masuk dokumentasi produk |
| [docs/ROLES.md](docs/ROLES.md) | Definisi peran + akun demo + matriks akses |
| [docs/ROUTES.md](docs/ROUTES.md) | Tabel route + guard per peran |
| [docs/FLOWS.md](docs/FLOWS.md) | Alur operasional + validasi + transisi status |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Skema + enum + ID + seed frontend |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Keputusan produk yang berlaku |
| [docs/TODO.md](docs/TODO.md) | Kontrol pekerjaan aktif |
| [apps/api/README.md](apps/api/README.md) | Rincian backend |

---

## Aturan Utama Prototipe

1. Instrumen ilmiah tidak di-hard-code sebagai kebenaran final.
2. Versi instrumen Published tidak diubah langsung — perubahan lewat versi baru.
3. Assessment final selalu terkait versi instrumen dan konfigurasi scoring.
4. Perubahan yang memengaruhi hasil historis wajib versioning + audit trail.
5. Identitas commit mengikuti konfigurasi Git pemilik repo, tanpa atribusi AI / `Co-authored-by`.

Lihat `CONTRIBUTING.md` untuk kontribusi dan `AGENTS.md` untuk aturan kerja.
