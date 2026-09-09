import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Bell, BriefcaseBusiness, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { sessionStore, useSession } from "~/shared/auth/session";
import { resolveWorkspaceAccess, workspaceRoleFor } from "~/shared/auth/access-policy";
import { IshasMark } from "~/shared/components/ishas-mark";
import { Modal } from "~/shared/components/modal";
import { ROLE_NAVIGATION } from "~/shared/navigation/workspace-config";
import { useMockState } from "~/mocks/store/mock-store";

export default function WorkspaceLayout() {
  const location = useLocation();
  const session = useSession();
  const user = useCurrentUser();
  const state = useMockState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMobileOpen(false); setNotifOpen(false); setProfileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setProfileOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const close = () => { if (media.matches) setMobileOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  const expectedRole = workspaceRoleFor(location.pathname);
  const access = resolveWorkspaceAccess(location.pathname, session, user?.roleId ?? null);
  if (access === "login") return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
  if (access === "denied" || !user || !expectedRole) return <Navigate to="/akses-ditolak" replace />;
  const notifications = state.notifications.filter((n) => n.recipientAccountId === user.id);
  const navigation = <nav aria-label="Menu ruang kerja" className="space-y-1 p-3">
    {ROLE_NAVIGATION[expectedRole].map((item) => {
      const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
      const Icon = item.icon;
      return <Link key={item.path} to={item.path} aria-current={active ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-primary text-white" : "text-secondary-text hover:bg-strip"}`}>
        <Icon size={18} aria-hidden />{item.label}
      </Link>;
    })}
    <Link to="/" className="secondary-button mt-4 w-full">Dashboard publik</Link>
  </nav>;

  return <div className="flex min-h-dvh">
    <a className="skip-link primary-button" href="#main-content">Lewati ke konten</a>
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-line bg-white lg:block">
      <div className="border-b border-line px-4 py-4"><IshasMark variant="compact" /></div>
      {navigation}
      <p className="border-t border-line p-4 text-xs text-secondary-text">Data ilustrasi · prototipe frontend</p>
    </aside>
    <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} label="Menu ruang kerja">
      <div className="flex items-center justify-between gap-3"><IshasMark variant="compact" />
        <button type="button" className="secondary-button px-3" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={20} /></button>
      </div>{navigation}
    </Modal>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex min-h-[68px] items-center gap-2 border-b border-line bg-white px-3 py-2 sm:px-4">
        <button type="button" className="secondary-button px-3 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu" aria-haspopup="dialog"><Menu size={20} /></button>
        <span className="hidden text-sm font-bold text-secondary-text xl:block">{user.role}</span>
        <div className="ms-auto flex min-w-0 items-stretch gap-2">
          <button type="button" className="secondary-button shrink-0 px-3" onClick={() => setNotifOpen(true)} aria-haspopup="dialog"
            aria-label={`Notifikasi (${notifications.filter((n) => !n.read).length} belum dibaca)`}><Bell size={18} /><span>{notifications.filter((n) => !n.read).length}</span></button>
          <div ref={profileRef} className="relative min-w-0">
            <button type="button" className="flex min-h-11 min-w-0 items-center gap-2 rounded-[7px] border border-line-soft bg-white px-2 text-left hover:bg-strip sm:min-w-56" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-marun-bg text-xs font-extrabold text-primary">{user.initials}</span>
              <span className="hidden min-w-0 flex-1 text-xs leading-snug sm:block"><strong className="block truncate text-heading">{user.name}</strong><span className="block truncate text-secondary-text">{user.role}</span></span>
              <ChevronDown size={15} className={`hidden shrink-0 text-faint transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {profileOpen ? <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(270px,calc(100vw-24px))] overflow-hidden rounded-lg border border-line-soft bg-white shadow-lg">
              <div className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-marun-bg text-xs font-extrabold text-primary">{user.initials}</span>
                <span className="min-w-0 text-xs leading-relaxed"><strong className="block truncate text-heading">{user.name}</strong><span className="block truncate text-secondary-text">{user.email}</span></span>
              </div>
              <div className="flex items-center gap-2 border-y border-line bg-strip px-4 py-3 text-xs text-secondary-text"><BriefcaseBusiness size={14} className="text-primary" aria-hidden />Akses aktif: {user.role}</div>
              <button type="button" role="menuitem" className="flex min-h-14 w-full items-center gap-2 px-4 text-left text-xs font-bold text-[#b91c1c] hover:bg-[#fff7f8]" onClick={() => {
                try { sessionStore.logout(); window.location.assign("/"); }
                catch { setError("Sesi tidak dapat dihapus. Periksa izin penyimpanan browser lalu coba lagi."); }
              }}><LogOut size={15} aria-hidden />Keluar dari akun</button>
            </div> : null}
          </div>
        </div>
      </header>
      {error ? <p role="alert" className="p-4 text-sm text-[#b91c1c]">{error}</p> : null}
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 lg:px-6"><Outlet /></main>
    </div>
    <Modal open={notifOpen} onClose={() => setNotifOpen(false)} label="Notifikasi">
      <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-heading">Notifikasi</h2>
        <button className="secondary-button px-3" onClick={() => setNotifOpen(false)} aria-label="Tutup notifikasi"><X size={20} /></button></div>
      {notifications.length === 0 ? <p className="py-4 text-sm text-secondary-text">Belum ada notifikasi.</p> :
        <ul className="mt-3 divide-y divide-line">{notifications.map((n) => <li key={n.id}>
          <Link to={n.targetUrl} onClick={() => setNotifOpen(false)} className="block rounded-lg px-2 py-3 text-sm hover:bg-strip">
            <span className="block font-semibold text-heading">{n.message}</span>
            <span className="text-xs text-secondary-text">{new Date(n.at).toLocaleString("id-ID")}</span>
          </Link></li>)}</ul>}
    </Modal>
  </div>;
}
