# Stage V2-04 — Halaman Baca Publik

**Status:** REVIEW
**Catatan review:** belum diizinkan membuat kode tanpa arahan pemilik. D-02 telah dijawab
(8 September 2026): halaman publik hanya ringkasan + nama validator/PIC; denah/bukti/nama pelapor
internal. Bagian terkait D-04 dan D-08 masih menunggu keputusan di `../DECISIONS.md`.
Checklist di bawah adalah rancangan awal; ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** Review ulang V2-01–V2-03 selesai diverifikasi; pemilik meminta kelanjutan stage secara berurutan pada 8 September 2026.
**Tujuan:** lima halaman baca + deep-link lembaga, semuanya steril dari data belum divalidasi
dan konsisten satu sama lain untuk filter yang sama.

## Ruang lingkup (satu checklist per halaman)

### 1. `/hasil` — Hasil assessment

- [x] Filter pesantren (mengikuti pilihan `/`) + hasil penilaian yang `Diterima`; kebijakan beberapa hasil per periode tetap mengikuti aturan ilustrasi D-04.
- [x] Skor total + kategori ilustratif + status `Diterima` + versi instrumen + per dimensi. Lapor cepat tidak menjadi sumber skor instrumen.
- [x] Nama validator tampil; nomor laporan dan nama pelapor tetap internal sesuai matriks D-02.

### 2. `/peta-risiko` — Peta bahaya & risiko

- [x] Dua tampilan publik: Daftar Area (default, selalu tersedia) + Daftar Temuan; tampilan
  Denah Bangunan (marker bernomor) hanya di workspace pengelola — denah/titik tidak publik (D-02);
  filter pesantren/gedung/lantai/severity/status.
- [x] Detail temuan (ringkasan): bahaya, dampak, keparahan, lokasi, rekomendasi + validator (D-02);
  bukti, jawaban mentah, dan titik denah tidak publik; tombol ke rekomendasi/tindak lanjut terkait.
- [ ] Area tanpa temuan aktif tampil netral (bukan marker hijau).

### 3. `/rekomendasi` — Rekomendasi

- [x] Prioritas/status + PIC + progres; nomor laporan dan tenggat tetap internal sesuai D-02.
- [x] Publik mode baca + ajakan masuk.

### 4. `/tindak-lanjut` (baca publik) — Progres + bukti penyelesaian; kelola penuh di V2-07.

- [x] Bedakan `Berjalan`/`Menunggu verifikasi`/`Terverifikasi`; publik tidak bisa mengubah.

### 5. `/laporan` — Laporan pimpinan

- [x] Ringkasan + dimensi + status tindak lanjut + metadata periode/versi +
  simulasi unduh PDF/Excel berlabel dummy.

### 6. `/pesantren/[kode]` — Deep-link lembaga

- [x] Sama seperti `/` dengan filter terkunci ke `[kode]`; kode tak dikenal → empty state
  `Pesantren tidak ditemukan.` (bukan crash/404 teknis).

## Aturan konsistensi (wajib)

- [x] Semua halaman membaca selector validated yang SAMA; filter identik → angka identik.
- [x] Tidak ada halaman yang membaca antrean `Menunggu validasi`/`Ditolak`.

## Acceptance criteria

- [x] TEST_PLAN §1 baris 5–7 + §3 nomor 7 lulus; visual tanpa overflow pada ponsel; keyboard memakai kontrol native.
- [x] Lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- 8 September 2026: `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut`, dan `/laporan`
  dibangun. Tujuh pemeriksaan browser termasuk filter valid/tak valid lulus tanpa placeholder,
  overflow, atau kebocoran nama pelapor/bukti. Lint, typecheck, 45 test, dan build lulus.
