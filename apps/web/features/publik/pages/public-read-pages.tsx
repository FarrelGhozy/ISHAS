import { Link, useSearchParams } from "react-router";
import { Download, ExternalLink, FileText, MapPin } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import {
  selectFindingsByReports,
  selectInstitutionByCode,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
  selectPublicReports,
  selectUserById,
} from "~/mocks/store/selectors";
import { hitungIndexSummary } from "~/mocks/processors/dashboard-aggregate";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { PublicFilter } from "../components/public-filter";

export type PublicReadKind = "hasil" | "peta" | "rekomendasi" | "tindak-lanjut" | "laporan";

const TITLES: Record<PublicReadKind, string> = {
  hasil: "Hasil assessment",
  peta: "Peta bahaya dan risiko",
  rekomendasi: "Rekomendasi",
  "tindak-lanjut": "Tindak lanjut",
  laporan: "Laporan pimpinan",
};

function PublicHeader({ kind }: { kind: PublicReadKind }) {
  return <header>
    <p className="kicker">Data publik · ilustrasi</p>
    <h1 className="text-2xl font-extrabold text-heading">{TITLES[kind]}</h1>
    <p className="mt-1 text-sm text-secondary-text">Ringkasan data tervalidasi; nama pelapor, kontak, bukti, denah rinci, dan jawaban mentah tidak ditampilkan.</p>
  </header>;
}

