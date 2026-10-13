// Sumber state ruang kerja dari server (mode `VITE_USE_BACKEND`). Tidak pernah
// jatuh ke seed mock: saat belum dimuat atau gagal, state kosong + status agar
// UI menampilkan empty-state/banner, bukan data dummy (D-31).

import { useSyncExternalStore } from "react";
import type { IshasState } from "~/mocks/types";
import { USE_BACKEND, apiRequest } from "./http-client";

export type BackendStatus = "idle" | "loading" | "ready" | "error";

export type BackendSnapshot = {
  state: IshasState | null;
  status: BackendStatus;
  error: string | null;
};

export function emptyIshasState(): IshasState {
  return {
    schemaVersion: 18,
    institutions: [],
    users: [],
    reports: [],
    selfAssessmentDrafts: {},
    selfAssessmentSnapshots: [],
    findings: [],
    recommendations: [],
    buildings: [],
    areas: [],
    campusPlans: [],
    instrument: { id: "", label: "", updatedAt: "", checksum: "", dimensions: [] },
    instrumentVersions: [],
    activeInstrumentVersionId: null,
    instrumentDocs: [],
    samCategories: [],
    samQuestions: [],
    samAssessments: [],
    samFollowUps: [],
    officeCategories: [],
    officeQuestions: [],
    officeAssessments: [],
    officeFollowUps: [],
    auditEvents: [],
    notifications: [],
    indexHistory: {},
    counters: { report: 0, institution: 0 },
  };
}

// Singleton stabil agar hook tidak membuat referensi baru tiap render.
export const EMPTY_ISHAS_STATE: IshasState = emptyIshasState();

export type BackendStateStore = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): BackendSnapshot;
  useSnapshot(): BackendSnapshot;
  refresh(): void;
};

export function createBackendState(path: string): BackendStateStore {
  let snapshot: BackendSnapshot = { state: null, status: "idle", error: null };
  const listeners = new Set<() => void>();
  let inflight = false;

  function emit(): void {
    for (const listener of listeners) listener();
  }

  function fetchState(): void {
    if (inflight) return;
    inflight = true;
    snapshot = { ...snapshot, status: "loading", error: null };
    emit();
    void apiRequest<IshasState>(path).then((result) => {
      inflight = false;
      snapshot = result.ok
        ? { state: result.data, status: "ready", error: null }
        : { state: null, status: "error", error: result.error };
      emit();
    });
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    // Muat sekali saat komponen pertama berlangganan; `refresh()` memaksa ulang.
    // Mode mock tidak menembak server sama sekali (D-49.a): hook tetap
    // berlangganan tetapi mengabaikan snapshot dan memakai state mock.
    if (snapshot.status === "idle" && USE_BACKEND) fetchState();
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    useSnapshot: () =>
      useSyncExternalStore(subscribe, () => snapshot, () => snapshot),
    refresh: fetchState,
  };
}
