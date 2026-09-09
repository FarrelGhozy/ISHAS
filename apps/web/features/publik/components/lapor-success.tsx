// Layar sukses lapor-cepat — persis WIREFRAMES §2: ikon centang + `Laporan terkirim` +
// nomor RPT-XXXX + chip Menunggu validasi + penjelasan belum tampil + tombol kembali.

import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { StatusChip } from "~/shared/components/status-chip";

export function LaporSuccess({
  reportId,
  onReportAnother,
}: {
  reportId: string;
  onReportAnother: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return (
    <section className="surface mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-6 py-12 text-center">
      <CheckCircle2 size={40} className="text-[#047857]" aria-hidden />
      <h1 ref={heading} tabIndex={-1} className="text-xl font-extrabold text-heading">Laporan terkirim</h1>
      <p className="text-sm font-extrabold text-primary">{reportId}</p>
      <StatusChip value="Menunggu validasi" />
      <p className="max-w-md text-sm text-secondary-text">
        Belum tampil di dashboard sebelum divalidasi.
      </p>
      <p className="max-w-md text-sm text-secondary-text">
        Laporan Anda belum tampil di dashboard; menunggu validasi pengelola pondok.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Link className="secondary-button" to="/">
          Kembali ke dashboard
        </Link>
        <button type="button" className="text-button" onClick={onReportAnother}>
          Kirim laporan lain
        </button>
      </div>
    </section>
  );
}
