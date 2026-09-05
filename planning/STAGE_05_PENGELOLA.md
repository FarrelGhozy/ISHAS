# Stage 05 — Ruang Kerja Pengelola Pesantren

**Status:** REVIEW

**Tujuan:** membuat hasil assessment mudah dipahami dan ditindaklanjuti oleh pesantren.

## Fitur

- Ringkasan K3L pesantren.
- Hasil per dimensi dan per periode.
- Peta risiko berbasis area/lokasi, bukan peta geografis pada tahap awal.
- Rekomendasi prioritas.
- Rencana tindak lanjut, bukti penyelesaian, dan verifikasi.
- Laporan yang siap dibaca pimpinan.

## Acceptance Criteria

- [x] Pengelola hanya melihat data pesantrennya.
- [x] Temuan prioritas menjelaskan lokasi, tingkat risiko, dan tindakan.
- [x] Tampilan membedakan rekomendasi, pekerjaan berjalan, dan pekerjaan terverifikasi.
- [x] Perubahan hasil antarperiode mudah dibandingkan.

## Hasil Implementasi

- Seluruh halaman menampilkan lingkup akun PP Al-Hikmah Malang dan tidak menyediakan pemilih pesantren lain.
- Hasil Assessment menampilkan nilai ilustrasi, kategori, status Final, versi instrumen, hasil per dimensi, temuan, dan perbandingan tiga periode.
- Peta Risiko menggunakan denah area internal dua dimensi, pilihan lantai, marker bernomor, label tingkat risiko, detail indikator, temuan, rekomendasi, dan status tindak lanjut.
- Rekomendasi Prioritas memiliki filter prioritas/status, sumber assessment, penanggung jawab, tenggat, progress, dan simulasi pembuatan rencana tindakan.
- Tindak Lanjut membedakan pekerjaan Berjalan, Menunggu Verifikasi, dan Terverifikasi serta mendukung catatan progres dan bukti penyelesaian dummy.
- Laporan memiliki pratinjau ringkasan pimpinan, ringkasan dimensi, status tindak lanjut, metadata versi instrumen, riwayat, dan simulasi ekspor PDF/Excel.
- Angka indeks, kategori, threshold, pertanyaan, dan rekomendasi tetap ditandai sebagai data ilustrasi, bukan keputusan ilmiah final.
- Lint dan production build berhasil.
