// Shell publik ringan — docs ROUTES.md §4 dan WIREFRAMES.md §0.
// Header: logo ISHAS + subteks | penanda `Data publik · ilustrasi` | Masuk / identitas + Ruang kerja.
// Sesi login TIDAK mengubah isi halaman publik (aturan `/`).

import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Link, useNavigate } from "react-router";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { workspaceHome } from "~/shared/auth/access-policy";
import { IshasMark } from "~/shared/components/ishas-mark";
import { StatusChip } from "~/shared/components/status-chip";
import { PublicNavigation } from "~/shared/navigation/public-navigation";
import { Modal } from "~/shared/components/modal";

export default function PublicLayout() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const close = () => { if (media.matches) setMobileOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <a className="skip-link primary-button" href="#main-content">Lewati ke konten</a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-line bg-white lg:block">
        <div className="border-b border-line px-4 py-4"><Link to="/" aria-label="ISHAS — beranda"><IshasMark variant="compact" /></Link></div>
        <PublicNavigation />
        <p className="border-t border-line p-4 text-xs text-secondary-text">Data ilustrasi · prototipe frontend</p>
      </aside>
      <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} label="Menu publik">
        <div className="flex items-center justify-between gap-3"><IshasMark variant="compact" />
          <button type="button" className="secondary-button px-3" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={20} aria-hidden /></button>
        </div>
        <PublicNavigation onNavigate={() => setMobileOpen(false)} />
      </Modal>
      <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex min-h-[68px] flex-wrap items-center gap-2 border-b border-line bg-white px-3 py-2 sm:px-4">
          <button type="button" className="secondary-button px-3 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu" aria-haspopup="dialog"><Menu size={20} aria-hidden /></button>
          <span className="hidden text-sm font-bold text-secondary-text xl:block">Publik / Pelapor</span>
          <div className="ms-auto flex min-w-0 flex-wrap items-center gap-2">
            <StatusChip value="Data publik · ilustrasi" />
            {user ? (
              <>
                <span className="flex min-h-11 min-w-0 items-center gap-2 rounded-[7px] border border-line-soft bg-white px-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-marun-bg text-xs font-extrabold text-primary">
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
      </header>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      <footer className="border-t border-line py-4 text-center text-xs font-semibold text-secondary-text">
        ISHAS · prototipe frontend · seluruh angka adalah data ilustrasi
      </footer>
      </div>
    </div>
  );
}
