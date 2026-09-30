// Penulisan domain Super Admin (Fase 5): pesantren, pengguna, setelan, notifikasi.
// Mutasi non-notifikasi dijalankan dalam transaksi di pemanggil (domain/admin.ts).

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";
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

export async function insertInstitutionRow(
  conn: Tx,
  row: { code: string; name: string; city: string; address: string; manager: string; status: string },
): Promise<void> {
  await conn.query(
    "INSERT INTO institutions (code, name, city, address, manager, status) VALUES (?,?,?,?,?,?)",
    [row.code, row.name, row.city, row.address, row.manager, row.status],
  );
}

export async function updateInstitutionStatus(
  conn: Tx,
  code: string,
  status: string,
): Promise<void> {
  await conn.query("UPDATE institutions SET status = ? WHERE code = ?", [status, code]);
}

export async function insertUserRow(
  conn: Tx,
  row: {
    id: string;
    name: string;
    email: string;
    role: string;
    institutionCode: string | null;
    status: string;
    passwordHash?: string | null;
  },
): Promise<void> {
  await conn.query(
    "INSERT INTO users (id, name, email, role, institution_code, status, password_hash) VALUES (?,?,?,?,?,?,?)",
    [
      row.id,
      row.name,
      row.email,
      row.role,
      row.institutionCode,
      row.status,
      row.passwordHash ?? null,
    ],
  );
}

export async function updateUserRow(
  conn: Tx,
  id: string,
  fields: {
    name?: string;
    email?: string;
    role?: string;
    institutionCode?: string | null;
    status?: string;
    passwordHash?: string | null;
  },
): Promise<void> {
  await dynamicUpdate(conn, "users", "id", id, {
    name: fields.name,
    email: fields.email,
    role: fields.role,
    institution_code: fields.institutionCode,
    status: fields.status,
    password_hash: fields.passwordHash,
  });
}

export async function updateUserLastActive(conn: Tx, id: string, at: Date): Promise<void> {
  await conn.query("UPDATE users SET last_active_at = ? WHERE id = ?", [at, id]);
}

export async function deleteUserRow(conn: Tx, id: string): Promise<void> {
  await conn.query("DELETE FROM users WHERE id = ?", [id]);
}

export async function setInstitutionActiveCampusPlan(
  conn: Tx,
  code: string,
  planId: string | null,
): Promise<void> {
  await conn.query("UPDATE institutions SET active_campus_plan_id = ? WHERE code = ?", [planId, code]);
}

// Setelan aplikasi (flag sekali-jalan).
export async function getSetting(key: string): Promise<string | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT setting_value FROM app_settings WHERE setting_key = ?",
    [key],
  );
  return rows[0] ? String(rows[0].setting_value) : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    "INSERT INTO app_settings (setting_key, setting_value) VALUES (?,?) " +
      "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    [key, value],
  );
}

// Tandai notifikasi dibaca untuk satu akun (semua bila `ids` kosong).
export async function markNotificationsRead(accountId: string, ids: number[]): Promise<number> {
  const [result] =
    ids.length === 0
      ? await pool.query(
          "UPDATE notifications SET is_read = 1 WHERE recipient_account_id = ? AND is_read = 0",
          [accountId],
        )
      : await pool.query(
          `UPDATE notifications SET is_read = 1 WHERE recipient_account_id = ? AND id IN (${ids
            .map(() => "?")
            .join(",")})`,
          [accountId, ...ids],
        );
  return (result as unknown as { affectedRows: number }).affectedRows ?? 0;
}
