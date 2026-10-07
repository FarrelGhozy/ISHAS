# Model Data Frontend (Skema Rinci)

## Kontrak pembacaan dashboard — 18 September 2026

Schema `v15` mengikuti D-15, D-24 (bank live `INS-LIVE`), D-26/D-26.f
(SAM-iSAFE + `panduan`/`contohBukti`), dan D-29 (`reporterRecommendation`).
Rincian migrasi di §0. Nilai `MOCK_SCHEMA_VERSION` aktual ada di
`apps/web/mocks/store/state.ts`.
Bank instrumen live; klasifikasi jawaban memakai
instrumentVersionId snapshot asal. Rekap lokasi memakai areaId, bukan nama area.
Relasi dan batas metrik: [DASHBOARD_DATA_FLOW.md](DASHBOARD_DATA_FLOW.md).
Periode URL belum menjadi filter semua metrik; klaim periode mempersempit semua
angka pada catatan lama harus dibaca bersama batas ini.



**Amendemen D-14 — 18 September 2026:** calon kontrak baru memakai
CampusPlanVersion milik pesantren dan LocationSnapshot dengan point nullable +
referensi versi; lantai hanya keterangan. Skema per lantai/x-y wajib angka di bawah
merupakan skema lama, bukan kontrak Risk Map baru. Detail relasi, lineage per jawaban,
whitelist publik dan migrasi di [RISK_MAP_DESIGN.md](RISK_MAP_DESIGN.md) §5–8.
Kode/schema belum diubah; jangan membuat titik tengah sebagai fallback lokasi.

Semua relasi memakai **ID stabil**; label tampilan tidak pernah menjadi kunci.
Persistensi browser berversi + reset seed. Dilarang menyimpan kata sandi/token.

**Status: kontrak aktif frontend (schema v16).** Temuan audit 8 September
sudah ditindaklanjuti lewat D-05–D-11 (9 September 2026), D-24, D-26, dan D-29.
Baca `DATA_REQUIREMENTS.md` bersama skema di bawah; rumus/skala ilmiah final
tetap menunggu penelitian.

## 0. Versi schema

- **Amendemen D-24 (28 September 2026):** bank instrumen live `INS-LIVE`
  menggantikan versioning `Draft/Published/Archived`; snapshot penilaian
  membeku (copy soal + opsi + bobot + jawaban + `scorePercent`); `Report`
  menyimpan `scorePercent` + `pdfGeneratedAt`; draft memakai
  `instrumentChecksum` (berubah = ulang).

- **Amendemen D-26.f (28 September 2026):** schema `v14`
  (`MOCK_STORAGE_KEY: ishas-mock-v14`): `SamQuestion` bertambah
  `panduan` + `contohBukti` (opsional, bisa diubah Validator);
  migrasi v13→v14 mengisi default kosong. Bank `SAM-KAT-*` terpisah
  dari kategori sistem `KAT-*`.

- **Amendemen D-29 (28 September 2026):** schema `v15`
  (`MOCK_STORAGE_KEY: ishas-mock-v15`): `Report` bertambah
  `reporterRecommendation` (usulan rekomendasi tindakan lapor-cepat,
  opsional, maks 500; usulan mentah tidak publik). Migrasi v14→v15
  menormalisasi field baru tanpa menghapus record/ID.

- **Amendemen seed v16 (3 Oktober 2026):** schema `v16`
  (`MOCK_STORAGE_KEY: ishas-mock-v16`): menambah pesantren contoh `PSN-0024`
  (UNIDA Gontor, `Aktif` tanpa akun Pesantren → belum terdaftar). Migrasi
  v15→v16 hanya menambah record baru tanpa menyentuh data lama.
- **Versi aktif sekarang:** `MOCK_SCHEMA_VERSION: 16`
  (`MOCK_STORAGE_KEY: ishas-mock-v16`, lihat `store/state.ts`). Pemeriksaan
  state: bila `schemaVersion !== 16`, pulihkan seed.
- **Rantai migrasi yang dipertahankan kode:** v4→…→v15→v16. Semua
  langkah mempertahankan record/ID; snapshot/temuan lama tidak dihitung ulang.
  - v10→v11: bank live `INS-LIVE` (D-24) — `instrument`, `instrumentChecksum`,
    opsi/bobot per jawaban, snapshot beku, skor %, artefak PDF;
    `instrumentVersions` lama menjadi bacaan legacy.
  - v13→v14 (D-26.f): `SamQuestion.panduan` + `contohBukti` (default kosong).
  - v14→v15 (D-29): `Report.reporterRecommendation` (opsional, maks 500).
