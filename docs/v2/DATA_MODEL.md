# V2 — Model Data Frontend (Skema Rinci)

Semua relasi memakai **ID stabil**; label tampilan tidak pernah menjadi kunci.
Persistensi browser berversi + reset seed. Dilarang menyimpan kata sandi/token.

**Status: sketsa awal, belum kontrak yang siap dibuat menjadi kode.** Audit menemukan jawaban
terkirim, hasil/periode, akun sesi, audit/notifikasi, dan riwayat denah belum lengkap. Baca
`DATA_REQUIREMENTS.md` sebelum memakai skema di bawah. D-01–D-03 telah dijawab (8 September 2026);
keputusan D-04–D-11 masih memengaruhi isinya.

## 0. Versi schema V2

- Calon `MOCK_STORAGE_KEY`: `ishas-mock-v4`. Aplikasi ISHAS baru terpisah dari V1 (D-01), jadi tidak ada data V1 pada origin baru; key ini murni milik aplikasi baru. Key sesi/draft terpisah — usulan di SUGGESTIONS §7.
- `MOCK_SCHEMA_VERSION`: `4`.
- Rancangan pemeriksaan state yang benar-benar dibaca dari key V2: jika `schemaVersion !== 4`, pulihkan seed V2.

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
type RecommendationStatus =
  | 'Belum ditindaklanjuti' | 'Berjalan' | 'Menunggu verifikasi' | 'Terverifikasi';
```

## 2. Entitas

```ts
type Institution = {
  code: string;            // 'PSN-0018', unik, dibuat berurutan PSN-XXXX
  name: string;            // unik, maks 120
  location: string;        // 'Kota Malang'
  manager: string;         // nama pengelola utama (teks)
  users: number;           // count turunan, bukan input
  assessment: 'Belum dimulai' | 'Berjalan' | 'Draft' | 'Selesai'; // warisan V1; hubungan dengan hasil/periode V2 belum dipetakan (D-04)
  status: InstitutionStatus;
};
// TERDAFTAR = status 'Aktif' DAN ada user roleId pengelola + institutionCodes
// memuat code ini + status user 'Aktif'. Selain itu tidak tampil di pemilih.

type User = {
  id: string;              // 'USR-001'
  name: string; email: string; initials: string;
  role: RoleLabel; roleId: RoleId;
  institution: string;     // nama tampilan lingkup ('Seluruh sistem' utk admin/peneliti)
  institutionCodes: string[]; // pengelola: tepat 1 kode; admin/peneliti: []
  status: 'Aktif' | 'Menunggu' | 'Nonaktif';
  lastActive: string;
};

type Report = {
  id: string;              // 'RPT-0001', berurutan
  channel: ReportChannel;
  institutionCode: string; // FK Institution.code
  reporterName: string;    // 2-100 karakter, wajib; selalu tampil apa adanya secara internal (tanpa opsi anonim, D-02)
  reporterAccountEmail?: string; // terisi bila dikirim saat login (pengelola)
  title: string;           // 10-140 (lapor-cepat) / judul otomatis (penilaian-mandiri)
  description: string;     // min 20 (lapor-cepat) / ringkasan otomatis dari jawaban terkirim (penilaian-mandiri; aturan penyusunannya belum ditetapkan, D-04/D-05)
  areaId?: string;         // FK Area.id; kebijakan tanpa area menunggu D-11
  planPoint?: { x: number; y: number } | null; // 0-100
  evidenceName?: string;   // nama file dummy
  contact?: string;
  instrumentVersionId?: string; // wajib bila channel penilaian-mandiri
  validationStatus: ValidationStatus;
  severity: Severity;      // default 'Belum ditentukan', hanya pengelola yang mengubah
  priority: Priority;      // idem
  handlingStatus: HandlingStatus;
  rejectionReason?: string; // wajib bila Ditolak, min 10
  validationNote?: string;
  validatedBy?: string; validatedAt?: string;
  createdAt: string;
};

