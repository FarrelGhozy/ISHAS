'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LockKeyhole,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/shared/auth/auth-store';
import { IshasMark } from '@/shared/components/ishas-mark';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';
import {
  getWorkspacePath,
  roleMeta,
  roleNavigation,
} from '@/shared/navigation/workspace-config';

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useMockStore((state) =>
    account
      ? state.notifications.filter(
          (notification) => notification.role === account.role,
        )
      : [],
  );

  if (!account) return null;

  const activeAccount = account;
  const navigation = roleNavigation[activeAccount.role];
  const currentItem = navigation.find(
    (item) => pathname === getWorkspacePath(activeAccount.role, item.id),
  );

  function closeNavigation() {
    setMobileOpen(false);
    setAccountOpen(false);
    setNotificationsOpen(false);
  }

  function logout() {
    signOut();
    closeNavigation();
    router.replace('/login');
  }

  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus();
    });
  }

  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Lewati ke konten utama
      </a>
      {mobileOpen ? (
        <button
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <IshasMark inverse variant="compact" />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">
          <small>Ruang kerja aktif</small>
          <b>{roleMeta[activeAccount.role].workspace}</b>
          <span>{roleMeta[activeAccount.role].scope}</span>
        </div>
        <nav aria-label="Navigasi utama">
          <span className="nav-caption">Menu utama</span>
          {navigation.map(({ id, label, Icon, badge }) => {
            const href = getWorkspacePath(activeAccount.role, id);
            const active = pathname === href;
            return (
              <Link
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                key={id}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon />
                <span>{label}</span>
                {badge ? <i>{badge}</i> : null}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <ShieldCheck />
          <div>
            <b>ISHAS Prototype</b>
            <span>Data dummy · tanpa backend</span>
          </div>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu />
            </button>
            <div>
              <small>{roleMeta[activeAccount.role].workspace}</small>
              <b>{currentItem?.label ?? 'Halaman'}</b>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="notification-menu">
              <button
                className="icon-button"
                aria-label="Notifikasi"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setAccountOpen(false);
                }}
              >
                <Bell />
                {notifications.some((notification) => !notification.read) ? (
                  <i />
                ) : null}
              </button>
              {notificationsOpen ? (
                <div className="notification-popover">
                  <div className="notification-popover-head">
                    <span>
                      <b>Notifikasi</b>
                      <small>{activeAccount.roleLabel}</small>
                    </span>
                    <span className="status status-blue">
                      {
                        notifications.filter(
                          (notification) => !notification.read,
                        ).length
                      }{' '}
                      baru
                    </span>
                  </div>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        mockStoreActions.markNotificationRead(notification.id);
                        closeNavigation();
                        router.push(notification.targetPath);
                      }}
                    >
                      <i
                        className={`notification-dot notification-dot-${
                          notification.read ? 'blue' : 'amber'
                        }`}
                      />
                      <span>
                        <b>{notification.title}</b>
                        <small>{notification.message}</small>
                      </span>
                      <ArrowRight />
                    </button>
                  ))}
                  <p>Data notifikasi masih berupa simulasi lokal.</p>
                </div>
              ) : null}
            </div>
            <div className="account-menu">
              <button
                className="account-trigger"
                aria-label={`Akun aktif: ${activeAccount.name}, ${activeAccount.roleLabel}`}
                onClick={() => {
                  setAccountOpen((current) => !current);
                  setNotificationsOpen(false);
                }}
                aria-expanded={accountOpen}
              >
                <span>{activeAccount.initials}</span>
                <div>
                  <b>{activeAccount.name}</b>
                  <small>{activeAccount.roleLabel}</small>
                </div>
                <ChevronDown />
              </button>
              {accountOpen ? (
                <div className="account-popover">
                  <div>
                    <span>{activeAccount.initials}</span>
                    <p>
                      <b>{activeAccount.name}</b>
                      <small>{activeAccount.email}</small>
                    </p>
                  </div>
                  <p className="access-copy">
                    <LockKeyhole /> Akses aktif: {activeAccount.roleLabel}
                  </p>
                  <button onClick={logout}>
                    <LogOut /> Keluar dari akun
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="page-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
