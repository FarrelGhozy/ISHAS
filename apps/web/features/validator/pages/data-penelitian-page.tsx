// Dataset penelitian D-25 — provenance penuh + filter terdaftar +
// ekspor whitelist D-02 + impor aman (→ Menunggu validasi).

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import {
  buildResearchRows,
  researchToCSV,
  researchToJSON,
} from "~/mocks/research-export";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { PanelImpor } from "../components/research-import-panel";

function unduh(nama: string, isi: string, tipe: string): void {
  const blob = new Blob([isi], { type: tipe });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function Page() {
  const state = useMockState();
  const [query, setQuery] = useState("");
  const [institution, setInstitution] = useState("Semua terdaftar");
  const [status, setStatus] = useState("Semua");
  const [sertakanNon, setSertakanNon] = useState(false);

  const registered = useMemo(
    () => selectRegisteredInstitutions(state),
    [state],
  );
  const semuaBaris = useMemo(() => buildResearchRows(state), [state]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return semuaBaris.filter((x) => {
      if (institution === "Semua terdaftar") {
        if (!x.institutionRegistered && !sertakanNon) {
          return false;
        }
      } else if (x.institutionCode !== institution) {
        return false;
      }
      if (status !== "Semua" && x.validationStatus !== status) {
        return false;
      }
      if (!q) {
        return true;
      }
      return `${x.reportId} ${x.institutionName} ${x.validatorPesantren}`
        .toLowerCase()
        .includes(q);
    });
  }, [semuaBaris, query, institution, status, sertakanNon]);

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Dataset</p>
        <h1 className="text-2xl font-extrabold text-heading">Data penelitian</h1>
        <p className="text-sm text-secondary-text">
          Katalog snapshot penilaian mandiri beserta provenance dan status
          validasinya.
        </p>
      </header>
      <div className="scope-banner">
        Data internal audit. Nama penilai hanya untuk audit Validator dan tidak
        pernah tampil publik. Ekspor memakai ringkasan whitelist D-02.
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Cari data"
          className="min-h-11 min-w-60 flex-1 rounded border border-line-soft px-3"
          placeholder="Cari ID, lembaga, atau validator…"
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
          {sertakanNon
            ? state.institutions
                .filter((x) => !registered.some((r) => r.code === x.code))
                .map((x) => (
                  <option value={x.code} key={x.code}>
                    {x.name} ({x.status})
                  </option>
                ))
            : null}
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
        <label className="flex min-h-11 items-center gap-2 text-xs font-bold">
          <input
            type="checkbox"
            checked={sertakanNon}
            onChange={(e) => setSertakanNon(e.target.checked)}
          />
          Sertakan non-terdaftar
        </label>
      </div>
      <div className="surface flex flex-wrap items-center gap-2 p-3 text-xs">
        <span className="mr-auto text-secondary-text">
          {rows.length} baris · ekspor whitelist D-02
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => unduh("dataset-penelitian.csv", researchToCSV(rows), "text/csv")}
        >
          Unduh CSV
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            unduh("dataset-penelitian.json", researchToJSON(rows), "application/json")
          }
        >
          Unduh JSON
        </button>
      </div>
      {rows.length ? (
        <div className="surface divide-y divide-line">
          {rows.map((x) => (
            <article className="flex flex-wrap items-center gap-3 p-4 text-sm" key={x.reportId}>
              <div className="mr-auto min-w-60 flex-1">
                <strong className="text-heading">
                  {x.reportId} · {x.institutionName}
                </strong>
                {!x.institutionRegistered ? (
                  <span className="status status-amber ml-2">Non-terdaftar · audit</span>
                ) : null}
                <p className="text-xs text-secondary-text">
                  Validator Pesantren: {x.validatorPesantren} · {x.validatedAt}
                </p>
                <p className="text-xs text-faint">
                  {x.submittedAt} · {x.answerCount}/{x.expectedCount} jawaban ·{" "}
                  {x.scorePercent === null
                    ? "tanpa skor"
                    : `skor ${Math.round(x.scorePercent)}%`} ·{" "}
                  {x.pdfTersedia ? "PDF tersedia" : "tanpa PDF"} ·{" "}
                  {x.warisan ? "warisan" : x.checksumCocok ? "checksum cocok" : "bank berubah"}
                </p>
              </div>
              <StatusChip value={x.validationStatus} />
              <span className="flex gap-2 text-xs">
                {x.validationStatus === "Diterima" ? (
                  <Link className="text-button" to={`/laporan/${x.reportId}`}>
                    PDF
                  </Link>
                ) : null}
                <Link className="text-button" to="/validator/scoring">
                  Skor
                </Link>
              </span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Data tidak ditemukan"
          description="Sesuaikan pencarian, filter pesantren, atau matikan toggle non-terdaftar."
        />
      )}
      <PanelImpor terdaftar={registered.map((x) => x.code)} />
    </section>
  );
}
