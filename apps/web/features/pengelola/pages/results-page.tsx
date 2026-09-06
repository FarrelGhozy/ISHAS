'use client';

import { useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ListChecks,
  LockKeyhole,
  X,
} from 'lucide-react';
import {
  ManagerHeading,
  ManagerScope,
  PrototypeScoreNote,
  RiskBadge,
} from '@/features/pengelola/components/manager-components';
import { useMockStore } from '@/mocks/store/mock-store';

export function ResultsPage() {
  const periodResults = useMockStore((state) => state.periodResults);
  const riskFindings = useMockStore((state) => state.riskFindings);
  const recommendations = useMockStore((state) => state.recommendations);
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
  const resultFindings = riskFindings.filter(
    (finding) => finding.assessmentId === result.id,
  );
  const resultRecommendations = recommendations.filter((item) =>
    item.source.includes(result.id),
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
              <b>
                {
                  resultFindings.filter((item) => item.level === 'Tinggi')
                    .length
                }{' '}
                risiko tinggi
              </b>
              <small>Butuh tindakan segera</small>
            </span>
          </div>
          <div>
            <ListChecks />
            <span>
              <b>{resultRecommendations.length} rekomendasi</b>
              <small>
                {
                  resultRecommendations.filter(
                    (item) => item.status === 'Berjalan',
                  ).length
                }{' '}
                masih berjalan
              </small>
            </span>
          </div>
          <div>
            <CheckCircle2 />
            <span>
              <b>
                {
                  resultRecommendations.filter(
                    (item) => item.status === 'Terverifikasi',
                  ).length
                }{' '}
                terverifikasi
              </b>
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
        {result.dimensions.map((dimension) => {
          const values = periodResults.map(
            (period) =>
              period.dimensions.find((item) => item.id === dimension.id)
                ?.score ?? null,
          );
          const comparable = values.every((value) => value !== null);
          const totalDelta = comparable
            ? (values[0] ?? 0) - (values[values.length - 1] ?? 0)
            : null;
          return (
            <div className="manager-comparison-row" key={dimension.name}>
              <b>{dimension.name}</b>
              {values.map((value, index) => (
                <span key={`${dimension.name}-${periodResults[index].id}`}>
                  {value ?? '—'}
                </span>
              ))}
              {totalDelta === null ? (
                <strong>Tidak dapat dibandingkan</strong>
              ) : (
                <strong>
                  {totalDelta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                  {totalDelta >= 0 ? '+' : ''}
                  {totalDelta}
                </strong>
              )}
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
              {resultFindings
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
