# Backend ISHAS — Storage File Lokal

Keputusan: **disk lokal service, tanpa S3** (belum butuh).
Sumber aturan: `adapters/campus-assets.ts`, `report-evidence.ts`,
`instrument-docs.ts`, `mock-repository.ts`.

## 1. Tabel metadata: `file_assets`

```sql
CREATE TABLE file_assets (
  asset_id VARCHAR(64) PRIMARY KEY,      -- campus-/evidence-/instrument-doc-<uuid>
  kind VARCHAR(32) NOT NULL,             -- campus-plan|report-evidence|self-evidence|
                                         -- sam-evidence|completion-evidence|instrument-doc
  institution_code VARCHAR(16) NULL,
  owner_ref VARCHAR(64) NULL,            -- report_id / indicator_id / recommendation_id / jawaban
  original_name VARCHAR(200) NOT NULL,
  stored_path VARCHAR(512) NOT NULL UNIQUE,
  mime VARCHAR(64) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  width INT NULL, height INT NULL,       -- gambar; NULL untuk PDF
  sha256 CHAR(64) NOT NULL,
  visibility VARCHAR(16) NOT NULL DEFAULT 'Privat', -- Public|Privat (khusus instrument-doc)
  uploaded_by VARCHAR(16) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
   INDEX idx_file_inst (institution_code),
   INDEX idx_file_owner (owner_ref),
   INDEX idx_file_kind (kind, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Tabel domain cukup menyimpan `*_asset_id` + nama tampilan (seperti mock kini);
blob tidak pernah di kolom DB.

### 1.a Endpoint unggah → `kind` → `owner_ref`

Karena prefix ID bukti frontend seragam (`evidence-asset-<uuid>` untuk lapor,
jawaban mandiri, SAM, dan penyelesaian), **server wajib mengisi `kind` dari
endpoint-nya**, bukan menebak dari ID.

| Endpoint unggah | `kind` | `owner_ref` | Aktor |
|---|---|---|---|
| `POST /uploads/report-evidence` | `report-evidence` | `report_id` (staging: kosong sampai submit) | publik/Pesantren |
| `POST /uploads/self-evidence` | `self-evidence` | `indicator_id`/kunci jawaban | publik/Pesantren |
| `POST /uploads/sam-evidence` | `sam-evidence` | `assessment_id` + `question_id` | Validator aktif |
| `POST /uploads/completion-evidence` | `completion-evidence` | `recommendation_id` | Pesantren scope |
| `POST /uploads/campus-plan` | `campus-plan` | `institution_code` | Pesantren scope |
| `POST /uploads/instrument-doc` | `instrument-doc` | `indicator_id` | Validator aktif |

`owner_ref` diisi final saat verifikasi submit (recheck institution + nama);
sebelum itu baris asset berstatus staging dan disapu job malam bila >24 jam.

## 2. Direktori (satu volume, bukan web root)

```
/srv/ishas-storage/
  campus-plans/YYYY/MM/<uuid>.<ext>
  evidences/report/YYYY/MM/<uuid>.<ext>
  evidences/self/YYYY/MM/<uuid>.<ext>
  evidences/sam/YYYY/MM/<uuid>.<ext>
  evidences/completion/YYYY/MM/<uuid>.<ext>
  instrument-docs/YYYY/MM/<uuid>.pdf
  tmp-uploads/                          # staging multipart; cron hapus >24 jam
