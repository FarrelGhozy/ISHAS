// Helper seed: insert massal + reset + normalisasi tipe mock → kolom SQL.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";

export const ALL_TABLES = [
  "app_settings",
  "index_history",
  "sequences",
  "notifications",
  "audit_events",
  "sam_follow_ups",
  "sam_assessments",
  "sam_questions",
  "sam_categories",
  "instrument_docs",
  "recommendations",
  "findings",
  "lapor_drafts",
  "self_assessment_drafts",
  "self_assessment_snapshots",
  "reports",
  "campus_plans",
  "areas",
  "buildings",
  "instrument_version_indicators",
  "instrument_version_dimensions",
  "instrument_versions",
  "bank_options",
  "bank_indicators",
  "bank_dimensions",
  "instrument_meta",
  "file_assets",
  "k3_aspects",
  "k3_categories",
  "sessions",
  "users",
  "institutions",
] as const;

export async function truncateAll(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS=0");
    for (const table of ALL_TABLES) {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS=1");
  } finally {
    conn.release();
  }
}

// `undefined` dilarang mysql2 → normalisasi ke null.
export type SqlValue = string | number | boolean | Date | null;

export async function insertRows(
  table: string,
  columns: string[],
  rows: SqlValue[][],
): Promise<void> {
  if (rows.length === 0) return;
  const prepared = rows.map((row) => row.map((value) => (value === undefined ? null : value)));
  const group = `(${columns.map(() => "?").join(", ")})`;
  const sql = `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES ${prepared
    .map(() => group)
    .join(", ")}`;
  await pool.query(sql, prepared.flat());
}

export function toDateTime(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function json(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

export function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function countRows(table: string): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM \`${table}\``);
  return Number(rows[0]?.n ?? 0);
}
