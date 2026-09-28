// Penulisan bank instrumen live (Fase 3): dimensi, indikator, opsi, checksum.
// Semua mutasi dijalankan dalam transaksi di pemanggil (domain/bank.ts).

import type { InstrumentOption } from "../../../web/mocks/types";
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

export async function insertBankDimension(
  conn: Tx,
  row: { id: string; name: string; categoryId: string | null; sortOrder: number },
): Promise<void> {
  await conn.query(
    "INSERT INTO bank_dimensions (id, name, category_id, sort_order) VALUES (?,?,?,?)",
    [row.id, row.name, row.categoryId, row.sortOrder],
  );
}

export async function updateBankDimension(
  conn: Tx,
  id: string,
  fields: { name?: string; categoryId?: string | null },
): Promise<void> {
  await dynamicUpdate(conn, "bank_dimensions", "id", id, {
    name: fields.name,
    category_id: fields.categoryId,
  });
}

export async function deleteBankDimension(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM bank_dimensions WHERE id = ?", [id]);
}

export async function insertBankIndicator(
  conn: Tx,
  row: {
    id: string;
    dimensionId: string;
    code: string;
    title: string;
    prompt: string;
    answerType: string;
    required: boolean;
    evidenceRequired: boolean;
    locationRequired: boolean;
    weight: number;
    categoryId: string | null;
    aspectId: string | null;
    sortOrder: number;
    options: InstrumentOption[];
  },
): Promise<void> {
  await conn.query(
    `INSERT INTO bank_indicators (
      id, dimension_id, code, title, prompt, answer_type, is_required,
      evidence_required, location_required, weight, category_id, aspect_id, sort_order
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.id,
      row.dimensionId,
      row.code,
      row.title,
      row.prompt,
      row.answerType,
      row.required,
      row.evidenceRequired,
      row.locationRequired,
      row.weight,
      row.categoryId,
      row.aspectId,
      row.sortOrder,
    ],
  );
  await replaceBankOptions(conn, row.id, row.options);
}

export async function updateBankIndicator(
  conn: Tx,
  id: string,
  fields: {
    code?: string;
    title?: string;
    prompt?: string;
    answerType?: string;
    required?: boolean;
    evidenceRequired?: boolean;
    locationRequired?: boolean;
    weight?: number;
    categoryId?: string | null;
    aspectId?: string | null;
  },
): Promise<void> {
  await dynamicUpdate(conn, "bank_indicators", "id", id, {
    code: fields.code,
    title: fields.title,
    prompt: fields.prompt,
    answer_type: fields.answerType,
    is_required: fields.required,
    evidence_required: fields.evidenceRequired,
    location_required: fields.locationRequired,
    weight: fields.weight,
    category_id: fields.categoryId,
    aspect_id: fields.aspectId,
  });
}

export async function deleteBankIndicator(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM bank_indicators WHERE id = ?", [id]);
}

// Ganti seluruh opsi indikator (tombol Atur Bobot) — hapus lalu sisipkan ulang.
export async function replaceBankOptions(
  conn: Tx,
  indicatorId: string,
  options: InstrumentOption[],
): Promise<void> {
  await conn.query("DELETE FROM bank_options WHERE indicator_id = ?", [indicatorId]);
  for (const [index, option] of options.entries()) {
    await conn.query(
      "INSERT INTO bank_options (indicator_id, value, label, weight, is_finding, sort_order) VALUES (?,?,?,?,?,?)",
      [indicatorId, option.value, option.label, option.weight, option.isFinding, index + 1],
    );
  }
}

export async function updateInstrumentChecksum(
  conn: Tx,
  checksum: string,
  updatedAt: Date,
): Promise<void> {
  await conn.query(
    "UPDATE instrument_meta SET checksum = ?, updated_at = ? WHERE id = 'INS-LIVE'",
    [checksum, updatedAt],
  );
}