- Migrasi v6→v7 mempertahankan seluruh record/ID; hanya menambah
  `instrumentDocs` (seed 2 Public + 2 Privat ilustrasi). Snapshot/temuan lama
  tidak dihitung ulang.

```ts
type InstrumentDocVisibility = 'Public' | 'Privat';
type InstrumentDoc = {
  id: string; // 'DOC-IND-K3L-001' stabil per indicatorId
  indicatorId: string; // FK indikator bank live ('IND-K3L-*', D-44)
  categoryId?: string; // denormalisasi untuk filter (KAT-*)
  aspectId?: string; // denormalisasi (ASP-*)
  fileName: string; // 'detail-xxx.pdf'
  fileSize: number; // bytes, maks prototipe 10 MB
  mime: 'application/pdf';
  assetId: string; // blob di IndexedDB perangkat-lokal
  visibility: InstrumentDocVisibility; // default 'Privat'
  indicatorCode?: string; // D-16.g: denormalisasi entri manual
  indicatorTitle?: string; // D-16.g: denormalisasi entri manual
  manual?: boolean; // true = entri dokumen buatan Validator (bukan katalog versi)
  updatedBy: string; updatedAt: string;
};
```
- D-16.g: entri dokumen buatan Validator memakai field opsional
  `indicatorCode/indicatorTitle/manual`; skema tetap `v7` (aditif, tanpa migrasi
  baru) dan tidak mengubah `instrumentVersions`.
- Migrasi v5→v6 mempertahankan seluruh record/ID; hanya menambah field
  (`categoryId/aspectId` fallback, `level` tetap valid). Snapshot `INS-v1.0` tidak dihitung ulang.

## 1. Enum (nilai persis, case-sensitive)

```ts
type InstitutionStatus = 'Persiapan' | 'Aktif' | 'Nonaktif';
type RoleId = 'admin' | 'validator' | 'pesantren'; // 'asesor' DIHAPUS; D-17 rename peneliti→validator, pengelola→pesantren
type RoleLabel = 'Super Admin' | 'Validator' | 'Pesantren';
type ReportChannel = 'lapor-cepat' | 'penilaian-mandiri';
type ValidationStatus = 'Menunggu validasi' | 'Diterima' | 'Ditolak';
type Severity = 'Belum ditentukan' | 'Tinggi' | 'Sedang' | 'Rendah';
type Priority = 'Belum ditentukan' | 'Tinggi' | 'Sedang' | 'Rendah';
type HandlingStatus =
 | 'Menunggu validasi' | 'Pending' | 'Proses' | 'Completed' | 'Ditolak';
// Arsip = flag `archivedAt` (+ `archivedReason`) pada Report yang tetap
// `Completed`, bukan nilai HandlingStatus. Lihat FLOWS §5.
// 'Dihapus' (FLOWS §5) bukan nilai tersimpan: record dihapus beserta temuan + audit tetap ada;
// alternatif arsip alih-alih hapus menunggu D-07.
type InstrumentStatus = 'Draft' | 'Published' | 'Archived';
type KategoriK3Id = 'KAT-KESELAMATAN' | 'KAT-DARURAT' | 'KAT-KESEHATAN' | 'KAT-LINGKUNGAN' | 'KAT-PSIKOSOSIAL' | 'KAT-AKSESIBILITAS'; // D-44
type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Ekstrem'; // D-15.b, asumsi prototipe
type RecommendationStatus =
  | 'Belum ditindaklanjuti' | 'Berjalan' | 'Menunggu verifikasi' | 'Terverifikasi' | 'Dibatalkan'; // D-21: terminal per rekomendasi, wajib alasan
```

## 2. Entitas

