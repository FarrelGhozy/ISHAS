'use client';

import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import type {
  RiskLevel,
  RecommendationStatus,
} from '@/features/pengelola/model';
export function ManagerHeading({
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
        <p className="section-kicker">Pemanfaatan hasil</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function ManagerScope({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`manager-scope-banner ${compact ? 'compact' : ''}`}>
      <Building2 />
      <div>
        <small>Pesantren yang terhubung ke akun</small>
        <b>PP Al-Hikmah Malang</b>
        <p>Pengelola tidak dapat melihat hasil pesantren lain.</p>
      </div>
      <span className="status status-blue">
        <ShieldCheck /> Akses lembaga sendiri
      </span>
    </div>
  );
}

export function PrototypeScoreNote() {
  return (
    <div className="manager-score-note">
      <AlertTriangle />
      <p>
        <b>Data ilustrasi</b>
        Nilai 78,5, kategori, ambang risiko, dan perubahan skor hanya untuk
        memvalidasi tampilan; belum menjadi hasil ilmiah final ISHAS.
      </p>
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`status ${level === 'Tinggi' ? 'status-red' : level === 'Sedang' ? 'status-amber' : 'status-green'}`}
    >
      {level === 'Tinggi' ? (
        <AlertTriangle />
      ) : level === 'Sedang' ? (
        <Flag />
      ) : (
        <CheckCircle2 />
      )}
      {level}
    </span>
  );
}

export function WorkflowBadge({ status }: { status: RecommendationStatus }) {
  return (
    <span
      className={`status ${status === 'Terverifikasi' ? 'status-green' : status === 'Menunggu verifikasi' ? 'status-blue' : status === 'Berjalan' ? 'status-amber' : 'status-red'}`}
    >
      {status === 'Terverifikasi' ? (
        <CheckCircle2 />
      ) : status === 'Berjalan' ? (
        <Activity />
      ) : status === 'Menunggu verifikasi' ? (
        <Clock3 />
      ) : (
        <AlertTriangle />
      )}
      {status}
    </span>
  );
}
