// Validasi + mutasi ruang kerja Pesantren (Fase 2) — port 1:1 `mock-store.ts`
// §accept/reject/lifecycle/lokasi/tindak-lanjut. Pesan Indonesia identik mock.

import type {
  Area,
  Building,
  CampusPlanVersion,
  HandlingStatus,
  IshasState,
  Priority,
  Report,
  RiskLevel,
  Severity,
} from "../../../web/mocks/types";
import type { Actor } from "../router";
import { deriveWork } from "./derive";
import { setFileAssetOwner } from "../repo/files";
import { insertAudit, withTransaction, type Tx } from "../repo/writes";
import {
  insertAreaRow,
  insertBuildingRow,
  insertCampusPlanRow,
  insertFindingRow,
  insertRecommendationRow,
  setActiveCampusPlan,
  updateBuildingFloors,
  updateFindingFields,
  updateRecommendationFields,
  updateReportFields,
} from "../repo/pesantren";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

// Proyeksi internal ruang kerja Pesantren (scope satu lembaga) untuk adapter
// frontend (issue #10). Menyertakan laporan Menunggu/Ditolak + snapshot + audit
// internal — hanya untuk akun Pesantren pemilik scope.
export function buildPesantrenState(state: IshasState, institutionCode: string) {
  const reports = state.reports.filter((r) => r.institutionCode === institutionCode);
  const reportIds = new Set(reports.map((r) => r.id));
  const institutionCodes = new Set([institutionCode]);
  return {
    schemaVersion: state.schemaVersion,
    institutions: state.institutions.filter((i) => institutionCodes.has(i.code)),
    users: state.users.filter(
      (u) => u.roleId === "validator" || u.institutionCodes.some((c) => institutionCodes.has(c)),
    ),
    reports,
    selfAssessmentDrafts: {},
    selfAssessmentSnapshots: state.selfAssessmentSnapshots.filter((s) =>
      reportIds.has(s.reportId),
    ),
    findings: state.findings.filter((f) => reportIds.has(f.reportId)),
    recommendations: state.recommendations.filter((r) => reportIds.has(r.reportId)),
    buildings: state.buildings.filter((b) => institutionCodes.has(b.institutionCode)),
    areas: state.areas.filter((a) => institutionCodes.has(a.institutionCode)),
    campusPlans: state.campusPlans.filter((p) => institutionCodes.has(p.institutionCode)),
    instrument: state.instrument,
    instrumentVersions: state.instrumentVersions,
    activeInstrumentVersionId: state.activeInstrumentVersionId,
    instrumentDocs: [],
    samCategories: [],
    samQuestions: [],
    samAssessments: [],
    samFollowUps: [],
    auditEvents: state.auditEvents.filter((e) =>
      e.institutionCode ? institutionCodes.has(e.institutionCode) : false,
    ),
    notifications: state.notifications.filter((n) =>
      n.institutionCode ? institutionCodes.has(n.institutionCode) : false,
    ),
    indexHistory: state.indexHistory,
    counters: { report: 0, institution: 0 },
  };
}

const nowIso = (): string => new Date().toISOString();
const today = (): string => nowIso().slice(0, 10);

type Scope = { report: Report } | { error: string };

export function scopedReport(state: IshasState, actor: Actor | null, reportId: string): Scope {
  const report = state.reports.find((r) => r.id === reportId);
  if (!report) return { error: "Laporan tidak ditemukan." };
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif") {
    return { error: "Sesi tidak dikenal." };
  }
  if (
    account.roleId !== "pesantren" ||
    !account.institutionCodes.includes(report.institutionCode)
  ) {
    return { error: "Anda tidak berwenang mengubah laporan pesantren ini." };
  }
  return { report };
}

function isScope(value: Scope): value is { error: string } {
  return "error" in value;
}

type AuditInput = {
  objectType: string;
  objectId: string;
  institutionCode?: string;
  action: string;
  note?: string;
};

async function writeAudit(conn: Tx, actor: Actor, entry: AuditInput, at: string): Promise<void> {
  await insertAudit(conn, {
    id: "",
    objectType: entry.objectType,
    objectId: entry.objectId,
    actorAccountId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as never,
    institutionCode: entry.institutionCode,
    action: entry.action,
    note: entry.note,
    at,
  });
}

