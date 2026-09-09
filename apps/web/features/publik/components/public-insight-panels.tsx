import { Activity, BarChart3, CircleDot, ClipboardList } from "lucide-react";
import type { DashboardDistribution } from "~/mocks/processors/dashboard-aggregate";

const RISK_COLORS: Record<string, string> = {
  Tinggi: "#dc2626",
  Sedang: "#d97706",
  Rendah: "#047857",
};

const STATUS_COLORS: Record<string, string> = {
  "Belum ditindaklanjuti": "#64748b",
  Berjalan: "#be123c",
  "Menunggu verifikasi": "#d97706",
  Terverifikasi: "#047857",
};

function PanelHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-marun-bg text-primary">
        <Icon size={16} aria-hidden />
      </span>
      <div>
        <h2 className="text-sm font-extrabold text-heading">{title}</h2>
        <p className="mt-0.5 text-xs text-secondary-text">{description}</p>
      </div>
    </div>
  );
}

export function PublicInsightPanels({ distribution }: { distribution: DashboardDistribution }) {
  return (
    <section className="grid gap-3 lg:grid-cols-12" aria-label="Analisis data publik">
      <ActivityChart data={distribution.aktivitas} />
      <RiskChart data={distribution.risiko} />
      <ChannelChart data={distribution.kanal} />
      <FollowUpChart data={distribution.tindakLanjut} />
    </section>
  );
}

function ActivityChart({ data }: { data: DashboardDistribution["aktivitas"] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <article className="surface p-4 lg:col-span-7">
      <PanelHeading
        icon={Activity}
        title="Aktivitas laporan tervalidasi"
        description="Jumlah laporan yang dapat dipublikasikan dalam enam bulan terakhir"
      />
      <div className="mt-5 grid h-48 grid-cols-6 items-end gap-2 sm:gap-4" role="img" aria-label={data.map((item) => `${item.period}: ${item.value} laporan`).join(", ")}>
        {data.map((item) => (
          <div key={item.period} className="flex h-full min-w-0 flex-col justify-end text-center">
            <span className="mb-1 text-xs font-extrabold text-heading">{item.value}</span>
            <div className="flex h-32 items-end rounded-t-md bg-strip px-1 sm:px-2">
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${item.value === 0 ? 3 : Math.max((item.value / max) * 100, 14)}%` }}
              />
            </div>
            <span className="mt-2 truncate text-xs font-semibold text-secondary-text">{item.period}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function RiskChart({ data }: { data: DashboardDistribution["risiko"] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = data.map((item) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 100 : 0;
    return `${RISK_COLORS[item.label]} ${start}% ${cursor}%`;
  });
  const background = total ? `conic-gradient(${stops.join(", ")})` : "#eef2f6";

  return (
    <article className="surface p-4 lg:col-span-5">
      <PanelHeading
        icon={CircleDot}
        title="Komposisi tingkat risiko"
        description="Seluruh temuan dari laporan yang sudah diterima"
      />
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
        <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background }} role="img" aria-label={`Total ${total} temuan: ${data.map((item) => `${item.label} ${item.value}`).join(", ")}`}>
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-center shadow-[var(--shadow-surface)]">
            <span>
              <strong className="block text-2xl text-heading">{total}</strong>
              <span className="text-xs font-semibold text-secondary-text">temuan</span>
            </span>
          </span>
        </div>
        <ul className="w-full max-w-56 space-y-2">
          {data.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 font-semibold text-secondary-text">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[item.label] }} aria-hidden />
                {item.label}
              </span>
              <strong className="text-heading">{item.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ChannelChart({ data }: { data: DashboardDistribution["kanal"] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <article className="surface p-4 lg:col-span-5">
      <PanelHeading
        icon={ClipboardList}
        title="Sumber laporan"
        description="Perbandingan kanal masukan yang sudah tervalidasi"
      />
      <div className="mt-5 space-y-5">
        {data.map((item, index) => {
          const percentage = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-heading">{item.label}</span>
                <span className="font-semibold text-secondary-text">{item.value} · {percentage}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-strip">
                <div className={`h-full rounded-full ${index === 0 ? "bg-primary" : "bg-accent"}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function FollowUpChart({ data }: { data: DashboardDistribution["tindakLanjut"] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <article className="surface p-4 lg:col-span-7">
      <PanelHeading
        icon={BarChart3}
        title="Status tindak lanjut"
        description="Sebaran pekerjaan per status pada cakupan yang dipilih"
      />
      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_2fr_2rem] items-center gap-3 text-xs">
            <span className="font-semibold text-heading">{item.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-strip">
              <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: STATUS_COLORS[item.label] }} />
            </div>
            <strong className="text-right text-sm text-heading">{item.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
