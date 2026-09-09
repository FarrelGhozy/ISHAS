import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router";

export type InstitutionComparisonItem = {
  code: string;
  name: string;
  location: string;
  index: number | null;
  reports: number;
  activeFindings: number;
  progress: number | null;
};

export function InstitutionComparisonPanel({ items }: { items: InstitutionComparisonItem[] }) {
  const sorted = [...items].sort((a, b) => (b.index ?? -1) - (a.index ?? -1));
  return (
    <section className="surface overflow-hidden" aria-labelledby="institution-comparison-title">
      <div className="flex flex-wrap items-start gap-3 border-b border-line p-4">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-marun-bg text-primary">
          <Building2 size={17} aria-hidden />
        </span>
        <div>
          <h2 id="institution-comparison-title" className="text-sm font-extrabold text-heading">
            {items.length > 1 ? "Perbandingan pesantren" : "Ringkasan pesantren"}
          </h2>
          <p className="mt-0.5 text-xs text-secondary-text">Indeks, laporan, temuan aktif, dan progres dalam satu tampilan</p>
        </div>
      </div>
      <div className="divide-y divide-line">
        {sorted.map((item) => (
          <article key={item.code} className="grid gap-3 p-4 lg:grid-cols-[minmax(14rem,1.4fr)_1fr_6rem_6rem_7rem] lg:items-center">
            <div className="min-w-0">
              <Link className="inline-flex items-center gap-1 text-sm font-extrabold text-heading hover:text-primary hover:underline" to={`/pesantren/${item.code}`}>
                {item.name}<ArrowRight size={13} aria-hidden />
              </Link>
              <p className="mt-0.5 text-xs text-secondary-text">{item.code} · {item.location}</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-secondary-text">
                <span>Indeks K3L</span><strong className="text-sm text-heading">{item.index === null ? "—" : Math.round(item.index)}</strong>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-strip">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.index ?? 0}%` }} />
              </div>
            </div>
            <Metric label="Laporan" value={item.reports} />
            <Metric label="Temuan aktif" value={item.activeFindings} />
            <Metric label="Progres" value={item.progress === null ? "—" : `${item.progress}%`} />
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-strip px-3 py-2 lg:block lg:bg-transparent lg:p-0 lg:text-right">
      <span className="text-xs font-semibold text-secondary-text">{label}</span>
      <strong className="block text-base text-heading lg:mt-1">{value}</strong>
    </div>
  );
}
