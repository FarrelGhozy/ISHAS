# TODO ISHAS

Daftar ini adalah kontrol kerja aktif. Rincian dan keputusan tetap disimpan dalam `planning/`.

## Menunggu Review — Stage 11

- [x] Buat landing page publik di `/` dengan pengenalan, manfaat, empat peran, dan alur penggunaan.
- [x] Hubungkan landing page ke login serta tampilkan akun dan akses workspace untuk sesi aktif.
- [x] Tambahkan tautan kembali ke beranda dari login.
- [x] Periksa desktop, tablet, ponsel, aksesibilitas, alur utama, lint, TypeScript, test, dan build.
- [x] Perbarui dokumentasi dan pindahkan Stage 11 ke `REVIEW`.

**Keputusan:** permintaan landing page mengaktifkan Stage 11. Status review stage sebelumnya tidak berubah. Publikasi/push tidak termasuk permintaan ini.

## Selesai — Stage 01

- [x] Tetapkan empat peran utama dan tanggung jawabnya.
- [x] Buat aturan repository dan sistem planning per stage.
- [x] Buat halaman login dummy untuk empat peran.
- [x] Pisahkan navigasi dan ringkasan berdasarkan akun yang login.
- [x] Tampilkan akun aktif di kanan atas dan sediakan logout.
- [x] Terapkan sistem visual merah-marun dan sederhanakan penyajian aturan.
- [x] Periksa desktop, mobile, lint, dan production build.
- [x] Pindahkan Stage 01 ke `REVIEW`.

**Keputusan:** fondasi login, struktur empat ruang kerja, branding merah, dan logo sementara telah disetujui.

## Antrean Berikutnya

- [x] Stage 02 — detail pengelolaan sistem oleh Admin. **DONE**
- [x] Stage 03 — detail instrumen dan ilmu oleh Peneliti. **DONE**
- [x] Stage 04 — detail assessment lapangan oleh Asesor. **DONE**
- [x] Stage 05 — detail hasil dan tindak lanjut oleh Pengelola Pesantren. **DONE**
- [x] Stage 06 — penyelarasan lintas peran dan kesiapan presentasi. **REVIEW**
- [x] Stage 07 — manajemen lokasi, denah, dan peta bahaya. **REVIEW**
- [x] Stage 08 — dokumentasi dan audit flow penggunaan. **REVIEW**
- [x] Stage 09 — URL routing, shared shell, sesi login dummy, dan guard akses. **DONE**
- [x] Stage 10 — modularisasi fitur dan shared mock data lintas peran. **REVIEW**

## Selesai — Stage 09

- [x] Petakan setiap menu lama ke route URL yang stabil.
- [x] Buat route `/login`, `/akses-ditolak`, dan redirect awal dari `/`.
- [x] Pusatkan sesi autentikasi dummy dan pulihkan akun aktif setelah refresh.
- [x] Buat shared workspace shell untuk sidebar, topbar, akun aktif, notifikasi, menu mobile, dan area konten.
- [x] Migrasikan seluruh halaman Admin ke route role.
- [x] Migrasikan seluruh halaman Peneliti ke route role.
- [x] Migrasikan seluruh halaman Asesor ke route role.
- [x] Migrasikan seluruh halaman Pengelola ke route role.
- [x] Terapkan guard direct URL untuk pengguna tanpa sesi dan role yang salah.
- [x] Pastikan menu aktif berasal dari URL dan hapus state navigasi lama setelah migrasi selesai.
- [x] Periksa refresh, Back/Forward, direct URL, logout, desktop, tablet, dan ponsel.
- [x] Jalankan lint, TypeScript, dan production build.
- [x] Pindahkan Stage 09 ke `REVIEW` setelah seluruh acceptance criteria lulus.

**Keputusan:** refactor dilakukan sebelum backend dalam dua tahap. Stage 09 menjaga risiko tetap kecil dengan memindahkan routing, shell, login, dan akses lebih dahulu tanpa memecah seluruh fitur atau mengubah data domain.

**Hasil akhir 6 September 2026:** 24 route menu pada empat role unik dan merespons HTTP 200; mapping menu serta target notifikasi valid; login/logout, refresh, Back/Forward, fallback, direct URL, guard lintas role, shared shell, dan tampilan desktop/tablet/ponsel lulus pemeriksaan. Lint, TypeScript, pemeriksaan diff, dan production build juga lulus.

## Menunggu Review — Stage 10

