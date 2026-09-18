# Planning Pembangunan — Local Issue Management

Cakupan: rencana lengkap ada di folder dokumen ini; ISHAS adalah aplikasi
(React Router, folder per fitur, bun 1.4 — D-01, dijawab 8 September 2026).
Stage diaktifkan satu per satu sesuai aturan `AGENTS.md` §3.
Aturan kerja: `AGENTS.md`. Status harian: `../docs/TODO.md`. Verifikasi: `../docs/TEST_PLAN.md`.

## Revisi utama terkini — 18 September 2026

[STAGE_DASHBOARD_POLISH.md](STAGE_DASHBOARD_POLISH.md) adalah revisi utama untuk REVIEW
atas arahan pemilik: responsivitas, visualisasi, dokumentasi/alur data, dan status,
dengan tema/warna tetap. Tabel stage mencatat kematangan pekerjaan sebelumnya;
IN PROGRESS pada Stage 00/07/08/09 menandakan pekerjaan atau verifikasi belum
lengkap, bukan izin mengerjakan semuanya sekaligus. Tidak ada stage DONE yang
baru ditetapkan tanpa persetujuan. Rincian pemeriksaan yang belum dilakukan tetap
pada checklist masing-masing stage.

## Status

Arahan tambahan 18 September: [bukti gambar Pelaporan](STAGE_REPORT_EVIDENCE.md),
revisi terbatas unggah lokal dan pemeriksaan internal pada `/lapor`.

Revisi terdahulu atas arahan langsung 18 September: [Risk Map](STAGE_RISK_MAP.md),
frontend untuk REVIEW. Status historis stage pada tabel berikut tidak diubah
sepihak oleh revisi lintas fitur ini.

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
| Stage 04 | Halaman baca publik (hasil, peta, rekomendasi, tindak lanjut, laporan) | REVIEW |
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

## Revisi lintas fitur

| Revisi | Status | Bukti / batas |
|---|---|---|
| Dashboard polish | REVIEW | 106 test, lint/typecheck/build dan browser responsif; belum persetujuan DONE |
| Risk Map | REVIEW | Pemeriksaan pada STAGE_RISK_MAP.md; titik opsional |
| Bukti gambar Pelaporan | IN PROGRESS | Kode/test tersedia; uji browser unggah/refresh/pengelola belum lengkap |

Stage 03 kini REVIEW berdasarkan hasil review ulang yang sudah tercatat; Stage 04
REVIEW mengikuti file stage dan hasil historis. Stage 07–09 tidak dinaikkan hanya
karena kode tersedia. Revisi dashboard tidak menandai rilis semua stage selesai.
