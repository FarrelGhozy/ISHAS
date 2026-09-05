'use client';

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  Flag,
  History,
  ImagePlus,
  Layers3,
  List,
  ListChecks,
  LockKeyhole,
  MapPin,
  MapPinned,
  Plus,
  ShieldCheck,
  Target,
  Upload,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { DataState } from '@/components/ui/data-state';

type RiskLevel = 'Tinggi' | 'Sedang' | 'Rendah';
type RecommendationStatus =
  | 'Belum ditindaklanjuti'
  | 'Berjalan'
  | 'Menunggu verifikasi'
  | 'Terverifikasi';

type PeriodResult = {
  id: string;
  period: string;
  date: string;
  score: number;
  category: string;
  version: string;
  status: 'Final';
  dimensions: Array<{
    name: string;
    score: number;
    previous: number;
    findings: number;
  }>;
};

type RiskFinding = {
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

type FloorRecord = {
  id: string;
  name: string;
  planFile: string;
  planVersion: string;
  uploadedBy: string;
  uploadedAt: string;
};

type BuildingRecord = {
  id: string;
  code: string;
  name: string;
  floors: FloorRecord[];
};

type AreaRecord = {
  id: string;
  buildingId: string;
  name: string;
  floor: string;
  zone: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Recommendation = {
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
};

const periodResults: PeriodResult[] = [
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
        name: 'Sarana & Bangunan Fisik',
        score: 80,
        previous: 76,
        findings: 3,
      },
      {
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 72,
        previous: 70,
        findings: 4,
      },
      {
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 79,
        previous: 74,
        findings: 2,
      },
      {
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
        name: 'Sarana & Bangunan Fisik',
        score: 76,
        previous: 73,
        findings: 5,
      },
      {
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 70,
        previous: 68,
        findings: 6,
      },
      {
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 74,
        previous: 71,
        findings: 4,
      },
      {
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
        name: 'Sarana & Bangunan Fisik',
        score: 73,
        previous: 70,
        findings: 7,
      },
      {
        name: 'Sanitasi & Kesehatan Lingkungan',
        score: 68,
        previous: 66,
        findings: 7,
      },
      {
        name: 'Perilaku Keselamatan & Budaya K3',
        score: 71,
        previous: 69,
        findings: 5,
      },
      {
        name: 'Kesiapsiagaan Tanggap Darurat',
        score: 78,
        previous: 74,
        findings: 4,
      },
    ],
  },
];

