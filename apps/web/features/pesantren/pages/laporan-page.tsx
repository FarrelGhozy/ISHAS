import { useMemo, useState } from "react";
import { Link } from "react-router";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

export function Page() {
  const state = useMockState();
  const user = useCurrentUser();
  const [notice, setNotice] = useState("");
  const [archiveReason, setArchiveReason] = useState<Record<string, string>>({});
  const scope =
    user?.roleId === "pesantren" && user.institutionCodes.length === 1
      ? user.institutionCodes[0]
      : undefined;
  const reports = state.reports.filter(
    (x) => x.institutionCode === scope && x.validationStatus === "Diterima" && !x.archivedAt,
  );
  const recommendations = state.recommendations.filter((x) =>
    reports.some((r) => r.id === x.reportId),
  );
  // D-23.d: rata-rata hanya rekomendasi aktif (non-Dibatalkan); 0 bila kosong.
  const activeRecommendations = useMemo(
    () => recommendations.filter((x) => x.status !== "Dibatalkan"),
    [recommendations],
  );
  const canceledCount = recommendations.length - activeRecommendations.length;
  const progress = useMemo(
    () =>
      activeRecommendations.length
        ? Math.round(
            activeRecommendations.reduce((n, x) => n + x.progress, 0) /
              activeRecommendations.length,
          )
        : 0,
    [activeRecommendations],
  );
  const dataTerbaru = useMemo(() => {
    const times = reports
      .map((x) => x.updatedAt ?? x.createdAt)
      .sort((a, b) => b.localeCompare(a));
    const latest = times[0];
    if (!latest) return "Sep 2026";
    const date = new Date(latest);
    return Number.isNaN(date.getTime()) ? "Sep 2026" : date.toLocaleDateString("id-ID");
  }, [reports]);
  const dimensions =
    state.instrumentVersions.find((x) => x.id === state.activeInstrumentVersionId)?.dimensions ??
    [];
  const download = (kind: string) =>
    setNotice(`Simulasi unduh ${kind}: dokumen dummy tidak dibuat pada prototipe ini.`);
  const archived = state.reports.filter((x) => x.institutionCode === scope && x.archivedAt);
  const archive = (id: string) => {
    if (!user) return;
    const r = storeActions.archiveCompletedReport(user, id, archiveReason[id] ?? "");
    setNotice(r.ok ? `${id} diarsipkan dan tidak tampil publik.` : r.error);
    if (r.ok) setArchiveReason((old) => ({ ...old, [id]: "" }));
  };
  if (!user || user.roleId !== "pesantren" || user.institutionCodes.length !== 1)
    return <EmptyState title="Halaman ini hanya untuk Pesantren" />;
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Ringkasan Pesantren</p>
        <h1 className="text-2xl font-extrabold text-heading">Laporan pesantren</h1>
        <p className="mt-1 text-sm text-secondary-text">
          Periode Sep 2026 ·{" "}
          {state.instrumentVersions.find((x) => x.id === state.activeInstrumentVersionId)?.label} ·
          data terbaru {dataTerbaru} · oleh {user.name}
        </p>
        <p className="mt-1 text-sm">
          <Link className="text-button" to="/pesantren/validasi-laporan">
            Buka Validasi
          </Link>
          {" · "}
          <Link className="text-button" to="/pesantren/tindak-lanjut">
            Buka Tindak lanjut
          </Link>
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Laporan diterima" value={reports.length} />
        <Metric
          label="Completed"
          value={reports.filter((x) => x.handlingStatus === "Completed").length}
        />
        <Metric label="Progres tindak lanjut" value={`${progress}%`} />
      </div>
      <p className="text-sm text-secondary-text">
        Progres memakai {activeRecommendations.length} rekomendasi aktif
        {canceledCount ? ` · ${canceledCount} Dibatalkan dikecualikan` : ""} · Dibatalkan
        menghalangi Completed otomatis.
      </p>
      <div className="flex flex-wrap gap-2">
        <button className="secondary-button" onClick={() => download("PDF")}>
          Unduh PDF dummy
        </button>
        <button className="secondary-button" onClick={() => download("Excel")}>
          Unduh Excel dummy
        </button>
      </div>
      {notice && (
        <p role="status" className="rounded border border-line-soft p-3 text-sm">
          {notice}
        </p>
      )}
      <section className="surface p-4">
        <h2 className="font-bold">Dimensi instrumen (katalog aktif · ilustrasi)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {dimensions.map((x) => (
            <div key={x.id} className="rounded border border-line-soft p-3 text-sm">
              <strong>{x.name}</strong>
              <p className="text-secondary-text">{x.indicators.length} indikator · ilustrasi</p>
            </div>
          ))}
        </div>
      </section>
      <section className="surface p-4">
        <h2 className="font-bold">Status tindak lanjut</h2>
        <div className="mt-3 divide-y divide-line">
          {recommendations.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center gap-2 py-3">
              <strong className="mr-auto">{x.title}</strong>
              <span className="text-sm text-secondary-text">{x.progress}%</span>
              <StatusChip value={x.status} />
              <StatusChip value={x.priority} />
            </div>
          ))}
        </div>
      </section>
      <section className="surface p-4">
        <h2 className="font-bold">Riwayat laporan</h2>
        <div className="mt-3 divide-y divide-line">
          {reports.map((x) => (
            <div key={x.id} className="flex flex-wrap gap-2 py-3 text-sm">
              <strong className="mr-auto">
                {x.id} · {x.title}
              </strong>
              <StatusChip value={x.handlingStatus} />
              <span className="text-secondary-text">
                {x.instrumentVersionId ?? "Tanpa instrumen"}
              </span>
              <span className="text-secondary-text">
                {new Date(x.createdAt).toLocaleDateString("id-ID")}
              </span>
              {x.handlingStatus === "Completed" ? (
                <span className="flex w-full flex-wrap items-center gap-2">
                  <input
                    aria-label={`Alasan arsip ${x.id}`}
                    className="min-h-10 min-w-48 flex-1 rounded border border-line-soft px-3"
                    value={archiveReason[x.id] ?? ""}
                    onChange={(e) =>
                      setArchiveReason((old) => ({ ...old, [x.id]: e.target.value }))
                    }
                    placeholder="Alasan arsip (min 5 karakter)"
                  />
                  <button type="button" className="secondary-button" onClick={() => archive(x.id)}>
                    Arsipkan
                  </button>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="surface p-4">
        <h2 className="font-bold">Arsip Completed</h2>
        <p className="mt-1 text-sm text-secondary-text">
          Data tetap tersimpan dan dapat dibaca di sini; tidak tampil di dashboard publik.
        </p>
        <div className="mt-3 divide-y divide-line">
          {archived.length ? (
            archived.map((x) => (
              <div key={x.id} className="flex flex-wrap gap-2 py-3 text-sm">
                <strong className="mr-auto">
                  {x.id} · {x.title}
                </strong>
                <StatusChip value="Diarsipkan" />
                <span className="text-secondary-text">{x.archivedReason}</span>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-secondary-text">Belum ada laporan yang diarsipkan.</p>
          )}
        </div>
      </section>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface p-4">
      <p className="text-sm text-secondary-text">{label}</p>
      <strong className="text-3xl text-heading">{value}</strong>
    </div>
  );
}
