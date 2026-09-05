'use client';

import { useState, type ReactNode, type SyntheticEvent } from 'react';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileClock,
  FileText,
  FlaskConical,
  History,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  Microscope,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCog,
  Users,
  X,
  type LucideIcon,
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
import { assessments, dimensions, riskLocations, trend } from '@/lib/mock-data';

type RoleId = 'admin' | 'peneliti' | 'asesor' | 'pengelola';

type DemoAccount = {
  role: RoleId;
  roleLabel: string;
  name: string;
  email: string;
  initials: string;
  responsibility: string;
  Icon: LucideIcon;
};

type NavigationItem = {
  id: string;
  label: string;
  Icon: LucideIcon;
  badge?: string;
};

const demoAccounts: DemoAccount[] = [
  {
    role: 'admin',
    roleLabel: 'Admin',
    name: 'Nadia Permata',
    email: 'admin@ishas.demo',
    initials: 'NP',
    responsibility: 'Mengelola sistem, akun, lembaga, akses, dan audit.',
    Icon: UserCog,
  },
  {
    role: 'peneliti',
    roleLabel: 'Peneliti',
    name: 'Dr. M. Ridwan',
    email: 'peneliti@ishas.demo',
    initials: 'MR',
    responsibility:
      'Mengelola ilmu, instrumen, versi, dan konfigurasi scoring.',
    Icon: Microscope,
  },
  {
    role: 'asesor',
    roleLabel: 'Asesor',
    name: 'Ahmad Fauzan',
    email: 'asesor@ishas.demo',
    initials: 'AF',
    responsibility: 'Melaksanakan assessment dan menghasilkan bukti lapangan.',
    Icon: ClipboardCheck,
  },
  {
    role: 'pengelola',
    roleLabel: 'Pengelola Pesantren',
    name: 'Ust. K.H. Mustofa Kamal',
    email: 'pengelola@ishas.demo',
    initials: 'MK',
    responsibility: 'Membaca hasil dan mengelola tindak lanjut pesantren.',
    Icon: Building2,
  },
];

const roleNavigation: Record<RoleId, NavigationItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard Sistem', Icon: LayoutDashboard },
    { id: 'users', label: 'Pengguna', Icon: Users, badge: '3' },
    { id: 'institutions', label: 'Pesantren', Icon: Building2 },
    { id: 'permissions', label: 'Hak Akses', Icon: KeyRound },
    { id: 'audit', label: 'Audit Log', Icon: History },
    { id: 'settings', label: 'Pengaturan', Icon: Settings },
  ],
  peneliti: [
    { id: 'dashboard', label: 'Dashboard Penelitian', Icon: LayoutDashboard },
    { id: 'instruments', label: 'Instrumen', Icon: BookOpenCheck, badge: '2' },
    { id: 'versions', label: 'Versioning', Icon: FileClock },
    { id: 'scoring', label: 'Konfigurasi Scoring', Icon: SlidersHorizontal },
    { id: 'validation', label: 'Validasi & Publikasi', Icon: FileCheck2 },
    { id: 'research', label: 'Data Penelitian', Icon: FlaskConical },
  ],
  asesor: [
    { id: 'dashboard', label: 'Dashboard Asesor', Icon: LayoutDashboard },
    {
      id: 'assignments',
      label: 'Assessment Saya',
      Icon: ClipboardList,
      badge: '3',
    },
    { id: 'new-assessment', label: 'Assessment Baru', Icon: Plus },
    { id: 'evidence', label: 'Bukti Lapangan', Icon: FileCheck2 },
    { id: 'history', label: 'Riwayat', Icon: History },
  ],
  pengelola: [
    { id: 'dashboard', label: 'Ringkasan K3L', Icon: LayoutDashboard },
    { id: 'results', label: 'Hasil Assessment', Icon: BarChart3 },
    { id: 'risk-map', label: 'Peta Risiko', Icon: MapPinned, badge: '2' },
    {
      id: 'recommendations',
      label: 'Rekomendasi',
      Icon: ListChecks,
      badge: '5',
    },
    { id: 'follow-up', label: 'Tindak Lanjut', Icon: Activity },
    { id: 'reports', label: 'Laporan', Icon: FileText },
  ],
};

const roleMeta: Record<
  RoleId,
  { workspace: string; scope: string; eyebrow: string }