const initialBuildings: BuildingRecord[] = [
  {
    id: 'BLD-001',
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

const areaDirectory: AreaRecord[] = [
  {
    id: 'AREA-001',
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

const riskFindings: RiskFinding[] = [
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

const initialRecommendations: Recommendation[] = [
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

function ManagerHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="section-kicker">Pemanfaatan hasil</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function ManagerScope({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`manager-scope-banner ${compact ? 'compact' : ''}`}>
      <Building2 />
      <div>
        <small>Pesantren yang terhubung ke akun</small>
        <b>PP Al-Hikmah Malang</b>
        <p>Pengelola tidak dapat melihat hasil pesantren lain.</p>
      </div>
      <span className="status status-blue">
        <ShieldCheck /> Akses lembaga sendiri
      </span>
    </div>
  );
}

function PrototypeScoreNote() {
  return (
    <div className="manager-score-note">
      <AlertTriangle />
      <p>
        <b>Data ilustrasi</b>
        Nilai 78,5, kategori, ambang risiko, dan perubahan skor hanya untuk
        memvalidasi tampilan; belum menjadi hasil ilmiah final ISHAS.
      </p>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`status ${level === 'Tinggi' ? 'status-red' : level === 'Sedang' ? 'status-amber' : 'status-green'}`}
    >
      {level === 'Tinggi' ? (
        <AlertTriangle />
      ) : level === 'Sedang' ? (
        <Flag />
      ) : (
        <CheckCircle2 />
      )}
      {level}
    </span>
  );
}

function WorkflowBadge({ status }: { status: RecommendationStatus }) {
  return (
    <span
      className={`status ${status === 'Terverifikasi' ? 'status-green' : status === 'Menunggu verifikasi' ? 'status-blue' : status === 'Berjalan' ? 'status-amber' : 'status-red'}`}
    >
      {status === 'Terverifikasi' ? (
        <CheckCircle2 />
      ) : status === 'Berjalan' ? (
        <Activity />
      ) : status === 'Menunggu verifikasi' ? (
        <Clock3 />
      ) : (
        <AlertTriangle />
      )}
      {status}
    </span>
  );
}

function ResultsPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState(periodResults[0].id);
  const [detailDimension, setDetailDimension] = useState<string | null>(null);
  const result = periodResults.find((item) => item.id === selectedPeriodId)!;
  const previous =
    periodResults[
      periodResults.findIndex((item) => item.id === selectedPeriodId) + 1
    ];
  const selectedDimension = result.dimensions.find(
    (item) => item.name === detailDimension,
  );
  return (
    <>
      <ManagerHeading
        title="Hasil Assessment"
        description="Pahami hasil per dimensi, perubahan antarperiode, dan temuan yang mendasarinya."
        action={
          <select
            className="manager-period-select"
            value={selectedPeriodId}
            onChange={(event) => setSelectedPeriodId(event.target.value)}
            aria-label="Pilih periode hasil"
          >
            {periodResults.map((item) => (
              <option value={item.id} key={item.id}>
                {item.period}
              </option>
            ))}
          </select>
        }
      />
      <ManagerScope />
      <PrototypeScoreNote />
      <div className="manager-result-hero">
        <section className="surface manager-score-card">
          <div
            className="manager-score-ring"
            style={{ '--score': `${result.score}%` } as CSSProperties}
          >
            <span>
              <b>{result.score.toLocaleString('id-ID')}</b>
              <small>dari 100</small>
            </span>
          </div>
          <div className="manager-score-copy">
            <p className="section-kicker">Indeks K3L ilustrasi</p>
            <h2>{result.category}</h2>
            <p>
              {result.period} · Final pada {result.date}
            </p>
            <div>
              <span className="status status-green">
                <LockKeyhole /> Final
              </span>
              <span className="status status-blue">{result.version}</span>
            </div>
          </div>
          {previous ? (
            <div className="manager-score-change">
              <ArrowUpRight />
              <span>
                <b>+{(result.score - previous.score).toFixed(1)}</b>
                <small>dari periode sebelumnya</small>
              </span>
            </div>
          ) : null}
        </section>
        <aside className="surface manager-result-summary">
          <div>
            <AlertTriangle />
            <span>
              <b>2 risiko tinggi</b>
              <small>Butuh tindakan segera</small>
            </span>
          </div>
          <div>
            <ListChecks />
            <span>
              <b>5 rekomendasi</b>
              <small>2 masih berjalan</small>
            </span>
          </div>
          <div>
            <CheckCircle2 />
            <span>
              <b>1 terverifikasi</b>
              <small>Selesai ditinjau</small>
            </span>
          </div>
        </aside>
      </div>
      <div className="manager-results-layout">
        <section className="surface manager-dimension-results">
          <div className="surface-head">
            <div>
              <h2>Hasil per dimensi</h2>
              <p>Klik dimensi untuk melihat temuan terkait</p>
            </div>
            <span className="status status-blue">4 dimensi contoh</span>
          </div>
          {result.dimensions.map((dimension, index) => {
            const delta = dimension.score - dimension.previous;
            return (
              <button
                key={dimension.name}
                onClick={() => setDetailDimension(dimension.name)}
              >
                <span className="manager-dimension-number">0{index + 1}</span>
                <div className="manager-dimension-name">
                  <b>{dimension.name}</b>
                  <small>{dimension.findings} temuan tercatat</small>
                </div>
                <div className="manager-dimension-bar">
                  <span>
                    <i style={{ width: `${dimension.score}%` }} />
                  </span>
                  <small>Nilai ilustrasi</small>
                </div>
                <strong>{dimension.score}</strong>
                <span
                  className={`manager-delta ${delta >= 0 ? 'positive' : 'negative'}`}
                >
                  {delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                  {delta >= 0 ? '+' : ''}
                  {delta}
                </span>
                <ChevronRight />
              </button>
            );
          })}
        </section>
        <aside className="surface manager-period-comparison">
          <div className="surface-head">
            <div>
              <h2>Perbandingan periode</h2>
              <p>Riwayat hasil yang sudah final</p>
            </div>
          </div>
          {periodResults.map((period, index) => (
            <button
              className={period.id === selectedPeriodId ? 'active' : ''}
              key={period.id}
              onClick={() => setSelectedPeriodId(period.id)}
            >
              <span>{index + 1}</span>
              <div>
                <b>{period.period}</b>
                <small>
                  {period.date} · {period.version}
                </small>
              </div>
              <strong>{period.score.toLocaleString('id-ID')}</strong>
            </button>
          ))}
        </aside>
      </div>
      <section className="surface manager-history-table">
        <div className="surface-head">
          <div>
            <h2>Perubahan antarperiode</h2>
            <p>
              Perbandingan menggunakan nama dimensi yang sama pada data dummy
            </p>
          </div>
        </div>
        <div className="manager-comparison-head">
          <span>Dimensi</span>
          {periodResults.map((item) => (
            <span key={item.id}>{item.period}</span>
          ))}
          <span>Perubahan</span>
        </div>
        {result.dimensions.map((dimension, dimensionIndex) => {
          const values = periodResults.map(
            (period) => period.dimensions[dimensionIndex]?.score ?? 0,
          );
          const totalDelta = values[0] - values[values.length - 1];
          return (
            <div className="manager-comparison-row" key={dimension.name}>
              <b>{dimension.name}</b>
              {values.map((value, index) => (
                <span key={`${dimension.name}-${periodResults[index].id}`}>
                  {value}
                </span>
              ))}
              <strong>
                <ArrowUpRight /> +{totalDelta}
              </strong>
            </div>
          );
        })}
      </section>

      {selectedDimension ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal manager-dimension-dialog"
            aria-labelledby="dimension-result-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Detail dimensi</p>
                <h2 id="dimension-result-title">{selectedDimension.name}</h2>
                <p>
                  {result.period} · {result.id}
                </p>
              </div>
              <button
                onClick={() => setDetailDimension(null)}
                aria-label="Tutup detail dimensi"
              >
                <X />
              </button>
            </div>
            <div className="manager-dimension-dialog-score">
              <strong>{selectedDimension.score}</strong>
              <span>
                <b>Nilai ilustrasi</b>
                <p>
                  Naik {selectedDimension.score - selectedDimension.previous}{' '}
                  poin dari periode sebelumnya.
                </p>
              </span>
            </div>
            <div className="manager-related-findings">
              <h3>Temuan terkait</h3>
              {riskFindings
                .filter((finding) => finding.level !== 'Rendah')
                .slice(0, selectedDimension.findings > 2 ? 2 : 1)
                .map((finding) => (
                  <article key={finding.id}>
                    <RiskBadge level={finding.level} />
                    <div>
                      <b>{finding.location}</b>
                      <p>{finding.issue}</p>
                    </div>
                  </article>
                ))}
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setDetailDimension(null)}
              >
                Tutup
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function LocationManagementPage() {
  const [buildings, setBuildings] = useState(initialBuildings);
  const [areas, setAreas] = useState(areaDirectory);
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    initialBuildings[0].id,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [areaFloor, setAreaFloor] = useState<FloorRecord | null>(null);
  const [buildingName, setBuildingName] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [floorName, setFloorName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaZone, setAreaZone] = useState('');
  const [feedback, setFeedback] = useState('');
  const selectedBuilding =
    buildings.find((item) => item.id === selectedBuildingId) ?? buildings[0];
  const totalFloors = buildings.reduce(
    (total, building) => total + building.floors.length,
    0,
  );
  const availablePlans = buildings.reduce(
    (total, building) =>
      total + building.floors.filter((floor) => floor.planFile).length,
    0,
  );

  function uploadPlan(buildingId: string, floorId: string, fileName: string) {
    if (!fileName) return;
    setBuildings((current) =>
      current.map((building) =>
        building.id === buildingId
          ? {
              ...building,
              floors: building.floors.map((floor) =>
                floor.id === floorId
                  ? {
                      ...floor,
                      planFile: fileName,
                      planVersion: floor.planVersion
                        ? `DENAH-v${Number(floor.planVersion.split('v')[1]) + 1}`
                        : 'DENAH-v1',
                      uploadedBy: 'Ust. M. Kamal · Pengelola',
                      uploadedAt: 'Hari ini · data dummy',
                    }
                  : floor,
              ),
            }
          : building,
      ),
    );
    setFeedback(
      `${fileName} tersimpan sebagai versi denah baru untuk simulasi lokal.`,
    );
  }

  return (
    <>
      <ManagerHeading
        title="Gedung & Denah"
        description="Kelola struktur lokasi dan unggah denah milik pesantren sebelum Asesor mencatat titik temuan."
        action={
          <button
            className="primary-button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus /> Tambah gedung
          </button>
        }
      />
      <ManagerScope compact />
      <div className="location-source-banner">
        <UploadCloud />
        <div>
          <b>Denah berasal dari Pengelola Pesantren</b>
          <p>
            Unggah satu JPG, PNG, atau PDF untuk setiap gedung dan lantai. Jika
            belum tersedia, assessment tetap berjalan menggunakan Daftar Area.
          </p>
        </div>
        <span className="status status-blue">Data dummy</span>
      </div>
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 /> {feedback}
        </div>
      ) : null}
      <div className="location-stats">
        <article>
          <Building2 />
          <span>
            <b>{buildings.length} gedung</b>
            <small>Master lokasi aktif</small>
          </span>
        </article>
        <article>
          <Layers3 />
          <span>
            <b>{totalFloors} lantai</b>
            <small>{areas.length} area terdaftar</small>
          </span>
        </article>
        <article>
          <FileImage />
          <span>
            <b>{availablePlans} denah</b>
            <small>
              {totalFloors - availablePlans} lantai belum memiliki denah
            </small>
          </span>
        </article>
      </div>
      <div className="location-management-layout">
        <aside className="surface location-building-list">
          <div className="surface-head">
            <div>
              <h2>Daftar gedung</h2>
              <p>Pilih gedung untuk mengatur lantai dan denah</p>
            </div>
          </div>
          {buildings.map((building) => (
            <button
              key={building.id}
              className={building.id === selectedBuilding.id ? 'active' : ''}
              onClick={() => setSelectedBuildingId(building.id)}
            >
              <span>
                <Building2 />
              </span>
              <div>
                <b>{building.name}</b>
                <small>
                  {building.code} · {building.floors.length} lantai
                </small>
              </div>
              <ChevronRight />
            </button>
          ))}
        </aside>
        <section className="surface location-floor-panel">
          <div className="surface-head">
            <div>
              <p className="section-kicker">{selectedBuilding.code}</p>
              <h2>{selectedBuilding.name}</h2>
              <p>
                Setiap pembaruan denah membuat versi baru agar temuan lama tetap
                menunjuk gambar yang digunakan saat assessment.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setFloorOpen(true)}
            >
              <Plus /> Tambah lantai
            </button>
          </div>
          <div className="location-floor-list">
            {selectedBuilding.floors.map((floor) => {
              const floorAreas = areas.filter(
                (area) =>
                  area.buildingId === selectedBuilding.id &&
                  area.floor === floor.name,
              );
              return (
                <article key={floor.id}>
                  <div className="location-floor-head">
                    <span>
                      <Layers3 />
                    </span>
                    <div>
                      <b>{floor.name}</b>
                      <small>
                        {floor.id} · {floorAreas.length} area terdaftar
                      </small>
                    </div>
                    <span
                      className={`status ${floor.planFile ? 'status-green' : 'status-amber'}`}
                    >
                      {floor.planFile ? <FileCheck2 /> : <AlertTriangle />}
                      {floor.planFile ? 'Denah tersedia' : 'Belum ada denah'}
                    </span>
                  </div>
                  {floor.planFile ? (
                    <div className="location-plan-file">
                      <FileImage />
                      <span>
                        <b>{floor.planFile}</b>
                        <small>
                          {floor.planVersion} · {floor.uploadedAt}
                        </small>
                        <small>{floor.uploadedBy}</small>
                      </span>
                    </div>
                  ) : (
                    <DataState
                      variant="empty"
                      title="Denah belum diunggah"
                      description="Daftar Area tetap dapat digunakan oleh Asesor."
                      compact
                    />
                  )}
                  <div className="location-area-list">
                    <div>
                      <b>Area pada lantai ini</b>
                      <button onClick={() => setAreaFloor(floor)}>
                        <Plus /> Tambah area
                      </button>
                    </div>
                    {floorAreas.length ? (
                      <p>
                        {floorAreas.map((area) => (
                          <span key={area.id}>{area.name}</span>
                        ))}
                      </p>
                    ) : (
                      <small>
                        Belum ada area. Asesor belum dapat memilih lokasi
                        spesifik.
                      </small>
                    )}
                  </div>
                  <label className="assessment-upload-button location-upload-button">
                    <Upload />{' '}
                    {floor.planFile ? 'Unggah versi baru' : 'Unggah denah'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,.pdf"
                      onChange={(event) =>
                        uploadPlan(
                          selectedBuilding.id,
                          floor.id,
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <section className="surface location-data-flow">
        <div className="surface-head">
          <div>
            <h2>Alur sumber data</h2>
            <p>Siapa membuat data dan kapan data dipakai</p>
          </div>
        </div>
        <div>
          {[
            ['1', 'Pengelola', 'Mendaftarkan gedung, lantai, area, dan denah.'],
            ['2', 'Asesor', 'Memilih area dan mencatat temuan serta bukti.'],
            [
              '3',
              'Sistem',
              'Menghitung kategori risiko dari konfigurasi Published.',
            ],
            [
              '4',
              'Pengelola',
              'Menjalankan tindak lanjut dan mengunggah bukti.',
            ],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <b>{title}</b>
                <p>{description}</p>
              </div>
              {number !== '4' ? <ArrowRight /> : <CheckCircle2 />}
            </article>
          ))}
        </div>
      </section>

      {createOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="building-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Master lokasi</p>
                <h2 id="building-create-title">Tambah gedung pesantren</h2>
                <p>Gedung baru dimulai dengan satu lantai tanpa denah.</p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                aria-label="Tutup form gedung"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const id = `BLD-${String(buildings.length + 1).padStart(3, '0')}`;
                setBuildings((current) => [
                  ...current,
                  {
                    id,
                    code: buildingCode,
                    name: buildingName,
                    floors: [
                      {
                        id: `FLR-${String(totalFloors + 1).padStart(3, '0')}`,
                        name: 'Lantai 1',
                        planFile: '',
                        planVersion: '',
                        uploadedBy: '',
                        uploadedAt: '',
                      },
                    ],
                  },
                ]);
                setSelectedBuildingId(id);
                setFeedback(`${buildingName} ditambahkan sebagai data dummy.`);
                setBuildingName('');
                setBuildingCode('');
                setCreateOpen(false);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Nama gedung
                  <input
                    required
                    value={buildingName}
                    onChange={(event) => setBuildingName(event.target.value)}
                    placeholder="Contoh: Gedung Tahfidz"
                  />
                </label>
                <label>
                  Kode gedung
                  <input
                    required
                    value={buildingCode}
                    onChange={(event) => setBuildingCode(event.target.value)}
                    placeholder="Contoh: GD-THF"
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCreateOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Plus /> Simpan gedung dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {floorOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="floor-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">{selectedBuilding.name}</p>
                <h2 id="floor-create-title">Tambah lantai</h2>
                <p>
                  Denah dan area dapat ditambahkan setelah lantai tersimpan.
                </p>
              </div>
              <button
                onClick={() => setFloorOpen(false)}
                aria-label="Tutup form lantai"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const nextId = `FLR-${String(totalFloors + 1).padStart(3, '0')}`;
                setBuildings((current) =>
                  current.map((building) =>
                    building.id === selectedBuilding.id
                      ? {
                          ...building,
                          floors: [
                            ...building.floors,
                            {
                              id: nextId,
                              name: floorName,
                              planFile: '',
                              planVersion: '',
                              uploadedBy: '',
                              uploadedAt: '',
                            },
                          ],
                        }
                      : building,
                  ),
                );
                setFeedback(
                  `${floorName} ditambahkan pada ${selectedBuilding.name}.`,
                );
                setFloorName('');
                setFloorOpen(false);
              }}
            >
              <label className="manager-followup-note">
                Nama lantai
                <input
                  required
                  value={floorName}
                  onChange={(event) => setFloorName(event.target.value)}
                  placeholder="Contoh: Lantai 3"
                />
              </label>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFloorOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Plus /> Simpan lantai dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {areaFloor ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="area-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">
                  {selectedBuilding.name} · {areaFloor.name}
                </p>
                <h2 id="area-create-title">Tambah area</h2>
                <p>
                  Area menjadi pilihan lokasi utama ketika denah tidak tersedia.
                </p>
              </div>
              <button
                onClick={() => setAreaFloor(null)}
                aria-label="Tutup form area"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setAreas((current) => [
                  ...current,
                  {
                    id: `AREA-${String(current.length + 1).padStart(3, '0')}`,
                    buildingId: selectedBuilding.id,
                    name: areaName,
                    floor: areaFloor.name,
                    zone: areaZone,
                    x: 12,
                    y: 12,
                    width: 32,
                    height: 24,
                  },
                ]);
                setFeedback(
                  `${areaName} ditambahkan sebagai area observasi dummy.`,
                );
                setAreaName('');
                setAreaZone('');
                setAreaFloor(null);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Nama area
                  <input
                    required
                    value={areaName}
                    onChange={(event) => setAreaName(event.target.value)}
                    placeholder="Contoh: Tangga Timur"
                  />
                </label>
                <label>
                  Zona/blok
                  <input
                    required
                    value={areaZone}
                    onChange={(event) => setAreaZone(event.target.value)}
                    placeholder="Contoh: Blok B"
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAreaFloor(null)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <MapPin /> Simpan area dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function RiskFindingDetail({
  finding,
  onOpenAction,
}: {
  finding: RiskFinding | undefined;
  onOpenAction: (section: string, recommendationId: string) => void;
}) {
  if (!finding)
    return (
      <aside className="surface manager-risk-detail">
        <DataState
          variant="empty"
          title="Tidak ada temuan"
          description="Ubah filter untuk melihat temuan bahaya lainnya."
        />
      </aside>
    );
  return (
    <aside className="surface manager-risk-detail risk-detail-expanded">
      <div className="manager-risk-detail-head">
        <RiskBadge level={finding.level} />
        <span>{finding.id}</span>
      </div>
      <p className="section-kicker">Temuan bahaya</p>
      <h2>{finding.hazard}</h2>
      <p className="manager-risk-zone">
        <MapPin /> {finding.building} · {finding.floor} · {finding.location}
      </p>
      <div className="risk-separation-row">
        <div>
          <small>Tingkat risiko</small>
          <RiskBadge level={finding.level} />
        </div>
        <div>
          <small>Status pekerjaan</small>
          <WorkflowBadge status={finding.status} />
        </div>
      </div>
      <dl className="risk-detail-metadata">
        <div>
          <dt>Kemungkinan</dt>
          <dd>{finding.likelihood}</dd>
        </div>
        <div>
          <dt>Keparahan</dt>
          <dd>{finding.severity}</dd>
        </div>
        <div>
          <dt>Potensi terpapar</dt>
          <dd>{finding.exposedPeople}</dd>
        </div>
        <div>
          <dt>Risiko tersisa</dt>
          <dd>{finding.residualRisk}</dd>
        </div>
      </dl>
      <div className="manager-risk-description">
        <b>Dampak yang mungkin terjadi</b>
        <p>{finding.impact}</p>
      </div>
      <div className="manager-risk-description">
        <b>Pengendalian yang sudah ada</b>
        <p>{finding.existingControl}</p>
      </div>
      <div className="risk-traceability">
        <FileCheck2 />
        <div>
          <b>Sumber dan keterlacakan</b>
          <p>
            {finding.assessmentId} · {finding.instrumentVersion}
          </p>
          <p>
            {finding.indicator} · {finding.observedAt}
          </p>
          <p>
            {finding.evidence} · {finding.planVersion}
          </p>
        </div>
      </div>
      <div className="manager-risk-recommendation">
        <Target />
        <span>
          <b>Rekomendasi {finding.recommendationId}</b>
          <p>{finding.recommendation}</p>
        </span>
      </div>
      <button
        className="primary-button"
        onClick={() =>
          onOpenAction(
            finding.status === 'Belum ditindaklanjuti'
              ? 'recommendations'
              : 'follow-up',
            finding.recommendationId,
          )
        }
      >
        <ListChecks />
        {finding.status === 'Belum ditindaklanjuti'
          ? `Buat tindak lanjut ${finding.recommendationId}`
          : `Buka tindak lanjut ${finding.recommendationId}`}
      </button>
    </aside>
  );
}

function RiskMapPage({
  onNavigate,
  onOpenAction,
}: {
  onNavigate: (section: string) => void;
  onOpenAction: (section: string, recommendationId: string) => void;
}) {
  const [view, setView] = useState<'areas' | 'plan' | 'findings'>('areas');
  const [buildingId, setBuildingId] = useState('Semua gedung');
  const [floor, setFloor] = useState('Semua lantai');
  const [riskLevel, setRiskLevel] = useState('Semua risiko');
  const [workStatus, setWorkStatus] = useState('Semua status');
  const [selectedId, setSelectedId] = useState(riskFindings[0].id);
  const selectedBuilding = initialBuildings.find(
    (building) => building.id === buildingId,
  );
  const floorOptions = selectedBuilding
    ? selectedBuilding.floors.map((item) => item.name)
    : [
        ...new Set(
          initialBuildings.flatMap((item) =>
            item.floors.map((floorItem) => floorItem.name),
          ),
        ),
      ];
  const visibleFindings = riskFindings.filter(
    (finding) =>
      (buildingId === 'Semua gedung' || finding.buildingId === buildingId) &&
      (floor === 'Semua lantai' || finding.floor === floor) &&
      (riskLevel === 'Semua risiko' || finding.level === riskLevel) &&
      (workStatus === 'Semua status' || finding.status === workStatus),
  );
  const visibleAreas = areaDirectory.filter(
    (area) =>
      (buildingId === 'Semua gedung' || area.buildingId === buildingId) &&
      (floor === 'Semua lantai' || area.floor === floor),
  );
  const selected =
    visibleFindings.find((finding) => finding.id === selectedId) ??
    visibleFindings[0];
  const activePlan = selectedBuilding?.floors.find(
    (floorItem) => floorItem.name === floor,
  );
  const planAreas = areaDirectory.filter(
    (area) => area.buildingId === buildingId && area.floor === floor,
  );

  function changeView(nextView: 'areas' | 'plan' | 'findings') {
    setView(nextView);
    if (nextView === 'plan' && buildingId === 'Semua gedung') {
      setBuildingId('BLD-001');
      setFloor('Lantai 1');
      setSelectedId('RSK-001');
    }
  }

  return (
    <>
      <ManagerHeading
        title="Peta Bahaya & Risiko"
        description="Telusuri temuan berdasarkan area, denah unggahan pesantren, dan assessment sumbernya."
        action={
          <button
            className="secondary-button"
            onClick={() => onNavigate('locations')}
          >
            <Building2 /> Kelola gedung & denah
          </button>
        }
      />
      <ManagerScope compact />
      <div className="risk-source-banner">
        <ShieldCheck />
        <div>
          <b>Pemisahan sumber data</b>
          <p>
            Lokasi dan denah berasal dari Pengelola; titik, catatan, dan bukti
            berasal dari Asesor; kategori risiko dihitung oleh konfigurasi
            instrumen Published.
          </p>
        </div>
      </div>
      <div
        className="risk-view-tabs"
        role="tablist"
        aria-label="Tampilan peta bahaya"
      >
        <button
          role="tab"
          aria-selected={view === 'areas'}
          className={view === 'areas' ? 'active' : ''}
          onClick={() => changeView('areas')}
        >
          <List /> Daftar Area
        </button>
        <button
          role="tab"
          aria-selected={view === 'plan'}
          className={view === 'plan' ? 'active' : ''}
          onClick={() => changeView('plan')}
        >
          <MapPinned /> Denah Bangunan
        </button>
        <button
          role="tab"
          aria-selected={view === 'findings'}
          className={view === 'findings' ? 'active' : ''}
          onClick={() => changeView('findings')}
        >
          <AlertTriangle /> Daftar Temuan
        </button>
      </div>
      <section className="surface risk-filter-surface">
        <div className="risk-filter-grid">
          <label>
            Periode assessment
            <select defaultValue="ASM-0254">
              <option value="ASM-0254">Semester 1 2026 · ASM-0254</option>
              <option value="ASM-0198">Semester 2 2025 · ASM-0198</option>
            </select>
          </label>
          <label>
            Gedung
            <select
              value={buildingId}
              onChange={(event) => {
                setBuildingId(event.target.value);
                setFloor('Semua lantai');
              }}
            >
              <option>Semua gedung</option>
              {initialBuildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lantai
            <select
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
            >
              <option>Semua lantai</option>
              {floorOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Tingkat risiko
            <select
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value)}
            >
              <option>Semua risiko</option>
              <option>Tinggi</option>
              <option>Sedang</option>
              <option>Rendah</option>
            </select>
          </label>
          <label>
            Status pekerjaan
            <select
              value={workStatus}
              onChange={(event) => setWorkStatus(event.target.value)}
            >
              <option>Semua status</option>
              <option>Belum ditindaklanjuti</option>
              <option>Berjalan</option>
              <option>Menunggu verifikasi</option>
              <option>Terverifikasi</option>
            </select>
          </label>
        </div>
      </section>
      <div className="risk-summary-strip">
        <span>
          <b>{visibleAreas.length}</b> area ditampilkan
        </span>
        <span>
          <b>{visibleFindings.length}</b> temuan aktif
        </span>
        <span className="high">
          <b>
            {visibleFindings.filter((item) => item.level === 'Tinggi').length}
          </b>{' '}
          risiko tinggi
        </span>
        <p>Risiko dan status pekerjaan ditampilkan terpisah.</p>
      </div>

      <div className="risk-workspace-layout">
        <section className="surface risk-primary-surface">
          {view === 'areas' ? (
            <div className="risk-area-grid">
              {visibleAreas.map((area) => {
                const building = initialBuildings.find(
                  (item) => item.id === area.buildingId,
                );
                const areaFindings = riskFindings.filter(
                  (finding) => finding.areaId === area.id,
                );
                const highest = areaFindings.some(
                  (item) => item.level === 'Tinggi',
                )
                  ? 'Tinggi'
                  : areaFindings.some((item) => item.level === 'Sedang')
                    ? 'Sedang'
                    : undefined;
                return (
                  <article key={area.id}>
                    <div className="risk-area-head">
                      <span>
                        <MapPin />
                      </span>
                      <div>
                        <b>{area.name}</b>
                        <small>
                          {building?.name} · {area.floor} · {area.zone}
                        </small>
                      </div>
                    </div>
                    {highest ? (
                      <RiskBadge level={highest} />
                    ) : (
                      <span className="status status-neutral">
                        <CheckCircle2 /> Tidak ada temuan aktif
                      </span>
                    )}
                    <p>
                      {areaFindings.length
                        ? `${areaFindings.length} temuan dari assessment aktif.`
                        : 'Area tetap tersedia untuk observasi walaupun belum memiliki titik bahaya.'}
                    </p>
                    {areaFindings.map((finding) => (
                      <button
                        key={finding.id}
                        onClick={() => setSelectedId(finding.id)}
                        className={finding.id === selected?.id ? 'active' : ''}
                      >
                        <span>{finding.id}</span>
                        <b>{finding.hazard}</b>
                        <ChevronRight />
                      </button>
                    ))}
                  </article>
                );
              })}
              {visibleAreas.length === 0 ? (
                <DataState
                  variant="empty"
                  title="Area tidak ditemukan"
                  description="Ubah pilihan gedung atau lantai."
                />
              ) : null}
            </div>
          ) : null}

          {view === 'plan' ? (
            activePlan?.planFile ? (
              <>
                <div className="plan-source-head">
                  <div>
                    <p className="section-kicker">Denah unggahan pengelola</p>
                    <h2>
                      {selectedBuilding?.name} · {activePlan.name}
                    </h2>
                    <p>
                      {activePlan.planFile} · {activePlan.planVersion} ·{' '}
                      {activePlan.uploadedAt}
                    </p>
                  </div>
                  <span className="status status-blue">
                    <FileImage /> Pratinjau dummy
                  </span>
                </div>
                <div
                  className="risk-floorplan risk-floorplan-versioned"
                  aria-label={`Denah ${selectedBuilding?.name} ${activePlan.name}`}
                >
                  {planAreas.map((area) => (
                    <div
                      className="floor-room dynamic-room"
                      key={area.id}
                      style={{
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.width}%`,
                        height: `${area.height}%`,
                      }}
                    >
                      <span>{area.name}</span>
                      <small>{area.zone}</small>
                    </div>
                  ))}
                  {visibleFindings.map((finding, index) => (
                    <button
                      className={`risk-marker risk-${finding.level.toLowerCase()} ${finding.id === selected?.id ? 'active' : ''}`}
                      style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
                      key={finding.id}
                      onClick={() => setSelectedId(finding.id)}
                      aria-label={`${finding.level}: ${finding.hazard} di ${finding.location}`}
                    >
                      <span>{index + 1}</span>
                      <b>{finding.level}</b>
                    </button>
                  ))}
                </div>
                <div className="risk-map-help">
                  <MapPin />
                  <p>
                    <b>Koordinat relatif</b>Titik disimpan pada skala 0–100 agar
                    tetap tepat ketika denah ditampilkan di desktop atau HP.
                  </p>
                </div>
              </>
            ) : (
              <DataState
                variant="empty"
                title="Denah belum tersedia"
                description="Pilih gedung dan lantai yang memiliki denah, atau gunakan Daftar Area."
                action={
                  <button
                    className="secondary-button"
                    onClick={() => onNavigate('locations')}
                  >
                    <Upload /> Kelola denah
                  </button>
                }
              />
            )
          ) : null}

          {view === 'findings' ? (
            <div className="risk-finding-list">
              {visibleFindings.map((finding, index) => (
                <button
                  className={finding.id === selected?.id ? 'active' : ''}
                  key={finding.id}
                  onClick={() => setSelectedId(finding.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <small>
                      {finding.id} · {finding.indicator}
                    </small>
                    <b>{finding.hazard}</b>
                    <p>
                      {finding.building} · {finding.floor} · {finding.location}
                    </p>
                  </div>
                  <RiskBadge level={finding.level} />
                  <WorkflowBadge status={finding.status} />
                  <ChevronRight />
                </button>
              ))}
              {visibleFindings.length === 0 ? (
                <DataState
                  variant="empty"
                  title="Temuan tidak ditemukan"
                  description="Ubah filter risiko atau status pekerjaan."
                />
              ) : null}
            </div>
          ) : null}
        </section>
        <RiskFindingDetail finding={selected} onOpenAction={onOpenAction} />
      </div>
    </>
  );
}

function RecommendationsPage({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null;
}) {
  const [items, setItems] = useState(initialRecommendations);
  const [priority, setPriority] = useState('Semua prioritas');
  const [status, setStatus] = useState('Semua status');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const [feedback, setFeedback] = useState('');
  const selected = items.find((item) => item.id === selectedId);
  const visible = items.filter(
    (item) =>
      (priority === 'Semua prioritas' || item.priority === priority) &&
      (status === 'Semua status' || item.status === status),
  );
  function startRecommendation() {
    if (!selected) return;
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status: 'Berjalan',
              owner:
                item.owner === 'Belum ditentukan'
                  ? 'Bagian Sarana'
                  : item.owner,
              dueDate:
                item.dueDate === 'Belum ditentukan'
                  ? '20 Sep 2026'
                  : item.dueDate,
              progress: Math.max(10, item.progress),
            }
          : item,
      ),
    );
    setSelectedId(null);
    setFeedback('Rencana tindak lanjut dummy berhasil dimulai.');
  }
  return (
    <>
      <ManagerHeading
        title="Rekomendasi Prioritas"
        description="Ubah temuan assessment menjadi pekerjaan yang memiliki penanggung jawab dan tenggat."
      />
      <ManagerScope compact />
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 /> {feedback}
        </div>
      ) : null}
      <div className="recommendation-summary">
        <article>
          <AlertTriangle />
          <span>
            <b>2 prioritas tinggi</b>
            <small>1 belum ditindaklanjuti</small>
          </span>
        </article>
        <article>
          <Activity />
          <span>
            <b>2 berjalan</b>
            <small>Perlu pemantauan progres</small>
          </span>
        </article>
        <article>
          <Clock3 />
          <span>
            <b>1 menunggu verifikasi</b>
            <small>Bukti sudah diajukan</small>
          </span>
        </article>
        <article>
          <CheckCircle2 />
          <span>
            <b>1 terverifikasi</b>
            <small>Selesai dan terdokumentasi</small>
          </span>
        </article>
      </div>
      <section className="surface manager-recommendation-surface">
        <div className="admin-toolbar">
          <span className="manager-filter-label">
            <Filter /> Filter rekomendasi
          </span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-label="Filter prioritas"
          >
            <option>Semua prioritas</option>
            <option>Tinggi</option>
            <option>Sedang</option>
            <option>Rendah</option>
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter status"
          >
            <option>Semua status</option>
            <option>Belum ditindaklanjuti</option>
            <option>Berjalan</option>
            <option>Menunggu verifikasi</option>
            <option>Terverifikasi</option>
          </select>
          <span className="admin-result-count">
            {visible.length} rekomendasi
          </span>
        </div>
        <div className="recommendation-card-list">
          {visible.map((item) => (
            <article key={item.id}>
              <div className="recommendation-card-head">
                <RiskBadge level={item.priority} />
                <span>{item.id}</span>
                <WorkflowBadge status={item.status} />
              </div>
              <h2>{item.title}</h2>
              <p className="recommendation-location">
                <MapPin /> {item.location}
              </p>
              <p className="recommendation-action">{item.action}</p>
              <div className="recommendation-source">
                <FileCheck2 />
                <span>
                  <small>Sumber temuan</small>
                  <b>{item.source}</b>
                </span>
              </div>
              <dl>
                <div>
                  <dt>Penanggung jawab</dt>
                  <dd>
                    <UserRound /> {item.owner}
                  </dd>
                </div>
                <div>
                  <dt>Tenggat</dt>
                  <dd>
                    <CalendarDays /> {item.dueDate}
                  </dd>
                </div>
              </dl>
              {item.status !== 'Belum ditindaklanjuti' ? (
                <div className="recommendation-progress">
                  <span>
                    <i style={{ width: `${item.progress}%` }} />
                  </span>
                  <b>{item.progress}%</b>
                </div>
              ) : null}
              <button
                className={
                  item.status === 'Belum ditindaklanjuti'
                    ? 'primary-button'
                    : 'secondary-button'
                }
                onClick={() => setSelectedId(item.id)}
              >
                {item.status === 'Belum ditindaklanjuti'
                  ? 'Buat rencana tindakan'
                  : 'Lihat pekerjaan'}{' '}
                <ArrowRight />
              </button>
            </article>
          ))}
          {visible.length === 0 ? (
            <DataState
              variant="empty"
              title="Rekomendasi tidak ditemukan"
              description="Ubah filter prioritas atau status untuk menampilkan rekomendasi lain."
            />
          ) : null}
        </div>
      </section>
      {selected ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal manager-action-dialog"
            aria-labelledby="action-plan-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Rencana tindak lanjut</p>
                <h2 id="action-plan-title">{selected.title}</h2>
                <p>
                  {selected.id} · {selected.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Tutup rencana"
              >
                <X />
              </button>
            </div>
            <div className="manager-action-source">
              <RiskBadge level={selected.priority} />
              <p>
                <b>Saran tindakan</b>
                {selected.action}
              </p>
            </div>
            <div className="admin-form-grid">
              <label>
                Penanggung jawab
                <select
                  defaultValue={
                    selected.owner === 'Belum ditentukan'
                      ? 'Bagian Sarana'
                      : selected.owner
                  }
                >
                  <option>Bagian Sarana</option>
                  <option>Tim K3 Pesantren</option>
                  <option>Bagian Kebersihan</option>
                  <option>Pimpinan Pesantren</option>
                </select>
              </label>
              <label>
                Tenggat
                <input type="date" defaultValue="2026-09-20" />
              </label>
              <label className="admin-form-full">
                Catatan rencana
                <textarea
                  rows={3}
                  defaultValue="Koordinasikan pelaksanaan, dokumentasikan kondisi sebelum dan sesudah, lalu ajukan verifikasi."
                />
              </label>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedId(null)}
              >
                Batal
              </button>
              <button className="primary-button" onClick={startRecommendation}>
                <Plus />{' '}
                {selected.status === 'Belum ditindaklanjuti'
                  ? 'Mulai tindak lanjut'
                  : 'Simpan perubahan'}
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function FollowUpPage({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null;
}) {
  const [items, setItems] = useState(
    initialRecommendations.filter(
      (item) => item.status !== 'Belum ditindaklanjuti',
    ),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const [evidenceName, setEvidenceName] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const selected = items.find((item) => item.id === selectedId);
  function submitUpdate() {
    if (!selected) return;
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              progress: evidenceName ? 100 : Math.min(90, item.progress + 20),
              status: evidenceName ? 'Menunggu verifikasi' : item.status,
            }
          : item,
      ),
    );
    setFeedback(
      evidenceName
        ? 'Bukti dummy diajukan untuk verifikasi.'
        : 'Perkembangan pekerjaan berhasil diperbarui.',
    );
    setSelectedId(null);
    setEvidenceName('');
    setNote('');
  }
  return (
    <>
      <ManagerHeading
        title="Tindak Lanjut"
        description="Pantau pekerjaan dari rekomendasi hingga bukti penyelesaian diverifikasi."
      />
      <ManagerScope compact />
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 /> {feedback}
        </div>
      ) : null}
      <div className="followup-flow">
        <div>
          <span>1</span>
          <b>Rekomendasi</b>
          <small>Temuan diterjemahkan menjadi tindakan</small>
        </div>
        <ArrowRight />
        <div>
          <span>2</span>
          <b>Dikerjakan</b>
          <small>Pengelola memperbarui progres dan bukti</small>
        </div>
        <ArrowRight />
        <div>
          <span>3</span>
          <b>Diverifikasi</b>
          <small>Pemeriksa menyetujui penyelesaian</small>
        </div>
      </div>
      <div className="followup-board">
        {(
          [
            'Berjalan',
            'Menunggu verifikasi',
            'Terverifikasi',
          ] as RecommendationStatus[]
        ).map((column) => (
          <section className="surface" key={column}>
            <div className="followup-column-head">
              <WorkflowBadge status={column} />
              <b>{items.filter((item) => item.status === column).length}</b>
            </div>
            <p>
              {column === 'Berjalan'
                ? 'Pekerjaan yang sedang dilakukan'
                : column === 'Menunggu verifikasi'
                  ? 'Bukti sudah dikirim untuk ditinjau'
                  : 'Pekerjaan selesai dan disetujui'}
            </p>
            <div className="followup-card-stack">
              {items
                .filter((item) => item.status === column)
                .map((item) => (
                  <article key={item.id}>
                    <div>
                      <RiskBadge level={item.priority} />
                      <small>{item.id}</small>
                    </div>
                    <h3>{item.title}</h3>
                    <p>
                      <MapPin /> {item.location}
                    </p>
                    <dl>
                      <div>
                        <dt>PIC</dt>
                        <dd>{item.owner}</dd>
                      </div>
                      <div>
                        <dt>Tenggat</dt>
                        <dd>{item.dueDate}</dd>
                      </div>
                    </dl>
                    <div className="recommendation-progress">
                      <span>
                        <i style={{ width: `${item.progress}%` }} />
                      </span>
                      <b>{item.progress}%</b>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedId(item.id)}
                    >
                      {column === 'Terverifikasi' ? (
                        <>
                          <Eye /> Lihat bukti
                        </>
                      ) : (
                        <>
                          <Activity /> Perbarui pekerjaan
                        </>
                      )}
                    </button>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
      {selected ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal manager-followup-dialog"
            aria-labelledby="followup-update-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">
                  {selected.status === 'Terverifikasi'
                    ? 'Bukti penyelesaian'
                    : 'Perbarui pekerjaan'}
                </p>
                <h2 id="followup-update-title">{selected.title}</h2>
                <p>
                  {selected.owner} · {selected.dueDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Tutup pembaruan"
              >
                <X />
              </button>
            </div>
            <div className="manager-followup-progress">
              <span>
                <i style={{ width: `${selected.progress}%` }} />
              </span>
              <b>{selected.progress}% selesai</b>
            </div>
            {selected.status === 'Terverifikasi' ? (
              <div className="manager-verified-evidence">
                <CheckCircle2 />
                <span>
                  <b>Penyelesaian telah diverifikasi</b>
                  <p>Bukti: dokumentasi-perbaikan-final.jpg · 20 Agu 2026</p>
                </span>
              </div>
            ) : (
              <>
                <label className="manager-followup-note">
                  Catatan perkembangan
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Jelaskan pekerjaan yang sudah dilakukan..."
                  />
                </label>
                <div className="manager-followup-evidence">
                  <ImagePlus />
                  <span>
                    <b>Bukti penyelesaian</b>
                    <small>Foto atau dokumen dummy</small>
                  </span>
                  {evidenceName ? (
                    <strong>
                      <FileCheck2 /> {evidenceName}
                    </strong>
                  ) : (
                    <label className="assessment-upload-button">
                      <Upload /> Pilih berkas
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) =>
                          setEvidenceName(event.target.files?.[0]?.name ?? '')
                        }
                      />
                    </label>
                  )}
                </div>
              </>
            )}
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedId(null)}
              >
                Tutup
              </button>
              {selected.status !== 'Terverifikasi' ? (
                <button
                  className="primary-button"
                  disabled={!note.trim() && !evidenceName}
                  onClick={submitUpdate}
                >
                  {evidenceName ? <FileCheck2 /> : <Activity />}
                  {evidenceName ? 'Ajukan verifikasi' : 'Simpan progres'}
                </button>
              ) : null}
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

const reports = [
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

function ReportsPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloaded, setDownloaded] = useState('');
  return (
    <>
      <ManagerHeading
        title="Laporan"
        description="Siapkan ringkasan hasil dan tindak lanjut yang mudah dibaca pimpinan."
        action={
          <button
            className="primary-button"
            onClick={() => setPreviewOpen(true)}
          >
            <FileText /> Buat ringkasan pimpinan
          </button>
        }
      />
      <ManagerScope compact />
      {downloaded ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Simulasi unduhan {downloaded} berhasil disiapkan.
        </div>
      ) : null}
      <div className="report-format-grid">
        <article>
          <FileText />
          <span>
            <b>Ringkasan pimpinan</b>
            <small>Indeks, risiko prioritas, dan progres tindakan</small>
          </span>
          <button onClick={() => setPreviewOpen(true)}>
            Pratinjau <Eye />
          </button>
        </article>
        <article>
          <FileSpreadsheet />
          <span>
            <b>Lampiran data</b>
            <small>Rekap dimensi dan daftar rekomendasi dummy</small>
          </span>
          <button onClick={() => setDownloaded('Excel')}>
            Ekspor <Download />
          </button>
        </article>
        <article>
          <History />
          <span>
            <b>Riwayat laporan</b>
            <small>Versi instrumen tercantum pada setiap laporan</small>
          </span>
          <button
            onClick={() =>
              document
                .getElementById('report-history')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Lihat <ArrowRight />
          </button>
        </article>
      </div>
      <section className="surface executive-report-preview">
        <div className="executive-report-head">
          <div>
            <span className="manager-report-logo">
              <ShieldCheck />
            </span>
            <span>
              <b>ISHAS</b>
              <small>Ringkasan Evaluasi K3L Pesantren</small>
            </span>
          </div>
          <div>
            <small>Pesantren</small>
            <b>PP Al-Hikmah Malang</b>
          </div>
          <div>
            <small>Periode</small>
            <b>Semester 1 2026</b>
          </div>
        </div>
        <div className="executive-report-score">
          <div>
            <p className="section-kicker">Indeks K3L ilustrasi</p>
            <strong>78,5</strong>
            <span className="status status-green">Baik</span>
          </div>
          <p>
            Hasil meningkat <b>3,2 poin</b> dibanding semester sebelumnya.
            Perhatian utama berada pada jalur evakuasi Asrama Putra A dan
            inspeksi instalasi gas Dapur Utama.
          </p>
        </div>
        <div className="executive-report-grid">
          <section>
            <h3>Ringkasan dimensi</h3>
            {periodResults[0].dimensions.map((item) => (
              <div key={item.name}>
                <span>
                  <b>{item.name}</b>
                  <small>{item.findings} temuan</small>
                </span>
                <i>
                  <em style={{ width: `${item.score}%` }} />
                </i>
                <strong>{item.score}</strong>
              </div>
            ))}
          </section>
          <aside>
            <h3>Status tindak lanjut</h3>
            <div>
              <Activity />
              <span>
                <b>2 pekerjaan berjalan</b>
                <small>Perlu dipantau sampai tenggat</small>
              </span>
            </div>
            <div>
              <Clock3 />
              <span>
                <b>1 menunggu verifikasi</b>
                <small>Bukti telah diserahkan</small>
              </span>
            </div>
            <div>
              <CheckCircle2 />
              <span>
                <b>1 sudah terverifikasi</b>
                <small>Selesai dan terdokumentasi</small>
              </span>
            </div>
          </aside>
        </div>
        <footer>
          <span>
            <LockKeyhole /> Assessment ASM-0254 · ISHAS v1.0
          </span>
          <span>Data ilustrasi prototipe · bukan hasil ilmiah final</span>
        </footer>
      </section>
      <section className="surface report-history-panel" id="report-history">
        <div className="surface-head">
          <div>
            <h2>Riwayat laporan</h2>
            <p>Laporan dipisahkan berdasarkan periode dan versi instrumen</p>
          </div>
          <span className="status status-blue">3 laporan</span>
        </div>
        {reports.map((report) => (
          <article key={report.id}>
            <span>
              <FileText />
            </span>
            <div>
              <small>{report.id}</small>
              <h3>{report.title}</h3>
              <p>
                {report.date} · {report.version}
              </p>
            </div>
            <span
              className={`status ${report.status === 'Siap diunduh' ? 'status-green' : 'status-neutral'}`}
            >
              {report.status}
            </span>
            <button className="row-action" onClick={() => setDownloaded('PDF')}>
              Unduh PDF <Download />
            </button>
          </article>
        ))}
      </section>
      {previewOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal manager-report-dialog"
            aria-labelledby="report-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Ringkasan pimpinan</p>
                <h2 id="report-create-title">Siapkan laporan periode ini</h2>
                <p>
                  Laporan menggunakan hasil final dan progres tindak lanjut
                  terbaru.
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                aria-label="Tutup form laporan"
              >
                <X />
              </button>
            </div>
            <div className="admin-form-grid">
              <label>
                Periode
                <select defaultValue="Semester 1 2026">
                  <option>Semester 1 2026</option>
                  <option>Semester 2 2025</option>
                </select>
              </label>
              <label>
                Format
                <select defaultValue="PDF">
                  <option>PDF</option>
                  <option>Excel</option>
                </select>
              </label>
              <div className="admin-form-full report-section-field">
                <b>Bagian yang disertakan</b>
                <div className="report-section-options">
                  <span>
                    <Check /> Ringkasan indeks dan dimensi
                  </span>
                  <span>
                    <Check /> Temuan risiko prioritas
                  </span>
                  <span>
                    <Check /> Status tindak lanjut
                  </span>
                  <span>
                    <Check /> Metadata assessment
                  </span>
                </div>
              </div>
            </div>
            {generated ? (
              <div className="admin-feedback">
                <CheckCircle2 /> Ringkasan dummy siap diunduh.
              </div>
            ) : null}
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setPreviewOpen(false)}
              >
                Tutup
              </button>
              <button
                className="primary-button"
                onClick={() => setGenerated(true)}
              >
                <Download /> Siapkan PDF dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

export function ManagerSection({
  section,
  onNavigate,
}: {
  section: string;
  onNavigate: (section: string) => void;
}) {
  const [focusedRecommendationId, setFocusedRecommendationId] = useState<
    string | null
  >(null);
  function openRelatedAction(nextSection: string, recommendationId: string) {
    setFocusedRecommendationId(recommendationId);
    onNavigate(nextSection);
  }
  if (section === 'results') return <ResultsPage />;
  if (section === 'locations') return <LocationManagementPage />;
  if (section === 'risk-map')
    return (
      <RiskMapPage onNavigate={onNavigate} onOpenAction={openRelatedAction} />
    );
  if (section === 'recommendations')
    return <RecommendationsPage initialSelectedId={focusedRecommendationId} />;
  if (section === 'follow-up')
    return <FollowUpPage initialSelectedId={focusedRecommendationId} />;
  if (section === 'reports') return <ReportsPage />;
  return null;
}