export async function acceptReport(
  state: IshasState,
  actor: Actor | null,
  reportId: string,
  severity: Severity,
  priority: Priority,
  note?: string,
  rekomendasiFinal?: string,
): Promise<ActionResult> {
  const scope = scopedReport(state, actor, reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  if (!severity || !priority || severity === "Belum ditentukan" || priority === "Belum ditentukan") {
    return { ok: false, error: "Severity dan priority wajib dipilih tanpa default." };
  }
  if (scope.report.validationStatus !== "Menunggu validasi") {
    return { ok: false, error: "Hanya laporan Menunggu validasi yang dapat diterima." };
  }
  // D-32: hanya lapor-cepat yang divalidasi; penilaian-mandiri langsung Terbit.
  if (scope.report.channel !== "lapor-cepat") {
    return { ok: false, error: "Hanya laporan cepat yang memerlukan validasi." };
  }
  const finalAction = rekomendasiFinal?.trim() || undefined;
  if (!finalAction || finalAction.length < 10) {
    return { ok: false, error: "Rekomendasi tindakan wajib diisi minimal 10 karakter." };
  }
  if (finalAction.length > 500) {
    return { ok: false, error: "Rekomendasi tindakan maksimal 500 karakter." };
  }
  const derived = deriveWork(state, scope.report, severity, priority, finalAction);
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateReportFields(conn, reportId, {
      validation_status: "Diterima",
      handling_status: "Pending",
      severity,
      priority,
      validated_by: actor?.id ?? null,
      validated_by_name: actor?.name ?? null,
      validated_by_role: actor?.role ?? null,
      validated_at: new Date(at),
      validation_note: note ?? null,
      updated_at: new Date(at),
    });
    for (const finding of derived.findings) {
      await insertFindingRow(conn, { ...finding, observedAt: at });
    }
    for (const rec of derived.recommendations) await insertRecommendationRow(conn, rec);
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Report",
        objectId: reportId,
        institutionCode: scope.report.institutionCode,
        action: "Memvalidasi laporan",
      },
      at,
    );
  });
  return { ok: true };
}

export async function rejectReport(
  state: IshasState,
  actor: Actor | null,
  reportId: string,
  reason: string,
): Promise<ActionResult> {
  if (!reason || reason.trim().length < 10) {
    return { ok: false, error: "Alasan penolakan minimal 10 karakter." };
  }
  const scope = scopedReport(state, actor, reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  if (scope.report.validationStatus !== "Menunggu validasi") {
    return { ok: false, error: "Hanya laporan Menunggu validasi yang dapat ditolak." };
  }
  if (scope.report.channel !== "lapor-cepat") {
    return { ok: false, error: "Hanya laporan cepat yang dapat ditolak." };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateReportFields(conn, reportId, {
      validation_status: "Ditolak",
      handling_status: "Ditolak",
      rejection_reason: reason.trim(),
      validated_by: actor?.id ?? null,
      validated_by_name: actor?.name ?? null,
      validated_by_role: actor?.role ?? null,
      validated_at: new Date(at),
      updated_at: new Date(at),
    });
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Report",
        objectId: reportId,
        institutionCode: scope.report.institutionCode,
        action: "Menolak laporan",
        note: reason.trim(),
      },
      at,
    );
  });
  return { ok: true };
}

