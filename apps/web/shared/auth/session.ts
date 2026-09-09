// Sesi login dummy — docs ROLES.md §7. Menunjuk ID akun, BUKAN role saja
// (prasyarat isolasi scope dua pengelola). sessionStorage; pulih diam-diam saat refresh.

import { useSyncExternalStore } from "react";
import type { RoleId } from "~/mocks/types";

export const SESSION_STORAGE_KEY = "ishas-session-v2";

export type Session = {
  accountId: string;
  loginAt: string;
};

const listeners = new Set<() => void>();
// Snapshot di-cache: getSnapshot harus stabil antar-panggilan (useSyncExternalStore).
let cachedSession: Session | null | undefined;

function read(): Session | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Session).accountId === "string"
    ) {
      return parsed as Session;
    }
  } catch {
    // sesi usang/rusak → dibersihkan saat baca, tidak crash (TEST_PLAN §2)
  }
  return null;
}

export const sessionStore = {
  get(): Session | null {
    if (cachedSession === undefined) cachedSession = read();
    return cachedSession;
  },
  login(accountId: string): void {
    const session = { accountId, loginAt: new Date().toISOString() } satisfies Session;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    cachedSession = session;
    for (const l of listeners) l();
  },
  logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    cachedSession = null;
    for (const l of listeners) l();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSession(): Session | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, sessionStore.get);
}

export function canSubmitReport(roleId: RoleId | undefined): boolean {
  // D-03 (dijawab 8 Sep 2026): hanya publik tanpa login dan pengelola yang boleh kirim.
  return roleId === undefined || roleId === "pengelola";
}