```ts
type Institution = {
 code: string; // 'PSN-0018', unik, dibuat berurutan PSN-XXXX
 name: string; // unik, maks 120
 location: string; // 'Kota Malang' (kota/kabupaten; tampil publik, D-02)
 address?: string; // alamat lengkap onboarding (FLOWS §1, wajib min 10 di form); internal, tidak tampil publik (D-02)
  manager: string; // nama penanggung jawab utama (teks)
 users: number; // count turunan, bukan input
 assessment: 'Belum dimulai' | 'Berjalan' | 'Draft' | 'Selesai'; // field lama (tidak dipakai sebagai status resmi); hubungan dengan hasil/periode belum dipetakan (D-04)
 status: InstitutionStatus;
};
// TERDAFTAR = status 'Aktif' DAN ada user roleId pesantren + institutionCodes
// memuat code ini + status user 'Aktif'. Selain itu tidak tampil di pemilih.

type User = {
 id: string; // 'USR-001'
 name: string; email: string; initials: string;
 role: RoleLabel; roleId: RoleId;
  institution: string; // nama tampilan lingkup ('Seluruh sistem' utk admin/validator)
  institutionCodes: string[]; // pesantren: tepat 1 kode; admin/validator: []
 status: 'Aktif' | 'Menunggu' | 'Nonaktif';
 lastActive: string;
};

type Report = {
  id: string; // 'RPT-0001', berurutan
  channel: ReportChannel;
  institutionCode: string; // FK Institution.code
   categoryId?: string; // kategori pilihan pelapor (opsional, D-15/D-19); validasi konsistensi di store
   aspectId?: string; // aspek pilihan pelapor (opsional, D-15/D-19)
   indicatorId?: string; // warisan lapor-cepat lama + penilaian-mandiri; lapor-cepat baru tidak mengisi (D-19)
   reporterSeverity?: Severity; // usulan pelapor, opsional (D-19); default 'Belum ditentukan'
   reporterPriority?: Priority; // usulan pelapor, opsional (D-19); default 'Belum ditentukan'
   reporterRecommendation?: string; // D-29: usulan rekomendasi tindakan lapor-cepat, opsional, maks 500; mentah tidak publik
  reporterName: string; // 2-100 karakter, wajib; selalu tampil apa adanya secara internal (tanpa opsi anonim, D-02)
  reporterUserId?: string; // FK User.id bila dikirim saat login (bukan email)
  reporterAccountEmail?: string; // terisi bila dikirim saat login (Pesantren)
  title: string; // D-47: selalu turunan otomatis (±10 kata pertama deskripsi, maks 140; fallback lokasi) / judul otomatis (penilaian-mandiri)
  description: string; // D-47: opsional, boleh kosong, tanpa min (lapor-cepat) / ringkasan otomatis dari jawaban terkirim (penilaian-mandiri; aturan penyusunannya belum ditetapkan, D-04/D-05)
  areaId?: string; // FK Area.id; kebijakan tanpa area menunggu D-11
  manualLocation?: string; // lokasi manual bila area belum tersedia (D-11)
  locationSnapshot?: LocationSnapshot; // beku: { areaId?, locationText, floorNote, campusPlanVersionId, point }
  planPoint?: { x: number; y: number } | null; // 0-100 (warisan baca)
  evidenceName?: string; // nama lampiran; data lama bisa hanya berupa nama dummy
  evidenceAssetId?: string; // ID blob bukti privat di IndexedDB perangkat-lokal (/lapor)
  contact?: string;
  instrumentVersionId?: string; // warisan versioning (bacaan legacy)
  instrumentChecksum?: string; // D-24: checksum bank live saat kirim
  scorePercent?: number | null; // D-24: skor % beku (sumber agregat + PDF)
  pdfGeneratedAt?: string; // D-24: waktu PDF dibuat (publik setelah Diterima)
    validationStatus: ValidationStatus;
   severity: Severity; // default 'Belum ditentukan', hanya akun Pesantren yang mengubah (keputusan final, D-19)
   priority: Priority; // idem
  handlingStatus: HandlingStatus;
  rejectionReason?: string; // wajib bila Ditolak, min 10
  validationNote?: string;
  validatedBy?: string; // FK User.id akun Pesantren
  validatedByName?: string; // snapshot nama akun Pesantren saat keputusan (anti-rewrite histori)
  validatedByRole?: string; // snapshot peran akun Pesantren saat keputusan
  validatedAt?: string;
  archivedAt?: string; // D-07: arsip, bukan hapus
  archivedReason?: string;
  observedAt?: string; // waktu observasi (bukan nama pelapor)
  correctionOf?: string; // FK Report.id asal bila koreksi lewat laporan baru (D-07)
  createdAt: string; submittedAt?: string; updatedAt?: string;
};

type SelfAssessmentDraft = { // belum dikirim; per perangkat (localStorage)
  id: string; // 'SELF-0001'
  institutionCode: string; reporterName: string; // nama penilai (D-24)
  contact?: string; // kontak penilai opsional (D-24)
  instrumentVersionId: string; // warisan ('INS-LIVE' untuk kiriman baru)
  instrumentChecksum?: string; // D-24: checksum bank (beda = ulang dari awal)
  answers: Record<string, { value: string; note: string; evidenceName: string;
  evidenceAssetId?: string; // D-27: blob foto upload (IndexedDB perangkat pengunggah)
  areaId: string; planPoint: { x: number; y: number } | null }>;
  activeIndex: number; updatedAt: string;
};
type SelfAssessmentSnapshot = { // D-24: beku saat kirim
  reportId: string; instrumentVersionId: string; instrumentChecksum?: string;
  submittedAt: string; answers: Record<string, {...}>;
  frozenIndicators?: { id, code, title, answerType, options[{value,label,weight,isFinding}], weight }[];
  scorePercent?: number | null; byDimension?: Record<string, number | null>;
  jawabanTerisi?: number; // D-35: cacah jawaban terisi (D-02 aman), dibawa proyeksi publik
};
// Saat kirim perlu snapshot permanen seluruh jawaban yang terkait Report.
// Sketsa ini belum memuat entitas snapshot/status kirim; lihat DATA_REQUIREMENTS §2.

type RiskFinding = {
  id: string; reportId: string; // FK Report (pengganti assignmentId lama)
  areaId: string; buildingId: string; instrumentVersion: string;
  categoryId?: string; // FK Kategori K3 (D-15); kosong = 'Belum dipetakan' (lapor-cepat tanpa indikator)
  aspectId?: string; // FK Aspek (D-15)
  recommendationId: string; location: string; building: string; zone: string;
  floor: string; x: number; y: number; level: 'Tinggi' | 'Sedang' | 'Rendah' | 'Ekstrem';
 issue: string; indicator: string; recommendation: string;
 status: RecommendationStatus; hazard: string; impact: string;
 likelihood: string; severityText: string; exposedPeople: string;
 existingControl: string; evidence: string; observedAt: string;
 planVersion: string; residualRisk: 'Tinggi' | 'Sedang' | 'Rendah' | 'Belum dinilai';
};

type Recommendation = {
 id: string; reportId: string; priority: 'Tinggi' | 'Sedang' | 'Rendah';
 title: string; location: string; source: string; // 'IND-SAR-001 · RPT-0001'
 action: string; status: RecommendationStatus; owner: string; dueDate: string;
 progress: number; // 0-100
 lastNote?: string; completionEvidence?: string;
 completionEvidenceAssetId?: string; // D-21: blob bukti upload (privat, IndexedDB)
 canceledReason?: string; // D-21: wajib min 10 bila Dibatalkan (tampil publik)
 canceledBy?: string; // FK User.id pembatal
 canceledAt?: string;
};

type Building = { id: string; institutionCode: string; code: string;
  name: string; floors: Floor[] };
// D-15: setiap dimension membawa `categoryId` (FK Kategori K3) + daftar `aspects`;
// setiap indicator membawa `categoryId` + `aspectId`. Detail kontrak di KATEGORI_K3.md.
type Floor = { id: string; name: string; planFile: string; planVersion: string;
 uploadedBy: string; uploadedAt: string };
type Area = { id: string; institutionCode: string; buildingId: string;
 name: string; floor: string; zone: string;
 x: number; y: number; width: number; height: number };
// D-14.a: lokasi beku per laporan/jawaban; titik tetap di versi denah asal.
type LocationSnapshot = {
  areaId?: string; locationText: string; floorNote: string;
  campusPlanVersionId: string | null; point: { x: number; y: number } | null;
};
type CampusPlanVersion = {
  id: string; institutionCode: string; revision: number; assetId: string;
  width: number; height: number; uploadedBy: string; uploadedAt: string;
  illustration: boolean;
};
// Format ID: BLD-001, FLR-001, AREA-001, RPT-0001, SELF-0001,
// REC-<reportId>-<n>, RSK-<reportId>-<n>, INS-v1.0, IND-XXX-000,
// AUD-DEMO-001, NOT-001 — semuanya stabil, tidak memakai nama sebagai kunci.
```

