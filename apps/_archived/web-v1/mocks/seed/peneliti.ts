export type InstrumentStatus = 'Draft' | 'Published' | 'Archived';

export type RubricOption = {
  score: number;
  label: string;
  description: string;
};

export type ResearchIndicator = {
  id: string;
  code: string;
  title: string;
  prompt: string;
  answerType: string;
  weight: number;
  required: boolean;
  allowNa: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
  reference: string;
  recommendationCondition: string;
  recommendationText: string;
  rubrics: RubricOption[];
};

export type BuilderDimension = {
  id: string;
  code: string;
  name: string;
  weight: number;
  reference: string;
  plannedIndicators: number;
  indicators: ResearchIndicator[];
};

export const instrumentVersions: Array<{
  id: string;
  name: string;
  status: InstrumentStatus;
  updated: string;
  author: string;
  dimensions: number;
  indicators: number;
  note: string;
}> = [
  {
    id: 'INS-v1.1-RC2',
    name: 'ISHAS v1.1 — Kandidat Rilis 2',
    status: 'Draft',
    updated: 'Hari ini, 10.24',
    author: 'Dr. M. Ridwan',
    dimensions: 4,
    indicators: 52,
    note: 'Penyempurnaan rubric sanitasi dan kesiapsiagaan.',
  },
  {
    id: 'INS-v1.0',
    name: 'ISHAS v1.0',
    status: 'Published',
    updated: '18 Feb 2026',
    author: 'Tim Riset K3L',
    dimensions: 4,
    indicators: 48,
    note: 'Versi aktif pada 124 assessment lapangan.',
  },
  {
    id: 'INS-v0.9',
    name: 'ISHAS v0.9 — Pilot',
    status: 'Archived',
    updated: '4 Nov 2025',
    author: 'Tim Riset K3L',
    dimensions: 4,
    indicators: 44,
    note: 'Versi uji coba awal untuk dua pesantren.',
  },
];

export const instrumentDimensions = [
  {
    code: 'DIM-01',
    name: 'Sarana & Bangunan Fisik',
    indicators: 12,
    weight: 25,
    completeness: 100,
    source: 'Permenaker dan standar bangunan terkait',
  },
  {
    code: 'DIM-02',
    name: 'Sanitasi & Kesehatan Lingkungan',
    indicators: 14,
    weight: 30,
    completeness: 86,
    source: 'Standar kesehatan lingkungan pesantren',
  },
  {
    code: 'DIM-03',
    name: 'Perilaku Keselamatan & Budaya K3',
    indicators: 12,
    weight: 25,
    completeness: 75,
    source: 'Konstruk perilaku dan budaya keselamatan',
  },
  {
    code: 'DIM-04',
    name: 'Kesiapsiagaan Tanggap Darurat',
    indicators: 14,
    weight: 20,
    completeness: 71,
    source: 'Prosedur tanggap darurat dan evakuasi',
  },
];

export const defaultRubrics: RubricOption[] = [
  {
    score: 1,
    label: 'Kritis',
    description: 'Belum memenuhi kebutuhan minimum.',
  },
  {
    score: 2,
    label: 'Perlu perbaikan',
    description: 'Sudah tersedia, tetapi belum memadai.',
  },
  {
    score: 3,
    label: 'Baik',
    description: 'Memenuhi kriteria operasional contoh.',
  },
  {
    score: 4,
    label: 'Sangat baik',
    description: 'Memenuhi seluruh kriteria contoh.',
  },
];

