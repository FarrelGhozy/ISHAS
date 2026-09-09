'use client';

import {
  ArrowRight,
  Building2,
  FileClock,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { demoAccounts } from '@/shared/auth/demo-accounts';
import { PageHeading, StatCard } from '@/shared/components/dashboard';
import { useMockStore } from '@/mocks/store/mock-store';

export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const users = useMockStore((state) => state.users);
  const institutions = useMockStore((state) => state.institutions);
  const auditRecords = useMockStore((state) => state.auditRecords);
  const activities = auditRecords
    .slice(0, 3)
    .map((record) => [
      record.action,
      `${record.target} · ${record.time}`,
      record.category,
    ]);
  return (
    <>
      <PageHeading
        kicker="Kendali sistem"
        title="Dashboard Admin"
        description="Pantau kesehatan sistem, pengguna, lembaga, dan aktivitas yang membutuhkan perhatian."
        action={
          <button
            className="primary-button"
            onClick={() => onNavigate('users')}
          >
            <Plus /> Tambah pengguna
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Pengguna aktif"
          value={String(users.filter((user) => user.status === 'Aktif').length)}
          note="4 peran utama"
          Icon={Users}
        />
        <StatCard
          label="Pesantren"
          value={String(institutions.length)}
          note="6 wilayah terdaftar"
          Icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Menunggu aktivasi"
          value={String(
            users.filter((user) => user.status === 'Menunggu').length,
          )}
          note="Perlu verifikasi admin"
          Icon={FileClock}
          tone="amber"
        />
        <StatCard
          label="Insiden akses"
          value="0"
          note="30 hari terakhir"
          Icon={ShieldCheck}
        />
      </div>
      <div className="content-grid content-grid-wide">
        <section className="surface">
          <div className="surface-head">
            <div>
              <h2>Aktivitas terbaru</h2>
              <p>Perubahan penting yang tercatat oleh sistem</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('audit')}>
              Lihat audit log <ArrowRight />
            </button>
          </div>
          <div className="activity-list">
            {activities.map(([title, meta, status], index) => (
              <div className="activity-row" key={title}>
                <span className="activity-index">0{index + 1}</span>
                <div>
                  <b>{title}</b>
                  <small>{meta}</small>
                </div>
                <span
                  className={
                    index === 0 ? 'status status-amber' : 'status status-green'
                  }
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>
        <aside className="surface permission-summary">
          <div className="surface-head">
            <div>
              <h2>Cakupan akses</h2>
              <p>Ringkasan pemisahan kewenangan</p>
            </div>
          </div>
          {demoAccounts.map(({ role, roleLabel, responsibility, Icon }) => (
            <div className="permission-item" key={role}>
              <span>
                <Icon />
              </span>
              <div>
                <b>{roleLabel}</b>
                <p>{responsibility}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
