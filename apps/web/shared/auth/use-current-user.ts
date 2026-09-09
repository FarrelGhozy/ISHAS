// Akun aktif dari sesi — sesi menunjuk ID akun; data dibaca dari sumber akun bersama (ROLES §7).

import { useMockState } from "~/mocks/store/mock-store";
import type { User } from "~/mocks/types";
import { useSession } from "./session";

export function useCurrentUser(): User | null {
  const state = useMockState();
  const session = useSession();
  if (!session) return null;
  return state.users.find((u) => u.id === session.accountId) ?? null;
}
