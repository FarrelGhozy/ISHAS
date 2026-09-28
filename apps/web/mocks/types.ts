// Tipe domain ISHAS — mengikuti docs DATA_MODEL.md §1–§2 (sketsa v4).
// Semua relasi memakai ID stabil; label tampilan bukan kunci.

import type { K3CategoryId } from "./kategori-k3";

export type RiskLevel = "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"; // D-15.b, asumsi prototipe

export type InstitutionStatus = "Persiapan" | "Aktif" | "Nonaktif";
export type RoleId = "admin" | "validator" | "pesantren";
export type RoleLabel = "Super Admin" | "Validator" | "Pesantren";
export type ReportChannel = "lapor-cepat" | "penilaian-mandiri";
export type ValidationStatus = "Menunggu validasi" | "Diterima" | "Ditolak";
export type Severity = "Belum ditentukan" | "Tinggi" | "Sedang" | "Rendah";
export type Priority = "Belum ditentukan" | "Tinggi" | "Sedang" | "Rendah";
export type HandlingStatus = "Menunggu validasi" | "Pending" | "Proses" | "Completed" | "Ditolak";
export type InstrumentStatus = "Draft" | "Published" | "Archived";
export type InstrumentDocVisibility = "Public" | "Privat";

// D-16: pustaka detail indikator — satu PDF per indikator, independen dari
// versioning instrumen. Blob PDF di IndexedDB perangkat-lokal.
export type InstrumentDoc = {
  id: string; // 'DOC-IND-K3L-001' stabil per indicatorId
  indicatorId: string; // FK indikator INS-v1.1 ('IND-K3L-*')
  categoryId?: string; // denormalisasi untuk filter (KAT-*)
  aspectId?: string; // denormalisasi (ASP-*)
  fileName: string;
  fileSize: number; // bytes
  mime: "application/pdf";
  assetId: string; // blob di IndexedDB perangkat-lokal
  visibility: InstrumentDocVisibility; // default 'Privat'
  // D-16.g: entri dokumen buatan Validator (tidak ada di katalog versi).
  indicatorCode?: string;
  indicatorTitle?: string;
  manual?: boolean;
  updatedBy: string;
  updatedAt: string;
};
export type RecommendationStatus =
  "Belum ditindaklanjuti" | "Berjalan" | "Menunggu verifikasi" | "Terverifikasi" | "Dibatalkan";

export type Institution = {
  activeCampusPlanVersionId?: string;
  code: string; // 'PSN-0018', unik, dibuat berurutan PSN-XXXX
  name: string; // unik, maks 120
  location: string; // 'Kota Malang' (kota/kabupaten; alamat lengkap di address bila ada)
  address?: string; // alamat lengkap onboarding (FLOWS §1); publik hanya kota/kabupaten (D-02)
  manager: string; // nama penanggung jawab utama (teks tampilan; relasi resmi via User.institutionCodes)
  users?: number; // count turunan (DATA_MODEL §2); dihitung, bukan input
  assessment: "Belum dimulai" | "Berjalan" | "Draft" | "Selesai"; // warisan V1; pemetaan menunggu D-04
  status: InstitutionStatus;
};

export type User = {
  id: string; // 'USR-001'
  name: string;
  email: string;
  initials: string;
  role: RoleLabel;
  roleId: RoleId;
  institution: string; // nama tampilan lingkup ('Seluruh sistem' utk admin/validator)
  institutionCodes: string[]; // pesantren: tepat 1 kode; admin/validator: []
  status: "Aktif" | "Menunggu" | "Nonaktif";
  lastActive: string;
};

export type InstrumentAnswerType =
  | "ya-tidak"
  | "kualitas-1-5"
  | "frekuensi"
  | "keparahan"
  // Warisan versioning lama (D-24: hanya dibaca untuk snapshot lama,
  // indikator baru memakai 4 tipe di atas).
  | "likert-1-5"
  | "boolean-ya-tidak"
  | "likert-1-2-tidak";

// D-24: bank data — tiap opsi jawaban punya bobot 0–100 + flag temuan.
export type InstrumentOption = {
  value: string;
  label: string;
  weight: number; // 0–100, diatur Validator lewat tombol Atur Bobot
  isFinding: boolean; // true = jawaban ini memicu kandidat temuan ilustratif
};

export type InstrumentIndicator = {
  id: string; // 'IND-K3L-001' stabil
  code: string;
  title: string;
  prompt: string;
  categoryId?: K3CategoryId;
  aspectId?: string;
  answerType: InstrumentAnswerType;
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
  weight: number; // pengali indikator, default 1
  options: InstrumentOption[];
  // Warisan versioning lama (bacaan legacy).
  findingTrigger?: string;
};

