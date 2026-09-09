'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  ImagePlus,
  LockKeyhole,
  MapPin,
  MapPinned,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { Assignment, AnswerState } from '@/features/asesor/model';
import { FieldAssumption } from '@/features/asesor/components/assessor-components';
import { calculateAssessmentCompleteness } from '@/mocks/processors/assessment';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';
import {
  selectAssessmentLocations,
  selectIndicatorsForAssignment,
} from '@/mocks/store/selectors';

export function AssessmentFlow({
  assignment,
  blank = false,
  onClose,
}: {
  assignment: Assignment;
  blank?: boolean;
  onClose: () => void;
}) {
  const indicators = useMockStore((state) =>
    selectIndicatorsForAssignment(state, assignment),
  );
  const storedAnswers = useMockStore(
    (state) => state.assessmentAnswers[assignment.id] ?? {},
  );
  const storedActiveIndex = useMockStore(
    (state) => state.assessmentActiveIndex[assignment.id] ?? 0,
  );
  const assessmentLocations = useMockStore((state) =>
    selectAssessmentLocations(state, assignment),
  );
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => ({
    ...(Object.fromEntries(
      indicators.map((indicator) => [
        indicator.id,
        {
          value: '',
          note: '',
          evidenceName: '',
          areaId: '',
          planPoint: null,
        },
      ]),
    ) as Record<string, AnswerState>),
    ...(blank && Object.keys(storedAnswers).length === 0 ? {} : storedAnswers),
  }));
  const [activeIndex, setActiveIndex] = useState(storedActiveIndex);
  const [saved, setSaved] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [finalized, setFinalized] = useState(assignment.status === 'Final');
  const activeIndicator =
    indicators[Math.min(activeIndex, indicators.length - 1)];
  const activeAnswer = answers[activeIndicator.id];
  const answeredCount = indicators.filter(
    (indicator) => answers[indicator.id]?.value,
  ).length;
  const completeness = calculateAssessmentCompleteness(indicators, answers);
  const missingAnswers = indicators.filter((indicator) =>
    completeness.missingAnswerIds.includes(indicator.id),
  );
  const missingEvidence = indicators.filter((indicator) =>
    completeness.missingEvidenceIds.includes(indicator.id),
  );
  const missingNaNotes = indicators.filter((indicator) =>
    completeness.missingNaReasonIds.includes(indicator.id),
  );
  const missingLocations = indicators.filter((indicator) =>
    completeness.missingLocationIds.includes(indicator.id),
  );
  const totalMissing = completeness.missingIndicatorIds.length;
  const progress = completeness.progress;
  const dimensions = [...new Set(indicators.map((item) => item.dimension))];
  const selectedLocation = assessmentLocations.find(
    (location) => location.id === activeAnswer.areaId,
  );

  function updateAnswer(patch: Partial<AnswerState>) {
    setAnswers((current) => ({
      ...current,
      [activeIndicator.id]: { ...current[activeIndicator.id], ...patch },
    }));
    mockStoreActions.updateAssessmentAnswer(
      assignment.id,
      activeIndicator.id,
      patch,
    );
    setSaved(false);
  }

  function selectFirstInDimension(dimension: string) {
    const nextIndex = indicators.findIndex(
      (indicator) => indicator.dimension === dimension,
    );
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
      mockStoreActions.setAssessmentActiveIndex(assignment.id, nextIndex);
    }
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
          <button
            className="secondary-button"
            onClick={() => {
              const result = mockStoreActions.saveAssessmentDraft(
                assignment.id,
              );
              if (result.ok) setSaved(true);
            }}
          >
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
              onClick={() => {
                const next = activeIndex - 1;
                setActiveIndex(next);
                mockStoreActions.setAssessmentActiveIndex(assignment.id, next);
              }}
            >
              <ArrowLeft /> Sebelumnya
            </button>
            <button
              className="primary-button"
              disabled={activeIndex === indicators.length - 1}
              onClick={() => {
                const next = activeIndex + 1;
                setActiveIndex(next);
                mockStoreActions.setAssessmentActiveIndex(assignment.id, next);
              }}
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
              <b>Penyimpanan prototipe</b>Draft tersimpan pada perangkat ini dan
              dapat dilanjutkan setelah refresh.
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
                      const nextIndex = indicators.findIndex(
                        (item) => item.id === indicator.id,
                      );
                      setActiveIndex(nextIndex);
                      mockStoreActions.setAssessmentActiveIndex(
                        assignment.id,
                        nextIndex,
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
                  const result = mockStoreActions.finalizeAssessment(
                    assignment.id,
                  );
                  setConfirmFinal(false);
                  if (result.ok) setFinalized(true);
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
