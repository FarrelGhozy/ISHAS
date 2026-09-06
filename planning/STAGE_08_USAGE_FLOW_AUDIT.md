# Stage 08 — Dokumentasi dan Audit Flow Penggunaan

**Status:** REVIEW

**Tujuan:** menyediakan satu panduan flow lintas peran dan mengidentifikasi sambungan fitur yang masih ambigu sebelum backend dikerjakan.

## Ruang Lingkup

- Flow utama ISHAS dari onboarding sampai laporan.
- Flow membuat pesantren, akun Pengelola, dan akun Asesor.
- Flow instrumen, lokasi/denah, penugasan, assessment, risk mapping, rekomendasi, dan tindak lanjut.
- Flow pendukung yang dikelompokkan per peran.
- Evaluasi perbedaan antara interaksi prototipe, data dummy, kontrak backend, dan keputusan yang masih terbuka.

## Acceptance Criteria

- [x] Fitur utama ditempatkan sebelum flow pendukung.
- [x] Sumber dan pengguna setiap data penting dijelaskan.
- [x] Flow gedung, lantai, area, denah, dan titik bahaya dijelaskan tanpa ketergantungan wajib pada denah.
- [x] Flow membuat akun Asesor dibedakan dari flow membuat penugasan.
- [x] Flow pendukung dikelompokkan per peran.
- [x] Flow utama ditulis ulang sebagai checklist di bagian akhir.
- [x] Kekurangan prototipe diberi prioritas dan rekomendasi tindak lanjut.
- [x] Dokumentasi tidak menganggap formula ilmiah atau pemeriksa yang belum disahkan sebagai keputusan final.

## Hasil Evaluasi Utama

1. Belum tersedia modul Manajemen Penugasan.
2. State data dummy masih terpisah antarperan.
3. Finalisasi assessment belum menghasilkan perubahan pada hasil, peta bahaya, dan rekomendasi.
4. Onboarding pesantren, render file denah, workflow reviewer, dan flow koreksi final belum lengkap.
5. Navigasi berbasis URL perlu ditetapkan sebelum integrasi backend.
6. Wadah grafik perlu diperbaiki agar tidak dihitung dengan ukuran negatif saat panel berubah.

## Permintaan Review

Tinjau `flow.md`, khususnya penetapan pihak pembuat penugasan, pihak pemeriksa tindak lanjut/denah, serta urutan perbaikan sebelum tahap implementasi berikutnya dimulai.

## Tindak Lanjut Audit

- Stage 09 menangani URL routing, shared workspace shell, sesi login dummy, dan guard akses tanpa mengubah data domain.
- Stage 10 menangani pemecahan komponen besar, shared mock repository/store, persistence data dummy, dan sambungan data lintas role.
- Manajemen Penugasan tetap memerlukan keputusan pemilik role, tetapi model datanya harus tersedia pada shared store agar alur dapat disambungkan setelah keputusan dibuat.
- Formula ilmiah, reviewer assessment, pemeriksa tindak lanjut, dan koreksi data final tetap berstatus keputusan terbuka.
