// Sumber state ruang kerja Super Admin: mock (default) atau server
// (`GET /admin/state`) saat flag `VITE_USE_BACKEND` aktif (Fase 5).

import { useSyncExternalStore } from "react";
import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { apiRequest, USE_BACKEND } from "./http-client";

type AdminCache = { state: IshasState | null; error: string | null };

let cache: AdminCache = { state: null, error: null };
const listeners = new Set<() => void>();
let started = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function fetchState(): void {
  if (!USE_BACKEND) return;
  void apiRequest<IshasState>("/admin/state").then((result) => {
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
export function refreshAdminState(): void {
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

function getSnapshot(): AdminCache {
  return cache;
}

export function useAdminState(): IshasState {
  const mockState = useMockState();
  const backend = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return USE_BACKEND && backend.state ? backend.state : mockState;
}
