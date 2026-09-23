# Model Data Frontend (Skema Rinci)

## Kontrak pembacaan dashboard — 18 September 2026

Schema v6 mengikuti D-15 yang sudah ditambahkan. Tidak ada migrasi baru pada
penyempurnaan ini. Katalog indikator hanya Published; klasifikasi jawaban memakai
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

**Status: sketsa awal, belum kontrak yang siap dibuat menjadi kode.** Audit menemukan jawaban
terkirim, hasil/periode, akun sesi, audit/notifikasi, dan riwayat denah belum lengkap. Baca
`DATA_REQUIREMENTS.md` sebelum memakai skema di bawah. D-01–D-03 telah dijawab (8 September 2026);
keputusan D-04–D-11 masih memengaruhi isinya.

## 0. Versi schema 

- Calon `MOCK_STORAGE_KEY`: `ishas-mock-v7`. Aplikasi ISHAS
- `MOCK_SCHEMA_VERSION`: `7` (v7 menambah pustaka detail indikator D-16:
  `instrumentDocs` + blob PDF di IndexedDB `ishas-instrument-docs-v1`).
- Rancangan pemeriksaan state yang benar-benar dibaca dari key : jika `schemaVersion !== 7`, pulihkan seed.
- Migrasi v6→v7 mempertahankan seluruh record/ID; hanya menambah
  `instrumentDocs` (seed 2 Public + 2 Privat ilustrasi). Snapshot/temuan lama
  tidak dihitung ulang.

```ts
type InstrumentDocVisibility = 'Public' | 'Privat';
type InstrumentDoc = {
  id: string; // 'DOC-IND-K3L-001' stabil per indicatorId
  indicatorId: string; // FK indikator INS-v1.1 ('IND-K3L-*')
  categoryId?: string; // denormalisasi untuk filter (KAT-*)
  aspectId?: string; // denormalisasi (ASP-*)
  fileName: string; // 'detail-xxx.pdf'
  fileSize: number; // bytes, maks prototipe 10 MB
  mime: 'application/pdf';
  assetId: string; // blob di IndexedDB perangkat-lokal
  visibility: InstrumentDocVisibility; // default 'Privat'
  indicatorCode?: string; // D-16.g: denormalisasi entri manual
  indicatorTitle?: string; // D-16.g: denormalisasi entri manual
  manual?: boolean; // true = entri dokumen buatan Peneliti (bukan katalog versi)
  updatedBy: string; updatedAt: string;
};
```
- D-16.g: entri dokumen buatan Peneliti memakai field opsional
  `indicatorCode/indicatorTitle/manual`; skema tetap `v7` (aditif, tanpa migrasi
  baru) dan tidak mengubah `instrumentVersions`.
- Migrasi v5→v6 mempertahankan seluruh record/ID; hanya menambah field
  (`categoryId/aspectId` fallback, `level` tetap valid). Snapshot `INS-v1.0` tidak dihitung ulang.

## 1. Enum (nilai persis, case-sensitive)

```ts
type InstitutionStatus = 'Persiapan' | 'Aktif' | 'Nonaktif';
type RoleId = 'admin' | 'peneliti' | 'pengelola'; // 'asesor' DIHAPUS
type RoleLabel = 'Super Admin' | 'Peneliti' | 'Pengelola Pesantren';
type ReportChannel = 'lapor-cepat' | 'penilaian-mandiri';
type ValidationStatus = 'Menunggu validasi' | 'Diterima' | 'Ditolak';
type Severity = 'Belum ditentukan' | 'Tinggi' | 'Sedang' | 'Rendah';
type Priority = 'Belum ditentukan' | 'Tinggi' | 'Sedang' | 'Rendah';
type HandlingStatus =
 | 'Menunggu validasi' | 'Pending' | 'Proses' | 'Completed' | 'Ditolak';
// 'Dihapus' (FLOWS §5) bukan nilai tersimpan: record dihapus beserta temuan + audit tetap ada;
// alternatif arsip alih-alih hapus menunggu D-07.
type InstrumentStatus = 'Draft' | 'Published' | 'Archived';
type KategoriK3Id = 'KAT-KESELAMATAN' | 'KAT-KESEHATAN' | 'KAT-LINGKUNGAN' | 'KAT-PSIKOSOSIAL';
type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Ekstrem'; // D-15.b, asumsi prototipe
type RecommendationStatus =
 | 'Belum ditindaklanjuti' | 'Berjalan' | 'Menunggu verifikasi' | 'Terverifikasi';
```

## 2. Entitas

