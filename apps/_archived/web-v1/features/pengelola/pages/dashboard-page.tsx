'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dimensions, trend } from '@/lib/mock-data';
import { PageHeading, StatCard } from '@/shared/components/dashboard';
import { useMockStore } from '@/mocks/store/mock-store';

export function ManagerDashboard({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) {
  const riskFindings = useMockStore((state) => state.riskFindings);
  const periodResults = useMockStore((state) => state.periodResults);
  const recommendations = useMockStore((state) => state.recommendations);
  const currentResult = periodResults[0];
  const averageProgress =
    recommendations.length === 0
      ? 0
      : Math.round(
          recommendations.reduce((total, item) => total + item.progress, 0) /
            recommendations.length,
        );
  const priorityFindings = riskFindings
    .filter((item) => item.level !== 'Rendah')
    .slice(0, 3);
  return (
    <>
      <PageHeading
        kicker="Pemanfaatan hasil"
        title="Ringkasan K3L Pesantren"
        description="Pahami kondisi terkini, lokasi prioritas, dan tindak lanjut yang perlu diselesaikan."
        action={
          <button
            className="secondary-button"
            onClick={() => onNavigate('reports')}
          >
            <FileText /> Unduh ringkasan
          </button>
        }
      />
      <div className="scope-banner">
        <div>
          <Building2 />
          <span>
            <small>Pesantren aktif</small>
            <b>PP Al-Hikmah Malang</b>
          </span>
        </div>
        <div>
          <small>Periode hasil</small>
          <b>Semester 1 · 2026</b>
        </div>
        <span className="status status-blue">Data ilustrasi</span>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Indeks K3L"
          value={String(currentResult?.score ?? '—').replace('.', ',')}
          note="Naik 3,2 dari periode lalu"
          Icon={ShieldCheck}
        />
        <StatCard
          label="Risiko tinggi"
          value={String(
            riskFindings.filter((finding) => finding.level === 'Tinggi').length,
          )}
          note="Perlu tindakan segera"
          Icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Tindak lanjut"
          value={`${averageProgress}%`}
          note={`${recommendations.length} pekerjaan tercatat`}
          Icon={Activity}
          tone="amber"
        />
        <StatCard
          label="Terverifikasi"
          value={String(
            recommendations.filter((item) => item.status === 'Terverifikasi')
              .length,
          )}
          note="Oleh asesor terkait"
          Icon={CheckCircle2}
          tone="blue"
        />
      </div>
      <div className="content-grid content-grid-chart">
        <section className="surface chart-panel">
          <div className="surface-head">
            <div>
              <h2>Perkembangan indeks</h2>
              <p>Perbandingan enam periode assessment terakhir</p>
            </div>
            <span className="trend-up">+3,2 periode ini</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 320, height: 225 }}
            >
              <AreaChart
                data={trend}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ishasTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#be123c" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  domain={[60, 85]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: '#cbd5e1',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#be123c"
                  strokeWidth={3}
                  fill="url(#ishasTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <aside className="surface dimension-summary">
          <div className="surface-head">
            <div>
              <h2>Hasil per dimensi</h2>
              <p>Area dengan nilai terendah perlu diprioritaskan</p>
            </div>
          </div>
          {dimensions.map((dimension) => (
            <div className="score-row" key={dimension.name}>
              <div>
                <b>{dimension.name}</b>
                <strong>{dimension.score}</strong>
              </div>
              <span>
                <i style={{ width: `${dimension.score}%` }} />
              </span>
            </div>
          ))}
        </aside>
      </div>
      <section className="surface findings-panel">
        <div className="surface-head">
          <div>
            <h2>Temuan yang perlu ditindaklanjuti</h2>
            <p>
              Peta risiko awal menggunakan lokasi/area pesantren, bukan peta
              geografis
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate('risk-map')}
          >
            Buka peta bahaya <ArrowRight />
          </button>
        </div>
        <div className="findings-grid">
          {priorityFindings.map((finding) => (
            <article className="finding-card" key={finding.id}>
              <div>
                <span
                  className={`status ${finding.level === 'Tinggi' ? 'status-red' : 'status-amber'}`}
                >
                  {finding.level}
                </span>
                <small>{finding.zone}</small>
              </div>
              <h3>{finding.location}</h3>
              <p>{finding.issue}</p>
              <button onClick={() => onNavigate('follow-up')}>
                Kelola tindak lanjut <ArrowRight />
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
