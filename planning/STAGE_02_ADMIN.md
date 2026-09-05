# Stage 02 — Ruang Kerja Admin

**Status:** DONE

**Tujuan:** memvalidasi kebutuhan pengelolaan sistem tanpa mencampurkannya dengan ilmu/instrumen.

## Fitur

- Dashboard kesehatan sistem dan aktivitas penting.
- Pengguna dan status akun.
- Direktori pesantren.
- Matriks peran dan hak akses.
- Audit log.
- Pengaturan sistem non-ilmiah.

## Acceptance Criteria

- [x] Admin dapat memahami siapa yang memiliki akses ke data apa.
- [x] Aksi berisiko memiliki konfirmasi dan jejak audit.
- [x] Pengaturan sistem tidak dapat mengubah instrumen yang telah dipublikasikan.
- [x] Daftar pengguna dan pesantren mudah dicari dan difilter.

## Hasil Implementasi

- Halaman Pengguna memiliki pencarian, filter peran, status akun, dan formulir tambah pengguna dummy.
- Direktori Pesantren memiliki pencarian, filter status, pengelola utama, dan status assessment.
- Hak Akses menggunakan matriks empat peran serta menjelaskan pembatasan lingkup data.
- Audit Log bersifat hanya-baca dan dapat difilter menurut kategori.
- Pengaturan hanya memuat konfigurasi non-ilmiah dan memberikan konfirmasi untuk tindakan berisiko.
- Lint dan production build berhasil.
- Stage 02 disetujui pada 5 September 2026 setelah perbaikan alignment matriks Hak Akses.
