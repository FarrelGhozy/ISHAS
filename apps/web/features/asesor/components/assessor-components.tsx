'use client';

import type { ReactNode } from 'react';
import { LockKeyhole, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { AssignmentStatus } from '@/features/asesor/model';
export function AssessorHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="section-kicker">Pelaksanaan lapangan</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function AssessorStat({
  label,
  value,
  note,
  Icon,
  tone = 'teal',
}: {
  label: string;
  value: string;
  note: string;
  Icon: LucideIcon;
  tone?: 'teal' | 'amber' | 'red' | 'blue';
}) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-head">
        <span>{label}</span>
        <i>
          <Icon />
        </i>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={`status ${status === 'Final' ? 'status-green' : status === 'Draft' ? 'status-amber' : 'status-blue'}`}
    >
      {status === 'Final' ? <LockKeyhole /> : null}
      {status}
    </span>
  );
}

export function FieldAssumption() {
  return (
    <div className="assessor-assumption">
      <ShieldCheck />
      <p>
        <b>Simulasi alur lapangan</b>
        Pertanyaan, opsi jawaban, dan aturan bukti adalah data dummy dari draft
        desain. Nilai ilmiah belum ditetapkan.
      </p>
    </div>
  );
}
