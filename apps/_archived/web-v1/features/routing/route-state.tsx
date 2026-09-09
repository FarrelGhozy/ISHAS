'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { WorkspaceContent } from '@/features/routing/workspace-content';
import { resolveWorkspaceAccess } from '@/features/routing/access-policy';
import { useAuthStore } from '@/shared/auth/auth-store';
import { isRoleId, type RoleId } from '@/shared/auth/demo-accounts';
import { IshasMark } from '@/shared/components/ishas-mark';
import {
  getNavigationItem,
  getWorkspacePath,
} from '@/shared/navigation/workspace-config';

function LoadingState({ title = 'Memulihkan sesi' }: { title?: string }) {
  return (
    <div className="route-loading-state">
      <DataState
        variant="loading"
        title={title}
        description="Menyiapkan halaman sesuai akses akun Anda."
      />
    </div>
  );
}

export function RoleIndexRedirect() {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const { account, ready } = useAuthStore();
  const routeRole = String(params.role ?? '');

  useEffect(() => {
    if (!ready) return;
    if (!account) {
      router.replace('/login');
      return;
    }
    if (!isRoleId(routeRole) || account.role !== routeRole) {
      router.replace('/akses-ditolak');
      return;
    }
    router.replace(getWorkspacePath(routeRole));
  }, [account, ready, routeRole, router]);

  return <LoadingState title="Membuka dashboard" />;
}

export function WorkspaceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const { account, ready } = useAuthStore();
  const routeRole = String(params.role ?? '');
  const decision = resolveWorkspaceAccess(
    ready,
    account?.role ?? null,
    routeRole,
  );

  useEffect(() => {
    if (decision === 'loading' || decision === 'allowed') return;
    if (decision === 'login') {
      router.replace('/login');
      return;
    }
    router.replace('/akses-ditolak');
  }, [decision, router]);

  if (decision !== 'allowed') {
    return <LoadingState title="Memeriksa akses" />;
  }
  return children;
}

export function WorkspaceRoute() {
  const params = useParams<{ role: string; section: string }>();
  const router = useRouter();
  const roleValue = String(params.role ?? '');
  const sectionSlug = String(params.section ?? '');

  if (!isRoleId(roleValue)) return null;

  const item = getNavigationItem(roleValue, sectionSlug);
  if (!item) {
    return (
      <DataState
        variant="empty"
        title="Halaman tidak ditemukan"
        description="Alamat halaman tidak tersedia pada ruang kerja ini."
        action={
          <Link className="secondary-button" href={getWorkspacePath(roleValue)}>
            <LayoutDashboard /> Kembali ke dashboard
          </Link>
        }
      />
    );
  }

  function navigate(sectionId: string) {
    router.push(getWorkspacePath(roleValue as RoleId, sectionId));
  }

  return (
    <WorkspaceContent
      role={roleValue}
      section={item.id}
      onNavigate={navigate}
    />
  );
}

export function AccessDeniedPage() {
  const { account, ready } = useAuthStore();
  const dashboardHref = account ? getWorkspacePath(account.role) : '/login';

  if (!ready) return <LoadingState />;

  return (
    <main className="standalone-state-page">
      <IshasMark />
      <section className="surface standalone-state-card">
        <DataState
          variant="forbidden"
          title="Akses halaman tidak tersedia"
          description={
            account
              ? `Akun ${account.roleLabel} hanya dapat membuka halaman dalam ruang kerjanya.`
              : 'Masuk menggunakan akun demo untuk membuka ruang kerja ISHAS.'
          }
          action={
            <Link className="primary-button" href={dashboardHref}>
              <ArrowLeft />{' '}
              {account ? 'Kembali ke ruang kerja' : 'Kembali ke login'}
            </Link>
          }
        />
      </section>
    </main>
  );
}
