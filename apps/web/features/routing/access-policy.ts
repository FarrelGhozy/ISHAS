import { isRoleId, type RoleId } from '@/shared/auth/demo-accounts';

export type WorkspaceAccessDecision =
  | 'loading'
  | 'login'
  | 'denied'
  | 'allowed';

export function resolveWorkspaceAccess(
  ready: boolean,
  accountRole: RoleId | null,
  routeRole: string,
): WorkspaceAccessDecision {
  if (!ready) return 'loading';
  if (!accountRole) return 'login';
  if (!isRoleId(routeRole) || accountRole !== routeRole) return 'denied';
  return 'allowed';
}
