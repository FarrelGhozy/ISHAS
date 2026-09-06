'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
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

export function PageHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
