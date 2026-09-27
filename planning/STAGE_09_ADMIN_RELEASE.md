# Stage Stage 09 — Admin + Sinkron Dokumen + Rilis REVIEW

**Pembaruan 18 September 2026:** frontend telah diimplementasikan; catatan izin/
keputusan terbuka pada rancangan awal di bawah bersifat historis. D-06/D-07/D-08/
D-10/D-11 yang terjawab pada 9 September serta D-14/D-15 dibaca dari DECISIONS.md.
Status REVIEW tidak berarti DONE atau seluruh pemeriksaan terbaru sudah lengkap.
Revisi dashboard saat ini dicatat terpisah pada STAGE_DASHBOARD_POLISH.md;
checklist yang belum diverifikasi tetap terbuka.


**Status:** IN PROGRESS
**Acuan terkini:** aplikasi frontend D-01 tersedia. D-08 membatasi publik pada
pesantren terdaftar; keputusan D-09 yang masih terbuka perlu dibedakan per bagian.
Pemeriksaan rilis/route semua peran belum lengkap; stage tetap IN PROGRESS.
**Dependensi:** Stage 01…Stage 08 `DONE`/`REVIEW` (tahap penutup).
**Tujuan:** melengkapi sisi Super Admin, menyinkronkan seluruh dokumen,
dan menjalankan uji rilis penuh sebelum meminta persetujuan.

## Revisi aktif — identitas biru (D-18, 27 September 2026)

- [x] Ganti token dan pemakaian identitas marun menjadi biru pada antarmuka,
  grafik, halaman masuk, serta ikon browser; status bahaya tetap merah.
- [x] Sinkronkan dokumen warna yang terdampak dan jalankan lint, typecheck,
  test, build, serta pemeriksaan visual. Pemeriksaan 27 September: desktop
  1440×900, tablet 834×1112, dan ponsel pada viewport bawaan tampil tanpa
  overflow; lint, typecheck, 123 test, dan build lulus.

## Ruang lingkup

### 1. Super Admin (`/admin/*`, login admin)

- [x] `pesantren`: tambah (`Persiapan`) + daftar status dan onboarding.
 (konfirmasi + penjelasan efek ke pemilih publik); detail (akun Pesantren, status assessment/onboarding).
- [x] `pengguna`: buat akun `Pesantren` pada satu pesantren Aktif; email duplikat ditolak.
 email duplikat ditolak; TIDAK ADA opsi Asesor di dropdown/filter/fallback.
- [ ] Menambah akun Pesantren pertama yang aktif → pesantren MUNCUL di pemilih publik (dibuktikan end-to-end);
 menonaktifkan akun Pesantren terakhir → pesantren HILANG dari pemilih (arsip `Diterima` tetap tampil).
- [x] `hak-akses`: matriks 3 peran + publik.
- [x] `audit-log`: pencarian jejak kirim/terima/tolak/status/hapus .
- [ ] `pengaturan`: preferensi non-ilmiah + konfirmasi tindakan berisiko + reset data demo ke seed.

### 2. Validator — verifikasi fungsi dan hubungan data

- [ ] Pastikan tidak ada teks/dependensi asesor tersisa; Published aktif menjadi sumber Stage 08
 (uji publikasi versi baru → self-assessment memakai snapshot baru tanpa merusak hasil lama).
- [ ] Verifikasi hasil dan dataset mempunyai sumber kiriman yang konsisten, status sesuai ,
 akses bidang sesuai D-02/D-04, serta simulasi import tidak melompati moderasi. Kontraknya
 harus sudah dibahas pada fondasi, bukan baru ditentukan saat rilis.

### 3. Dokumen proyek ISHAS (wajib sebelum REVIEW)

D-01 dijawab: aplikasi ISHAS.
adalah dokumen milik proyek ISHAS yang baru.

- [x] `README` proyek ISHAS: `/` = dashboard publik; akun demo 3 peran; tanpa landing/asesor.
- [x] Dokumen alur ringkas proyek ISHAS: lapor + validasi + lifecycle (pengganti `flow.md` lama).
- [ ] `TODO`/planning proyek ISHAS: status akhir stage .

### 4. Uji rilis penuh (EXEKSI TEST_PLAN utuh)

- [ ] Matriks route 12 baris + guard/sesi + 8 skenario E2E + visual 3 viewport + keyboard.
- [ ] Lint + typecheck + test + build hijau; grep kebersihan (asesor/assignment/empat peran) nihil.
- [ ] Catat hasil aktual tiap stage dan pemeriksaan integrasi di Stage 09; hanya stage yang baru selesai diperiksa dipindahkan ke `REVIEW`. Stage yang sudah disetujui `DONE` tetap `DONE`.

## Acceptance criteria

- [ ] Seluruh acceptance Stage 01…Stage 08 tetap hijau setelah integrasi penuh (tidak ada regresi tahap akhir).
- [ ] Dokumen proyek ISHAS konsisten dengan implementasi (tidak ada kontradiksi peran/route/status); arsip lama tidak dipakai.
- [ ] Paket REVIEW lengkap: 9 stage terisi hasil + `TODO.md` sinkron.

## Hasil Pemeriksaan

- 27 September 2026 (pematangan Super Admin, IN PROGRESS): deadlock onboarding
  diperbaiki mengikuti FLOWS §1 (Persiapan → Aktif bebas → akun Pesantren
  Menunggu → Aktif = terdaftar); form pesantren wajib 4 field + detail +
  konfirmasi efek pemilih; akun baru default Menunggu; dashboard bedakan
  terdaftar-vs-Aktif dan internal-vs-publik; hak-akses jadi matriks baca;
  audit tambah filter pelaku; pengaturan betulkan seed v11. Test store
  end-to-end (termasuk hilang-terdaftar saat akun terakhir nonaktif) ditulis.
  Lanjutan: kelola akun via popup (buat + sandi/konfirmasi → Menunggu, ubah,
  reset sandi demo teraudit, hapus + proteksi diri/admin terakhir).
  Verifikasi lint/typecheck/test/build + cek visual browser menyusul.
- 9 September 2026: lint, typecheck, 52 test, build, dan pemeriksaan whitespace lulus.