- [x] Bentuk struktur `features`, `shared`, dan `mocks` di dalam `apps/web`.
- [x] Pecah workspace besar menjadi halaman serta komponen per role/fitur.
- [x] Pusatkan seluruh seed dan mutation dummy dalam shared mock repository/store.
- [x] Gunakan kontrak data bersama sebagai boundary antara halaman dan mock adapter.
- [x] Pertahankan data dummy saat berpindah route dan refresh, serta sediakan reset seed.
- [x] Sambungkan user/pesantren, instrumen, penugasan, lokasi, assessment, hasil, risiko, rekomendasi, tindak lanjut, audit, dan notifikasi.
- [x] Perbaiki progress assessment, filter peta risiko, dan input tindak lanjut berdasarkan data sumber yang sama.
- [x] Tambahkan test untuk store, selector, guard, serta flow lintas role kritis.
- [x] Sinkronkan checklist requirement, NFR, open question, dan development plan dengan hasil refactor.
- [x] Jalankan lint, TypeScript, test, formatter, production build, dan pemeriksaan respons seluruh route.
- [x] Periksa parity visual desktop, tablet, dan ponsel secara manual sebelum Stage 10 dipindahkan ke `REVIEW`.

**Hasil akhir 6 September 2026:** source data dummy sudah terpusat dan berversi, 24 halaman role sudah modular, perubahan penting bertahan lintas route/refresh, dan flow Pengelola–Asesor–Peneliti telah tersambung melalui ID stabil. Sebelas test otomatis dan 27 pemeriksaan route lulus. Pemeriksaan visual manual pada desktop 1440×900, tablet 834×1112, dan ponsel 390×844 juga lulus tanpa regresi visual atau luapan horizontal halaman. Stage 10 dipindahkan ke `REVIEW` dan menunggu persetujuan pemilik proyek/dosen.

**Dependency:** terpenuhi. Permintaan melanjutkan pekerjaan dan memecah halaman besar diperlakukan sebagai persetujuan Stage 09 sekaligus aktivasi Stage 10.

## Menunggu Keputusan Ilmiah

- Rumus indeks akhir dan bobot resmi tiap dimensi.
- Ambang resmi kategori risiko.
- Sumber standar wajib untuk tiap indikator.
- Aturan siapa yang berwenang memverifikasi tindak lanjut.

## Menunggu Review — Stage 02

- [x] Pengguna: pencarian, filter, status, dan tambah akun dummy.
- [x] Pesantren: direktori, pengelola utama, status onboarding, dan assessment.
- [x] Hak Akses: matriks kewenangan empat peran.
- [x] Audit Log: pencarian, filter kategori, dan catatan hanya-baca.
- [x] Pengaturan: preferensi non-ilmiah dan konfirmasi tindakan berisiko.
- [x] Lint dan production build.

**Keputusan:** struktur dan cakupan ruang kerja Admin telah disetujui; Stage 03 Peneliti dimulai.

## Menunggu Review — Stage 03

- [x] Instrumen: versi, dimensi, indikator, bobot dummy, sumber, dan kelengkapan.
- [x] Versioning: draft, published, arsip, jejak induk, dan snapshot historis.
- [x] Scoring: bobot, rubric, bukti wajib, dan pemicu rekomendasi dummy.
- [x] Validasi & Publikasi: checklist kesiapan dan konfirmasi penguncian versi.
- [x] Data Penelitian: pencarian, filter, verifikasi, metadata versi, dan ekspor dummy.
- [x] Instrument Builder: tambah dimensi dan indikator dalam versi Draft.
- [x] Form indikator: pertanyaan, jenis jawaban, bobot, bukti, referensi, rubric, dan rekomendasi.
- [x] Status perubahan Draft, simpan perubahan, serta validasi kelengkapan.
- [x] Kunci editor untuk versi Published dan arahkan perubahan melalui versi baru.
- [x] Versioning: form pembuatan draft baru dari snapshot versi induk.
- [x] Scoring: rubric dan aturan rekomendasi dapat diedit sebagai dummy.
- [x] Data Penelitian: detail metadata dan alur ekspor dummy.
- [x] Lint dan production build ulang.

**Keputusan yang dibutuhkan:** tinjau ulang alur input instrumen dan fitur Peneliti sebelum Stage 04 Asesor dimulai.

**Keputusan:** permintaan melanjutkan stage berikutnya diperlakukan sebagai persetujuan Stage 03; Stage 04 Asesor dimulai.

## Menunggu Review — Stage 04

