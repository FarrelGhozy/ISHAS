// Sumber state ruang kerja Super Admin: mock (default) atau server
// (`GET /admin/state`) saat flag `VITE_USE_BACKEND` aktif (Fase 5).
// Mode backend tidak jatuh ke seed mock (D-31).

import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { createBackendState, EMPTY_ISHAS_STATE, type BackendStatus } from "./backend-state";
import { USE_BACKEND } from "./http-client";

const store = createBackendState("/admin/state");

// Dipanggil setelah mutasi agar UI backend memuat ulang state.
export function refreshAdminState(): void {
  if (!USE_BACKEND) return;
  store.refresh();
}

export function useAdminState(): IshasState {
  const mockState = useMockState();
  const snapshot = store.useSnapshot();
  if (!USE_BACKEND) return mockState;
  return snapshot.state ?? EMPTY_ISHAS_STATE;
}

export function useAdminStatus(): { status: BackendStatus; error: string | null } {
  const snapshot = store.useSnapshot();
  return USE_BACKEND
    ? { status: snapshot.status, error: snapshot.error }
    : { status: "ready", error: null };
}