export async function updateHandlingStatus(
  state: IshasState,
  actor: Actor | null,
  reportId: string,
  next: HandlingStatus,
  details?: {
    owner?: string;
    dueDate?: string;
    progress?: number;
    evidenceName?: string;
    note?: string;
  },
): Promise<ActionResult> {
  const scope = scopedReport(state, actor, reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  const report = scope.report;
  const previous = report.handlingStatus;
  const valid: Record<HandlingStatus, HandlingStatus[]> = {
    "Menunggu validasi": [],
    Pending: ["Proses"],
    Proses: ["Completed", "Pending"],
    Completed: ["Proses"],
    Ditolak: [],
    "Tidak berlaku": [],
  };
  if (!valid[previous].includes(next)) {
    return { ok: false, error: `Transisi ${previous} → ${next} tidak sah.` };
  }
  const recommendations = state.recommendations.filter((r) => r.reportId === reportId);
  if (next === "Proses" && previous === "Pending") {
    if (
      !details?.owner ||
      details.owner.trim().length < 2 ||
      !details?.dueDate ||
      !details?.note?.trim()
    ) {
      return {
        ok: false,
        error: "PIC, tenggat, dan catatan rencana wajib diisi untuk memulai penanganan.",
      };
    }
    if (details.dueDate < today()) {
      return { ok: false, error: "Tenggat tidak boleh berada di masa lalu." };
    }
  }
  if (next === "Completed") {
    const related = state.findings.filter((f) => f.reportId === reportId);
    if (related.some((f) => f.status !== "Terverifikasi")) {
      return { ok: false, error: "Seluruh temuan harus selesai sebelum laporan Completed." };
    }
    if (details?.progress !== 100 || !details.evidenceName?.trim() || !details.note?.trim()) {
      return {
        ok: false,
        error: "Progres 100%, bukti penyelesaian, dan catatan penutup wajib diisi.",
      };
    }
  }
  if (
    (previous === "Proses" && next === "Pending") ||
    (previous === "Completed" && next === "Proses")
  ) {
    if (!details?.note || details.note.trim().length < 10) {
      return { ok: false, error: "Alasan pengembalian status minimal 10 karakter." };
    }
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    if (next === "Proses" && previous === "Pending") {
      for (const rec of recommendations) {
        await updateRecommendationFields(conn, rec.id, {
          owner: details!.owner!.trim(),
          due_date: details!.dueDate!,
          status: "Berjalan",
          last_note: details!.note!.trim(),
        });
      }
    }
    if (next === "Completed") {
      for (const rec of recommendations) {
        await updateRecommendationFields(conn, rec.id, {
          status: "Terverifikasi",
          progress: 100,
          completion_evidence: details!.evidenceName!.trim(),
          last_note: details!.note!.trim(),
        });
      }
    }
    await updateReportFields(conn, reportId, {
      handling_status: next,
      updated_at: new Date(at),
    });
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Report",
        objectId: reportId,
        institutionCode: report.institutionCode,
        action:
          (next === "Pending" && previous === "Proses") ||
          (next === "Proses" && previous === "Completed")
            ? "Mengembalikan status"
            : "Mengubah status penanganan",
        note: `${details?.note ? `${details.note} · ` : ""}→ ${next}`,
      },
      at,
    );
  });
  return { ok: true };
}

export async function archiveCompletedReport(
  state: IshasState,
  actor: Actor | null,
  reportId: string,
  reason: string,
): Promise<ActionResult> {
  if (!reason || reason.trim().length < 5) {
    return { ok: false, error: "Alasan arsip minimal 5 karakter." };
  }
  const scope = scopedReport(state, actor, reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  if (scope.report.handlingStatus !== "Completed" || scope.report.archivedAt) {
    return {
      ok: false,
      error: "Hanya laporan Completed yang belum diarsipkan yang dapat diarsipkan.",
    };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateReportFields(conn, reportId, {
      archived_at: new Date(at),
      archived_reason: reason.trim(),
      updated_at: new Date(at),
    });
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Report",
        objectId: reportId,
        institutionCode: scope.report.institutionCode,
        action: "Mengarsipkan laporan selesai",
        note: reason.trim(),
      },
      at,
    );
  });
  return { ok: true };
}

export async function setFindingLevel(
  state: IshasState,
  actor: Actor | null,
  findingId: string,
  level: RiskLevel,
): Promise<ActionResult> {
  const allowed: RiskLevel[] = ["Rendah", "Sedang", "Tinggi", "Ekstrem"];
  if (!allowed.includes(level)) return { ok: false, error: "Tingkat risiko tidak dikenal." };
  const finding = state.findings.find((item) => item.id === findingId);
  if (!finding) return { ok: false, error: "Temuan tidak ditemukan." };
  const scope = scopedReport(state, actor, finding.reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  if (scope.report.validationStatus !== "Diterima" || scope.report.archivedAt) {
    return {
      ok: false,
      error: "Tingkat risiko hanya untuk temuan laporan Diterima yang belum diarsipkan.",
    };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateFindingFields(conn, findingId, { level, severity_text: level });
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "RiskFinding",
        objectId: findingId,
        institutionCode: scope.report.institutionCode,
        action: "Mengubah tingkat risiko temuan",
        note: level,
      },
      at,
    );
  });
  return { ok: true };
}

