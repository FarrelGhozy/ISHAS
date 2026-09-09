# Stage V2-01 — Fondasi Aplikasi ISHAS (Scaffold, Data, Login, `/` Publik)

**Status:** REVIEW (luaran selesai diperiksa 8 September 2026; `DONE` menunggu persetujuan pemilik)
**Catatan review:** D-01–D-03 telah dijawab (8 September 2026): aplikasi terpisah bernama ISHAS,
React Router, folder per fitur, bun 1.4. Bagian terkait D-04, D-05, D-07, D-09 dan D-10
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya diselaraskan sebelum stage diaktifkan.
**Dependensi:** V2-00 disetujui, keputusan yang memengaruhi fondasi dijawab, dan pemilik secara
eksplisit meminta mulai pembangunan kode + lokasi folder aplikasi dikonfirmasi.
**Tujuan:** menyiapkan tanah tempat seluruh V2 berdiri: aplikasi ISHAS baru, model data baru,
login tiga peran, dan `/` merender dashboard publik.

## Prasyarat

- Baca `docs/v2/AGENTS.md`, `README.md`, `DATA_MODEL.md`; pola struktur meniru
  `~/Documents/02_Projek/HIBAH_INTERNAL` (app/ + features/ + shared/ + mocks/).
- V1 (aplikasi lama) TIDAK disentuh sama sekali; tidak ada arsip/pemindahan dari V1.

## Ruang lingkup (kerjakan semua, urut)

### 1. Scaffold aplikasi ISHAS

- [x] Buat aplikasi React Router (framework mode, Vite, TypeScript) di folder terkonfirmasi;
      jalankan dengan bun (`bun install`, `bun run dev`).
- [x] Pecah folder per area sejak awal: `app/routes/` (route file), `features/<area>/`
      (publik, validasi, admin, peneliti, auth), `shared/` (layout, components, auth, navigation),
      `mocks/` (seed, store, adapters, processors) — tidak ada file raksasa.
- [x] Token visual `DESIGN_SYSTEM.md` §1 (hex persis) dipasang sebagai style dasar
      (Tailwind v4 mengikuti pola rujukan — konfirmasi pemilik bila berbeda).

### 2. Mock schema v4 + seed V2

- [x] `mocks/store/state.ts`: `reports: Report[]` + `selfAssessmentDrafts: Record<string, SelfAssessmentDraft>`;
      `MOCK_SCHEMA_VERSION = 4`; `MOCK_STORAGE_KEY = 'ishas-mock-v4'`; key sesi/draft terpisah
      (usulan SUGGESTIONS §7).
- [x] `mocks/seed/laporan.ts`: seed minimum `DATA_MODEL.md` §5 — 3 pesantren Aktif
      (termasuk `PSN-0018`), 1 `Persiapan`, akun terkait, 2 `Menunggu validasi`
      (1 lapor-cepat + 1 penilaian-mandiri), 3+ `Diterima` (Pending/Proses/Completed),
      1 `Ditolak`, 1 instrumen Published + 6 indikator contoh, lokasi `PSN-0018`.
- [x] `mocks/store/mock-store.ts`: action kirim/terima/tolak/ubah-status/hapus versi stub
      yang konsisten (implementasi penuh di V2-03/05/06). Tindakan yang belum memenuhi aturan
      validasi/scope tidak diaktifkan sebagai jalur pintas perubahan status.
- [x] `mocks/store/selectors.ts`: `selectRegisteredInstitutions`, `selectValidatedReports`,
      `selectValidationQueue`, `selectReportsByInstitution`.
- [x] Tombol reset di Pengaturan Admin mengembalikan seed V2.

### 3. Akun + guard (dibangun tanpa asesor sejak awal)

- [x] `shared/auth/`: akun demo 3 peran (admin/peneliti/pengelola, data persis ROLES §2–4);
      sesi menunjuk ID akun, bukan role saja (prasyarat isolasi scope dua pengelola).
- [x] Guard workspace: tanpa sesi → `/login` (kembali ke URL tujuan); role salah → `/akses-ditolak`;
      scope diperiksa pada pembacaan data DAN aksi simpan berbasis ID.
- [x] Route `/lapor` + `/penilaian-mandiri`: dapat dibaca semua sesi; aksi kirim nonaktif
      untuk Super Admin/Peneliti dengan pesan keluar dari akun (D-03).
- [x] Route tidak dikenal → halaman tidak ditemukan yang ramah (bukan crash).

### 4. `/` publik

- [x] `/` merender dashboard publik sejak awal (versi sederhana boleh: header publik + pemilih +
      agregat dari selector baru; penyempurnaan visual di V2-02); tanpa landing, tanpa redirect.
