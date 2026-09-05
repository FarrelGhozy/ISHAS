'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  History,
  ImagePlus,
  LockKeyhole,
  MapPin,
  MapPinned,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { DataState } from '@/components/ui/data-state';

type AssignmentStatus = 'Draft' | 'Terjadwal' | 'Final';

type Assignment = {
  id: string;
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

type AnswerState = {
  value: string;
  note: string;
  evidenceName: string;
  areaId: string;
  planPoint: { x: number; y: number } | null;
};

type AssessmentIndicator = {
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

const assignments: Assignment[] = [
  {
    id: 'ASM-0261',
    institution: 'Pesantren Darussalam',
    city: 'Kabupaten Ponorogo',
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

const indicators: AssessmentIndicator[] = [
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

const continuedAnswers: Record<string, AnswerState> = {
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

const assessmentLocations = [
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

function emptyAnswers() {
  return Object.fromEntries(
    indicators.map((indicator) => [
      indicator.id,
      { value: '', note: '', evidenceName: '', areaId: '', planPoint: null },
    ]),
  ) as Record<string, AnswerState>;
}

function AssessorHeading({
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
        <p className="section-kicker">Pelaksanaan lapangan</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function AssessorStat({
  label,
  value,
  note,
  Icon,
  tone = 'teal',
}: {
  label: string;
  value: string;
  note: string;
  Icon: LucideIcon;
  tone?: 'teal' | 'amber' | 'red' | 'blue';
}) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-head">
        <span>{label}</span>
        <i>
          <Icon />
        </i>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={`status ${status === 'Final' ? 'status-green' : status === 'Draft' ? 'status-amber' : 'status-blue'}`}
    >
      {status === 'Final' ? <LockKeyhole /> : null}
      {status}
    </span>
  );
}

function FieldAssumption() {
  return (
    <div className="assessor-assumption">
      <ShieldCheck />
      <p>
        <b>Simulasi alur lapangan</b>
        Pertanyaan, opsi jawaban, dan aturan bukti adalah data dummy dari draft
        desain. Nilai ilmiah belum ditetapkan.
      </p>
    </div>
  );
}

function AssessmentFlow({
  assignment,
  blank = false,
  onClose,
}: {
  assignment: Assignment;
  blank?: boolean;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => ({
    ...emptyAnswers(),
    ...(blank ? {} : continuedAnswers),
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [finalized, setFinalized] = useState(assignment.status === 'Final');
  const activeIndicator = indicators[activeIndex];
  const activeAnswer = answers[activeIndicator.id];
  const answeredCount = indicators.filter(
    (indicator) => answers[indicator.id]?.value,
  ).length;
  const missingAnswers = indicators.filter(
    (indicator) => indicator.required && !answers[indicator.id]?.value,
  );
  const missingEvidence = indicators.filter(
    (indicator) =>
      indicator.evidenceRequired && !answers[indicator.id]?.evidenceName,
  );
  const missingNaNotes = indicators.filter(
    (indicator) =>
      answers[indicator.id]?.value === 'N/A' &&
      !answers[indicator.id]?.note.trim(),
  );
  const missingLocations = indicators.filter(
    (indicator) => indicator.locationRequired && !answers[indicator.id]?.areaId,
  );
  const totalMissing =
    missingAnswers.length +
    missingEvidence.length +
    missingNaNotes.length +
    missingLocations.length;
  const progress = Math.round((answeredCount / indicators.length) * 100);
  const dimensions = [...new Set(indicators.map((item) => item.dimension))];
  const selectedLocation = assessmentLocations.find(
    (location) => location.id === activeAnswer.areaId,
  );

  function updateAnswer(patch: Partial<AnswerState>) {
    setAnswers((current) => ({
      ...current,
      [activeIndicator.id]: { ...current[activeIndicator.id], ...patch },
    }));
    setSaved(false);
  }

  function selectFirstInDimension(dimension: string) {
    const nextIndex = indicators.findIndex(
      (indicator) => indicator.dimension === dimension,
    );
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  }

  if (finalized) {
    return (
      <>
        <button className="assessor-back-button" onClick={onClose}>
          <ArrowLeft /> Kembali ke penugasan
        </button>
        <section className="surface assessment-final-state">
          <span>
            <LockKeyhole />
          </span>
          <p className="section-kicker">Assessment final</p>
          <h1>{assignment.institution}</h1>
          <p>
            Semua jawaban dan bukti dummy telah dikunci bersama{' '}
            <b>{assignment.version}</b>. Koreksi nantinya harus melalui alur
            terkontrol dan audit trail.
          </p>
          <div className="assessment-final-meta">
            <div>
              <small>ID assessment</small>
              <b>{assignment.id}</b>
            </div>
            <div>
              <small>Asesor</small>
              <b>Ahmad Fauzan</b>
            </div>
            <div>
              <small>Periode</small>
              <b>{assignment.period}</b>
            </div>
            <div>
              <small>Status</small>
              <b>Final · terkunci</b>
            </div>
          </div>
          <button className="primary-button" onClick={onClose}>
            Selesai <ArrowRight />
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="assessment-workbar">
        <button className="assessor-back-button" onClick={onClose}>
          <ArrowLeft /> Kembali
        </button>
        <div className="assessment-workbar-title">
          <span className="status status-amber">Draft</span>
          <div>
            <b>{assignment.institution}</b>
            <small>
              {assignment.id} · {assignment.version} · Published
            </small>
          </div>
        </div>
        <div className="assessment-workbar-actions">
          {saved ? (
            <span className="assessment-saved">
              <Check /> Tersimpan lokal
            </span>
          ) : null}
          <button className="secondary-button" onClick={() => setSaved(true)}>
            <Save /> Simpan draft
          </button>
          <button
            className="primary-button"
            onClick={() => setReviewOpen(true)}
          >
            <ClipboardCheck /> Tinjau
          </button>
        </div>
      </div>
      <FieldAssumption />
      <div className="assessment-form-layout">
        <aside className="surface assessment-dimension-nav">
          <div className="assessment-progress-summary">
            <span>
              <b>{progress}%</b>
              <small>Progress jawaban</small>
            </span>
            <div>
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              {answeredCount} dari {indicators.length} indikator contoh terisi
            </p>
          </div>
          <div className="assessment-nav-caption">Dimensi instrumen</div>
          {dimensions.map((dimension, index) => {
            const dimensionIndicators = indicators.filter(
              (indicator) => indicator.dimension === dimension,
            );
            const dimensionAnswered = dimensionIndicators.filter(
              (indicator) => answers[indicator.id]?.value,
            ).length;
            const active = activeIndicator.dimension === dimension;
            return (
              <button
                className={`assessment-dimension-button ${active ? 'active' : ''}`}
                key={dimension}
                onClick={() => selectFirstInDimension(dimension)}
              >
                <span>0{index + 1}</span>
                <div>
                  <b>{dimension}</b>
                  <small>
                    {dimensionAnswered}/{dimensionIndicators.length} terisi
                  </small>
                </div>
                {dimensionAnswered === dimensionIndicators.length ? (
                  <CheckCircle2 />
                ) : (
                  <ChevronRight />
                )}
              </button>
            );
          })}
          <div className="assessment-version-lock">
            <LockKeyhole />
            <p>
              <b>{assignment.version}</b>Versi instrumen terkunci selama
              assessment.
            </p>
          </div>
        </aside>

        <main className="surface assessment-question-panel">
          <div className="assessment-question-head">
            <div>
              <span>{activeIndicator.code}</span>
              <small>
                Indikator {activeIndex + 1} dari {indicators.length}
              </small>
            </div>
            <div>
              {activeIndicator.required ? (
                <span className="status status-red">Wajib</span>
              ) : null}
              {activeIndicator.evidenceRequired ? (
                <span className="status status-blue">
                  <Camera /> Bukti wajib
                </span>
              ) : null}
            </div>
          </div>
          <h1>{activeIndicator.title}</h1>
          <p className="assessment-prompt">{activeIndicator.prompt}</p>
          {activeIndicator.locationRequired ? (
            <div className="assessor-location-field">
              <div>
                <MapPin />
                <span>
                  <b>Lokasi observasi</b>
                  <small>
                    Dipilih dari master gedung dan area milik pesantren
                  </small>
                </span>
                <span className="status status-red">Wajib</span>
              </div>
              <label>
                Gedung, lantai, dan area
                <select
                  value={activeAnswer.areaId}
                  onChange={(event) =>
                    updateAnswer({
                      areaId: event.target.value,
                      planPoint: null,
                    })
                  }
                  required
                >
                  <option value="">Pilih lokasi observasi</option>
                  {assessmentLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                      {location.plan ? '' : ' · tanpa denah'}
                    </option>
                  ))}
                </select>
              </label>
              <div className="assessor-location-actions">
                <div>
                  {selectedLocation ? (
                    <>
                      <b>{selectedLocation.id}</b>
                      <small>
                        {selectedLocation.plan
                          ? `Denah tersedia · ${selectedLocation.plan}`
                          : 'Denah belum tersedia · lokasi tetap tercatat sebagai area'}
                      </small>
                    </>
                  ) : (
                    <small>Pilih area sebelum mencatat titik.</small>
                  )}
                </div>
                <button
                  className="secondary-button"
                  disabled={!selectedLocation?.plan}
                  onClick={() => setPinOpen(true)}
                >
                  <MapPinned />
                  {activeAnswer.planPoint
                    ? `Titik ${activeAnswer.planPoint.x}, ${activeAnswer.planPoint.y}`
                    : 'Tandai pada denah'}
                </button>
              </div>
            </div>
          ) : (
            <div className="assessment-location-not-required">
              <MapPin /> Indikator ini berlaku pada tingkat pesantren dan tidak
              membutuhkan satu titik lokasi.
            </div>
          )}
          <div
            className="assessment-options"
            role="radiogroup"
            aria-label={activeIndicator.prompt}
          >
            {activeIndicator.options.map((option) => (
              <label
                className={
                  activeAnswer.value === option.value ? 'selected' : ''
                }
                key={option.value}
              >
                <input
                  type="radio"
                  name={`answer-${activeIndicator.id}`}
                  value={option.value}
                  checked={activeAnswer.value === option.value}
                  onChange={() => updateAnswer({ value: option.value })}
                />
                <span>{option.value}</span>
                <div>
                  <b>{option.label}</b>
                  <p>{option.description}</p>
                </div>
                <i>
                  <Check />
                </i>
              </label>
            ))}
          </div>
          <label className="assessment-note-field">
            Catatan observasi
            <textarea
              rows={3}
              placeholder="Tuliskan kondisi yang ditemukan, lokasi, atau penjelasan jawaban..."
              value={activeAnswer.note}
              onChange={(event) => updateAnswer({ note: event.target.value })}
            />
            {activeAnswer.value === 'N/A' ? (
              <small>Catatan wajib untuk jawaban N/A.</small>
            ) : null}
          </label>
          <div
            className={`assessment-evidence-field ${activeIndicator.evidenceRequired ? 'required' : ''}`}
          >
            <div>
              <ImagePlus />
              <span>
                <b>Bukti lapangan</b>
                <small>
                  {activeIndicator.evidenceRequired
                    ? 'Wajib untuk indikator ini'
                    : 'Opsional untuk indikator ini'}
                </small>
              </span>
            </div>
            {activeAnswer.evidenceName ? (
              <div className="assessment-file-chip">
                <FileCheck2 />
                <span>
                  <b>{activeAnswer.evidenceName}</b>
                  <small>File dummy tersimpan lokal</small>
                </span>
                <button
                  aria-label="Hapus bukti"
                  onClick={() => updateAnswer({ evidenceName: '' })}
                >
                  <X />
                </button>
              </div>
            ) : (
              <label className="assessment-upload-button">
                <Upload /> Pilih foto atau dokumen
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) =>
                    updateAnswer({
                      evidenceName: event.target.files?.[0]?.name ?? '',
                    })
                  }
                />
              </label>
            )}
          </div>
          <div className="assessment-reference">
            <FileText />
            <span>
              <b>Sumber instrumen</b>
              <p>{activeIndicator.reference}</p>
            </span>
          </div>
          <div className="assessment-question-actions">
            <button
              className="secondary-button"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((current) => current - 1)}
            >
              <ArrowLeft /> Sebelumnya
            </button>
            <button
              className="primary-button"
              disabled={activeIndex === indicators.length - 1}
              onClick={() => setActiveIndex((current) => current + 1)}
            >
              Berikutnya <ArrowRight />
            </button>
          </div>
        </main>

        <aside className="surface assessment-check-panel">
          <div className="surface-head">
            <div>
              <h2>Kelengkapan</h2>
              <p>Diperiksa sebelum finalisasi</p>
            </div>
          </div>
          <div className="assessment-check-stat">
            <span className={missingAnswers.length === 0 ? 'done' : ''}>
              {missingAnswers.length === 0 ? <Check /> : missingAnswers.length}
            </span>
            <div>
              <b>Jawaban wajib</b>
              <small>
                {missingAnswers.length === 0 ? 'Sudah lengkap' : 'Belum terisi'}
              </small>
            </div>
          </div>
          <div className="assessment-check-stat">
            <span className={missingEvidence.length === 0 ? 'done' : ''}>
              {missingEvidence.length === 0 ? (
                <Check />
              ) : (
                missingEvidence.length
              )}
            </span>
            <div>
              <b>Bukti wajib</b>
              <small>
                {missingEvidence.length === 0
                  ? 'Sudah lengkap'
                  : 'Belum diunggah'}
              </small>
            </div>
          </div>
          <div className="assessment-check-stat">
            <span className={missingNaNotes.length === 0 ? 'done' : ''}>
              {missingNaNotes.length === 0 ? <Check /> : missingNaNotes.length}
            </span>
            <div>
              <b>Catatan N/A</b>
              <small>
                {missingNaNotes.length === 0
                  ? 'Tidak ada masalah'
                  : 'Perlu penjelasan'}
              </small>
            </div>
          </div>
          <div className="assessment-check-stat">
            <span className={missingLocations.length === 0 ? 'done' : ''}>
              {missingLocations.length === 0 ? (
                <Check />
              ) : (
                missingLocations.length
              )}
            </span>
            <div>
              <b>Lokasi observasi</b>
              <small>
                {missingLocations.length === 0
                  ? 'Sudah terhubung ke area'
                  : 'Belum dipilih'}
              </small>
            </div>
          </div>
          <button
            className="secondary-button assessment-review-button"
            onClick={() => setReviewOpen(true)}
          >
            <Eye /> Lihat ringkasan
          </button>
          <div className="assessment-autosave-note">
            <Clock3 />
            <p>
              <b>Penyimpanan prototipe</b>Data hanya tersimpan selama halaman
              ini terbuka.
            </p>
          </div>
        </aside>
      </div>

      {pinOpen && selectedLocation?.plan ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal assessor-pin-dialog"
            aria-labelledby="assessor-pin-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Lokasi pada denah</p>
                <h2 id="assessor-pin-title">Tandai titik observasi</h2>
                <p>
                  {selectedLocation.label} · {selectedLocation.plan}
                </p>
              </div>
              <button
                onClick={() => setPinOpen(false)}
                aria-label="Tutup pemilihan titik"
              >
                <X />
              </button>
            </div>
            <button
              className="assessor-pin-canvas"
              type="button"
              aria-label="Pilih posisi pada denah dummy"
              onClick={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = Math.round(
                  ((event.clientX - bounds.left) / bounds.width) * 100,
                );
                const y = Math.round(
                  ((event.clientY - bounds.top) / bounds.height) * 100,
                );
                updateAnswer({ planPoint: { x, y } });
              }}
            >
              <span className="pin-room pin-room-main">Area utama</span>
              <span className="pin-room pin-room-support">Area pendukung</span>
              <span className="pin-corridor">Koridor / sirkulasi</span>
              {activeAnswer.planPoint ? (
                <i
                  style={{
                    left: `${activeAnswer.planPoint.x}%`,
                    top: `${activeAnswer.planPoint.y}%`,
                  }}
                >
                  <MapPin />
                </i>
              ) : null}
            </button>
            <div className="context-note context-note-wide">
              <MapPin />
              <p>
                <b>Koordinat relatif</b>
                {activeAnswer.planPoint
                  ? `Titik tersimpan pada X ${activeAnswer.planPoint.x}% dan Y ${activeAnswer.planPoint.y}%.`
                  : 'Sentuh posisi temuan pada denah untuk menyimpan koordinat 0–100.'}
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  updateAnswer({ planPoint: null });
                  setPinOpen(false);
                }}
              >
                Simpan tanpa titik
              </button>
              <button
                className="primary-button"
                disabled={!activeAnswer.planPoint}
                onClick={() => setPinOpen(false)}
              >
                <Check /> Gunakan titik ini
              </button>
            </div>
          </dialog>
        </div>
      ) : null}

      {reviewOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal assessment-review-dialog"
            aria-labelledby="assessment-review-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Tinjau assessment</p>
                <h2 id="assessment-review-title">Periksa sebelum finalisasi</h2>
                <p>
                  {assignment.institution} · {assignment.version}
                </p>
              </div>
              <button
                onClick={() => setReviewOpen(false)}
                aria-label="Tutup ringkasan"
              >
                <X />
              </button>
            </div>
            <div className="assessment-review-score">
              <span className={totalMissing === 0 ? 'ready' : ''}>
                {totalMissing === 0 ? <CheckCircle2 /> : <AlertTriangle />}
              </span>
              <div>
                <b>
                  {totalMissing === 0
                    ? 'Siap difinalisasi'
                    : `${totalMissing} kelengkapan belum terpenuhi`}
                </b>
                <p>Finalisasi mengunci jawaban, bukti, dan versi instrumen.</p>
              </div>
            </div>
            <div className="assessment-review-list">
              {indicators.map((indicator) => {
                const answer = answers[indicator.id];
                const complete =
                  Boolean(answer.value) &&
                  (!indicator.evidenceRequired ||
                    Boolean(answer.evidenceName)) &&
                  (!indicator.locationRequired || Boolean(answer.areaId)) &&
                  (answer.value !== 'N/A' || Boolean(answer.note.trim()));
                return (
                  <button
                    key={indicator.id}
                    onClick={() => {
                      setActiveIndex(
                        indicators.findIndex(
                          (item) => item.id === indicator.id,
                        ),
                      );
                      setReviewOpen(false);
                    }}
                  >
                    <span className={complete ? 'complete' : ''}>
                      {complete ? <Check /> : <AlertTriangle />}
                    </span>
                    <div>
                      <small>{indicator.code}</small>
                      <b>{indicator.title}</b>
                    </div>
                    <strong>{answer.value || 'Belum dijawab'}</strong>
                    <ArrowRight />
                  </button>
                );
              })}
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setReviewOpen(false)}
              >
                Kembali mengisi
              </button>
              <button
                className="primary-button"
                disabled={totalMissing > 0}
                onClick={() => {
                  setReviewOpen(false);
                  setConfirmFinal(true);
                }}
              >
                <LockKeyhole /> Finalisasi assessment
              </button>
            </div>
          </dialog>
        </div>
      ) : null}

      {confirmFinal ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal publish-dialog"
            aria-labelledby="final-confirm-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Konfirmasi finalisasi</p>
                <h2 id="final-confirm-title">Kunci assessment ini?</h2>
                <p>Data final tidak dapat diedit langsung.</p>
              </div>
              <button
                onClick={() => setConfirmFinal(false)}
                aria-label="Tutup konfirmasi"
              >
                <X />
              </button>
            </div>
            <div className="publish-warning">
              <AlertTriangle />
              <p>
                <b>Pastikan kondisi lapangan sudah sesuai</b>Koreksi setelah
                final harus memiliki alasan dan jejak audit.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setConfirmFinal(false)}
              >
                Batal
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setConfirmFinal(false);
                  setFinalized(true);
                }}
              >
                <LockKeyhole /> Ya, finalisasi
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

