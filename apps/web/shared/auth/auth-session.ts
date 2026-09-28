// Akun server hasil login Fase 6 (cookie) untuk mode `VITE_USE_BACKEND`.
// Cookie HttpOnly tetap sumber kebenaran; cache ini hanya agar guard/UI
// frontend dapat membaca peran secara sinkron. Pulih diam-diam lewat `/auth/me`.

import { useSyncExternalStore } from "react";
import { USE_BACKEND, apiRequest } from "~/shared/api/http-client";
import type { RoleId } from "~/mocks/types";

export type ServerAccount = {
  id: string;
  name: string;
  email: string;
  roleId: RoleId;
  role: string;
  status: "Aktif" | "Menunggu" | "Nonaktif";
  institutionCodes: string[];
};

const STORAGE_KEY = "ishas-auth-account-v1";

const listeners = new Set<() => void>();
let cached: ServerAccount | null | undefined;

function read(): ServerAccount | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ServerAccount;
    return parsed && typeof parsed.id === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function getServerAccount(): ServerAccount | null {
  if (cached === undefined) cached = read();
  return cached;
}

export function setServerAccount(account: ServerAccount | null): void {
  cached = account;
  try {
    if (account) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Penyimpanan tak tersedia; sesi tetap jalan lewat cookie.
  }
  for (const listener of listeners) listener();
}

export function useServerAccount(): ServerAccount | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getServerAccount,
    getServerAccount,
  );
}

let inflight: Promise<void> | null = null;

// Panggil sekali saat aplikasi dimuat: selaraskan cache dengan cookie server.
export function refreshServerSession(): Promise<void> {
  if (!USE_BACKEND) return Promise.resolve();
  if (inflight) return inflight;
  inflight = (async () => {
    const result = await apiRequest<{ account: ServerAccount }>("/auth/me");
    if (result.ok) setServerAccount(result.data.account);
    else if (result.status === 401) setServerAccount(null);
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}
