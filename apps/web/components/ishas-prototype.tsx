'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Download,
  FileText,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MapPinned,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
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
import {
  assessments,
  dimensions,
  riskLocations,
  roleOptions,
  trend,
  type RiskLevel,
} from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type View =
  | 'dashboard'
  | 'assessment'
  | 'instrument'
  | 'rules'
  | 'risk'
  | 'users'
  | 'reports';
const nav: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  { id: 'instrument', label: 'Instrumen', icon: BookOpenCheck },
  { id: 'rules', label: 'Aturan Sistem', icon: ShieldCheck },
  { id: 'risk', label: 'Peta Risiko', icon: MapPinned },
  { id: 'users', label: 'Pengguna & Peran', icon: Users },
  { id: 'reports', label: 'Laporan', icon: FileText },
];
const riskTone: Record<RiskLevel, string> = {
  Tinggi: 'bg-red-600 text-white ring-red-200',
  Sedang: 'bg-amber-400 text-amber-950 ring-amber-200',
  Rendah: 'bg-emerald-500 text-white ring-emerald-200',
};

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'red' | 'amber' | 'green' | 'neutral';
}) {
  const c = {
    red: 'bg-red-50 text-red-700 ring-red-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    neutral: 'bg-slate-50 text-slate-600 ring-slate-200',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${c[tone]}`}
    >
      {children}
    </span>
  );
}
function Head({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function RoleContext({ role }: { role: string }) {
  const context: Record<string, { focus: string; scope: string }> = {
    'Admin Sistem': {
      focus: 'Kelola konfigurasi, versi instrumen, pengguna, dan audit.',
      scope: 'Seluruh pesantren · tetap tunduk pada published lock',
    },
    Asesor: {
      focus: 'Selesaikan assessment yang ditugaskan dan lampirkan bukti.',
      scope: 'Pesantren dan periode yang ditugaskan',
    },
    'Pengelola Pesantren': {
      focus: 'Pantau kondisi K3L dan tindak lanjuti rekomendasi.',
      scope: 'Pesantren sendiri',
    },
    'Tim K3 / Satgas': {
      focus: 'Prioritaskan risiko dan verifikasi tindak lanjut lapangan.',
      scope: 'Area kerja yang ditugaskan',
    },
    'Pimpinan Yayasan': {
      focus: 'Bandingkan tren dan prioritas antarunit.',
      scope: 'Pesantren dalam satu yayasan',
    },
    'Pemerintah / Kemenag': {
      focus: 'Baca ringkasan agregat untuk pembinaan.',
      scope: 'Wilayah yang diberikan · tanpa konfigurasi',
    },
    'Peneliti / Auditor': {
      focus: 'Tinjau data, versi instrumen, ekspor, dan jejak perubahan.',
      scope: 'Dataset dan periode yang disetujui',
    },
  };
  const active = context[role];
  return (
    <div className="role-context">
      <div>
        <span>Fokus peran</span>
        <b>{active.focus}</b>
      </div>
      <div>
        <span>Lingkup data</span>
        <b>{active.scope}</b>
      </div>
      <Pill tone="amber">Simulasi akses</Pill>
    </div>
  );
}

function Dashboard() {
  const recs = [
    ['Bebaskan jalur evakuasi Asrama A', 'Tim K3 · 7 hari', 'Tinggi'],
    ['Periksa regulator dan selang gas dapur', 'Pengelola · 3 hari', 'Tinggi'],
    ['Perbarui tanda titik kumpul Blok B', 'Sarpras · 14 hari', 'Sedang'],
  ];
  const metrics: Array<{
    label: string;
    value: string;
    note: string;
    Icon: LucideIcon;
    tag: string;
  }> = [
    {
      label: 'Indeks K3L',
      value: '78,5',
      note: '+3,2 dari periode lalu',
      Icon: ShieldCheck,
      tag: 'Baik',
    },
    {
      label: 'Assessment aktif',
      value: '12',
      note: '4 perlu ditinjau',
      Icon: ClipboardCheck,
      tag: 'Berjalan',
    },
    {
      label: 'Risiko tinggi',
      value: '2',
      note: 'Perlu tindakan segera',
      Icon: AlertTriangle,
      tag: 'Prioritas',
    },
    {
      label: 'Tindak lanjut',
      value: '68%',
      note: '17 dari 25 selesai',
      Icon: Activity,
      tag: 'Membaik',
    },
  ];
  return (
    <div className="space-y-6">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow text-red-100!">Ringkasan kondisi</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Keselamatan pesantren dalam satu pandangan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50/80">
            Data berikut adalah ilustrasi untuk memvalidasi tampilan. Skor,
            dimensi, dan klasifikasi belum menjadi parameter ilmiah final.
          </p>
        </div>
        <Button className="h-10 bg-white px-4 text-red-700 hover:bg-red-50">
          <Plus />
          Mulai assessment
        </Button>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, Icon, tag }) => (
          <Card key={label} className="metric-card">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="metric-icon">
                  <Icon />
                </div>
                <Pill
                  tone={
                    tag === 'Prioritas'
                      ? 'red'
                      : tag === 'Berjalan'
                        ? 'amber'
                        : 'green'
                  }
                >
                  {tag}
                </Pill>
              </div>
              <p className="mt-6 text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{note}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.9fr]">
        <Card className="panel">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Tren indeks K3L</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Enam bulan terakhir · data dummy
              </p>
            </div>
            <Pill tone="green">+18,9%</Pill>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -18, right: 8, top: 15 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#dc2626" stopOpacity={0.28} />
                    <stop offset="1" stopColor="#dc2626" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[50, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Skor per dimensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {dimensions.map((d) => (
              <div key={d.name}>
                <div className="mb-2 flex justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-slate-700">
                    {d.name}
                  </span>
                  <b>{d.score}</b>
                </div>
                <Progress
                  value={d.score}
                  className="h-2 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-red-800 [&>div]:to-red-500"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Card className="panel">
          <CardHeader>
            <CardTitle>Rekomendasi prioritas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recs.map((r, i) => (
              <div className="list-row" key={r[0]}>
                <span className="index-dot">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r[0]}</p>
                  <p className="mt-1 text-xs text-slate-500">{r[1]}</p>
                </div>
                <Pill tone={r[2] === 'Tinggi' ? 'red' : 'amber'}>{r[2]}</Pill>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Aktivitas terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              'Assessment ASM-0254 difinalisasi',
              'Instrumen Draft 0.3 diperbarui',
              'Tindak lanjut Dapur Utama ditugaskan',
            ].map((x, i) => (
              <div key={x} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-50" />
                <div>
                  <p className="text-sm font-medium">{x}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {i + 1} jam lalu · Admin Sistem
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AssessmentView() {
  return (
    <>
      <Head
        eyebrow="Pengumpulan data"
        title="Assessment pesantren"
        action={
          <Button className="bg-red-700">
            <Plus />
            Assessment baru
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
        <Card className="panel">
          <CardContent className="p-0">
            <div className="assessment-head">
              <span>Assessment</span>
              <span>Progres</span>
              <span>Status</span>
              <span />
            </div>
            {assessments.map((a) => (
              <div className="assessment-row" key={a.id}>
                <div>
                  <p className="font-semibold">{a.pesantren}</p>
                  <p>
                    {a.id} · {a.period}
                    <br />
                    {a.assessor}
                  </p>
                </div>
                <div>
                  <span className="text-[11px]">{a.progress}%</span>
                  <Progress value={a.progress} className="mt-1 h-1.5" />
                </div>
                <Pill
                  tone={
                    a.status === 'Final'
                      ? 'green'
                      : a.status === 'Draft'
                        ? 'amber'
                        : 'neutral'
                  }
                >
                  {a.status}
                </Pill>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Alur assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              'Pilih pesantren & periode',
              'Isi indikator per dimensi',
              'Unggah bukti bila diwajibkan',
              'Tinjau jawaban & validasi',
              'Kirim untuk pemeriksaan',
              'Finalisasi & kunci hasil',
            ].map((x, i) => (
              <div className="flow-step" key={x}>
                <span>{i + 1}</span>
                <p>{x}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function InstrumentView() {
  return (
    <>
      <Head
        eyebrow="Konfigurasi ilmiah"
        title="Instrumen dan versi"
        action={
          <Button className="bg-red-700">
            <Plus />
            Versi draft baru
          </Button>
        }
      />
      <div className="notice">
        <ShieldCheck />
        <div>
          <b>Aturan integritas instrumen</b>
          <p>
            Draft boleh diedit. Published harus terkunci. Setiap perubahan
            ilmiah dibuat sebagai versi baru agar hasil lama tetap dapat
            direproduksi.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {[
            ['ISHAS Draft 0.3', 'Draft', '4 dimensi · 43 indikator · Hari ini'],
            [
              'SAT 1.0 Referensi',
              'Arsip',
              '4 dimensi · 43 indikator · 28 Agu 2026',
            ],
          ].map((x) => (
            <Card className="panel" key={x[0]}>
              <CardContent className="flex items-center gap-4">
                <div className="metric-icon">
                  <BookOpenCheck />
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <b>{x[0]}</b>
                    <Pill tone={x[1] === 'Draft' ? 'amber' : 'neutral'}>
                      {x[1]}
                    </Pill>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{x[2]}</p>
                </div>
                <Button variant="outline">
                  Buka
                  <ChevronRight />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Struktur konfigurasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'Dimensi',
              'Indikator & urutan',
              'Jenis jawaban',
              'Bobot & aturan skor',
              'Kategori risiko',
              'Aturan rekomendasi',
            ].map((x, i) => (
              <div className="config-row" key={x}>
                <b>{x}</b>
                <span>{i < 3 ? 'Tersedia' : 'Menunggu riset'}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RuleCenter() {
  const roles = [
    ['Admin Sistem', true, true, true, true, true],
    ['Asesor', true, false, true, false, false],
    ['Pengelola Pesantren', true, false, true, true, false],
    ['Tim K3 / Satgas', true, false, false, true, false],
    ['Pimpinan Yayasan', true, false, false, false, false],
    ['Pemerintah / Kemenag', true, false, false, false, false],
    ['Peneliti / Auditor', true, false, false, false, true],
  ];
  return (
    <>
      <Head eyebrow="Pusat keputusan" title="Aturan sistem dan hak akses" />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {[
          [
            LockKeyhole,
            'Hasil final tidak berubah',
            'Assessment final terikat pada versi instrumen dan konfigurasi scoring.',
          ],
          [
            BookOpenCheck,
            'Ilmu dikelola sebagai versi',
            'Perubahan indikator, bobot, atau kategori dilakukan lewat versi baru.',
          ],
          [
            KeyRound,
            'Izin mengikuti kemampuan',
            'Backend wajib memeriksa permission dan lingkup pesantren, bukan hanya menyembunyikan menu.',
          ],
        ].map(([Icon, title, copy]) => (
          <Card className="panel rule-principle" key={String(title)}>
            <CardContent>
              <div className="metric-icon">
                <Icon />
              </div>
              <h2 className="mt-4 font-semibold">{String(title)}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {String(copy)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="panel">
          <CardHeader>
            <CardTitle>Lifecycle instrumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="state-flow">
              <div className="state-card editable">
                <Pill tone="amber">Draft</Pill>
                <b>Dapat diedit</b>
                <span>
                  Lengkapi dimensi, indikator, jawaban, bobot, risiko, dan
                  rekomendasi.
                </span>
              </div>
              <ChevronRight />
              <div className="state-card locked">
                <Pill tone="green">Published</Pill>
                <b>Terkunci</b>
                <span>
                  Digunakan assessment dan tidak boleh diubah langsung.
                </span>
              </div>
              <ChevronRight />
              <div className="state-card archived">
                <Pill>Archived</Pill>
                <b>Hanya dibaca</b>
                <span>Tetap tersedia untuk hasil historis dan audit.</span>
              </div>
            </div>
            <div className="rule-branch">
              <Plus />
              <div>
                <b>Butuh perubahan setelah publish?</b>
                <p>
                  Clone versi Published menjadi Draft baru, catat alasan
                  perubahan, lalu lakukan review dan publish ulang.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Lifecycle assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                'Draft',
                'Jawaban masih dapat dilengkapi',
                'Edit oleh pembuat atau petugas berwenang',
              ],
              [
                'Submitted',
                'Menunggu pemeriksaan',
                'Perubahan dibatasi atau dikembalikan',
              ],
              [
                'Finalized',
                'Jawaban dan skor terkunci',
                'Koreksi harus beralasan dan diaudit',
              ],
            ].map((x, i) => (
              <div className="assessment-state" key={x[0]}>
                <span>{i + 1}</span>
                <div>
                  <b>{x[0]}</b>
                  <p>{x[1]}</p>
                  <small>{x[2]}</small>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="panel mt-5">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Matriks akses awal</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Rancangan untuk diskusi · permission final masih memerlukan
              persetujuan tim
            </p>
          </div>
          <Pill tone="amber">Perlu approval</Pill>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="permission-grid">
            <b>Peran</b>
            <b>Dashboard</b>
            <b>Instrumen</b>
            <b>Assessment</b>
            <b>Tindak lanjut</b>
            <b>Audit</b>
            {roles.flatMap((r) =>
              r.map((cell, i) =>
                i === 0 ? (
                  <span className="role-name" key={`${r[0]}-${i}`}>
                    {String(cell)}
                  </span>
                ) : (
                  <span className="permission-cell" key={`${r[0]}-${i}`}>
                    {cell ? <Check /> : '—'}
                  </span>
                ),
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="panel">
          <CardHeader>
            <CardTitle>Arti label sumber</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Proposal', 'Tertulis langsung pada proposal', 'green'],
              ['Visual', 'Terlihat pada diagram atau mockup', 'green'],
              ['Diskusi', 'Kesepakatan bersama pemilik proyek', 'amber'],
              ['Rekomendasi', 'Usulan engineering yang belum final', 'amber'],
              ['Open', 'Belum diputuskan dan tidak boleh diasumsikan', 'red'],
            ].map((x) => (
              <div className="source-rule" key={x[0]}>
                <Pill tone={x[2] as 'red' | 'amber' | 'green'}>{x[0]}</Pill>
                <span>{x[1]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Keputusan yang masih terbuka</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ['Instrumen final', 'Dimensi, indikator, dan jenis jawaban'],
              ['Scoring', 'Bobot, normalisasi, N/A, dan reverse scoring'],
              ['Klasifikasi', 'Skala indeks dan threshold risiko'],
              ['Workflow', 'Perlu reviewer sebelum finalisasi atau tidak'],
              ['Peta risiko', 'Denah unggahan, lantai, dan relasi indikator'],
              ['Notifikasi', 'Trigger dan kanal peringatan'],
            ].map((x) => (
              <div className="open-decision" key={x[0]}>
                <CircleHelp />
                <div>
                  <b>{x[0]}</b>
                  <p>{x[1]}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RiskMap() {
  const [selected, setSelected] = useState(riskLocations[0]);
  return (
    <>
      <Head
        eyebrow="Pemetaan area"
        title="Peta risiko pesantren"
        action={
          <Button className="bg-red-700">
            <Plus />
            Tandai risiko
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="panel">
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-4 text-xs">
              {(['Tinggi', 'Sedang', 'Rendah'] as RiskLevel[]).map((l) => (
                <span className="flex items-center gap-2" key={l}>
                  <i
                    className={`h-2.5 w-2.5 rounded-full ${riskTone[l].split(' ')[0]}`}
                  />
                  {l}
                </span>
              ))}
              <span className="ml-auto text-slate-400">
                Denah ilustrasi · Lantai 1
              </span>
            </div>
            <figure
              className="floorplan"
              aria-label="Denah dengan lima titik risiko"
            >
              <div className="room a">Asrama A</div>
              <div className="room b">Kelas</div>
              <div className="room c">Klinik</div>
              <div className="room d">Masjid</div>
              <div className="room e">Dapur</div>
              {riskLocations.map((p) => (
                <button
                  onClick={() => setSelected(p)}
                  aria-label={`${p.name}, risiko ${p.level}`}
                  className={`risk-pin ${riskTone[p.level]} ${selected.id === p.id ? 'scale-125 ring-4' : ''}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  key={p.id}
                >
                  {p.id}
                </button>
              ))}
            </figure>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader>
            <CardTitle>Detail titik risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <Pill
              tone={
                selected.level === 'Tinggi'
                  ? 'red'
                  : selected.level === 'Sedang'
                    ? 'amber'
                    : 'green'
              }
            >
              Risiko {selected.level}
            </Pill>
            <h2 className="mt-4 text-lg font-semibold">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.zone}</p>
            <div className="my-5 rounded-xl bg-slate-50 p-4">
              <p className="eyebrow">Temuan utama</p>
              <p className="mt-2 text-sm leading-6">{selected.issue}</p>
            </div>
            <Button className="w-full bg-red-700">Lihat rekomendasi</Button>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Koordinat disimpan relatif terhadap denah, bukan
              latitude/longitude.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function UsersView() {
  const descriptions = [
    'Kelola konfigurasi, akun, instrumen draft, dan audit.',
    'Mengisi assessment yang ditugaskan.',
    'Kelola data pesantren dan pantau hasil sendiri.',
    'Menindaklanjuti risiko dan rekomendasi.',
    'Melihat ringkasan tingkat yayasan.',
    'Akses baca agregat sesuai wilayah.',
    'Meninjau versi instrumen dan audit.',
  ];
  return (
    <>
      <Head
        eyebrow="Akses sistem"
        title="Pengguna dan peran"
        action={
          <Button className="bg-red-700">
            <Plus />
            Tambah pengguna
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleOptions.map((role, i) => (
          <Card className="panel" key={role}>
            <CardContent>
              <div className="flex justify-between">
                <div className="metric-icon">
                  <Users />
                </div>
                <Pill>{[3, 12, 24, 8, 4, 2, 6][i]} pengguna</Pill>
              </div>
              <h2 className="mt-5 font-semibold">{role}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                {descriptions[i]}
              </p>
              <Button variant="ghost" className="mt-3 px-0 text-red-700">
                Atur izin
                <ChevronRight />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
function ReportsView() {
  return (
    <>
      <Head
        eyebrow="Dokumen hasil"
        title="Laporan dan ekspor"
        action={
          <Button className="bg-red-700">
            <Download />
            Buat laporan
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          'Laporan evaluasi K3L',
          'Rekap assessment',
          'Daftar risiko & rekomendasi',
          'Riwayat tindak lanjut',
          'Audit perubahan instrumen',
          'Ekspor data penelitian',
        ].map((x) => (
          <Card className="panel" key={x}>
            <CardContent>
              <div className="flex justify-between">
                <div className="metric-icon">
                  <FileText />
                </div>
                <Button variant="ghost" size="icon">
                  <Download />
                </Button>
              </div>
              <h2 className="mt-5 font-semibold">{x}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Menyertakan identitas, periode, dan metadata versi instrumen.
              </p>
              <div className="mt-4 flex gap-2">
                <Pill>PDF</Pill>
                <Pill>Excel</Pill>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function IshasPrototype() {
  const [view, setView] = useState<View>('dashboard');
  const [role, setRole] = useState('Admin Sistem');
  const [mobile, setMobile] = useState(false);
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <aside
        className={`sidebar ${mobile ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <Image
            src="/brand/ishas-mark.png"
            alt="Logo sementara ISHAS"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="text-lg font-bold tracking-[.08em] text-white">
              ISHAS
            </p>
            <p className="text-[10px] text-red-100/60">Safety intelligence</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobile(false)}
          >
            <X className="text-white" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setMobile(false);
              }}
              className={`nav-item ${view === item.id ? 'nav-active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.id === 'risk' && <i>2</i>}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs font-semibold text-white">
              Prototipe penelitian
            </p>
            <p className="mt-1 text-[11px] leading-5 text-red-100/55">
              Parameter ilmiah belum final. Data hanya untuk validasi tampilan.
            </p>
          </div>
          <button className="nav-item mt-2">
            <Settings />
            <span>Pengaturan</span>
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="lg:pl-[264px]">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </Button>
            <div>
              <p className="hidden text-[11px] text-slate-400 sm:block">
                Workspace / {nav.find((n) => n.id === view)?.label}
              </p>
              <p className="text-sm font-semibold">Pesantren Darussalam</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border bg-white px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                aria-label="Cari"
                className="w-32 bg-transparent text-xs outline-none"
                placeholder="Cari di ISHAS..."
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell />
            </Button>
            <select
              aria-label="Simulasikan peran"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-select"
            >
              {roleOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Pill tone="red">Mode prototipe</Pill>
            <span className="text-xs text-slate-400">
              Tampilan sebagai {role}
            </span>
          </div>
          <RoleContext role={role} />
          {view === 'dashboard' && <Dashboard />}
          {view === 'assessment' && <AssessmentView />}
          {view === 'instrument' && <InstrumentView />}
          {view === 'rules' && <RuleCenter />}
          {view === 'risk' && <RiskMap />}
          {view === 'users' && <UsersView />}
          {view === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}
