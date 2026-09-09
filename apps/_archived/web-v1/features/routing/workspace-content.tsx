'use client';

import { lazy, Suspense, type ReactNode } from 'react';
import { DataState } from '@/components/ui/data-state';
import type { RoleId } from '@/shared/auth/demo-accounts';

const AdminDashboard = lazy(() =>
  import('@/features/admin/pages/dashboard-page').then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminSection = lazy(() =>
  import('@/features/admin/admin-section').then((module) => ({
    default: module.AdminSection,
  })),
);
const ResearcherDashboard = lazy(() =>
  import('@/features/peneliti/pages/dashboard-page').then((module) => ({
    default: module.ResearcherDashboard,
  })),
);
const ResearcherSection = lazy(() =>
  import('@/features/peneliti/researcher-section').then((module) => ({
    default: module.ResearcherSection,
  })),
);
const AssessorDashboard = lazy(() =>
  import('@/features/asesor/pages/dashboard-page').then((module) => ({
    default: module.AssessorDashboard,
  })),
);
const AssessorSection = lazy(() =>
  import('@/features/asesor/assessor-section').then((module) => ({
    default: module.AssessorSection,
  })),
);
const ManagerDashboard = lazy(() =>
  import('@/features/pengelola/pages/dashboard-page').then((module) => ({
    default: module.ManagerDashboard,
  })),
);
const ManagerSection = lazy(() =>
  import('@/features/pengelola/manager-section').then((module) => ({
    default: module.ManagerSection,
  })),
);

export function WorkspaceContent({
  role,
  section,
  onNavigate,
}: {
  role: RoleId;
  section: string;
  onNavigate: (section: string) => void;
}) {
  let content: ReactNode;

  if (section === 'dashboard') {
    if (role === 'admin') content = <AdminDashboard onNavigate={onNavigate} />;
    else if (role === 'peneliti')
      content = <ResearcherDashboard onNavigate={onNavigate} />;
    else if (role === 'asesor')
      content = <AssessorDashboard onNavigate={onNavigate} />;
    else content = <ManagerDashboard onNavigate={onNavigate} />;
  } else if (role === 'admin') {
    content = <AdminSection section={section} />;
  } else if (role === 'peneliti') {
    content = <ResearcherSection section={section} />;
  } else if (role === 'asesor') {
    content = <AssessorSection section={section} />;
  } else {
    content = <ManagerSection section={section} onNavigate={onNavigate} />;
  }

  return (
    <Suspense
      fallback={
        <DataState
          variant="loading"
          title="Memuat ruang kerja"
          description="Menyiapkan halaman sesuai akses akun Anda."
        />
      }
    >
      {content}
    </Suspense>
  );
}
