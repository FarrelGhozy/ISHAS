# ISHAS

ISHAS adalah aplikasi React untuk pelaporan dan pemantauan K3L pesantren. Halaman `/` adalah dashboard publik; hasil publik hanya bersumber dari laporan yang sudah diterima.

## Akun demo

- Super Admin: `admin@ishas.demo`
- Peneliti: `peneliti@ishas.demo`
- Pengelola Pesantren: `pengelola@ishas.demo`

Tidak ada peran atau jalur asesor. Alur utama: publik/pengelola mengirim laporan atau penilaian mandiri, pengelola memvalidasi, lalu mengelola tindak lanjut sampai selesai.

## Menjalankan

```bash
bun install
bun run dev
```

Dev server di port `3003` (`host 0.0.0.0`; host yang diizinkan: `ishas.utc.web.id`, `localhost`, `127.0.0.1`, plus `VITE_ALLOWED_HOSTS` bila diisi). Port lokal mengikuti `PORT` bila diset; port host Docker diatur via `WEB_PORT` di `.env` root (container tetap `3003`). Direktori generated (`.react-router/`, `build/`, `node_modules/`) di Docker dev diisolasi di volume agar tidak menjadi milik root di host. Pemeriksaan: `bun run lint`, `bun run typecheck`, `bun test`, `bun run build`. Spesifikasi lengkap ada di `../../docs/`.

## Menjalankan dengan Docker

Dari root repository (environment dari `.env` root, contoh di `.env.example`):

```bash
docker compose --profile dev up --build    # dev + hot reload di localhost:3003
docker compose --profile prod up --build   # hasil build statis (nginx) di localhost:3003
```

`Dockerfile` memakai target `development` (bun) dan `production` (nginx menyajikan `build/client` dengan fallback SPA ke `index.html`), dengan stage `builder` berbasis Node karena `react-router build` memerlukan kondisi ekspor Node untuk `react-dom/server`. Jalankan build produksi lewat image (`docker compose --profile prod build`), bukan `bun run build` di container dev, agar berkas hasil tidak menjadi milik root pada bind mount.
