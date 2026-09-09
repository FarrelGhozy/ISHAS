# Planning Pembangunan V2 — Local Issue Management

Cakupan aktif: diskusi dan validasi rencana di `docs/v2/`, tanpa pembuatan kode.
V2-01–V2-09 adalah calon tahap pembangunan dan belum boleh dieksekusi.
Aturan kerja: `docs/v2/AGENTS.md`. Status harian: `docs/v2/TODO.md`. Verifikasi: `docs/v2/TEST_PLAN.md`.

## Status

- `BACKLOG`: belum dijadwalkan.
- `READY`: kebutuhan jelas, siap dikerjakan.
- `IN PROGRESS`: sedang dikerjakan; hanya satu stage utama dalam satu waktu.
- `REVIEW`: luaran stage selesai diperiksa, menunggu evaluasi pemilik proyek/dosen; pada V2-00 luarannya dokumen, bukan implementasi.
- `DONE`: disetujui.
- `BLOCKED`: tidak dapat lanjut tanpa keputusan/data.

## Urutan stage (wajib berurutan kecuali dinyatakan lain)

| Stage | Fokus | Status |
|---|---|---|
| V2-00 | Validasi rencana, konflik dokumen, dan keputusan terbuka | IN PROGRESS |
| V2-01 | Fondasi data (schema v4 + seed), hapus asesor, arsip landing, `/` publik | BACKLOG |
| V2-02 | Shell publik + dashboard agregat + pemilih pesantren | BACKLOG |
| V2-03 | Laporan cepat `/lapor` (anonim + login) | BACKLOG |
| V2-04 | Halaman baca publik (hasil, peta, rekomendasi, tindak lanjut, laporan) | BACKLOG |
| V2-05 | Antrean validasi pengelola (terima/tolak + severity/priority) | BACKLOG |
| V2-06 | Lifecycle Pending/Proses/Completed + hapus completed + audit | BACKLOG |
| V2-07 | Lokasi (gedung/area/denah) + tindak lanjut kelola + laporan pengelola | BACKLOG |
| V2-08 | Penilaian mandiri (pindahan AssessmentFlow + kirim validasi) | BACKLOG |
| V2-09 | Admin (pesantren + akun pengelola) + sinkron dokumen + rilis REVIEW | BACKLOG |

## Cara menggunakan

1. Selesaikan pembahasan V2-00 terlebih dahulu. Jangan mengaktifkan V2-01 hanya karena dokumen sudah dibaca atau direvisi; perlu arahan pemilik untuk mulai kode.
2. Kerjakan hanya checklist stage itu; catat keputusan yang memengaruhi fitur/data di file stage.
3. Sinkronkan ke `docs/v2/TODO.md` setiap ada progres.
4. Jalankan `TEST_PLAN.md` yang relevan; isi `Hasil Pemeriksaan`; pindahkan ke `REVIEW`.
5. `DONE` hanya setelah persetujuan pemilik proyek/dosen; lalu aktifkan stage berikutnya.

Ketergantungan yang masih harus ditinjau: hak dan model data Peneliti perlu dipetakan sebelum
fondasi dianggap lengkap; lokasi awal diperlukan sebelum demo lapor; uji kirim–validasi lintas
halaman baru lengkap ketika V2-05 tersedia. Rincian ada di `../VALIDATION_REVIEW.md`.