```ts
type Institution = {
 code: string; // 'PSN-0018', unik, dibuat berurutan PSN-XXXX
 name: string; // unik, maks 120
 location: string; // 'Kota Malang'
 manager: string; // nama pengelola utama (teks)
 users: number; // count turunan, bukan input
 assessment: 'Belum dimulai' | 'Berjalan' | 'Draft' | 'Selesai'; // field lama (tidak dipakai sebagai status resmi); hubungan dengan hasil/periode belum dipetakan (D-04)
 status: InstitutionStatus;
};
// TERDAFTAR = status 'Aktif' DAN ada user roleId pengelola + institutionCodes
// memuat code ini + status user 'Aktif'. Selain itu tidak tampil di pemilih.

type User = {
 id: string; // 'USR-001'
 name: string; email: string; initials: string;
 role: RoleLabel; roleId: RoleId;
 institution: string; // nama tampilan lingkup ('Seluruh sistem' utk admin/peneliti)
 institutionCodes: string[]; // pengelola: tepat 1 kode; admin/peneliti: []
 status: 'Aktif' | 'Menunggu' | 'Nonaktif';
 lastActive: string;
};

type Report = {
  id: string; // 'RPT-0001', berurutan
  channel: ReportChannel;
  institutionCode: string; // FK Institution.code
  categoryId?: string; // kategori pilihan pelapor (opsional, D-15); validasi konsistensi di store
  aspectId?: string; // aspek pilihan pelapor (opsional, D-15)
  indicatorId?: string; // indikator terkait pilihan pelapor (opsional, D-15)
 reporterName: string; // 2-100 karakter, wajib; selalu tampil apa adanya secara internal (tanpa opsi anonim, D-02)
 reporterAccountEmail?: string; // terisi bila dikirim saat login (pengelola)
 title: string; // 10-140 (lapor-cepat) / judul otomatis (penilaian-mandiri)
 description: string; // min 20 (lapor-cepat) / ringkasan otomatis dari jawaban terkirim (penilaian-mandiri; aturan penyusunannya belum ditetapkan, D-04/D-05)
 areaId?: string; // FK Area.id; kebijakan tanpa area menunggu D-11
 planPoint?: { x: number; y: number } | null; // 0-100
 evidenceName?: string; // nama lampiran; data lama bisa hanya berupa nama dummy
 evidenceAssetId?: string; // ID blob bukti privat di IndexedDB perangkat-lokal (/lapor)
 contact?: string;
 instrumentVersionId?: string; // wajib bila channel penilaian-mandiri
 validationStatus: ValidationStatus;
 severity: Severity; // default 'Belum ditentukan', hanya pengelola yang mengubah
 priority: Priority; // idem
 handlingStatus: HandlingStatus;
 rejectionReason?: string; // wajib bila Ditolak, min 10
 validationNote?: string;
 validatedBy?: string; validatedAt?: string;
 createdAt: string;
};

type SelfAssessmentDraft = { // belum dikirim; per perangkat (localStorage)
 id: string; // 'SELF-0001'
 institutionCode: string; reporterName: string;
 instrumentVersionId: string; // terkunci ke Published aktif
 answers: Record<string, { value: string; note: string; evidenceName: string;
 areaId: string; planPoint: { x: number; y: number } | null }>;
 activeIndex: number; updatedAt: string;
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
// Format ID: BLD-001, FLR-001, AREA-001, RPT-0001, SELF-0001,
// REC-<reportId>-<n>, RSK-<reportId>-<n>, INS-v1.0, IND-XXX-000,
// AUD-DEMO-001, NOT-001 — semuanya stabil, tidak memakai nama sebagai kunci.
```

## 3. Aturan tampil — bidang publik mengikuti D-02 (dijawab 8 September 2026)

D-02: publik melihat **ringkasan saja** + **nama validator/PIC**. Nama/kontak pelapor, bukti,
denah rinci + titik, jawaban mentah, alasan penolakan, dan audit tidak publik. Arsip pesantren
nonaktif menunggu D-08.

- Dashboard/hasil/peta/rekomendasi/laporan pimpinan HANYA membaca `Report` dengan `validationStatus: 'Diterima'` (+ temuan/rekomendasi turunannya), dengan bidang sesuai matriks `DATA_REQUIREMENTS.md` §6.
- `Menunggu validasi` hanya terlihat di layar konfirmasi pelapor + antrean `/pengelola/validasi-laporan` pemilik scope. Tidak ada count antrean di dashboard publik (D-02).
- `Ditolak` hanya terlihat di arsip antrean pengelola pemilik scope.
- Agregat `/` dihitung dari himpunan `Diterima` lintas pesantren terdaftar; filter pesantren mempersempit ke satu `institutionCode`.

## 4. Store actions (pengganti action asesor lama)

