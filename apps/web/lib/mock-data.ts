export type RiskLevel = 'Tinggi' | 'Sedang' | 'Rendah';
export const dimensions = [
  { name: 'Lingkungan & struktural', score: 80 },
  { name: 'Pengetahuan keselamatan', score: 74 },
  { name: 'Perilaku keselamatan', score: 77 },
  { name: 'Dukungan sosial', score: 83 },
];
export const trend = [
  { month: 'Jan', score: 66 },
  { month: 'Feb', score: 69 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 73 },
  { month: 'Mei', score: 76 },
  { month: 'Jun', score: 78.5 },
];
export const riskLocations: Array<{
  id: number;
  name: string;
  zone: string;
  level: RiskLevel;
  x: number;
  y: number;
  issue: string;
}> = [
  {
    id: 1,
    name: 'Asrama Putra A',
    zone: 'Blok A',
    level: 'Tinggi',
    x: 25,
    y: 29,
    issue: 'Jalur evakuasi terhalang',
  },
  {
    id: 2,
    name: 'Dapur Utama',
    zone: 'Blok C',
    level: 'Tinggi',
    x: 74,
    y: 68,
    issue: 'Inspeksi instalasi gas diperlukan',
  },
  {
    id: 3,
    name: 'Ruang Kelas',
    zone: 'Blok B',
    level: 'Sedang',
    x: 58,
    y: 29,
    issue: 'Pembaruan tanda keselamatan',
  },
  {
    id: 4,
    name: 'Masjid',
    zone: 'Area Tengah',
    level: 'Rendah',
    x: 42,
    y: 63,
    issue: 'Kondisi terkendali',
  },
  {
    id: 5,
    name: 'Klinik',
    zone: 'Blok D',
    level: 'Rendah',
    x: 81,
    y: 31,
    issue: 'Kondisi terkendali',
  },
];
export const assessments = [
  {
    id: 'ASM-0261',
    pesantren: 'Pesantren Darussalam',
    period: 'Semester 1 2026',
    progress: 86,
    status: 'Draft',
    assessor: 'Ahmad Fauzan',
  },
  {
    id: 'ASM-0254',
    pesantren: 'Pesantren Al-Hikmah',
    period: 'Semester 1 2026',
    progress: 100,
    status: 'Final',
    assessor: 'Nabila Putri',
  },
  {
    id: 'ASM-0248',
    pesantren: 'Pesantren Nurul Ilmi',
    period: 'Semester 2 2025',
    progress: 100,
    status: 'Ditinjau',
    assessor: 'Rizky Maulana',
  },
];
export const roleOptions = [
  'Admin Sistem',
  'Asesor',
  'Pengelola Pesantren',
  'Tim K3 / Satgas',
  'Pimpinan Yayasan',
  'Pemerintah / Kemenag',
  'Peneliti / Auditor',
];
