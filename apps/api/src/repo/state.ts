// Membaca seluruh tabel domain → bentuk `IshasState` (mirip mock) agar selector
// dan processor murni frontend dapat dipakai 1:1. Hanya modul murni yang diimpor.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";
import { toDateOnly } from "../seed/helpers";
import { hitungJawabanTerisi } from "../../../web/mocks/processors/dashboard-aggregate";
import type {
  Area,
  AuditEvent,
  Building,
  CampusPlanVersion,
  FrozenIndicator,
  IndicatorAnswer,
  Institution,
  Instrument,
  InstrumentDoc,
  InstrumentOption,
  InstrumentVersion,
  IshasState,
  Notification,
  Recommendation,
  Report,
  RiskFinding,
  SamAssessment,
  SamCategory,
  SamFollowUp,
  SamQuestion,
  SelfAssessmentDraft,
  SelfAssessmentSnapshot,
  User,
} from "../../../web/mocks/types";

const ROLE_LABEL: Record<string, User["role"]> = {
  admin: "Super Admin",
  validator: "Validator",
  pesantren: "Pesantren",
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

async function rows(sql: string, params: unknown[] = []): Promise<RowDataPacket[]> {
  const [result] = await pool.query<RowDataPacket[]>(sql, params);
  return result;
}

function mapUser(row: RowDataPacket, institutionNames: Map<string, string>): User {
  const roleId = String(row.role) as User["roleId"];
  const code = row.institution_code ? String(row.institution_code) : null;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    initials: initialsOf(String(row.name)),
    role: ROLE_LABEL[roleId] ?? "Pesantren",
    roleId,
    institution: code ? (institutionNames.get(code) ?? code) : "Seluruh sistem",
    institutionCodes: code ? [code] : [],
    status: row.status,
    lastActive: toIso(row.last_active_at) ?? "",
  };
}

function mapReport(row: RowDataPacket): Report {
  return {
    id: String(row.id),
    channel: row.channel,
    institutionCode: String(row.institution_code),
    areaId: row.area_id ? String(row.area_id) : undefined,
    manualLocation: row.manual_location ? String(row.manual_location) : undefined,
    reporterName: String(row.reporter_name),
    reporterUserId: row.reporter_user_id ? String(row.reporter_user_id) : undefined,
    reporterAccountEmail: row.reporter_account_email
      ? String(row.reporter_account_email)
      : undefined,
    reporterSeverity: row.reporter_severity,
    reporterPriority: row.reporter_priority,
    reporterRecommendation: row.reporter_recommendation
      ? String(row.reporter_recommendation)
      : undefined,
    categoryId: row.category_id ? (String(row.category_id) as Report["categoryId"]) : undefined,
    aspectId: row.aspect_id ? String(row.aspect_id) : undefined,
    indicatorId: row.indicator_id ? String(row.indicator_id) : undefined,
    title: String(row.title),
    description: String(row.description),
    evidenceAssetId: row.evidence_asset_id ? String(row.evidence_asset_id) : undefined,
    evidenceName: row.evidence_name ? String(row.evidence_name) : undefined,
    locationSnapshot: parseJson(row.location_snapshot, undefined),
    validationStatus: row.validation_status,
    severity: row.severity,
    priority: row.priority,
    handlingStatus: row.handling_status,
    rejectionReason: row.rejection_reason ? String(row.rejection_reason) : undefined,
    validationNote: row.validation_note ? String(row.validation_note) : undefined,
    validatedBy: row.validated_by ? String(row.validated_by) : undefined,
    validatedByName: row.validated_by_name ? String(row.validated_by_name) : undefined,
    validatedByRole: row.validated_by_role ? String(row.validated_by_role) : undefined,
    validatedAt: toIso(row.validated_at),
    instrumentVersionId: row.instrument_version_id ? String(row.instrument_version_id) : undefined,
    instrumentChecksum: row.instrument_checksum ? String(row.instrument_checksum) : undefined,
    scorePercent: row.score_percent === null ? null : Number(row.score_percent),
    pdfGeneratedAt: toIso(row.pdf_generated_at),
    observedAt: toIso(row.observed_at),
    correctionOf: row.correction_of ? String(row.correction_of) : undefined,
    archivedAt: toIso(row.archived_at),
    archivedReason: row.archived_reason ? String(row.archived_reason) : undefined,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    submittedAt: toIso(row.submitted_at),
    updatedAt: toIso(row.updated_at),
    contact: row.reporter_contact ? String(row.reporter_contact) : undefined,
  };
}

