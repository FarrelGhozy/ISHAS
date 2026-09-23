// D-16: halaman kelola pustaka PDF per indikator (ruang Peneliti).
// Independen dari versioning instrumen dan penilaian mandiri.

import { InstrumentDocManager } from "../components/instrument-doc-manager";

export function Page() {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Pustaka</p>
        <h1 className="text-2xl font-extrabold text-heading">Dokumen instrumen</h1>
        <p className="text-sm text-secondary-text">
          Unggah satu PDF per indikator. Berkas Public tampil penuh di publik; berkas Privat hanya
          tampil nama. Mengganti berkas tidak mengubah soal penilaian mandiri.
        </p>
      </header>
      <InstrumentDocManager />
    </section>
  );
}
