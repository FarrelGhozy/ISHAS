// Tipe domain ISHAS — mengikuti docs DATA_MODEL.md §1–§2 (sketsa v4).
// Semua relasi memakai ID stabil; label tampilan bukan kunci.

export type InstitutionStatus = "Persiapan" | "Aktif" | "Nonaktif";
export type RoleId = "admin" | "peneliti" | "pengelola";
export type RoleLabel = "Super Admin" | "Peneliti" | "Pengelola Pesantren";
export type ReportChannel = "lapor-cepat" | "penilaian-mandiri";
export type ValidationStatus = "Menunggu validasi" | "Diterima" | "Ditolak";
export type Severity = "Belum ditentukan" | "Tinggi" | "Sedang" | "Rendah";
export type Priority = "Belum ditentukan" | "Tinggi" | "Sedang" | "Rendah";
export type HandlingStatus =
  | "Menunggu validasi"
  | "Pending"
  | "Proses"
  | "Completed"
  | "Ditolak";
export type InstrumentStatus = "Draft" | "Published" | "Archived";
export type RecommendationStatus =
  | "Belum ditindaklanjuti"
  | "Berjalan"
  | "Menunggu verifikasi"
  | "Terverifikasi";

export type Institution = {
  code: string; // 'PSN-0018', unik, dibuat berurutan PSN-XXXX
  name: string; // unik, maks 120
  location: string; // 'Kota Malang'
  manager: string; // nama pengelola utama (teks)
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
  institution: string; // nama tampilan lingkup ('Seluruh sistem' utk admin/peneliti)
  institutionCodes: string[]; // pengelola: tepat 1 kode; admin/peneliti: []
  status: "Aktif" | "Menunggu" | "Nonaktif";
  lastActive: string;
};

export type Report = {
  id: string; // 'RPT-0001', berurutan
  channel: ReportChannel;
  institutionCode: string; // FK Institution.code
  reporterName: string; // 2–100 karakter, wajib; tanpa opsi anonim (D-02)
  reporterAccountEmail?: string; // terisi bila dikirim saat login (pengelola)
  title: string; // 10–140 (lapor-cepat) / judul otomatis (penilaian-mandiri)
  description: string;
  areaId?: string; // FK Area.id
  manualLocation?: string; // lokasi pelapor bila belum tersedia di daftar area (D-11)
  planPoint?: { x: number; y: number } | null; // 0–100
  evidenceName?: string; // nama file dummy
  contact?: string;
  instrumentVersionId?: string; // wajib bila kanal penilaian-mandiri
  validationStatus: ValidationStatus;
  severity: Severity; // 'Belum ditentukan', hanya pengelola yang mengubah
  priority: Priority;
  handlingStatus: HandlingStatus;
  rejectionReason?: string; // wajib bila Ditolak, min 10
  validationNote?: string;
  validatedBy?: string;
  validatedAt?: string;
  archivedAt?: string;
  archivedReason?: string;
  createdAt: string;
};

export type IndicatorAnswer = {
  value: string;
  note: string;
  evidenceName: string;
  areaId: string;
  planPoint: { x: number; y: number } | null;
};

export type SelfAssessmentSnapshot = {
  reportId: string; // FK Report
  instrumentVersionId: string;
  submittedAt: string;
  answers: Record<string, IndicatorAnswer>; // key = indicatorId
};

export type SelfAssessmentDraft = {
  // belum dikirim; per perangkat (localStorage) — kebijakan lama menunggu D-10
  id: string; // 'SELF-0001'
  institutionCode: string;
  reporterName: string;
  instrumentVersionId: string; // terkunci ke Published aktif
  answers: Record<string, Partial<IndicatorAnswer>>;
  activeIndex: number;
  updatedAt: string;
};

export type RiskFinding = {
  id: string; // RSK-<reportId>-<n>
  reportId: string; // FK Report (pengganti penugasan V1)
  areaId: string;
  buildingId: string;
  instrumentVersion: string;
  recommendationId: string;
  location: string;
  building: string;
  zone: string;
  floor: string;
  x: number;
  y: number;
  level: "Tinggi" | "Sedang" | "Rendah";
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
  residualRisk: "Tinggi" | "Sedang" | "Rendah" | "Belum dinilai";
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

export type InstrumentVersion = {
  id: string; // 'INS-v1.0'
  label: string;
  status: InstrumentStatus;
  publishedAt?: string;
  dimensions: {
    id: string;
    name: string;
    indicators: {
      id: string; // 'IND-XXX-000'
      code: string;
      title: string;
      prompt: string;
      answerType: "likert-1-5" | "boolean-ya-tidak" | "likert-1-2-tidak";
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
  instrumentVersions: InstrumentVersion[];
  activeInstrumentVersionId: string | null;
  auditEvents: AuditEvent[];
  notifications: Notification[];
  // Riwayat indeks ilustratif per pesantren (periode lampau). Titik periode berjalan
  // TIDAK disimpan: selalu dihitung dari snapshot `Diterima` (aturan ilustrasi D-04).
  indexHistory: Record<string, IndexPoint[]>;
  counters: { report: number; institution: number };
};
