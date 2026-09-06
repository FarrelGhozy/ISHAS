'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  MapPin,
  Plus,
  UserRound,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import {
  ManagerHeading,
  ManagerScope,
  RiskBadge,
  WorkflowBadge,
} from '@/features/pengelola/components/manager-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function RecommendationsPage({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null;
}) {
  const items = useMockStore((state) => state.recommendations);
  const [priority, setPriority] = useState('Semua prioritas');
  const [status, setStatus] = useState('Semua status');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const [feedback, setFeedback] = useState('');
  const [owner, setOwner] = useState('Bagian Sarana');
  const [dueDate, setDueDate] = useState('2026-09-20');
  const [planNote, setPlanNote] = useState(
    'Koordinasikan pelaksanaan, dokumentasikan kondisi sebelum dan sesudah, lalu ajukan verifikasi.',
  );
  const selected = items.find((item) => item.id === selectedId);
  const visible = items.filter(
    (item) =>
      (priority === 'Semua prioritas' || item.priority === priority) &&
      (status === 'Semua status' || item.status === status),
  );
  function startRecommendation() {
    if (!selected) return;
    mockStoreActions.updateRecommendation(selected.id, {
      owner,
      dueDate,
      status: 'Berjalan',
      note: planNote,
    });
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
                onClick={() => {
                  setSelectedId(item.id);
                  setOwner(
                    item.owner === 'Belum ditentukan'
                      ? 'Bagian Sarana'
                      : item.owner,
                  );
                  setDueDate(
                    /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)
                      ? item.dueDate
                      : '2026-09-20',
                  );
                  setPlanNote(
                    item.lastNote ??
                      'Koordinasikan pelaksanaan, dokumentasikan kondisi sebelum dan sesudah, lalu ajukan verifikasi.',
                  );
                }}
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
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                >
                  <option>Bagian Sarana</option>
                  <option>Tim K3 Pesantren</option>
                  <option>Bagian Kebersihan</option>
                  <option>Pimpinan Pesantren</option>
                </select>
              </label>
              <label>
                Tenggat
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </label>
              <label className="admin-form-full">
                Catatan rencana
                <textarea
                  rows={3}
                  value={planNote}
                  onChange={(event) => setPlanNote(event.target.value)}
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
