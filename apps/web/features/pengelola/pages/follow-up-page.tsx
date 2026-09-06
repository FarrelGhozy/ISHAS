'use client';

import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileCheck2,
  ImagePlus,
  MapPin,
  Upload,
  X,
} from 'lucide-react';
import { RecommendationStatus } from '@/features/pengelola/model';
import {
  ManagerHeading,
  ManagerScope,
  RiskBadge,
  WorkflowBadge,
} from '@/features/pengelola/components/manager-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function FollowUpPage({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null;
}) {
  const recommendations = useMockStore((state) => state.recommendations);
  const items = recommendations.filter(
    (item) => item.status !== 'Belum ditindaklanjuti',
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const initialSelected = items.find((item) => item.id === initialSelectedId);
  const [evidenceName, setEvidenceName] = useState(
    initialSelected?.completionEvidence ?? '',
  );
  const [note, setNote] = useState(initialSelected?.lastNote ?? '');
  const [feedback, setFeedback] = useState('');
  const selected = items.find((item) => item.id === selectedId);
  function submitUpdate() {
    if (!selected) return;
    mockStoreActions.updateRecommendation(selected.id, {
      owner: selected.owner,
      dueDate: selected.dueDate,
      progress: evidenceName ? 100 : Math.min(90, selected.progress + 20),
      status: evidenceName ? 'Menunggu verifikasi' : selected.status,
      note,
      evidenceName,
    });
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
                      onClick={() => {
                        setSelectedId(item.id);
                        setNote(item.lastNote ?? '');
                        setEvidenceName(item.completionEvidence ?? '');
                      }}
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
                  <p>
                    Bukti:{' '}
                    {selected.completionEvidence ||
                      'dokumentasi-perbaikan-final.jpg'}
                  </p>
                  {selected.lastNote ? <p>{selected.lastNote}</p> : null}
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
