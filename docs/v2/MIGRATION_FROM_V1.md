# V2 — Migrasi dari V1 (Tabel File-per-File)

**Status: inventaris dampak bersyarat, bukan pekerjaan yang sedang diizinkan.**
Cara membangun V2 menunggu D-01 di `DECISIONS.md`. Semua path fitur/shared/mocks di tabel
relatif terhadap `apps/web/` V1, kecuali yang sudah diawali `apps/web/`.
Sesi sekarang hanya mengubah dokumen `docs/v2/`; tidak ada file aplikasi yang dipindah/dihapus.
Jika V2 dibangun terpisah, label UBAH/PINDAH/HAPUS perlu ditafsir ulang sebagai kebutuhan
pada aplikasi baru, bukan menghilangkan V1. Urutan arsip/pakai ulang juga belum diputuskan.

Legenda calon aksi: `HAPUS` (buang total) · `ARSIP` (pindah ke `_archived`, tidak diimpor) · `PINDAH` (pindah + adaptasi) · `UBAH` (edit di tempat) · `TETAP` (tidak disentuh) · `TINJAU` (pemetaan belum cukup untuk menentukan tindakan).

## 1. Routing dan shell

| File V1 | Aksi | Detail V2 |
|---|---|---|
| `apps/web/app/page.tsx` | `UBAH` | Ganti impor `LandingPage` → dashboard publik; ganti metadata (title "ISHAS — Dashboard K3L Pesantren", deskripsi publik + dummy). Tidak ada redirect. |
| `apps/web/app/(workspace)/[role]/layout.tsx` | `UBAH` | Tetap untuk workspace login; route publik (`/`, `/lapor`, …) memakai shell publik ringan, bukan file ini. |
| `features/routing/access-policy.ts` | `UBAH` | Tambah keputusan `public`; tanda `resolveWorkspaceAccess` tetap untuk workspace; tambah `isPublicRoute(path)` (daftar di ROUTES §1). |
| `features/routing/route-state.tsx` | `UBAH` | `RoleIndexRedirect`/`WorkspaceGuard` tetap; tambah `PublicRoute` (selalu render). Direct `/asesor/*` → pesan khusus (ROUTES §3). |
| `features/routing/workspace-content.tsx` | `UBAH` | Hapus lazy `AssessorDashboard`/`AssessorSection`; tambah lazy halaman publik + `ValidasiPage`. |
| `shared/navigation/workspace-config.ts` | `UBAH` | Hapus `roleNavigation.asesor` + `roleMeta.asesor`; tambah item pesantren (`lapor`, `penilaian-mandiri`, `validasi-laporan` bertanda `needLogin: true`). |
| `shared/auth/demo-accounts.ts` | `UBAH` | Hapus objek asesor; `RoleId` menjadi `'admin' \| 'peneliti' \| 'pengelola'`; tambah komentar "Asesor dihapus pada V2". |
| `shared/auth/auth-store.ts` | `TINJAU` | V1 menyimpan role pada `ishas-demo-session-v1`. V2 perlu membedakan ID akun pengelola untuk scope isolation; bukan sekadar menghapus role asesor. Isolasi namespace dan cara login mengikuti D-01/D-09. |
| `features/auth/login-screen.tsx` | `UBAH` | Hapus kartu asesor; alur `role-flow` menjadi 3 item; copy "tiga peran + pelapor publik"; hapus link "Kembali ke beranda". |

## 2. Fitur

