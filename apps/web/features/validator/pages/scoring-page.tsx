// Audit skor beku tiap snapshot (D-24, D-25).
// Hanya laporan Diterima yang masuk indeks publik; keputusan moderasi milik
// akun Pesantren, Validator hanya audit.

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { skorSnapshot } from "~/mocks/processors/dashboard-aggregate";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

export function Page() {
  const state = useMockState();
  const [query, setQuery] = useState("");
  const [institution, setInstitution] = useState("Semua terdaftar");
  const [status, setStatus] = useState("Semua");

  const registered = useMemo(
    () => selectRegisteredInstitutions(state),
    [state],
  );
  const registeredCodes = useMemo(
    () => new Set(registered.map((x) => x.code)),
    [registered],
  );

  const namaDimensi = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of state.instrument?.dimensions ?? []) {
      map.set(d.id, d.name);
    }
    for (const v of state.instrumentVersions ?? []) {
      for (const d of v.dimensions ?? []) {
        if (!map.has(d.id)) {
          map.set(d.id, d.name);
        }
      }
    }
    for (const s of state.selfAssessmentSnapshots ?? []) {
      for (const f of s.frozenIndicators ?? []) {
        if (!map.has(f.dimensionId)) {
          map.set(f.dimensionId, f.dimensionName);
        }
      }
    }
    return map;
  }, [state]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (state.selfAssessmentSnapshots ?? [])
      .map((s) => {
        const report = state.reports.find((r) => r.id === s.reportId);
        const inst = state.institutions.find(
          (i) => i.code === report?.institutionCode,
        );
        const score = skorSnapshot(state.instrumentVersions, s);
        const beku = Boolean(s.frozenIndicators && s.scorePercent !== undefined);
        return { snapshot: s, report, inst, score, beku };
      })
      .filter(({ report, inst }) => {
        if (!report) {
          return false;
        }
        if (institution === "Semua terdaftar") {
          if (!registeredCodes.has(report.institutionCode)) {
            return false;
          }
        } else if (report.institutionCode !== institution) {
          return false;
        }
        if (status !== "Semua" && report.validationStatus !== status) {
          return false;
        }
        if (!q) {
          return true;
        }
        return `${report.id} ${report.title} ${inst?.name ?? ""}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) =>
        (b.snapshot.submittedAt ?? "").localeCompare(a.snapshot.submittedAt ?? ""),
      );
  }, [state, query, institution, status, registeredCodes]);

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Analisis</p>
        <h1 className="text-2xl font-extrabold text-heading">Scoring</h1>
        <p className="text-sm text-secondary-text">
          Skor % dibekukan saat kirim dari bobot bank. Hanya laporan Diterima
          yang masuk indeks publik.
        </p>
      </header>
      <div className="scope-banner">
        Aturan ilustrasi: skor tiap opsi 0–100 sesuai bobot bank; N/A tidak
        dihitung. Keputusan Terima/Tolak milik akun Pesantren; Validator hanya
        audit.
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Cari skor"
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
          aria-label="Filter validasi"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Semua</option>
          <option>Diterima</option>
          <option>Menunggu validasi</option>
          <option>Ditolak</option>
        </select>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Skor tidak ditemukan"
          description="Sesuaikan pencarian atau filter pesantren dan status validasi."
        />
      ) : (
        <>
          <div className="surface hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-strip text-xs text-secondary-text">
                <tr>
                  <th className="p-3">Laporan</th>
                  <th className="p-3">Pesantren</th>
                  <th className="p-3">Skor %</th>
                  <th className="p-3">Validasi</th>
                  <th className="p-3">Dimensi</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ snapshot, report, inst, score, beku }) => (
                  <tr key={snapshot.reportId}>
                    <td className="p-3 font-bold text-heading">
                      {snapshot.reportId}
                    </td>
                    <td className="p-3">
                      {inst?.name ?? "—"}
                    </td>
                    <td className="p-3 text-right text-lg font-extrabold">
                      {score.index === null ? "—" : Math.round(score.index)}
                    </td>
                    <td className="p-3">
                      <StatusChip
                        value={report?.validationStatus ?? "Tidak diketahui"}
                      />
                    </td>
                    <td className="p-3 text-xs text-secondary-text">
                      {Object.entries(score.byDimension)
                        .map(
                          ([id, value]) =>
                            `${namaDimensi.get(id) ?? id}: ${
                              value === null ? "—" : Math.round(value)
                            }`,
                        )
                        .join(" · ")}
                      {!beku ? " · warisan INS-v1.x" : ""}
                    </td>
                    <td className="p-3 text-xs">
                      {report?.validationStatus === "Diterima" ? (
                        <Link
                          className="text-button"
                          to={`/laporan/${report.id}`}
                        >
                          Lihat PDF
                        </Link>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {rows.map(({ snapshot, report, inst, score, beku }) => (
              <article className="surface p-4 text-sm" key={snapshot.reportId}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="mr-auto text-heading">
                    {snapshot.reportId}
                  </strong>
                  <StatusChip
                    value={report?.validationStatus ?? "Tidak diketahui"}
                  />
                </div>
                <p className="mt-1 text-xs text-secondary-text">
                  {inst?.name ?? "—"}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-heading">
                  {score.index === null ? "—" : Math.round(score.index)}
                  <span className="ml-1 text-xs font-normal text-faint">%</span>
                </p>
                <p className="mt-1 text-xs text-secondary-text">
                  {Object.entries(score.byDimension)
                    .map(
                      ([id, value]) =>
                        `${namaDimensi.get(id) ?? id}: ${
                          value === null ? "—" : Math.round(value)
                        }`,
                    )
                    .join(" · ")}
                  {!beku ? " · warisan INS-v1.x" : ""}
                </p>
                {report?.validationStatus === "Diterima" ? (
                  <Link
                    className="text-button mt-2 inline-block"
                    to={`/laporan/${report.id}`}
                  >
                    Lihat PDF →
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
