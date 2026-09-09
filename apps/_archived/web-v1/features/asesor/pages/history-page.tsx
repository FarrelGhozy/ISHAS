'use client';

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  History,
  LockKeyhole,
  Search,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { Assignment } from '@/features/asesor/model';
import {
  AssessorHeading,
  StatusBadge,
} from '@/features/asesor/components/assessor-components';
import { useMockStore } from '@/mocks/store/mock-store';

export function HistoryPage() {
  const assignments = useMockStore((state) => state.assignments);
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
