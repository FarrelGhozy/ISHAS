// Route `/asesor/*` — pesan penghentian peran (penyebutan historis diperlukan dan diperbolehkan).
// Pada aplikasi baru route ini hanya berlaku bila seseorang membuka URL lama dari riwayat browser.

import { Link } from "react-router";
import { EmptyState } from "~/shared/components/empty-state";

export function AsesorDeprecatedPage() {
  return (
    <section className="mx-auto max-w-xl">
      <EmptyState
        title="Peran Asesor sudah dihapus pada V2"
        description="Gunakan Penilaian Mandiri untuk mengisi instrumen tanpa penugasan."
        action={<Link className="primary-button" to="/penilaian-mandiri">Ke Penilaian Mandiri</Link>}
      />
    </section>
  );
}