```

- Nama disk = `<uuid>.<ext whitelist>`; **jangan** pakai nama asli pengunggah.
- Direktori `0700`, file `0600`, owner `bun:www-data`.
- Jangan expose via nginx static; serve hanya lewat §4.

## 3. Validasi server (tiru urutan frontend)

| Jenis | Batas | Cek |
|---|---|---|
| Bukti gambar (4 alur: lapor, jawaban mandiri, SAM, penyelesaian) | PNG/JPEG/WebP, 0–5 MB, nama 1–200, ≤20 MP | `Content-Length` dulu → magic bytes (`89 50 4E 47` / `FF D8 FF` / `RIFF....WEBP`) → dimensi header (`image.ts`, pengganti `createImageBitmap`) → resolusi → sha256 |
| Denah | PNG/JPEG/WebP ≤5 MB, sisi pendek ≥800 px | Sama, tanpa batas 20 MP |
| PDF indikator | `application/pdf` + `.pdf` + header `%PDF-`, 0–10 MB, nama ≤200 | 5 byte pertama wajib `25 50 44 46 2D` |
| Impor dataset | CSV/JSON teks, ≤200 baris | Bukan biner; validasi per baris di API |

Otorisasi upload = `mock-repository.ts` kini: bukti lapor (publik/pesantren),
SAM (validator aktif), completion (pesantren pemilik scope), denah (pesantren
1 scope + ack + lock), PDF (validator aktif).
Recheck saat submit: `institution_code` + `original_name` cocok
(port `submitLaporCepat`/`updateTindakLanjut`).

## 4. Penyajian unduh

Rute **kanonik**: `GET /api/files/:assetId` → cek sesi + scope. Alias
ramah-tampilan `GET /docs/:indicatorId/blob` (kontrak §10) memetakan
`indicator_id` → `asset_id` lalu memanggil jalur yang sama.

- `instrument-doc` + `Public`: bebas login.
- `instrument-doc` + `Privat`: hanya Validator aktif (cermin `openInstrumentDoc`).
- Bukti lapor-cepat/penyelesaian: hanya Pesantren pemilik scope (tetap privat).
- Foto bukti penilaian-mandiri: tampil lewat `pdf-data` publik (D-27);
  `GET /api/v1/files/:assetId` untuk `self-evidence` terbuka **publik hanya bila**
  asset menempel (`owner_ref`) pada laporan mandiri yang sudah `Diterima` dan
  belum diarsip; di luar itu privat untuk pemilik scope.
- Denah aktif: publik hanya setelah 1 pesantren dipilih (D-14).

Header: `Content-Disposition: inline; filename="<original_name>"` +
`X-Content-Type-Options: nosniff` + `Cache-Control: private, max-age=3600`.

## 5. Transaksi + yatim

Tulis: file → `tmp-uploads` → `INSERT file_assets` → `rename` ke path final →
`UPDATE` domain. Domain gagal → hapus file (port pola `deleteCampusAsset`
saat `publish` gagal). Job malam: hapus baris `file_assets` tanpa referensi
+ file `tmp-uploads` >24 jam (pengganti guard `assetEpoch`/`resettingAssets`).

Aturan yatim lebih rinci:

- Baris `file_assets` **staging** (kind `*-evidence`, `owner_ref` NULL, umur
  >24 jam) → hapus blob + baris.
- Baris yang hanya dirujuk dari `answers` JSON (self/SAM) dianggap hidup selama
  laporan/pengamatan induk belum diarsipkan/dihapus; saat induk hard-delete,
  hapus blob terkait lewat `owner_ref`.
- `institution-doc` seed (`seed-instrument-doc-<KODE>`) tidak punya blob di
  disk sampai migrasi menyintesis PDF; jangan dianggap yatim sebelum seed selesai.
- Reset demo (`POST /admin/reset-demo`) menjalankan pembersihan blok yang sama
  untuk seluruh kind (cermin `clearCampusAssets`/`clearEvidenceAssets`/
  `clearInstrumentDocAssets`) — implementasi: `clearStorageDir()` lalu seed ulang.

Implementasi Fase 5 (D-30.f): tulis via `tmp-uploads/` + `rename` atomik;
`owner_ref` diisi saat submit (lapor/penilaian/SAM/penyelesaian); job yatim
`src/storage-jobs.ts` dijalankan skrip `bun run sweep` atau `POST
/admin/storage/sweep`. Catatan: `sharp` (decode penuh) **belum dipakai** —
percobaan install menunjukkan proses decode menggantung di lingkungan prototipe,
jadi validasi memakai magic-bytes + dimensi header. Ditandai sebagai batas.

## 6. Migrasi satu kali dari IndexedDB

Skrip Bun + halaman ekspor sekali-pakai di frontend: baca 3 DB IndexedDB →
kirim blob + metadata ke `POST /admin/migrate/assets` (Super Admin, sekali
jalan, dikunci flag) → server simpan via jalur §3–§5. Seed PDF contoh
disintesis ulang atau diganti PDF asli dosen.

Implementasi Fase 5 (D-30.f): `mocks/adapters/device-assets.ts` mengekspor blob
denah/bukti/dokumen perangkat (base64); halaman `/admin/pengaturan` mengirim ke
endpoint lalu membersihkan IndexedDB (`clearCampusAssets`/`clearEvidenceAssets`/
`clearInstrumentDocAssets`). Flag `indexeddb_migrated` di tabel `app_settings`
(migrasi `0003`) membuat aksi hanya sekali; `GET /admin/migrate/status` dipakai
UI untuk menyembunyikan tombol. Metadata domain yang belum bisa direkonsiliasi
penuh (mis. versi denah) dicatat sebagai batas, bukan diklaim sempurna.
