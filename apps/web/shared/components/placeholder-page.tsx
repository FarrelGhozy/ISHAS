// Halaman placeholder antar-stage: route ada, konten dibangun pada stage berikutnya.
// Selalu menyebut stage target agar tidak dianggap fitur final.

import { Link } from "react-router";
import { EmptyState } from "./empty-state";

export function PlaceholderPage({
  title,
  stage,
}: {
  title: string;
  stage: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Ruang kerja</p>
        <h1 className="text-lg font-extrabold text-heading">{title}</h1>
      </header>
      <EmptyState
        title="Halaman belum dibangun"
        description={`Luaran halaman ini dijadwalkan pada ${stage}. Rancangan lengkap ada di dokumen V2 (WIREFRAMES).`}
        action={
          <Link className="secondary-button" to="/">
            Kembali ke dashboard publik
          </Link>
        }
      />
    </section>
  );
}
