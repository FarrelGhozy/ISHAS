// D-16: halaman publik /dokumen — pustaka PDF per indikator (global).

import { PublicInstrumentDocs } from "../components/public-instrument-docs";
import { StatusChip } from "~/shared/components/status-chip";

export function DokumenPage() {
  return (
    <section className="flex min-w-0 flex-col gap-5">
      <div>
        <p className="kicker">Pustaka</p>
        <h1 className="text-2xl font-extrabold text-heading">Dokumen detail indikator</h1>
        <p className="mt-1 max-w-3xl text-sm text-secondary-text">
          Penjelasan PDF per indikator instrumen. Berkas Public dapat dilihat dan diunduh; berkas
          Privat hanya tampil nama.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip value="Data publik · ilustrasi" />
      </div>
      <PublicInstrumentDocs />
    </section>
  );
}
