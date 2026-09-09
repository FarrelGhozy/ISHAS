export type AssignmentStatus = 'Draft' | 'Terjadwal' | 'Final';

export type Assignment = {
  id: string;
  institutionCode: string;
  assessorEmail: string;
  instrumentVersionId: string;
  institution: string;
  city: string;
  period: string;
  date: string;
  version: string;
  progress: number;
  status: AssignmentStatus;
  missingEvidence: number;
  contact: string;
};

export type AnswerState = {
  value: string;
  note: string;
  evidenceName: string;
  areaId: string;
  planPoint: { x: number; y: number } | null;
};

export type AssessmentIndicator = {
  id: string;
  code: string;
  dimension: string;
  title: string;
  prompt: string;
  answerType: 'likert' | 'boolean';
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
  reference: string;
  options: Array<{ value: string; label: string; description: string }>;
};

export const assignments: Assignment[] = [
  {
    id: 'ASM-0261',
    institutionCode: 'PSN-0018',
    assessorEmail: 'asesor@ishas.demo',
    instrumentVersionId: 'INS-v1.0',
    institution: 'PP Al-Hikmah Malang',
    city: 'Kota Malang',
    period: 'Semester 1 2026',
    date: '08 Sep 2026',
    version: 'ISHAS v1.0',
    progress: 67,
    status: 'Draft',
    missingEvidence: 2,
    contact: 'Ust. Abdullah · Koordinator K3',
  },
  {
    id: 'ASM-0274',
    institutionCode: 'PSN-0051',
    assessorEmail: 'asesor@ishas.demo',
    instrumentVersionId: 'INS-v1.0',
    institution: 'PP Al-Falah',
    city: 'Kabupaten Kediri',
    period: 'Semester 1 2026',
    date: '12 Sep 2026',
    version: 'ISHAS v1.0',
    progress: 0,
    status: 'Terjadwal',
    missingEvidence: 0,
    contact: 'Ust. Rahman · Pengelola Pesantren',
  },
  {
    id: 'ASM-0279',
    institutionCode: 'PSN-0052',
    assessorEmail: 'asesor@ishas.demo',
    instrumentVersionId: 'INS-v1.0',
    institution: 'Pesantren Amanah Sehat',
    city: 'Kabupaten Malang',
    period: 'Semester 1 2026',
    date: '16 Sep 2026',
    version: 'ISHAS v1.0',
    progress: 0,
    status: 'Terjadwal',
    missingEvidence: 0,
    contact: 'Ust. Hadi · Tim Sarana',
  },
  {
    id: 'ASM-0228',
    institutionCode: 'PSN-0053',
    assessorEmail: 'asesor@ishas.demo',
    instrumentVersionId: 'INS-v0.9',
    institution: 'Pesantren Miftahul Ulum',
    city: 'Kabupaten Jember',
    period: 'Semester 2 2025',
    date: '18 Dec 2025',
    version: 'ISHAS v0.9',
    progress: 100,
    status: 'Final',
    missingEvidence: 0,
    contact: 'Ust. Naufal · Pengelola Pesantren',
  },
];

