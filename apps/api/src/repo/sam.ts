// Penulisan bank + pengamatan SAM-iSAFE (Fase 4). Semua mutasi dijalankan dalam
// transaksi di pemanggil (domain/sam.ts).

import type { SamAnswer, SamAssessment, SamFollowUp } from "../../../web/mocks/types";
import type { Tx } from "./writes";

type SqlValue = string | number | boolean | Date | null;

async function dynamicUpdate(
  conn: Tx,
  table: string,
  idColumn: string,
  id: string,
  fields: Record<string, SqlValue | undefined>,
): Promise<void> {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) return;
  const setSql = entries.map(([column]) => `\`${column}\` = ?`).join(", ");
  await conn.query(`UPDATE \`${table}\` SET ${setSql} WHERE \`${idColumn}\` = ?`, [
    ...entries.map(([, value]) => (value === undefined ? null : value)),
    id,
  ]);
}

export async function insertSamCategory(
  conn: Tx,
  row: { id: string; name: string; description: string; sortOrder: number; isActive: boolean },
): Promise<void> {
  await conn.query(
    "INSERT INTO sam_categories (id, name, description, sort_order, is_active) VALUES (?,?,?,?,?)",
    [row.id, row.name, row.description || null, row.sortOrder, row.isActive],
  );
}

export async function updateSamCategoryFields(
  conn: Tx,
  id: string,
  fields: { name?: string; description?: string },
): Promise<void> {
  await dynamicUpdate(conn, "sam_categories", "id", id, {
    name: fields.name,
    description: fields.description,
  });
}

export async function deleteSamCategoryRow(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM sam_categories WHERE id = ?", [id]);
}

export async function insertSamQuestion(
  conn: Tx,
  row: {
    id: string;
    categoryId: string;
    text: string;
    panduan: string;
    contohBukti: string;
    sortOrder: number;
    isActive: boolean;
  },
): Promise<void> {
  await conn.query(
    `INSERT INTO sam_questions (id, category_id, text, panduan, contoh_bukti, sort_order, is_active)
     VALUES (?,?,?,?,?,?,?)`,
    [row.id, row.categoryId, row.text, row.panduan, row.contohBukti, row.sortOrder, row.isActive],
  );
}

export async function updateSamQuestionFields(
  conn: Tx,
  id: string,
  fields: {
    categoryId?: string;
    text?: string;
    panduan?: string;
    contohBukti?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<void> {
  await dynamicUpdate(conn, "sam_questions", "id", id, {
    category_id: fields.categoryId,
    text: fields.text,
    panduan: fields.panduan,
    contoh_bukti: fields.contohBukti,
    sort_order: fields.sortOrder,
    is_active: fields.isActive,
  });
}

export async function deleteSamQuestionRow(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM sam_questions WHERE id = ?", [id]);
}

export async function insertSamAssessment(conn: Tx, assessment: SamAssessment): Promise<void> {
  await conn.query(
    `INSERT INTO sam_assessments (
      id, institution_code, area_id, manual_location, observer_account_id, observer_name,
      observed_at, observed_time, kind, note, status, answers, total_score, max_score,
      percent, risk_level, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      assessment.id,
      assessment.institutionCode,
      assessment.areaId ?? null,
      assessment.manualLocation ?? null,
      assessment.observerAccountId ?? null,
      assessment.observerName,
      assessment.observedAt,
      assessment.observedTime ?? null,
      assessment.kind,
      assessment.note ?? null,
      assessment.status,
      JSON.stringify(assessment.answers),
      assessment.totalScore,
      assessment.maxScore,
      assessment.percent,
      assessment.riskLevel,
      new Date(assessment.createdAt),
    ],
  );
}

export async function updateSamAssessmentFields(
  conn: Tx,
  id: string,
  fields: {
    answers?: Record<string, SamAnswer>;
    totalScore?: number;
    maxScore?: number;
    percent?: number;
    riskLevel?: string;
    status?: string;
    completedAt?: Date | null;
    reviewedBy?: string | null;
    reviewedById?: string | null;
    reviewedAt?: Date | null;
    reviewNote?: string | null;
  },
): Promise<void> {
  await dynamicUpdate(conn, "sam_assessments", "id", id, {
    answers: fields.answers === undefined ? undefined : JSON.stringify(fields.answers),
    total_score: fields.totalScore,
    max_score: fields.maxScore,
    percent: fields.percent,
    risk_level: fields.riskLevel,
    status: fields.status,
    completed_at: fields.completedAt,
    reviewed_by: fields.reviewedBy,
    reviewed_by_id: fields.reviewedById,
    reviewed_at: fields.reviewedAt,
    review_note: fields.reviewNote,
  });
}

export async function deleteSamAssessmentRow(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM sam_assessments WHERE id = ?", [id]);
}

export async function insertSamFollowUp(conn: Tx, followUp: SamFollowUp): Promise<void> {
  await conn.query(
    `INSERT INTO sam_follow_ups (
      id, assessment_id, question_id, title, note, pic, due_date, status,
      created_by, created_at, updated_at, done_at, cancel_reason
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      followUp.id,
      followUp.assessmentId,
      followUp.questionId,
      followUp.title,
      followUp.note ?? null,
      followUp.pic,
      followUp.dueDate,
      followUp.status,
      followUp.createdBy ?? null,
      new Date(followUp.createdAt),
      new Date(followUp.updatedAt),
      followUp.doneAt ? new Date(followUp.doneAt) : null,
      followUp.cancelReason ?? null,
    ],
  );
}

export async function updateSamFollowUpFields(
  conn: Tx,
  id: string,
  fields: {
    status?: string;
    pic?: string;
    dueDate?: string;
    note?: string | null;
    doneAt?: Date | null;
    cancelReason?: string | null;
    updatedAt?: Date;
  },
): Promise<void> {
  await dynamicUpdate(conn, "sam_follow_ups", "id", id, {
    status: fields.status,
    pic: fields.pic,
    due_date: fields.dueDate,
    note: fields.note,
    done_at: fields.doneAt,
    cancel_reason: fields.cancelReason,
    updated_at: fields.updatedAt,
  });
}