export function PublicReadPage({ kind }: { kind: PublicReadKind }) {
  const state = useMockState();
  const [params] = useSearchParams();
  const institutions = selectRegisteredInstitutions(state);
  const requested = params.get("pesantren") ?? undefined;
  const selected = requested && institutions.some((item) => item.code === requested) ? requested : undefined;
  const reports = selectPublicReports(state, selected ?? null);
  const findings = selectFindingsByReports(state, reports);
  const recommendations = selectRecommendationsByReports(state, reports);
  const scope = selectInstitutionByCode(state, selected)?.name ?? "Semua pesantren terdaftar";

  return <section className="flex flex-col gap-5">
    <PublicHeader kind={kind} />
    {requested && !selected ? <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">Pesantren pada tautan tidak tersedia. Menampilkan semua pesantren terdaftar.</p> : null}
    <PublicFilter institutions={institutions} />
    {reports.length === 0 ? <EmptyState title={`Belum ada data tervalidasi untuk ${scope}.`} description="Laporan Menunggu validasi atau Ditolak tidak pernah tampil di halaman publik." /> :
      kind === "hasil" ? <Results state={state} codes={selected ? [selected] : institutions.map((item) => item.code)} reports={reports} /> :
      kind === "peta" ? <RiskMap findings={findings} reports={reports} state={state} /> :
      kind === "rekomendasi" ? <Recommendations recommendations={recommendations} /> :
      kind === "tindak-lanjut" ? <FollowUps recommendations={recommendations} /> :
      <LeadershipReport state={state} codes={selected ? [selected] : institutions.map((item) => item.code)} findings={findings} recommendations={recommendations} />}
  </section>;
}

function Results({ state, codes, reports }: { state: ReturnType<typeof useMockState>; codes: string[]; reports: ReturnType<typeof selectPublicReports> }) {
  const summary = hitungIndexSummary({ reports, selfAssessmentSnapshots: state.selfAssessmentSnapshots, instrumentVersions: state.instrumentVersions, indexHistory: state.indexHistory }, codes);
  const assessmentReports = reports.filter((report) => report.channel === "penilaian-mandiri");
  return <div className="grid gap-4 lg:grid-cols-3">
    <article className="stat-card lg:col-span-1"><p className="text-sm font-bold text-secondary-text">Indeks K3L</p><p className="mt-2 text-4xl font-extrabold text-heading">{summary.currentIndex === null ? "—" : Math.round(summary.currentIndex)}</p><p className="mt-2 text-sm text-secondary-text">Kategori ilustratif · {summary.periode}</p></article>
    <article className="surface p-4 lg:col-span-2"><h2 className="font-extrabold text-heading">Dimensi hasil</h2><p className="mt-1 text-sm text-secondary-text">Versi instrumen dan kategori adalah data ilustrasi.</p><ul className="mt-4 space-y-3">{summary.dimensions.map((dimension) => <li key={dimension.id} className="flex items-center gap-3"><span className="min-w-0 flex-1 text-sm font-semibold text-heading">{dimension.name}</span><strong>{Math.round(dimension.score ?? 0)}</strong><div className="h-2 w-24 overflow-hidden rounded-full bg-strip"><div className="h-full bg-accent" style={{ width: `${Math.round(dimension.score ?? 0)}%` }} /></div></li>)}</ul></article>
    <article className="surface p-4 lg:col-span-3"><h2 className="font-extrabold text-heading">Sumber hasil tervalidasi</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{assessmentReports.map((report) => <div key={report.id} className="rounded-lg border border-line p-3"><div className="flex flex-wrap gap-2"><StatusChip value="Diterima" /><StatusChip value="penilaian-mandiri" /></div><p className="mt-2 font-bold text-heading">{report.title}</p><p className="mt-1 text-sm text-secondary-text">{report.instrumentVersionId} · {new Date(report.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p><Validator state={state} id={report.validatedBy} /></div>)}</div></article>
  </div>;
}

function RiskMap({ findings, reports, state }: { findings: ReturnType<typeof selectFindingsByReports>; reports: ReturnType<typeof selectPublicReports>; state: ReturnType<typeof useMockState> }) {
  const activeAreas = new Set(findings.filter((finding) => finding.status !== "Terverifikasi").map((finding) => finding.areaId));
  const areas = state.areas.filter((area) => reports.some((report) => report.institutionCode === area.institutionCode));
  return <div className="grid gap-4 lg:grid-cols-2"><article className="surface p-4"><h2 className="font-extrabold text-heading">Daftar area</h2><p className="mt-1 text-sm text-secondary-text">Area tanpa temuan aktif ditampilkan netral.</p><ul className="mt-3 space-y-2">{areas.map((area) => <li key={area.id} className="flex items-center justify-between gap-3 rounded-lg border border-line p-3"><span><strong className="block text-sm text-heading">{area.name}</strong><span className="text-sm text-secondary-text">{area.zone} · {area.floor}</span></span>{activeAreas.has(area.id) ? <StatusChip value="Berjalan" /> : <span className="text-sm text-secondary-text">Belum ada temuan aktif</span>}</li>)}</ul></article><article className="surface p-4"><h2 className="font-extrabold text-heading">Daftar temuan</h2><div className="mt-3 space-y-3">{findings.map((finding) => { const report = reports.find((item) => item.id === finding.reportId); return <article key={finding.id} className="rounded-lg border border-line p-3"><div className="flex flex-wrap gap-2"><StatusChip value={finding.level} /><StatusChip value={finding.status} /></div><h3 className="mt-2 font-bold text-heading">{finding.issue}</h3><p className="mt-1 text-sm text-secondary-text">{finding.location} · Dampak: {finding.impact}</p><p className="mt-2 text-sm text-secondary-text">Rekomendasi: {finding.recommendation}</p><Validator state={state} id={report?.validatedBy} /></article>; })}</div></article></div>;
}

function Recommendations({ recommendations }: { recommendations: ReturnType<typeof selectRecommendationsByReports> }) {
  return <div className="grid gap-3 md:grid-cols-2">{recommendations.map((item) => <article key={item.id} className="surface flex flex-col gap-3 p-4"><div className="flex flex-wrap gap-2"><StatusChip value={item.priority} /><StatusChip value={item.status} /></div><h2 className="font-extrabold text-heading">{item.title}</h2><p className="text-sm text-secondary-text">{item.location}</p><p className="text-sm text-body-text">{item.action}</p><div className="mt-auto"><p className="text-sm text-secondary-text">PIC: {item.owner}</p><Progress value={item.progress} /><Link className="text-button mt-3" to="/login">Masuk untuk kelola <ExternalLink size={14} /></Link></div></article>)}</div>;
}

function FollowUps({ recommendations }: { recommendations: ReturnType<typeof selectRecommendationsByReports> }) {
  return <div className="space-y-3">{recommendations.map((item) => <article key={item.id} className="surface p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-extrabold text-heading">{item.title}</h2><p className="mt-1 text-sm text-secondary-text">PIC: {item.owner} · {item.location}</p></div><StatusChip value={item.status} /></div><Progress value={item.progress} /><p className="mt-3 text-sm text-secondary-text">Progres dan status ditampilkan sebagai ringkasan publik. Bukti penyelesaian tidak ditampilkan.</p></article>)}</div>;
}

function LeadershipReport({ state, codes, findings, recommendations }: { state: ReturnType<typeof useMockState>; codes: string[]; findings: ReturnType<typeof selectFindingsByReports>; recommendations: ReturnType<typeof selectRecommendationsByReports> }) {
  const reports = selectPublicReports(state, codes.length === 1 ? codes[0] : null);
  const summary = hitungIndexSummary({ reports, selfAssessmentSnapshots: state.selfAssessmentSnapshots, instrumentVersions: state.instrumentVersions, indexHistory: state.indexHistory }, codes);
  return <article className="surface p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold text-heading">Ringkasan pimpinan</h2><p className="mt-1 text-sm text-secondary-text">Periode {summary.periode} · data ilustrasi · instrumen {summary.instrumentVersionIds.join(", ") || "belum tersedia"}</p></div><button type="button" className="secondary-button" onClick={() => alert("Unduhan simulasi: file nyata tersedia setelah backend disiapkan.")}><Download size={16} />Unduh simulasi</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Indeks K3L" value={summary.currentIndex === null ? "—" : String(Math.round(summary.currentIndex))} /><Metric label="Temuan aktif" value={String(findings.filter((item) => item.status !== "Terverifikasi").length)} /><Metric label="Terverifikasi" value={String(recommendations.filter((item) => item.status === "Terverifikasi").length)} /></div><div className="mt-5 rounded-lg border border-line p-4 text-sm text-secondary-text"><FileText size={18} className="mb-2 text-primary" />Laporan ini hanya berisi ringkasan, dimensi, status tindak lanjut, periode, versi instrumen, dan label data dummy.</div></article>;
}

function Validator({ state, id }: { state: ReturnType<typeof useMockState>; id?: string }) { const user = selectUserById(state, id); return user ? <p className="mt-3 flex items-center gap-1 text-sm text-secondary-text"><MapPin size={14} />Divalidasi oleh {user.name}</p> : null; }
function Progress({ value }: { value: number }) { return <div className="mt-3"><div className="flex justify-between text-sm text-secondary-text"><span>Progres</span><strong>{value}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-strip"><div className="h-full bg-accent" style={{ width: `${value}%` }} /></div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="stat-card"><p className="text-sm text-secondary-text">{label}</p><p className="mt-1 text-3xl font-extrabold text-heading">{value}</p></div>; }