export const indicators: AssessmentIndicator[] = [
  {
    id: 'exit-route',
    code: 'IND-SAR-001',
    dimension: 'Sarana & Bangunan Fisik',
    title: 'Ketersediaan jalur evakuasi',
    prompt:
      'Apakah jalur evakuasi tersedia, mudah dikenali, dan bebas hambatan?',
    answerType: 'likert',
    required: true,
    evidenceRequired: true,
    locationRequired: true,
    reference: 'Standar bangunan terkait · contoh belum disahkan',
    options: [
      {
        value: '1',
        label: 'Kritis',
        description: 'Belum tersedia atau terhalang.',
      },
      {
        value: '2',
        label: 'Perlu perbaikan',
        description: 'Tersedia tetapi belum memadai.',
      },
      {
        value: '3',
        label: 'Baik',
        description: 'Tersedia dan dapat digunakan.',
      },
      {
        value: '4',
        label: 'Sangat baik',
        description: 'Lengkap, jelas, dan terpelihara.',
      },
    ],
  },
  {
    id: 'electric-installation',
    code: 'IND-SAR-002',
    dimension: 'Sarana & Bangunan Fisik',
    title: 'Keamanan instalasi listrik',
    prompt: 'Bagaimana kondisi instalasi listrik pada bangunan yang diperiksa?',
    answerType: 'likert',
    required: true,
    evidenceRequired: true,
    locationRequired: true,
    reference: 'Rujukan teknis menunggu validasi tim penelitian',
    options: [
      {
        value: '1',
        label: 'Kritis',
        description: 'Ada bahaya terbuka yang membutuhkan tindakan segera.',
      },
      {
        value: '2',
        label: 'Perlu perbaikan',
        description: 'Ada kondisi yang belum aman.',
      },
      {
        value: '3',
        label: 'Baik',
        description: 'Kondisi umum aman dengan catatan ringan.',
      },
      {
        value: '4',
        label: 'Sangat baik',
        description: 'Aman, rapi, dan memiliki dokumentasi pemeriksaan.',
      },
    ],
  },
  {
    id: 'healthy-toilet',
    code: 'IND-SAN-009',
    dimension: 'Sanitasi & Kesehatan Lingkungan',
    title: 'Ketersediaan jamban sehat',
    prompt: 'Apakah jumlah dan kondisi jamban memenuhi kebutuhan penghuni?',
    answerType: 'likert',
    required: true,
    evidenceRequired: true,
    locationRequired: true,
    reference: 'Standar kesehatan lingkungan · contoh prototipe',
    options: [
      {
        value: '1',
        label: 'Kritis',
        description: 'Tidak tersedia atau tidak layak.',
      },
      {
        value: '2',
        label: 'Perlu perbaikan',
        description: 'Belum cukup atau kebersihan buruk.',
      },
      { value: '3', label: 'Baik', description: 'Cukup dan dapat digunakan.' },
      {
        value: '4',
        label: 'Sangat baik',
        description: 'Cukup, bersih, dan terawat rutin.',
      },
    ],
  },
  {
    id: 'clean-water',
    code: 'IND-SAN-010',
    dimension: 'Sanitasi & Kesehatan Lingkungan',
    title: 'Ketersediaan air bersih',
    prompt: 'Apakah air bersih tersedia dalam jumlah cukup dan aman digunakan?',
    answerType: 'boolean',
    required: true,
    evidenceRequired: false,
    locationRequired: true,
    reference: 'Rujukan kesehatan lingkungan · menunggu konfirmasi',
    options: [
      {
        value: 'Ya',
        label: 'Ya',
        description: 'Tersedia dan dapat digunakan.',
      },
      {
        value: 'Tidak',
        label: 'Tidak',
        description: 'Tidak tersedia atau tidak memadai.',
      },
      {
        value: 'N/A',
        label: 'N/A',
        description: 'Tidak berlaku, wajib diberi catatan.',
      },
    ],
  },
  {
    id: 'unsafe-report',
    code: 'IND-BUD-003',
    dimension: 'Perilaku Keselamatan & Budaya K3',
    title: 'Pelaporan kondisi tidak aman',
    prompt: 'Apakah tersedia mekanisme pelaporan kondisi tidak aman?',
    answerType: 'boolean',
    required: true,
    evidenceRequired: false,
    locationRequired: false,
    reference: 'Konstruk budaya keselamatan · menunggu validasi',
    options: [
      {
        value: 'Ya',
        label: 'Ya',
        description: 'Mekanisme tersedia dan diketahui pengguna.',
      },
      {
        value: 'Tidak',
        label: 'Tidak',
        description: 'Belum tersedia mekanisme.',
      },
      {
        value: 'N/A',
        label: 'N/A',
        description: 'Tidak berlaku, wajib diberi catatan.',
      },
    ],
  },
  {
    id: 'emergency-drill',
    code: 'IND-DAR-001',
    dimension: 'Kesiapsiagaan Tanggap Darurat',
    title: 'Simulasi keadaan darurat',
    prompt: 'Apakah simulasi keadaan darurat dilaksanakan secara berkala?',
    answerType: 'boolean',
    required: true,
    evidenceRequired: true,
    locationRequired: false,
    reference: 'Prosedur tanggap darurat · menunggu konfirmasi',
    options: [
      {
        value: 'Ya',
        label: 'Ya',
        description: 'Dilaksanakan dan terdokumentasi.',
      },
      {
        value: 'Tidak',
        label: 'Tidak',
        description: 'Belum pernah atau tidak berkala.',
      },
      {
        value: 'N/A',
        label: 'N/A',
        description: 'Tidak berlaku, wajib diberi catatan.',
      },
    ],
  },
];