function pesantrenAccount(state: IshasState, actor: Actor | null): { codes: string[] } | { error: string } {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif") {
    return { error: "Sesi tidak dikenal." };
  }
  if (account.roleId !== "pesantren" || account.institutionCodes.length !== 1) {
    return { error: "Hanya Pesantren aktif yang dapat mengelola lokasi." };
  }
  return { codes: account.institutionCodes };
}

export async function addBuilding(
  state: IshasState,
  actor: Actor | null,
  input: { code: string; name: string },
): Promise<ActionResult> {
  const account = pesantrenAccount(state, actor);
  if ("error" in account) return { ok: false, error: account.error };
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (code.length < 2 || name.length < 2) {
    return { ok: false, error: "Kode dan nama gedung minimal 2 karakter." };
  }
  const institutionCode = account.codes[0];
  if (state.buildings.some((b) => b.institutionCode === institutionCode && b.code === code)) {
    return { ok: false, error: "Kode gedung sudah digunakan." };
  }
  const at = nowIso();
  const nextNumber = state.buildings.length + 1;
  const id = `BLD-${String(nextNumber).padStart(3, "0")}`;
  const building: Building = {
    id,
    institutionCode,
    code,
    name,
    floors: [
      {
        id: `FLR-${String(nextNumber).padStart(3, "0")}-1`,
        name: "Lantai 1",
        planFile: "",
        planVersion: "",
        uploadedBy: actor?.id ?? "",
        uploadedAt: at,
      },
    ],
  };
  await withTransaction(async (conn) => {
    await insertBuildingRow(conn, building);
    await writeAudit(
      conn,
      actor!,
      { objectType: "Building", objectId: id, institutionCode, action: "Menambah gedung", note: name },
      at,
    );
  });
  return { ok: true, id };
}

export async function addArea(
  state: IshasState,
  actor: Actor | null,
  input: { buildingId: string; floor: string; name: string; zone: string },
): Promise<ActionResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  const building = state.buildings.find((b) => b.id === input.buildingId);
  if (
    !account ||
    account.status !== "Aktif" ||
    account.roleId !== "pesantren" ||
    !building ||
    !account.institutionCodes.includes(building.institutionCode)
  ) {
    return { ok: false, error: "Anda tidak berwenang mengelola area ini." };
  }
  if (!input.floor.trim() || input.name.trim().length < 2 || input.zone.trim().length < 2) {
    return { ok: false, error: "Lantai, nama area, dan zona wajib diisi." };
  }
  const id = `AREA-${String(state.areas.length + 1).padStart(3, "0")}`;
  const area: Area = {
    id,
    institutionCode: building.institutionCode,
    buildingId: building.id,
    floor: input.floor.trim(),
    name: input.name.trim(),
    zone: input.zone.trim(),
    x: 50,
    y: 50,
    width: 14,
    height: 10,
  };
  const at = nowIso();
  await withTransaction(async (conn) => {
    await insertAreaRow(conn, area);
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Area",
        objectId: id,
        institutionCode: area.institutionCode,
        action: "Menambah area",
        note: `${area.floor} · ${area.name}`,
      },
      at,
    );
  });
  return { ok: true, id };
}

export async function addFloor(
  state: IshasState,
  actor: Actor | null,
  buildingId: string,
  name: string,
): Promise<ActionResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  const building = state.buildings.find((b) => b.id === buildingId);
  if (
    !account ||
    account.status !== "Aktif" ||
    account.roleId !== "pesantren" ||
    !building ||
    !account.institutionCodes.includes(building.institutionCode)
  ) {
    return { ok: false, error: "Anda tidak berwenang mengelola lantai ini." };
  }
  const floorName = name.trim();
  if (floorName.length < 2) return { ok: false, error: "Nama lantai minimal 2 karakter." };
  if (building.floors.some((item) => item.name.toLowerCase() === floorName.toLowerCase())) {
    return { ok: false, error: "Nama lantai sudah ada pada gedung ini." };
  }
  const totalFloors = state.buildings.flatMap((b) => b.floors).length;
  const id = `FLR-${String(totalFloors + 1).padStart(3, "0")}`;
  const floors = [
    ...building.floors,
    { id, name: floorName, planFile: "", planVersion: "", uploadedBy: "", uploadedAt: "" },
  ];
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateBuildingFloors(conn, buildingId, floors);
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Floor",
        objectId: id,
        institutionCode: building.institutionCode,
        action: "Menambah lantai",
        note: floorName,
      },
      at,
    );
  });
  return { ok: true, id };
}

