'use client';

import { useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Copy,
  History,
  LockKeyhole,
  X,
} from 'lucide-react';
import {
  ResearchHeading,
  InstrumentStatusBadge,
} from '@/features/peneliti/components/research-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function ResearchVersionsPage() {
  const instrumentVersions = useMockStore((state) => state.instrumentVersions);
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
            <b>{instrumentVersions.length} versi</b>
            <small>
              {
                instrumentVersions.filter(
                  (version) => version.status === 'Published',
                ).length
              }{' '}
              published ·{' '}
              {
                instrumentVersions.filter(
                  (version) => version.status === 'Draft',
                ).length
              }{' '}
              draft ·{' '}
              {
                instrumentVersions.filter(
                  (version) => version.status === 'Archived',
                ).length
              }{' '}
              arsip
            </small>
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
                  const result = mockStoreActions.createInstrumentVersion({
                    name: versionDraft.code.replace('INS-', 'ISHAS '),
                    note: versionDraft.note,
                  });
                  if (!result.ok) return;
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