type SelfAssessmentDraft = { // belum dikirim; per perangkat (localStorage)
  id: string;              // 'SELF-0001'
  institutionCode: string; reporterName: string;
  instrumentVersionId: string; // terkunci ke Published aktif
  answers: Record<string, { value: string; note: string; evidenceName: string;
    areaId: string; planPoint: { x: number; y: number } | null }>;
  activeIndex: number; updatedAt: string;
};
// Saat kirim perlu snapshot permanen seluruh jawaban yang terkait Report.
// Sketsa ini belum memuat entitas snapshot/status kirim; lihat DATA_REQUIREMENTS §2.

type RiskFinding = {
  id: string; reportId: string; // FK Report (pengganti assignmentId V1)
  areaId: string; buildingId: string; instrumentVersion: string;
  recommendationId: string; location: string; building: string; zone: string;
  floor: string; x: number; y: number; level: 'Tinggi' | 'Sedang' | 'Rendah';
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

## 4. Store actions V2 (pengganti action asesor V1)

| Action | Input | Hasil |
|---|---|---|
| `submitPublicReport` | field §FLOWS-2 + `reporterName` | `RPT-XXXX` + audit + notifikasi pengelola |
| `saveSelfAssessmentDraft` | draft parsial | tersimpan lokal, `progress` dihitung ulang |
| `submitSelfAssessment` | draft lengkap | snapshot jawaban terkirim + 1 `Report` + kandidat temuan + audit + notifikasi; ulang percobaan yang sama tidak menggandakan kiriman |
| `acceptReport` | `id` + `severity` + `priority` (+ catatan) | `Diterima/Pending`; wajib keduanya terisi |
| `rejectReport` | `id` + alasan min 10 | `Ditolak`; arsip + validator/waktu/alasan |
| `updateHandlingStatus` | `id` + status baru + syarat per transisi (PIC/tenggat/bukti) | status baru + audit |
| `deleteCompletedReport` | `id` + alasan | rancangan hapus report/temuan masih menunggu D-07; harus menetapkan dampak ke seluruh relasi dan riwayat |
| `addUser` / `addInstitution` | sama V1 minus peran asesor | + pesantren baru TIDAK otomatis tampil sebelum `Aktif` + punya pengelola |
| `resetMockData` | — | kembali ke seed V2 |

Action V1 yang DIHAPUS: semua yang menyebut `assignment`/`assessor` (`saveAssessmentDraft(assignmentId)`, `finalizeAssessment(assignmentId)`, dsb).

## 5. Seed minimum V2 (agar demo langsung hidup)

- 3 pesantren `Aktif` (salah satunya `PSN-0018` PP Al-Hikmah Malang) + 1 `Persiapan` (tidak tampil di pemilih — untuk demo aturan).
- 3 akun demo (admin/peneliti/pengelola) + 1 pengelola kedua untuk pesantren kedua (demo scope isolation).
- 2 laporan `Menunggu validasi` (1 lapor-cepat + 1 penilaian-mandiri) untuk demo antrean.
- 3+ laporan `Diterima` lintas status (`Pending/Proses/Completed`) + temuan + rekomendasi + 1 laporan `Ditolak` (arsip).
- 1 versi instrumen `Published` aktif + 6 indikator contoh (campuran likert/boolean, bukti/lokasi wajib bervariasi) + gedung/lantai/area/denah untuk `PSN-0018`.

**Catatan validasi seed:** komposisi di atas baru menjamin dua pesantren terdaftar, bukan tiga,
karena pengelola aktif baru tersedia untuk dua pesantren. Pilih skenario seed setelah D-09;
lihat `DATA_REQUIREMENTS.md` §8. Seed tidak boleh membuat ketiga pesantren muncul dengan
mengabaikan syarat pengelola aktif. Lokasi demo juga perlu mengikuti kebijakan D-11.
