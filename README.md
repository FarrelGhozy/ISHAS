# ISHAS

Integrated Safety and Health Assessment System adalah prototipe sistem penilaian K3L untuk pesantren. Tahap saat ini berfokus pada validasi tampilan dan fitur menggunakan data dummy. Backend mulai dibangun (Fase 0: skema MySQL, seed, health check); formula ilmiah final belum ditetapkan.

## Struktur repository

- `apps/web` — aplikasi ISHAS (React Router + TypeScript + bun).
- `apps/api` — backend ISHAS (Bun + TypeScript + MySQL 8); lihat `apps/api/README.md`.
- `docs/source` — proposal asli sebagai sumber penelitian.
- `docs` — sumber kebenaran: visi, peran, route, alur, model data, dan spesifikasi produk yang berlaku.
- `planning` — local issue management stage (Stage 00...09).
- `docs/TODO.md` — kontrol pekerjaan yang sedang aktif.
- `AGENTS.md` — aturan tetap untuk pekerjaan di repository.

## Menjalankan frontend

```bash
cd apps/web
bun install
bun run dev
```

Dev server berjalan di port `3003` dan dapat diakses dari jaringan (`host 0.0.0.0`). Pemeriksaan teknis dapat dijalankan dengan `bun run lint`, `bun run typecheck`, `bun test`, dan `bun run build`. Data dummy tersimpan di browser selama demo (kunci `ishas-mock-v4`) dan dapat dikembalikan ke seed awal melalui Pengaturan Admin (Reset data demo).

## Menjalankan dengan Docker

Environment Compose diambil dari file `.env` di root (tidak di-commit; contoh di `.env.example`).

```bash
cp .env.example .env
docker compose --profile dev up --build    # dev + hot reload di localhost:3003
docker compose --profile prod up --build   # rilis statis (nginx) di localhost:3003
```

Service Docker: `db` (MySQL), `api` (backend Bun mode ngoding), `api-prod`
(backend rilis, `NODE_ENV=production`), `web-dev` (frontend hot reload), dan
`web-prod` (frontend nginx statis). Profile `dev` menyalakan db + backend + frontend
sekaligus, jadi cukup satu perintah untuk menjalankan semuanya.

Perbedaan penting profile `prod`: backend berjalan sebagai rilis, endpoint dan
kartu demo **dimatikan**, dan `/login` menampilkan **form email + kata sandi**
(bukan pemilih akun demo). Kata sandi awal akun seed = `SEED_DEFAULT_PASSWORD`
di `.env`. Untuk akses via HTTPS, set `COOKIE_SECURE=true`.

Menyiapkan data pada profile `prod` (dari image rilis):

```bash
docker compose --profile prod run --rm api-prod bun run migrate --fresh
docker compose --profile prod run --rm api-prod bun run seed --mode=demo   # atau --mode=empty
```

### Hosting lewat Cloudflare Tunnel

Cara ringkas: jalankan profile `prod`, lalu arahkan **satu** public hostname
Cloudflare Tunnel ke `http://localhost:3003` — `web-prod` (nginx) melayani
frontend sekaligus mem-proxy `/api` ke backend. Set `COOKIE_SECURE=true` di
`.env` karena diakses via HTTPS. Tidak perlu domain API terpisah.

Panduan lengkap (termasuk opsi domain API terpisah, verifikasi, dan
troubleshooting): [docs/DEPLOYMENT_CLOUDFLARE_TUNNEL.md](docs/DEPLOYMENT_CLOUDFLARE_TUNNEL.md).

### Memilih container yang dinyalakan

| Mau menyalakan | Perintah |
| --- | --- |
| Semua (db + backend + frontend) | `docker compose --profile dev up -d` |
| Database saja (backend) | `docker compose --profile api up -d db` |
| Database + backend (tanpa web) | `docker compose --profile api up -d` |
| Hanya web dev | `docker compose --profile dev up -d web-dev` |
| Hanya backend | `docker compose --profile api up -d api` |
| Versi rilis (backend + nginx statis) | `docker compose --profile prod up -d` |

Dev dan prod memakai port host yang sama (`WEB_PORT`), jadi jalankan bergantian.
Ubah port/tag image cukup lewat `.env`; `docker compose config` untuk memeriksa hasil interpolasi.

## Menjalankan backend (Fase 0)

Backend (`api`) sudah terdaftar di Docker Compose. Cara tercepat menjalankannya
bersama database:

```bash
docker compose --profile api up --build   # db + backend, backend di http://localhost:3004
```

Menyiapkan/mengulang data (migrasi + seed) di dalam container `api`:

```bash
docker compose --profile api run --rm api bun run migrate --fresh
docker compose --profile api run --rm api bun run seed --mode=demo   # atau --mode=empty
```

Backend juga bisa dijalankan langsung di host (tanpa Docker) bila MySQL sudah
tersedia di port `3306`:

```bash
cd apps/api
bun install
bun run migrate
bun run seed --mode=demo                # atau --mode=empty
bun run dev                             # http://localhost:3004/health
```

Rincian di `apps/api/README.md`. Auth dan endpoint domain menyusul per fase
(issue `[backend]` di GitHub).

Alamat utama `/` membuka dashboard publik tanpa login: agregat semua pesantren terdaftar plus pemilih pesantren. Tidak ada landing page dan tidak ada redirect. Tombol **Masuk** mengarah ke `/login`. Laporan dapat dikirim publik tanpa login (`/lapor`) atau oleh Pengelola Pesantren; semua laporan wajib validasi pengelola sebelum tampil di dashboard.

## Akun demo frontend

Mode ngoding memakai kartu akun (satu klik, tanpa kata sandi); mode rilis
memakai email + kata sandi (`SEED_DEFAULT_PASSWORD`). Tidak ada peran Asesor.

| Peran | Email | Fokus |
| --- | --- | --- |
| Super Admin | `admin@ishas.demo` | Pesantren, akun, audit |
| Validator | `validator@ishas.demo` | Instrumen, versi, dan konfigurasi penilaian |
| Pesantren | `pesantren@ishas.demo` | Validasi laporan, lokasi, dan tindak lanjut (PSN-0018) |

## Status data

Semua angka, skor, kategori, indikator, dan isi assessment di frontend saat ini adalah data dummy. Data tersebut tidak boleh dianggap sebagai hasil penelitian atau formula ISHAS final.

## Aturan utama

1. Instrumen ilmiah tidak di-hard-code sebagai kebenaran final.
2. Versi instrumen Published tidak diubah langsung.
3. Assessment final selalu terkait dengan versi instrumen dan konfigurasi scoring.
4. Perubahan yang memengaruhi hasil historis harus memiliki versioning dan audit trail.
5. Identitas commit mengikuti konfigurasi Git milik pemilik repository. Jangan menambahkan atribusi AI atau `Co-authored-by`.

Lihat `CONTRIBUTING.md` untuk ketentuan kontribusi, `AGENTS.md` untuk aturan kerja, serta `docs/` untuk spesifikasi produk yang berlaku.
