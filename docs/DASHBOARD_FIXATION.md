# Penyempurnaan dashboard — klarifikasi 18 September 2026

**Keputusan lanjutan pemilik:** usulan fiksasi disetujui; dashboard mengikuti gambar
pertama tanpa mengganti tema/warna, fokus penyempurnaan responsivitas, visualisasi,
dokumentasi/alur data, dan pembaruan stage. Pertanyaan pada bagian akhir merupakan
riwayat klarifikasi, sudah terjawab untuk ruang lingkup revisi ini (D-13 amendemen).


## Arahan sesi ini

Pemilik meminta membaca perubahan yang belum di-commit, menyempurnakannya, dan
memaksimalkan dashboard utama dengan dua gambar referensi. Pemilik kemudian
meminta koreksi AGENTS.md serta penjelasan konflik agar keputusan dapat ditetapkan.
Ini izin penyempurnaan frontend, bukan persetujuan menyalin angka, rumus, warna,
hak akses, atau seluruh skema pada gambar. Belum ada perubahan kode pada sesi ini.

## Koreksi aturan kerja

AGENTS.md kini membedakan catatan historis dari konflik keputusan nyata. Arahan
eksplisit terbaru dapat mengaktifkan revisi dengan catatan cakupan; kesalahan
dokumentasi yang jawabannya sudah jelas dapat diperbaiki tanpa persetujuan ulang.
Status DONE tetap memerlukan persetujuan. Perubahan pengguna tetap dipertahankan.
Shell publik diselaraskan dengan arahan sidebar yang tercatat di TODO. Istilah
Ekstrem untuk level risiko mengikuti D-15; severity/priority tetap tiga tingkat.

## Pembacaan referensi

- Gambar dashboard: sidebar; ringkasan skor dan indikator; tren; donat risiko;
  grafik empat kategori; rekap; kolom kategori, denah, dan tindak lanjut.
  Form contoh mencampurkan input pelapor dan penetapan risiko pengelola.
- Gambar ISHAS Master: organisasi Pesantren → Lokasi berhierarki; instrumen
  Dimensi → Aspek → Indikator dengan skala penilaian; assessment → scoring →
  weighting → indeks → classification → risk mapping. Bobot penelitian dan
  skala contoh 0–3 bukan rumus final yang otomatis berlaku di prototipe.

## Konflik dan statusnya

1. **Izin pengerjaan:** D-13/review dashboard masih mengatakan persiapan, sementara
   TODO mencatat implementasi. Permintaan sesi ini sudah mengizinkan penyempurnaan;
   catatan persiapan lama tidak lagi menjadi penghalang izin pekerjaan.
2. **Status stage:** planning/README dan TODO menulis Stage 04 IN PROGRESS, file
   STAGE_04_PUBLIC_READ menulis REVIEW. Jangan menebak persetujuan stage lama;
   revisi dashboard perlu catatan tersendiri, hasil uji baru, lalu REVIEW.
3. **Peta publik:** stage lama melarang denah/titik publik; D-14 mengizinkan denah
   gambaran besar setelah satu pesantren dipilih. D-14 menjadi amendemen acuan;
   bukti dan identitas pelapor tetap internal.
4. **Risiko:** review lama menyebut tiga level; D-15 menambah Ekstrem pada risiko
   temuan. Ini tidak menambah level severity/priority dan tidak mengesahkan ambang.
5. **Warna:** referensi toska/hijau; identitas resmi marun. Belum ada arahan eksplisit
   mengganti identitas. Usulan: pertahankan marun untuk merek/navigasi, gunakan
   aksen kategori dan status yang konsisten dengan sistem desain.
6. **Struktur ilmiah:** gambar Master memisahkan Dimensi → Aspek → Indikator,
   sedangkan D-15 menetapkan Kategori → Aspek → Indikator dan kode menyimpannya
   dalam dimensions. Contoh dimensi SAT pada gambar berbeda dari empat kategori
   dashboard. Perlu keputusan apakah dimensi ilmiah merupakan lapisan terpisah;
   jangan menyamakan keduanya diam-diam atau merombak snapshot Published.
7. **Form dan rumus:** gambar menaruh Likelihood/Severity/skor pada form pelapor,
   sedangkan aturan proyek menyerahkannya kepada pengelola. Usulan: dashboard
   menyediakan ringkasan kanal dan tombol ke form; penetapan risiko tetap internal.
8. **Unit metrik:** angka gambar tidak konsisten antar grafik/rekap. Katalog
   indikator, jawaban penilaian, dan temuan harus dibedakan; grafik dan tabel
   memakai dataset publik tervalidasi dengan filter yang sama, bukan angka gambar.

## Keputusan yang masih diperlukan

- Identitas marun dipertahankan atau diubah mengikuti toska referensi?
- Empat kategori menjadi struktur prototipe saat ini, atau dimensi ilmiah pada
  gambar Master harus ditambahkan sebagai lapisan terpisah sekarang?
- Form tetap pada halaman Pelaporan/Penilaian mandiri dengan penetapan risiko
  pengelola, atau ada perubahan alur yang memang diminta?

Jawaban dicatat di DECISIONS.md sebelum perubahan yang bergantung padanya.
