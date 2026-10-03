// Dashboard SAM-iSAFE: ringkasan + tren + rata-rata kategori (D-26.e).
// Murni baca pengamatan Selesai.

import { useMemo } from "react";
import { Activity, ArrowUpRight, ClipboardCheck, Database, ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import { samCategoryAverages, samCompleted } from "~/mocks/sam-isafe";
import { StatusChip } from "~/shared/components/status-chip";
import { SamScoreRing } from "./sam-score-ring";
import { SamTrendChart } from "./sam-trend-chart";
import type {
  Institution,
  SamAssessment,
  SamCategory,
  SamFollowUp,
  SamQuestion,
} from "~/mocks/types";

type Props = {
  assessments: SamAssessment[];
  followUps: SamFollowUp[];
  categories: SamCategory[];
  questions: SamQuestion[];
  institutions: Institution[];
  registeredCount: number;
};

function StatCard({
  label,
  value,
  detail,
  tone = "blue",
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "blue" | "red" | "amber";
  icon: React.ReactNode;
}) {
  return (
    <article className={`stat-card stat-${tone} flex min-h-32 flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">{label}</p>
        <span className="text-secondary-text" aria-hidden>{icon}</span>
      </div>
      <div>
        <p className="mt-3 text-3xl font-extrabold leading-none text-heading">{value}</p>
        <p className="mt-2 text-xs text-faint">{detail}</p>
      </div>
    </article>
  );
}

export function SamDashboard(props: Props) {
  const { assessments, followUps, categories, questions, institutions, registeredCount } = props;
  const selesai = useMemo(() => samCompleted(assessments), [assessments]);
  const terakhir = selesai[selesai.length - 1];
  const namaPesantren = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of institutions) map.set(item.code, item.name);
    return map;
  }, [institutions]);
  const rataKategori = useMemo(
    () => samCategoryAverages(assessments, categories, questions),
    [assessments, categories, questions],
  );
  const tinggi = selesai.filter((item) => item.riskLevel === "Risiko Tinggi").length;
  const terbuka = followUps.filter(
    (item) => item.status !== "Selesai" && item.status !== "Dibatalkan",
  ).length;
  const tren = useMemo(() => selesai.slice(-8), [selesai]);
  const rataRata = selesai.length
    ? selesai.reduce((total, item) => total + item.percent, 0) / selesai.length
    : null;

  return (
    <div className="flex flex-col gap-5">
      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-[#063A73] via-[#0066CC] to-primary p-5 text-white sm:p-7 lg:flex-row lg:items-center">
          <div className="mr-auto max-w-xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-100">
              <ClipboardCheck size={16} />
              Ringkasan keselamatan
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Pantau kesiapan keselamatan secara terukur.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
              Ringkasan ini menggunakan pengamatan Selesai dari seluruh pesantren terdaftar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-primary shadow-sm hover:bg-blue-50" to="/validator/sam-isafe/baru">
                Mulai pengamatan
                <ArrowUpRight size={16} />
              </Link>
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/40 px-4 text-sm font-bold text-white hover:bg-white/10" to="/validator/sam-isafe/bank">
                <Database size={16} />
                Kelola bank
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
            {terakhir ? (
              <SamScoreRing
                percent={terakhir.percent}
                risk={terakhir.riskLevel}
                total={terakhir.totalScore}
                max={terakhir.maxScore}
                onDark
              />
            ) : (
              <div className="grid size-32 place-items-center rounded-full border-8 border-white/20 text-center">
                <span className="text-xs font-bold text-blue-100">Belum ada<br />skor</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-secondary-text">Pengamatan selesai</p>
            <p className="mt-1 text-sm font-bold text-heading">{selesai.length} laporan tervalidasi</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-secondary-text">Skor rata-rata</p>
            <p className="mt-1 text-sm font-bold text-heading">{rataRata === null ? "—" : `${rataRata.toFixed(1)}%`} dari seluruh hasil</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-secondary-text">Pesantren terdaftar</p>
            <p className="mt-1 text-sm font-bold text-heading">{registeredCount} pesantren dapat dinilai</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total pengamatan" value={assessments.length} detail={`${selesai.length} selesai`} icon={<ClipboardCheck size={18} />} />
        <StatCard label="Risiko tinggi" value={tinggi} detail="Perlu tindakan segera" tone="red" icon={<ShieldAlert size={18} />} />
        <StatCard label="Tindak lanjut" value={terbuka} detail="Belum atau sedang berjalan" tone="amber" icon={<Activity size={18} />} />
        <StatCard label="Pesantren" value={registeredCount} detail="Terdaftar dan aktif" icon={<Database size={18} />} />
      </div>

      {terakhir ? (
        <section className="surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="mr-auto">
              <p className="kicker">Pengamatan terakhir</p>
              <h2 className="mt-1 text-xl font-extrabold text-heading">
                {namaPesantren.get(terakhir.institutionCode) ?? terakhir.institutionCode}
              </h2>
              <p className="mt-1 text-sm text-secondary-text">
                {terakhir.id} · {terakhir.observedAt} · oleh {terakhir.observerName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip value={terakhir.status} />
              <StatusChip value={terakhir.riskLevel === "Risiko Rendah" ? "Rendah" : terakhir.riskLevel === "Risiko Sedang" ? "Sedang" : "Tinggi"} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-line pt-4">
            <div>
              <p className="text-xs font-bold text-secondary-text">Skor akhir</p>
              <p className="mt-1 text-2xl font-extrabold text-heading">{terakhir.percent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-text">Nilai terkumpul</p>
              <p className="mt-1 text-lg font-bold text-heading">{terakhir.totalScore} <span className="text-sm font-normal text-faint">/ {terakhir.maxScore}</span></p>
            </div>
            <Link className="text-button ml-auto" to={`/validator/sam-isafe/${terakhir.id}`}>
              Buka detail pengamatan <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-2">
            <div className="mr-auto">
              <h2 className="font-bold text-heading">Perkembangan skor</h2>
              <p className="mt-1 text-xs text-secondary-text">Persentase pengamatan Selesai dari waktu ke waktu.</p>
            </div>
            <span className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-bold text-primary">{tren.length} data</span>
          </div>
          <div className="mt-5">
            {tren.length > 0 ? <SamTrendChart items={tren} /> : <EmptyChart />}
          </div>
        </section>
        <section className="surface min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-2">
            <div className="mr-auto">
              <h2 className="font-bold text-heading">Rata-rata per kategori</h2>
              <p className="mt-1 text-xs text-secondary-text">Performa lintas pengamatan Selesai.</p>
            </div>
            <Activity className="text-primary" size={18} />
          </div>
          <div className="mt-5 flex flex-col gap-4">
            {rataKategori.map((row) => (
              <div key={row.category.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-heading">{row.category.name}</span>
                  <strong className="text-heading">{row.average === null ? "—" : `${row.average.toFixed(1)}%`}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-strip">
                  <div className="h-2 rounded-full bg-primary transition-[width]" style={{ width: `${row.average ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {terakhir?.reviewedBy ? (
        <div className="scope-banner">
          <StatusChip value="Ditinjau" />
          <span className="text-sm">{terakhir.id} ditinjau oleh {terakhir.reviewedBy}.</span>
        </div>
      ) : null}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-line-soft bg-strip/50 px-5 text-center">
      <Activity className="text-faint" size={26} />
      <p className="mt-3 text-sm font-bold text-heading">Belum ada data tren</p>
      <p className="mt-1 text-xs text-secondary-text">Grafik akan muncul setelah pengamatan diselesaikan.</p>
    </div>
  );
}
