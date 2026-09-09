'use client';

import { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LockKeyhole,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import {
  AssessorHeading,
  FieldAssumption,
} from '@/features/asesor/components/assessor-components';
import { AssessmentFlow } from '@/features/asesor/components/assessment-flow';
import { useMockStore } from '@/mocks/store/mock-store';
import { selectIndicatorsForAssignment } from '@/mocks/store/selectors';

export function NewAssessmentPage() {
  const assignments = useMockStore((state) => state.assignments);
  const [selectedId, setSelectedId] = useState(
    assignments.find((item) => item.status === 'Terjadwal')!.id,
  );
  const [checks, setChecks] = useState({
    identity: false,
    contact: false,
    period: false,
    version: false,
  });
  const [started, setStarted] = useState(false);
  const selected = assignments.find((item) => item.id === selectedId)!;
  const indicators = useMockStore((state) =>
    selectIndicatorsForAssignment(state, selected),
  );
  const ready = Object.values(checks).every(Boolean);
  const verificationItems: Array<{
    id: keyof typeof checks;
    title: string;
    detail: string;
    Icon: LucideIcon;
  }> = [
    {
      id: 'identity',
      title: 'Identitas dan lokasi pesantren',
      detail: `${selected.institution} · ${selected.city}`,
      Icon: Building2,
    },
    {
      id: 'contact',
      title: 'Kontak pendamping lapangan',
      detail: selected.contact,
      Icon: UserRound,
    },
    {
      id: 'period',
      title: 'Periode dan tanggal assessment',
      detail: `${selected.period} · ${selected.date}`,
      Icon: CalendarDays,
    },
    {
      id: 'version',
      title: 'Versi instrumen Published',
      detail: `${selected.version} · akan dikunci pada assessment`,
      Icon: LockKeyhole,
    },
  ];

  if (started)
    return (
      <AssessmentFlow
        assignment={selected}
        blank
        onClose={() => setStarted(false)}
      />
    );

  return (
    <>
      <AssessorHeading
        title="Assessment Baru"
        description="Verifikasi penugasan dan data awal sebelum membuka formulir lapangan."
      />
      <FieldAssumption />
      <div className="assessment-setup-layout">
        <section className="surface assessment-setup-main">
          <div className="surface-head">
            <div>
              <p className="section-kicker">Langkah 1</p>
              <h2>Pilih penugasan terjadwal</h2>
              <p>Asesor tidak dapat membuat assessment di luar penugasannya.</p>
            </div>
          </div>
          <div className="scheduled-assignment-grid">
            {assignments
              .filter((item) => item.status === 'Terjadwal')
              .map((assignment) => (
                <button
                  className={selectedId === assignment.id ? 'selected' : ''}
                  key={assignment.id}
                  aria-pressed={selectedId === assignment.id}
                  onClick={() => {
                    setSelectedId(assignment.id);
                    setChecks({
                      identity: false,
                      contact: false,
                      period: false,
                      version: false,
                    });
                  }}
                >
                  <span>
                    <Building2 />
                  </span>
                  <div>
                    <small>
                      {assignment.id} · {assignment.date}
                    </small>
                    <b>{assignment.institution}</b>
                    <p>{assignment.city}</p>
                  </div>
                  <i aria-hidden="true">
                    {selectedId === assignment.id ? <Check /> : null}
                  </i>
                </button>
              ))}
          </div>
          <div className="surface-head assessment-setup-second">
            <div>
              <p className="section-kicker">Langkah 2</p>
              <h2>Verifikasi data awal</h2>
              <p>Tandai setelah data cocok dengan kondisi penugasan.</p>
            </div>
          </div>
          <div className="assessment-verification-list">
            {verificationItems.map(({ id, title, detail, Icon }) => {
              const checked = checks[id];
              return (
                <label key={id} className={checked ? 'checked' : ''}>
                  <span>
                    <Icon />
                  </span>
                  <div>
                    <b>{title}</b>
                    <p>{detail}</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label={`Verifikasi ${title}`}
                    checked={checked}
                    onChange={(event) =>
                      setChecks((current) => ({
                        ...current,
                        [id]: event.target.checked,
                      }))
                    }
                  />
                  <i aria-hidden="true">{checked ? <Check /> : null}</i>
                </label>
              );
            })}
          </div>
        </section>
        <aside className="surface assessment-start-summary">
          <p className="section-kicker">Ringkasan assessment</p>
          <h2>{selected.institution}</h2>
          <p>{selected.id}</p>
          <dl>
            <div>
              <dt>Asesor</dt>
              <dd>Ahmad Fauzan</dd>
            </div>
            <div>
              <dt>Periode</dt>
              <dd>{selected.period}</dd>
            </div>
            <div>
              <dt>Instrumen</dt>
              <dd>{selected.version}</dd>
            </div>
            <div>
              <dt>Indikator contoh</dt>
              <dd>{indicators.length}</dd>
            </div>
          </dl>
          <div className={`assessment-ready-state ${ready ? 'ready' : ''}`}>
            {ready ? <CheckCircle2 /> : <Clock3 />}
            <span>
              <b>{ready ? 'Siap dimulai' : 'Menunggu verifikasi'}</b>
              <p>
                {Object.values(checks).filter(Boolean).length} dari 4 data
                dikonfirmasi
              </p>
            </span>
          </div>
          <button
            className="primary-button"
            disabled={!ready}
            onClick={() => setStarted(true)}
          >
            <ClipboardCheck /> Mulai isi assessment
          </button>
        </aside>
      </div>
    </>
  );
}
