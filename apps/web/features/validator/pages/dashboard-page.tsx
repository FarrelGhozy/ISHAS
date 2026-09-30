import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  Database,
  FileCheck2,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { isPublishedStatus, selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { hitungIndexSummary } from "~/mocks/processors/dashboard-aggregate";
import { useValidatorState } from "~/shared/api/validator-state";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { nilaiKesiapan } from "../audit-kesiapan";

export function Page() {
  const state = useValidatorState();
  const registered = selectRegisteredInstitutions(state);
  const summary = hitungIndexSummary(
    state,
    registered.map((x) => x.code),
  );
  const bank = state.instrument;
  const bankCount = useMemo(
    () =>
      (bank?.dimensions ?? []).reduce((n, d) => n + d.indicators.length, 0),
    [bank],
  );

  const assessments = useMemo(
    () => state.reports.filter((x) => x.channel === "penilaian-mandiri"),
    [state.reports],
  );
  const kesiapan = useMemo(
    () =>
      assessments.map((x) => ({
        report: x,
        siap: nilaiKesiapan(
          state.selfAssessmentSnapshots.find((s) => s.reportId === x.id),
          x,
          bank?.checksum,
          bankCount,
        ),
      })),
    [assessments, state.selfAssessmentSnapshots, bank, bankCount],
  );
  const layak = kesiapan.filter((x) => x.siap.layak).length;
  const menunggu = kesiapan.filter(
    (x) => x.report.validationStatus === "Menunggu validasi",
  ).length;
  const takLengkap = kesiapan.filter((x) => !x.siap.lengkap).length;
  const checksumBeda = kesiapan.filter(
    (x) => !x.siap.warisan && !x.siap.checksumCocok,
  ).length;

  const terbaru = useMemo(
    () =>
      [...state.selfAssessmentSnapshots]
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .slice(0, 5)
        .map((s) => ({
          snapshot: s,
          report: state.reports.find((r) => r.id === s.reportId),
          inst: state.institutions.find(
            (i) =>
              i.code ===
              state.reports.find((r) => r.id === s.reportId)?.institutionCode,
          ),
        })),
    [state.selfAssessmentSnapshots, state.reports, state.institutions],
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-8">
      <header className="surface relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-brand-bg" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Ruang kerja ilmiah</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-heading">
              Dashboard Validator
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary-text">
              Ringkasan instrumen, cakupan data, dan kesiapan publikasi.
            </p>
          </div>
          <Link className="primary-button" to="/validator/validasi-publikasi">
            <ShieldCheck size={17} />
            Buka audit publikasi
          </Link>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="stat-card flex min-h-32 flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-secondary-text">Indeks agregat</p>
            <BarChart3 className="text-primary" size={18} aria-hidden="true" />
          </div>
          <p className="mt-3 text-4xl font-extrabold leading-none text-heading">
            {summary.currentIndex === null ? "—" : Math.round(summary.currentIndex)}
          </p>
          <p className="mt-2 text-xs text-faint">{summary.periode}</p>
        </article>
        <article className="stat-card flex min-h-32 flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-secondary-text">Layak publik</p>
            <FileCheck2 className="text-primary" size={18} aria-hidden="true" />
          </div>
          <p className="mt-3 text-4xl font-extrabold leading-none text-heading">{layak}</p>
          <p className="mt-2 text-xs text-faint">
            dari {kesiapan.length} snapshot penilaian
          </p>
        </article>
        <article className="stat-card flex min-h-32 flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-secondary-text">Menunggu kajian</p>
            <ClipboardCheck className="text-primary" size={18} aria-hidden="true" />
          </div>
          <p className="mt-3 text-4xl font-extrabold leading-none text-heading">{menunggu}</p>
          <p className="mt-2 text-xs leading-5 text-faint">
            Menunggu validasi Pesantren · {takLengkap} tak lengkap
          </p>
        </article>
        <article className="stat-card flex min-h-32 flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-secondary-text">Bank instrumen</p>
            <Layers3 className="text-primary" size={18} aria-hidden="true" />
          </div>
          <p className="mt-3 truncate text-xl font-extrabold text-heading">{bank?.label ?? "—"}</p>
          <p className="mt-2 text-xs text-faint">
            {bankCount} indikator live · {bank?.dimensions.length ?? 0} dimensi
          </p>
        </article>
      </div>
      <section className="scope-banner flex items-start gap-3 p-4 sm:p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-primary">
          <BookOpenCheck size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-heading">Alur data dan batas peran</h2>
          <p className="mt-1 text-sm leading-6 text-secondary-text">
            Bank live → penilaian mandiri → snapshot beku → Pesantren Terima/Tolak
            → agregat + PDF → Scoring → Audit publikasi → Data penelitian.
            Keputusan moderasi milik akun Pesantren; Validator hanya mengaudit.
          </p>
        </div>
      </section>
      <section aria-label="Akses cepat">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="kicker">Navigasi kerja</p>
            <h2 className="mt-1 text-lg font-bold text-heading">Akses cepat</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Link className="surface group flex min-h-20 items-center gap-3 p-4 transition hover:border-primary" to="/validator/scoring">
            <BarChart3 className="shrink-0 text-primary" size={19} />
            <span className="mr-auto text-sm font-bold text-heading">Scoring</span>
            <ArrowRight className="text-faint transition group-hover:translate-x-1" size={16} />
          </Link>
          <Link className="surface group flex min-h-20 items-center gap-3 p-4 transition hover:border-primary" to="/validator/validasi-publikasi">
            <ShieldCheck className="shrink-0 text-primary" size={19} />
            <span className="mr-auto text-sm font-bold text-heading">Audit publikasi</span>
            <ArrowRight className="text-faint transition group-hover:translate-x-1" size={16} />
          </Link>
          <Link className="surface group flex min-h-20 items-center gap-3 p-4 transition hover:border-primary" to="/validator/data-penelitian">
            <Database className="shrink-0 text-primary" size={19} />
            <span className="mr-auto text-sm font-bold text-heading">Data penelitian</span>
            <ArrowRight className="text-faint transition group-hover:translate-x-1" size={16} />
          </Link>
          <Link className="surface group flex min-h-20 items-center gap-3 p-4 transition hover:border-primary" to="/validator/instrumen">
            <Layers3 className="shrink-0 text-primary" size={19} />
            <span className="mr-auto text-sm font-bold text-heading">Bank instrumen</span>
            <ArrowRight className="text-faint transition group-hover:translate-x-1" size={16} />
          </Link>
          <Link className="surface group flex min-h-20 items-center gap-3 p-4 transition hover:border-primary" to="/validator/dokumen-instrumen">
            <BookOpenCheck className="shrink-0 text-primary" size={19} />
            <span className="mr-auto text-sm font-bold text-heading">Dokumen instrumen</span>
            <ArrowRight className="text-faint transition group-hover:translate-x-1" size={16} />
          </Link>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-heading">Kesiapan publikasi</h2>
            <Link className="secondary-button" to="/validator/validasi-publikasi">
              Lihat audit
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <li className="flex min-h-16 items-center gap-2 rounded-lg border border-line p-3">
              <span className="status status-green">✓ Layak</span>
              <span className="ml-auto text-xl font-extrabold text-heading">{layak}</span>
            </li>
            <li className="flex min-h-16 items-center gap-2 rounded-lg border border-line p-3">
              <span className="status status-red">✗ Tak lengkap</span>
              <span className="ml-auto text-xl font-extrabold text-heading">{takLengkap}</span>
            </li>
            <li className="flex min-h-16 items-center gap-2 rounded-lg border border-line p-3">
              <span className="status status-amber">✗ Checksum beda</span>
              <span className="ml-auto text-xl font-extrabold text-heading">{checksumBeda}</span>
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-strip p-3 text-xs leading-5 text-secondary-text">
            Layak = lengkap + Diterima akun Pesantren + skor + PDF + checksum
            cocok. Bank berubah tidak mengubah snapshot beku.
          </p>
        </section>
        <section className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="font-bold text-heading">Snapshot terbaru</h2>
            <Link className="secondary-button" to="/validator/data-penelitian">
              Buka dataset
            </Link>
          </div>
          {terbaru.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Belum ada snapshot"
                description="Snapshot muncul setelah penilaian mandiri dikirim."
              />
            </div>
          ) : (
            terbaru.map(({ snapshot, report, inst }) => (
              <div
                className="flex flex-wrap items-center gap-3 border-b border-line p-4 text-sm last:border-b-0"
                key={snapshot.reportId}
              >
                <div className="mr-auto">
                  <strong className="font-extrabold text-heading">{snapshot.reportId}</strong>
                  <p className="mt-1 text-xs leading-5 text-secondary-text">
                    {inst?.name ?? report?.institutionCode ?? "—"} ·{" "}
                    {snapshot.scorePercent === null ||
                    snapshot.scorePercent === undefined
                      ? "tanpa skor"
                      : `skor ${Math.round(snapshot.scorePercent)}%`}
                  </p>
                </div>
                <StatusChip value={report?.validationStatus ?? "Tidak diketahui"} />
                {report && isPublishedStatus(report.validationStatus) ? (
                  <Link className="text-button" to={`/laporan/${report.id}`}>
                    PDF
                  </Link>
                ) : null}
              </div>
            ))
          )}
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-heading">Skor per dimensi</h2>
            <Link className="text-button" to="/validator/scoring">
              Detail
            </Link>
          </div>
          {summary.dimensions.map((x) => (
            <div className="mt-5 first:mt-4" key={x.id}>
              <div className="flex justify-between text-sm">
                <span>{x.name}</span>
                <strong>{x.score === null ? "—" : Math.round(x.score)}</strong>
              </div>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-strip"
                role="meter"
                aria-label={`Skor ${x.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={x.score ?? 0}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${x.score ?? 0}%` }} />
              </div>
            </div>
          ))}
        </section>
        <section className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="font-bold text-heading">Dimensi bank live</h2>
            <Link className="text-button" to="/validator/instrumen">
              Kelola
            </Link>
          </div>
          {(bank?.dimensions ?? []).map((x) => (
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 last:border-b-0" key={x.id}>
              <div className="mr-auto">
                <strong>{x.name}</strong>
                <p className="text-xs text-faint">
                  {x.id}
                  {x.categoryId ? ` · ${x.categoryId}` : ""} · {x.indicators.length}{" "}
                  indikator
                </p>
              </div>
              <span className="status status-neutral">
                {new Set(x.indicators.map((i) => i.answerType)).size} tipe jawaban
              </span>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}
