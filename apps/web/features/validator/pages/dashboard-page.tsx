import { useMemo } from "react";
import { Link } from "react-router";
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
    <section className="flex flex-col gap-5">
      <header>
        <p className="kicker">Ruang kerja ilmiah</p>
        <h1 className="text-2xl font-extrabold text-heading">Dashboard Validator</h1>
        <p className="text-sm text-secondary-text">
          Ringkasan instrumen, cakupan data, dan kesiapan publikasi.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Indeks agregat</p>
          <p className="mt-2 text-3xl font-extrabold text-heading">
            {summary.currentIndex === null ? "—" : Math.round(summary.currentIndex)}
          </p>
          <p className="text-xs text-faint">{summary.periode} · ilustrasi</p>
        </article>
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Layak publik</p>
          <p className="mt-2 text-3xl font-extrabold text-heading">{layak}</p>
          <p className="text-xs text-faint">
            dari {kesiapan.length} snapshot penilaian
          </p>
        </article>
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Menunggu kajian</p>
          <p className="mt-2 text-3xl font-extrabold text-heading">{menunggu}</p>
          <p className="text-xs text-faint">
            Menunggu validasi Pesantren · {takLengkap} tak lengkap
          </p>
        </article>
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Bank instrumen</p>
          <p className="mt-2 text-xl font-extrabold text-heading">{bank?.label ?? "—"}</p>
          <p className="text-xs text-faint">
            {bankCount} indikator live · {bank?.dimensions.length ?? 0} dimensi
          </p>
        </article>
      </div>
      <div className="scope-banner">
        Alur baca: Bank live → penilaian mandiri → snapshot beku → Pesantren
        Terima/Tolak → agregat + PDF → Scoring → Audit publikasi → Data
        penelitian. Keputusan moderasi milik akun Pesantren; Validator hanya
        audit.
      </div>
      <div className="surface flex flex-wrap gap-3 p-4 text-sm">
        <Link className="text-button" to="/validator/scoring">
          Buka Scoring →
        </Link>
        <Link className="text-button" to="/validator/validasi-publikasi">
          Buka Audit publikasi →
        </Link>
        <Link className="text-button" to="/validator/data-penelitian">
          Buka Data penelitian →
        </Link>
        <Link className="text-button" to="/validator/instrumen">
          Kelola Bank instrumen →
        </Link>
        <Link className="text-button" to="/validator/dokumen-instrumen">
          Buka Dokumen instrumen →
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-4">
          <div className="flex justify-between">
            <h2 className="font-bold text-heading">Kesiapan publikasi</h2>
            <Link className="text-button" to="/validator/validasi-publikasi">
              Audit
            </Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="status status-green">✓ Layak</span>
              <span className="ml-auto font-extrabold text-heading">{layak}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="status status-red">✗ Tak lengkap</span>
              <span className="ml-auto font-extrabold text-heading">{takLengkap}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="status status-amber">✗ Checksum beda</span>
              <span className="ml-auto font-extrabold text-heading">{checksumBeda}</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-faint">
            Layak = lengkap + Diterima akun Pesantren + skor + PDF + checksum
            cocok. Bank berubah tidak mengubah snapshot beku.
          </p>
        </div>
        <div className="surface overflow-hidden">
          <div className="flex justify-between border-b border-line p-4">
            <h2 className="font-bold text-heading">Snapshot terbaru</h2>
            <Link className="text-button" to="/validator/data-penelitian">
              Dataset
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
                className="flex flex-wrap items-center gap-2 border-b border-line p-4 text-sm"
                key={snapshot.reportId}
              >
                <div className="mr-auto">
                  <strong className="text-heading">{snapshot.reportId}</strong>
                  <p className="text-xs text-faint">
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
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-4">
          <div className="flex justify-between">
            <h2 className="font-bold text-heading">Skor per dimensi</h2>
            <Link className="text-button" to="/validator/scoring">
              Detail
            </Link>
          </div>
          {summary.dimensions.map((x) => (
            <div className="mt-4" key={x.id}>
              <div className="flex justify-between text-sm">
                <span>{x.name}</span>
                <strong>{x.score === null ? "—" : Math.round(x.score)}</strong>
              </div>
              <div className="mt-1 h-2 rounded bg-strip">
                <div className="h-2 rounded bg-primary" style={{ width: `${x.score ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="surface overflow-hidden">
          <div className="flex justify-between border-b border-line p-4">
            <h2 className="font-bold text-heading">Dimensi bank live</h2>
            <Link className="text-button" to="/validator/instrumen">
              Kelola
            </Link>
          </div>
          {(bank?.dimensions ?? []).map((x) => (
            <div className="flex items-center gap-3 border-b border-line p-4" key={x.id}>
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
        </div>
      </div>
    </section>
  );
}
