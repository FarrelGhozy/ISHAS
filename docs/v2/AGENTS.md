# Aturan Kerja Proyek ISHAS V2 (Frontend-Only)

Dokumen ini adalah aturan tetap untuk setiap pengerjaan V2, baik oleh manusia maupun agen AI.
Dibaca BERSAMA `README.md` (visi + istilah baku) sebelum menyentuh file apa pun.

## 0. Batas kerja saat ini — arahan pemilik 8 September 2026

- Hanya validasi, diskusi, dan penyempurnaan rencana di `docs/v2/`.
- Jangan membuat/mengubah kode, menghapus fitur V1, menjalankan migrasi, atau menyinkronkan dokumen di luar `docs/v2/` pada tahap ini.
- V2-00 adalah stage dokumentasi aktif; seluruh stage pembangunan tetap `BACKLOG`.
- Jika menemukan keputusan produk yang ambigu, tanyakan langsung kepada pemilik. Tunggu jawabannya sebelum melanjutkan bagian yang bergantung pada keputusan itu; jangan memilih default diam-diam.
- Boleh melanjutkan pemeriksaan referensi dan koreksi dokumentasi yang tidak bergantung pada jawaban. Catat usulan sebagai usulan di `DECISIONS.md` atau `SUGGESTIONS.md`.
- Persetujuan revisi dokumen tidak otomatis mengaktifkan pekerjaan kode.

## 1. Sumber kebenaran (urutan prioritas bila bertentangan)

Arahan langsung pemilik mengatasi rancangan yang lebih lama. Sumber ilmiah di `docs/source/`
tetap menjadi acuan keilmuan; dokumen V2 tidak boleh mengubah asumsi prototipe menjadi rumus resmi.

1. `docs/v2/README.md` + keputusan yang benar-benar disetujui di `docs/v2/DECISIONS.md` — fase kerja, visi, istilah, dan batas. Pertanyaan terbuka bukan keputusan.
2. `docs/v2/planning/STAGE_V2_XX_*.md` yang berstatus `IN PROGRESS` — hanya stage itu yang boleh dikerjakan.
3. `docs/v2/ROLES.md`, `ROUTES.md`, `FLOWS.md`, `DATA_MODEL.md`, `WIREFRAMES.md`, `DESIGN_SYSTEM.md` — spesifikasi rinci.
4. `docs/v2/TEST_PLAN.md` — cara memverifikasi.
5. `docs/v2/MIGRATION_FROM_V1.md` — saat menyentuh kode warisan V1.
6. `docs/v2/SUGGESTIONS.md` — DILARANG dijadikan dasar pengerjaan tanpa persetujuan eksplisit pemilik proyek.

## 2. Istilah baku (pelanggaran = revisi)

Pakai persis: `Super Admin`, `Pengelola Pesantren (mitra)` / singkat `Pengelola Pesantren`,
`Peneliti`, `Publik / Pelapor`, `Pesantren terdaftar`, `Menunggu validasi`, `Pending`, `Proses`,
`Completed`, `Ditolak`, `Diterima`, `Tinggi/Sedang/Rendah`, `Belum ditentukan`.
DILARANG memakai kata: asesor, penugasan, Assessment Saya, "empat peran", "finalisasi" (untuk laporan;
kata gantinya: "kirim untuk validasi").
Larangan ini berlaku pada alur produk aktif. Penyebutan historis di audit rencana, tabel migrasi,
komentar transisi, pengujian route lama, dan pesan penghentian `/asesor/*` diperlukan dan diperbolehkan.

## 3. Alur kerja per stage

1. Baca `docs/v2/planning/README.md`, file stage `IN PROGRESS`, dan `docs/v2/TODO.md`.
2. Kerjakan HANYA checklist dalam stage aktif. Satu stage utama dalam satu waktu.
3. Perbarui checklist + `TODO.md` selama bekerja (centang yang selesai, tambah temuan sebagai sub-tugas baru — jangan hapus item).
4. Untuk V2-00, periksa konsistensi dokumen, tautan, dan batas perubahan sesuai `TEST_PLAN.md` §0. Uji desktop 1440×900, tablet 834×1112, ponsel 390×844, alur tanpa login + 3 peran, lint, TypeScript, test, dan build baru berlaku saat implementasi diizinkan.
5. Isi bagian `Hasil Pemeriksaan` di file stage, pindahkan ke `REVIEW`.
6. Stage menjadi `DONE` hanya setelah disetujui pemilik proyek/dosen.

## 4. Aturan produk dan UX (tidak boleh dilanggar)

- `/` publik tanpa login; tanpa redirect; sesi login tidak mengubah isi `/`.
- Laporan `Menunggu validasi`/`Ditolak` TIDAK PERNAH tampil di dashboard/hasil/peta/rekomendasi/laporan.
- Severity/priority hanya diisi pengelola saat Terima (tanpa default). Tolak wajib alasan min 10 karakter.
- Nama pelapor selalu dicatat; otomatis bila login sebagai pengelola, manual bila tanpa login. Hak akun lain mengikuti keputusan D-03, keterbukaan nama mengikuti D-02.
- Semua angka/skor memakai label kategori + periode + versi instrumen + status data.
- Status selalu label teks + ikon (lihat `DESIGN_SYSTEM.md` §2). Dilarang mengandalkan warna saja.
- Bahasa Indonesia ringkas; copy `WIREFRAMES.md` masih bahan review. Jangan menganggap kata FINAL pada rancangan lama sebagai larangan mendiskusikan perbaikan.
- Warna memakai hex persis `DESIGN_SYSTEM.md` §1. Dilarang menambah warna merek baru.

## 5. Aturan arsitektur frontend

- Route URL adalah sumber kebenaran halaman aktif; satu shared shell workspace + satu shell publik ringan.
- Sesi login dummy di shared store (sessionStorage); draft laporan di localStorage terpisah; keduanya dipulihkan diam-diam saat refresh.
- Guard memeriksa direct URL per matriks `ROUTES.md` §3; bukan pengganti otorisasi backend.
- Data domain dummy HANYA di `mocks/` (seed, store, adapter, processor). Komponen halaman dilarang mendefinisikan ulang array data domain.
- Semua relasi memakai ID stabil (`DATA_MODEL.md` §2). Label tampilan bukan kunci.
- State lokal hanya untuk interaksi sementara (modal, filter, input belum disimpan).
- Mock store berversi (`ishas-mock-v4` / version `4`); data versi lama di-reset, bukan dimigrasi parsial.
- Gunakan komponen `components/ui/` yang ada sebelum membuat primitive baru.
- Pertahankan `app/` sebagai root App Router. Dilarang pindah ke `src/`.

## 6. Git dan identitas

- Ikuti identitas Git pemilik repository yang sudah dikonfigurasi. Dilarang menambah atribusi AI/`Co-authored-by`.
- Commit kecil dan jelas dengan format Conventional Commits, contoh: `docs(v2): ...`, `feat(publik): ...`, `feat(validasi): ...`, `chore(mock): ...`.
- Dilarang push tanpa permintaan/persetujuan eksplisit pemilik repository.
- Dilarang memasukkan file tak terkait ke commit.
