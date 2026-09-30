// Sumber state ruang kerja Pesantren: mock (default) atau server
// (`GET /pesantren/state`) saat flag `VITE_USE_BACKEND` aktif. Mode backend
// tidak jatuh ke seed mock (D-31).

import { useMockState } from "~/mocks/store/mock-store";
import type { IshasState } from "~/mocks/types";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { useAdminState, useAdminStatus, refreshAdminState } from "./admin-state";
import { createBackendState, EMPTY_ISHAS_STATE, type BackendStatus } from "./backend-state";
import { USE_BACKEND } from "./http-client";
import { useValidatorState, useValidatorStatus, refreshValidatorState } from "./validator-state";

const store = createBackendState("/pesantren/state");

// Dipanggil setelah mutasi agar UI backend memuat ulang state.
export function refreshPesantrenState(): void {
  if (!USE_BACKEND) return;
  store.refresh();
}

export function usePesantrenState(): IshasState {
  const mockState = useMockState();
  const snapshot = store.useSnapshot();
  if (!USE_BACKEND) return mockState;
  return snapshot.state ?? EMPTY_ISHAS_STATE;
}

export function usePesantrenStatus(): { status: BackendStatus; error: string | null } {
  const snapshot = store.useSnapshot();
  return USE_BACKEND
    ? { status: snapshot.status, error: snapshot.error }
    : { status: "ready", error: null };
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

// Status sumber state sesuai peran aktif, untuk banner ruang kerja.
export function useWorkspaceStatus(): { error: string | null; refresh: () => void } {
  const user = useCurrentUser();
  const pesantren = usePesantrenStatus();
  const validator = useValidatorStatus();
  const admin = useAdminStatus();
  const active =
    user?.roleId === "admin" ? admin : user?.roleId === "validator" ? validator : pesantren;
  return { error: active.error, refresh: refreshAllWorkspaceStates };
}

// Muat ulang seluruh cache ruang kerja (setelah reset demo / migrasi aset).
export function refreshAllWorkspaceStates(): void {
  refreshPesantrenState();
  refreshValidatorState();
  refreshAdminState();
}