export const initialBuilderDimensions: BuilderDimension[] = [
  {
    id: 'dimension-building',
    code: 'DIM-01',
    name: 'Sarana & Bangunan Fisik',
    weight: 25,
    reference: 'Permenaker dan standar bangunan terkait',
    plannedIndicators: 12,
    indicators: [
      {
        id: 'indicator-exit',
        code: 'IND-SAR-001',
        title: 'Ketersediaan jalur evakuasi',
        prompt:
          'Apakah jalur evakuasi tersedia, mudah dikenali, dan bebas hambatan?',
        answerType: 'Likert 4 tingkat',
        weight: 2,
        required: true,
        allowNa: false,
        evidenceRequired: true,
        locationRequired: true,
        reference: 'Contoh rujukan: standar proteksi kebakaran bangunan',
        recommendationCondition: 'Skor jawaban ≤ 2',
        recommendationText:
          'Tandai jalur evakuasi dan bebaskan seluruh hambatan prioritas.',
        rubrics: defaultRubrics.map((item) => ({ ...item })),
      },
      {
        id: 'indicator-electric',
        code: 'IND-SAR-002',
        title: 'Keamanan instalasi listrik',
        prompt:
          'Bagaimana kondisi instalasi listrik pada bangunan yang dinilai?',
        answerType: 'Likert 4 tingkat',
        weight: 2,
        required: true,
        allowNa: false,
        evidenceRequired: true,
        locationRequired: true,
        reference: 'Rujukan teknis belum dikonfirmasi tim penelitian',
        recommendationCondition: 'Skor jawaban = 1',
        recommendationText:
          'Lakukan pemeriksaan instalasi oleh tenaga kompeten.',
        rubrics: defaultRubrics.map((item) => ({ ...item })),
      },
    ],
  },
  {
    id: 'dimension-sanitation',
    code: 'DIM-02',
    name: 'Sanitasi & Kesehatan Lingkungan',
    weight: 30,
    reference: 'Standar kesehatan lingkungan pesantren',
    plannedIndicators: 14,
    indicators: [
      {
        id: 'indicator-toilet',
        code: 'IND-SAN-009',
        title: 'Ketersediaan jamban sehat',
        prompt: 'Apakah jumlah dan kondisi jamban memenuhi kebutuhan penghuni?',
        answerType: 'Likert 4 tingkat',
        weight: 3,
        required: true,
        allowNa: false,
        evidenceRequired: true,
        locationRequired: true,
        reference: 'Contoh standar kesehatan lingkungan; perlu verifikasi',
        recommendationCondition: 'Skor jawaban ≤ 2',
        recommendationText:
          'Prioritaskan perbaikan sanitasi dan kecukupan fasilitas jamban.',
        rubrics: defaultRubrics.map((item) => ({ ...item })),
      },
      {
        id: 'indicator-water',
        code: 'IND-SAN-010',
        title: 'Ketersediaan air bersih',
        prompt:
          'Apakah air bersih tersedia dalam jumlah cukup dan aman digunakan?',
        answerType: 'Ya / Tidak / N/A',
        weight: 3,
        required: true,
        allowNa: true,
        evidenceRequired: false,
        locationRequired: true,
        reference: '',
        recommendationCondition: 'Jawaban = Tidak',
        recommendationText:
          'Verifikasi sumber air dan susun tindakan penyediaan air bersih.',
        rubrics: [],
      },
    ],
  },
  {
    id: 'dimension-culture',
    code: 'DIM-03',
    name: 'Perilaku Keselamatan & Budaya K3',
    weight: 25,
    reference: 'Konstruk perilaku dan budaya keselamatan',
    plannedIndicators: 12,
    indicators: [
      {
        id: 'indicator-report',
        code: 'IND-BUD-003',
        title: 'Pelaporan kondisi tidak aman',
        prompt:
          'Seberapa konsisten warga pesantren melaporkan kondisi tidak aman?',
        answerType: 'Likert 4 tingkat',
        weight: 2,
        required: true,
        allowNa: false,
        evidenceRequired: false,
        locationRequired: false,
        reference: 'Konstruk budaya keselamatan; menunggu validasi',
        recommendationCondition: 'Skor jawaban ≤ 2',
        recommendationText:
          'Sediakan kanal pelaporan dan sosialisasikan mekanismenya.',
        rubrics: defaultRubrics.map((item) => ({ ...item })),
      },
    ],
  },
  {
    id: 'dimension-emergency',
    code: 'DIM-04',
    name: 'Kesiapsiagaan Tanggap Darurat',
    weight: 20,
    reference: 'Prosedur tanggap darurat dan evakuasi',
    plannedIndicators: 14,
    indicators: [
      {
        id: 'indicator-drill',
        code: 'IND-DAR-001',
        title: 'Simulasi keadaan darurat',
        prompt: 'Apakah simulasi keadaan darurat dilakukan secara berkala?',
        answerType: 'Ya / Tidak / N/A',
        weight: 3,
        required: true,
        allowNa: false,
        evidenceRequired: true,
        locationRequired: false,
        reference: 'Prosedur tanggap darurat; menunggu konfirmasi',
        recommendationCondition: 'Jawaban = Tidak',
        recommendationText:
          'Jadwalkan simulasi dan dokumentasikan evaluasi pelaksanaannya.',
        rubrics: [],
      },
    ],
  },
];

export const researchDatasets = [
  {
    id: 'DS-2026-S1-01',
    name: 'Cohort Jawa Timur Semester 1',
    period: 'Semester 1 2026',
    instrument: 'ISHAS v1.0',
    institutions: 28,
    records: 1344,
    status: 'Terverifikasi',
  },
  {
    id: 'DS-2026-S1-02',
    name: 'Cohort Jawa Tengah Semester 1',
    period: 'Semester 1 2026',
    instrument: 'ISHAS v1.0',
    institutions: 20,
    records: 960,
    status: 'Validasi',
  },
  {
    id: 'DS-2025-S2-01',
    name: 'Pilot Multisite Semester 2',
    period: 'Semester 2 2025',
    instrument: 'ISHAS v0.9',
    institutions: 12,
    records: 528,
    status: 'Terverifikasi',
  },
  {
    id: 'DS-2025-S1-01',
    name: 'Baseline Pesantren Mitra',
    period: 'Semester 1 2025',
    instrument: 'ISHAS v0.9',
    institutions: 8,
    records: 352,
    status: 'Arsip',
  },
];

export const initialValidationItems = [
  {
    id: 'structure',
    label: 'Struktur dimensi dan indikator lengkap',
    done: true,
  },
  { id: 'weight', label: 'Total bobot dimensi tepat 100%', done: true },
  { id: 'rubric', label: 'Setiap pilihan memiliki rubric scoring', done: true },
  { id: 'evidence', label: 'Kebutuhan bukti lapangan terdefinisi', done: true },
  { id: 'source', label: 'Sumber rujukan tercatat', done: false },
  {
    id: 'recommendation',
    label: 'Rekomendasi dan pemicu telah ditinjau',
    done: false,
  },
  { id: 'schema', label: 'Validasi struktur data berhasil', done: true },
];
