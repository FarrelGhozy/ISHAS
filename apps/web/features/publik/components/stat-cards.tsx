// 4 kartu statistik dashboard — WIREFRAMES.md §1 region 2 + DESIGN_SYSTEM.md §1/§3.
// Indeks memakai aturan ilustrasi D-04 (label ilustrasi di banner/grafik, bukan rumus final).

import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IndexSummary } from "~/mocks/processors/dashboard-aggregate";
import { ringkasTindakLanjut } from "~/mocks/processors/dashboard-aggregate";
import type { Recommendation, RiskFinding } from "~/mocks/types";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: string;
  subTone?: string;
}) {
  return (
    <div className={`stat-card ${tone ?? ""}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-secondary-text">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-2xl font-extrabold text-heading">{value}</p>
        <Icon size={16} className="text-accent" aria-hidden />
      </div>
      <p className="text-xs font-semibold text-secondary-text">{sub}</p>
    </div>
  );
}

export function StatCards({
  summary,
  findings,
  recommendations,
}: {
  summary: IndexSummary;
  findings: RiskFinding[];
  recommendations: Recommendation[];
}) {
  const tindakLanjut = ringkasTindakLanjut(recommendations);

  const deltaText =
    summary.delta === null
      ? "Belum dapat dibandingkan"
      : summary.arah === "naik"
        ? `Naik ${summary.delta} dari periode lalu`
        : summary.arah === "turun"
          ? `Turun ${Math.abs(summary.delta)} dari periode lalu`
          : "Setara periode lalu";
  const DeltaIcon = summary.arah === "turun" ? TrendingDown : TrendingUp;
  const deltaColor =
    summary.arah === "naik"
      ? "text-[#047857]"
      : summary.arah === "turun"
        ? "text-[#b91c1c]"
        : "text-secondary-text";

  return (
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="stat-card">
        <p className="text-xs font-bold uppercase tracking-wide text-secondary-text">
          Indeks K3L
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-2xl font-extrabold text-heading">
            {summary.currentIndex === null ? "—" : Math.round(summary.currentIndex)}
          </p>
          <ShieldCheck size={16} className="text-accent" aria-hidden />
        </div>
        <p className={`flex items-center gap-1 text-xs font-semibold ${deltaColor}`}>
          {summary.arah === "naik" || summary.arah === "turun" ? (
            <DeltaIcon size={11} aria-hidden />
          ) : null}
          {deltaText}
        </p>
      </div>
      <StatCard
        label="Risiko tinggi"
        value={String(hitungTemuanTinggi(findings))}
        sub="Perlu tindakan segera"
        icon={AlertTriangle}
        tone="stat-red"
      />
      <StatCard
        label="Tindak lanjut"
        value={tindakLanjut.rataProgress === null ? "—" : `${tindakLanjut.rataProgress}%`}
        sub={
          tindakLanjut.rataProgress === null
            ? "Belum ada rencana tindakan"
            : `Rata-rata progres · ${tindakLanjut.pekerjaan} pekerjaan`
        }
        icon={Activity}
        tone="stat-amber"
      />
      <StatCard
        label="Terverifikasi"
        value={String(tindakLanjut.terverifikasi)}
        sub="Oleh pengelola pondok"
        icon={CheckCircle2}
        tone="stat-blue"
      />
    </div>
  );
}

function hitungTemuanTinggi(findings: RiskFinding[]): number {
  return findings.filter((f) => f.level === "Tinggi" && f.status !== "Terverifikasi").length;
}
