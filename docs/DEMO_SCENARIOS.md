# Skenario Demo Frontend ISHAS

Skenario ini dipakai saat review dengan dosen agar seluruh alur dapat diperiksa secara konsisten.

## 1. Admin mengatur fondasi sistem

1. Masuk sebagai Admin.
2. Buka Pengguna, cari akun, buka detail, lalu coba Tambah Pengguna.
3. Buka Pesantren, periksa detail lembaga, lalu coba Tambah Pesantren.
4. Tinjau matriks Hak Akses empat peran.
5. Buka Audit Log, filter aktivitas, dan coba ekspor.
6. Periksa Pengaturan non-ilmiah.

Hasil yang diharapkan: Admin mengelola sistem, tetapi tidak mengubah hasil final atau instrumen Published secara langsung.

## 2. Peneliti menyusun instrumen

1. Masuk sebagai Peneliti.
2. Buka Instrumen dan masuk ke Instrument Builder.
3. Pilih/tambah dimensi dan indikator.
4. Isi jenis jawaban, bobot, bukti, rubric, referensi, serta recommendation rule dummy.
5. Simpan draft dan jalankan pemeriksaan kelengkapan.
6. Buka Versioning, buat versi baru dari versi Published.
7. Periksa Scoring, Validasi & Publikasi, serta Data Penelitian.

Hasil yang diharapkan: versi Draft dapat diubah; versi Published terkunci dan perubahan dilakukan melalui versi baru.

## 3. Asesor menghasilkan data lapangan

1. Masuk sebagai Asesor.
2. Buka Assessment Saya dan pastikan hanya penugasan Ahmad Fauzan yang terlihat.
3. Lanjutkan Draft atau pilih Assessment Baru.
4. Verifikasi data awal pesantren dan versi instrumen.
5. Isi seluruh pertanyaan, catatan N/A bila digunakan, dan unggah bukti wajib.
6. Simpan Draft, buka ringkasan, lalu finalisasi setelah lengkap.
7. Buka Bukti Lapangan dan Riwayat.

Hasil yang diharapkan: progress berasal dari kelengkapan field; finalisasi diblokir jika jawaban/bukti belum lengkap dan hasil final menjadi hanya-baca.

## 4. Pengelola menggunakan hasil

1. Masuk sebagai Pengelola Pesantren.
2. Pastikan semua halaman hanya menampilkan PP Al-Hikmah Malang.
3. Bandingkan Hasil Assessment antarperiode dan buka detail dimensi.
4. Buka Gedung & Denah, periksa sumber unggahan dan versi setiap lantai.
5. Pilih gedung tanpa denah dan pastikan Daftar Area tetap tersedia.
6. Buka Peta Bahaya & Risiko; bandingkan Daftar Area, Denah Bangunan, dan Daftar Temuan.
7. Pilih temuan dan bedakan Tingkat Risiko dari Status Pekerjaan.
8. Periksa assessment, indikator, asesor, bukti, serta versi denah sumber.
9. Buka rekomendasi/tindak lanjut terkait langsung dari detail temuan.
10. Perbarui Tindak Lanjut, tambahkan bukti, dan ajukan verifikasi.
11. Buka Laporan dan pratinjau ringkasan pimpinan.

Hasil yang diharapkan: temuan dapat ditelusuri dari lokasi dan indikator hingga rekomendasi, tindakan, bukti, serta laporan.

Untuk menunjukkan sumber titik bahaya, login kembali sebagai Asesor, buka assessment Draft, pilih indikator fisik, tentukan lokasi observasi, lalu simulasikan penempatan titik pada denah. Pilih area tanpa denah untuk menunjukkan bahwa koordinat bersifat opsional.

## 5. State dan akses

1. Gunakan pencarian acak untuk menampilkan Empty state.
2. Buka notifikasi pada setiap peran dan pastikan targetnya sesuai ruang kerja.
3. Periksa label Data Dummy/Ilustrasi pada konfigurasi dan skor.
4. Periksa keyboard Tab, fokus tombol/form, tampilan tablet, dan tampilan ponsel.
5. Saat backend dipasang, uji Loading, Error, Forbidden, Conflict, Locked, dan Success menggunakan respons API terkontrol.
