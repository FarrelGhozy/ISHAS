// Akun aktif. Mode backend: dari `/auth/me` (cookie Fase 6). Mode mock: sesi
// menunjuk ID akun di state bersama (ROLES §7). Data akun dibaca dari sumber bersama.

import { useMockState } from "~/mocks/store/mock-store";
import { USE_BACKEND } from "~/shared/api/http-client";
import type { User } from "~/mocks/types";
import { useServerAccount, type ServerAccount } from "./auth-session";
import { useSession } from "./session";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function accountToUser(account: ServerAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    initials: initialsOf(account.name),
    role: account.role as User["role"],
    roleId: account.roleId,
    // Nama tampilan lingkup: kode pesantren untuk akun Pesantren (D-31).
    institution: account.institutionCodes[0] ?? "Seluruh sistem",
    institutionCodes: account.institutionCodes,
    status: account.status,
    lastActive: new Date().toISOString(),
  };
}

export function useCurrentUser(): User | null {
  const state = useMockState();
  const account = useServerAccount();
  const session = useSession();

  if (USE_BACKEND) return account ? accountToUser(account) : null;
  if (!session) return null;
  return state.users.find((u) => u.id === session.accountId) ?? null;
}
