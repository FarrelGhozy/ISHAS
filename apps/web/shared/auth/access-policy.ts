// Kebijakan akses frontend — docs ROUTES.md §3. Simulasi UX, bukan keamanan produksi;
// backend wajib memeriksa ulang role + permission + scope.

import type { RoleId } from "~/mocks/types";
import type { Session } from "./session";

export type WorkspaceAccess = "allowed" | "login" | "denied";

const ROLE_PREFIXES: { prefix: string; roleId: RoleId }[] = [
  { prefix: "/admin", roleId: "admin" },
  { prefix: "/peneliti", roleId: "peneliti" },
  { prefix: "/pengelola", roleId: "pengelola" },
];

export function workspaceRoleFor(pathname: string): RoleId | null {
  const match = ROLE_PREFIXES.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  return match?.roleId ?? null;
}

export function workspaceHome(roleId: RoleId): string {
  // ROUTES §5: tujuan pengelola adalah halaman utama Validasi Laporan.
  switch (roleId) {
    case "admin":
      return "/admin/dashboard";
    case "peneliti":
      return "/peneliti/dashboard";
    case "pengelola":
      return "/pengelola/validasi-laporan";
  }
}

export function resolveWorkspaceAccess(
  pathname: string,
  session: Session | null,
  sessionRole: RoleId | null,
): WorkspaceAccess {
  const expectedRole = workspaceRoleFor(pathname);
  if (!expectedRole) return "allowed";
  if (!session) return "login";
  return sessionRole === expectedRole ? "allowed" : "denied";
}

export function resolveLoginRedirect(redirectTo: string | null, roleId: RoleId): string {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return workspaceHome(roleId);
  }
  // Jangan mengikuti tujuan tersimpan yang mengarah ke workspace peran lain (ROUTES §3).
  const expectedRole = workspaceRoleFor(redirectTo);
  if (!expectedRole) return workspaceHome(roleId);
  return expectedRole === roleId ? redirectTo : workspaceHome(roleId);
}

export function canManageInstitution(user: { roleId: RoleId; institutionCodes: string[] }, code: string): boolean {
  return user.roleId === "pengelola" && user.institutionCodes.includes(code);
}