function mapFinding(row: RowDataPacket): RiskFinding {
  return {
    id: String(row.id),
    reportId: String(row.report_id),
    areaId: row.area_id ? String(row.area_id) : "",
    buildingId: row.building_id ? String(row.building_id) : "",
    recommendationId: row.recommendation_id ? String(row.recommendation_id) : "",
    sourceAnswerId: row.source_answer_id ? String(row.source_answer_id) : undefined,
    categoryId: row.category_id
      ? (String(row.category_id) as RiskFinding["categoryId"])
      : undefined,
    aspectId: row.aspect_id ? String(row.aspect_id) : undefined,
    level: row.level,
    status: row.status,
    issue: String(row.issue),
    instrumentVersion: String(row.instrument_version),
    location: String(row.location),
    building: String(row.building),
    zone: String(row.zone),
    floor: String(row.floor),
    x: Number(row.x),
    y: Number(row.y),
    indicator: String(row.indicator),
    recommendation: String(row.recommendation),
    hazard: String(row.hazard),
    impact: String(row.impact),
    likelihood: String(row.likelihood),
    severityText: String(row.severity_text),
    exposedPeople: String(row.exposed_people),
    existingControl: String(row.existing_control),
    evidence: String(row.evidence),
    locationSnapshot: parseJson(row.location_snapshot, undefined),
    observedAt: toIso(row.observed_at) ?? new Date(0).toISOString(),
    planVersion: String(row.plan_version),
    residualRisk: row.residual_risk,
  };
}

