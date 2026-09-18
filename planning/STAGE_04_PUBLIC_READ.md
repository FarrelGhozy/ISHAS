# Stage Stage 04 — Halaman Baca Publik

**Pembaruan 18 September 2026:** frontend telah diimplementasikan; catatan izin/
keputusan terbuka pada rancangan awal di bawah bersifat historis. D-06/D-07/D-08/
D-10/D-11 yang terjawab pada 9 September serta D-14/D-15 dibaca dari DECISIONS.md.
Status REVIEW tidak berarti DONE atau seluruh pemeriksaan terbaru sudah lengkap.
Revisi dashboard saat ini dicatat terpisah pada STAGE_DASHBOARD_POLISH.md;
checklist yang belum diverifikasi tetap terbuka.


**Status:** REVIEW
**Acuan terkini:** D-02 menjaga ringkasan publik dan privasi pelapor/bukti; D-08
mengeluarkan pesantren tidak terdaftar; D-14 mengizinkan denah gambaran besar dan
titik tervalidasi setelah satu pesantren dipilih. Skor tetap ilustratif D-04.
**Dependensi:** Review ulang Stage 01–Stage 03 selesai diverifikasi; pemilik meminta kelanjutan stage secara berurutan pada 8 September 2026.
**Tujuan:** lima halaman baca + deep-link lembaga, semuanya steril dari data belum divalidasi
dan konsisten satu sama lain untuk filter yang sama.

## Ruang lingkup (satu checklist per halaman)

### 1. `/hasil` — Hasil assessment

- [x] Filter pesantren (mengikuti pilihan `/`) + hasil penilaian yang `Diterima`; kebijakan beberapa hasil per periode tetap mengikuti aturan ilustrasi D-04.
- [x] Skor total + kategori ilustratif + status `Diterima` + versi instrumen + per dimensi. Lapor cepat tidak menjadi sumber skor instrumen.
- [x] Nama validator tampil; nomor laporan dan nama pelapor tetap internal sesuai matriks D-02.

### 2. `/peta-risiko` — Peta bahaya & risiko

- [x] Peta memakai denah gambaran besar untuk satu pesantren (D-14), versi denah,
  tingkat risiko/status, titik/cluster dan daftar temuan. Scope general meminta
  pilih pesantren; tanpa denah tetap ada daftar. Rincian uji: STAGE_RISK_MAP.md.
- [x] Detail ringkasan: bahaya/lokasi/risiko/status + validator/PIC. Bukti, jawaban
  mentah, nomor laporan dan identitas pelapor tetap internal. Titik tidak dipindah
  otomatis antarversi dan laporan tanpa titik tidak diberi centroid.
- [ ] Area tanpa temuan aktif tampil netral (bukan marker hijau).

### 3. `/rekomendasi` — Rekomendasi

- [x] Prioritas/status + PIC + progres; nomor laporan dan tenggat tetap internal sesuai D-02.
- [x] Publik mode baca + ajakan masuk.

### 4. `/tindak-lanjut` (baca publik) — Progres + bukti penyelesaian; kelola penuh di Stage 07.

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
