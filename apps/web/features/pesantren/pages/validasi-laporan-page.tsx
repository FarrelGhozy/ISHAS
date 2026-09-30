// Antrean validasi Pesantren — daftar + modal periksa (FLOWS §4, D-19, D-29).
// Detail hanya-baca tinggal di komponen review; halaman ini mengatur
// filter, keputusan Terima/Tolak, dan pre-fill usulan pelapor.

import { useMemo, useState } from "react";
import { usePesantrenState, refreshPesantrenState } from "~/shared/api/workspace-state";
import { repository } from "~/shared/api/repository";
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

// Pre-fill usulan sah; selain itu placeholder kosong agar wajib pilih eksplisit (D-23).
function usulanKeputusan(value?: string): string {
  if (value === "Tinggi" || value === "Sedang" || value === "Rendah") return value;
  return "";
}

function usulanPrioritas(value?: string): string {
  if (value === "Tinggi" || value === "Sedang" || value === "Rendah") return value;
  return "";
}

export function ValidasiLaporanPage() {
  const state = usePesantrenState();
  const user = useCurrentUser();
  const [filter, setFilter] = useState("Menunggu validasi");
  const [severityFilter, setSeverityFilter] = useState("Semua");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  if (!user || user.roleId !== "pesantren" || user.institutionCodes.length !== 1)
    return <EmptyState title="Halaman ini hanya untuk Pesantren" />;
  const code = user.institutionCodes[0];
  const institution = selectInstitutionByCode(state, code);
  const areaOptions = useMemo(() => selectAreasByInstitution(state, code), [state, code]);
  const areaName = useMemo(() => new Map(areaOptions.map((x) => [x.id, x.label])), [areaOptions]);
  const reports = useMemo(
    () =>
      selectReportsForManager(state, code)
        // D-32: penilaian mandiri terbit langsung, bukan bagian antrean validasi.
        .filter((item) => item.channel === "lapor-cepat")
        .filter(
          (item) =>
            (filter === "Semua" ||
              item.validationStatus === filter ||
              item.handlingStatus === filter) &&
            (severityFilter === "Semua" || item.severity === severityFilter) &&
            `${item.id} ${item.title} ${item.reporterName} ${item.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state, code, filter, severityFilter, query],
  );
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Moderasi</p>
        <h1 className="text-2xl font-extrabold text-heading">Validasi laporan</h1>
        <p className="mt-1 text-sm text-secondary-text">
          Hanya laporan cepat milik {institution?.name ?? code}. Penilaian mandiri terbit
          langsung tanpa validasi.
        </p>
      </header>
      <div className="surface grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
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
          Severity
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option>Semua</option>
            <option>Tinggi</option>
            <option>Sedang</option>
            <option>Rendah</option>
            <option>Belum ditentukan</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Cari
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nomor, judul, pelapor, deskripsi"
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
                  <StatusChip value={item.handlingStatus} />
                </div>
                <h2 className="mt-2 font-bold text-heading">{item.title}</h2>
                <p className="text-sm text-secondary-text">
                  {item.reporterName} · {new Date(item.createdAt).toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-sm text-secondary-text">
                  {item.areaId
                    ? (areaName.get(item.areaId) ?? item.areaId)
                    : (item.manualLocation ?? "Lokasi manual")}
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
  state: ReturnType<typeof usePesantrenState>;
  close: () => void;
}) {
  const [accept, setAccept] = useState(true);
  const [severity, setSeverity] = useState<string>(() => usulanKeputusan(report?.reporterSeverity));
  const [priority, setPriority] = useState<string>(() => usulanPrioritas(report?.reporterPriority));
  const [rekomendasi, setRekomendasi] = useState<string>(
    () => report?.reporterRecommendation?.trim() ?? "",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  if (!report) return null;
  const isLaporCepat = report.channel === "lapor-cepat";
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
  const bank = state.instrument;
  const plans = state.campusPlans.filter(
    (plan) => plan.institutionCode === report.institutionCode,
  );
  const submit = async () => {
    const result = accept
      ? await repository.acceptReport(
          user,
          report.id,
          severity as Severity,
          priority as Priority,
          note || undefined,
          isLaporCepat ? rekomendasi || undefined : undefined,
        )
      : await repository.rejectReport(user, report.id, note);
    if (result.ok) {
      refreshPesantrenState();
      close();
    } else setError(result.error);
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
      {snapshot ? (
        <ReviewAnswers
          snapshot={snapshot}
          bank={bank}
          areaLabel={areaLabelMap}
          plans={plans}
        />
      ) : null}
      {decided ? null : (
        <>
          <div className="mt-4 flex gap-2">
            <button
              className={accept ? "primary-button" : "secondary-button"}
              onClick={() => {
                setAccept(true);
                setError("");
              }}
            >
              Terima
            </button>
            <button
              className={!accept ? "primary-button" : "secondary-button"}
              onClick={() => {
                setAccept(false);
                setError("");
              }}
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
          {report.reporterRecommendation?.trim() ? (
            <p className="mt-2 rounded-lg bg-strip p-3 text-sm text-secondary-text">
              Usulan rekomendasi pelapor: {report.reporterRecommendation}
            </p>
          ) : null}
          {accept ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Tingkat keparahan
                <select
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="">Pilih…</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Prioritas perbaikan
                <select
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Pilih…</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          {accept && isLaporCepat ? (
            <label className="mt-4 block text-sm font-bold">
              Rekomendasi tindakan*
              <textarea
                className="mt-1 min-h-24 w-full rounded border border-line-soft p-3 font-normal"
                value={rekomendasi}
                maxLength={500}
                placeholder="Tulis tindakan perbaikan yang tampil di rekomendasi publik."
                onChange={(e) => setRekomendasi(e.target.value)}
              />
              <span className="text-secondary-text">
                {rekomendasi.trim().length} karakter · minimal 10 · terisi awal dari usulan pelapor,
                boleh diubah total.
              </span>
            </label>
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
