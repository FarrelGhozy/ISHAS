// Sumber baca publik: mock (default) atau server (`GET /public/state`) saat
// flag `VITE_USE_BACKEND` aktif. Halaman publik cukup menukar `useMockState`.

import { useSyncExternalStore } from "react";
import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { apiRequest, USE_BACKEND } from "./http-client";

type PublicCache = { state: IshasState | null; error: string | null };

let cache: PublicCache = { state: null, error: null };
const listeners = new Set<() => void>();
let started = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function load(): void {
  if (started || !USE_BACKEND) return;
  started = true;
  void apiRequest<IshasState>("/public/state").then((result) => {
    cache = result.ok ? { state: result.data, error: null } : { state: null, error: result.error };
    emit();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PublicCache {
  return cache;
}

export function usePublicState(): IshasState {
  const mockState = useMockState();
  const backend = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return USE_BACKEND && backend.state ? backend.state : mockState;
}

// Sumber state + status muat server (untuk fallback/notice bila diperlukan).
export function usePublicStateWithStatus(): { state: IshasState; error: string | null } {
  const state = usePublicState();
  const backend = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { state, error: USE_BACKEND ? backend.error : null };
}