export type InstrumentDimension = {
  id: string;
  name: string;
  categoryId?: K3CategoryId;
  description?: string;
  aspects?: { id: string; name: string }[];
  indicators: InstrumentIndicator[];
};

// D-24: satu bank instrumen live (tanpa Draft/Published/Archived).
export type Instrument = {
  id: string; // 'INS-LIVE'
  label: string;
  updatedAt: string;
  checksum: string;
  dimensions: InstrumentDimension[];
};

// Copy beku soal saat kirim (audit + PDF + skor tidak berubah bila bank diedit).
export type FrozenIndicator = {
  id: string;
  code: string;
  title: string;
  prompt: string;
  dimensionId: string;
  dimensionName: string;
  categoryId?: K3CategoryId;
  aspectId?: string;
  answerType: InstrumentAnswerType;
  weight: number;
  options: InstrumentOption[];
};

export type Report = {
  locationSnapshot?: LocationSnapshot;
  id: string; // 'RPT-0001', berurutan
  channel: ReportChannel;
  institutionCode: string; // FK Institution.code
  categoryId?: K3CategoryId; // D-15/D-19: kategori pilihan pelapor (opsional, cascading)
  aspectId?: string; // D-15/D-19: aspek pilihan pelapor (opsional)
  indicatorId?: string; // D-19: warisan lapor-cepat lama; lapor-cepat baru tidak mengisi
  reporterSeverity?: Severity; // D-19: usulan mandiri pelapor (opsional, default 'Belum ditentukan')
  reporterPriority?: Priority; // D-19: usulan mandiri pelapor (opsional, default 'Belum ditentukan')
  reporterName: string; // 2–100 karakter, wajib; tanpa opsi anonim (D-02)
  reporterUserId?: string; // FK User.id bila dikirim saat login (DATA_REQUIREMENTS §2); email bukan kunci relasi
  reporterAccountEmail?: string; // terisi bila dikirim saat login (pengelola)
  title: string; // 10–140 (lapor-cepat) / judul otomatis (penilaian-mandiri)
  description: string;
  areaId?: string; // FK Area.id
  manualLocation?: string; // lokasi pelapor bila belum tersedia di daftar area (D-11)
  planPoint?: { x: number; y: number } | null; // 0–100
  evidenceName?: string; // nama lampiran; data lama dapat hanya berupa nama dummy
  evidenceAssetId?: string; // blob bukti privat di IndexedDB perangkat-lokal
  contact?: string;
  instrumentVersionId?: string; // warisan versioning (bacaan legacy); kiriman baru memakai snapshot beku
  instrumentChecksum?: string; // D-24: checksum bank live saat kirim
  scorePercent?: number | null; // D-24: skor % beku penilaian-mandiri (sumber agregat + PDF)
  pdfGeneratedAt?: string; // D-24: waktu PDF laporan dibuat (tampil publik setelah Diterima)
  validationStatus: ValidationStatus;
  severity: Severity; // keputusan final, 'Belum ditentukan' sampai akun Pesantren menerima (D-19)
  priority: Priority;
  handlingStatus: HandlingStatus;
  rejectionReason?: string; // wajib bila Ditolak, min 10
  validationNote?: string;
  validatedBy?: string; // FK User.id akun Pesantren (keputusan moderasi)
  validatedByName?: string; // snapshot nama akun Pesantren saat keputusan (anti rewrite histori)
  validatedByRole?: string; // snapshot peran akun Pesantren saat keputusan
  validatedAt?: string;
  archivedAt?: string;
  archivedReason?: string;
  createdAt: string;
  submittedAt?: string; // waktu kirim (beda dari createdAt bila relevan)
  observedAt?: string; // waktu observasi (bukan nama pelapor)
  updatedAt?: string; // perubahan penanganan terakhir
  correctionOf?: string; // FK Report.id asal bila koreksi lewat laporan baru (D-07)
};

export type IndicatorAnswer = {
  locationSnapshot?: LocationSnapshot;
  value: string;
  note: string;
  evidenceName: string;
  evidenceAssetId?: string; // D-27: blob foto upload (IndexedDB perangkat pengunggah)
  areaId: string;
  manualLocation?: string; // deskripsi manual bila area tak tersedia (D-11)
  planPoint: { x: number; y: number } | null;
};

export type SelfAssessmentSnapshot = {
  reportId: string; // FK Report
  instrumentVersionId: string; // warisan versioning (bacaan legacy; kiriman baru = 'INS-LIVE')
  instrumentChecksum?: string; // D-24: checksum bank live saat kirim
  submittedAt: string;
  answers: Record<string, IndicatorAnswer>; // key = indicatorId
  frozenIndicators?: FrozenIndicator[]; // D-24: copy beku soal + opsi + bobot
  scorePercent?: number | null; // D-24: skor % beku (sumber agregat + PDF)
  byDimension?: Record<string, number | null>; // D-24: skor % per dimensi
};

