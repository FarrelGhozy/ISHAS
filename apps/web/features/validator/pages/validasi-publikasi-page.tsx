// Audit publikasi D-25 (route lama /validator/validasi-publikasi tetap).
// Checklist 5 kriteria kesiapan snapshot; tanpa tombol Terima/Tolak.

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { nilaiKesiapan } from "../audit-kesiapan";

export function Page() {
  const state = useMockState();
  const [query, setQuery] = useState("");
  const [institution, setInstitution] = useState("Semua terdaftar");
  const [kelengkapan, setKelengkapan] = useState("Semua");

  const registered = useMemo(
    () => selectRegisteredInstitutions(state),
    [state],
  );
  const registeredCodes = useMemo(
    () => new Set(registered.map((x) => x.code)),
    [registered],
  );
  const bankCount = useMemo(
    () =>
      (state.instrument?.dimensions ?? []).reduce(
        (n, d) => n + d.indicators.length,
        0,
      ),
    [state],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.reports
      .filter((x) => x.channel === "penilaian-mandiri")
      .map((x) => {
        const snapshot = state.selfAssessmentSnapshots.find(
          (s) => s.reportId === x.id,
        );
        const siap = nilaiKesiapan(
          snapshot,
          x,
          state.instrument?.checksum,
          bankCount,
        );
        const inst = state.institutions.find(
          (i) => i.code === x.institutionCode,
        );
        return { report: x, snapshot, siap, inst };
      })
      .filter(({ report, siap }) => {
        if (institution === "Semua terdaftar") {
          if (!registeredCodes.has(report.institutionCode)) {
            return false;
          }
        } else if (report.institutionCode !== institution) {
          return false;
        }
        if (kelengkapan === "Lengkap" && !siap.lengkap) {
          return false;
        }
        if (kelengkapan === "Tidak lengkap" && siap.lengkap) {
          return false;
        }
        if (kelengkapan === "Layak publik" && !siap.layak) {
          return false;
        }
        if (!q) {
          return true;
        }
        return `${report.id} ${report.title}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.report.createdAt.localeCompare(a.report.createdAt));
  }, [state, query, institution, kelengkapan, registeredCodes, bankCount]);

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Kualitas data</p>
        <h1 className="text-2xl font-extrabold text-heading">Audit publikasi</h1>
        <p className="text-sm text-secondary-text">
          Pantau kelengkapan snapshot dan kelayakannya sebagai sumber hasil
          publik.
        </p>
      </header>
      <div className="scope-banner">
        Keputusan menerima atau menolak laporan tetap berada pada akun
        Pesantren sesuai lingkup lembaga. Validator mengaudit kesiapan
        publikasi.
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Cari audit"
          className="min-h-11 min-w-60 flex-1 rounded border border-line-soft px-3"
          placeholder="Cari ID atau judul laporan…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter pesantren"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        >
          <option>Semua terdaftar</option>
          {registered.map((x) => (
            <option value={x.code} key={x.code}>
              {x.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter kelengkapan"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={kelengkapan}
          onChange={(e) => setKelengkapan(e.target.value)}
        >
          <option>Semua</option>
          <option>Lengkap</option>
          <option>Tidak lengkap</option>
          <option>Layak publik</option>
        </select>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Tidak ada snapshot"
          description="Sesuaikan pencarian, filter pesantren, atau kelengkapan."
        />
      ) : (
        <div className="surface divide-y divide-line">
          {rows.map(({ report, siap, inst }) => (
            <article
              className="flex flex-wrap items-center gap-3 p-4"
              key={report.id}
            >
              <div className="mr-auto min-w-60 flex-1">
                <strong className="text-heading">
                  {report.id} · {inst?.name ?? report.institutionCode}
                </strong>
                <p className="text-xs text-secondary-text">
                  Bank live · {siap.answered}/{siap.expected} jawaban terisi
                  {report.scorePercent !== undefined &&
                  report.scorePercent !== null
                    ? ` · skor ${Math.round(report.scorePercent)}%`
                    : ""}
                  {report.pdfGeneratedAt ? " · PDF tersedia" : ""}
                  {siap.warisan ? " · warisan INS-v1.x" : ""}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <li
                    className={`status ${siap.lengkap ? "status-green" : "status-red"}`}
                  >
                    {siap.lengkap ? "✓" : "✗"} Lengkap
                  </li>
                  <li
                    className={`status ${siap.diterima ? "status-green" : "status-neutral"}`}
                  >
                    {siap.diterima ? "✓" : "✗"} Diterima Pesantren
                  </li>
                  <li
                    className={`status ${siap.skorAda ? "status-green" : "status-red"}`}
                  >
                    {siap.skorAda ? "✓" : "✗"} Skor
                  </li>
                  <li
                    className={`status ${siap.pdfAda ? "status-green" : "status-neutral"}`}
                  >
                    {siap.pdfAda ? "✓" : "✗"} PDF
                  </li>
                  <li
                    className={`status ${siap.checksumCocok ? "status-green" : "status-amber"}`}
                  >
                    {siap.checksumCocok ? "✓" : "✗"} Checksum bank
                  </li>
                </ul>
                <p className="mt-1 text-xs text-faint">
                  {siap.layak
                    ? "Layak menjadi sumber publik"
                    : "Belum menjadi sumber publik"}
                </p>
              </div>
              <StatusChip value={report.validationStatus} />
              <span
                className={`status ${siap.lengkap ? "status-green" : "status-red"}`}
              >
                {siap.lengkap ? "Lengkap" : "Tidak lengkap"}
              </span>
              <span className="flex flex-wrap gap-2 text-xs">
                {report.validationStatus === "Diterima" ? (
                  <Link className="text-button" to={`/laporan/${report.id}`}>
                    PDF
                  </Link>
                ) : null}
                <Link className="text-button" to="/validator/scoring">
                  Scoring
                </Link>
                <Link className="text-button" to="/validator/data-penelitian">
                  Dataset
                </Link>
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
