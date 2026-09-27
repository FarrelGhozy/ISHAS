import { Link } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { hitungIndexSummary } from "~/mocks/processors/dashboard-aggregate";

export function Page() {
  const state = useMockState();
  const summary = hitungIndexSummary(
    state,
    selectRegisteredInstitutions(state).map((x) => x.code),
  );
  const bank = state.instrument;
  const waiting = state.reports.filter(
    (x) => x.channel === "penilaian-mandiri" && x.validationStatus === "Menunggu validasi",
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
          <p className="text-xs font-bold text-secondary-text">Bank instrumen</p>
          <p className="mt-2 text-xl font-extrabold text-heading">{bank?.label ?? "—"}</p>
          <p className="text-xs text-faint">
            {bank?.dimensions.flatMap((x) => x.indicators).length ?? 0} indikator live
          </p>
        </article>
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Snapshot penelitian</p>
          <p className="mt-2 text-3xl font-extrabold text-heading">
            {state.selfAssessmentSnapshots.length}
          </p>
          <p className="text-xs text-faint">Semua status validasi</p>
        </article>
        <article className="stat-card">
          <p className="text-xs font-bold text-secondary-text">Menunggu kajian</p>
          <p className="mt-2 text-3xl font-extrabold text-heading">{waiting.length}</p>
          <p className="text-xs text-faint">Penilaian mandiri</p>
        </article>
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
                  {x.id} · {x.indicators.length} indikator
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
