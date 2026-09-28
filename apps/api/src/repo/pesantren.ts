// Penulisan domain Pesantren (Fase 2): laporan, temuan, rekomendasi, lokasi,
// denah, dan audit — semuanya dalam transaksi di pemanggil.

import type { RowDataPacket } from "mysql2/promise";
import type { Area, Building, CampusPlanVersion, Recommendation, RiskFinding } from "../../../web/mocks/types";
import type { Tx } from "./writes";

type SqlValue = string | number | boolean | Date | null;

async function dynamicUpdate(
  conn: Tx,
  table: string,
  idColumn: string,
  id: string,
  fields: Record<string, SqlValue>,
): Promise<void> {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) return;
  const setSql = entries.map(([column]) => `\`${column}\` = ?`).join(", ");
  await conn.query(`UPDATE \`${table}\` SET ${setSql} WHERE \`${idColumn}\` = ?`, [
    ...entries.map(([, value]) => (value === undefined ? null : value)),
    id,
  ]);
}

const jsonOrNull = (value: unknown): string | null =>
  value === undefined || value === null ? null : JSON.stringify(value);

export async function updateReportFields(
  conn: Tx,
  reportId: string,
  fields: Record<string, SqlValue>,
): Promise<void> {
  await dynamicUpdate(conn, "reports", "id", reportId, fields);
}

export async function updateRecommendationFields(
  conn: Tx,
  recommendationId: string,
  fields: Record<string, SqlValue>,
): Promise<void> {
  await dynamicUpdate(conn, "recommendations", "id", recommendationId, fields);
}

export async function updateFindingFields(
  conn: Tx,
  findingId: string,
  fields: Record<string, SqlValue>,
): Promise<void> {
  await dynamicUpdate(conn, "findings", "id", findingId, fields);
}

export async function insertFindingRow(conn: Tx, finding: RiskFinding): Promise<void> {
  await conn.query(
    `INSERT INTO findings (
      id, report_id, area_id, building_id, recommendation_id, source_answer_id,
      category_id, aspect_id, level, status, issue, instrument_version, location,
      building, zone, floor, x, y, indicator, recommendation, hazard, impact,
      likelihood, severity_text, exposed_people, existing_control, evidence,
      location_snapshot, observed_at, plan_version, residual_risk
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      finding.id,
      finding.reportId,
      finding.areaId || null,
      finding.buildingId || null,
      finding.recommendationId || null,
      finding.sourceAnswerId ?? null,
      finding.categoryId ?? null,
      finding.aspectId ?? null,
      finding.level,
      finding.status,
      finding.issue,
      finding.instrumentVersion,
      finding.location,
      finding.building,
      finding.zone,
      finding.floor,
      finding.x,
      finding.y,
      finding.indicator,
      finding.recommendation,
      finding.hazard,
      finding.impact,
      finding.likelihood,
      finding.severityText,
      finding.exposedPeople,
      finding.existingControl,
      finding.evidence,
      jsonOrNull(finding.locationSnapshot),
      finding.observedAt ? new Date(finding.observedAt) : null,
      finding.planVersion,
      finding.residualRisk,
    ],
  );
}

export async function insertRecommendationRow(conn: Tx, rec: Recommendation): Promise<void> {
  await conn.query(
    `INSERT INTO recommendations (
      id, report_id, priority, title, location, source, action, status, owner,
      due_date, progress, last_note, completion_evidence, completion_evidence_asset_id,
      canceled_reason, canceled_by, canceled_at, verified_by, verified_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      rec.id,
      rec.reportId,
      rec.priority,
      rec.title,
      rec.location,
      rec.source,
      rec.action,
      rec.status,
      rec.owner || null,
      rec.dueDate || null,
      rec.progress,
      rec.lastNote ?? null,
      rec.completionEvidence ?? null,
      rec.completionEvidenceAssetId ?? null,
      rec.canceledReason ?? null,
      rec.canceledBy ?? null,
      rec.canceledAt ? new Date(rec.canceledAt) : null,
      rec.verifiedBy ?? null,
      rec.verifiedAt ? new Date(rec.verifiedAt) : null,
      rec.updatedAt ? new Date(rec.updatedAt) : new Date(),
    ],
  );
}

export async function insertBuildingRow(conn: Tx, building: Building): Promise<void> {
  await conn.query(
    "INSERT INTO buildings (id, institution_code, code, name, floors) VALUES (?,?,?,?,?)",
    [
      building.id,
      building.institutionCode,
      building.code,
      building.name,
      JSON.stringify(building.floors),
    ],
  );
}

export async function updateBuildingFloors(
  conn: Tx,
  buildingId: string,
  floors: Building["floors"],
): Promise<void> {
  await conn.query("UPDATE buildings SET floors = ? WHERE id = ?", [
    JSON.stringify(floors),
    buildingId,
  ]);
}

export async function insertAreaRow(conn: Tx, area: Area): Promise<void> {
  await conn.query(
    `INSERT INTO areas (
      id, institution_code, building_id, floor, name, zone, x, y, width, height
    ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      area.id,
      area.institutionCode,
      area.buildingId,
      area.floor,
      area.name,
      area.zone,
      area.x,
      area.y,
      area.width,
      area.height,
    ],
  );
}

export async function insertCampusPlanRow(conn: Tx, plan: CampusPlanVersion): Promise<void> {
  await conn.query(
    `INSERT INTO campus_plans (
      id, institution_code, revision, asset_id, width, height, uploaded_by, uploaded_at, illustration
    ) VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      plan.id,
      plan.institutionCode,
      plan.revision,
      plan.assetId,
      plan.width,
      plan.height,
      plan.uploadedBy,
      new Date(plan.uploadedAt),
      plan.illustration,
    ],
  );
}

export async function setActiveCampusPlan(
  conn: Tx,
  institutionCode: string,
  planId: string,
): Promise<void> {
  await conn.query("UPDATE institutions SET active_campus_plan_id = ? WHERE code = ?", [
    planId,
    institutionCode,
  ]);
}

export async function loadReportRow(conn: Tx, reportId: string): Promise<RowDataPacket | null> {
  const [rows] = await conn.query<RowDataPacket[]>("SELECT * FROM reports WHERE id = ?", [reportId]);
  return rows[0] ?? null;
}

export async function countFindings(conn: Tx, reportId: string): Promise<number> {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS n FROM findings WHERE report_id = ?",
    [reportId],
  );
  return Number(rows[0]?.n ?? 0);
}
