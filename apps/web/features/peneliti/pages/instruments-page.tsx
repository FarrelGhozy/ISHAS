'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck2,
  LockKeyhole,
  Plus,
  Save,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ResearchIndicator, BuilderDimension } from '@/features/peneliti/model';
import {
  ResearchHeading,
  PrototypeAssumption,
  InstrumentStatusBadge,
} from '@/features/peneliti/components/research-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function ResearchInstrumentsPage() {
  const instrumentVersions = useMockStore((state) => state.instrumentVersions);
  const instrumentDimensions = useMockStore(
    (state) => state.instrumentDimensions,
  );
  const defaultRubrics = useMockStore((state) => state.defaultRubrics);
  const initialBuilderDimensions = useMockStore(
    (state) => state.builderDimensions,
  );
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
  const selected =
    instrumentVersions.find((item) => item.id === selectedId) ??
    instrumentVersions[0];

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
    mockStoreActions.saveBuilderDimensions(dimensions);
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
