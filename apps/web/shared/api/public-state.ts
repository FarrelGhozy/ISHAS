// Sumber baca publik: mock (default) atau server (`GET /public/state`) saat
// flag `VITE_USE_BACKEND` aktif. Mode backend tidak jatuh ke seed mock (D-31).

import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { createBackendState, EMPTY_ISHAS_STATE, type BackendStatus } from "./backend-state";
import { USE_BACKEND } from "./http-client";

const store = createBackendState("/public/state");

// Muat ulang cache publik setelah mutasi (lapor/mandiri/reset) agar bacaan
// dashboard publik tidak basi sampai reload penuh.
export function refreshPublicState(): void {
  if (!USE_BACKEND) return;
  store.refresh();
}

export function usePublicState(): IshasState {
  const mockState = useMockState();
  const snapshot = store.useSnapshot();
  if (!USE_BACKEND) return mockState;
  return snapshot.state ?? EMPTY_ISHAS_STATE;
}

// Sumber state + status muat server (untuk banner/bila diperlukan).
export function usePublicStateWithStatus(): {
  state: IshasState;
  status: BackendStatus;
  error: string | null;
} {
  const state = usePublicState();
  const snapshot = store.useSnapshot();
  return {
    state,
    status: USE_BACKEND ? snapshot.status : "ready",
    error: USE_BACKEND ? snapshot.error : null,
  };
}
