// Penulisan domain Fase 1 ke MySQL. Semua mutasi berjalan dalam transaksi agar
// penomoran `sequences` dan baris turunan konsisten (BACKEND_DATA_MODEL §9).

import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "../db";
import type { AuditEvent, Notification, Report, SelfAssessmentSnapshot } from "../../../web/mocks/types";

export type Tx = PoolConnection;

export async function withTransaction<T>(run: (conn: Tx) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await run(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Ambil nilai urut lalu naikkan (SELECT ... FOR UPDATE) — pengganti counters mock.
export async function nextSequence(conn: Tx, name: string): Promise<number> {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT value FROM sequences WHERE seq_name = ? FOR UPDATE",
    [name],
  );
  const current = rows[0] ? Number(rows[0].value) : 1;
  if (rows[0]) {
    await conn.query("UPDATE sequences SET value = ? WHERE seq_name = ?", [current + 1, name]);
  } else {
    await conn.query("INSERT INTO sequences (seq_name, value) VALUES (?, ?)", [name, current + 1]);
  }
  return current;
}

export function reportIdFrom(n: number): string {
  return `RPT-${String(n).padStart(4, "0")}`;
}

function jsonOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

export async function findReportIdByClientRequest(conn: Tx, requestId: string): Promise<string | null> {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT id FROM reports WHERE client_request_id = ?",
    [requestId],
  );
  return rows[0] ? String(rows[0].id) : null;
}

export async function insertReport(conn: Tx, report: Report, clientRequestId?: string): Promise<void> {
  await conn.query(
    `INSERT INTO reports (
      id, channel, institution_code, area_id, manual_location, reporter_name,
      reporter_user_id, reporter_account_email, reporter_contact, reporter_severity,
      reporter_priority, reporter_recommendation, category_id, aspect_id, indicator_id,
      title, description, evidence_asset_id, evidence_name, location_snapshot,
      validation_status, severity, priority, handling_status, instrument_version_id,
      instrument_checksum, score_percent, pdf_generated_at, observed_at, client_request_id,
      created_at, submitted_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      report.id,
      report.channel,
      report.institutionCode,
      report.areaId ?? null,
      report.manualLocation ?? null,
      report.reporterName,
      report.reporterUserId ?? null,
      report.reporterAccountEmail ?? null,
      report.contact ?? null,
      report.reporterSeverity ?? "Belum ditentukan",
      report.reporterPriority ?? "Belum ditentukan",
      report.reporterRecommendation ?? null,
      report.categoryId ?? null,
      report.aspectId ?? null,
      report.indicatorId ?? null,
      report.title,
      report.description,
      report.evidenceAssetId ?? null,
      report.evidenceName ?? null,
      jsonOrNull(report.locationSnapshot),
      report.validationStatus,
      report.severity,
      report.priority,
      report.handlingStatus,
      report.instrumentVersionId ?? null,
      report.instrumentChecksum ?? null,
      report.scorePercent ?? null,
      report.pdfGeneratedAt ? new Date(report.pdfGeneratedAt) : null,
      report.observedAt ? new Date(report.observedAt) : null,
      clientRequestId ?? null,
      new Date(report.createdAt),
      report.submittedAt ? new Date(report.submittedAt) : new Date(report.createdAt),
      report.updatedAt ? new Date(report.updatedAt) : new Date(report.createdAt),
    ],
  );
}

export async function insertSnapshot(conn: Tx, snapshot: SelfAssessmentSnapshot): Promise<void> {
  await conn.query(
    `INSERT INTO self_assessment_snapshots (
      report_id, instrument_version_id, instrument_checksum, answers, frozen_indicators,
      score_percent, by_dimension, submitted_at
    ) VALUES (?,?,?,?,?,?,?,?)`,
    [
      snapshot.reportId,
      snapshot.instrumentVersionId,
      snapshot.instrumentChecksum ?? "",
      JSON.stringify(snapshot.answers),
      JSON.stringify(snapshot.frozenIndicators ?? []),
      snapshot.scorePercent ?? null,
      jsonOrNull(snapshot.byDimension),
      new Date(snapshot.submittedAt),
    ],
  );
}

export async function insertAudit(conn: Tx, event: AuditEvent): Promise<void> {
  await conn.query(
    `INSERT INTO audit_events (
      object_type, object_id, actor_account_id, actor_name, actor_role,
      institution_code, action, note, at
    ) VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      event.objectType,
      event.objectId,
      event.actorAccountId ?? null,
      event.actorName,
      event.actorRole ?? "Publik",
      event.institutionCode ?? null,
      event.action,
      event.note ?? null,
      new Date(event.at),
    ],
  );
}

export async function insertNotifications(conn: Tx, list: Notification[]): Promise<void> {
  for (const n of list) {
    await conn.query(
      `INSERT INTO notifications (
        recipient_account_id, institution_code, source_object_id, message, target_url, is_read, at
      ) VALUES (?,?,?,?,?,?,?)`,
      [
        n.recipientAccountId ?? null,
        n.institutionCode ?? null,
        n.sourceObjectId,
        n.message,
        n.targetUrl,
        n.read,
        new Date(n.at),
      ],
    );
  }
}

export async function upsertDraft(
  conn: Tx,
  draft: {
    id: string;
    institutionCode: string;
    reporterUserId?: string;
    reporterName: string;
    contact?: string;
    instrumentVersionId: string;
    payload: unknown;
    instrumentChecksum: string;
  },
): Promise<void> {
  await conn.query(
    `INSERT INTO self_assessment_drafts (
      id, institution_code, reporter_user_id, reporter_name, contact,
      instrument_version_id, payload, instrument_checksum, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      institution_code = VALUES(institution_code),
      reporter_user_id = VALUES(reporter_user_id),
      reporter_name = VALUES(reporter_name),
      contact = VALUES(contact),
      instrument_version_id = VALUES(instrument_version_id),
      payload = VALUES(payload),
      instrument_checksum = VALUES(instrument_checksum),
      updated_at = VALUES(updated_at)`,
    [
      draft.id,
      draft.institutionCode,
      draft.reporterUserId ?? null,
      draft.reporterName,
      draft.contact ?? null,
      draft.instrumentVersionId,
      JSON.stringify(draft.payload),
      draft.instrumentChecksum,
      new Date(),
    ],
  );
}

export async function deleteDraft(conn: Tx, draftId: string): Promise<boolean> {
  const [result] = await conn.query<RowDataPacket[]>(
    "DELETE FROM self_assessment_drafts WHERE id = ?",
    [draftId],
  );
  return (result as unknown as { affectedRows: number }).affectedRows > 0;
}

export async function loadDraftRow(conn: Tx, draftId: string): Promise<RowDataPacket | null> {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM self_assessment_drafts WHERE id = ?",
    [draftId],
  );
  return rows[0] ?? null;
}
