# Planning Pembangunan — Local Issue Management

Cakupan: rencana lengkap ada di folder dokumen ini; ISHAS adalah aplikasi
(React Router, folder per fitur, bun 1.4 — D-01, dijawab 8 September 2026).
Stage diaktifkan satu per satu sesuai aturan `AGENTS.md` §3.
Aturan kerja: `AGENTS.md`. Status harian: `../TODO.md`. Verifikasi: `../TEST_PLAN.md`.

## Status

- `BACKLOG`: belum dijadwalkan.
- `READY`: kebutuhan jelas, siap dikerjakan.
- `IN PROGRESS`: sedang dikerjakan; hanya satu stage utama dalam satu waktu.
- `REVIEW`: luaran stage selesai diperiksa, menunggu evaluasi pemilik proyek/dosen; pada Stage 00 luarannya dokumen, bukan implementasi.
- `DONE`: disetujui.
- `BLOCKED`: tidak dapat lanjut tanpa keputusan/data.

## Urutan stage (wajib berurutan kecuali dinyatakan lain)

| Stage | Fokus | Status |
|---|---|---|
| Stage 00 | Validasi rencana, konflik dokumen, dan keputusan terbuka | IN PROGRESS |
| Stage 01 | Fondasi aplikasi ISHAS: scaffold, schema v4, login 3 peran, `/` publik | REVIEW |
| Stage 02 | Shell publik + dashboard agregat + pemilih pesantren | REVIEW |
| Stage 03 | Laporan cepat `/lapor` (tanpa login + login pengelola) | REVIEW |
| Stage 04 | Halaman baca publik (hasil, peta, rekomendasi, tindak lanjut, laporan) | IN PROGRESS |
| Stage 05 | Antrean validasi pengelola (terima/tolak + severity/priority) | REVIEW |
| Stage 06 | Lifecycle Pending/Proses/Completed + arsip completed + audit | REVIEW |
| Stage 07 | Lokasi (gedung/area/denah) + tindak lanjut kelola + laporan pengelola | IN PROGRESS |
| Stage 08 | Penilaian mandiri (tanpa penugasan + kirim validasi) | IN PROGRESS |
| Stage 09 | Admin (pesantren + akun pengelola) + sinkron dokumen + rilis REVIEW | IN PROGRESS |

## Cara menggunakan

1. Selesaikan pembahasan Stage 00 terlebih dahulu. Aktifkan Stage 01 hanya dengan arahan eksplisit pemilik untuk mulai kode (arahan "buat frontend" 8 September 2026 memenuhi syarat ini setelah lokasi folder aplikasi dikonfirmasi).
2. Kerjakan hanya checklist stage itu; catat keputusan yang memengaruhi fitur/data di file stage.
3. Sinkronkan ke `docs/TODO.md` setiap ada progres.
4. Jalankan `TEST_PLAN.md` yang relevan; isi `Hasil Pemeriksaan`; pindahkan ke `REVIEW`.
5. `DONE` hanya setelah persetujuan pemilik proyek/dosen; lalu aktifkan stage berikutnya.

Ketergantungan yang masih harus ditinjau: hak dan model data Peneliti perlu dipetakan sebelum
fondasi dianggap lengkap; lokasi awal diperlukan sebelum demo lapor; uji kirim–validasi lintas
halaman baru lengkap ketika Stage 05 tersedia. Rincian ada di `../docs/VALIDATION_REVIEW.md`.
