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
- [x] Peneliti dapat menambah dan memilih dimensi pada versi Draft.
- [x] Peneliti dapat menambah dan memilih indikator pada setiap dimensi.
- [x] Form indikator mencakup pertanyaan, jenis jawaban, bobot, kewajiban bukti, referensi, rubric, dan pemicu rekomendasi.
- [x] Perubahan form memiliki status belum tersimpan serta dapat disimpan sebagai Draft.
- [x] Versi Published hanya dapat dilihat dan tidak dapat diedit langsung.
- [x] Validasi menampilkan masalah kelengkapan sebelum instrumen dapat dipublikasikan.

## Hasil Implementasi

- Instrumen menampilkan pilihan versi, status, struktur dimensi, indikator, bobot dummy, sumber, dan kelengkapan.
- Versioning memperlihatkan hubungan draft, published, arsip, penggunaan assessment, serta pembuatan versi baru.
- Konfigurasi Scoring mensimulasikan bobot dimensi, rubric, bukti wajib, dan pemicu rekomendasi dengan label asumsi prototipe.
- Validasi & Publikasi memiliki checklist kesiapan dan konfirmasi sebelum versi dikunci.
- Data Penelitian memiliki pencarian, filter periode, status verifikasi, jejak versi instrumen, dan simulasi ekspor.
- Lint dan production build berhasil.

## Revisi Aktif

Stage dibuka kembali setelah evaluasi karena halaman sebelumnya baru memberi gambaran struktur, belum menyediakan alur input instrumen yang cukup nyata untuk memvalidasi kebutuhan Peneliti.

## Hasil Revisi

- Instrument Builder menggunakan tiga area kerja yang memperjelas urutan dimensi, indikator, dan detail input.
- Form indikator mendukung jenis jawaban, bobot, wajib jawab, opsi N/A, kewajiban bukti, rubrik, sumber, dan aturan rekomendasi dummy.
- Peneliti dapat menambah dimensi/indikator, mengubah data lokal, melihat status perubahan, menyimpan draft, serta menjalankan pemeriksaan kelengkapan.
- Versioning memiliki form pembuatan draft baru dari snapshot versi induk.
- Konfigurasi scoring memiliki rubric dan aturan rekomendasi yang dapat diedit.
- Dataset penelitian dapat dibuka untuk melihat metadata versi, status verifikasi, dan batasan ekspor.
- Lint dan production build berhasil setelah revisi.
