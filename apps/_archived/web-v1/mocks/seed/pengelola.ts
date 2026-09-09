export type RiskLevel = 'Tinggi' | 'Sedang' | 'Rendah';
export type RecommendationStatus =
  | 'Belum ditindaklanjuti'
  | 'Berjalan'
  | 'Menunggu verifikasi'
  | 'Terverifikasi';

export type PeriodResult = {
  id: string;
  period: string;
  date: string;
  score: number;
  category: string;
  version: string;
  status: 'Final';
  dimensions: Array<{
    id: string;
    name: string;
    score: number;
    previous: number;
    findings: number;
  }>;
};

export type RiskFinding = {
  id: string;
  areaId: string;
  buildingId: string;
  assessmentId: string;
  instrumentVersion: string;
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
  severity: string;
  exposedPeople: string;
  existingControl: string;
  evidence: string;
  observedAt: string;
  planVersion: string;
  residualRisk: RiskLevel | 'Belum dinilai';
};

export type FloorRecord = {
  id: string;
  name: string;
  planFile: string;
  planVersion: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type BuildingRecord = {
  id: string;
  institutionCode: string;
  code: string;
  name: string;
  floors: FloorRecord[];
};

export type AreaRecord = {
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

export type Recommendation = {
  id: string;
  priority: RiskLevel;
  title: string;
  location: string;
  source: string;
  action: string;
  status: RecommendationStatus;
  owner: string;
  dueDate: string;
  progress: number;
  lastNote?: string;
  completionEvidence?: string;
};

export const periodResults: PeriodResult[] = [
  {
    id: 'ASM-0254',
    period: 'Semester 1 2026',
    date: '18 Juni 2026',
    score: 78.5,
    category: 'Baik',
    version: 'ISHAS v1.0',
    status: 'Final',
    dimensions: [
      {
        id: 'DIM-01',
        name: 'Sarana & Bangunan Fisik',
        score: 80,
        previous: 76,
        findings: 3,
      },
      {
        id: 'DIM-02',
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 72,
        previous: 70,
        findings: 4,
      },
      {
        id: 'DIM-03',
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 79,
        previous: 74,
        findings: 2,
      },
      {
        id: 'DIM-04',
        name: 'Kesiapsiagaan Tanggap Darurat',
        score: 83,
        previous: 81,
        findings: 2,
      },
    ],
  },
  {
    id: 'ASM-0198',
    period: 'Semester 2 2025',
    date: '19 Desember 2025',
    score: 75.3,
    category: 'Baik',
    version: 'ISHAS v0.9',
    status: 'Final',
    dimensions: [
      {
        id: 'DIM-01',
        name: 'Sarana & Bangunan Fisik',
        score: 76,
        previous: 73,
        findings: 5,
      },
      {
        id: 'DIM-02',
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 70,
        previous: 68,
        findings: 6,
      },
      {
        id: 'DIM-03',
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 74,
        previous: 71,
        findings: 4,
      },
      {
        id: 'DIM-04',
        name: 'Kesiapsiagaan Tanggap Darurat',
        score: 81,
        previous: 78,
        findings: 3,
      },
    ],
  },
  {
    id: 'ASM-0143',
    period: 'Semester 1 2025',
    date: '21 Juni 2025',
    score: 72.4,
    category: 'Perlu perhatian',
    version: 'ISHAS v0.9',
    status: 'Final',
    dimensions: [
      {
        id: 'DIM-01',
        name: 'Sarana & Bangunan Fisik',
        score: 73,
        previous: 70,
        findings: 7,
      },
      {
        id: 'DIM-02',
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 68,
        previous: 66,
        findings: 7,
      },
      {
        id: 'DIM-03',
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 71,
        previous: 69,
        findings: 5,
      },
      {
        id: 'DIM-04',
        name: 'Kesiapsiagaan Tanggap Darurat',
        score: 78,
        previous: 74,
        findings: 4,
      },
    ],
  },
];

export const initialBuildings: BuildingRecord[] = [
  {
    id: 'BLD-001',
    institutionCode: 'PSN-0018',
    code: 'GD-ASR-P',
    name: 'Gedung Asrama Putra',
    floors: [
      {
        id: 'FLR-001',
        name: 'Lantai 1',
        planFile: 'denah-asrama-putra-lt1.png',
        planVersion: 'DENAH-v2',
        uploadedBy: 'Ust. M. Kamal · Pengelola',
        uploadedAt: '02 Juni 2026',
      },
      {
        id: 'FLR-002',
        name: 'Lantai 2',
        planFile: 'denah-asrama-putra-lt2.png',
        planVersion: 'DENAH-v1',
        uploadedBy: 'Ust. M. Kamal · Pengelola',
        uploadedAt: '02 Juni 2026',
      },
    ],
  },
  {
    id: 'BLD-002',
    institutionCode: 'PSN-0018',
    code: 'GD-PDK',
    name: 'Gedung Pendidikan',
    floors: [
      {
        id: 'FLR-003',
        name: 'Lantai 1',
        planFile: 'denah-gedung-pendidikan-lt1.pdf',
        planVersion: 'DENAH-v1',
        uploadedBy: 'Ust. M. Kamal · Pengelola',
        uploadedAt: '04 Juni 2026',
      },
      {
        id: 'FLR-004',
        name: 'Lantai 2',
        planFile: '',
        planVersion: '',
        uploadedBy: '',
        uploadedAt: '',
      },
    ],
  },
  {
    id: 'BLD-003',
    institutionCode: 'PSN-0018',
    code: 'GD-LAY',
    name: 'Gedung Layanan',
    floors: [
      {
        id: 'FLR-005',
        name: 'Lantai 1',
        planFile: '',
        planVersion: '',
        uploadedBy: '',
        uploadedAt: '',
      },
    ],
  },
];

export const areaDirectory: AreaRecord[] = [
  {
    id: 'AREA-001',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-001',
    name: 'Asrama Putra A',
    floor: 'Lantai 1',
    zone: 'Blok A',
    x: 8,
    y: 10,
    width: 38,
    height: 32,
  },
  {
    id: 'AREA-002',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-001',
    name: 'Kamar Mandi Asrama',
    floor: 'Lantai 1',
    zone: 'Blok A',
    x: 8,
    y: 62,
    width: 30,
    height: 24,
  },
  {
    id: 'AREA-003',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-001',
    name: 'Koridor Utama',
    floor: 'Lantai 1',
    zone: 'Sirkulasi',
    x: 50,
    y: 45,
    width: 42,
    height: 14,
  },
  {
    id: 'AREA-004',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-001',
    name: 'Asrama Putra A',
    floor: 'Lantai 2',
    zone: 'Blok A',
    x: 8,
    y: 12,
    width: 42,
    height: 32,
  },
  {
    id: 'AREA-005',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-002',
    name: 'Ruang Kelas Timur',
    floor: 'Lantai 1',
    zone: 'Blok B',
    x: 9,
    y: 12,
    width: 42,
    height: 34,
  },
  {
    id: 'AREA-006',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-002',
    name: 'Klinik',
    floor: 'Lantai 1',
    zone: 'Blok D',
    x: 58,
    y: 12,
    width: 32,
    height: 34,
  },
  {
    id: 'AREA-007',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-002',
    name: 'Ruang Kelas Barat',
    floor: 'Lantai 2',
    zone: 'Blok C',
    x: 10,
    y: 12,
    width: 40,
    height: 34,
  },
  {
    id: 'AREA-008',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-003',
    name: 'Dapur Utama',
    floor: 'Lantai 1',
    zone: 'Blok C',
    x: 8,
    y: 12,
    width: 42,
    height: 36,
  },
  {
    id: 'AREA-009',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-003',
    name: 'Gudang Bahan',
    floor: 'Lantai 1',
    zone: 'Blok C',
    x: 58,
    y: 12,
    width: 32,
    height: 36,
  },
  {
    id: 'AREA-010',
    institutionCode: 'PSN-0018',
    buildingId: 'BLD-003',
    name: 'Ruang Makan',
    floor: 'Lantai 1',
    zone: 'Blok C',
    x: 18,
    y: 58,
    width: 64,
    height: 27,
  },
];

export const riskFindings: RiskFinding[] = [
  {
    id: 'RSK-001',
    areaId: 'AREA-001',
    buildingId: 'BLD-001',
    assessmentId: 'ASM-0254',
    instrumentVersion: 'ISHAS v1.0',
    recommendationId: 'REC-2026-001',
    location: 'Asrama Putra A',
    building: 'Gedung Asrama Putra',
    zone: 'Blok A',
    floor: 'Lantai 1',
    x: 24,
    y: 28,
    level: 'Tinggi',
    issue: 'Jalur evakuasi sisi timur terhalang lemari dan barang penghuni.',
    indicator: 'IND-SAR-001',
    recommendation: 'Bebaskan jalur dan pasang penanda evakuasi yang terlihat.',
    status: 'Berjalan',
    hazard: 'Jalur keluar terhalang benda tetap dan barang penghuni.',
    impact: 'Evakuasi melambat ketika terjadi kebakaran atau keadaan darurat.',
    likelihood: 'Mungkin terjadi · ilustrasi',
    severity: 'Serius · ilustrasi',
    exposedPeople: '±120 santri penghuni blok',
    existingControl: 'Papan arah tersedia, inspeksi koridor belum rutin.',
    evidence: 'jalur-evakuasi-timur.jpg',
    observedAt: '18 Juni 2026 · Ahmad Fauzan',
    planVersion: 'DENAH-v2',
    residualRisk: 'Belum dinilai',
  },
  {
    id: 'RSK-002',
    areaId: 'AREA-008',
    buildingId: 'BLD-003',
    assessmentId: 'ASM-0254',
    instrumentVersion: 'ISHAS v1.0',
    recommendationId: 'REC-2026-002',
    location: 'Dapur Utama',
    building: 'Gedung Layanan',
    zone: 'Blok C',
    floor: 'Lantai 1',
    x: 74,
    y: 69,
    level: 'Tinggi',
    issue: 'Inspeksi selang dan regulator instalasi gas perlu dijadwalkan.',
    indicator: 'IND-SAR-008',
    recommendation: 'Lakukan pemeriksaan instalasi gas oleh tenaga kompeten.',
    status: 'Belum ditindaklanjuti',
    hazard: 'Kondisi selang dan regulator gas belum diverifikasi berkala.',
    impact: 'Kebocoran gas dapat memicu kebakaran atau ledakan.',
    likelihood: 'Mungkin terjadi · ilustrasi',
    severity: 'Sangat serius · ilustrasi',
    exposedPeople: '12 petugas dapur dan pengguna sekitar',
    existingControl: 'Katup utama tersedia; jadwal inspeksi belum tercatat.',
    evidence: 'instalasi-gas-dapur.jpg',
    observedAt: '18 Juni 2026 · Ahmad Fauzan',
    planVersion: 'Belum ada denah',
    residualRisk: 'Belum dinilai',
  },
  {
    id: 'RSK-003',
    areaId: 'AREA-005',
    buildingId: 'BLD-002',
    assessmentId: 'ASM-0254',
    instrumentVersion: 'ISHAS v1.0',
    recommendationId: 'REC-2026-003',
    location: 'Ruang Kelas Timur',
    building: 'Gedung Pendidikan',
    zone: 'Blok B',
    floor: 'Lantai 1',
    x: 35,
    y: 27,
    level: 'Sedang',
    issue: 'Tanda keselamatan dan titik kumpul belum terlihat dari koridor.',
    indicator: 'IND-DAR-004',
    recommendation: 'Perbarui tanda arah dan lakukan pemeriksaan visibilitas.',
    status: 'Menunggu verifikasi',
    hazard: 'Tanda arah evakuasi tidak terlihat dari seluruh koridor kelas.',
    impact: 'Pengguna terlambat menemukan rute keluar saat keadaan darurat.',
    likelihood: 'Jarang · ilustrasi',
    severity: 'Serius · ilustrasi',
    exposedPeople: '±80 santri dan guru',
    existingControl: 'Tanda tersedia pada pintu utama, belum merata.',
    evidence: 'tanda-koridor-kelas.jpg',
    observedAt: '18 Juni 2026 · Ahmad Fauzan',
    planVersion: 'DENAH-v1',
    residualRisk: 'Rendah',
  },
  {
    id: 'RSK-004',
    areaId: 'AREA-002',
    buildingId: 'BLD-001',
    assessmentId: 'ASM-0254',
    instrumentVersion: 'ISHAS v1.0',
    recommendationId: 'REC-2026-004',
    location: 'Kamar Mandi Asrama',
    building: 'Gedung Asrama Putra',
    zone: 'Blok A',
    floor: 'Lantai 1',
    x: 34,
    y: 70,
    level: 'Sedang',
    issue: 'Jadwal kebersihan belum mencantumkan penanggung jawab harian.',
    indicator: 'IND-SAN-009',
    recommendation: 'Tetapkan petugas dan dokumentasikan checklist kebersihan.',
    status: 'Berjalan',
    hazard: 'Kontrol kebersihan tidak mempunyai penanggung jawab harian.',
    impact: 'Kondisi sanitasi menurun dan meningkatkan paparan penyakit.',
    likelihood: 'Mungkin terjadi · ilustrasi',
    severity: 'Sedang · ilustrasi',
    exposedPeople: '±120 santri penghuni blok',
    existingControl: 'Jadwal tersedia tetapi belum memiliki PIC harian.',
    evidence: 'jamban-asrama-a.jpg',
    observedAt: '18 Juni 2026 · Ahmad Fauzan',
    planVersion: 'DENAH-v2',
    residualRisk: 'Belum dinilai',
  },
  {
    id: 'RSK-006',
    areaId: 'AREA-004',
    buildingId: 'BLD-001',
    assessmentId: 'ASM-0254',
    instrumentVersion: 'ISHAS v1.0',
    recommendationId: 'REC-2026-006',
    location: 'Asrama Putra A',
    building: 'Gedung Asrama Putra',
    zone: 'Blok A',
    floor: 'Lantai 2',
    x: 27,
    y: 35,
    level: 'Sedang',
    issue: 'Lampu darurat koridor belum memiliki catatan uji fungsi.',
    indicator: 'IND-DAR-006',
    recommendation: 'Uji fungsi lampu darurat dan simpan catatan pemeriksaan.',
    status: 'Belum ditindaklanjuti',
    hazard: 'Lampu darurat tidak mempunyai rekaman uji fungsi terbaru.',
    impact: 'Koridor dapat gelap ketika listrik utama terputus.',
    likelihood: 'Jarang · ilustrasi',
    severity: 'Serius · ilustrasi',
    exposedPeople: '±110 santri penghuni lantai',
    existingControl: 'Lampu terpasang; bukti pemeliharaan belum tersedia.',
    evidence: 'lampu-darurat-koridor.jpg',
    observedAt: '18 Juni 2026 · Ahmad Fauzan',
    planVersion: 'DENAH-v1',
    residualRisk: 'Belum dinilai',
  },
];

export const initialRecommendations: Recommendation[] = [
  {
    id: 'REC-2026-001',
    priority: 'Tinggi',
    title: 'Bebaskan jalur evakuasi Asrama Putra A',
    location: 'Asrama Putra A · Blok A',
    source: 'IND-SAR-001 · ASM-0254',
    action: 'Pindahkan lemari, tandai jalur, dan dokumentasikan kondisi akhir.',
    status: 'Berjalan',
    owner: 'Bagian Sarana',
    dueDate: '10 Sep 2026',
    progress: 60,
  },
  {
    id: 'REC-2026-002',
    priority: 'Tinggi',
    title: 'Periksa instalasi gas Dapur Utama',
    location: 'Dapur Utama · Blok C',
    source: 'IND-SAR-008 · ASM-0254',
    action: 'Jadwalkan inspeksi selang, regulator, dan prosedur penutupan gas.',
    status: 'Belum ditindaklanjuti',
    owner: 'Belum ditentukan',
    dueDate: 'Belum ditentukan',
    progress: 0,
  },
  {
    id: 'REC-2026-003',
    priority: 'Sedang',
    title: 'Perbarui tanda keselamatan koridor kelas',
    location: 'Ruang Kelas Timur · Blok B',
    source: 'IND-DAR-004 · ASM-0254',
    action: 'Pasang tanda arah dan cek keterbacaan dari seluruh akses koridor.',
    status: 'Menunggu verifikasi',
    owner: 'Tim K3 Pesantren',
    dueDate: '05 Sep 2026',
    progress: 100,
  },
  {
    id: 'REC-2026-004',
    priority: 'Sedang',
    title: 'Tetapkan checklist kebersihan harian',
    location: 'Kamar Mandi Asrama · Blok A',
    source: 'IND-SAN-009 · ASM-0254',
    action: 'Tetapkan petugas, jadwal, dan arsip checklist kebersihan.',
    status: 'Berjalan',
    owner: 'Bagian Kebersihan',
    dueDate: '14 Sep 2026',
    progress: 35,
  },
  {
    id: 'REC-2026-005',
    priority: 'Rendah',
    title: 'Pertahankan pemeriksaan akses Masjid',
    location: 'Masjid · Area Tengah',
    source: 'IND-SAR-003 · ASM-0254',
    action: 'Lanjutkan pemeriksaan rutin setiap bulan.',
    status: 'Terverifikasi',
    owner: 'Bagian Sarana',
    dueDate: '20 Agu 2026',
    progress: 100,
  },
  {
    id: 'REC-2026-006',
    priority: 'Sedang',
    title: 'Uji fungsi lampu darurat lantai dua',
    location: 'Asrama Putra A · Lantai 2',
    source: 'IND-DAR-006 · ASM-0254',
    action: 'Uji setiap lampu darurat dan arsipkan hasil pemeriksaannya.',
    status: 'Belum ditindaklanjuti',
    owner: 'Belum ditentukan',
    dueDate: 'Belum ditentukan',
    progress: 0,
  },
];

export const reports = [
  {
    id: 'RPT-2026-S1',
    title: 'Laporan Evaluasi K3L Semester 1 2026',
    period: 'Semester 1 2026',
    date: '20 Juni 2026',
    version: 'ISHAS v1.0',
    status: 'Siap diunduh',
  },
  {
    id: 'RPT-2025-S2',
    title: 'Laporan Evaluasi K3L Semester 2 2025',
    period: 'Semester 2 2025',
    date: '21 Desember 2025',
    version: 'ISHAS v0.9',
    status: 'Arsip',
  },
  {
    id: 'RPT-2025-S1',
    title: 'Laporan Evaluasi K3L Semester 1 2025',
    period: 'Semester 1 2025',
    date: '23 Juni 2025',
    version: 'ISHAS v0.9',
    status: 'Arsip',
  },
];
