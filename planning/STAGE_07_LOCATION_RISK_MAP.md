# Stage 07 — Manajemen Lokasi, Denah, dan Peta Bahaya

**Status:** REVIEW

**Tujuan:** menghilangkan ambiguitas sumber denah dan alur data bahaya dengan memisahkan master lokasi, temuan asesor, penilaian risiko, dan tindak lanjut.

## Keputusan Produk

- Denah berasal dari unggahan Pengelola Pesantren untuk pondok, gedung, dan lantai terkait; bukan dibuat otomatis oleh sistem.
- Setiap pondok tetap dapat memakai sistem tanpa denah melalui tampilan Daftar Area.
- Pengelola mengelola master gedung/lantai/area; Asesor memilih area dan mencatat titik temuan saat assessment.
- Denah dan koordinat temuan memiliki versi agar assessment historis tetap dapat ditelusuri.
- Tingkat risiko berasal dari konfigurasi instrumen/engine backend, bukan warna atau posisi pada denah.
- Peta memisahkan tingkat risiko dari status tindak lanjut.

## Fitur

- Master gedung, lantai, area, status denah, dan simulasi unggah denah per lantai.
- Tampilan Peta Bahaya & Risiko: Daftar Area, Denah Bangunan, dan Daftar Temuan.
- Filter gedung, lantai, tingkat risiko, serta status tindak lanjut.
- Detail temuan berisi sumber assessment/indikator, bukti, bahaya, dampak, kemungkinan, keparahan, paparan, pengendalian, rekomendasi, dan status pekerjaan.
- Pemilihan lokasi observasi pada form assessment Asesor.
- Kontrak data dan endpoint untuk master lokasi, versi denah, koordinat relatif, penilaian risiko, serta residual risk.

## Acceptance Criteria

- [x] Sumber denah dan pemilik datanya dijelaskan di UI.
- [x] Pondok tanpa denah tetap dapat memakai Daftar Area.
- [x] Pengelola dapat mensimulasikan tambah gedung dan unggah denah.
- [x] Asesor dapat memilih gedung/lantai/area pada indikator assessment.
- [x] Peta hanya menampilkan temuan bahaya, bukan lokasi aman sebagai titik hijau.
- [x] Risiko dan status tindak lanjut ditampilkan sebagai dua atribut berbeda.
- [x] Klik temuan membuka detail dan tindak lanjut yang terkait.
- [x] Versi denah, assessment, instrumen, dan sumber bukti dapat ditelusuri.
- [x] Kontrak backend dan dokumentasi integrasi diperbarui.
- [x] Lint, pemeriksaan TypeScript, production build, dan respons server lokal berhasil.

## Hasil Implementasi

- Pengelola Pesantren memiliki halaman `Gedung & Denah` untuk mengelola struktur gedung, lantai, area, serta versi denah.
- `Peta Bahaya & Risiko` memiliki tiga sudut pandang: Daftar Area, Denah Bangunan, dan Daftar Temuan.
- Asesor menetapkan sumber lokasi saat mengisi indikator; titik pada denah bersifat opsional jika denah tersedia.
- Peneliti dapat menentukan apakah lokasi observasi wajib untuk suatu indikator.
- Temuan dapat ditelusuri sampai assessment, versi instrumen, bukti, versi denah, rekomendasi, dan tindak lanjut yang tepat.
- Aplikasi tetap berjalan tanpa denah dan tidak memiliki ketergantungan GIS pada fase prototipe.

## Permintaan Review

Tinjau alur Pengelola Pesantren dari `Gedung & Denah` ke `Peta Bahaya & Risiko`, lalu periksa pengambilan lokasi melalui form assessment Asesor. Rumus risiko ilmiah dan pihak yang memverifikasi denah tetap menunggu keputusan sebelum backend dibuat.