- [x] Sesi login TIDAK mengubah isi `/`; header menampilkan tombol Masuk/Ruang kerja.

## Di luar ruang lingkup (dilarang di stage ini)

Penyimpanan snapshot jawaban/hasil, identitas sesi lengkap, serta pemetaan Peneliti
dirumuskan di fondasi bersama DATA_REQUIREMENTS; daftar field di atas belum kontrak lengkap.

- Form lapor, antrean validasi, lifecycle penuh, self-assessment, halaman baca publik (V2-02…V2-08).
- Rumus/skor, rename `/pengelola` → `/pesantren`.

## Acceptance criteria

- [x] `bun run dev` + `bun run build` lulus; lint/typecheck terpasang dan hijau.
- [x] Reset demo menghasilkan seed §5 persis (hitung: 3 Aktif + 1 Persiapan + antrean 2 + arsip 1).
- [x] `/` tanpa login menampilkan dashboard (versi awal) tanpa redirect; dengan login isi sama + tombol ruang kerja.
- [x] `/login` tepat 3 kartu; tidak ada asesor di mana pun (grep bersih).
- [x] Guard workspace berjalan sesuai ROUTES §3 (TEST_PLAN §1 baris 1–2, 8–11).

## Hasil Pemeriksaan

- Tanggal: 8 September 2026. Semua pemeriksaan dijalankan pada aplikasi `ishas/` (subfolder dokumen, D-01).
- Teknis: `bun run lint` (oxlint) hijau, `tsc --noEmit` hijau, `bun test` 8/8 lulus (selector + aturan aksi),
  `bun run build` (SPA mode) hijau. Grep `asesor|assessor|assignment` bersih di kode aktif
  (satu-satunya penyebutan: halaman pesan penghentian `/asesor/*`, yang memang diwajibkan).
- Route (smoke browser, chromium headless): `/` tanpa login = dashboard + pemilih (hanya 2 pesantren
  terdaftar — PSN-0020 Aktif tanpa pengelola tidak muncul, sesuai DATA_REQUIREMENTS §8 opsi a);
  `/lapor`, `/penilaian-mandiri`, `/pesantren/PSN-0018`, `/pesantren/XXX` (empty state, bukan crash),
  `/asesor/*` (pesan penghentian), route tak dikenal (halaman ramah) — semua tanpa error konsol.
- Guard/sesi: anonim buka `/admin/*`,`/pengelola/*` → redirect `/login`; login pengelola mendarat di
  `/pengelola/validasi-laporan` sesuai ROUTES §5; pengelola membuka `/admin/*` → `/akses-ditolak`;
  admin membuka `/pengelola/*` → `/akses-ditolak`; refresh tidak menghapus sesi (sessionStorage
  `ishas-session-v2` menunjuk ID akun); isi `/` sama saat login + identitas di header.
- Isolasi scope: antrean pengelola PSN-0018 hanya memuat RPT-0001; RPT-0002 (PSN-0019) tidak tampil.
- D-03: sesi Super Admin di `/lapor` melihat pesan kirim dinonaktifkan; D-02: tidak ada panel count
  antrean di `/`; nama validator tampil pada kartu temuan; ID keputusan (D-xx) dibersihkan dari copy UI.
- Reset demo via `/admin/pengaturan`: seed V2 dikembalikan dan tersimpan ke `ishas-mock-v4`.
- Visual: 1440×900, 834×1112, 390×844 tanpa overflow horizontal; CTA pindah baris kedua di ponsel.
- Temuan perbaikan saat pemeriksaan: getSnapshot sesi di-cache (useSyncExternalStore butuh snapshot
  stabil) — sudah diperbaiki; lint diarahkan mengabaikan `build/`.
- Catatan: mock store baru menulis ke localStorage saat aksi pertama (bukan saat baca) — perilaku
  dimata-matai di stage berikutnya.

## Review ulang 8 September 2026

- [x] Audit/perbaikan UI responsif dan keyboard shell/login, sesi dan persistensi mock sesuai arahan pemilik.

Perbaikan shell dialog responsif/keyboard, ukuran kontrol, error sesi, validasi state v4,
dan persistensi atomik selesai. Integrasi akhir: 45 test, lint, typecheck, build, serta
uji browser anonim + tiga peran lulus. Shell dan halaman utama tidak overflow pada
1440×900, 834×1112, 390×844, 320×740, dan 667×375. Logout, direct URL, pemulihan sesi,
dialog menu/notifikasi (Tab + Shift+Tab + Escape), dan state browser rusak turut lulus.
