// Route tidak dikenal — halaman ramah, bukan crash (TEST_PLAN §1).

import { Link } from "react-router";
import { EmptyState } from "~/shared/components/empty-state";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl">
      <EmptyState
        title="Halaman tidak ditemukan"
        description="Alamat yang dibuka tidak dikenal pada aplikasi ISHAS."
        action={<Link className="secondary-button" to="/">Kembali ke dashboard publik</Link>}
      />
    </section>
  );
}
