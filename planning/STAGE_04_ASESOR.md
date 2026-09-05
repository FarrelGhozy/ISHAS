# Stage 04 — Ruang Kerja Asesor

**Status:** DONE

**Tujuan:** memvalidasi alur assessment lapangan yang terstruktur, ringan, dan dapat diaudit.

## Fitur

- Daftar penugasan dan status assessment.
- Verifikasi data awal pesantren.
- Form assessment per dimensi dan indikator.
- Bukti lapangan, catatan, dan status kelengkapan.
- Simpan draft, validasi, finalisasi, dan riwayat.

## Acceptance Criteria

- [x] Asesor hanya melihat penugasan yang menjadi lingkupnya.
- [x] Progress dan indikator belum lengkap selalu terlihat.
- [x] Bukti wajib divalidasi sebelum finalisasi.
- [x] Assessment final terkunci dan terhubung ke versi instrumen.

## Hasil Implementasi

- Dashboard menampilkan lingkup akun Asesor, prioritas penugasan, progress draft, bukti belum lengkap, dan checklist lapangan.
- Assessment Saya memiliki pencarian, filter status, detail pesantren, tanggal, periode, kontak, serta versi instrumen yang digunakan.
- Assessment Baru mewajibkan pemilihan penugasan dan verifikasi identitas pesantren, kontak, periode, serta versi Published.
- Form assessment menampilkan navigasi dimensi, indikator, opsi jawaban, catatan observasi, sumber instrumen, dan unggah bukti lokal.
- Progress jawaban, jawaban wajib, bukti wajib, dan catatan untuk jawaban N/A diperiksa sebelum finalisasi.
- Simpan Draft memberikan umpan balik lokal; finalisasi memiliki ringkasan dan konfirmasi penguncian.
- Bukti Lapangan memiliki filter kelengkapan dan simulasi penambahan foto/dokumen per indikator.
- Riwayat hanya menampilkan assessment milik Asesor aktif dan mempertahankan metadata versi instrumen.
- Seluruh angka, pertanyaan, rubric, dan berkas merupakan data dummy; workflow approval lanjutan masih menunggu keputusan tim.
- Lint dan production build berhasil.
