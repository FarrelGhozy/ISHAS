// Halaman cetak PDF satu laporan penilaian mandiri (D-24).
// Hanya laporan Diterima yang dapat dibuka publik (D-02). Cetak via browser.

import { Link, useParams } from "react-router";
import { Printer } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import { selectPublicReports } from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

export function LaporanPdfPage() {
  const state = useMockState();
  const { id } = useParams();
  const report = selectPublicReports(state, null).find(
    (r) => r.id === id && r.channel === "penilaian-mandiri",
  );

  if (!report)
    return (
      <EmptyState
        title="Laporan tidak tersedia"
        description="Hanya laporan penilaian mandiri yang sudah Diterima yang dapat dibuka publik."
      />
    );

  const institution = state.institutions.find((i) => i.code === report.institutionCode);
  const snapshot = state.selfAssessmentSnapshots.find((s) => s.reportId === report.id);
  const temuan = state.findings.filter((f) => f.reportId === report.id);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link className="text-button" to="/laporan">
          ← Kembali ke laporan
        </Link>
        <button
          type="button"
          className="primary-button ms-auto"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Cetak / simpan PDF
        </button>
      </div>
      <article className="surface p-6">
        <p className="kicker">ISHAS · Penilaian K3L Pesantren</p>
        <h1 className="mt-1 text-2xl font-extrabold text-heading">{report.title}</h1>
        <p className="mt-1 text-sm text-secondary-text">
          {institution?.name} · {institution?.location} ·{" "}
          {new Date(report.createdAt).toLocaleDateString("id-ID")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusChip value="Diterima" />
          {report.severity !== "Belum ditentukan" ? (
            <StatusChip value={report.severity} />
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Skor penilaian</p>
            <p className="text-4xl font-extrabold text-heading">
              {report.scorePercent === undefined || report.scorePercent === null
                ? "—"
                : Math.round(report.scorePercent)}
            </p>
            <p className="text-xs text-secondary-text">dari 100 · ilustrasi</p>
          </div>
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Indikator dinilai</p>
            <p className="text-4xl font-extrabold text-heading">
              {snapshot ? Object.keys(snapshot.answers).length : 0}
            </p>
            <p className="text-xs text-secondary-text">jawaban snapshot beku</p>
          </div>
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Temuan</p>
            <p className="text-4xl font-extrabold text-heading">{temuan.length}</p>
            <p className="text-xs text-secondary-text">perlu tindak lanjut</p>
          </div>
        </div>
        {snapshot?.byDimension && Object.keys(snapshot.byDimension).length ? (
          <div className="mt-5">
            <h2 className="font-extrabold text-heading">Skor per dimensi</h2>
            <ul className="mt-2 space-y-2">
              {Object.entries(snapshot.byDimension).map(([dimId, value]) => {
                const name =
                  snapshot.frozenIndicators?.find((f) => f.dimensionId === dimId)
                    ?.dimensionName ?? dimId;
                return (
                  <li key={dimId} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 font-semibold text-heading">{name}</span>
                    <strong>{value === null ? "—" : Math.round(value)}</strong>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-strip">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.round(value ?? 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="mt-5">
          <h2 className="font-extrabold text-heading">Temuan tervalidasi</h2>
          {temuan.length ? (
            <ul className="mt-2 divide-y divide-line">
              {temuan.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <strong className="mr-auto text-heading">{item.issue}</strong>
                  <span className="text-secondary-text">{item.location}</span>
                  <StatusChip value={item.level} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-secondary-text">
              Tidak ada temuan bahaya pada penilaian ini.
            </p>
          )}
        </div>
        {report.validatedByName ? (
          <p className="mt-5 text-sm text-secondary-text">
            Divalidasi oleh {report.validatedByName}
            {report.validatedAt
              ? ` · ${new Date(report.validatedAt).toLocaleDateString("id-ID")}`
              : ""}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-faint">
          Data ilustrasi prototipe · nama pelapor, kontak, bukti, dan jawaban mentah tidak
          ditampilkan publik (D-02).
        </p>
      </article>
    </section>
  );
}
