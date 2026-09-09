import { AlertTriangle, Building2, ClipboardCheck, Users } from "lucide-react";
import { Link } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { StatusChip } from "~/shared/components/status-chip";

export function Page() {
  const state = useMockState();
  const stats = [
    { label: "Pesantren aktif", value: state.institutions.filter((x) => x.status === "Aktif").length, icon: Building2 },
    { label: "Pengguna aktif", value: state.users.filter((x) => x.status === "Aktif").length, icon: Users },
    { label: "Menunggu validasi", value: state.reports.filter((x) => x.validationStatus === "Menunggu validasi").length, icon: AlertTriangle },
    { label: "Laporan selesai", value: state.reports.filter((x) => x.handlingStatus === "Completed" && !x.archivedAt).length, icon: ClipboardCheck },
  ];
  return <section className="flex flex-col gap-5"><header><p className="kicker">Ringkasan sistem</p><h1 className="text-2xl font-extrabold text-heading">Dashboard Super Admin</h1><p className="mt-1 text-sm text-secondary-text">Pantau kesiapan akun, pesantren, dan aktivitas operasional.</p></header><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({label,value,icon:Icon}) => <article className="stat-card" key={label}><div className="flex items-center justify-between"><p className="text-xs font-bold text-secondary-text">{label}</p><Icon size={18} className="text-primary" aria-hidden /></div><p className="mt-3 text-3xl font-extrabold text-heading">{value}</p></article>)}</div><div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><div className="surface overflow-hidden"><div className="flex items-center justify-between border-b border-line p-4"><h2 className="font-bold text-heading">Status pesantren</h2><Link className="text-button" to="/admin/pesantren">Kelola</Link></div><div className="divide-y divide-line">{state.institutions.map((x) => <div className="flex flex-wrap items-center gap-2 p-4 text-sm" key={x.code}><div className="mr-auto"><strong className="text-heading">{x.name}</strong><p className="text-xs text-secondary-text">{x.code} · {x.location}</p></div><StatusChip value={x.status}/></div>)}</div></div><div className="surface overflow-hidden"><div className="flex items-center justify-between border-b border-line p-4"><h2 className="font-bold text-heading">Aktivitas terbaru</h2><Link className="text-button" to="/admin/audit-log">Lihat semua</Link></div><div className="divide-y divide-line">{state.auditEvents.slice(0,5).map((x) => <div className="p-3 text-sm" key={x.id}><strong className="text-heading">{x.action}</strong><p className="text-xs text-secondary-text">{x.actorName} · {x.objectId}</p><time className="text-xs text-faint">{new Date(x.at).toLocaleString("id-ID")}</time></div>)}</div></div></div></section>;
}
