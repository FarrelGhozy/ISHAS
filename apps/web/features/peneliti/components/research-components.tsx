'use client';

import type { ReactNode } from 'react';
import { FlaskConical, LockKeyhole } from 'lucide-react';
import type { InstrumentStatus } from '@/features/peneliti/model';
export function ResearchHeading({
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
        <p className="section-kicker">Tata kelola ilmiah</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function PrototypeAssumption({ children }: { children: ReactNode }) {
  return (
    <div className="research-assumption">
      <FlaskConical />
      <p>
        <b>Asumsi prototipe</b>
        {children}
      </p>
    </div>
  );
}

export function InstrumentStatusBadge({
  status,
}: {
  status: InstrumentStatus;
}) {
  return (
    <span
      className={`status ${status === 'Published' ? 'status-green' : status === 'Draft' ? 'status-amber' : 'status-neutral'}`}
    >
      {status === 'Published' ? <LockKeyhole /> : null}
      {status}
    </span>
  );
}
