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
docker compose --profile prod up --build   # hasil build statis (nginx) di localhost:3003
```

Service Docker: `db` (MySQL), `api` (backend Bun), `web-dev` (frontend hot reload),
`web-prod` (frontend nginx statis). Profile `dev` menyalakan db + backend + frontend
sekaligus, jadi cukup satu perintah untuk menjalankan semuanya.

### Memilih container yang dinyalakan

| Mau menyalakan | Perintah |
| --- | --- |
| Semua (db + backend + frontend) | `docker compose --profile dev up -d` |
| Database saja (backend) | `docker compose --profile api up -d db` |
| Database + backend (tanpa web) | `docker compose --profile api up -d` |
| Hanya web dev | `docker compose --profile dev up -d web-dev` |
| Hanya backend | `docker compose --profile api up -d api` |
| Versi rilis (nginx statis) | `docker compose --profile prod up -d web-prod` |

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

Login demo memakai kartu akun, tanpa kata sandi. Tidak ada peran Asesor.

| Peran | Email | Fokus |
| --- | --- | --- |
| Super Admin | `admin@ishas.demo` | Pesantren, akun pengelola, audit |
| Peneliti | `peneliti@ishas.demo` | Instrumen, versi, dan konfigurasi penilaian |
| Pengelola Pesantren | `pengelola@ishas.demo` | Validasi laporan, lokasi, dan tindak lanjut |

## Status data

Semua angka, skor, kategori, indikator, dan isi assessment di frontend saat ini adalah data dummy. Data tersebut tidak boleh dianggap sebagai hasil penelitian atau formula ISHAS final.

## Aturan utama

1. Instrumen ilmiah tidak di-hard-code sebagai kebenaran final.
2. Versi instrumen Published tidak diubah langsung.
3. Assessment final selalu terkait dengan versi instrumen dan konfigurasi scoring.
4. Perubahan yang memengaruhi hasil historis harus memiliki versioning dan audit trail.
5. Identitas commit mengikuti konfigurasi Git milik pemilik repository. Jangan menambahkan atribusi AI atau `Co-authored-by`.

Lihat `CONTRIBUTING.md` untuk ketentuan kontribusi, `AGENTS.md` untuk aturan kerja, serta `docs/` untuk spesifikasi produk yang berlaku.
