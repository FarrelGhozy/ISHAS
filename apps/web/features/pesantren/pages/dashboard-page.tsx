// Dashboard Pesantren — identitas + rangkuman scope sendiri (D-34).
// Halaman utama workspace Pesantren; tanpa logika validasi baru.

import { useMemo } from "react";
import { Link } from "react-router";
import { usePesantrenState } from "~/shared/api/workspace-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { selectAreasByInstitution } from "~/mocks/store/lapor-selectors";
import {
  selectInstitutionByCode,
  selectRecommendationsForManager,
  selectReportsForManager,
} from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

export function Page() {
  const state = usePesantrenState();
  const user = useCurrentUser();
  const scope =
    user?.roleId === "pesantren" && user.institutionCodes.length === 1
      ? user.institutionCodes[0]
      : undefined;
  const institution = selectInstitutionByCode(state, scope);
  const reports = useMemo(
    () => (scope ? selectReportsForManager(state, scope) : []),
    [state, scope],
  );
  // D-32: antrean validasi hanya kanal lapor-cepat; mandiri Terbit read-only.
  const laporCepat = useMemo(
    () => reports.filter((item) => item.channel === "lapor-cepat"),
    [reports],
  );
  const menunggu = laporCepat.filter(
    (item) => item.validationStatus === "Menunggu validasi",
  ).length;
  const berjalan = laporCepat.filter(
    (item) => item.handlingStatus === "Pending" || item.handlingStatus === "Proses",
  ).length;
  const selesai = laporCepat.filter(
    (item) => item.handlingStatus === "Completed",
  ).length;
  const recommendations = useMemo(
    () => (scope ? selectRecommendationsForManager(state, scope) : []),
    [state, scope],
  );
  // D-23.d: rata-rata hanya rekomendasi aktif (non-Dibatalkan); 0 bila kosong.
  const activeRecommendations = useMemo(
    () => recommendations.filter((item) => item.status !== "Dibatalkan"),
    [recommendations],
  );
  const canceledCount = recommendations.length - activeRecommendations.length;
  const progress = useMemo(
    () =>
      activeRecommendations.length
        ? Math.round(
            activeRecommendations.reduce((sum, item) => sum + item.progress, 0) /
              activeRecommendations.length,
          )
        : 0,
    [activeRecommendations],
  );
  const terbaru = useMemo(() => laporCepat.slice(0, 5), [laporCepat]);
  const terbitCount = useMemo(
    () => reports.filter((item) => item.validationStatus === "Terbit").length,
    [reports],
  );
  const areaName = useMemo(
    () =>
      new Map(
        (scope ? selectAreasByInstitution(state, scope) : []).map((item) => [
          item.id,
          item.label,
        ]),
      ),
    [state, scope],
  );
  if (!user || !scope) {
    return <EmptyState title="Halaman ini hanya untuk Pesantren" />;
  }
  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="kicker">Pesantren saya</p>
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
          Rangkuman laporan, penanganan, dan tindak lanjut milik pesantren ini.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Menunggu validasi"
          value={menunggu}
          hint="Lapor-cepat milik scope ini"
        />
        <Metric
          label="Pending/Proses"
          value={berjalan}
          hint="Sedang ditangani"
        />
        <Metric
          label="Completed"
          value={selesai}
          hint="Belum diarsip"
        />
        <Metric
          label="Progres tindak lanjut"
          value={`${progress}%`}
          hint={`${activeRecommendations.length} aktif${canceledCount ? ` · ${canceledCount} Dibatalkan dikecualikan` : ""}`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-bold text-heading">Antrean terbaru</h2>
            <Link className="text-button" to="/pesantren/validasi-laporan">
              Buka validasi
            </Link>
          </div>
          {terbaru.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Belum ada laporan"
                description="Laporan cepat baru dari pelapor akan muncul di sini."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {terbaru.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 p-4 text-sm"
                >
                  <div className="mr-auto min-w-0">
                    <strong className="text-heading">{item.id}</strong>
                    <p className="truncate text-secondary-text">{item.title}</p>
                    <p className="text-xs text-faint">
                      {item.areaId
                        ? (areaName.get(item.areaId) ?? item.areaId)
                        : (item.manualLocation ?? "Lokasi manual")}
                    </p>
                  </div>
                  <StatusChip value={item.validationStatus} />
                  <StatusChip value={item.handlingStatus} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-heading">Tindak lanjut</h2>
              <Link className="text-button" to="/pesantren/tindak-lanjut">
                Kelola
              </Link>
            </div>
            {recommendations.length === 0 ? (
              <p className="mt-2 text-sm text-secondary-text">
                Belum ada rencana tindak lanjut.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {(
                  [
                    "Belum ditindaklanjuti",
                    "Berjalan",
                    "Menunggu verifikasi",
                    "Terverifikasi",
                    "Dibatalkan",
                  ] as const
                ).map((status) => (
                  <li key={status} className="flex items-center gap-2">
                    <StatusChip value={status} />
                    <span className="ml-auto font-extrabold text-heading">
                      {recommendations.filter((item) => item.status === status).length}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-heading">Penilaian mandiri terbit</h2>
              <Link className="text-button" to="/pesantren/laporan">
                Lihat laporan
              </Link>
            </div>
            <p className="mt-2 text-sm text-secondary-text">
              {terbitCount} hasil terbit dapat dibaca (skor/PDF) tanpa validasi.
            </p>
          </div>
          <div className="surface flex flex-wrap gap-3 p-4 text-sm">
            <Link className="text-button" to="/pesantren/validasi-laporan">
              Buka Validasi →
            </Link>
            <Link className="text-button" to="/pesantren/lokasi">
              Buka Lokasi →
            </Link>
            <Link className="text-button" to="/pesantren/tindak-lanjut">
              Buka Tindak lanjut →
            </Link>
            <Link className="text-button" to="/pesantren/laporan">
              Buka Laporan →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="stat-card">
      <p className="text-xs font-bold text-secondary-text">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-heading">{value}</p>
      <p className="mt-1 text-xs text-faint">{hint}</p>
    </article>
  );
}