function mapRecommendation(row: RowDataPacket): Recommendation {
  return {
    id: String(row.id),
    reportId: String(row.report_id),
    priority: row.priority,
    title: String(row.title),
    location: String(row.location),
    source: String(row.source),
    action: String(row.action),
    status: row.status,
    owner: row.owner ? String(row.owner) : "",
    dueDate: toDateOnly(row.due_date) ?? "",
    progress: Number(row.progress),
    lastNote: row.last_note ? String(row.last_note) : undefined,
    completionEvidence: row.completion_evidence ? String(row.completion_evidence) : undefined,
    completionEvidenceAssetId: row.completion_evidence_asset_id
      ? String(row.completion_evidence_asset_id)
      : undefined,
    canceledReason: row.canceled_reason ? String(row.canceled_reason) : undefined,
    canceledBy: row.canceled_by ? String(row.canceled_by) : undefined,
    canceledAt: toIso(row.canceled_at),
    verifiedBy: row.verified_by ? String(row.verified_by) : undefined,
    verifiedAt: toIso(row.verified_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapBuilding(row: RowDataPacket): Building {
  return {
    id: String(row.id),
    institutionCode: String(row.institution_code),
    code: String(row.code),
    name: String(row.name),
    floors: parseJson(row.floors, []),
  };
}

function mapArea(row: RowDataPacket): Area {
  return {
    id: String(row.id),
    institutionCode: String(row.institution_code),
    buildingId: String(row.building_id),
    floor: String(row.floor),
    name: String(row.name),
    zone: String(row.zone),
    x: Number(row.x),
    y: Number(row.y),
    width: Number(row.width),
    height: Number(row.height),
  };
}

export function bankToInstrument(
  meta: RowDataPacket | undefined,
  dims: RowDataPacket[],
  indicators: RowDataPacket[],
  options: RowDataPacket[],
): Instrument {
  const optionsByIndicator = new Map<string, InstrumentOption[]>();
  for (const opt of options) {
    const list = optionsByIndicator.get(String(opt.indicator_id)) ?? [];
    list.push({
      value: String(opt.value),
      label: String(opt.label),
      weight: Number(opt.weight),
      isFinding: Boolean(opt.is_finding),
    });
    optionsByIndicator.set(String(opt.indicator_id), list);
  }
  type BankIndicator = Instrument["dimensions"][number]["indicators"][number];
  const indicatorsByDim = new Map<string, BankIndicator[]>();
  for (const ind of indicators) {
    const list = indicatorsByDim.get(String(ind.dimension_id)) ?? [];
    list.push({
      id: String(ind.id),
      code: String(ind.code),
      title: String(ind.title),
      prompt: String(ind.prompt),
      categoryId: ind.category_id
        ? (String(ind.category_id) as BankIndicator["categoryId"])
        : undefined,
      aspectId: ind.aspect_id ? String(ind.aspect_id) : undefined,
      answerType: ind.answer_type,
      required: Boolean(ind.is_required),
      evidenceRequired: Boolean(ind.evidence_required),
      locationRequired: Boolean(ind.location_required),
      weight: Number(ind.weight),
      options: optionsByIndicator.get(String(ind.id)) ?? [],
    });
    indicatorsByDim.set(String(ind.dimension_id), list);
  }
  return {
    id: String(meta?.id ?? "INS-LIVE"),
    label: String(meta?.label ?? "Bank Instrumen Live"),
    updatedAt: toIso(meta?.updated_at) ?? "",
    checksum: String(meta?.checksum ?? "ck-0"),
    dimensions: dims.map((dim) => ({
      id: String(dim.id),
      name: String(dim.name),
      categoryId: dim.category_id
        ? (String(dim.category_id) as Instrument["dimensions"][number]["categoryId"])
        : undefined,
      aspects: parseJson<Instrument["dimensions"][number]["aspects"]>(dim.aspects, undefined),
      indicators: indicatorsByDim.get(String(dim.id)) ?? [],
    })),
  };
}

export async function loadIshasState(): Promise<IshasState> {
  const [
    institutionRows,
    userRows,
    reportRows,
    snapshotRows,
    draftRows,
    findingRows,
    recommendationRows,
    buildingRows,
    areaRows,
    campusRows,
    metaRows,
    bankDimRows,
    bankIndRows,
    bankOptRows,
    versionRows,
    vDimRows,
    vIndRows,
    docRows,
    samCatRows,
    samQRows,
    samAssessRows,
    samFollowRows,
    auditRows,
    notifRows,
    indexRows,
    sequenceRows,
  ] = await Promise.all([
    rows("SELECT * FROM institutions ORDER BY created_at, code"),
    rows("SELECT * FROM users"),
    rows("SELECT * FROM reports"),
    rows("SELECT * FROM self_assessment_snapshots"),
    rows("SELECT * FROM self_assessment_drafts"),
    rows("SELECT * FROM findings"),
    rows("SELECT * FROM recommendations"),
    rows("SELECT * FROM buildings"),
    rows("SELECT * FROM areas"),
    rows("SELECT * FROM campus_plans"),
    rows("SELECT * FROM instrument_meta"),
    rows("SELECT * FROM bank_dimensions ORDER BY sort_order"),
    rows("SELECT * FROM bank_indicators ORDER BY sort_order"),
    rows("SELECT * FROM bank_options ORDER BY sort_order"),
    rows("SELECT * FROM instrument_versions"),
    rows("SELECT * FROM instrument_version_dimensions ORDER BY sort_order"),
    rows("SELECT * FROM instrument_version_indicators ORDER BY sort_order"),
    rows("SELECT * FROM instrument_docs"),
    rows("SELECT * FROM sam_categories ORDER BY sort_order"),
    rows("SELECT * FROM sam_questions ORDER BY sort_order"),
    rows("SELECT * FROM sam_assessments"),
    rows("SELECT * FROM sam_follow_ups"),
    rows("SELECT * FROM audit_events ORDER BY at DESC, id DESC"),
    rows("SELECT * FROM notifications ORDER BY at DESC, id DESC"),
    rows("SELECT * FROM index_history ORDER BY institution_code, sort_order"),
    rows("SELECT * FROM sequences"),
  ]);

  const institutions: Institution[] = institutionRows.map((row) => ({
    code: String(row.code),
    name: String(row.name),
    location: String(row.city),
    address: row.address ? String(row.address) : undefined,
    manager: String(row.manager),
    status: row.status,
    activeCampusPlanVersionId: row.active_campus_plan_id
      ? String(row.active_campus_plan_id)
      : undefined,
    assessment: "Belum dimulai",
  }));
  const institutionNames = new Map(institutions.map((i) => [i.code, i.name]));

  const users: User[] = userRows.map((row) => mapUser(row, institutionNames));

  const selfAssessmentSnapshots: SelfAssessmentSnapshot[] = snapshotRows.map((row) => {
    const frozen = parseJson<FrozenIndicator[]>(row.frozen_indicators, []);
    const answers = parseJson<Record<string, IndicatorAnswer>>(row.answers, {});
    // D-35: cacah terisi dihitung dari jawaban penuh DB (kolom tidak perlu
    // migrasi); proyeksi publik membawa cacah ini, bukan nilai mentah.
    const jawabanTerisi = hitungJawabanTerisi({ jawabanTerisi: undefined, answers });
    return {
      reportId: String(row.report_id),
      instrumentVersionId: String(row.instrument_version_id),
      instrumentChecksum: row.instrument_checksum ? String(row.instrument_checksum) : undefined,
      submittedAt: toIso(row.submitted_at) ?? new Date(0).toISOString(),
      answers,
      frozenIndicators: frozen.length ? frozen : undefined,
      scorePercent: row.score_percent === null ? null : Number(row.score_percent),
      byDimension: parseJson<Record<string, number | null>>(row.by_dimension, {}),
      jawabanTerisi,
    };
  });

  const selfAssessmentDrafts: Record<string, SelfAssessmentDraft> = {};
  for (const row of draftRows) {
    const payload = parseJson<{
      answers: Record<string, Partial<IndicatorAnswer>>;
      activeIndex: number;
    }>(row.payload, { answers: {}, activeIndex: 0 });
    selfAssessmentDrafts[String(row.id)] = {
      id: String(row.id),
      institutionCode: String(row.institution_code),
      reporterName: String(row.reporter_name),
      contact: row.contact ? String(row.contact) : undefined,
      reporterUserId: row.reporter_user_id ? String(row.reporter_user_id) : undefined,
      instrumentVersionId: String(row.instrument_version_id),
      instrumentChecksum: row.instrument_checksum ? String(row.instrument_checksum) : undefined,
      answers: payload.answers,
      activeIndex: payload.activeIndex,
      updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
      submittedReportId: row.submitted_report_id ? String(row.submitted_report_id) : undefined,
    };
  }

  const campusPlans: CampusPlanVersion[] = campusRows.map((row) => ({
    id: String(row.id),
    institutionCode: String(row.institution_code),
    revision: Number(row.revision),
    assetId: String(row.asset_id),
    width: Number(row.width),
    height: Number(row.height),
    uploadedBy: String(row.uploaded_by),
    uploadedAt: toIso(row.uploaded_at) ?? new Date(0).toISOString(),
    illustration: Boolean(row.illustration),
  }));

  const instrument = bankToInstrument(metaRows[0], bankDimRows, bankIndRows, bankOptRows);

  const vDimsByVersion = new Map<string, InstrumentVersion["dimensions"]>();
  for (const dim of vDimRows) {
    const list = vDimsByVersion.get(String(dim.version_id)) ?? [];
    list.push({
      id: String(dim.id),
      name: String(dim.name),
      categoryId: dim.category_id
        ? (String(dim.category_id) as InstrumentVersion["dimensions"][number]["categoryId"])
        : undefined,
      description: dim.description ? String(dim.description) : undefined,
      aspects: parseJson(dim.aspects, undefined),
      indicators: [],
    });
    vDimsByVersion.set(String(dim.version_id), list);
  }
  for (const ind of vIndRows) {
    const dims = vDimsByVersion.get(String(ind.version_id)) ?? [];
    const dim = dims.find((d) => d.id === String(ind.dimension_id));
    if (!dim) continue;
    dim.indicators.push({
      id: String(ind.id),
      code: String(ind.code),
      title: String(ind.title),
      prompt: String(ind.prompt),
      categoryId: ind.category_id
        ? (String(ind.category_id) as InstrumentVersion["dimensions"][number]["indicators"][number]["categoryId"])
        : undefined,
      aspectId: ind.aspect_id ? String(ind.aspect_id) : undefined,
      answerType: ind.answer_type,
      required: Boolean(ind.is_required),
      evidenceRequired: Boolean(ind.evidence_required),
      locationRequired: Boolean(ind.location_required),
      findingTrigger: ind.finding_trigger ? String(ind.finding_trigger) : "",
    });
  }
  const instrumentVersions: InstrumentVersion[] = versionRows.map((row) => ({
    id: String(row.id),
    label: String(row.label),
    status: row.status,
    publishedAt: toIso(row.published_at),
    dimensions: vDimsByVersion.get(String(row.id)) ?? [],
  }));
  const activeInstrumentVersionId =
    instrumentVersions.find((v) => v.status === "Published")?.id ?? null;

  const instrumentDocs: InstrumentDoc[] = docRows.map((row) => ({
    id: String(row.id),
    indicatorId: String(row.indicator_id),
    indicatorCode: row.indicator_code ? String(row.indicator_code) : undefined,
    indicatorTitle: row.indicator_title ? String(row.indicator_title) : undefined,
    categoryId: row.category_id ? String(row.category_id) : undefined,
    aspectId: row.aspect_id ? String(row.aspect_id) : undefined,
    manual: Boolean(row.is_manual),
    fileName: String(row.file_name),
    fileSize: Number(row.file_size),
    mime: "application/pdf",
    assetId: String(row.asset_id),
    visibility: row.visibility,
    updatedBy: String(row.updated_by),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
  }));

  const samCategories: SamCategory[] = samCatRows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : "",
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  }));
  const samQuestions: SamQuestion[] = samQRows.map((row) => ({
    id: String(row.id),
    categoryId: String(row.category_id),
    text: String(row.text),
    panduan: String(row.panduan),
    contohBukti: String(row.contoh_bukti),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  }));
  const samAssessments: SamAssessment[] = samAssessRows.map((row) => ({
    id: String(row.id),
    institutionCode: String(row.institution_code),
    areaId: row.area_id ? String(row.area_id) : undefined,
    manualLocation: row.manual_location ? String(row.manual_location) : undefined,
    observedAt: toDateOnly(row.observed_at) ?? "",
    observedTime: row.observed_time ? String(row.observed_time) : undefined,
    kind: String(row.kind),
    observerName: String(row.observer_name),
    note: row.note ? String(row.note) : undefined,
    observerAccountId: row.observer_account_id ? String(row.observer_account_id) : undefined,
    status: row.status,
    answers: parseJson(row.answers, {}),
    totalScore: Number(row.total_score),
    maxScore: Number(row.max_score),
    percent: Number(row.percent),
    riskLevel: row.risk_level,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    completedAt: toIso(row.completed_at),
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    reviewedById: row.reviewed_by_id ? String(row.reviewed_by_id) : undefined,
    reviewedAt: toIso(row.reviewed_at),
    reviewNote: row.review_note ? String(row.review_note) : undefined,
  }));
  const samFollowUps: SamFollowUp[] = samFollowRows.map((row) => ({
    id: String(row.id),
    assessmentId: String(row.assessment_id),
    questionId: String(row.question_id),
    title: String(row.title),
    note: row.note ? String(row.note) : undefined,
    pic: String(row.pic),
    dueDate: toDateOnly(row.due_date) ?? "",
    status: row.status,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
    doneAt: toIso(row.done_at),
    cancelReason: row.cancel_reason ? String(row.cancel_reason) : undefined,
  }));

  const auditEvents: AuditEvent[] = auditRows.map((row) => ({
    id: row.legacy_id ? String(row.legacy_id) : `AUD-${String(row.id)}`,
    objectType: String(row.object_type),
    objectId: String(row.object_id),
    actorAccountId: row.actor_account_id ? String(row.actor_account_id) : undefined,
    actorName: String(row.actor_name),
    actorRole: row.actor_role,
    institutionCode: row.institution_code ? String(row.institution_code) : undefined,
    action: String(row.action),
    at: toIso(row.at) ?? new Date(0).toISOString(),
    note: row.note ? String(row.note) : undefined,
  }));

  const notifications: Notification[] = notifRows.map((row) => ({
    id: row.legacy_id ? String(row.legacy_id) : `NOT-${String(row.id)}`,
    recipientAccountId: row.recipient_account_id ? String(row.recipient_account_id) : undefined,
    institutionCode: row.institution_code ? String(row.institution_code) : undefined,
    sourceObjectId: String(row.source_object_id),
    message: String(row.message),
    targetUrl: String(row.target_url),
    at: toIso(row.at) ?? new Date(0).toISOString(),
    read: Boolean(row.is_read),
  }));

  const indexHistory: Record<string, { period: string; index: number }[]> = {};
  for (const row of indexRows) {
    const code = String(row.institution_code);
    const list = indexHistory[code] ?? [];
    list.push({ period: String(row.period), index: Number(row.index_value) });
    indexHistory[code] = list;
  }

  const counters = { report: 1, institution: 1 };
  for (const row of sequenceRows) {
    if (row.seq_name === "report") counters.report = Number(row.value);
    if (row.seq_name === "institution") counters.institution = Number(row.value);
  }

  return {
    schemaVersion: 15,
    institutions,
    users,
    reports: reportRows.map(mapReport),
    selfAssessmentDrafts,
    selfAssessmentSnapshots,
    findings: findingRows.map(mapFinding),
    recommendations: recommendationRows.map(mapRecommendation),
    buildings: buildingRows.map(mapBuilding),
    areas: areaRows.map(mapArea),
    instrument,
    instrumentVersions,
    activeInstrumentVersionId,
    instrumentDocs,
    samCategories,
    samQuestions,
    samAssessments,
    samFollowUps,
    auditEvents,
    notifications,
    indexHistory,
    counters,
    campusPlans,
  };
}
