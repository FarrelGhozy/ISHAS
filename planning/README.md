# Planning dan Local Issue Management

Folder ini menggantikan GitHub Issues selama tahap eksplorasi frontend. Satu file stage mewakili satu kelompok pekerjaan yang dapat ditinjau secara mandiri.

## Status

- `BACKLOG`: belum dijadwalkan.
- `READY`: kebutuhan cukup jelas dan siap dikerjakan.
- `IN PROGRESS`: sedang dikerjakan; hanya satu stage utama pada satu waktu.
- `REVIEW`: implementasi selesai dan menunggu evaluasi pemilik proyek/dosen.
- `DONE`: sudah disetujui.
- `BLOCKED`: tidak dapat dilanjutkan tanpa keputusan atau data tambahan.

## Urutan Stage

| Stage | Fokus | Status |
| --- | --- | --- |
| 01 | Fondasi produk, login dummy, dan pembagian empat ruang kerja | DONE |
| 02 | Ruang kerja Admin | DONE |
| 03 | Ruang kerja Peneliti | DONE |
| 04 | Ruang kerja Asesor | DONE |
| 05 | Ruang kerja Pengelola Pesantren | DONE |
| 06 | Penyelarasan lintas peran, aksesibilitas, dan presentasi | REVIEW |

## Cara Menggunakan

1. Pilih satu stage berstatus `READY` dan ubah menjadi `IN PROGRESS`.
2. Catat keputusan yang memengaruhi fitur atau data di file stage.
3. Sinkronkan pekerjaan harian ke `TODO.md` di root.
4. Setelah acceptance criteria terpenuhi dan pemeriksaan teknis lolos, ubah menjadi `REVIEW`.
5. Setelah mendapat persetujuan, ubah menjadi `DONE` dan aktifkan stage berikutnya.

GitHub Issues belum wajib. File lokal ini cukup untuk fase prototipe; migrasi ke GitHub Issues baru berguna ketika kolaborator, diskusi, atau pelacakan daring mulai dibutuhkan.
