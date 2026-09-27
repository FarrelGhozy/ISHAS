// Daftar PDF laporan penilaian mandiri (D-24): satu penilai = satu PDF.
// PDF dibuat saat kirim; tampil publik setelah Diterima. Cetak via browser.

import { Link } from "react-router";
import { FileText } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import { StatusChip } from "~/shared/components/status-chip";

export function LaporanPdfList({
  reports,
}: {
  reports: ReturnType<typeof useMockState>["reports"];
}) {
  const state = useMockState();
  const items = reports.filter((r) => r.channel === "penilaian-mandiri");
  if (!items.length)
    return (
      <p className="rounded-md bg-strip p-3 text-sm text-secondary-text">
        Belum ada laporan PDF penilaian mandiri pada konteks ini.
      </p>
    );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((report) => {
        const institution = state.institutions.find((i) => i.code === report.institutionCode);
        return (
          <div key={report.id} className="rounded-lg border border-line p-3">
            <div className="flex flex-wrap gap-2">
              <StatusChip value="Diterima" />
              <StatusChip value="penilaian-mandiri" />
            </div>
            <p className="mt-2 font-bold text-heading">{report.title}</p>
            <p className="mt-1 text-sm text-secondary-text">
              {institution?.name ?? report.institutionCode} ·{" "}
              {new Date(report.createdAt).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
              {report.scorePercent !== undefined && report.scorePercent !== null
                ? ` · skor ${Math.round(report.scorePercent)}%`
                : ""}
            </p>
            {report.validatedByName ? (
              <p className="mt-1 text-sm text-secondary-text">
                Divalidasi oleh {report.validatedByName}
              </p>
            ) : null}
            <Link
              className="text-button mt-3 inline-flex items-center gap-1"
              to={`/laporan/${report.id}`}
            >
              <FileText size={14} />
              Lihat PDF laporan
            </Link>
          </div>
        );
      })}
    </div>
  );
}
