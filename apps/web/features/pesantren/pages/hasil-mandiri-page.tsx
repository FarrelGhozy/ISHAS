// Hasil penilaian mandiri detail khusus Pesantren (D-36).
// Daftar + detail full internal milik scope sendiri; read-only (D-32).
import { useMemo, useState } from "react";
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
  if (!user || !scope) {
    return (
      <EmptyState title="Halaman ini hanya untuk Pesantren" />
    );
  }
  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="kicker">
          Hasil pesantren saya
        </p>
        <h1 className="text-2xl font-extrabold text-heading">
          {institution?.name ?? scope}
        </h1>
        <p className="mt-1 text-sm text-secondary-text">
          {scope}
          {" · "}
          {institution?.location ?? "—"}
          {" · "}
          {institution?.status ?? "—"}
        </p>
        <p className="mt-1 text-sm text-secondary-text">
          Hasil penilaian mandiri yang terbit, khusus milik pesantren ini.
        </p>
      </header>
      <div className="surface p-3">
        <label className="text-sm font-bold">
          Cari
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nomor, judul, nama penilai"
          />
        </label>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          title="Belum ada hasil penilaian mandiri"
          description="Hasil yang terbit milik pesantren ini akan tampil di sini."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface divide-y divide-line overflow-hidden">
            {reports.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <strong className="text-primary">
                      {item.id}
                    </strong>
                    <StatusChip value={item.validationStatus} />
                  </div>
                  <h2 className="mt-2 font-bold text-heading">
                    {item.title}
                  </h2>
                  <p className="text-sm text-secondary-text">
                    {item.reporterName}
                    {" · "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    {item.scorePercent !== undefined && item.scorePercent !== null
                      ? ` · skor ${Math.round(item.scorePercent)}%`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className={
                    activeId === item.id ? "primary-button" : "secondary-button"
                  }
                  onClick={() =>
                    setActiveId((current) => (current === item.id ? null : item.id))
                  }
                  aria-expanded={activeId === item.id}
                >
                  {activeId === item.id ? "Tutup" : "Lihat detail"}
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
