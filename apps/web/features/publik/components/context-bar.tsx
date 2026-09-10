// Bar konteks dashboard — WIREFRAMES.md §0: pemilih pesantren + info periode + CTA.
// Ponsel: CTA pindah ke baris kedua (flex-wrap), tanpa overflow horizontal.
// URL (?pesantren=) adalah sumber kebenaran filter; satu sumber, bukan state ganda.

import { Link, useSearchParams } from "react-router";
import { ClipboardCheck, Plus } from "lucide-react";
import type { Institution } from "~/mocks/types";
import { PERIODE_BERJALAN } from "~/mocks/processors/dashboard-aggregate";

export function ContextBar({
  registered,
  lockedInstitutionCode,
  lockedName,
}: {
  registered: Institution[];
  lockedInstitutionCode?: string;
  lockedName?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCode = lockedInstitutionCode ?? searchParams.get("pesantren");
  const periodeParam = searchParams.get("periode");
  const queryParts: string[] = [];
  if (selectedCode && registered.some((i) => i.code === selectedCode)) {
    queryParts.push(`pesantren=${encodeURIComponent(selectedCode)}`);
  }
  if (periodeParam) queryParts.push(`periode=${encodeURIComponent(periodeParam)}`);
  const query = queryParts.length ? `?${queryParts.join("&")}` : "";
  const adaTerdaftar = registered.length > 0;

  return (
    <div className="surface flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <div className="flex min-w-0 w-full flex-col items-start gap-2 text-sm sm:w-auto sm:flex-row sm:items-center font-bold text-secondary-text">
        <label htmlFor="dashboard-pesantren" className="shrink-0">Pesantren</label>
        {lockedInstitutionCode ? (
          <span className="rounded-[4px] bg-strip px-2 py-1 text-xs text-heading">
            {lockedInstitutionCode} — {lockedName}
          </span>
        ) : (
          <select
            id="dashboard-pesantren"
            className="min-h-11 w-full min-w-0 max-w-full sm:w-72 rounded-[7px] border border-line-soft bg-white px-2 py-1.5 text-sm font-semibold text-heading"
            value={searchParams.get("pesantren") ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              const next = new URLSearchParams(searchParams);
              if (v) next.set("pesantren", v); else next.delete("pesantren");
              setSearchParams(next);
            }}
          >
            <option value="">Semua pesantren terdaftar</option>
            {registered.map((i) => (
              <option key={i.code} value={i.code}>
                {i.code} — {i.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <span className="text-xs font-semibold text-secondary-text">
        Periode hasil: {periodeParam || PERIODE_BERJALAN} · ilustrasi
      </span>
      <div className="flex w-full flex-wrap items-center gap-2 sm:ms-auto sm:w-auto">
        {!adaTerdaftar ? (
          <p className="w-full text-xs font-semibold text-secondary-text sm:w-auto sm:max-w-56">
            Pendaftaran oleh Super Admin — laporan dinonaktifkan sampai ada pesantren terdaftar.
          </p>
        ) : null}
        <Link
          className="primary-button"
          to={`/lapor${query}`}
          aria-disabled={!adaTerdaftar}
          aria-describedby={adaTerdaftar ? undefined : "alasan-lapor-nonaktif"}
          onClick={(e) => {
            if (!adaTerdaftar) e.preventDefault();
          }}
        >
          <Plus size={15} aria-hidden />
          Laporkan temuan
        </Link>
        <Link
          className="secondary-button"
          to={`/penilaian-mandiri${query}`}
          aria-disabled={!adaTerdaftar}
          aria-describedby={adaTerdaftar ? undefined : "alasan-lapor-nonaktif"}
          onClick={(e) => {
            if (!adaTerdaftar) e.preventDefault();
          }}
        >
          <ClipboardCheck size={13} aria-hidden />
          Penilaian mandiri
        </Link>
        {!adaTerdaftar ? (
          <span id="alasan-lapor-nonaktif" className="sr-only">
            Tidak dapat melapor karena belum ada pesantren terdaftar.
          </span>
        ) : null}
      </div>
    </div>
  );
}
