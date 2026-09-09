'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { Assignment } from '@/features/asesor/model';
import {
  AssessorHeading,
  StatusBadge,
} from '@/features/asesor/components/assessor-components';
import { AssessmentFlow } from '@/features/asesor/components/assessment-flow';
import { useMockStore } from '@/mocks/store/mock-store';

export function AssignmentsPage() {
  const assignments = useMockStore((state) => state.assignments);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Semua status');
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null,
  );
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      assignments.filter(
        (item) =>
          (status === 'Semua status' || item.status === status) &&
          (!normalized ||
            item.institution.toLowerCase().includes(normalized) ||
            item.id.toLowerCase().includes(normalized) ||
            item.city.toLowerCase().includes(normalized)),
      ),
    [assignments, normalized, status],
  );

  if (activeAssignment) {
    return (
      <AssessmentFlow
        assignment={activeAssignment}
        blank={activeAssignment.status === 'Terjadwal'}
        onClose={() => setActiveAssignment(null)}
      />
    );
  }

  return (
    <>
      <AssessorHeading
        title="Assessment Saya"
        description="Kelola hanya penugasan yang diberikan kepada akun Asesor aktif."
      />
      <div className="assessor-scope-banner compact">
        <ShieldCheck />
        <div>
          <small>Pembatasan akses</small>
          <b>3 penugasan aktif · Ahmad Fauzan</b>
          <p>Assessment milik asesor lain tidak ditampilkan.</p>
        </div>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari pesantren, ID, atau kota..."
              aria-label="Cari penugasan"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter status penugasan"
          >
            <option>Semua status</option>
            <option>Draft</option>
            <option>Terjadwal</option>
            <option>Final</option>
          </select>
          <span className="admin-result-count">
            {filtered.length} penugasan
          </span>
        </div>
        <div className="assignment-card-list">
          {filtered.map((assignment) => (
            <article key={assignment.id}>
              <div className="assignment-card-main">
                <span
                  className={`assignment-icon ${assignment.status === 'Draft' ? 'active' : ''}`}
                >
                  <ClipboardCheck />
                </span>
                <div>
                  <div>
                    <StatusBadge status={assignment.status} />
                    <small>{assignment.id}</small>
                  </div>
                  <h2>{assignment.institution}</h2>
                  <p>
                    <MapPin /> {assignment.city}
                  </p>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Tanggal</dt>
                  <dd>{assignment.date}</dd>
                </div>
                <div>
                  <dt>Periode</dt>
                  <dd>{assignment.period}</dd>
                </div>
                <div>
                  <dt>Instrumen</dt>
                  <dd>
                    <LockKeyhole /> {assignment.version}
                  </dd>
                </div>
                <div>
                  <dt>Kontak</dt>
                  <dd>{assignment.contact}</dd>
                </div>
              </dl>
              <div className="assignment-card-progress">
                <span>
                  <i style={{ width: `${assignment.progress}%` }} />
                </span>
                <b>{assignment.progress}%</b>
                <small>
                  {assignment.missingEvidence > 0
                    ? `${assignment.missingEvidence} bukti belum lengkap`
                    : assignment.status === 'Final'
                      ? 'Sudah dikunci'
                      : 'Belum dimulai'}
                </small>
              </div>
              <button
                className={
                  assignment.status === 'Draft'
                    ? 'primary-button'
                    : 'secondary-button'
                }
                onClick={() => setActiveAssignment(assignment)}
              >
                {assignment.status === 'Draft'
                  ? 'Lanjutkan pengisian'
                  : assignment.status === 'Final'
                    ? 'Lihat ringkasan'
                    : 'Mulai persiapan'}{' '}
                <ArrowRight />
              </button>
            </article>
          ))}
          {filtered.length === 0 ? (
            <DataState
              variant="empty"
              title="Penugasan tidak ditemukan"
              description="Ubah kata kunci atau filter status. Asesor hanya melihat penugasannya sendiri."
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
