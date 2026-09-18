// Persistensi browser berversi — docs DATA_MODEL.md §0 dan DATA_REQUIREMENTS §7.
// Aplikasi terpisah (D-01): tidak ada data V1 pada origin baru; key ini murni milik ISHAS.
// Dilarang menyimpan kata sandi/token.

import { SEED } from "../seed/seed";
import type { IshasState } from "../types";

export const MOCK_SCHEMA_VERSION = 5;
export const MOCK_STORAGE_KEY = "ishas-mock-v5";

// Preserve v4 records, but never promote legacy area/floor coordinates to observations.
export function migrateV4(value: unknown): unknown {
  if (!value || typeof value !== "object" || (value as IshasState).schemaVersion !== 4) return value;
  const migrated = structuredClone(value) as IshasState;
  migrated.schemaVersion = 5;
  // Pasang hanya ilustrasi demo baru, bukan mengonversi denah/titik legacy.
  migrated.campusPlans = structuredClone(SEED.campusPlans).filter((plan) => migrated.institutions?.some((institution) => institution.code === plan.institutionCode));
  migrated.institutions?.forEach((institution) => { institution.activeCampusPlanVersionId = migrated.campusPlans.find((plan) => plan.institutionCode === institution.code)?.id; });
  migrated.reports?.forEach((report) => { delete report.locationSnapshot; report.planPoint = null; });
  migrated.findings?.forEach((finding) => { delete finding.locationSnapshot; });
  migrated.selfAssessmentSnapshots?.forEach((snapshot) => {
    Object.values(snapshot.answers ?? {}).forEach((answer) => { delete answer.locationSnapshot; answer.planPoint = null; });
  });
  Object.values(migrated.selfAssessmentDrafts ?? {}).forEach((draft) => {
    Object.values(draft.answers ?? {}).forEach((answer) => { delete answer.locationSnapshot; answer.planPoint = null; });
  });
  return migrated;
}

function isValidState(value: unknown): value is IshasState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as IshasState;
  const arrays = [state.campusPlans, state.institutions, state.users, state.reports, state.selfAssessmentSnapshots,
    state.findings, state.recommendations, state.buildings, state.areas,
    state.instrumentVersions, state.auditEvents, state.notifications];
  return state.schemaVersion === MOCK_SCHEMA_VERSION && arrays.every(Array.isArray)
    && state.users.every((u) => u && typeof u.id === "string" && Array.isArray(u.institutionCodes))
    && state.instrumentVersions.every((v) => v && Array.isArray(v.dimensions) && v.dimensions.every((d) => Array.isArray(d.indicators)))
    && state.selfAssessmentSnapshots.every((s) => s && s.answers && typeof s.answers === "object")
    && !!state.selfAssessmentDrafts && typeof state.selfAssessmentDrafts === "object"
    && !!state.indexHistory && typeof state.indexHistory === "object"
    && Object.values(state.indexHistory).every(Array.isArray)
    && !!state.counters && Number.isSafeInteger(state.counters.report) && state.counters.report > 0;
}

export function loadState(): IshasState {
  if (typeof localStorage === "undefined") return structuredClone(SEED);
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY) ?? localStorage.getItem("ishas-mock-v4");
    if (raw) {
      const parsed: unknown = migrateV4(JSON.parse(raw));
      if (isValidState(parsed)) return parsed;
    }
  } catch {
    // penyimpanan rusak → pulihkan seed, jangan crash
  }
  return structuredClone(SEED);
}

export function saveState(state: IshasState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new Error("Data tidak dapat disimpan. Periksa ruang dan izin penyimpanan browser, lalu coba lagi.");
  }
}

export function resetState(): IshasState {
  const fresh = structuredClone(SEED);
  saveState(fresh);
  return fresh;
}
