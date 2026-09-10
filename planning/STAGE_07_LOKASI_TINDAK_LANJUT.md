# Stage Stage 07 — Lokasi + Tindak Lanjut Kelola + Laporan Pengelola

**Status:** IN PROGRESS
**Catatan review:** D-05, D-06, D-07, dan D-11 telah diputuskan pemilik pada 9 September 2026.
**Dependensi:** Stage 05 `DONE` (scope + antrean), Stage 06 disarankan (status mapan).
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

### 3. Laporan pengelola (`/pengelola/laporan`)

- [x] Pratinjau ringkasan pimpinan scope sendiri + dimensi + status tindak lanjut +
 metadata (periode, versi instrumen, waktu buat, pembuat) + simulasi unduh PDF/Excel berlabel dummy.
- [x] Riwayat laporan tersimpan (periode + versi + pembuat).

## Acceptance criteria

- [x] Area/lantai/gedung baru end-to-end terlihat di form publik pesantren yang sama (skenario integrasi).
- [x] Tindak lanjut end-to-end menggerakkan status laporan sesuai FLOWS §5–6.
- [ ] Copy WIREFRAMES §5–6; visual 3 viewport; lint, typecheck, test, build lulus (lint/typecheck/test/build lulus; cek visual menyusul).

## Hasil Pemeriksaan

- 9 September 2026: `bun run lint`, `bun run typecheck`, `bun test` (52 test), dan `bun run build` lulus.