export const continuedAnswers: Record<string, AnswerState> = {
  'exit-route': {
    value: '3',
    note: 'Jalur sisi timur sudah jelas, penanda malam perlu diperiksa.',
    evidenceName: 'jalur-evakuasi-timur.jpg',
    areaId: 'AREA-001',
    planPoint: { x: 24, y: 28 },
  },
  'electric-installation': {
    value: '2',
    note: 'Ditemukan sambungan terbuka di lantai dua.',
    evidenceName: '',
    areaId: 'AREA-004',
    planPoint: { x: 27, y: 35 },
  },
  'healthy-toilet': {
    value: '3',
    note: 'Jumlah cukup, jadwal kebersihan perlu diperbarui.',
    evidenceName: 'jamban-asrama-a.jpg',
    areaId: 'AREA-002',
    planPoint: { x: 34, y: 70 },
  },
  'clean-water': {
    value: 'Ya',
    note: '',
    evidenceName: '',
    areaId: 'AREA-009',
    planPoint: null,
  },
};

export const assessmentLocations = [
  {
    id: 'AREA-001',
    label: 'Gedung Asrama Putra · Lantai 1 · Asrama Putra A',
    plan: 'DENAH-v2',
  },
  {
    id: 'AREA-002',
    label: 'Gedung Asrama Putra · Lantai 1 · Kamar Mandi Asrama',
    plan: 'DENAH-v2',
  },
  {
    id: 'AREA-004',
    label: 'Gedung Asrama Putra · Lantai 2 · Asrama Putra A',
    plan: 'DENAH-v1',
  },
  {
    id: 'AREA-005',
    label: 'Gedung Pendidikan · Lantai 1 · Ruang Kelas Timur',
    plan: 'DENAH-v1',
  },
  {
    id: 'AREA-008',
    label: 'Gedung Layanan · Lantai 1 · Dapur Utama',
    plan: '',
  },
  {
    id: 'AREA-009',
    label: 'Gedung Layanan · Lantai 1 · Gudang Bahan',
    plan: '',
  },
];

export function emptyAnswers() {
  return Object.fromEntries(
    indicators.map((indicator) => [
      indicator.id,
      { value: '', note: '', evidenceName: '', areaId: '', planPoint: null },
    ]),
  ) as Record<string, AnswerState>;
}

export const initialEvidence = [
  {
    id: 'EV-001',
    assignmentId: 'ASM-0261',
    indicator: 'IND-SAR-001',
    title: 'Jalur evakuasi sisi timur',
    institution: 'PP Al-Hikmah Malang',
    file: 'jalur-evakuasi-timur.jpg',
    status: 'Lengkap',
  },
  {
    id: 'EV-002',
    assignmentId: 'ASM-0261',
    indicator: 'IND-SAR-002',
    title: 'Instalasi listrik lantai dua',
    institution: 'PP Al-Hikmah Malang',
    file: '',
    status: 'Wajib',
  },
  {
    id: 'EV-003',
    assignmentId: 'ASM-0261',
    indicator: 'IND-SAN-009',
    title: 'Jamban Asrama A',
    institution: 'PP Al-Hikmah Malang',
    file: 'jamban-asrama-a.jpg',
    status: 'Lengkap',
  },
  {
    id: 'EV-004',
    assignmentId: 'ASM-0261',
    indicator: 'IND-DAR-001',
    title: 'Dokumentasi simulasi darurat',
    institution: 'PP Al-Hikmah Malang',
    file: '',
    status: 'Wajib',
  },
];
