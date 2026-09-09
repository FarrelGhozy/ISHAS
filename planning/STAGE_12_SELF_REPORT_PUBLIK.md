# Stage 12 — Self-Report Publik Pesantren (Revisi Pasca Evaluasi Dosen)

**Status:** IN PROGRESS
**Basis:** evaluasi dosen, September 2026. Mengubah arah produk dari empat peran tertutup (Admin, Peneliti, Asesor, Pengelola) menjadi tiga peran + ruang publik.
**Sumber keputusan:** diskusi pemilik proyek — landing dinonaktifkan sementara, asesor dihapus, dashboard pesantren menjadi publik, pelaporan tanpa login dengan moderasi wajib.

## 1. Tujuan dan Ruang Lingkup

- Menonaktifkan landing page publik (`/`) sementara dan menjadikan `/` dashboard pesantren yang dapat dibuka **tanpa login**.
- Menghapus peran **Asesor** dan memindahkan kemampuannya menjadi **penilaian mandiri (self-assessment)** milik pesantren/publik.
- Menetapkan peran baru:
  - **Super Admin** (admin lama): mengelola pesantren dan membuat akun pengelola pesantren.
  - **Pengelola Pesantren / mitra**: admin lokal pondok; memvalidasi laporan, menentukan tingkat bahaya, mengelola status penanganan penuh, menghapus yang sudah ditangani.
  - **Peneliti**: tetap (instrumen, versioning, scoring, validasi & publikasi, data penelitian).
  - **Publik (tanpa login)**: melihat dashboard agregat semua pesantren terdaftar dan mengirim laporan / penilaian mandiri dengan mengisi nama.
- Menetapkan bahwa **semua laporan (login maupun tidak) wajib validasi** sebelum tampil di dashboard umum.
- Menyediakan dua dokumen luaran: file stage ini (delta V1→V2) dan folder `docs/v2/` (dokumentasi proyek baru dari nol, frontend-only).
- Tidak mencakup backend, autentikasi produksi, upload nyata, PDF nyata, atau rumus ilmiah final.

## 2. Keputusan Produk

1. `/` langsung menampilkan dashboard pesantren (agregat multi-pesantren + pemilih pesantren). Kode landing lama diarsip, bukan dihapus permanen.
2. Role `asesor` dihapus dari akun demo, login, navigasi, guard, mock, dan dokumen. Tidak ada penugasan (assignment) lagi.
3. `AssessmentFlow` lama dipindah menjadi **Self-Assessment mandiri**: tanpa pilih penugasan dan tanpa verifikasi 4 checkbox asesor. Diganti: pilih pesantren terdaftar → versi instrumen Published otomatis → isi indikator/bukti/lokasi → kirim untuk validasi.
4. Form pelaporan publik memakai **nama pelapor wajib** (teks bebas). Jika login sebagai pengelola, nama terisi otomatis dari akun dan tetap dapat diubah. Tidak ada perbedaan hak lapor antara anonim dan login.
5. Hanya pesantren yang **sudah didaftarkan Super Admin** (sudah punya akun pengelola) yang muncul di pemilih dan dapat dilaporkan. Pesantren tanpa pengelola tidak tampil.
6. Dashboard publik hanya menampilkan **data tervalidasi**. Laporan baru berstatus `Menunggu validasi` dan tidak tampil sebelum diterima pengelola.
7. Pengelola pondok menentukan **tingkat keparahan** dan **prioritas perbaikan** saat validasi, serta mengelola **status penanganan**: `Pending → Proses → Completed`. Dapat menghapus laporan `Completed` dengan konfirmasi dan audit.
8. Login (`/login`) hanya untuk Super Admin, Peneliti, dan Pengelola Pesantren. Copy "empat peran" diubah menjadi "tiga peran + publik".
9. Tech stack V2 tetap Next.js App Router dengan struktur `apps/web/` saat ini, agar `docs/v2/` dapat dipakai membangun ulang dari nol.
10. Prefix URL `/pengelola/...` dipertahankan selama STAGE_12 agar diff kecil. Rename menjadi `/pesantren/...` dicatat sebagai backlog proyek baru (lihat `docs/v2/BACKLOG.md`).

## 3. Matriks Akses V2

