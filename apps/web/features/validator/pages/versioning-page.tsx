// Versioning dihapus (D-24). Berkas dipertahankan agar route lama tidak 404;
// pengelolaan instrumen pindah ke Bank instrumen.

import { Link } from "react-router";

export function Page() {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Metodologi</p>
        <h1 className="text-2xl font-extrabold text-heading">Versioning dihapus</h1>
        <p className="text-sm text-secondary-text">
          Sejak D-24 instrumen memakai satu bank live tanpa Draft/Published/Archived.
          Kelola soal, tipe jawaban, dan bobot langsung di Bank instrumen.
        </p>
      </header>
      <div className="surface flex flex-wrap gap-3 p-4">
        <Link className="text-button" to="/validator/instrumen">
          Buka Bank instrumen
        </Link>
        <Link className="text-button" to="/validator/scoring">
          Buka Scoring
        </Link>
        <Link className="text-button" to="/validator/validasi-publikasi">
          Buka Audit publikasi
        </Link>
      </div>
    </section>
  );
}