export async function publishCampusPlan(
  state: IshasState,
  actor: Actor | null,
  input: {
    institutionCode: string;
    assetId: string;
    width: number;
    height: number;
    expectedActiveId?: string;
    acknowledged: boolean;
  },
): Promise<ActionResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  const institution = state.institutions.find((i) => i.code === input.institutionCode);
  if (
    !account ||
    account.status !== "Aktif" ||
    account.roleId !== "pesantren" ||
    account.institutionCodes.length !== 1 ||
    account.institutionCodes[0] !== input.institutionCode ||
    !institution
  ) {
    return { ok: false, error: "Anda tidak berwenang mengganti denah pesantren ini." };
  }
  if (!input.acknowledged) {
    return { ok: false, error: "Konfirmasi dampak perubahan denah terlebih dahulu." };
  }
  if (institution.activeCampusPlanVersionId !== input.expectedActiveId) {
    return {
      ok: false,
      error: "Denah aktif berubah. Muat ulang dan periksa versi terbaru sebelum mengganti.",
    };
  }
  if (
    !input.assetId.startsWith("campus-asset-") ||
    state.campusPlans.some((plan) => plan.assetId === input.assetId) ||
    !Number.isSafeInteger(input.width) ||
    !Number.isSafeInteger(input.height) ||
    Math.min(input.width, input.height) < 800
  ) {
    return {
      ok: false,
      error: "Aset atau ukuran denah tidak sah; sisi pendek minimal 800 piksel.",
    };
  }
  const revision =
    Math.max(
      0,
      ...state.campusPlans
        .filter((plan) => plan.institutionCode === input.institutionCode)
        .map((plan) => plan.revision),
    ) + 1;
  const id = `CAMPUS-${input.institutionCode}-v${revision}`;
  const at = nowIso();
  const plan: CampusPlanVersion = {
    id,
    institutionCode: input.institutionCode,
    revision,
    assetId: input.assetId,
    width: input.width,
    height: input.height,
    uploadedBy: account.id,
    uploadedAt: at,
    illustration: false,
  };
  await withTransaction(async (conn) => {
    await insertCampusPlanRow(conn, plan);
    await setActiveCampusPlan(conn, input.institutionCode, id);
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "CampusPlan",
        objectId: id,
        institutionCode: input.institutionCode,
        action: "Menerbitkan denah pesantren",
        note: `Versi ${revision}; titik lama tetap di versi asal.`,
      },
      at,
    );
  });
  return { ok: true, id };
}