| Area | Publik | Pengelola | Super Admin | Peneliti |
|---|---|---|---|---|
| `/` dashboard agregat + filter pesantren | ✅ | ✅ | ✅ baca | ✅ baca |
| Lapor cepat + penilaian mandiri | ✅ | ✅ | ❌ | ❌ |
| Antrean validasi, severity/priority, status, hapus completed | ❌ | ✅ scope pesantrennya | ❌ | ❌ |
| Gedung/area/denah, tindak lanjut, laporan pimpinan | ❌ | ✅ | ❌ | ❌ |
| Kelola pesantren + akun pengelola | ❌ | ❌ | ✅ | ❌ |
| Instrumen/scoring/publikasi | ❌ | ❌ | ❌ | ✅ |
| `/login` | — | ✅ | ✅ | ✅ |

## 4. Alur Baru

### 4.1 Lapor cepat publik

1. Buka `/` (tanpa login) → pilih pesantren terdaftar → buka form lapor.
2. Isi nama pelapor (wajib; otomatis jika login), lokasi/area, deskripsi, foto opsional.
3. Kirim → tersimpan sebagai `Menunggu validasi`, tidak tampil di dashboard.
4. Pengelola menerima notifikasi → buka antrean validasi.
5. Tolak (dengan alasan) → arsip, tidak tampil, teraudit. Atau terima → isi tingkat keparahan + prioritas + status awal `Pending` → tampil di dashboard/hasil/peta.

### 4.2 Penilaian mandiri (self-assessment)

1. Buka halaman penilaian mandiri → pilih pesantren terdaftar.
2. Sistem memakai versi instrumen Published aktif secara otomatis.
3. Isi jawaban, catatan, bukti, lokasi observasi per indikator.
4. Simpan draft lokal → kirim untuk validasi (pengganti finalisasi langsung).
5. Pengelola validasi per laporan; temuan rendah membentuk rekomendasi ilustratif seperti sebelumnya.

### 4.3 Lifecycle status penanganan

- `Menunggu validasi` (sistem) → `Pending` (diterima) → `Proses` → `Completed` → dapat dihapus pengelola.
- Tingkat keparahan (`Tinggi/Sedang/Rendah`) dan prioritas perbaikan ditentukan pengelola saat validasi, bukan oleh pelapor.
- Semua transisi menambah audit event dan notifikasi dummy.

## 5. Dampak Implementasi (dilaksanakan saat pembangunan V2)

**Routing & shell:**

- `apps/web/app/page.tsx` — ganti `LandingPage` → dashboard publik; perbarui metadata.
- `apps/web/app/(workspace)/[role]/`, `features/routing/*` (`access-policy.ts`, `route-state.tsx`, `workspace-content.tsx`) — hapus cabang `asesor`; tambah keputusan akses `public` untuk route pesantren terbuka.
- `shared/navigation/workspace-config.ts` — hapus `roleNavigation.asesor`; tambah item pesantren (`lapor`, `penilaian-mandiri`, `validasi-laporan` khusus login pengelola).
- `shared/auth/demo-accounts.ts`, `auth-store.ts`, `features/auth/login-screen.tsx` — hapus akun asesor; sisa 3 akun; ubah copy peran.

**Fitur:**

- `features/asesor/` — arsip; `AssessmentFlow` dipindah ke `features/pengelola/components/self-assessment-flow.tsx` dengan props (`reporterName`, `institutionCode`, `onSubmitForValidation`).
- `features/pengelola/` — tambah `lapor-page.tsx`, `penilaian-mandiri-page.tsx`, `validasi-page.tsx`; `dashboard-page.tsx` jadi agregat multi-pesantren + `InstitutionSelector`.
- `features/landing/` — nonaktifkan sementara (arsip + flag `DISABLE_LANDING`).
- `features/admin/pages/users-page.tsx`, `institutions-page.tsx` — hapus opsi Asesor; hubungkan "buat akun pengelola → pesantren muncul di pemilih publik".

**Data dummy (`apps/web/mocks/`, frontend-only):**

- `mocks/seed/asesor.ts` — hapus `assignments/assessorEmail`; ganti model `Report`/`SelfAssessment` (`reporterName`, `institutionCode`, `severity`, `priority`, `handlingStatus`, `validationStatus`).
- `mocks/store/*` — naikkan `MOCK_SCHEMA_VERSION`; tambah actions `submitPublicReport`, `validateReport`, `updateHandlingStatus`, `deleteCompletedReport`; alihkan notifikasi/audit dari asesor ke pengelola/pelapor.
- `mocks/seed/pengelola.ts` — tambah seed antrean `Menunggu validasi` untuk demo.

