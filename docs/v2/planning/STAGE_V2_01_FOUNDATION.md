# Stage V2-01 — Fondasi Data, Hapus Asesor, Arsip Landing, `/` Publik

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-01, D-03, D-04, D-05, D-07, D-09 dan D-10
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-00 disetujui, keputusan yang memengaruhi fondasi dijawab, dan pemilik secara eksplisit meminta mulai pembangunan kode.
**Tujuan:** menyiapkan tanah tempat seluruh V2 berdiri: model data baru, kode bebas asesor,
landing diarsip, dan `/` merender dashboard publik.

## Prasyarat

- Baca `docs/v2/AGENTS.md`, `README.md`, `DATA_MODEL.md`, `MIGRATION_FROM_V1.md`.

## Ruang lingkup (kerjakan semua, urut)

### 1. Mock schema v4 + seed V2

- [ ] `mocks/store/state.ts`: ganti `assignments`/`assessmentAnswers`/`assessmentActiveIndex` menjadi
  `reports: Report[]` + `selfAssessmentDrafts: Record<string, SelfAssessmentDraft>`;
  `MOCK_SCHEMA_VERSION = 4`; `MOCK_STORAGE_KEY = 'ishas-mock-v4'`; data versi lama di-reset.
- [ ] `mocks/seed/laporan.ts` (baru): seed minimum `DATA_MODEL.md` §5 — 3 pesantren Aktif
  (termasuk `PSN-0018`), 1 `Persiapan`, akun terkait, 2 `Menunggu validasi`
  (1 lapor-cepat + 1 penilaian-mandiri), 3+ `Diterima` (Pending/Proses/Completed),
  1 `Ditolak`, 1 instrumen Published + 6 indikator contoh, lokasi `PSN-0018`.
- [ ] `mocks/store/mock-store.ts`: action kirim/terima/tolak/ubah-status/hapus versi stub
  yang konsisten (implementasi penuh di V2-03/05/06). Tindakan yang belum memenuhi aturan
  validasi/scope tidak diaktifkan sebagai jalur pintas perubahan status.
- [ ] `mocks/store/selectors.ts`: `selectRegisteredInstitutions`, `selectValidatedReports`,
  `selectValidationQueue`, `selectReportsByInstitution`.
- [ ] `mocks/adapters/mock-repository.ts`: interface mengikuti action baru; hapus signature assignment.
- [ ] Tombol reset di Pengaturan Admin mengembalikan seed V2.

### 2. Hapus asesor

- [ ] `shared/auth/demo-accounts.ts`: hapus objek asesor; `RoleId` tanpa `'asesor'`;
  tambah komentar `Asesor dihapus pada V2 — lihat docs/v2/MIGRATION_FROM_V1.md`.
- [ ] `shared/navigation/workspace-config.ts`: hapus `roleNavigation.asesor` + `roleMeta.asesor`.
- [ ] `features/auth/login-screen.tsx`: hapus kartu asesor; alur peran 3 item; copy baru; hapus link beranda.
- [ ] `features/routing/*`: hapus cabang asesor; `/asesor/*` → pesan penghapusan + tombol ke `/penilaian-mandiri`.
- [ ] `features/admin/pages/users-page.tsx`: hapus opsi/filter `Asesor`; fallback menjadi `pengelola`.
- [ ] Grep `asesor|assessorEmail|assignmentId` bersih dari kode aktif (kecuali komentar migrasi/dokumen).

### 3. Arsip landing + `/` publik

- [ ] Pindah `features/landing/` → `features/_archived-landing/`; pastikan tidak ada impor aktif.
- [ ] `app/page.tsx`: render dashboard publik (sementara boleh versi sederhana: header + pemilih +
  agregat dari selector baru; penyempurnaan visual di V2-02) + metadata baru; tanpa redirect.
- [ ] Guard: route `/` selalu `allowed` (anonim maupun login).

## Di luar ruang lingkup (dilarang di stage ini)

Seluruh checklist kode pada file ini masih backlog. Penyimpanan snapshot jawaban/hasil,
identitas sesi, serta pemetaan Peneliti perlu dirumuskan di fondasi bersama DATA_REQUIREMENTS;
daftar penggantian field lama di atas belum cukup menjadi kontrak lengkap.

- Form lapor, antrean validasi, lifecycle penuh, self-assessment, halaman baca publik (V2-02…V2-08).
- Perubahan peneliti, rumus/skor, rename `/pengelola` → `/pesantren`.

## Acceptance criteria

- [ ] Reset demo menghasilkan seed §5 persis (hitung: 3 Aktif + 1 Persiapan + antrean 2 + arsip 1).
- [ ] Data browser v3 otomatis ter-reset ke seed V2 tanpa crash.
- [ ] `/` tanpa login menampilkan dashboard (versi awal) tanpa redirect; dengan login isi sama + tombol ruang kerja.
- [ ] `/login` tepat 3 kartu; `/asesor/*` menampilkan pesan khusus.
- [ ] Grep asesor/assignment bersih; lint, typecheck, test, build lulus (TEST_PLAN §5 + §1 baris 1–2, 8, 12).

## Hasil Pemeriksaan

- (Tanggal, hasil matriks yang dijalankan, catatan. Template di `TEST_PLAN.md` §6.)
