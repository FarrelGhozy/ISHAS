import {
  Building2,
  ClipboardCheck,
  MapPinned,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { DashboardOverview } from "~/mocks/processors/dashboard-aggregate";

function OverviewCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <article className="surface flex min-w-0 items-center gap-3 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-marun-bg text-primary">
        <Icon size={20} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-heading">{value}</p>
        <p className="mt-1 text-sm font-bold text-heading">{label}</p>
        <p className="mt-0.5 text-xs text-secondary-text">{note}</p>
      </div>
    </article>
  );
}

export function PublicOverviewCards({ overview }: { overview: DashboardOverview }) {
  return (
    <section aria-labelledby="cakupan-publik-title">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="kicker">Cakupan publik</p>
          <h2 id="cakupan-publik-title" className="text-lg font-extrabold text-heading">
            Data yang dipantau
          </h2>
        </div>
        <p className="text-xs text-secondary-text">Hanya data aktif dan tervalidasi</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={Building2}
          label="Pesantren terdaftar"
          value={overview.pesantrenTercakup}
          note="Dalam cakupan pilihan"
        />
        <OverviewCard
          icon={UsersRound}
          label="Pengguna aktif"
          value={overview.penggunaAktif}
          note="Pengelola dan tim sistem"
        />
        <OverviewCard
          icon={ClipboardCheck}
          label="Laporan tervalidasi"
          value={overview.laporanTervalidasi}
          note="Aman untuk ringkasan publik"
        />
        <OverviewCard
          icon={MapPinned}
          label="Lokasi dipantau"
          value={overview.lokasiDipantau}
          note="Area terdaftar di pesantren"
        />
      </div>
    </section>
  );
}
