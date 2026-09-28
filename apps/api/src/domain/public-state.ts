// Proyeksi publik dari IshasState untuk adapter frontend (GET /public/state).
// Menerapkan invarian D-02: hanya Diterima, bukan arsip/Completed, pesantren
// terdaftar; tanpa identitas pelapor, jawaban mentah, alasan tolak, audit mentah.

import {
  selectFindingsByReports,
  selectPublicReports,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
} from "../../../web/mocks/store/selectors";
import type { IshasState } from "../../../web/mocks/types";

export function buildPublicState(state: IshasState) {
  const registered = selectRegisteredInstitutions(state);
  const registeredCodes = new Set(registered.map((i) => i.code));
  const reports = selectPublicReports(state, null);
  const reportIds = new Set(reports.map((r) => r.id));

  const publicReports = reports.map((r) => ({
    ...r,
    reporterName: "",
    reporterUserId: undefined,
    reporterAccountEmail: undefined,
    reporterContact: undefined,
    contact: undefined,
    reporterRecommendation: undefined,
    rejectionReason: undefined,
    validationNote: undefined,
    evidenceAssetId: undefined,
    evidenceName: undefined,
    instrumentChecksum: undefined,
  }));

  const snapshots = state.selfAssessmentSnapshots
    .filter((s) => reportIds.has(s.reportId))
    .map((s) => ({ ...s, answers: {} }));

  const instrumentDocs = state.instrumentDocs.map((doc) => ({
    ...doc,
    assetId: doc.visibility === "Public" ? doc.assetId : "",
  }));

  return {
    schemaVersion: state.schemaVersion,
    institutions: registered.map((i) => ({
      code: i.code,
      name: i.name,
      location: i.location,
      manager: i.manager,
      status: i.status,
      assessment: i.assessment,
      activeCampusPlanVersionId: i.activeCampusPlanVersionId,
    })),
    users: state.users
      .filter((u) => u.roleId === "validator" || u.roleId === "pesantren")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: "",
        initials: u.initials,
        role: u.role,
        roleId: u.roleId,
        institution: u.institution,
        institutionCodes: u.institutionCodes,
        status: u.status,
        lastActive: "",
      })),
    reports: publicReports,
    selfAssessmentDrafts: {},
    selfAssessmentSnapshots: snapshots,
    findings: selectFindingsByReports(state, reports),
    recommendations: selectRecommendationsByReports(state, reports),
    buildings: state.buildings.filter((b) => registeredCodes.has(b.institutionCode)),
    areas: state.areas.filter((a) => registeredCodes.has(a.institutionCode)),
    campusPlans: state.campusPlans.filter((p) => registeredCodes.has(p.institutionCode)),
    instrument: state.instrument,
    instrumentVersions: state.instrumentVersions,
    activeInstrumentVersionId: state.activeInstrumentVersionId,
    instrumentDocs,
    samCategories: [],
    samQuestions: [],
    samAssessments: [],
    samFollowUps: [],
    auditEvents: [],
    notifications: [],
    indexHistory: state.indexHistory,
    counters: { report: 0, institution: 0 },
  } satisfies Record<string, unknown>;
}
