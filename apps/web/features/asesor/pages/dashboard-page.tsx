'use client';

import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  Plus,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  AssessorHeading,
  AssessorStat,
  StatusBadge,
} from '@/features/asesor/components/assessor-components';
import { useMockStore } from '@/mocks/store/mock-store';

export function AssessorDashboard({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const assignments = useMockStore((state) => state.assignments);
  const activeAssignments = assignments.filter(
    (item) => item.status !== 'Final',
  );
  return (
    <>
      <AssessorHeading
        title="Dashboard Asesor"
        description="Lanjutkan penugasan, lengkapi bukti, dan finalisasi assessment yang menjadi tanggung jawab Anda."
        action={
          <button
            className="primary-button"
            onClick={() => onNavigate('new-assessment')}
          >
            <Plus /> Mulai assessment
          </button>
        }
      />
      <div className="assessor-scope-banner">
        <UserRound />
        <div>
          <small>Lingkup akun aktif</small>
          <b>Ahmad Fauzan · Asesor lapangan</b>
          <p>Hanya 3 penugasan aktif atas nama Anda yang ditampilkan.</p>
        </div>
        <span className="status status-blue">
          <ShieldCheck /> Akses terbatas
        </span>
      </div>
      <div className="stats-grid">
        <AssessorStat
          label="Penugasan aktif"
          value="3"
          note="2 terjadwal · 1 draft"
          Icon={ClipboardList}
        />
        <AssessorStat
          label="Progress draft"
          value="67%"
          note="4 dari 6 indikator contoh"
          Icon={ClipboardCheck}
          tone="blue"
        />
        <AssessorStat
          label="Bukti belum lengkap"
          value="2"
          note="Wajib sebelum finalisasi"
          Icon={AlertTriangle}
          tone="red"
        />
        <AssessorStat
          label="Selesai periode ini"
          value="8"
          note="Terkunci dan tercatat"
          Icon={CheckCircle2}
        />
      </div>
      <div className="assessor-dashboard-grid">
        <section className="surface assessor-priority-panel">
          <div className="surface-head">
            <div>
              <h2>Prioritas penugasan</h2>
              <p>Diurutkan dari pekerjaan yang perlu dilanjutkan</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('assignments')}
            >
              Lihat semua <ArrowRight />
            </button>
          </div>
          {activeAssignments.map((assignment) => (
            <article key={assignment.id}>
              <span
                className={`assignment-date ${assignment.status === 'Draft' ? 'active' : ''}`}
              >
                <b>{assignment.date.split(' ')[0]}</b>
                <small>SEP</small>
              </span>
              <div>
                <div>
                  <StatusBadge status={assignment.status} />
                  <small>{assignment.id}</small>
                </div>
                <h3>{assignment.institution}</h3>
                <p>
                  <MapPin /> {assignment.city} · {assignment.version}
                </p>
              </div>
              <div className="assignment-progress-mini">
                <span>
                  <i style={{ width: `${assignment.progress}%` }} />
                </span>
                <b>{assignment.progress}%</b>
              </div>
              <button
                className={
                  assignment.status === 'Draft'
                    ? 'row-action row-action-primary'
                    : 'row-action'
                }
                onClick={() =>
                  onNavigate(
                    assignment.status === 'Draft'
                      ? 'assignments'
                      : 'new-assessment',
                  )
                }
              >
                {assignment.status === 'Draft' ? 'Lanjutkan' : 'Persiapkan'}{' '}
                <ArrowRight />
              </button>
            </article>
          ))}
        </section>
        <aside className="surface assessor-today-panel">
          <div className="surface-head">
            <div>
              <h2>Checklist lapangan</h2>
              <p>Sebelum membuka form</p>
            </div>
          </div>
          {[
            ['Identitas pesantren', 'Cocokkan nama dan alamat lembaga'],
            ['Kontak pendamping', 'Pastikan pengelola dapat dihubungi'],
            ['Perangkat & kamera', 'Siapkan dokumentasi bukti'],
            ['Versi instrumen', 'Gunakan versi Published pada tugas'],
          ].map(([title, note], index) => (
            <div className="assessor-checkline" key={title}>
              <span>{index + 1}</span>
              <div>
                <b>{title}</b>
                <p>{note}</p>
              </div>
            </div>
          ))}
          <button
            className="secondary-button"
            onClick={() => onNavigate('evidence')}
          >
            <Camera /> Periksa bukti lapangan
          </button>
        </aside>
      </div>
    </>
  );
}
