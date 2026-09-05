'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
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
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';

type InstrumentStatus = 'Draft' | 'Published' | 'Archived';

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
  const selected = instrumentVersions.find((item) => item.id === selectedId)!;
  return (
    <>
      <ResearchHeading
        title="Instrumen"
        description="Kelola struktur dimensi, indikator, rubric, bukti, dan sumber rujukan pada setiap versi."
        action={
          <button className="primary-button">
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
              <button className="primary-button">
                <SlidersHorizontal /> Buka instrument builder
              </button>
            ) : (
              <button className="secondary-button">
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
                <button aria-label={`Buka ${dimension.name}`}>
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
  return (
    <>
      <ResearchHeading
        title="Versioning Instrumen"
        description="Telusuri hubungan antarversi dan pastikan perubahan tidak mengubah hasil historis."
        action={
          <button className="primary-button" onClick={() => setCreated(true)}>
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
    </>
  );
}

function ResearchScoringPage() {
  const [weights, setWeights] = useState(
    instrumentDimensions.map((item) => item.weight),
  );
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
          {[
            ['1', 'Kritis', 'Kondisi tidak memenuhi kebutuhan minimum.'],
            ['2', 'Perlu perbaikan', 'Tersedia tetapi belum memadai.'],
            ['3', 'Baik', 'Memenuhi ambang operasional contoh.'],
            ['4', 'Paripurna', 'Memenuhi seluruh kriteria contoh.'],
          ].map(([score, label, description]) => (
            <div className="rubric-row" key={score}>
              <span>{score}</span>
              <div>
                <b>{label}</b>
                <p>{description}</p>
              </div>
            </div>
          ))}
          <div className="rubric-requirement">
            <FileCheck2 />
            <p>
              <b>Bukti wajib</b>Foto lapangan dan catatan observasi untuk skor
              1–2.
            </p>
          </div>
        </aside>
      </div>
      <section className="surface recommendation-rule-panel">
        <div>
          <SlidersHorizontal />
          <span>
            <b>Contoh pemicu rekomendasi</b>
            <p>
              Jika skor indikator ≤ 2, sistem menampilkan rekomendasi terkait
              sanitasi.
            </p>
          </span>
        </div>
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
  return (
    <>
      <ResearchHeading
        title="Data Penelitian"
        description="Kelola dataset assessment teragregasi dengan jejak versi instrumen dan status verifikasi."
        action={
          <button
            className="secondary-button"
            onClick={() => setExported(true)}
          >
            <Download /> Ekspor dataset
          </button>
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
              >
                <ArrowRight />
              </button>
            </div>
          ))}
        </div>
      </section>
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
