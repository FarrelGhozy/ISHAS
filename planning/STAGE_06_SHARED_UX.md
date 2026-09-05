# Stage 06 — Penyelarasan Lintas Peran

**Status:** REVIEW

**Tujuan:** menyatukan kualitas pengalaman, aksesibilitas, responsivitas, dan kesiapan presentasi.

## Fitur

- Konsistensi komponen dan bahasa.
- Empty, loading, error, forbidden, dan success state.
- Aksesibilitas keyboard, kontras, serta label form.
- Pengujian desktop dan mobile.
- Skenario demo ujung-ke-ujung lintas empat peran.
- Kontrak data mock sebagai dasar API backend.

## Acceptance Criteria

- [x] Seluruh menu empat peran membuka halaman yang memiliki isi dan aksi utama.
- [x] Tombol aksi utama tidak berhenti sebagai elemen dekoratif tanpa umpan balik.
- [x] Empty, loading, error, forbidden, dan success state tersedia sebagai pola bersama.
- [x] Form utama memiliki label, validasi, status disabled, dan umpan balik yang jelas.
- [x] Hak akses, versioning, finalisasi, bukti, hasil, dan tindak lanjut memiliki kontrak data untuk backend.
- [x] Daftar kebutuhan endpoint dan keputusan backend yang masih terbuka terdokumentasi.
- [x] Lint dan production build berhasil.

## Hasil Implementasi

- Menu empat peran diaudit dan aksi pasif utama dilengkapi dengan dialog, navigasi, atau feedback dummy.
- Notifikasi kontekstual per peran dapat membuka halaman terkait.
- Pola state bersama tersedia untuk loading, empty, error, forbidden, dan success; Published/Finalized tetap hanya-baca.
- Halaman per peran dimuat terpisah agar bundle awal lebih ringan dan memiliki loading state.
- Fokus keyboard, skip link, reduce motion, label form, disabled state, dan layout responsif diselaraskan.
- Import Excel/CSV, sumber data kuesioner/observasi/dokumen/insiden, serta batas fitur sensor opsional dipetakan dari proposal.
- Kontrak TypeScript mencakup sesi, role/scope, user, lembaga, instrumen, dataset/import, assessment, sumber input, bukti, hasil, risk map, rekomendasi, tindak lanjut, laporan, audit, dan notifikasi.
- Matriks cakupan fitur, skenario demo, endpoint minimum, aturan immutable, serta keputusan ilmiah/backend yang masih terbuka telah didokumentasikan.
- Formatter, lint, pemeriksaan TypeScript, dan production build berhasil.

**Keputusan yang dibutuhkan:** tinjau alur lintas empat peran dan matriks cakupan fitur. Stage 06 dapat dipindahkan ke `DONE` setelah prototipe diterima sebagai dasar presentasi/approval dosen.
