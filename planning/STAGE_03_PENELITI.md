# Stage 03 — Ruang Kerja Peneliti

**Status:** REVIEW

**Tujuan:** memvalidasi pengelolaan ilmu, instrumen, versi, scoring, dan proses publikasi.

## Fitur

- Dashboard instrumen dan status validasi.
- Daftar versi instrumen.
- Instrument builder per dimensi dan indikator.
- Konfigurasi bobot, rubric, serta rekomendasi.
- Alur draft, validasi, publish, dan arsip.
- Data penelitian dan ekspor yang diizinkan.

## Acceptance Criteria

- [x] Versi draft dan published dapat dibedakan dengan jelas.
- [x] Versi published terkunci dan perubahan selalu membuat versi baru.
- [x] Bobot, rubric, bukti wajib, dan rekomendasi dapat ditelusuri.
- [x] Asumsi dummy tidak ditampilkan sebagai keputusan ilmiah final.

## Hasil Implementasi

- Instrumen menampilkan pilihan versi, status, struktur dimensi, indikator, bobot dummy, sumber, dan kelengkapan.
- Versioning memperlihatkan hubungan draft, published, arsip, penggunaan assessment, serta pembuatan versi baru.
- Konfigurasi Scoring mensimulasikan bobot dimensi, rubric, bukti wajib, dan pemicu rekomendasi dengan label asumsi prototipe.
- Validasi & Publikasi memiliki checklist kesiapan dan konfirmasi sebelum versi dikunci.
- Data Penelitian memiliki pencarian, filter periode, status verifikasi, jejak versi instrumen, dan simulasi ekspor.
- Lint dan production build berhasil.