- [x] Penugasan: daftar assessment yang hanya berada dalam lingkup Asesor aktif.
- [x] Persiapan: verifikasi identitas pesantren, periode, versi instrumen, dan kontak lapangan.
- [x] Form assessment: navigasi dimensi dan indikator, pilihan jawaban, catatan, serta bukti dummy.
- [x] Draft: simpan progres dan tampilkan indikator yang belum lengkap.
- [x] Finalisasi: validasi bukti wajib, konfirmasi penguncian, dan jejak versi instrumen.
- [x] Bukti Lapangan: filter kelengkapan dan simulasi unggah per indikator.
- [x] Riwayat: assessment final dan draft dapat ditelusuri.
- [x] Lint dan production build.

**Keputusan yang dibutuhkan:** tinjau alur persiapan, pengisian, bukti, dan finalisasi Asesor sebelum Stage 05 dimulai.

**Keputusan:** permintaan melanjutkan stage berikutnya diperlakukan sebagai persetujuan Stage 04; Stage 05 Pengelola Pesantren dimulai.

## Menunggu Review — Stage 05

- [x] Ringkasan hasil hanya untuk pesantren yang terhubung dengan akun aktif.
- [x] Hasil assessment per dimensi dan perbandingan antarperiode.
- [x] Peta risiko berbasis denah area/lokasi dengan detail temuan.
- [x] Rekomendasi prioritas dengan penanggung jawab dan tenggat.
- [x] Rencana tindak lanjut, bukti penyelesaian, dan status verifikasi.
- [x] Laporan ringkas yang siap dibaca pimpinan.
- [x] Simulasi laporan PDF/Excel beserta metadata versi instrumen.
- [x] Lint dan production build.

**Keputusan yang dibutuhkan:** tinjau alur membaca hasil, peta risiko, rekomendasi, tindak lanjut, dan laporan sebelum Stage 06 dimulai.

**Keputusan:** permintaan melanjutkan stage berikutnya diperlakukan sebagai persetujuan Stage 05; Stage 06 dimulai.

## Menunggu Review — Stage 06

- [x] Audit seluruh menu dan aksi utama pada empat peran.
- [x] Pola bersama untuk loading, empty, error, forbidden, dan success state.
- [x] Notifikasi kontekstual per peran.
- [x] Penyelarasan label form, validasi, fokus keyboard, dan responsivitas.
- [x] Kontrak data TypeScript untuk autentikasi, instrumen, assessment, hasil, risiko, rekomendasi, tindak lanjut, laporan, dan audit.
- [x] Import Excel/CSV dan sumber data assessment dari proposal dipetakan.
- [x] Dokumen matriks fitur, skenario demo, endpoint, dan keputusan backend yang belum final.
- [x] Formatter, lint, TypeScript, dan production build.

**Keputusan yang dibutuhkan:** review seluruh alur lintas peran dan ajukan prototipe ke dosen. Perubahan setelah review dicatat sebagai stage baru agar ruang lingkupnya jelas.

## Menunggu Review — Stage 07

- [x] Master gedung, lantai, area, dan sumber denah per pondok.
- [x] Simulasi tambah gedung dan unggah denah per lantai.
- [x] Daftar Area sebagai tampilan utama yang tidak bergantung pada denah.
- [x] Denah Bangunan dengan temuan bahaya dan metadata versi.
- [x] Daftar Temuan dengan filter dan detail penilaian risiko.
- [x] Pemilihan lokasi observasi pada form Asesor.
- [x] Hubungan temuan, rekomendasi, dan tindak lanjut terkait.
- [x] Kontrak backend serta dokumentasi alur data.
- [x] Lint, TypeScript, production build, dan respons server lokal.

**Keputusan yang dibutuhkan:** tinjau sumber denah, fallback tanpa denah, pengambilan lokasi oleh Asesor, dan keterhubungan temuan dengan tindak lanjut. Rumus risiko resmi serta pihak yang memverifikasi denah belum ditetapkan.

## Menunggu Review — Stage 08

- [x] Dokumentasikan flow utama lintas empat peran.
- [x] Dokumentasikan pembuatan akun Asesor dan Pengelola.
- [x] Dokumentasikan sumber lokasi, denah, titik temuan, dan data risiko.
- [x] Kelompokkan flow pendukung per peran.
- [x] Tulis ulang flow utama sebagai checklist operasional.
- [x] Audit celah flow dan kelompokkan berdasarkan prioritas.

**Keputusan yang dibutuhkan:** tentukan pemilik Manajemen Penugasan, pemeriksa tindak lanjut/denah, dan apakah assessment melewati reviewer sebelum Final.