export type SelfAssessmentDraft = {
  // belum dikirim; per perangkat — D-24: checksum beda = ulang dari awal
  id: string; // 'SELF-0001'
  institutionCode: string;
  reporterName: string; // nama penilai (registrasi di atas form)
  contact?: string; // kontak penilai opsional (klarifikasi, maks 100)
  reporterUserId?: string; // pemilik draft pada perangkat bersama
  instrumentVersionId: string; // warisan versioning (kiriman baru = 'INS-LIVE')
  instrumentChecksum?: string; // D-24: checksum bank saat draft dibuat
  answers: Record<string, Partial<IndicatorAnswer>>;
  activeIndex: number;
  updatedAt: string;
  submittedReportId?: string; // tautan kiriman setelah sukses (anti kirim ganda)
};

export type RiskFinding = {
  locationSnapshot?: LocationSnapshot;
  sourceAnswerId?: string;
  id: string; // RSK-<reportId>-<n>
  reportId: string; // FK Report (pengganti penugasan V1)
  areaId: string;
  buildingId: string;
  instrumentVersion: string;
  categoryId?: K3CategoryId; // D-15: turunan indikator; kosong = Belum dipetakan
  aspectId?: string; // D-15
  recommendationId: string;
  location: string;
  building: string;
  zone: string;
  floor: string;
  x: number;
  y: number;
  level: RiskLevel;
  issue: string;
  indicator: string;
  recommendation: string;
  status: RecommendationStatus;
  hazard: string;
  impact: string;
  likelihood: string;
  severityText: string;
  exposedPeople: string;
  existingControl: string;
  evidence: string;
  observedAt: string;
  planVersion: string;
  residualRisk: RiskLevel | "Belum dinilai";
};

export type Recommendation = {
  id: string; // REC-<reportId>-<n>
  reportId: string;
  priority: "Tinggi" | "Sedang" | "Rendah";
  title: string;
  location: string;
  source: string; // 'IND-SAR-001 · RPT-0001'
  action: string;
  status: RecommendationStatus;
  owner: string;
  dueDate: string;
  progress: number; // 0–100
  lastNote?: string;
  completionEvidence?: string;
  completionEvidenceAssetId?: string; // D-21: blob bukti upload (privat, IndexedDB)
  canceledReason?: string; // D-21: wajib min 10 bila Dibatalkan (tampil publik)
  canceledBy?: string; // FK User.id pembatal
  canceledAt?: string;
  updatedAt?: string; // perubahan terakhir (pelaku tercatat di audit)
  verifiedBy?: string; // FK User.id pemeriksa penyelesaian (D-06)
  verifiedAt?: string;
};

export type Building = {
  id: string;
  institutionCode: string;
  code: string;
  name: string;
  floors: Floor[];
};

export type Floor = {
  id: string;
  name: string;
  planFile: string; // nama file dummy
  planVersion: string; // 'DENAH-v1'
  uploadedBy: string;
  uploadedAt: string;
  // Riwayat tidak ditimpa; observasi lama dapat tetap merujuk versi yang dipakai.
  planHistory?: { version: string; fileName: string; uploadedBy: string; uploadedAt: string }[];
};

