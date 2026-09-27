// Antrean validasi Pesantren — daftar + modal periksa (FLOWS §4, D-19).
// Detail hanya-baca tinggal di komponen review; halaman ini mengatur
// filter, keputusan Terima/Tolak, dan pre-fill usulan pelapor.

import { useMemo, useState } from "react";
import { useMockState, storeActions } from "~/mocks/store/mock-store";
import { selectAreasByInstitution } from "~/mocks/store/lapor-selectors";
import { selectInstitutionByCode, selectReportsForManager } from "~/mocks/store/selectors";
import { StatusChip } from "~/shared/components/status-chip";
import { EmptyState } from "~/shared/components/empty-state";
import { Modal } from "~/shared/components/modal";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import type { Priority, Report, Severity } from "~/mocks/types";
import { ReviewDetail } from "../components/review-detail";
import { ReviewAnswers } from "../components/review-answers";

const levels = ["Tinggi", "Sedang", "Rendah"] as const;

function usulanKeputusan(value?: string): Severity {
  if (value === "Tinggi" || value === "Sedang" || value === "Rendah") return value;
  return "Belum ditentukan";
}

function usulanPrioritas(value?: string): Priority {
  if (value === "Tinggi" || value === "Sedang" || value === "Rendah") return value;
  return "Belum ditentukan";
}

export function ValidasiLaporanPage() {
  const state = useMockState();
  const user = useCurrentUser();
  const [filter, setFilter] = useState("Menunggu validasi");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  if (!user || user.roleId !== "pesantren" || user.institutionCodes.length !== 1)
    return <EmptyState title="Halaman ini hanya untuk Pesantren" />;
  const code = user.institutionCodes[0];
  const institution = selectInstitutionByCode(state, code);
  const reports = useMemo(
    () =>
      selectReportsForManager(state, code)
        .filter(
          (item) =>
            (filter === "Semua" ||
              item.validationStatus === filter ||
              item.handlingStatus === filter) &&
            `${item.id} ${item.title} ${item.reporterName}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state, code, filter, query],
  );
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Moderasi</p>
        <h1 className="text-2xl font-extrabold text-heading">Validasi laporan</h1>
        <p className="mt-1 text-sm text-secondary-text">
          Hanya laporan milik {institution?.name ?? code}.
        </p>
      </header>
      <div className="surface grid gap-3 p-3 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Status
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Menunggu validasi</option>
            <option>Pending</option>
            <option>Proses</option>
            <option>Completed</option>
            <option>Ditolak</option>
            <option>Semua</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Cari
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nomor, judul, pelapor"
          />
        </label>
      </div>
      {reports.length ? (
        <div className="surface divide-y divide-line">
          {reports.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <strong className="text-primary">{item.id}</strong>
                  <StatusChip value={item.channel} />
                  <StatusChip value={item.validationStatus} />
                </div>
                <h2 className="mt-2 font-bold text-heading">{item.title}</h2>
                <p className="text-sm text-secondary-text">
                  {item.reporterName} · {new Date(item.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <button className="primary-button" onClick={() => setReport(item)}>
                Periksa
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada laporan untuk filter ini"
          description="Ubah filter atau tunggu laporan baru dari pelapor."
        />
      )}
      <Review
        key={report?.id ?? "tutup"}
        report={report}
        user={user}
        state={state}
        close={() => setReport(null)}
      />
    </section>
  );
}

function Review({
  report,
  user,
  state,
  close,
}: {
  report: Report | null;
  user: NonNullable<ReturnType<typeof useCurrentUser>>;
  state: ReturnType<typeof useMockState>;
  close: () => void;
}) {
  const [accept, setAccept] = useState(true);
  const [severity, setSeverity] = useState<Severity>(() => usulanKeputusan(report?.reporterSeverity));
  const [priority, setPriority] = useState<Priority>(() => usulanPrioritas(report?.reporterPriority));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  if (!report) return null;
  const live = state.reports.find((item) => item.id === report.id) ?? report;
  const decided = live.validationStatus !== "Menunggu validasi";
  const areas = selectAreasByInstitution(state, report.institutionCode);
  const areaLabel = areas.find((item) => item.id === report.areaId)?.label
    ?? report.manualLocation
    ?? "Tidak tersedia";
  const areaLabelMap = new Map(areas.map((item) => [item.id, item.label]));
  const institutionName = selectInstitutionByCode(state, report.institutionCode)?.name
    ?? report.institutionCode;
  const snapshot =
    report.channel === "penilaian-mandiri"
      ? state.selfAssessmentSnapshots.find((item) => item.reportId === report.id)
      : undefined;
  const version = state.instrumentVersions.find(
    (item) => item.id === (snapshot?.instrumentVersionId ?? report.instrumentVersionId),
  );
  const plans = state.campusPlans.filter(
    (plan) => plan.institutionCode === report.institutionCode,
  );
  const submit = () => {
    const result = accept
      ? storeActions.acceptReport(
          user,
          report.id,
          severity as Exclude<Severity, "Belum ditentukan">,
          priority as Exclude<Priority, "Belum ditentukan">,
          note || undefined,
        )
      : storeActions.rejectReport(user, report.id, note);
    if (result.ok) close();
    else setError(result.error);
  };
  return (
    <Modal open={true} onClose={close} label={`Periksa ${report.id}`}>
      <ReviewDetail
        report={report}
        live={live}
        state={state}
        institutionName={institutionName}
        areaLabel={areaLabel}
      />
      {snapshot && version ? (
        <ReviewAnswers
          snapshot={snapshot}
          version={version}
          areaLabel={areaLabelMap}
          plans={plans}
        />
      ) : null}
      {decided ? null : (
        <>
          <div className="mt-4 flex gap-2">
            <button
              className={accept ? "primary-button" : "secondary-button"}
              onClick={() => setAccept(true)}
            >
              Terima
            </button>
            <button
              className={!accept ? "primary-button" : "secondary-button"}
              onClick={() => setAccept(false)}
            >
              Tolak
            </button>
          </div>
          <p className="mt-2 text-sm text-secondary-text">
            Usulan pelapor:
            {" "}
            {report.reporterSeverity ?? "Belum ditentukan"}
            {" / "}
            {report.reporterPriority ?? "Belum ditentukan"}
            {" — tinjau ulang sebelum konfirmasi."}
          </p>
          {accept ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Tingkat keparahan
                <select
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                >
                  <option>Belum ditentukan</option>
                  {levels.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Prioritas perbaikan
                <select
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option>Belum ditentukan</option>
                  {levels.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          <label className="mt-4 block text-sm font-bold">
            {accept ? "Catatan validasi (opsional)" : "Alasan penolakan (minimal 10 karakter)"}
            <textarea
              className="mt-1 min-h-24 w-full rounded border border-line-soft p-3 font-normal"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <span className="text-secondary-text">{note.length} karakter</span>
          </label>
          {error ? (
            <p role="alert" className="mt-2 text-sm text-[#b91c1c]">
              {error}
            </p>
          ) : null}
        </>
      )}
      <div className="mt-4 flex gap-2">
        {decided ? null : (
          <button className="primary-button" onClick={submit}>
            Konfirmasi {accept ? "terima" : "tolak"}
          </button>
        )}
        <button className="secondary-button" onClick={close}>
          {decided ? "Tutup" : "Batal"}
        </button>
      </div>
    </Modal>
  );
}
