// Hasil penilaian mandiri detail khusus Pesantren (D-36).
// Daftar + detail full internal milik scope sendiri; read-only (D-32).
import { useMemo, useState } from "react";
import { ClipboardCheck, FileCheck2, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { usePesantrenState } from "~/shared/api/workspace-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { selectAreasByInstitution } from "~/mocks/store/lapor-selectors";
import {
  selectInstitutionByCode,
  selectReportsForManager,
} from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { HasilMandiriDetail } from "../components/hasil-mandiri-detail";

export function Page() {
  const state = usePesantrenState();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const scope =
    user?.roleId === "pesantren" && user.institutionCodes.length === 1
      ? user.institutionCodes[0]
      : undefined;
  const institution = selectInstitutionByCode(state, scope);
  const reports = useMemo(() => {
    if (!scope) {
      return [];
    }
    return (
      selectReportsForManager(state, scope)
        // D-32 + D-36: hanya kanal penilaian-mandiri yang sudah Terbit.
        .filter(
          (item) =>
            item.channel === "penilaian-mandiri" &&
            item.validationStatus === "Terbit",
        )
        .filter((item) =>
          query.trim()
            ? `${item.id} ${item.title} ${item.reporterName}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
            : true,
        )
    );
  }, [state, scope, query]);
  const snapshots = useMemo(
    () => new Map(state.selfAssessmentSnapshots.map((item) => [item.reportId, item])),
    [state],
  );
  const areaLabel = useMemo(
    () =>
      new Map(
        (scope ? selectAreasByInstitution(state, scope) : []).map((item) => [
          item.id,
          item.label,
        ]),
      ),
    [state, scope],
  );
  const plans = useMemo(
    () =>
      scope
        ? state.campusPlans.filter((plan) => plan.institutionCode === scope)
        : [],
    [state, scope],
  );
  const active = reports.find((item) => item.id === activeId) ?? null;
  const scores = reports
    .map((item) => item.scorePercent)
    .filter((score): score is number => score !== undefined && score !== null);
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const highestScore = scores.length ? Math.round(Math.max(...scores)) : null;
  const answeredCount = reports.reduce((sum, report) => {
    const snapshot = snapshots.get(report.id);
    return sum + (snapshot?.jawabanTerisi ?? Object.keys(snapshot?.answers ?? {}).length);
  }, 0);
  if (!user || !scope) {
    return (
      <EmptyState title="Halaman ini hanya untuk Pesantren" />
    );
  }
  return (
    <section className="flex flex-col gap-5">
      <header className="rounded-xl border border-[#bae6fd] bg-[#eff6ff] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker text-primary">Hasil pesantren saya</p>
            <h1 className="mt-1 text-2xl font-extrabold text-heading sm:text-3xl">
              Hasil penilaian mandiri
            </h1>
            <p className="mt-2 text-sm font-bold text-heading">
              {institution?.name ?? scope}
            </p>
            <p className="mt-1 text-sm text-secondary-text">
              {scope} · {institution?.location ?? "—"} · {institution?.status ?? "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#bae6fd] bg-white px-3 py-2 text-xs font-bold text-primary">
            <ShieldCheck size={16} aria-hidden />
            Read-only · data internal
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-secondary-text">
          Rekap hasil penilaian mandiri yang sudah terbit. Data di halaman ini
          hanya berasal dari pesantren Anda dan tidak dapat diubah dari sini.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={FileCheck2} label="Total hasil" value={reports.length} hint="Penilaian terbit" />
        <SummaryCard
          icon={TrendingUp}
          label="Skor rata-rata"
          value={averageScore === null ? "—" : `${averageScore}%`}
          hint="Dari seluruh hasil"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Skor tertinggi"
          value={highestScore === null ? "—" : `${highestScore}%`}
          hint="Snapshot terbaik"
        />
        <SummaryCard
          icon={ClipboardCheck}
          label="Jawaban terisi"
          value={answeredCount}
          hint="Akumulasi snapshot"
        />
      </div>
      <div className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-heading">
          <Search size={17} className="text-primary" aria-hidden />
          Cari hasil
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Cari nomor, judul, atau nama penilai</span>
          <input
            className="min-h-11 w-full rounded border border-line-soft px-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nomor, judul, nama penilai"
          />
        </label>
        <span className="text-xs text-secondary-text">{reports.length} hasil ditemukan</span>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          title="Belum ada hasil penilaian mandiri"
          description="Hasil yang terbit milik pesantren ini akan tampil di sini."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {reports.map((item) => (
              <article
                key={item.id}
                className={`surface overflow-hidden border-l-4 p-4 transition-shadow sm:p-5 ${
                  activeId === item.id
                    ? "border-l-primary shadow-md"
                    : "border-l-transparent hover:shadow-md"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-primary">{item.id}</strong>
                      <StatusChip value={item.validationStatus} />
                    </div>
                    <h2 className="mt-2 font-bold leading-6 text-heading">{item.title}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-heading">
                      {item.scorePercent === undefined || item.scorePercent === null
                        ? "—"
                        : `${Math.round(item.scorePercent)}%`}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Skor beku</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 border-t border-line pt-3 text-xs text-secondary-text sm:grid-cols-2">
                  <span><strong className="text-heading">Penilai:</strong> {item.reporterName}</span>
                  <span><strong className="text-heading">Dikirim:</strong> {new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                <button
                  type="button"
                  className={`mt-4 w-full ${activeId === item.id ? "primary-button" : "secondary-button"}`}
                  onClick={() => setActiveId((current) => (current === item.id ? null : item.id))}
                  aria-expanded={activeId === item.id}
                >
                  {activeId === item.id ? "Sembunyikan detail" : "Buka detail hasil"}
                </button>
              </article>
            ))}
          </div>
          <div>
            {active ? (
              <HasilMandiriDetail
                key={active.id}
                report={active}
                snapshot={snapshots.get(active.id)}
                bank={state.instrument}
                areaLabel={areaLabel}
                plans={plans}
                institutionName={institution?.name ?? scope}
              />
            ) : (
              <div className="surface p-4">
                <p className="text-sm text-secondary-text">
                  Pilih salah satu laporan untuk melihat jawaban, bukti,
                  lokasi, dan skor lengkapnya.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof FileCheck2;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="stat-card relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-secondary-text">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-heading">{value}</p>
          <p className="mt-1 text-xs text-faint">{hint}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-bg text-primary">
          <Icon size={19} aria-hidden />
        </span>
      </div>
    </article>
  );
}