export async function updateRecommendation(
  state: IshasState,
  actor: Actor | null,
  recommendationId: string,
  input: {
    owner?: string;
    dueDate?: string;
    note: string;
    progress?: number;
    evidenceName?: string;
    evidenceAssetId?: string;
    verify?: boolean;
  },
): Promise<ActionResult> {
  const recommendation = state.recommendations.find((r) => r.id === recommendationId);
  if (!recommendation) return { ok: false, error: "Rekomendasi tidak ditemukan." };
  const scope = scopedReport(state, actor, recommendation.reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  const report = scope.report;
  const note = input.note.trim();
  if (!note) return { ok: false, error: "Catatan wajib diisi." };
  if (report.validationStatus !== "Diterima" || report.archivedAt) {
    return {
      ok: false,
      error: "Tindak lanjut hanya untuk laporan Diterima yang belum diarsipkan.",
    };
  }
  const at = nowIso();
  const reportRecommendations = state.recommendations.filter((r) => r.reportId === report.id);
  let reportStatus: HandlingStatus | undefined;
  let finishEvidenceAssetId: string | undefined;
  const fields: Record<string, string | number | Date | null> = { last_note: note, updated_at: new Date(at) };

  if (input.verify) {
    if (recommendation.status !== "Menunggu verifikasi") {
      return { ok: false, error: "Rekomendasi belum diajukan untuk verifikasi." };
    }
    fields.status = "Terverifikasi";
    fields.verified_by = actor?.id ?? null;
    fields.verified_at = new Date(at);
  } else if (recommendation.status === "Belum ditindaklanjuti") {
    if (!input.owner || input.owner.trim().length < 2 || !input.dueDate || !note) {
      return {
        ok: false,
        error: "PIC, tenggat, dan catatan rencana wajib diisi untuk membuat rencana tindakan.",
      };
    }
    if (input.dueDate < today()) {
      return { ok: false, error: "Tenggat tidak boleh berada di masa lalu." };
    }
    fields.owner = input.owner.trim();
    fields.due_date = input.dueDate;
    fields.status = "Berjalan";
    reportStatus = "Proses";
  } else {
    if (recommendation.status !== "Berjalan") {
      return { ok: false, error: "Hanya rekomendasi Berjalan yang dapat diperbarui progresnya." };
    }
    const progress = input.progress;
    if (progress === undefined || !Number.isFinite(progress) || progress < 0 || progress > 100) {
      return { ok: false, error: "Progres harus antara 0 dan 100." };
    }
    const snapped = Math.min(100, Math.max(0, Math.round(progress / 25) * 25));
    fields.progress = snapped;
    if (snapped === 100) {
      if (!input.evidenceName?.trim()) {
        return { ok: false, error: "Bukti penyelesaian wajib diisi saat mengajukan selesai." };
      }
      if (input.evidenceAssetId && !/^evidence-asset-[0-9a-f-]{36}$/.test(input.evidenceAssetId)) {
        return { ok: false, error: "Lampiran bukti tidak sah. Pilih gambar kembali." };
      }
      fields.completion_evidence = input.evidenceName.trim();
      fields.completion_evidence_asset_id = input.evidenceAssetId ?? null;
      finishEvidenceAssetId = input.evidenceAssetId;
      fields.status = "Menunggu verifikasi";
    }
  }
  const allVerified =
    reportRecommendations.length > 0 &&
    reportRecommendations.every((r) =>
      (r.id === recommendation.id ? fields.status : r.status) === "Terverifikasi",
    );
  if (allVerified) reportStatus = "Completed";
  await withTransaction(async (conn) => {
    await updateRecommendationFields(conn, recommendationId, fields);
    if (finishEvidenceAssetId) {
      await setFileAssetOwner(conn, finishEvidenceAssetId, recommendationId);
    }
    if (input.verify) {
      for (const finding of state.findings.filter(
        (f) => f.recommendationId === recommendation.id,
      )) {
        await updateFindingFields(conn, finding.id, { status: "Terverifikasi" });
      }
    }
    if (reportStatus) {
      await updateReportFields(conn, report.id, {
        handling_status: reportStatus,
        updated_at: new Date(at),
      });
    }
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Recommendation",
        objectId: recommendation.id,
        institutionCode: report.institutionCode,
        action: input.verify ? "Memverifikasi tindak lanjut" : "Memperbarui tindak lanjut",
        note,
      },
      at,
    );
  });
  return { ok: true };
}

export async function cancelRecommendation(
  state: IshasState,
  actor: Actor | null,
  recommendationId: string,
  reason: string,
): Promise<ActionResult> {
  const recommendation = state.recommendations.find((r) => r.id === recommendationId);
  if (!recommendation) return { ok: false, error: "Rekomendasi tidak ditemukan." };
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Alasan pembatalan minimal 10 karakter." };
  }
  const scope = scopedReport(state, actor, recommendation.reportId);
  if (isScope(scope)) return { ok: false, error: scope.error };
  const report = scope.report;
  if (report.validationStatus !== "Diterima" || report.archivedAt) {
    return {
      ok: false,
      error: "Tindak lanjut hanya untuk laporan Diterima yang belum diarsipkan.",
    };
  }
  if (
    recommendation.status !== "Belum ditindaklanjuti" &&
    recommendation.status !== "Berjalan" &&
    recommendation.status !== "Menunggu verifikasi"
  ) {
    return { ok: false, error: "Hanya perbaikan yang belum selesai yang dapat dibatalkan." };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateRecommendationFields(conn, recommendationId, {
      status: "Dibatalkan",
      canceled_reason: trimmed,
      canceled_by: actor?.id ?? null,
      canceled_at: new Date(at),
      updated_at: new Date(at),
    });
    for (const finding of state.findings.filter((f) => f.recommendationId === recommendation.id)) {
      await updateFindingFields(conn, finding.id, { status: "Dibatalkan" });
    }
    await writeAudit(
      conn,
      actor!,
      {
        objectType: "Recommendation",
        objectId: recommendation.id,
        institutionCode: report.institutionCode,
        action: "Membatalkan tindak lanjut",
        note: trimmed,
      },
      at,
    );
  });
  return { ok: true };
}