## 3. Aturan tampil — bidang publik mengikuti D-02 (dijawab 8 September 2026)

D-02: publik melihat **ringkasan saja** + **nama validator/PIC** + **foto bukti
penilaian mandiri di PDF** (amendemen D-27). Nama/kontak pelapor, bukti
lapor-cepat/penyelesaian, denah rinci + titik, jawaban mentah, alasan
penolakan, dan audit tidak publik. Arsip pesantren nonaktif menunggu D-08.

- Dashboard/hasil/peta/rekomendasi/PDF laporan HANYA membaca `Report` dengan `validationStatus: 'Diterima'` (`lapor-cepat`) atau `'Terbit'` (`penilaian-mandiri`, D-32) + temuan/rekomendasi turunan (khusus `lapor-cepat`), dengan bidang sesuai matriks `DATA_REQUIREMENTS.md` §6.
- `Menunggu validasi` hanya terlihat di layar konfirmasi pelapor lapor-cepat + antrean `/pesantren/validasi-laporan` pemilik scope. Tidak ada count antrean di dashboard publik (D-02). `Terbit` dan `Tidak berlaku` milik penilaian mandiri.
- `Ditolak` hanya terlihat di arsip antrean Pesantren pemilik scope.
- Agregat `/` dihitung dari himpunan `Diterima`/`Terbit` lintas pesantren terdaftar; filter pesantren mempersempit ke satu `institutionCode`.