> = {
  admin: {
    workspace: 'Ruang Kerja Admin',
    scope: 'Seluruh sistem dan lembaga',
    eyebrow: 'Kendali sistem',
  },
  peneliti: {
    workspace: 'Ruang Kerja Peneliti',
    scope: 'Instrumen dan data penelitian',
    eyebrow: 'Tata kelola ilmiah',
  },
  asesor: {
    workspace: 'Ruang Kerja Asesor',
    scope: 'Penugasan assessment aktif',
    eyebrow: 'Pelaksanaan lapangan',
  },
  pengelola: {
    workspace: 'Ruang Kerja Pesantren',
    scope: 'PP Al-Hikmah Malang',
    eyebrow: 'Pemanfaatan hasil',
  },
};

function IshasMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="brand-lockup">
      <span
        className={`brand-logo-shell ${inverse ? 'brand-logo-inverse' : ''}`}
      >
        <Image
          className="brand-logo"
          src="/brand/ishas-mark.png"
          alt=""
          width={42}
          height={42}
          priority
        />
      </span>
      <span>
        <b className={inverse ? 'text-white' : 'text-[#4a0710]'}>ISHAS</b>
        <small className={inverse ? 'text-white/55' : 'text-slate-500'}>
          K3L Pesantren
        </small>
      </span>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (account: DemoAccount) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = demoAccounts.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || password !== 'demo1234') {
      setError('Email atau kata sandi demo tidak sesuai.');
      return;
    }
    setError('');
    onLogin(account);
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story-inner">
          <IshasMark inverse />
          <div className="login-copy">
            <span className="stage-chip">
              <Sparkles /> Prototipe validasi fitur
            </span>
            <h1>Satu sistem, empat ruang kerja yang saling terhubung.</h1>
            <p>
              ISHAS membantu pesantren mengelola assessment K3L dari penyusunan
              instrumen hingga tindak lanjut hasil secara terstruktur dan dapat
              ditelusuri.
            </p>
          </div>
          <div className="role-flow" aria-label="Alur empat peran ISHAS">
            {demoAccounts.map(({ role, roleLabel, Icon }, index) => (
              <div className="role-flow-item" key={role}>
                <span>
                  <Icon />
                </span>
                <div>
                  <small>0{index + 1}</small>
                  <b>{roleLabel}</b>
                </div>
              </div>
            ))}
          </div>
          <p className="prototype-note">
            Data dan skor pada prototipe ini hanya untuk memvalidasi tampilan.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="mobile-logo">
            <IshasMark />
          </div>
          <p className="section-kicker">Selamat datang</p>
          <h2>Masuk ke ISHAS</h2>
          <p className="login-intro">
            Gunakan akun demo atau pilih akses cepat sesuai peran yang ingin
            diperiksa.
          </p>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <div className="input-shell">
              <Users />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@ishas.demo"
                autoComplete="username"
              />
            </div>
            <div className="label-row">
              <label htmlFor="password">Kata sandi</label>
              <span>Semua akun: demo1234</span>
            </div>
            <div className="input-shell">
              <LockKeyhole />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="primary-button login-submit" type="submit">
              Masuk ke ruang kerja <ArrowRight />
            </button>
          </form>

          <div className="divider">
            <span>Akses cepat akun demo</span>
          </div>
          <div className="demo-grid">
            {demoAccounts.map((account) => (
              <button
                className="demo-account"
                key={account.role}
                type="button"
                onClick={() => onLogin(account)}
              >
                <span className="demo-icon">
                  <account.Icon />
                </span>
                <span>
                  <b>{account.roleLabel}</b>
                  <small>{account.responsibility}</small>
                </span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
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

function PageHeading({
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

function AdminDashboard() {
  const activities = [
    [
      'Akun asesor baru menunggu aktivasi',
      'Ahmad Rifqi · 8 menit lalu',
      'Perlu ditinjau',
    ],
    [
      'Pesantren Nurul Ilmi memperbarui profil',
      'Kab. Malang · 34 menit lalu',
      'Tercatat',
    ],
    ['Hak akses laporan diubah', 'Oleh Nadia Permata · 2 jam lalu', 'Teraudit'],
  ];
  return (
    <>
      <PageHeading
        kicker="Kendali sistem"
        title="Dashboard Admin"
        description="Pantau kesehatan sistem, pengguna, lembaga, dan aktivitas yang membutuhkan perhatian."
        action={
          <button className="primary-button">
            <Plus /> Tambah pengguna
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Pengguna aktif"
          value="126"
          note="4 peran utama"
          Icon={Users}
        />
        <StatCard
          label="Pesantren"
          value="48"
          note="6 wilayah terdaftar"
          Icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Menunggu aktivasi"
          value="3"
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
            <button className="text-button">
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

function ResearcherDashboard() {
  return (
    <>
      <PageHeading
        kicker="Tata kelola ilmiah"
        title="Dashboard Peneliti"
        description="Kelola instrumen, versi, rubric, dan proses validasi sebelum digunakan di lapangan."
        action={
          <button className="primary-button">
            <Plus /> Buat versi baru
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Versi aktif"
          value="v1.0"
          note="Published · terkunci"
          Icon={LockKeyhole}
        />
        <StatCard
          label="Draft berjalan"
          value="2"
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
          value="7"
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
            <button className="text-button">
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

function AssessorDashboard() {
  return (
    <>
      <PageHeading
        kicker="Pelaksanaan lapangan"
        title="Dashboard Asesor"
        description="Lanjutkan penugasan, lengkapi bukti, dan finalisasi assessment yang menjadi tanggung jawab Anda."
        action={
          <button className="primary-button">
            <Plus /> Assessment baru
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Penugasan aktif"
          value="3"
          note="2 pesantren · 1 review"
          Icon={ClipboardList}
        />
        <StatCard
          label="Progress hari ini"
          value="43%"
          note="21 dari 48 indikator"
          Icon={Activity}
          tone="blue"
        />
        <StatCard
          label="Bukti belum lengkap"
          value="5"
          note="Wajib sebelum finalisasi"
          Icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Selesai bulan ini"
          value="8"
          note="Seluruhnya tersinkron"
          Icon={CheckCircle2}
        />
      </div>
      <section className="surface">
        <div className="surface-head">
          <div>
            <h2>Assessment saya</h2>
            <p>Urut berdasarkan pekerjaan yang paling perlu dilanjutkan</p>
          </div>
          <button className="secondary-button">
            <Search /> Cari penugasan
          </button>
        </div>
        <div className="assessment-table">
          <div className="table-head">
            <span>Pesantren</span>
            <span>Periode</span>
            <span>Progress</span>
            <span>Status</span>
            <span />
          </div>
          {assessments.map((assessment, index) => (
            <div className="table-row" key={assessment.id}>
              <div>
                <b>{assessment.pesantren}</b>
                <small>{assessment.id}</small>
              </div>
              <span>{assessment.period}</span>
              <div className="row-progress">
                <div>
                  <i style={{ width: `${assessment.progress}%` }} />
                </div>
                <b>{assessment.progress}%</b>
              </div>
              <span
                className={`status ${assessment.status === 'Draft' ? 'status-amber' : 'status-green'}`}
              >
                {assessment.status}
              </span>
              <button
                className={
                  index === 0 ? 'row-action row-action-primary' : 'row-action'
                }
              >
                {index === 0 ? 'Lanjutkan' : 'Lihat'} <ArrowRight />
              </button>
            </div>
          ))}
        </div>
      </section>
      <div className="context-note context-note-wide">
        <FileCheck2 />
        <p>
          <b>Sebelum finalisasi</b>Semua indikator wajib terisi, bukti wajib
          tersedia, dan assessment akan dikunci bersama versi instrumennya.
        </p>
      </div>
    </>
  );
}

function ManagerDashboard() {
  const priorityFindings = riskLocations
    .filter((item) => item.level !== 'Rendah')
    .slice(0, 3);
  return (
    <>
      <PageHeading
        kicker="Pemanfaatan hasil"
        title="Ringkasan K3L Pesantren"
        description="Pahami kondisi terkini, lokasi prioritas, dan tindak lanjut yang perlu diselesaikan."
        action={
          <button className="secondary-button">
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
          value="78,5"
          note="Naik 3,2 dari periode lalu"
          Icon={ShieldCheck}
        />
        <StatCard
          label="Risiko tinggi"
          value="2"
          note="Perlu tindakan segera"
          Icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Tindak lanjut"
          value="68%"
          note="17 dari 25 selesai"
          Icon={Activity}
          tone="amber"
        />
        <StatCard
          label="Terverifikasi"
          value="12"
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
            <ResponsiveContainer width="100%" height="100%">
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
          <button className="text-button">
            Buka peta risiko <ArrowRight />
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
              <h3>{finding.name}</h3>
              <p>{finding.issue}</p>
              <button>
                Kelola tindak lanjut <ArrowRight />
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function FeaturePreview({
  account,
  section,
}: {
  account: DemoAccount;
  section: string;
}) {
  const item = roleNavigation[account.role].find(
    (navigation) => navigation.id === section,
  );
  const descriptions: Record<RoleId, string> = {
    admin: 'Halaman pengelolaan sistem ini akan diperdalam pada Stage 02.',
    peneliti:
      'Halaman tata kelola instrumen ini akan diperdalam pada Stage 03.',
    asesor: 'Alur assessment lapangan ini akan diperdalam pada Stage 04.',
    pengelola: 'Halaman pemanfaatan hasil ini akan diperdalam pada Stage 05.',
  };
  const Icon = item?.Icon ?? LayoutDashboard;
  return (
    <>
      <PageHeading
        kicker={roleMeta[account.role].eyebrow}
        title={item?.label ?? 'Fitur'}
        description={descriptions[account.role]}
      />
      <section className="surface feature-preview">
        <span>
          <Icon />
        </span>
        <p className="section-kicker">Peta fitur</p>
        <h2>{item?.label}</h2>
        <p>
          Struktur navigasi dan batas aksesnya sudah disiapkan pada fondasi.
          Detail form, tabel, filter, dan aksi akan dikerjakan pada stage peran
          terkait agar dapat diperiksa satu per satu.
        </p>
        <div className="preview-checks">
          <span>
            <Check /> Hanya tersedia untuk {account.roleLabel}
          </span>
          <span>
            <Check /> Menggunakan data dummy
          </span>
          <span>
            <Check /> Belum terhubung backend
          </span>
        </div>
      </section>
    </>
  );
}

function Workspace({
  account,
  onLogout,
}: {
  account: DemoAccount;
  onLogout: () => void;
}) {
  const [section, setSection] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigation = roleNavigation[account.role];
  const currentLabel =
    navigation.find((item) => item.id === section)?.label ?? 'Dashboard';

  function selectSection(id: string) {
    setSection(id);
    setMobileOpen(false);
  }

  let content: ReactNode;
  if (section !== 'dashboard')
    content = <FeaturePreview account={account} section={section} />;
  else if (account.role === 'admin') content = <AdminDashboard />;
  else if (account.role === 'peneliti') content = <ResearcherDashboard />;
  else if (account.role === 'asesor') content = <AssessorDashboard />;
  else content = <ManagerDashboard />;

  return (
    <div className="workspace">
      {mobileOpen ? (
        <button
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <IshasMark inverse />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">
          <small>Ruang kerja aktif</small>
          <b>{roleMeta[account.role].workspace}</b>
          <span>{roleMeta[account.role].scope}</span>
        </div>
        <nav aria-label="Navigasi utama">
          <span className="nav-caption">Menu utama</span>
          {navigation.map(({ id, label, Icon, badge }) => (
            <button
              className={`nav-link ${section === id ? 'nav-link-active' : ''}`}
              key={id}
              onClick={() => selectSection(id)}
            >
              <Icon />
              <span>{label}</span>
              {badge ? <i>{badge}</i> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <ShieldCheck />
          <div>
            <b>ISHAS Prototype</b>
            <span>Data dummy · tanpa backend</span>
          </div>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu />
            </button>
            <div>
              <small>{roleMeta[account.role].workspace}</small>
              <b>{currentLabel}</b>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifikasi">
              <Bell />
              <i />
            </button>
            <div className="account-menu">
              <button
                className="account-trigger"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
              >
                <span>{account.initials}</span>
                <div>
                  <b>{account.name}</b>
                  <small>{account.roleLabel}</small>
                </div>
                <ChevronDown />
              </button>
              {accountOpen ? (
                <div className="account-popover">
                  <div>
                    <span>{account.initials}</span>
                    <p>
                      <b>{account.name}</b>
                      <small>{account.email}</small>
                    </p>
                  </div>
                  <p className="access-copy">
                    <LockKeyhole /> Akses aktif: {account.roleLabel}
                  </p>
                  <button onClick={onLogout}>
                    <LogOut /> Keluar dari akun
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="page-content">{content}</main>
      </div>
    </div>
  );
}

export function IshasPrototype() {
  const [account, setAccount] = useState<DemoAccount | null>(null);
  return account ? (
    <Workspace account={account} onLogout={() => setAccount(null)} />
  ) : (
    <LoginScreen onLogin={setAccount} />
  );
}