**Dokumen:**

- `flow.md`, `README.md`, `TODO.md`, `docs/FRONTEND_RULES.md`, `AGENTS.md` — ubah "empat peran" → "tiga peran + publik"; hapus alur penugasan; tambah alur validasi.

## 6. Acceptance Criteria

- [ ] `/` tanpa login menampilkan dashboard agregat semua pesantren terdaftar dan pemilih pesantren berfungsi (lihat `docs/v2/ROUTES.md` §1, `docs/v2/WIREFRAMES.md` §1).
- [ ] Tidak ada menu, akun demo, route, atau guard asesor yang tersisa; direct URL `/asesor/*` menampilkan pesan penghapusan + tombol ke `/penilaian-mandiri` (lihat `docs/v2/MIGRATION_FROM_V1.md` §1–2).
- [ ] Form lapor publik (nama wajib + pesantren terdaftar wajib + aturan field `docs/v2/FLOWS.md` §2) dapat dikirim tanpa login; saat login pengelola, nama terisi otomatis.
- [ ] Laporan baru berstatus `Menunggu validasi` dan tidak tampil di dashboard/hasil/peta/rekomendasi/laporan sebelum diterima (`docs/v2/DATA_MODEL.md` §3).
- [ ] Pengelola dapat Terima (wajib isi severity + priority, tanpa default) / Tolak (wajib alasan min 10); dapat mengubah Pending → Proses → Completed sesuai syarat; dapat menghapus Completed dengan konfirmasi + audit (`docs/v2/FLOWS.md` §4–5).
- [ ] Hanya pesantren terdaftar (Aktif + punya akun pengelola aktif) yang muncul di pemilih dan dapat dilaporkan; pesantren `Persiapan`/tanpa pengelola tidak tampil (`docs/v2/ROLES.md` §1 edge case).
- [ ] `/login` hanya menampilkan tiga akun (Super Admin, Peneliti, Pengelola Pesantren) dengan copy `docs/v2/WIREFRAMES.md` §6.
- [ ] Guard route publik vs workspace lulus untuk anonim dan tiap role sesuai matriks `docs/v2/ROUTES.md` §3.
- [ ] Warna memakai hex persis V1 dan pemetaan status→warna/ikon/label mengikuti `docs/v2/DESIGN_SYSTEM.md` §1–2 (marun `#9f1239`, hover `#881337`, rose `#be123c`; status tidak pernah warna saja).
- [ ] Copy Indonesia memakai kalimat FINAL di `docs/v2/WIREFRAMES.md` (tidak diparafrase).
- [ ] `docs/v2/` lengkap (README, ROLES, ROUTES, FLOWS, DATA_MODEL, WIREFRAMES, DESIGN_SYSTEM, SUGGESTIONS, MIGRATION_FROM_V1, BACKLOG, AGENTS, TODO, TEST_PLAN, planning/V2-01…V2-09) dan konsisten dengan stage ini.
- [ ] Lint, TypeScript, test, dan production build lulus; cek desktop 1440×900, tablet 834×1112, ponsel 390×844 tanpa luapan horizontal.

## 7. Hasil Pemeriksaan

- (Diisi saat implementasi V2 selesai — tanggal, cakupan route, hasil lint/build, hasil cek visual.)

## 8. Risiko dan Mitigasi

- **Spam laporan publik.** Ditahan oleh moderasi wajib; label `Menunggu validasi` dan `Data ilustrasi` selalu tampil. CAPTCHA/rate-limit dicatat sebagai backlog backend.
- **Guard publik vs workspace tertukar.** Uji direct URL, refresh, Back/Forward untuk anonim dan tiap role sebelum REVIEW.
- **Data browser lama tidak kompatibel.** Naikkan schema version mock store dan sediakan reset ke seed awal.
- **Landing hilang permanen.** Arsip eksplisit + cara menghidupkan kembali dicatat di `docs/v2/MIGRATION_FROM_V1.md`.
- **Istilah peran ganda (Admin vs Pengelola).** Gunakan istilah baku: `Super Admin` dan `Pengelola Pesantren (mitra)` di seluruh UI dan dokumen.