## 4. Store actions (pengganti action asesor lama)

| Action | Input | Hasil |
|---|---|---|
| `submitPublicReport` | field §FLOWS-2 + `reporterName` + usulan rekomendasi opsional | `RPT-XXXX` + audit + notifikasi Pesantren |
| `saveSelfAssessmentDraft` | draft parsial | tersimpan lokal, `progress` dihitung ulang |
| `submitSelfAssessment` | draft lengkap | snapshot jawaban terkirim + 1 `Report` `Terbit`/`Tidak berlaku` (tanpa temuan; D-32) + audit + notifikasi Pesantren "telah terbit"; ulang percobaan yang sama tidak menggandakan kiriman |
| `acceptReport` | `id` + `severity` + `priority` (+ catatan) + rekomendasi final wajib untuk lapor-cepat (min 10, maks 500) | `Diterima/Pending` + 1 rekomendasi final; wajib ketiganya untuk lapor-cepat |
| `rejectReport` | `id` + alasan min 10 | `Ditolak`; arsip + validator/waktu/alasan |
| `updateHandlingStatus` | `id` + status baru + syarat per transisi (PIC/tenggat/bukti) | status baru + audit; jalur utama maju lewat `updateRecommendation`, manual untuk tanpa-rekomendasi/mundur/arsip (D-23.a) |
| `updateRecommendation` | `id` + PIC/tenggat/progres/bukti/catatan/`verify` | rekomendasi maju + laporan otomatis `Proses`/`Completed`; progres dinormalisasi D-20 |
| `setFindingLevel` | `id` temuan + level (`Rendah/Sedang/Tinggi/Ekstrem`) | level baru + audit `Mengubah tingkat risiko temuan`; scope Pesantren pemilik (D-23.b) |
| `cancelRecommendation` | `id` rekomendasi + alasan min 10 (D-21) | `Dibatalkan` + temuan tertaut ikut + audit; laporan induk tetap status berjalan (`Pending/Proses`) |
| `verifyFinding` | `id` temuan + catatan | Deprecated lembut (D-23.c): tetap berfungsi + warn; pakai `updateRecommendation(verify:true)` |
| `savePlanVersion` | denah per lantai | Deprecated lembut (D-23.c): tetap berfungsi + warn; jalur utama `publishCampusPlan` gambaran besar |
| `deleteCompletedReport` | `id` + alasan | Alias `archiveCompletedReport` (D-07: arsip, bukan hapus) |
| `addUser` / `addInstitution` | sama tanpa peran asesor | + pesantren baru TIDAK otomatis tampil sebelum `Aktif` + punya akun Pesantren |
| `addBankDimension` / `updateBankDimension` / `deleteBankDimension` | nama + kategori | dimensi bank live + checksum baru + audit (D-24) |
| `addBankIndicator` / `updateBankIndicator` / `deleteBankIndicator` | kode/judul/prompt/tipe/wajib/bukti/lokasi/kategori/aspek | indikator bank live + opsi bawaan tipe + checksum baru + audit (D-24); ganti tipe = opsi kembali bawaan |
| `setBankIndicatorOptions` | opsi[] + pengali | bobot 0–100/opsi + flag temuan + pengali + checksum baru + audit (D-24) |
| `resetMockData` | — | kembali ke seed |