export function AssessorDashboard({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const activeAssignments = assignments.filter(
    (item) => item.status !== 'Final',
  );
  return (
    <>
      <AssessorHeading
        title="Dashboard Asesor"
        description="Lanjutkan penugasan, lengkapi bukti, dan finalisasi assessment yang menjadi tanggung jawab Anda."
        action={
          <button
            className="primary-button"
            onClick={() => onNavigate('new-assessment')}
          >
            <Plus /> Mulai assessment
          </button>
        }
      />
      <div className="assessor-scope-banner">
        <UserRound />
        <div>
          <small>Lingkup akun aktif</small>
          <b>Ahmad Fauzan · Asesor lapangan</b>
          <p>Hanya 3 penugasan aktif atas nama Anda yang ditampilkan.</p>
        </div>
        <span className="status status-blue">
          <ShieldCheck /> Akses terbatas
        </span>
      </div>
      <div className="stats-grid">
        <AssessorStat
          label="Penugasan aktif"
          value="3"
          note="2 terjadwal · 1 draft"
          Icon={ClipboardList}
        />
        <AssessorStat
          label="Progress draft"
          value="67%"
          note="4 dari 6 indikator contoh"
          Icon={ClipboardCheck}
          tone="blue"
        />
        <AssessorStat
          label="Bukti belum lengkap"
          value="2"
          note="Wajib sebelum finalisasi"
          Icon={AlertTriangle}
          tone="red"
        />
        <AssessorStat
          label="Selesai periode ini"
          value="8"
          note="Terkunci dan tercatat"
          Icon={CheckCircle2}
        />
      </div>
      <div className="assessor-dashboard-grid">
        <section className="surface assessor-priority-panel">
          <div className="surface-head">
            <div>
              <h2>Prioritas penugasan</h2>
              <p>Diurutkan dari pekerjaan yang perlu dilanjutkan</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('assignments')}
            >
              Lihat semua <ArrowRight />
            </button>
          </div>
          {activeAssignments.map((assignment) => (
            <article key={assignment.id}>
              <span
                className={`assignment-date ${assignment.status === 'Draft' ? 'active' : ''}`}
              >
                <b>{assignment.date.split(' ')[0]}</b>
                <small>SEP</small>
              </span>
              <div>
                <div>
                  <StatusBadge status={assignment.status} />
                  <small>{assignment.id}</small>
                </div>
                <h3>{assignment.institution}</h3>
                <p>
                  <MapPin /> {assignment.city} · {assignment.version}
                </p>
              </div>
              <div className="assignment-progress-mini">
                <span>
                  <i style={{ width: `${assignment.progress}%` }} />
                </span>
                <b>{assignment.progress}%</b>
              </div>
              <button
                className={
                  assignment.status === 'Draft'
                    ? 'row-action row-action-primary'
                    : 'row-action'
                }
                onClick={() =>
                  onNavigate(
                    assignment.status === 'Draft'
                      ? 'assignments'
                      : 'new-assessment',
                  )
                }
              >
                {assignment.status === 'Draft' ? 'Lanjutkan' : 'Persiapkan'}{' '}
                <ArrowRight />
              </button>
            </article>
          ))}
        </section>
        <aside className="surface assessor-today-panel">
          <div className="surface-head">
            <div>
              <h2>Checklist lapangan</h2>
              <p>Sebelum membuka form</p>
            </div>
          </div>
          {[
            ['Identitas pesantren', 'Cocokkan nama dan alamat lembaga'],
            ['Kontak pendamping', 'Pastikan pengelola dapat dihubungi'],
            ['Perangkat & kamera', 'Siapkan dokumentasi bukti'],
            ['Versi instrumen', 'Gunakan versi Published pada tugas'],
          ].map(([title, note], index) => (
            <div className="assessor-checkline" key={title}>
              <span>{index + 1}</span>
              <div>
                <b>{title}</b>
                <p>{note}</p>
              </div>
            </div>
          ))}
          <button
            className="secondary-button"
            onClick={() => onNavigate('evidence')}
          >
            <Camera /> Periksa bukti lapangan
          </button>
        </aside>
      </div>
    </>
  );
}

function AssignmentsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Semua status');
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null,
  );
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      assignments.filter(
        (item) =>
          (status === 'Semua status' || item.status === status) &&
          (!normalized ||
            item.institution.toLowerCase().includes(normalized) ||
            item.id.toLowerCase().includes(normalized) ||
            item.city.toLowerCase().includes(normalized)),
      ),
    [normalized, status],
  );

  if (activeAssignment) {
    return (
      <AssessmentFlow
        assignment={activeAssignment}
        blank={activeAssignment.status === 'Terjadwal'}
        onClose={() => setActiveAssignment(null)}
      />
    );
  }

  return (
    <>
      <AssessorHeading
        title="Assessment Saya"
        description="Kelola hanya penugasan yang diberikan kepada akun Asesor aktif."
      />
      <div className="assessor-scope-banner compact">
        <ShieldCheck />
        <div>
          <small>Pembatasan akses</small>
          <b>3 penugasan aktif · Ahmad Fauzan</b>
          <p>Assessment milik asesor lain tidak ditampilkan.</p>
        </div>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari pesantren, ID, atau kota..."
              aria-label="Cari penugasan"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter status penugasan"
          >
            <option>Semua status</option>
            <option>Draft</option>
            <option>Terjadwal</option>
            <option>Final</option>
          </select>
          <span className="admin-result-count">
            {filtered.length} penugasan
          </span>
        </div>
        <div className="assignment-card-list">
          {filtered.map((assignment) => (
            <article key={assignment.id}>
              <div className="assignment-card-main">
                <span
                  className={`assignment-icon ${assignment.status === 'Draft' ? 'active' : ''}`}
                >
                  <ClipboardCheck />
                </span>
                <div>
                  <div>
                    <StatusBadge status={assignment.status} />
                    <small>{assignment.id}</small>
                  </div>
                  <h2>{assignment.institution}</h2>
                  <p>
                    <MapPin /> {assignment.city}
                  </p>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Tanggal</dt>
                  <dd>{assignment.date}</dd>
                </div>
                <div>
                  <dt>Periode</dt>
                  <dd>{assignment.period}</dd>
                </div>
                <div>
                  <dt>Instrumen</dt>
                  <dd>
                    <LockKeyhole /> {assignment.version}
                  </dd>
                </div>
                <div>
                  <dt>Kontak</dt>
                  <dd>{assignment.contact}</dd>
                </div>
              </dl>
              <div className="assignment-card-progress">
                <span>
                  <i style={{ width: `${assignment.progress}%` }} />
                </span>
                <b>{assignment.progress}%</b>
                <small>
                  {assignment.missingEvidence > 0
                    ? `${assignment.missingEvidence} bukti belum lengkap`
                    : assignment.status === 'Final'
                      ? 'Sudah dikunci'
                      : 'Belum dimulai'}
                </small>
              </div>
              <button
                className={
                  assignment.status === 'Draft'
                    ? 'primary-button'
                    : 'secondary-button'
                }
                onClick={() => setActiveAssignment(assignment)}
              >
                {assignment.status === 'Draft'
                  ? 'Lanjutkan pengisian'
                  : assignment.status === 'Final'
                    ? 'Lihat ringkasan'
                    : 'Mulai persiapan'}{' '}
                <ArrowRight />
              </button>
            </article>
          ))}
          {filtered.length === 0 ? (
            <DataState
              variant="empty"
              title="Penugasan tidak ditemukan"
              description="Ubah kata kunci atau filter status. Asesor hanya melihat penugasannya sendiri."
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

function NewAssessmentPage() {
  const [selectedId, setSelectedId] = useState(
    assignments.find((item) => item.status === 'Terjadwal')!.id,
  );
  const [checks, setChecks] = useState({
    identity: false,
    contact: false,
    period: false,
    version: false,
  });
  const [started, setStarted] = useState(false);
  const selected = assignments.find((item) => item.id === selectedId)!;
  const ready = Object.values(checks).every(Boolean);
  const verificationItems: Array<{
    id: keyof typeof checks;
    title: string;
    detail: string;
    Icon: LucideIcon;
  }> = [
    {
      id: 'identity',
      title: 'Identitas dan lokasi pesantren',
      detail: `${selected.institution} · ${selected.city}`,
      Icon: Building2,
    },
    {
      id: 'contact',
      title: 'Kontak pendamping lapangan',
      detail: selected.contact,
      Icon: UserRound,
    },
    {
      id: 'period',
      title: 'Periode dan tanggal assessment',
      detail: `${selected.period} · ${selected.date}`,
      Icon: CalendarDays,
    },
    {
      id: 'version',
      title: 'Versi instrumen Published',
      detail: `${selected.version} · akan dikunci pada assessment`,
      Icon: LockKeyhole,
    },
  ];

  if (started)
    return (
      <AssessmentFlow
        assignment={selected}
        blank
        onClose={() => setStarted(false)}
      />
    );

  return (
    <>
      <AssessorHeading
        title="Assessment Baru"
        description="Verifikasi penugasan dan data awal sebelum membuka formulir lapangan."
      />
      <FieldAssumption />
      <div className="assessment-setup-layout">
        <section className="surface assessment-setup-main">
          <div className="surface-head">
            <div>
              <p className="section-kicker">Langkah 1</p>
              <h2>Pilih penugasan terjadwal</h2>
              <p>Asesor tidak dapat membuat assessment di luar penugasannya.</p>
            </div>
          </div>
          <div className="scheduled-assignment-grid">
            {assignments
              .filter((item) => item.status === 'Terjadwal')
              .map((assignment) => (
                <button
                  className={selectedId === assignment.id ? 'selected' : ''}
                  key={assignment.id}
                  onClick={() => {
                    setSelectedId(assignment.id);
                    setChecks({
                      identity: false,
                      contact: false,
                      period: false,
                      version: false,
                    });
                  }}
                >
                  <span>
                    <Building2 />
                  </span>
                  <div>
                    <small>
                      {assignment.id} · {assignment.date}
                    </small>
                    <b>{assignment.institution}</b>
                    <p>{assignment.city}</p>
                  </div>
                  <i>{selectedId === assignment.id ? <Check /> : null}</i>
                </button>
              ))}
          </div>
          <div className="surface-head assessment-setup-second">
            <div>
              <p className="section-kicker">Langkah 2</p>
              <h2>Verifikasi data awal</h2>
              <p>Tandai setelah data cocok dengan kondisi penugasan.</p>
            </div>
          </div>
          <div className="assessment-verification-list">
            {verificationItems.map(({ id, title, detail, Icon }) => {
              const checked = checks[id];
              return (
                <label key={id} className={checked ? 'checked' : ''}>
                  <span>
                    <Icon />
                  </span>
                  <div>
                    <b>{title}</b>
                    <p>{detail}</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label={`Verifikasi ${title}`}
                    checked={checked}
                    onChange={(event) =>
                      setChecks((current) => ({
                        ...current,
                        [id]: event.target.checked,
                      }))
                    }
                  />
                  <i>{checked ? <Check /> : null}</i>
                </label>
              );
            })}
          </div>
        </section>
        <aside className="surface assessment-start-summary">
          <p className="section-kicker">Ringkasan assessment</p>
          <h2>{selected.institution}</h2>
          <p>{selected.id}</p>
          <dl>
            <div>
              <dt>Asesor</dt>
              <dd>Ahmad Fauzan</dd>
            </div>
            <div>
              <dt>Periode</dt>
              <dd>{selected.period}</dd>
            </div>
            <div>
              <dt>Instrumen</dt>
              <dd>{selected.version}</dd>
            </div>
            <div>
              <dt>Indikator contoh</dt>
              <dd>{indicators.length}</dd>
            </div>
          </dl>
          <div className={`assessment-ready-state ${ready ? 'ready' : ''}`}>
            {ready ? <CheckCircle2 /> : <Clock3 />}
            <span>
              <b>{ready ? 'Siap dimulai' : 'Menunggu verifikasi'}</b>
              <p>
                {Object.values(checks).filter(Boolean).length} dari 4 data
                dikonfirmasi
              </p>
            </span>
          </div>
          <button
            className="primary-button"
            disabled={!ready}
            onClick={() => setStarted(true)}
          >
            <ClipboardCheck /> Mulai isi assessment
          </button>
        </aside>
      </div>
    </>
  );
}

const initialEvidence = [
  {
    id: 'EV-001',
    indicator: 'IND-SAR-001',
    title: 'Jalur evakuasi sisi timur',
    institution: 'Pesantren Darussalam',
    file: 'jalur-evakuasi-timur.jpg',
    status: 'Lengkap',
  },
  {
    id: 'EV-002',
    indicator: 'IND-SAR-002',
    title: 'Instalasi listrik lantai dua',
    institution: 'Pesantren Darussalam',
    file: '',
    status: 'Wajib',
  },
  {
    id: 'EV-003',
    indicator: 'IND-SAN-009',
    title: 'Jamban Asrama A',
    institution: 'Pesantren Darussalam',
    file: 'jamban-asrama-a.jpg',
    status: 'Lengkap',
  },
  {
    id: 'EV-004',
    indicator: 'IND-DAR-001',
    title: 'Dokumentasi simulasi darurat',
    institution: 'Pesantren Darussalam',
    file: '',
    status: 'Wajib',
  },
];

function EvidencePage() {
  const [evidence, setEvidence] = useState(initialEvidence);
  const [filter, setFilter] = useState('Semua bukti');
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentSaved, setIncidentSaved] = useState(false);
  const visible = evidence.filter(
    (item) =>
      filter === 'Semua bukti' ||
      (filter === 'Belum lengkap' ? !item.file : Boolean(item.file)),
  );
  return (
    <>
      <AssessorHeading
        title="Bukti Lapangan"
        description="Pastikan foto dan dokumen terhubung ke assessment serta indikator yang tepat."
      />
      <div className="evidence-stats">
        <article>
          <Camera />
          <span>
            <b>{evidence.filter((item) => item.file).length} bukti</b>
            <small>Sudah ditambahkan</small>
          </span>
        </article>
        <article>
          <AlertTriangle />
          <span>
            <b>{evidence.filter((item) => !item.file).length} wajib</b>
            <small>Belum lengkap</small>
          </span>
        </article>
        <article>
          <LockKeyhole />
          <span>
            <b>ISHAS v1.0</b>
            <small>Versi instrumen terkait</small>
          </span>
        </article>
      </div>
      {incidentSaved ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Catatan insiden dummy tersimpan dan siap dikaitkan
          dengan indikator assessment.
        </div>
      ) : null}
      <section className="surface assessment-source-panel">
        <div className="surface-head">
          <div>
            <h2>Sumber data assessment</h2>
            <p>Jenis input yang dipetakan dari kebutuhan proposal ISHAS</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => setIncidentOpen(true)}
          >
            <Plus /> Catat insiden
          </button>
        </div>
        <div className="assessment-source-grid">
          {[
            [
              'Kuesioner',
              'Jawaban terstandar pada form indikator.',
              ClipboardList,
            ],
            [
              'Observasi lapangan',
              'Catatan kondisi dan lokasi temuan.',
              MapPin,
            ],
            [
              'Dokumen/kebijakan',
              'Foto atau PDF sebagai bukti pendukung.',
              FileText,
            ],
            [
              'Catatan insiden',
              'Kejadian, waktu, area, dan ringkasan dampak.',
              AlertTriangle,
            ],
          ].map(([title, description, Icon]) => {
            const SourceIcon = Icon as LucideIcon;
            return (
              <article key={title as string}>
                <SourceIcon />
                <span>
                  <b>{title as string}</b>
                  <small>{description as string}</small>
                </span>
                <CheckCircle2 />
              </article>
            );
          })}
        </div>
        <p className="assessment-source-note">
          Sensor/IoT tetap dicatat sebagai integrasi opsional tahap lanjut,
          bukan syarat prototipe 2026.
        </p>
      </section>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter bukti"
          >
            <option>Semua bukti</option>
            <option>Sudah lengkap</option>
            <option>Belum lengkap</option>
          </select>
          <span className="admin-result-count">
            {visible.length} item bukti
          </span>
        </div>
        <div className="evidence-card-grid">
          {visible.map((item) => (
            <article
              key={item.id}
              className={item.file ? 'complete' : 'missing'}
            >
              <div className="evidence-preview">
                {item.file ? <FileCheck2 /> : <ImagePlus />}
                <span
                  className={`status ${item.file ? 'status-green' : 'status-red'}`}
                >
                  {item.file ? 'Lengkap' : 'Bukti wajib'}
                </span>
              </div>
              <div className="evidence-card-body">
                <small>
                  {item.indicator} · {item.id}
                </small>
                <h3>{item.title}</h3>
                <p>{item.institution}</p>
                {item.file ? (
                  <div className="evidence-file-name">
                    <FileText /> {item.file}
                  </div>
                ) : (
                  <label className="assessment-upload-button">
                    <Upload /> Tambahkan bukti
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) => {
                        const name = event.target.files?.[0]?.name;
                        if (name)
                          setEvidence((current) =>
                            current.map((evidenceItem) =>
                              evidenceItem.id === item.id
                                ? {
                                    ...evidenceItem,
                                    file: name,
                                    status: 'Lengkap',
                                  }
                                : evidenceItem,
                            ),
                          );
                      }}
                    />
                  </label>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 ? (
            <DataState
              variant="empty"
              title="Bukti tidak ditemukan"
              description="Tidak ada bukti yang cocok dengan filter kelengkapan saat ini."
            />
          ) : null}
        </div>
      </section>
      <div className="context-note context-note-wide">
        <ShieldCheck />
        <p>
          <b>Privasi bukti</b>Pada versi backend, file harus dibatasi
          berdasarkan penugasan, dicatat pengunggahnya, dan tidak boleh menjadi
          tautan publik.
        </p>
      </div>
      {incidentOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="incident-form-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Sumber data pendukung</p>
                <h2 id="incident-form-title">Catat insiden lapangan</h2>
                <p>Form dummy untuk memperjelas kebutuhan data insiden.</p>
              </div>
              <button
                type="button"
                onClick={() => setIncidentOpen(false)}
                aria-label="Tutup form insiden"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setIncidentSaved(true);
                setIncidentOpen(false);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Tanggal dan waktu kejadian
                  <input type="datetime-local" required />
                </label>
                <label>
                  Area kejadian
                  <select defaultValue="" required>
                    <option value="" disabled>
                      Pilih area
                    </option>
                    <option>Asrama Putra A</option>
                    <option>Dapur Utama</option>
                    <option>Gedung Kelas</option>
                  </select>
                </label>
                <label>
                  Tingkat awal
                  <select defaultValue="Belum diklasifikasi">
                    <option>Belum diklasifikasi</option>
                    <option>Rendah (ilustrasi)</option>
                    <option>Sedang (ilustrasi)</option>
                    <option>Tinggi (ilustrasi)</option>
                  </select>
                </label>
                <label>
                  Indikator terkait
                  <select defaultValue="Belum dipetakan">
                    <option>Belum dipetakan</option>
                    <option>IND-SAR-001</option>
                    <option>IND-SAR-002</option>
                    <option>IND-DAR-001</option>
                  </select>
                </label>
                <label className="admin-form-wide">
                  Ringkasan kejadian
                  <textarea
                    rows={4}
                    required
                    placeholder="Jelaskan kejadian, kondisi, dan tindakan awal..."
                  />
                </label>
              </div>
              <div className="context-note context-note-wide">
                <ShieldCheck />
                <p>
                  <b>Klasifikasi final oleh konfigurasi</b>Level risiko di atas
                  hanya ilustrasi dan tidak menggantikan parameter ilmiah.
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIncidentOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Save /> Simpan catatan dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function HistoryPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Assignment | null>(null);
  const history = assignments.filter((item) => item.status === 'Final');
  const visible = history.filter(
    (item) =>
      !query.trim() ||
      item.institution.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <AssessorHeading
        title="Riwayat Assessment"
        description="Telusuri assessment yang pernah Anda selesaikan beserta versi instrumennya."
      />
      <div className="assessor-history-banner">
        <History />
        <div>
          <b>Riwayat hanya-baca</b>
          <p>Assessment final tidak dapat diedit dari halaman ini.</p>
        </div>
        <span className="status status-green">
          <LockKeyhole /> Terkunci
        </span>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari riwayat assessment..."
              aria-label="Cari riwayat"
            />
          </div>
          <span className="admin-result-count">
            {visible.length} assessment
          </span>
        </div>
        <div className="history-card-list">
          {visible.map((item) => (
            <article key={item.id}>
              <span>
                <CheckCircle2 />
              </span>
              <div>
                <small>
                  {item.id} · {item.date}
                </small>
                <h2>{item.institution}</h2>
                <p>
                  {item.city} · {item.period}
                </p>
              </div>
              <div>
                <small>Versi instrumen</small>
                <b>
                  <LockKeyhole /> {item.version}
                </b>
              </div>
              <StatusBadge status={item.status} />
              <button className="row-action" onClick={() => setSelected(item)}>
                Detail <ArrowRight />
              </button>
            </article>
          ))}
          {visible.length === 0 ? (
            <DataState
              variant="empty"
              title="Riwayat tidak ditemukan"
              description="Tidak ada assessment final yang cocok dengan pencarian."
            />
          ) : null}
        </div>
      </section>
      {selected ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="history-detail-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Jejak assessment</p>
                <h2 id="history-detail-title">{selected.institution}</h2>
                <p>{selected.id} · Final dan hanya-baca</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Tutup detail"
              >
                <X />
              </button>
            </div>
            <dl className="dataset-detail-grid">
              <div>
                <dt>Asesor</dt>
                <dd>Ahmad Fauzan</dd>
              </div>
              <div>
                <dt>Tanggal final</dt>
                <dd>{selected.date}</dd>
              </div>
              <div>
                <dt>Periode</dt>
                <dd>{selected.period}</dd>
              </div>
              <div>
                <dt>Versi instrumen</dt>
                <dd>{selected.version}</dd>
              </div>
              <div>
                <dt>Jawaban</dt>
                <dd>6 indikator contoh</dd>
              </div>
              <div>
                <dt>Bukti</dt>
                <dd>4 file tervalidasi</dd>
              </div>
            </dl>
            <div className="research-lock-note version-lock-note">
              <LockKeyhole />
              <p>
                Snapshot jawaban, bukti, dan versi instrumen dipertahankan agar
                hasil dapat ditelusuri.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
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

export function AssessorSection({ section }: { section: string }) {
  if (section === 'assignments') return <AssignmentsPage />;
  if (section === 'new-assessment') return <NewAssessmentPage />;
  if (section === 'evidence') return <EvidencePage />;
  if (section === 'history') return <HistoryPage />;
  return null;
}
