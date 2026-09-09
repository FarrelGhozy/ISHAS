# Stage V2-07 — Lokasi + Tindak Lanjut Kelola + Laporan Pengelola

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-02, D-05, D-06, D-07 dan D-11
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-05 `DONE` (scope + antrean), V2-06 disarankan (status mapan).
**Tujuan:** senjata operasional pengelola: master lokasi yang menghidupi dropdown lapor,
tindak lanjut yang menggerakkan status, dan laporan pimpinan scope sendiri.

## Ruang lingkup

### 1. Lokasi — Gedung, lantai, area, denah (`/pengelola/lokasi`)

- [ ] Tambah gedung (nama* + kode*; sistem membuat `Lantai 1` awal tanpa denah) + audit + notifikasi internal.
- [ ] Tambah lantai (nama*) + tambah area (nama* + lantai* + zona/blok*; koordinat default tengah,
  dapat digeser bila denah ada).
- [ ] Unggah denah per lantai (JPG/PNG/PDF milik pesantren; simpan nama + versi `DENAH-vN` naik;
  tidak menimpa versi lama; assessment lama mengacu versi saat observasi).
- [ ] Area baru LANGSUNG muncul di dropdown lokasi `/lapor` dan `/penilaian-mandiri` untuk
  `institutionCode` yang sama (dibuktikan test; tanpa denah pun area tetap bisa dipilih).
- [ ] Aturan: area wajib ada untuk indikator lokasi-wajib; tanpa area → form penilaian terkunci
  dengan pesan hubungi pengelola (bukan dropdown kosong).

### 2. Tindak lanjut kelola (`/pengelola/tindak-lanjut`)

- [ ] Dari rekomendasi `Belum ditindaklanjuti` → **Buat rencana tindakan** (PIC* + tenggat* + catatan) →
  rekomendasi `Berjalan`, laporan induk `Proses`.
- [ ] Perbarui progres (0–100) + catatan + bukti penyelesaian dummy → ajukan selesai →
  verifikasi pengelola → `Completed`/`Terverifikasi` (terhubung V2-06).
- [ ] Filter status/prioritas + pencarian; bedakan visual `Berjalan`/`Menunggu verifikasi`/`Terverifikasi`.

### 3. Laporan pengelola (`/pengelola/laporan`)

- [ ] Pratinjau ringkasan pimpinan scope sendiri + dimensi + status tindak lanjut +
  metadata (periode, versi instrumen, waktu buat, pembuat) + simulasi unduh PDF/Excel berlabel dummy.
- [ ] Riwayat laporan tersimpan (periode + versi + pembuat).

## Acceptance criteria

- [ ] Area/lantai/gedung baru end-to-end terlihat di form publik pesantren yang sama (skenario integrasi).
- [ ] Tindak lanjut end-to-end menggerakkan status laporan sesuai FLOWS §5–6.
- [ ] Copy WIREFRAMES §5–6; visual 3 viewport; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