Action lama yang dihapus: semua yang menyebut `assignment`/`assessor` (`saveAssessmentDraft(assignmentId)`, `finalizeAssessment(assignmentId)`, dsb).

## 5. Seed kaya demo (agar setiap halaman dapat didemo ke dosen)

Komposisi minimum §5 lama telah diperkaya (September 2026) menjadi data demo
penuh berikut; implementasi di `apps/web/mocks/seed/seed.ts` (schema v16, D-24 +
D-26.f + D-29). Angka di bawah dikunci `seed-composition.test.ts`.

- **6 pesantren:** `PSN-0018` PP Al-Hikmah Malang (`Aktif`, terdaftar),
  `PSN-0019` PP Nurul Iman Batu (`Aktif`, terdaftar), `PSN-0020` PP Darussalam
  Kediri (`Aktif` tetapi **tanpa akun Pesantren aktif** → tidak terdaftar, kasus
  batas D-08/D-09), `PSN-0021` (`Persiapan`, tidak tampil di pemilih),
  `PSN-0023` (`Nonaktif`, arsip internal D-08), `PSN-0024` UNIDA Gontor
  (`Aktif` tanpa akun Pesantren → belum terdaftar).
- **6 akun:** `USR-001` Super Admin, `USR-002` + `USR-005` Validator,
  `USR-003` + `USR-004` Pesantren (satu per pesantren terdaftar), `USR-006`
  Pesantren `Menunggu` (belum membuat pesantrennya terdaftar). Kartu login demo
  tetap 3 peran.
- **19 laporan:** 14 `lapor-cepat` + 5 `penilaian-mandiri`; status: 2 `Menunggu
  validasi`, 5 `Terbit` (penilaian mandiri, D-32), 2 `Ditolak` (alasan ≥10), dan
  10 `Diterima` (termasuk `RPT-0017` arsip `Completed` D-07 yang tidak tampil
  publik).
- **9 temuan + 9 rekomendasi:** seluruh 6 kategori K3 + baris `Belum
  dipetakan`; level risiko `Rendah/Sedang/Tinggi/Ekstrem` (satu `Ekstrem`
  demo D-15.b); satu temuan tanpa titik; satu temuan `Terverifikasi` di laporan
  `Proses` (D-05 satu laporan banyak temuan); satu `Dibatalkan` (D-21).
  Status rekomendasi mencakup `Belum ditindaklanjuti`, `Berjalan`, `Menunggu
  verifikasi`, `Terverifikasi`, `Dibatalkan` (progres 0–100, PIC, tenggat,
  bukti bervariasi). Penilaian mandiri tidak lagi menyumbang temuan (D-32).
- **SAM-iSAFE:** 5 kategori `SAM-KAT-01…05`, 27 soal `SAM-Q-*`, 4 pengamatan
  `SAM-0001…0004` (`SAM-0004` `Berlangsung` dengan jawaban sebagian), 2 tindak
  lanjut `SMF-0001/0002`.
- **Audit + notifikasi:** 18 `audit_events` + 4 `notifications`.
- **Lokasi:** denah ilustrasi + titik untuk kedua pesantren terdaftar, 4 gedung,
  12 area (snapshot `INS-v2.0` sebagai sumber indeks + tren 6 periode
  ilustratif Mar–Agu 2026).
- **Bank:** `INS-v2.0` (6 kategori K3, 6 dimensi, 59 indikator) →
  bank live `INS-LIVE` turunan (D-24/D-44); `INS-v1.0` diarsipkan untuk reproduksi
  snapshot lama. Katalog di `INSTRUMEN_MANDIRI.md`; mapping lama→baru di
  `KATEGORI_K3.md` §4.
- **Counter seed:** `counters.report = 20`, `counters.institution = 23` (nomor
  berikutnya; `> 0` adalah syarat validator lama).

**Catatan validasi seed:** seed hanya menjamin **dua** pesantren terdaftar
(`PSN-0018`, `PSN-0019`), bukan tiga, karena `PSN-0020` sengaja tanpa akun
Pesantren aktif. Pilih skenario seed setelah D-09; lihat `DATA_REQUIREMENTS.md`
§8. Seed tidak boleh membuat pesantren muncul dengan mengabaikan syarat
pengelola aktif. Lokasi demo mengikuti kebijakan D-11.
