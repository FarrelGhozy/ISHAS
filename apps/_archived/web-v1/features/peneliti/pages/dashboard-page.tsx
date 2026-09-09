'use client';

import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Check,
  FileClock,
  LockKeyhole,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { dimensions } from '@/lib/mock-data';
import { PageHeading, StatCard } from '@/shared/components/dashboard';
import { useMockStore } from '@/mocks/store/mock-store';

export function ResearcherDashboard({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const versions = useMockStore((state) => state.instrumentVersions);
  const validationItems = useMockStore((state) => state.validationItems);
  const activeVersion = versions.find(
    (version) => version.status === 'Published',
  );
  return (
    <>
      <PageHeading
        kicker="Tata kelola ilmiah"
        title="Dashboard Peneliti"
        description="Kelola instrumen, versi, rubric, dan proses validasi sebelum digunakan di lapangan."
        action={
          <button
            className="primary-button"
            onClick={() => onNavigate('versions')}
          >
            <Plus /> Buat versi baru
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Versi aktif"
          value={activeVersion?.name.replace('ISHAS ', '') ?? '—'}
          note="Published · terkunci"
          Icon={LockKeyhole}
        />
        <StatCard
          label="Draft berjalan"
          value={String(
            versions.filter((version) => version.status === 'Draft').length,
          )}
          note="Terakhir diubah hari ini"
          Icon={FileClock}
          tone="amber"
        />
        <StatCard
          label="Dimensi"
          value="4"
          note="48 indikator dummy"
          Icon={BookOpenCheck}
          tone="blue"
        />
        <StatCard
          label="Perlu validasi"
          value={String(validationItems.filter((item) => !item.done).length)}
          note="Rubric dan sumber"
          Icon={AlertTriangle}
          tone="red"
        />
      </div>
      <div className="content-grid content-grid-wide">
        <section className="surface">
          <div className="surface-head">
            <div>
              <h2>Instrumen dalam pengembangan</h2>
              <p>Draft dapat diubah; versi published selalu terkunci</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('instruments')}
            >
              Kelola instrumen <ArrowRight />
            </button>
          </div>
          <div className="version-card featured-version">
            <div className="version-top">
              <div>
                <span className="status status-blue">DRAFT</span>
                <b>ISHAS v1.1 — Kandidat Rilis</b>
              </div>
              <span>82% lengkap</span>
            </div>
            <div className="progress-track">
              <i style={{ width: '82%' }} />
            </div>
            <div className="version-meta">
              <span>4 dimensi</span>
              <span>52 indikator</span>
              <span>7 item perlu validasi</span>
            </div>
          </div>
          <div className="dimension-list">
            {dimensions.map((dimension, index) => (
              <div className="dimension-row" key={dimension.name}>
                <span>0{index + 1}</span>
                <div>
                  <b>{dimension.name}</b>
                  <small>
                    {index === 0 ? '12' : index === 1 ? '14' : '11'} indikator
                  </small>
                </div>
                <span className="status status-green">
                  <Check /> Terpetakan
                </span>
              </div>
            ))}
          </div>
        </section>
        <aside className="surface governance-card">
          <div className="surface-head">
            <div>
              <h2>Alur publikasi</h2>
              <p>Kontrol agar hasil tetap dapat direproduksi</p>
            </div>
          </div>
          {[
            ['1', 'Draft', 'Instrumen masih dapat diedit.'],
            ['2', 'Validasi', 'Bobot, rubric, dan sumber diperiksa.'],
            ['3', 'Published', 'Versi dikunci untuk assessment.'],
            ['4', 'Versi baru', 'Perubahan dimulai dari salinan baru.'],
          ].map(([number, title, copy]) => (
            <div className="governance-step" key={number}>
              <span>{number}</span>
              <div>
                <b>{title}</b>
                <p>{copy}</p>
              </div>
            </div>
          ))}
          <div className="context-note">
            <ShieldCheck />
            <p>
              <b>Aturan kontekstual</b>Versi yang sudah dipakai assessment tidak
              boleh diubah langsung.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