export type Area = {
  id: string;
  institutionCode: string;
  buildingId: string;
  name: string;
  floor: string;
  zone: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Warisan versioning (D-24: hanya bacaan legacy + migrasi; UI baru memakai `Instrument`).
export type InstrumentVersion = {
  id: string; // 'INS-v1.0'
  label: string;
  status: InstrumentStatus;
  publishedAt?: string;
  dimensions: {
    id: string;
    name: string;
    categoryId?: K3CategoryId; // D-15: dimensi = wadah satu kategori
    description?: string;
    aspects?: { id: string; name: string }[];
    indicators: {
      id: string; // 'IND-XXX-000'
      code: string;
      title: string;
      prompt: string;
      categoryId?: K3CategoryId; // D-15
      aspectId?: string; // D-15
      answerType: InstrumentAnswerType;
      required: boolean;
      evidenceRequired: boolean;
      locationRequired: boolean;
      findingTrigger: string; // contoh konfigurasi seed ilustratif, bukan aturan final
    }[];
  }[];
};

export type AuditEvent = {
  id: string; // 'AUD-DEMO-001'
  objectType: string;
  objectId: string;
  actorAccountId?: string;
  actorName: string;
  actorRole?: RoleLabel | "Publik";
  institutionCode?: string;
  action: string;
  at: string;
  note?: string;
};

export type Notification = {
  id: string; // 'NOT-001'
  recipientAccountId?: string; // tanpa penerima = siaran scope
  institutionCode?: string;
  sourceObjectId: string;
  message: string;
  targetUrl: string;
  at: string;
  read: boolean;
};

export type IndexPoint = {
  period: string; // 'Agu 2026' — periode ilustratif seed
  index: number; // 0–100, ilustrasi; rumus final menunggu D-04
};

export type IshasState = {
  campusPlans: CampusPlanVersion[];
  schemaVersion: number;
  institutions: Institution[];
  users: User[];
  reports: Report[];
  selfAssessmentDrafts: Record<string, SelfAssessmentDraft>;
  selfAssessmentSnapshots: SelfAssessmentSnapshot[];
  findings: RiskFinding[];
  recommendations: Recommendation[];
  buildings: Building[];
  areas: Area[];
  instrument: Instrument; // D-24: bank live (sumber pengisian baru)
  instrumentVersions: InstrumentVersion[]; // warisan versioning (bacaan legacy)
  activeInstrumentVersionId: string | null; // warisan versioning (bacaan legacy)
  instrumentDocs: InstrumentDoc[]; // D-16: pustaka PDF per indikator
  samCategories: SamCategory[]; // D-26: bank kategori SAM-iSAFE
  samQuestions: SamQuestion[]; // D-26: bank pertanyaan SAM-iSAFE
  samAssessments: SamAssessment[]; // D-26: pengamatan Validator
  samFollowUps: SamFollowUp[]; // D-26.e: tindak lanjut temuan SAM-iSAFE
  auditEvents: AuditEvent[];
  notifications: Notification[];
  // Riwayat indeks ilustratif per pesantren (periode lampau). Titik periode berjalan
  // TIDAK disimpan: selalu dihitung dari snapshot `Diterima` (aturan ilustrasi D-04).
  indexHistory: Record<string, IndexPoint[]>;
  counters: { report: number; institution: number };
};

// D-26: SAM-iSAFE khusus Validator — bank dinamis + pengamatan.
// Skor per soal 0/1/2; maksimum dinamis = COUNT(aktif) x 2.
export type SamAssessmentStatus = "Draft" | "Berlangsung" | "Selesai";
export type SamRiskLevel = "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi";
export type SamCategory = {
  id: string; // 'SAM-KAT-01' stabil
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};
export type SamQuestion = {
  id: string; // 'SAM-Q-001' stabil
  categoryId: string;
  text: string;
  panduan: string; // D-26.f: cara mengamati, bisa diubah Validator
  contohBukti: string; // D-26.f: contoh bukti foto, bisa diubah Validator
  sortOrder: number;
  isActive: boolean;
};
export type SamAnswer = {
  score: 0 | 1 | 2;
  note: string;
  evidenceName?: string; // D-26.e: nama foto bukti (blob privat IndexedDB)
  evidenceAssetId?: string; // D-26.e: ID blob bukti privat perangkat-lokal
};
// D-26.e: tindak lanjut temuan SAM-iSAFE (skor 0/1), dikelola Validator.
export type SamFollowUpStatus =
  | "Belum ditindaklanjuti"
  | "Berjalan"
  | "Selesai"
  | "Dibatalkan";
export type SamFollowUp = {
  id: string; // 'SMF-0001' berurutan
  assessmentId: string; // FK SamAssessment.id
  questionId: string; // FK SamQuestion.id (temuan sumber)
  title: string; // turunan teks pertanyaan
  note?: string;
  pic: string; // penanggung jawab
  dueDate: string; // tanggal ISO, tidak masa lalu
  status: SamFollowUpStatus;
  createdBy?: string; // FK User.id
  createdAt: string;
  updatedAt: string;
  doneAt?: string;
  cancelReason?: string; // wajib min 10 bila Dibatalkan
};
export type SamAssessment = {
  id: string; // 'SAM-0001' berurutan
  institutionCode: string;
  areaId?: string;
  manualLocation?: string;
  observedAt: string; // tanggal ISO
  observedTime?: string; // 'HH:MM'
  kind: string; // Rutin/Khusus/Pasca Insiden/Evaluasi
  observerName: string;
  note?: string;
  observerAccountId?: string;
  status: SamAssessmentStatus;
  answers: Record<string, SamAnswer>;
  totalScore: number;
  maxScore: number;
  percent: number;
  riskLevel: SamRiskLevel;
  createdAt: string;
  completedAt?: string;
  reviewedBy?: string; // D-26.e: nama Validator pereview
  reviewedById?: string; // D-26.e: FK User.id pereview
  reviewedAt?: string;
  reviewNote?: string;
};

export type PlanPoint = { x: number; y: number };
export type LocationSnapshot = {
  areaId?: string;
  locationText: string;
  floorNote: string;
  campusPlanVersionId: string | null;
  point: PlanPoint | null;
};
export type CampusPlanVersion = {
  id: string;
  institutionCode: string;
  revision: number;
  assetId: string;
  width: number;
  height: number;
  uploadedBy: string;
  uploadedAt: string;
  illustration: boolean;
};
