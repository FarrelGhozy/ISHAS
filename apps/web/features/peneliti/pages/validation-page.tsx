'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  X,
} from 'lucide-react';
import { ResearchHeading } from '@/features/peneliti/components/research-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function ResearchValidationPage() {
  const items = useMockStore((state) => state.validationItems);
  const draftVersion = useMockStore((state) =>
    state.instrumentVersions.find((version) => version.status === 'Draft'),
  );
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState('');
  const completed = items.filter((item) => item.done).length;
  const ready = completed === items.length;
  const percent = Math.round((completed / items.length) * 100);

  function completeItem(id: string) {
    mockStoreActions.completeValidationItem(id);
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
      {publishError ? (
        <div className="admin-feedback">
          <AlertTriangle /> {publishError}
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
                  if (!draftVersion) {
                    setPublishError(
                      'Tidak ada versi Draft untuk dipublikasikan.',
                    );
                    setConfirmPublish(false);
                    return;
                  }
                  const result = mockStoreActions.publishInstrumentVersion(
                    draftVersion.id,
                  );
                  if (!result.ok) {
                    setPublishError(result.message);
                    setConfirmPublish(false);
                    return;
                  }
                  setConfirmPublish(false);
                  setPublished(true);
                  setPublishError('');
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
