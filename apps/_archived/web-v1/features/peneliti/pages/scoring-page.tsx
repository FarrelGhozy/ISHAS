'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResearchHeading,
  PrototypeAssumption,
} from '@/features/peneliti/components/research-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function ResearchScoringPage() {
  const instrumentDimensions = useMockStore(
    (state) => state.instrumentDimensions,
  );
  const defaultRubrics = useMockStore((state) => state.defaultRubrics);
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
            onClick={() => {
              mockStoreActions.saveScoring({ weights, rubrics });
              setSaved(true);
            }}
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
