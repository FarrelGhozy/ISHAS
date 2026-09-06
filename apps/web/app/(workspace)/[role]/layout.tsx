import type { ReactNode } from 'react';
import { WorkspaceGuard } from '@/features/routing/route-state';
import { WorkspaceShell } from '@/shared/layout/workspace-shell';

export default function RoleWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WorkspaceGuard>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceGuard>
  );
}