| File V1 | Aksi | Detail V2 |
|---|---|---|
| `features/landing/*` | `ARSIP` | Calon pindah ke `features/_archived-landing/` bila migrasi di tempat dipilih; tidak diimpor aktif oleh V2; cara hidupkan kembali lihat §4. |
| `features/asesor/components/assessment-flow.tsx` | `PINDAH` | → `features/pengelola/components/self-assessment-flow.tsx`; props baru `{ institutionCode, reporterName, onSubmitForValidation }`; hapus panel penugasan + nama asesor hard-code. |
| `features/asesor/pages/*` (5 file) | `HAPUS` | Diganti `lapor-page.tsx`, `penilaian-mandiri-page.tsx`, `validasi-page.tsx` di `features/pengelola/pages/`. |
| `features/asesor/assessor-section.tsx`, `components/assessor-components.tsx`, `model.ts` | `HAPUS` | Setelah pindahan selesai dan tidak ada impor tersisa (cek via grep). |
| `features/pengelola/pages/dashboard-page.tsx` | `UBAH` | Agregat multi-pesantren + `InstitutionSelector`; count antrean netral; copy atribusi asesor → pelapor/validator. |
| `features/pengelola/manager-section.tsx` | `UBAH` | Daftarkan route baru; teruskan `onNavigate`. |
| `features/admin/pages/users-page.tsx` | `UBAH` | Hapus opsi/filter `Asesor` di dropdown, filter, dan `roleIds`; default fallback menjadi `pengelola`. |
| `features/admin/pages/institutions-page.tsx` | `UBAH` | Tambah aksi `Aktifkan/Nonaktifkan` eksplisit + penjelasan efek ke pemilih publik. |
| `features/peneliti/*` | `TINJAU` | Tujuan peran dipertahankan, tetapi pemetaan dataset/hasil, status Final V1, instrumen aktif, dan impor dummy perlu diselaraskan dengan data V2. Lihat DATA_REQUIREMENTS §9. |

## 3. Mock dan data

| File V1 | Aksi | Detail V2 |
|---|---|---|
| `mocks/seed/asesor.ts` | `HAPUS` | Diganti `mocks/seed/laporan.ts` (Report + SelfAssessmentDraft + contoh antrean). Indikator contoh pindah ke `mocks/seed/instrumen-contoh.ts` bila masih dipakai self-assessment. |
| `mocks/store/state.ts` | `TINJAU` | V1 mempunyai `reports` untuk laporan ringkasan; jangan menimpanya dengan kiriman tanpa pemetaan. Tambahkan snapshot jawaban/hasil dan pertimbangkan namespace V2 terpisah dari `ishas-domain-v3` sesuai D-01. |
| `mocks/store/mock-store.ts` | `UBAH` | Inventaris action mengikuti DATA_MODEL §4; audit memakai identitas akun/pelapor yang tepat, notifikasi mempunyai ID penerima dan scope. Pemetaan baru harus selesai sebelum kontrak lama dihapus. |
| `mocks/store/selectors.ts` | `UBAH` | Hapus selector penugasan; tambah `selectRegisteredInstitutions`, `selectValidatedReports`, `selectValidationQueue`, `selectReportsByInstitution`. |
| `mocks/adapters/mock-repository.ts` | `UBAH` | Perbarui interface mengikuti action baru. |
| `mocks/processors/assessment.ts` | `UBAH` | Input dari draft self-assessment (bukan assignment); output kandidat temuan per `reportId`. |
| `mocks/seed/pengelola.ts` | `UBAH` | Tambah seed antrean + arsip ditolak; temuan menunjuk `reportId`. |

## 4. Cara menghidupkan landing kembali (bila dosen meminta lagi)

1. Kembalikan folder arsip ke `features/landing/` (git memadai: `git mv` balik).
2. Buat route BARU `/perkenalan` yang merender `LandingPage` (jangan kembalikan ke `/`).
3. Tambah tombol `Perkenalan ISHAS` di header publik. Selesai — tanpa redirect otomatis.

Cara di atas adalah skenario lama jika arsip dipindahkan dalam proyek yang sama. D-01 menentukan
apakah skenario ini relevan. Pengaktifan `/perkenalan` tetap menunggu permintaan pemilik.

## 5. Pemeriksaan tambahan sebelum memilih migrasi

- Pertahankan bukti referensi V1 dan kemampuan membandingkan alur; jangan menghapus komponen
  form sebelum kebutuhan penilaian mandiri serta sumber indikator barunya dipetakan.
- Inventaris route lama beserta link/notifikasi menuju route itu. Pesan penghentian route Asesor
  memang menyebut nama peran lama; pemeriksaan “bersih” harus mengecualikan konteks tersebut.
- Pisahkan sesi, draft, domain dummy, dan reset V2 dari data V1 jika keduanya berjalan pada origin yang sama.
- Kaji dependensi komponen arsip terhadap model lama; label “tidak diimpor” saja belum memastikan
  arsip tidak mengganggu pemeriksaan teknis pada strategi pembangunan yang nanti dipilih.
- Daftar perubahan dokumen root/blueprint/frontend hanyalah dampak masa depan, di luar izin sesi ini.