| Action | Input | Hasil |
|---|---|---|
| `submitPublicReport` | field §FLOWS-2 + `reporterName` | `RPT-XXXX` + audit + notifikasi pengelola |
| `saveSelfAssessmentDraft` | draft parsial | tersimpan lokal, `progress` dihitung ulang |
| `submitSelfAssessment` | draft lengkap | snapshot jawaban terkirim + 1 `Report` + kandidat temuan + audit + notifikasi; ulang percobaan yang sama tidak menggandakan kiriman |
| `acceptReport` | `id` + `severity` + `priority` (+ catatan) | `Diterima/Pending`; wajib keduanya terisi |
| `rejectReport` | `id` + alasan min 10 | `Ditolak`; arsip + validator/waktu/alasan |
| `updateHandlingStatus` | `id` + status baru + syarat per transisi (PIC/tenggat/bukti) | status baru + audit |
| `deleteCompletedReport` | `id` + alasan | rancangan hapus report/temuan masih menunggu D-07; harus menetapkan dampak ke seluruh relasi dan riwayat |
| `addUser` / `addInstitution` | sama tanpa peran asesor | + pesantren baru TIDAK otomatis tampil sebelum `Aktif` + punya pengelola |
| `resetMockData` | — | kembali ke seed |

Action lama yang dihapus: semua yang menyebut `assignment`/`assessor` (`saveAssessmentDraft(assignmentId)`, `finalizeAssessment(assignmentId)`, dsb).

## 5. Seed kaya demo (agar setiap halaman dapat didemo ke dosen)

Komposisi minimum §5 lama telah diperkaya (September 2026) menjadi data demo
penuh berikut; implementasi di `apps/web/mocks/seed/seed.ts` (schema v6):

- 3 pesantren `Aktif` (`PSN-0018` PP Al-Hikmah Malang, `PSN-0019` PP Nurul Iman
  Batu, `PSN-0020` PP Darussalam Kediri) + 1 `Persiapan` (`PSN-0021`, tidak tampil
  di pemilih — untuk demo aturan). `PSN-0020` sengaja tanpa pengelola aktif
  sehingga TIDAK terdaftar: 2 pesantren terdaftar (kasus batas D-08/D-09).
- 5 akun: Super Admin, 2 Peneliti, 2 Pengelola Pesantren (satu per pesantren
  terdaftar; kartu login tetap 3 akun — akun kedua ada di data untuk demo
  isolasi scope di sisi data).
- 3 laporan `Menunggu validasi` (antrean 1 untuk PSN-0018, 2 untuk PSN-0019) +
  2 laporan `Ditolak` (arsip penolakan dengan alasan ≥ 10 karakter).
- 11 laporan `Diterima`: 3 `Pending`/6 `Proses` tampil publik (5 lapor-cepat +
  4 penilaian-mandiri) + 2 `Completed` non-arsip yang hanya tampil internal
  (demo arsip D-07). Lapor-cepat baru memakai cascading D-15
  (kategori → aspek → indikator opsional).
- 15 temuan: `Ekstrem` 1 (APAR musala — demo D-15.b + ikon Flame), `Tinggi` 4,
  `Sedang` 7, `Rendah` 3; seluruh 4 kategori K3 + baris `Belum dipetakan`
  (lapor-cepat tanpa kategori); 1 temuan tanpa titik (demo "tanpa titik") dan
  1 temuan non-fisik Psikososial tanpa titik; 1 temuan `Terverifikasi` di dalam
  laporan `Proses` (demo penyelesaian sebagian, D-05: satu laporan banyak temuan).
- 15 rekomendasi: `Belum ditindaklanjuti` 3, `Berjalan` 8,
  `Menunggu verifikasi` 1, `Terverifikasi` 3 (progres 0–100, PIC, tenggat,
  bukti penyelesaian bervariasi).
- 2 snapshot `INS-v1.1` terbaru sebagai sumber indeks (kontras demo: PSN-0018
  ≈ 58 perlu perhatian vs PSN-0019 ≈ 70 baik) + 3 snapshot `INS-v1.0` historis
  (tidak dihitung ulang); tren 6 periode ilustratif (Mar–Agu 2026) + periode
  berjalan Sep 2026.
- Lokasi: denah ilustrasi + titik untuk KEDUA pesantren terdaftar, 4 gedung,
  12 area; 15 audit event + 3 notifikasi antrean; counter laporan `17`.
- D-15: seed aktif `INS-v1.1` (4 kategori K3, 10 indikator termasuk Psikososial;
  `INS-v1.0` diarsipkan untuk reproduksi snapshot lama). Mapping lama→baru di `KATEGORI_K3.md` §4.

**Catatan validasi seed:** komposisi di atas baru menjamin dua pesantren terdaftar, bukan tiga,
karena pengelola aktif baru tersedia untuk dua pesantren. Pilih skenario seed setelah D-09;
lihat `DATA_REQUIREMENTS.md` §8. Seed tidak boleh membuat ketiga pesantren muncul dengan
mengabaikan syarat pengelola aktif. Lokasi demo juga perlu mengikuti kebijakan D-11.
