// Sumber state ruang kerja Pesantren: mock (default) atau server
// (`GET /pesantren/state`) saat flag `VITE_USE_BACKEND` aktif.

import { useSyncExternalStore } from "react";
import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { useAdminState, refreshAdminState } from "./admin-state";
import { apiRequest, USE_BACKEND } from "./http-client";
import { useValidatorState, refreshValidatorState } from "./validator-state";

type WorkspaceCache = { state: IshasState | null; error: string | null };

let cache: WorkspaceCache = { state: null, error: null };
const listeners = new Set<() => void>();
let started = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function fetchState(): void {
  if (!USE_BACKEND) return;
  void apiRequest<IshasState>("/pesantren/state").then((result) => {
    cache = result.ok ? { state: result.data, error: null } : { state: null, error: result.error };
    emit();
  });
}

function load(): void {
  if (started || !USE_BACKEND) return;
  started = true;
  fetchState();
}

// Dipanggil setelah mutasi agar UI backend memuat ulang state.
export function refreshPesantrenState(): void {
  if (!USE_BACKEND) return;
  started = true;
  fetchState();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): WorkspaceCache {
  return cache;
}

export function usePesantrenState(): IshasState {
  const mockState = useMockState();
  const backend = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return USE_BACKEND && backend.state ? backend.state : mockState;
}

// State shell ruang kerja mengikuti peran akun aktif (publik menangani sendiri).
export function useWorkspaceState(): IshasState {
  const user = useCurrentUser();
  const pesantren = usePesantrenState();
  const validator = useValidatorState();
  const admin = useAdminState();
  if (user?.roleId === "admin") return admin;
  if (user?.roleId === "validator") return validator;
  return pesantren;
}

// Muat ulang seluruh cache ruang kerja (setelah reset demo / migrasi aset).
export function refreshAllWorkspaceStates(): void {
  refreshPesantrenState();
  refreshValidatorState();
  refreshAdminState();
}
