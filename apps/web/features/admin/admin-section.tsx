'use client';

import { AdminAuditPage } from '@/features/admin/pages/audit-page';
import { AdminInstitutionsPage } from '@/features/admin/pages/institutions-page';
import { AdminPermissionsPage } from '@/features/admin/pages/permissions-page';
import { AdminSettingsPage } from '@/features/admin/pages/settings-page';
import { AdminUsersPage } from '@/features/admin/pages/users-page';

export function AdminSection({ section }: { section: string }) {
  if (section === 'users') return <AdminUsersPage />;
  if (section === 'institutions') return <AdminInstitutionsPage />;
  if (section === 'permissions') return <AdminPermissionsPage />;
  if (section === 'audit') return <AdminAuditPage />;
  if (section === 'settings') return <AdminSettingsPage />;
  return null;
}
