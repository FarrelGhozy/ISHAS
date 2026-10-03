# Panduan Operasional ISHAS

> **Untuk siapa:** yang memasang, menjalankan, mencadangkan, dan merawat aplikasi
> (operator/teknisi server). Bukan untuk pengguna harian — itu di
> `PANDUAN_PENGGUNA.md`.
> **Status:** prototipe. Data dummy; rumus/ambang ilmiah final belum ditetapkan.
> **Dokumen rinci:** `DEPLOYMENT_CLOUDFLARE_TUNNEL.md`, `BACKEND_MIGRATION.md`,
> `BACKEND_STORAGE.md`, `README.md` (root), `apps/api/README.md`.

## 1. Prasyarat

- Mesin dengan **Docker + Docker Compose**.
- Salinan repository ISHAS.
- (Opsional, tanpa Docker) **Bun** dan **MySQL 8** langsung di mesin.
- File `.env` di root (salin dari contoh lalu isi):

```bash
cp .env.example .env
```

Nilai penting di `.env`: `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
`DB_ROOT_PASSWORD`, `WEB_PORT`, `API_PORT`, `SEED_DEFAULT_PASSWORD`,
`VITE_USE_BACKEND`, dan `COOKIE_SECURE` (isi `true` bila sudah di balik HTTPS).
Periksa hasil pembacaan: `docker compose config`.

## 2. Menjalankan aplikasi

### 2.1 Mode ngoding (dev) — satu perintah

```bash
docker compose --profile dev up --build
```

Menyalakan **database + backend + frontend** sekaligus. Buka
`http://localhost:3003` (login memakai kartu akun contoh).

### 2.2 Mode rilis (prod)

```bash
docker compose --profile prod up --build
```

Frontend statis (nginx) + backend rilis; halaman login memakai **email + kata
sandi**, tombol akun demo dimatikan.

### 2.3 Tanpa Docker (khusus backend)

```bash
cd apps/api
bun install
bun run migrate
bun run seed --mode=demo     # atau --mode=empty
bun run dev                  # http://localhost:3004
```

## 3. Menyiapkan / mengulang data

Urutan yang disarankan: migrasi schema, lalu isi data.

```bash
# via Docker (container rilis)
docker compose --profile prod run --rm api-prod bun run migrate --fresh
docker compose --profile prod run --rm api-prod bun run seed --mode=demo   # atau --mode=empty

# via host
cd apps/api
bun run migrate              # tambah/tambahkan migrasi
bun run migrate --fresh      # bangun ulang schema dari nol (menghapus data)
bun run seed --mode=demo     # data contoh lengkap untuk demo
bun run seed --mode=empty    # data inti/kosong untuk mulai bersih
```

- `--mode=demo`: mengisi data contoh (pesantren, laporan, instrumen, dsb).
- `--mode=empty`: hanya data inti (akun dasar + bank instrumen) untuk mulai bersih.
- **Reset data demo** juga tersedia dari UI: `/admin/pengaturan` → *Reset data
  demo* (memuat ulang data contoh).

## 4. Akun & kata sandi

- Kata sandi awal akun seed = `SEED_DEFAULT_PASSWORD` di `.env`.
- Pengguna mengganti sandi sendiri lewat menu akun → *Ganti kata sandi*.
- Super Admin dapat **reset sandi** akun lain di `/admin/pengaturan` pengguna.
- Jangan menaruh sandi/token produksi di dalam kode atau di browser.

## 5. Pemeriksaan kesehatan

- Backend: `GET http://localhost:3004/health` (juga tersedia di `/api/v1/health`).
- Lewat web (di balik nginx): `GET http://localhost:3003/api/v1/health`.
- Uji cepat setelah pasang: halaman `/` terbuka, `/login` tampil, dan login
  akun contoh berhasil.

## 6. Pencadangan (backup) & pemulihan

Cadangkan **dua hal**: basis data dan berkas unggahan.

### 6.1 Basis data

```bash
# dump ke file di host
docker compose exec db sh -c \
  'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  > ishas-db-$(date +%F).sql
```

Pemulihan:

```bash
cat ishas-db-YYYY-MM-DD.sql | docker compose exec -T db sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

### 6.2 Berkas unggahan (volume `api-storage`)

Nama volume mengikuti nama proyek Compose; temukan dulu:

```bash
docker volume ls | grep api-storage
```

Cadangkan:

```bash
docker run --rm \
  -v <nama_volume_api-storage>:/data \
  -v "$PWD:/backup" \
  alpine tar czf /backup/ishas-storage-$(date +%F).tar.gz -C /data .
```

Pemulihan:

```bash
docker run --rm \
  -v <nama_volume_api-storage>:/data \
  -v "$PWD:/backup" \
  alpine sh -c 'tar xzf /backup/ishas-storage-YYYY-MM-DD.tar.gz -C /data'
```

Jadwalkan backup berkala (cron/`systemd timer`) untuk DB dan volume storage.

## 7. Pembaruan (upgrade) & rollback

Pembaruan:

```bash
git pull
docker compose --profile prod build
docker compose --profile prod run --rm api-prod bun run migrate
docker compose --profile prod up -d
```

Rencana rollback (uji asap pasca-pasang — D4):

1. Hentikan layanan: `docker compose --profile prod down`.
2. Pulihkan basis data + volume dari backup terakhir (§6).
3. Kembalikan kode ke versi/tag sebelumnya (`git checkout <tag>`), lalu
   `docker compose --profile prod up --build`.
4. Uji asap: `/health`, `/login`, dan alur utama (lihat §5 dan
   `PANDUAN_PENGGUNA.md`). Catat hasilnya.

## 8. Pemeliharaan rutin

- Periksa kesehatan API dan ruang disk.
- Bersihkan berkas yatim (staging >24 jam) bila perlu:
  `cd apps/api && bun run sweep`.
- Perbarui image dasar (`docker compose build --pull`) secara berkala.
- Pantau log: `docker compose logs -f api-prod web-prod`.

## 9. Serah terima & pelatihan (checklist)

Dipakai saat menyerahkan aplikasi ke pemilik:

- [ ] Berikan akses: alamat aplikasi, akun contoh, dan `PANDUAN_PENGGUNA.md`.
- [ ] Serahkan dokumen: `README.md` (root), folder `docs/`, `.env.example`.
- [ ] Latih tiap peran: publik/pelapor, Pesantren, Validator, Super Admin
      (lihat `PANDUAN_PENGGUNA.md`).
- [ ] Jelaskan cara reset data demo dan mengganti kata sandi.
- [ ] Buka data pada server, lakukan uji asap, dan catat hasil (D4).
- [ ] Tandatangani berita acara serah terima (nama, peran, tanggal).
