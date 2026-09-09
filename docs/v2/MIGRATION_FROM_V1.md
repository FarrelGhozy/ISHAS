# V2 — Inventaris Kebutuhan dari V1 (Tabel File-per-File)

**Status: inventaris bahan salin-adaptasi untuk aplikasi ISHAS yang terpisah (D-01 dijawab 8 September 2026).**
Cara membangun sudah diputuskan: **aplikasi terpisah bernama ISHAS** (React Router, folder per fitur,
bun 1.4); **V1 tidak diubah sama sekali**. Semua path fitur/shared/mocks di tabel relatif terhadap
`apps/web/` V1 dan dibaca sebagai **kebutuhan pada aplikasi baru**, bukan perintah edit/pindah/hapus di V1.
Label `HAPUS` berarti "tidak dibangun ulang di ISHAS", `PINDAH` berarti "salin lalu adaptasi di ISHAS",
`UBAH` berarti "bangun versi baru mengikuti detail kolom V2", `ARSIP` tidak relevan (V1 tetap utuh).

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
| `features/landing/*` | `TIDAK DIMIGRASI` | Landing tidak dibawa ke aplikasi ISHAS; V1 tetap utuh memilikinya. Halaman perkenalan di ISHAS dibuat baru bila kelak diminta (lihat §4). |
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

## 4. Halaman perkenalan di ISHAS (bila dosen meminta lagi)

Dengan aplikasi terpisah, tidak ada "arsip landing" yang dihidupkan; bila diminta, buat halaman
baru `/perkenalan` di ISHAS yang meniru landing V1, plus tombol `Perkenalan ISHAS` di header publik.
Pengaktifan tetap menunggu permintaan pemilik/dosen.

## 5. Catatan salin-adaptasi

- Pertahankan bukti referensi V1 dan kemampuan membandingkan alur; komponen form V1 dibaca sebagai
  rujukan sebelum kebutuhan penilaian mandiri serta sumber indikator barunya dipetakan.
- Struktur folder ISHAS meniru pola V1/HIBAH_INTERNAL (app/ + features/ + shared/ + mocks/) tetapi
  dibangun baru; tidak ada dependensi impor langsung ke kode V1.
- Pisahkan sesi, draft, domain dummy, dan reset ISHAS sebagai namespace baru murni (origin baru,
  tidak ada data V1).
