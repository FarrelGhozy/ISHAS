# Stage Stage 07 — Lokasi + Tindak Lanjut Kelola + Laporan Pengelola

**Pembaruan 18 September 2026:** frontend telah diimplementasikan; catatan izin/
keputusan terbuka pada rancangan awal di bawah bersifat historis. D-06/D-07/D-08/
D-10/D-11 yang terjawab pada 9 September serta D-14/D-15 dibaca dari DECISIONS.md.
Status REVIEW tidak berarti DONE atau seluruh pemeriksaan terbaru sudah lengkap.
Revisi dashboard saat ini dicatat terpisah pada STAGE_DASHBOARD_POLISH.md;
checklist yang belum diverifikasi tetap terbuka.


**Status:** IN PROGRESS
**Catatan review:** D-05, D-06, D-07, dan D-11 telah diputuskan pemilik pada 9 September 2026.
**Dependensi:** Stage 05 tersedia (scope + antrean), Stage 06 disarankan (status mapan).
**Tujuan:** senjata operasional pengelola: master lokasi yang menghidupi dropdown lapor,
tindak lanjut yang menggerakkan status, dan laporan pimpinan scope sendiri.

## Ruang lingkup

### 1. Lokasi — Gedung, lantai, area, denah (`/pengelola/lokasi`)

- [x] Tambah gedung (nama* + kode*; sistem membuat `Lantai 1` awal tanpa denah) + audit + notifikasi internal.
- [x] Tambah lantai (nama*) + tambah area (nama* + lantai* + zona/blok*; koordinat default tengah,
 dapat digeser bila denah ada).
- [x] Unggah denah per lantai (JPG/PNG/PDF milik pesantren; simpan nama + versi `DENAH-vN` naik;
 tidak menimpa versi lama; assessment lama mengacu versi saat observasi).
- [x] Area baru LANGSUNG muncul di dropdown lokasi `/lapor` untuk
 `institutionCode` yang sama (dibuktikan test; tanpa denah pun area tetap bisa dipilih).
- [ ] Aturan: area wajib ada untuk indikator lokasi-wajib; tanpa area → form penilaian terkunci
 dengan pesan hubungi pengelola (bukan dropdown kosong).

### 2. Tindak lanjut kelola (`/pengelola/tindak-lanjut`)

- [x] Dari rekomendasi `Belum ditindaklanjuti` → **Buat rencana tindakan** (PIC* + tenggat* + catatan) →
 rekomendasi `Berjalan`, laporan induk `Proses`.
- [x] Perbarui progres (0–100) + catatan + bukti penyelesaian dummy → ajukan selesai →
 verifikasi pengelola → `Completed`/`Terverifikasi` (terhubung Stage 06).
- [x] Filter status/prioritas + pencarian; bedakan visual `Berjalan`/`Menunggu verifikasi`/`Terverifikasi`.
- [ ] Revisi D-21 (IN PROGRESS 27 Sep 2026): panel relasi laporan induk penuh +
 upload bukti penyelesaian (pola `/lapor`: PNG/JPEG/WebP 5MB/20MP + pratinjau +
 lepas/ganti, wajib saat 100%) + batal per rekomendasi (`Dibatalkan` terminal,
 alasan min 10 + tampil publik, baris tidak dihapus, temuan tertaut ikut,
 laporan induk tetap `Proses`) + filter `Dibatalkan` + empty state penjelas +
 publik `/tindak-lanjut` tampil `Dibatalkan` + alasan (bukti/tenggat/catatan
 tetap privat). Schema v9→v10 + migrasi + seed contoh + test.

### 3. Laporan pengelola (`/pesantren/laporan`)

- [x] Pratinjau ringkasan pimpinan scope sendiri + dimensi + status tindak lanjut +
  metadata (periode, versi instrumen, waktu buat, pembuat) + simulasi unduh PDF/Excel berlabel dummy.
- [x] Riwayat laporan tersimpan (periode + versi + pembuat).
- [x] Revisi D-23 (IN PROGRESS 27 Sep 2026): progres rata-rata non-`Dibatalkan`,
  tanggal data terbaru (bukan render-time), tautan silang Validasi/Tindak lanjut,
  versi instrumen per baris riwayat, hint `Dibatalkan` menghalangi `Completed`;
  arsip keluar dari antrean kelola (`selectReportsForManager`).
  Verifikasi: lint + typecheck + 149 test + build lulus; cek visual browser menyusul.

### 4. Revisi D-23 lintas Validasi (tanpa mengubah status Stage 05–06)

- [x] Filter antrean: status + kanal + severity + pencarian deskripsi; baris memuat
  chip kanal + lokasi + handling; pre-fill usulan tanpa opsi `Belum ditentukan`;
  arsip tidak tampil di kelola.
- [x] Editor tingkat risiko per temuan (`Rendah/Sedang/Tinggi/Ekstrem`, teraudit);
  `verifyFinding`/`savePlanVersion` deprecasi lembut; lantai per-gedung; sync kartu.

### 5. Revisi D-34 Dashboard Pesantren (IN PROGRESS 29 Sep 2026)

- [ ] Route `/pesantren/dashboard` (landing Pesantren) + header identitas
  (nama + kode + kota + status) + 4 kartu rangkuman + antrean terbaru +
  tindak lanjut + tautan kelola; nav + redirect + test regresi.
- [ ] Verifikasi: lint + typecheck + test + build + cek visual 3 viewport.

### 6. Revisi D-36 Hasil mandiri detail (IN PROGRESS 29 Sep 2026)

- [ ] Route `/pesantren/hasil-penilaian-mandiri` + menu `Hasil mandiri` +
  daftar/detail `Terbit` full internal scope sendiri + blokir lintas-scope.
- [ ] Verifikasi: lint + typecheck + test + build + cek visual 3 viewport.

## Acceptance criteria

- [x] Area/lantai/gedung baru end-to-end terlihat di form publik pesantren yang sama (skenario integrasi).
- [x] Tindak lanjut end-to-end menggerakkan status laporan sesuai FLOWS §5–6.
- [ ] Copy WIREFRAMES §5–6; visual 3 viewport; lint, typecheck, test, build lulus (lint/typecheck/test/build lulus; cek visual menyusul).

## Hasil Pemeriksaan

- 9 September 2026: `bun run lint`, `bun run typecheck`, `bun test` (52 test), dan `bun run build` lulus.
