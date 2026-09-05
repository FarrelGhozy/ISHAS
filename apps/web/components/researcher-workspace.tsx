'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileCheck2,
  FlaskConical,
  History,
  LockKeyhole,
  Plus,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';

type InstrumentStatus = 'Draft' | 'Published' | 'Archived';

type RubricOption = {
  score: number;
  label: string;
  description: string;
};

type ResearchIndicator = {
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

type BuilderDimension = {
  id: string;
  code: string;
  name: string;
  weight: number;
  reference: string;
  plannedIndicators: number;
  indicators: ResearchIndicator[];
};

const instrumentVersions: Array<{
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

const instrumentDimensions = [
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

const defaultRubrics: RubricOption[] = [
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

const initialBuilderDimensions: BuilderDimension[] = [
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

const researchDatasets = [
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

function ResearchHeading({
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
        <p className="section-kicker">Tata kelola ilmiah</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function PrototypeAssumption({ children }: { children: ReactNode }) {
  return (
    <div className="research-assumption">
      <FlaskConical />
      <p>
        <b>Asumsi prototipe</b>
        {children}
      </p>
    </div>
  );
}

function InstrumentStatusBadge({ status }: { status: InstrumentStatus }) {
  return (
    <span
      className={`status ${status === 'Published' ? 'status-green' : status === 'Draft' ? 'status-amber' : 'status-neutral'}`}
    >
      {status === 'Published' ? <LockKeyhole /> : null}
      {status}
    </span>
  );
}

function ResearchInstrumentsPage() {
  const [selectedId, setSelectedId] = useState(instrumentVersions[0].id);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [dimensions, setDimensions] = useState(initialBuilderDimensions);
  const [selectedDimensionId, setSelectedDimensionId] = useState(
    initialBuilderDimensions[0].id,
  );
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(
    initialBuilderDimensions[0].indicators[0].id,
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showDimensionForm, setShowDimensionForm] = useState(false);
  const [newDimension, setNewDimension] = useState({
    code: 'DIM-05',
    name: '',
    weight: 0,
    reference: '',
  });
  const selected = instrumentVersions.find((item) => item.id === selectedId)!;

  const selectedDimension =
    dimensions.find((dimension) => dimension.id === selectedDimensionId) ??
    dimensions[0];
  const selectedIndicator =
    selectedDimension?.indicators.find(
      (indicator) => indicator.id === selectedIndicatorId,
    ) ?? selectedDimension?.indicators[0];
  const totalDimensionWeight = dimensions.reduce(
    (total, dimension) => total + dimension.weight,
    0,
  );
  const validationIssues = dimensions.flatMap((dimension) => [
    ...(dimension.indicators.length === 0
      ? [`${dimension.code} belum memiliki indikator.`]
      : []),
    ...dimension.indicators.flatMap((indicator) => [
      ...(!indicator.title.trim() || !indicator.prompt.trim()
        ? [
            `${indicator.code || 'Indikator baru'} belum memiliki judul atau pertanyaan.`,
          ]
        : []),
      ...(!indicator.answerType
        ? [
            `${indicator.code || 'Indikator baru'} belum memiliki jenis jawaban.`,
          ]
        : []),
      ...(!indicator.reference.trim()
        ? [
            `${indicator.code || 'Indikator baru'} belum memiliki sumber rujukan.`,
          ]
        : []),
    ]),
  ]);

  if (totalDimensionWeight !== 100) {
    validationIssues.unshift(
      `Total bobot dimensi masih ${totalDimensionWeight}%, harus 100% untuk contoh validasi ini.`,
    );
  }

  function chooseDimension(dimension: BuilderDimension) {
    setSelectedDimensionId(dimension.id);
    setSelectedIndicatorId(dimension.indicators[0]?.id ?? '');
  }

  function updateDimension(patch: Partial<BuilderDimension>) {
    setDimensions((current) =>
      current.map((dimension) =>
        dimension.id === selectedDimensionId
          ? { ...dimension, ...patch }
          : dimension,
      ),
    );
    setDirty(true);
    setSaved(false);
  }

  function updateIndicator(patch: Partial<ResearchIndicator>) {
    if (!selectedIndicator) return;
    setDimensions((current) =>
      current.map((dimension) =>
        dimension.id === selectedDimensionId
          ? {
              ...dimension,
              indicators: dimension.indicators.map((indicator) =>
                indicator.id === selectedIndicator.id
                  ? { ...indicator, ...patch }
                  : indicator,
              ),
            }
          : dimension,
      ),
    );
    setDirty(true);
    setSaved(false);
  }

  function addIndicator() {
    if (!selectedDimension) return;
    const nextNumber = selectedDimension.indicators.length + 1;
    const indicator: ResearchIndicator = {
      id: `indicator-${Date.now()}`,
      code: `${selectedDimension.code.replace('DIM', 'IND')}-${String(nextNumber).padStart(3, '0')}`,
      title: 'Indikator baru',
      prompt: '',
      answerType: 'Likert 4 tingkat',
      weight: 0,
      required: true,
      allowNa: false,
      evidenceRequired: false,
      locationRequired: false,
      reference: '',
      recommendationCondition: '',
      recommendationText: '',
      rubrics: defaultRubrics.map((item) => ({ ...item })),
    };
    setDimensions((current) =>
      current.map((dimension) =>
        dimension.id === selectedDimensionId
          ? {
              ...dimension,
              plannedIndicators: Math.max(
                dimension.plannedIndicators,
                dimension.indicators.length + 1,
              ),
              indicators: [...dimension.indicators, indicator],
            }
          : dimension,
      ),
    );
    setSelectedIndicatorId(indicator.id);
    setDirty(true);
    setSaved(false);
  }

  function addDimension() {
    if (!newDimension.name.trim() || !newDimension.code.trim()) return;
    const dimension: BuilderDimension = {
      id: `dimension-${Date.now()}`,
      ...newDimension,
      plannedIndicators: 0,
      indicators: [],
    };
    setDimensions((current) => [...current, dimension]);
    setSelectedDimensionId(dimension.id);
    setSelectedIndicatorId('');
    setNewDimension({
      code: `DIM-${String(dimensions.length + 2).padStart(2, '0')}`,
      name: '',
      weight: 0,
      reference: '',
    });
    setShowDimensionForm(false);
    setDirty(true);
    setSaved(false);
  }

  function saveDraft() {
    setDirty(false);
    setSaved(true);
  }

  if (builderOpen) {
    return (
      <>
        <div className="builder-page-heading">
          <button
            className="builder-back-button"
            onClick={() => setBuilderOpen(false)}
          >
            <ArrowLeft /> Kembali ke daftar instrumen
          </button>
          <div className="builder-title-row">
            <div>
              <div className="builder-title-meta">
                <InstrumentStatusBadge status="Draft" />
                <span>INS-v1.1-RC2</span>
                {dirty ? (
                  <b className="builder-unsaved">Belum tersimpan</b>
                ) : (
                  <b className="builder-saved">Tersimpan sebagai draft</b>
                )}
              </div>
              <h1>Instrument Builder</h1>
              <p>Susun struktur instrumen tanpa mengunci keputusan ilmiah.</p>
            </div>
            <div className="builder-heading-actions">
              <button
                className="secondary-button"
                onClick={() => setShowValidation((current) => !current)}
              >
                <FileCheck2 /> Periksa kelengkapan
              </button>
              <button className="primary-button" onClick={saveDraft}>
                <Save /> Simpan draft
              </button>
            </div>
          </div>
        </div>

        <PrototypeAssumption>
          Label, bobot, pertanyaan, dan rubric di builder adalah data dummy.
          Versi published tetap tidak dapat diedit langsung.
        </PrototypeAssumption>

        {saved ? (
          <div className="admin-feedback">
            <CheckCircle2 /> Perubahan lokal tersimpan pada simulasi draft.
          </div>
        ) : null}

        {showValidation ? (
          <section className="builder-validation surface">
            <div>
              {validationIssues.length === 0 ? (
                <CheckCircle2 />
              ) : (
                <AlertTriangle />
              )}
              <span>
                <b>
                  {validationIssues.length === 0
                    ? 'Struktur contoh lengkap'
                    : `${validationIssues.length} hal perlu dilengkapi`}
                </b>
                <p>
                  Pemeriksaan ini baru memvalidasi kelengkapan form, bukan
                  kebenaran formula ilmiah.
                </p>
              </span>
            </div>
            {validationIssues.length > 0 ? (
              <ul>
                {validationIssues.slice(0, 4).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <div className="instrument-builder-grid">
          <section className="surface builder-column builder-dimensions">
            <div className="builder-column-head">
              <div>
                <p className="section-kicker">Langkah 1</p>
                <h2>Dimensi</h2>
                <span>{dimensions.length} dimensi pada draft</span>
              </div>
              <button
                aria-label="Tambah dimensi"
                onClick={() => setShowDimensionForm(true)}
              >
                <Plus />
              </button>
            </div>
            <div className="builder-weight-summary">
              <span>
                <b>Total bobot</b>
                <small>Contoh aturan kelengkapan</small>
              </span>
              <strong className={totalDimensionWeight === 100 ? 'valid' : ''}>
                {totalDimensionWeight}%
              </strong>
            </div>
            <div className="builder-list">
              {dimensions.map((dimension) => (
                <button
                  className={`builder-dimension-card ${dimension.id === selectedDimensionId ? 'active' : ''}`}
                  key={dimension.id}
                  onClick={() => chooseDimension(dimension)}
                >
                  <span>{dimension.code}</span>
                  <b>{dimension.name}</b>
                  <small>
                    {dimension.indicators.length} contoh dari{' '}
                    {dimension.plannedIndicators} indikator
                  </small>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(100, (dimension.indicators.length / Math.max(1, dimension.plannedIndicators)) * 100)}%`,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="surface builder-column builder-indicators">
            <div className="builder-column-head">
              <div>
                <p className="section-kicker">Langkah 2</p>
                <h2>Indikator</h2>
                <span>{selectedDimension?.name}</span>
              </div>
              <button aria-label="Tambah indikator" onClick={addIndicator}>
                <Plus />
              </button>
            </div>
            <div className="builder-dimension-fields">
              <label>
                Nama dimensi
                <input
                  value={selectedDimension?.name ?? ''}
                  onChange={(event) =>
                    updateDimension({ name: event.target.value })
                  }
                />
              </label>
              <label>
                Bobot
                <span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedDimension?.weight ?? 0}
                    onChange={(event) =>
                      updateDimension({ weight: Number(event.target.value) })
                    }
                  />
                  <i>%</i>
                </span>
              </label>
            </div>
            <div className="builder-list">
              {selectedDimension?.indicators.map((indicator, index) => (
                <button
                  className={`builder-indicator-card ${indicator.id === selectedIndicator?.id ? 'active' : ''}`}
                  key={indicator.id}
                  onClick={() => setSelectedIndicatorId(indicator.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <small>{indicator.code || 'Kode belum diisi'}</small>
                    <b>{indicator.title || 'Indikator tanpa judul'}</b>
                    <p>
                      {indicator.answerType || 'Jenis jawaban belum dipilih'}
                    </p>
                  </div>
                  <ArrowRight />
                </button>
              ))}
              {selectedDimension?.indicators.length === 0 ? (
                <div className="builder-empty-state">
                  <FileCheck2 />
                  <b>Belum ada indikator</b>
                  <p>Tambahkan indikator pertama untuk dimensi ini.</p>
                  <button className="secondary-button" onClick={addIndicator}>
                    <Plus /> Tambah indikator
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="surface builder-editor">
            <div className="builder-column-head">
              <div>
                <p className="section-kicker">Langkah 3</p>
                <h2>Detail indikator</h2>
                <span>Konfigurasi pertanyaan dan aturan input</span>
              </div>
              <span className="status status-amber">Draft</span>
            </div>
            {selectedIndicator ? (
              <div className="indicator-form">
                <div className="indicator-form-grid">
                  <label>
                    Kode indikator
                    <input
                      value={selectedIndicator.code}
                      onChange={(event) =>
                        updateIndicator({ code: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Bobot indikator
                    <input
                      type="number"
                      min="0"
                      value={selectedIndicator.weight}
                      onChange={(event) =>
                        updateIndicator({ weight: Number(event.target.value) })
                      }
                    />
                  </label>
                </div>
                <label>
                  Nama indikator
                  <input
                    value={selectedIndicator.title}
                    onChange={(event) =>
                      updateIndicator({ title: event.target.value })
                    }
                  />
                </label>
                <label>
                  Pertanyaan untuk asesor
                  <textarea
                    rows={3}
                    value={selectedIndicator.prompt}
                    onChange={(event) =>
                      updateIndicator({ prompt: event.target.value })
                    }
                  />
                </label>
                <label>
                  Jenis jawaban
                  <select
                    value={selectedIndicator.answerType}
                    onChange={(event) =>
                      updateIndicator({
                        answerType: event.target.value,
                        rubrics: event.target.value.startsWith('Likert')
                          ? selectedIndicator.rubrics.length > 0
                            ? selectedIndicator.rubrics
                            : defaultRubrics.map((item) => ({ ...item }))
                          : [],
                      })
                    }
                  >
                    <option>Likert 4 tingkat</option>
                    <option>Ya / Tidak / N/A</option>
                    <option>Angka</option>
                    <option>Pilihan tunggal</option>
                    <option>Checklist majemuk</option>
                    <option>Teks observasi</option>
                  </select>
                </label>
                <div className="indicator-toggle-grid">
                  <label>
                    <input
                      type="checkbox"
                      aria-label="Jawaban indikator wajib"
                      checked={selectedIndicator.required}
                      onChange={(event) =>
                        updateIndicator({ required: event.target.checked })
                      }
                    />
                    <span>
                      <b>Jawaban wajib</b>
                      <small>Asesor tidak dapat melewati indikator</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label="Izinkan jawaban tidak berlaku"
                      checked={selectedIndicator.allowNa}
                      onChange={(event) =>
                        updateIndicator({ allowNa: event.target.checked })
                      }
                    />
                    <span>
                      <b>Izinkan N/A</b>
                      <small>Perlakuan skor menunggu aturan final</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label="Bukti lapangan wajib"
                      checked={selectedIndicator.evidenceRequired}
                      onChange={(event) =>
                        updateIndicator({
                          evidenceRequired: event.target.checked,
                        })
                      }
                    />
                    <span>
                      <b>Bukti lapangan wajib</b>
                      <small>Foto atau dokumen pendukung</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label="Lokasi observasi wajib"
                      checked={selectedIndicator.locationRequired}
                      onChange={(event) =>
                        updateIndicator({
                          locationRequired: event.target.checked,
                        })
                      }
                    />
                    <span>
                      <b>Lokasi observasi wajib</b>
                      <small>Asesor memilih gedung, lantai, dan area</small>
                    </span>
                  </label>
                </div>

                {selectedIndicator.rubrics.length > 0 ? (
                  <fieldset className="rubric-editor">
                    <legend>Rubrik penilaian</legend>
                    <p>
                      Contoh pemetaan jawaban. Nilai resmi menunggu validasi
                      peneliti.
                    </p>
                    {selectedIndicator.rubrics.map((rubric, index) => (
                      <div className="rubric-editor-row" key={rubric.score}>
                        <strong>{rubric.score}</strong>
                        <input
                          aria-label={`Label rubric skor ${rubric.score}`}
                          value={rubric.label}
                          onChange={(event) =>
                            updateIndicator({
                              rubrics: selectedIndicator.rubrics.map(
                                (item, rubricIndex) =>
                                  rubricIndex === index
                                    ? { ...item, label: event.target.value }
                                    : item,
                              ),
                            })
                          }
                        />
                        <input
                          aria-label={`Deskripsi rubric skor ${rubric.score}`}
                          value={rubric.description}
                          onChange={(event) =>
                            updateIndicator({
                              rubrics: selectedIndicator.rubrics.map(
                                (item, rubricIndex) =>
                                  rubricIndex === index
                                    ? {
                                        ...item,
                                        description: event.target.value,
                                      }
                                    : item,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                  </fieldset>
                ) : (
                  <div className="builder-inline-note">
                    <SlidersHorizontal /> Aturan konversi jawaban akan
                    disesuaikan dengan jenis jawaban terpilih.
                  </div>
                )}

                <label>
                  Sumber standar atau referensi
                  <textarea
                    rows={2}
                    placeholder="Masukkan nama dokumen, pasal, atau catatan sumber..."
                    value={selectedIndicator.reference}
                    onChange={(event) =>
                      updateIndicator({ reference: event.target.value })
                    }
                  />
                </label>
                <fieldset className="recommendation-editor">
                  <legend>Aturan rekomendasi</legend>
                  <div className="indicator-form-grid">
                    <label>
                      Pemicu
                      <input
                        placeholder="Contoh: skor ≤ 2"
                        value={selectedIndicator.recommendationCondition}
                        onChange={(event) =>
                          updateIndicator({
                            recommendationCondition: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      Tindak lanjut
                      <input
                        placeholder="Rekomendasi yang ditampilkan..."
                        value={selectedIndicator.recommendationText}
                        onChange={(event) =>
                          updateIndicator({
                            recommendationText: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                </fieldset>
              </div>
            ) : (
              <div className="builder-empty-state builder-editor-empty">
                <FileCheck2 />
                <b>Pilih atau tambahkan indikator</b>
                <p>Form pengaturan akan tampil di area ini.</p>
              </div>
            )}
          </section>
        </div>

        {showDimensionForm ? (
          <div className="admin-modal-backdrop" role="presentation">
            <dialog
              open
              className="admin-modal"
              aria-labelledby="dimension-form-title"
            >
              <div className="admin-modal-head">
                <div>
                  <p className="section-kicker">Struktur instrumen</p>
                  <h2 id="dimension-form-title">Tambah dimensi</h2>
                  <p>
                    Dimensi baru disimpan pada versi Draft yang sedang aktif.
                  </p>
                </div>
                <button
                  onClick={() => setShowDimensionForm(false)}
                  aria-label="Tutup form dimensi"
                >
                  <X />
                </button>
              </div>
              <div className="admin-form-grid builder-dimension-modal">
                <label>
                  Kode dimensi
                  <input
                    value={newDimension.code}
                    onChange={(event) =>
                      setNewDimension((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Nama dimensi
                  <input
                    autoFocus
                    value={newDimension.name}
                    onChange={(event) =>
                      setNewDimension((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Bobot contoh (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDimension.weight}
                    onChange={(event) =>
                      setNewDimension((current) => ({
                        ...current,
                        weight: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Sumber utama
                  <input
                    value={newDimension.reference}
                    onChange={(event) =>
                      setNewDimension((current) => ({
                        ...current,
                        reference: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setShowDimensionForm(false)}
                >
                  Batal
                </button>
                <button
                  className="primary-button"
                  disabled={
                    !newDimension.name.trim() || !newDimension.code.trim()
                  }
                  onClick={addDimension}
                >
                  <Plus /> Tambah dimensi
                </button>
              </div>
            </dialog>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <ResearchHeading
        title="Instrumen"
        description="Kelola struktur dimensi, indikator, rubric, bukti, dan sumber rujukan pada setiap versi."
        action={
          <button
            className="primary-button"
            onClick={() => {
              setSelectedId(instrumentVersions[0].id);
              setBuilderOpen(true);
            }}
          >
            <Plus /> Buat draft instrumen
          </button>
        }
      />
      <PrototypeAssumption>
        Jumlah indikator, bobot, dan sumber pada halaman ini hanya contoh untuk
        memvalidasi alur kerja peneliti.
      </PrototypeAssumption>
      <div className="research-instrument-layout">
        <aside className="surface research-version-list">
          <div className="surface-head">
            <div>
              <h2>Versi instrumen</h2>
              <p>Pilih versi untuk melihat strukturnya</p>
            </div>
          </div>
          {instrumentVersions.map((instrument) => (
            <button
              className={`research-version-option ${selectedId === instrument.id ? 'research-version-option-active' : ''}`}
              key={instrument.id}
              onClick={() => setSelectedId(instrument.id)}
            >
              <div>
                <InstrumentStatusBadge status={instrument.status} />
                <small>{instrument.id}</small>
              </div>
              <b>{instrument.name}</b>
              <p>{instrument.note}</p>
              <span>
                {instrument.dimensions} dimensi · {instrument.indicators}{' '}
                indikator
              </span>
            </button>
          ))}
        </aside>
        <section className="surface research-structure-panel">
          <div className="research-structure-head">
            <div>
              <div>
                <InstrumentStatusBadge status={selected.status} />
                <span>{selected.id}</span>
              </div>
              <h2>{selected.name}</h2>
              <p>
                Diperbarui {selected.updated} oleh {selected.author}
              </p>
            </div>
            {selected.status === 'Draft' ? (
              <button
                className="primary-button"
                onClick={() => setBuilderOpen(true)}
              >
                <SlidersHorizontal /> Buka instrument builder
              </button>
            ) : (
              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedId(instrumentVersions[0].id);
                  setBuilderOpen(true);
                }}
              >
                <Copy /> Buat versi baru
              </button>
            )}
          </div>
          {selected.status === 'Published' ? (
            <div className="research-lock-note">
              <LockKeyhole />
              <p>
                Versi published bersifat hanya-baca. Perubahan harus dimulai
                dari salinan versi baru.
              </p>
            </div>
          ) : null}
          <div className="research-dimension-list">
            <div className="research-dimension-head">
              <span>Dimensi</span>
              <span>Indikator</span>
              <span>Bobot dummy</span>
              <span>Kelengkapan</span>
              <span />
            </div>
            {instrumentDimensions.map((dimension) => (
              <article className="research-dimension-item" key={dimension.code}>
                <div>
                  <span>{dimension.code}</span>
                  <b>{dimension.name}</b>
                  <small>{dimension.source}</small>
                </div>
                <strong>{dimension.indicators}</strong>
                <strong>{dimension.weight}%</strong>
                <div className="research-completeness">
                  <span>
                    <i style={{ width: `${dimension.completeness}%` }} />
                  </span>
                  <b>{dimension.completeness}%</b>
                </div>
                <button
                  aria-label={`Buka ${dimension.name}`}
                  onClick={() => {
                    if (selected.status === 'Draft') {
                      const builderDimension = dimensions.find(
                        (item) => item.code === dimension.code,
                      );
                      if (builderDimension) chooseDimension(builderDimension);
                      setBuilderOpen(true);
                    }
                  }}
                  disabled={selected.status !== 'Draft'}
                >
                  <ArrowRight />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ResearchVersionsPage() {
  const [created, setCreated] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [versionDraft, setVersionDraft] = useState({
    code: 'INS-v1.2',
    parent: 'ISHAS v1.0 (Published)',
    note: 'Penyempurnaan indikator berdasarkan hasil tinjauan internal.',
  });
  return (
    <>
      <ResearchHeading
        title="Versioning Instrumen"
        description="Telusuri hubungan antarversi dan pastikan perubahan tidak mengubah hasil historis."
        action={
          <button
            className="primary-button"
            onClick={() => setShowCreateForm(true)}
          >
            <Copy /> Buat versi dari v1.0
          </button>
        }
      />
      {created ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Draft v1.2 berhasil dibuat dari versi published v1.0.
        </div>
      ) : null}
      <div className="research-version-summary">
        <article>
          <BookOpenCheck />
          <span>
            <b>3 versi</b>
            <small>1 published · 1 draft · 1 arsip</small>
          </span>
        </article>
        <article>
          <LockKeyhole />
          <span>
            <b>124 assessment</b>
            <small>Terkunci pada ISHAS v1.0</small>
          </span>
        </article>
        <article>
          <History />
          <span>
            <b>18 perubahan</b>
            <small>Tercatat pada draft v1.1</small>
          </span>
        </article>
      </div>
      <section className="surface version-timeline-panel">
        <div className="surface-head">
          <div>
            <h2>Riwayat versi</h2>
            <p>Setiap versi mempertahankan snapshot konfigurasi ilmiahnya</p>
          </div>
          <span className="status status-blue">Jejak hanya-baca</span>
        </div>
        <div className="version-timeline">
          {instrumentVersions.map((version, index) => (
            <article key={version.id}>
              <span className="timeline-marker">{index + 1}</span>
              <div className="timeline-card">
                <div className="timeline-card-head">
                  <div>
                    <InstrumentStatusBadge status={version.status} />
                    <span>{version.id}</span>
                  </div>
                  <time>{version.updated}</time>
                </div>
                <h3>{version.name}</h3>
                <p>{version.note}</p>
                <div className="timeline-meta">
                  <span>{version.author}</span>
                  <span>{version.dimensions} dimensi</span>
                  <span>{version.indicators} indikator</span>
                  {version.status === 'Published' ? (
                    <b>Dipakai 124 assessment</b>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="research-rule-grid">
        <article className="surface">
          <LockKeyhole />
          <div>
            <b>Published selalu terkunci</b>
            <p>Tidak ada edit langsung pada versi yang pernah digunakan.</p>
          </div>
        </article>
        <article className="surface">
          <Copy />
          <div>
            <b>Perubahan melalui versi baru</b>
            <p>Draft baru menyimpan referensi versi induknya.</p>
          </div>
        </article>
        <article className="surface">
          <History />
          <div>
            <b>Hasil dapat direproduksi</b>
            <p>Assessment tetap mengacu pada snapshot versi awal.</p>
          </div>
        </article>
      </div>

      {showCreateForm ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="version-form-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Versi instrumen</p>
                <h2 id="version-form-title">Buat draft versi baru</h2>
                <p>
                  Struktur versi induk disalin; assessment historis tidak
                  berubah.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                aria-label="Tutup form versi"
              >
                <X />
              </button>
            </div>
            <div className="admin-form-grid version-form-grid">
              <label>
                Kode versi
                <input
                  value={versionDraft.code}
                  onChange={(event) =>
                    setVersionDraft((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Versi induk
                <select
                  value={versionDraft.parent}
                  onChange={(event) =>
                    setVersionDraft((current) => ({
                      ...current,
                      parent: event.target.value,
                    }))
                  }
                >
                  <option>ISHAS v1.0 (Published)</option>
                  <option>ISHAS v0.9 (Archived)</option>
                </select>
              </label>
              <label className="admin-form-full">
                Catatan perubahan
                <textarea
                  rows={3}
                  value={versionDraft.note}
                  onChange={(event) =>
                    setVersionDraft((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="research-lock-note version-lock-note">
              <LockKeyhole />
              <p>
                Versi induk tetap terkunci. Seluruh edit dilakukan pada draft
                baru dan dicatat sebagai perubahan terpisah.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setShowCreateForm(false)}
              >
                Batal
              </button>
              <button
                className="primary-button"
                disabled={
                  !versionDraft.code.trim() || !versionDraft.note.trim()
                }
                onClick={() => {
                  setShowCreateForm(false);
                  setCreated(true);
                }}
              >
                <Copy /> Buat draft {versionDraft.code}
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function ResearchScoringPage() {
  const [weights, setWeights] = useState(
    instrumentDimensions.map((item) => item.weight),
  );
  const [rubrics, setRubrics] = useState(
    defaultRubrics.map((item) => ({ ...item })),
  );
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [recommendationRule, setRecommendationRule] = useState({
    condition: 'Skor indikator ≤ 2',
    action: 'Tampilkan rekomendasi perbaikan sanitasi prioritas.',
  });
  const [saved, setSaved] = useState(false);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  function updateWeight(index: number, value: string) {
    const parsed = Number(value);
    setWeights((current) =>
      current.map((weight, itemIndex) =>
        itemIndex === index ? Math.max(0, Math.min(100, parsed || 0)) : weight,
      ),
    );
    setSaved(false);
  }

  return (
    <>
      <ResearchHeading
        title="Konfigurasi Scoring"
        description="Susun bobot, rubric jawaban, kebutuhan bukti, dan pemicu rekomendasi pada versi draft."
        action={
          <button
            className="primary-button"
            disabled={totalWeight !== 100}
            onClick={() => setSaved(true)}
          >
            <Check /> Simpan konfigurasi
          </button>
        }
      />
      <PrototypeAssumption>
        Seluruh bobot dan ambang di bawah adalah contoh antarmuka, bukan formula
        ilmiah ISHAS yang sudah disahkan.
      </PrototypeAssumption>
      {saved ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Konfigurasi dummy disimpan pada draft ISHAS v1.1.
        </div>
      ) : null}
      <div className="scoring-layout">
        <section className="surface scoring-weight-panel">
          <div className="surface-head">
            <div>
              <h2>Bobot dimensi</h2>
              <p>Total bobot harus tepat 100% sebelum validasi</p>
            </div>
            <span
              className={`scoring-total ${totalWeight === 100 ? 'scoring-total-valid' : 'scoring-total-invalid'}`}
            >
              Total {totalWeight}%
            </span>
          </div>
          {instrumentDimensions.map((dimension, index) => (
            <label className="scoring-weight-row" key={dimension.code}>
              <span>
                <small>{dimension.code}</small>
                <b>{dimension.name}</b>
              </span>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights[index]}
                  onChange={(event) => updateWeight(index, event.target.value)}
                  aria-label={`Bobot ${dimension.name}`}
                />
                <span>%</span>
              </div>
            </label>
          ))}
          {totalWeight !== 100 ? (
            <div className="scoring-warning">
              <AlertTriangle /> Sesuaikan bobot sebesar{' '}
              {Math.abs(100 - totalWeight)}% agar total kembali 100%.
            </div>
          ) : null}
        </section>
        <aside className="surface scoring-rubric-panel">
          <div className="surface-head">
            <div>
              <h2>Rubric jawaban contoh</h2>
              <p>IND-SAN-009 · Ketersediaan jamban</p>
            </div>
            <span className="status status-amber">Draft</span>
          </div>
          {rubrics.map((rubric, index) => (
            <div className="rubric-row rubric-row-editable" key={rubric.score}>
              <span>{rubric.score}</span>
              <div>
                <input
                  aria-label={`Label skor ${rubric.score}`}
                  value={rubric.label}
                  onChange={(event) => {
                    setRubrics((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    );
                    setSaved(false);
                  }}
                />
                <textarea
                  aria-label={`Kriteria skor ${rubric.score}`}
                  rows={2}
                  value={rubric.description}
                  onChange={(event) => {
                    setRubrics((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, description: event.target.value }
                          : item,
                      ),
                    );
                    setSaved(false);
                  }}
                />
              </div>
            </div>
          ))}
          <label className="rubric-requirement rubric-requirement-control">
            <input
              type="checkbox"
              aria-label="Wajibkan bukti lapangan"
              checked={evidenceRequired}
              onChange={(event) => {
                setEvidenceRequired(event.target.checked);
                setSaved(false);
              }}
            />
            <p>
              <b>Bukti lapangan wajib</b>Aktifkan untuk mewajibkan foto atau
              dokumen pendukung pada indikator ini.
            </p>
          </label>
        </aside>
      </div>
      <section className="surface recommendation-rule-panel recommendation-rule-editable">
        <div>
          <SlidersHorizontal />
          <span>
            <b>Contoh pemicu rekomendasi</b>
            <p>Hubungkan kondisi jawaban dengan tindak lanjut yang tampil.</p>
          </span>
        </div>
        <label>
          Kondisi pemicu
          <input
            value={recommendationRule.condition}
            onChange={(event) => {
              setRecommendationRule((current) => ({
                ...current,
                condition: event.target.value,
              }));
              setSaved(false);
            }}
          />
        </label>
        <label>
          Rekomendasi
          <input
            value={recommendationRule.action}
            onChange={(event) => {
              setRecommendationRule((current) => ({
                ...current,
                action: event.target.value,
              }));
              setSaved(false);
            }}
          />
        </label>
        <span className="status status-amber">Belum disahkan</span>
      </section>
    </>
  );
}

const initialValidationItems = [
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

function ResearchValidationPage() {
  const [items, setItems] = useState(initialValidationItems);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [published, setPublished] = useState(false);
  const completed = items.filter((item) => item.done).length;
  const ready = completed === items.length;
  const percent = Math.round((completed / items.length) * 100);

  function completeItem(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, done: true } : item)),
    );
  }

  return (
    <>
      <ResearchHeading
        title="Validasi & Publikasi"
        description="Pastikan draft memenuhi seluruh pemeriksaan sebelum dikunci sebagai versi published."
        action={
          <button
            className="primary-button"
            disabled={!ready || published}
            onClick={() => setConfirmPublish(true)}
          >
            <LockKeyhole />{' '}
            {published ? 'Sudah dipublikasikan' : 'Publikasikan versi'}
          </button>
        }
      />
      {published ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Simulasi publikasi selesai. ISHAS v1.1 kini terkunci.
        </div>
      ) : null}
      <div className="validation-layout">
        <section className="surface validation-checklist">
          <div className="surface-head">
            <div>
              <h2>Kesiapan ISHAS v1.1</h2>
              <p>
                {completed} dari {items.length} pemeriksaan selesai
              </p>
            </div>
            <strong>{percent}%</strong>
          </div>
          <div className="validation-progress">
            <i style={{ width: `${percent}%` }} />
          </div>
          {items.map((item) => (
            <div className="validation-item" key={item.id}>
              <span
                className={item.done ? 'validation-done' : 'validation-pending'}
              >
                {item.done ? <Check /> : <AlertTriangle />}
              </span>
              <b>{item.label}</b>
              {item.done ? (
                <span className="status status-green">Selesai</span>
              ) : (
                <button onClick={() => completeItem(item.id)}>
                  Tandai selesai
                </button>
              )}
            </div>
          ))}
        </section>
        <aside className="surface publication-summary">
          <FileCheck2 />
          <p className="section-kicker">Ringkasan publikasi</p>
          <h2>ISHAS v1.1 — Kandidat Rilis</h2>
          <dl>
            <div>
              <dt>Versi induk</dt>
              <dd>ISHAS v1.0</dd>
            </div>
            <div>
              <dt>Dimensi</dt>
              <dd>4</dd>
            </div>
            <div>
              <dt>Indikator</dt>
              <dd>52</dd>
            </div>
            <div>
              <dt>Peneliti</dt>
              <dd>Dr. M. Ridwan</dd>
            </div>
          </dl>
          <div className="research-lock-note">
            <LockKeyhole />
            <p>
              Setelah dipublikasikan, seluruh konfigurasi menjadi hanya-baca.
            </p>
          </div>
        </aside>
      </div>

      {confirmPublish ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal publish-dialog"
            aria-labelledby="publish-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Konfirmasi publikasi</p>
                <h2 id="publish-title">Kunci ISHAS v1.1?</h2>
                <p>
                  Tindakan ini membuat versi tersedia untuk assessment baru dan
                  tidak dapat diedit langsung.
                </p>
              </div>
              <button
                onClick={() => setConfirmPublish(false)}
                aria-label="Tutup konfirmasi"
              >
                <X />
              </button>
            </div>
            <div className="publish-warning">
              <AlertTriangle />
              <p>
                <b>Periksa kembali keputusan ilmiah</b>Versi published hanya
                dapat diperbaiki melalui versi baru.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setConfirmPublish(false)}
              >
                Batal
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setConfirmPublish(false);
                  setPublished(true);
                }}
              >
                <LockKeyhole /> Ya, publikasikan
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

function ResearchDataPage() {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('Semua periode');
  const [exported, setExported] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [imported, setImported] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDatasets = useMemo(
    () =>
      researchDatasets.filter(
        (dataset) =>
          (period === 'Semua periode' || dataset.period === period) &&
          (!normalizedQuery ||
            dataset.name.toLowerCase().includes(normalizedQuery) ||
            dataset.id.toLowerCase().includes(normalizedQuery) ||
            dataset.instrument.toLowerCase().includes(normalizedQuery)),
      ),
    [normalizedQuery, period],
  );
  const selectedDataset = researchDatasets.find(
    (dataset) => dataset.id === selectedDatasetId,
  );
  return (
    <>
      <ResearchHeading
        title="Data Penelitian"
        description="Kelola dataset assessment teragregasi dengan jejak versi instrumen dan status verifikasi."
        action={
          <div className="page-heading-actions">
            <button
              className="secondary-button"
              onClick={() => setImportOpen(true)}
            >
              <Upload /> Import Excel/CSV
            </button>
            <button
              className="secondary-button"
              onClick={() => setExported(true)}
            >
              <Download /> Ekspor dataset
            </button>
          </div>
        }
      />
      <div className="research-data-guardrail">
        <ShieldCheck />
        <div>
          <b>Data untuk penelitian</b>
          <p>
            Tampilan ini menggunakan data dummy. Ekspor produksi nantinya harus
            menerapkan izin, minimisasi data, dan anonimisasi identitas.
          </p>
        </div>
      </div>
      {exported ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          Simulasi ekspor berhasil disiapkan dengan metadata versi instrumen.
        </div>
      ) : null}
      {imported ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          Simulasi import selesai divalidasi. Baris bermasalah akan ditolak
          sebelum data masuk ke dataset.
        </div>
      ) : null}
      <div className="research-data-stats">
        <article>
          <Database />
          <span>
            <b>4 dataset</b>
            <small>3 aktif · 1 arsip</small>
          </span>
        </article>
        <article>
          <BookOpenCheck />
          <span>
            <b>2.304 rekaman</b>
            <small>Data indikator dummy</small>
          </span>
        </article>
        <article>
          <ShieldCheck />
          <span>
            <b>2 terverifikasi</b>
            <small>Siap untuk analisis contoh</small>
          </span>
        </article>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari dataset, kode, atau versi..."
              aria-label="Cari dataset"
            />
          </div>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Filter periode"
          >
            <option>Semua periode</option>
            <option>Semester 1 2026</option>
            <option>Semester 2 2025</option>
            <option>Semester 1 2025</option>
          </select>
          <span className="admin-result-count">
            {filteredDatasets.length} dataset
          </span>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table research-data-table admin-table-head">
            <span>Dataset</span>
            <span>Periode</span>
            <span>Versi instrumen</span>
            <span>Pesantren</span>
            <span>Rekaman</span>
            <span>Status</span>
            <span />
          </div>
          {filteredDatasets.map((dataset) => (
            <div
              className="admin-table research-data-table admin-table-row"
              key={dataset.id}
            >
              <div className="dataset-name">
                <span>
                  <Database />
                </span>
                <div>
                  <b>{dataset.name}</b>
                  <small>{dataset.id}</small>
                </div>
              </div>
              <span>{dataset.period}</span>
              <span className="admin-role-chip">{dataset.instrument}</span>
              <span>{dataset.institutions}</span>
              <span>{dataset.records.toLocaleString('id-ID')}</span>
              <span
                className={`status ${dataset.status === 'Terverifikasi' ? 'status-green' : dataset.status === 'Validasi' ? 'status-amber' : 'status-neutral'}`}
              >
                {dataset.status}
              </span>
              <button
                className="admin-row-button"
                aria-label={`Buka ${dataset.name}`}
                onClick={() => setSelectedDatasetId(dataset.id)}
              >
                <ArrowRight />
              </button>
            </div>
          ))}
          {filteredDatasets.length === 0 ? (
            <DataState
              variant="empty"
              title="Dataset tidak ditemukan"
              description="Ubah kata kunci atau filter periode untuk melihat dataset lain."
              compact
            />
          ) : null}
        </div>
      </section>

      {selectedDataset ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal dataset-dialog"
            aria-labelledby="dataset-detail-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Detail dataset</p>
                <h2 id="dataset-detail-title">{selectedDataset.name}</h2>
                <p>{selectedDataset.id} · Data dummy untuk validasi tampilan</p>
              </div>
              <button
                onClick={() => setSelectedDatasetId(null)}
                aria-label="Tutup detail dataset"
              >
                <X />
              </button>
            </div>
            <dl className="dataset-detail-grid">
              <div>
                <dt>Periode</dt>
                <dd>{selectedDataset.period}</dd>
              </div>
              <div>
                <dt>Versi instrumen</dt>
                <dd>{selectedDataset.instrument}</dd>
              </div>
              <div>
                <dt>Jumlah pesantren</dt>
                <dd>{selectedDataset.institutions}</dd>
              </div>
              <div>
                <dt>Rekaman indikator</dt>
                <dd>{selectedDataset.records.toLocaleString('id-ID')}</dd>
              </div>
              <div>
                <dt>Status verifikasi</dt>
                <dd>{selectedDataset.status}</dd>
              </div>
              <div>
                <dt>Identitas personal</dt>
                <dd>Dianonimkan</dd>
              </div>
            </dl>
            <div className="research-data-guardrail dataset-guardrail">
              <ShieldCheck />
              <div>
                <b>Metadata wajib saat ekspor</b>
                <p>
                  Kode dataset, periode, versi instrumen, status verifikasi, dan
                  waktu ekspor harus ikut tercatat.
                </p>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedDatasetId(null)}
              >
                Tutup
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setExported(true);
                  setSelectedDatasetId(null);
                }}
              >
                <Download /> Ekspor data dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}

      {importOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal dataset-dialog"
            aria-labelledby="dataset-import-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Import data terkontrol</p>
                <h2 id="dataset-import-title">Validasi file Excel/CSV</h2>
                <p>File diperiksa sebelum data dapat dimasukkan ke dataset.</p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                aria-label="Tutup import dataset"
              >
                <X />
              </button>
            </div>
            <label className="assessment-upload-button dataset-import-upload">
              <Upload /> Pilih file .xlsx atau .csv
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(event) =>
                  setImportFile(event.target.files?.[0]?.name ?? '')
                }
              />
            </label>
            {importFile ? (
              <div className="research-data-guardrail dataset-guardrail">
                <FileCheck2 />
                <div>
                  <b>{importFile}</b>
                  <p>
                    Simulasi validasi: kolom identitas, versi instrumen, kode
                    indikator, tipe nilai, dan duplikasi akan diperiksa.
                  </p>
                </div>
              </div>
            ) : (
              <DataState
                variant="empty"
                title="Belum ada file dipilih"
                description="Gunakan template sesuai versi instrumen agar kode indikator dapat dipetakan."
                compact
              />
            )}
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setImportOpen(false)}
              >
                Batal
              </button>
              <button
                className="primary-button"
                disabled={!importFile}
                onClick={() => {
                  setImported(true);
                  setImportOpen(false);
                  setImportFile('');
                }}
              >
                <ShieldCheck /> Validasi file dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}

export function ResearcherSection({ section }: { section: string }) {
  if (section === 'instruments') return <ResearchInstrumentsPage />;
  if (section === 'versions') return <ResearchVersionsPage />;
  if (section === 'scoring') return <ResearchScoringPage />;
  if (section === 'validation') return <ResearchValidationPage />;
  if (section === 'research') return <ResearchDataPage />;
  return null;
}
