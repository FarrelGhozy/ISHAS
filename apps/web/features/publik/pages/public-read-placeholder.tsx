// Placeholder halaman baca publik — konten final dibangun di V2-04 dengan filter pesantren
// dan bidang sesuai D-02 (ringkasan saja + nama validator/PIC).

import { Link } from "react-router";
import { EmptyState } from "~/shared/components/empty-state";

export function PublicReadPlaceholder({ title, stage }: { title: string; stage: string }) {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Data publik</p>
        <h1 className="text-xl font-extrabold text-heading">{title}</h1>
      </header>
      <EmptyState
        title="Halaman dibangun di V2-04"
        description={`Rancangan lengkap halaman ini ada di dokumen WIREFRAMES; hanya data Diterima yang tampil (${stage}).`}
        action={<Link className="secondary-button" to="/">Kembali ke dashboard</Link>}
      />
    </section>
  );
}
