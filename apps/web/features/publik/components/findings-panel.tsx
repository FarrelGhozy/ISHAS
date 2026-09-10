// Panel `Temuan yang perlu ditindaklanjuti` — WIREFRAMES.md §1 region 4.
// Kartu temuan: chip severity + status + zona/lokasi + isu + Lihat tindak lanjut →
// Nama validator TAMPIL, nama pelapor TIDAK (D-02). Hanya temuan laporan `Diterima`.

import { Link, useSearchParams } from "react-router";
import { ShieldCheck } from "lucide-react";
import type { Report, RiskFinding, User } from "~/mocks/types";
import { StatusChip } from "~/shared/components/status-chip";

export function FindingsPanel({
  institutionCode,
  findings,
  reportById,
  userById,
}: {
  institutionCode?: string;
  findings: RiskFinding[];
  reportById: Map<string, Report>;
  userById: (id: string | undefined) => User | undefined;
}) {
  const [searchParams] = useSearchParams();
  const periodeParam = searchParams.get("periode");
  const withPeriode = (url: string) => {
    if (!periodeParam) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}periode=${encodeURIComponent(periodeParam)}`;
  };
  return (
    <div className="surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-extrabold text-heading">
          Temuan yang perlu ditindaklanjuti
        </h2>
        <Link className="text-button ms-auto" to={withPeriode(`/peta-risiko${institutionCode ? `?pesantren=${encodeURIComponent(institutionCode)}` : ""}`)}>
          Buka peta bahaya →
        </Link>
      </div>
      <p className="mt-0.5 text-xs text-secondary-text">
        Peta risiko awal memakai lokasi/area pesantren, bukan peta geografis.
      </p>
      {findings.length === 0 ? (
        <p className="mt-3 text-sm text-secondary-text">
          Tidak ada temuan aktif pada konteks ini.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {findings.map((f) => {
            const report = reportById.get(f.reportId);
            const validatorName = report?.validatedByName ?? userById(report?.validatedBy)?.name;
            return (
              <div key={f.id} className="flex flex-col gap-2 rounded-lg border border-line p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusChip value={f.level} />
                  <StatusChip value={f.status} />
                </div>
                <p className="text-xs font-bold text-heading">{f.issue}</p>
                <p className="text-xs text-secondary-text">
                  {f.zone} · {f.location}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  {validatorName ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-secondary-text">
                      <ShieldCheck size={11} aria-hidden />
                      Divalidasi oleh {validatorName}
                    </span>
                  ) : (
                    <span />
                  )}
                  <Link className="text-button" to={withPeriode(`/tindak-lanjut?pesantren=${encodeURIComponent(report?.institutionCode ?? institutionCode ?? "")}`)}>
                    Lihat tindak lanjut →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
