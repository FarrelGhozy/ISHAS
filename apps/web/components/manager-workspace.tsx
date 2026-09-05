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
  FileSpreadsheet,
  FileText,
  Filter,
  Flag,
  History,
  ImagePlus,
  ListChecks,
  LockKeyhole,
  MapPin,
  MapPinned,
  Plus,
  ShieldCheck,
  Target,
  Upload,
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
  location: string;
  zone: string;
  floor: string;
  x: number;
  y: number;
  level: RiskLevel;
  issue: string;
  indicator: string;
  recommendation: string;
  status: RecommendationStatus;
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

const riskFindings: RiskFinding[] = [
  {
    id: 'RSK-001',
    location: 'Asrama Putra A',
    zone: 'Blok A',
    floor: 'Lantai 1',
    x: 24,
    y: 28,
    level: 'Tinggi',
    issue: 'Jalur evakuasi sisi timur terhalang lemari dan barang penghuni.',
    indicator: 'IND-SAR-001',
    recommendation: 'Bebaskan jalur dan pasang penanda evakuasi yang terlihat.',
    status: 'Berjalan',
  },
  {
    id: 'RSK-002',
    location: 'Dapur Utama',
    zone: 'Blok C',
    floor: 'Lantai 1',
    x: 74,
    y: 69,
    level: 'Tinggi',
    issue: 'Inspeksi selang dan regulator instalasi gas perlu dijadwalkan.',
    indicator: 'IND-SAR-008',
    recommendation: 'Lakukan pemeriksaan instalasi gas oleh tenaga kompeten.',
    status: 'Belum ditindaklanjuti',
  },
  {
    id: 'RSK-003',
    location: 'Ruang Kelas Timur',
    zone: 'Blok B',
    floor: 'Lantai 1',
    x: 58,
    y: 27,
    level: 'Sedang',
    issue: 'Tanda keselamatan dan titik kumpul belum terlihat dari koridor.',
    indicator: 'IND-DAR-004',
    recommendation: 'Perbarui tanda arah dan lakukan pemeriksaan visibilitas.',
    status: 'Menunggu verifikasi',
  },
  {
    id: 'RSK-004',
    location: 'Kamar Mandi Asrama',
    zone: 'Blok A',
    floor: 'Lantai 1',
    x: 34,
    y: 70,
    level: 'Sedang',
    issue: 'Jadwal kebersihan belum mencantumkan penanggung jawab harian.',
    indicator: 'IND-SAN-009',
    recommendation: 'Tetapkan petugas dan dokumentasikan checklist kebersihan.',
    status: 'Berjalan',
  },
  {
    id: 'RSK-005',
    location: 'Masjid',
    zone: 'Area Tengah',
    floor: 'Lantai 1',
    x: 45,
    y: 48,
    level: 'Rendah',
    issue: 'Kondisi akses dan jalur keluar terkendali.',
    indicator: 'IND-SAR-003',
    recommendation: 'Pertahankan pemeriksaan rutin.',
    status: 'Terverifikasi',
  },
  {
    id: 'RSK-006',
    location: 'Asrama Putra A',
    zone: 'Blok A',
    floor: 'Lantai 2',
    x: 27,
    y: 35,
    level: 'Sedang',
    issue: 'Lampu darurat koridor belum memiliki catatan uji fungsi.',
    indicator: 'IND-DAR-006',
    recommendation: 'Uji fungsi lampu darurat dan simpan catatan pemeriksaan.',
    status: 'Belum ditindaklanjuti',
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

function RiskMapPage({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const [floor, setFloor] = useState('Lantai 1');
  const visibleFindings = riskFindings.filter((item) => item.floor === floor);
  const [selectedId, setSelectedId] = useState(visibleFindings[0]?.id ?? '');
  const selected =
    visibleFindings.find((item) => item.id === selectedId) ??
    visibleFindings[0];
  function chooseFloor(nextFloor: string) {
    setFloor(nextFloor);
    setSelectedId(
      riskFindings.find((item) => item.floor === nextFloor)?.id ?? '',
    );
  }
  return (
    <>
      <ManagerHeading
        title="Peta Risiko"
        description="Lihat lokasi temuan pada denah area internal dan buka tindakan yang disarankan."
        action={
          <div className="manager-floor-switch">
            <button
              className={floor === 'Lantai 1' ? 'active' : ''}
              onClick={() => chooseFloor('Lantai 1')}
            >
              Lantai 1
            </button>
            <button
              className={floor === 'Lantai 2' ? 'active' : ''}
              onClick={() => chooseFloor('Lantai 2')}
            >
              Lantai 2
            </button>
          </div>
        }
      />
      <ManagerScope compact />
      <div className="risk-map-legend">
        <span>
          <i className="high" /> Tinggi (
          {visibleFindings.filter((item) => item.level === 'Tinggi').length})
        </span>
        <span>
          <i className="medium" /> Sedang (
          {visibleFindings.filter((item) => item.level === 'Sedang').length})
        </span>
        <span>
          <i className="low" /> Rendah (
          {visibleFindings.filter((item) => item.level === 'Rendah').length})
        </span>
        <p>
          <MapPinned /> Denah konseptual · bukan peta geografis
        </p>
      </div>
      <div className="manager-risk-layout">
        <section className="surface manager-risk-map">
          <div className="risk-floorplan" aria-label={`Denah risiko ${floor}`}>
            <div className="floor-room room-dorm">
              <span>Asrama Putra A</span>
              <small>Blok A</small>
            </div>
            <div className="floor-room room-class">
              <span>Ruang Kelas</span>
              <small>Blok B</small>
            </div>
            <div className="floor-room room-clinic">
              <span>Klinik</span>
              <small>Blok D</small>
            </div>
            <div className="floor-room room-mosque">
              <span>Masjid</span>
              <small>Area Tengah</small>
            </div>
            <div className="floor-room room-bath">
              <span>Kamar Mandi</span>
              <small>Blok A</small>
            </div>
            <div className="floor-room room-kitchen">
              <span>Dapur Utama</span>
              <small>Blok C</small>
            </div>
            <div className="floor-corridor">KORIDOR UTAMA</div>
            {visibleFindings.map((finding, index) => (
              <button
                className={`risk-marker risk-${finding.level.toLowerCase()} ${finding.id === selected?.id ? 'active' : ''}`}
                style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
                key={finding.id}
                onClick={() => setSelectedId(finding.id)}
                aria-label={`${finding.level}: ${finding.location}`}
              >
                <span>{index + 1}</span>
                <b>{finding.level}</b>
              </button>
            ))}
          </div>
          <div className="risk-map-help">
            <MapPin />
            <p>
              <b>Cara membaca peta</b>Pilih titik bernomor untuk melihat lokasi,
              temuan, sumber indikator, dan tindak lanjutnya.
            </p>
          </div>
        </section>
        <aside className="surface manager-risk-detail">
          {selected ? (
            <>
              <div className="manager-risk-detail-head">
                <RiskBadge level={selected.level} />
                <span>{selected.id}</span>
              </div>
              <p className="section-kicker">Lokasi temuan</p>
              <h2>{selected.location}</h2>
              <p className="manager-risk-zone">
                <MapPin /> {selected.zone} · {selected.floor}
              </p>
              <dl>
                <div>
                  <dt>Indikator</dt>
                  <dd>{selected.indicator}</dd>
                </div>
                <div>
                  <dt>Status tindak lanjut</dt>
                  <dd>
                    <WorkflowBadge status={selected.status} />
                  </dd>
                </div>
              </dl>
              <div className="manager-risk-description">
                <b>Temuan asesor</b>
                <p>{selected.issue}</p>
              </div>
              <div className="manager-risk-recommendation">
                <Target />
                <span>
                  <b>Rekomendasi</b>
                  <p>{selected.recommendation}</p>
                </span>
              </div>
              <button
                className="primary-button"
                onClick={() => onNavigate('follow-up')}
              >
                <ListChecks /> Buka tindak lanjut
              </button>
            </>
          ) : (
            <div className="manager-empty-state">
              <MapPinned />
              <b>Tidak ada titik risiko</b>
              <p>Pilih lantai lain atau periode berbeda.</p>
            </div>
          )}
        </aside>
      </div>
      <section className="surface manager-risk-list">
        <div className="surface-head">
          <div>
            <h2>Daftar titik pada {floor}</h2>
            <p>Warna selalu disertai label tingkat risiko</p>
          </div>
        </div>
        {visibleFindings.map((finding, index) => (
          <button
            className={finding.id === selected?.id ? 'active' : ''}
            key={finding.id}
            onClick={() => setSelectedId(finding.id)}
          >
            <span>{index + 1}</span>
            <RiskBadge level={finding.level} />
            <div>
              <b>{finding.location}</b>
              <small>
                {finding.zone} · {finding.indicator}
              </small>
            </div>
            <p>{finding.issue}</p>
            <ChevronRight />
          </button>
        ))}
      </section>
    </>
  );
}

function RecommendationsPage() {
  const [items, setItems] = useState(initialRecommendations);
  const [priority, setPriority] = useState('Semua prioritas');
  const [status, setStatus] = useState('Semua status');
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

function FollowUpPage() {
  const [items, setItems] = useState(
    initialRecommendations.filter(
      (item) => item.status !== 'Belum ditindaklanjuti',
    ),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  if (section === 'results') return <ResultsPage />;
  if (section === 'risk-map') return <RiskMapPage onNavigate={onNavigate} />;
  if (section === 'recommendations') return <RecommendationsPage />;
  if (section === 'follow-up') return <FollowUpPage />;
  if (section === 'reports') return <ReportsPage />;
  return null;
}
