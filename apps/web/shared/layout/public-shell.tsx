// Shell publik ringan — docs ROUTES.md §4 dan WIREFRAMES.md §0.
// Header: logo ISHAS + subteks | penanda `Data publik · ilustrasi` | Masuk / identitas + Ruang kerja.
// Sesi login TIDAK mengubah isi halaman publik (aturan `/`).

import { Outlet } from "react-router";
import { Link, useNavigate } from "react-router";
import { ShieldCheck } from "lucide-react";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { workspaceHome } from "~/shared/auth/access-policy";
import { IshasMark } from "~/shared/components/ishas-mark";
import { StatusChip } from "~/shared/components/status-chip";

export default function PublicLayout() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col">
      <a className="skip-link primary-button" href="#main-content">Lewati ke konten</a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" aria-label="ISHAS — beranda">
            <IshasMark />
          </Link>
          <div className="ms-auto flex min-w-0 flex-wrap items-center gap-2">
            <StatusChip value="Data publik · ilustrasi" />
            {user ? (
              <>
                <span className="flex items-center gap-2 rounded-full border border-line bg-strip px-2 py-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                    {user.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-bold text-heading">{user.name}</span>
                    <span className="block text-xs font-semibold text-secondary-text">
                      {user.role}
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate(workspaceHome(user.roleId))}
                >
                  <ShieldCheck size={13} aria-hidden />
                  Ruang kerja
                </button>
              </>
            ) : (
              <Link className="secondary-button" to="/login">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-line py-4 text-center text-xs font-semibold text-secondary-text">
        ISHAS · prototipe frontend · seluruh angka adalah data ilustrasi
      </footer>
    </div>
  );
}
