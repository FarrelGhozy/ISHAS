// Akses tabel `sessions` (Fase 6). Token cookie di-hash SHA-256; baris
// kedaluwarsa dibersihkan saat dibaca dan lewat job sweep.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";
import { createSessionToken, sha256Hex } from "../auth/session";

export type SessionUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionCode: string | null;
  status: string;
  passwordHash: string | null;
  sessionId: string;
  expiresAt: Date;
};

export async function insertSession(userId: string, ttlMs: number): Promise<string> {
  const { id, token, tokenHash } = createSessionToken();
  const expiresAt = new Date(Date.now() + ttlMs);
  await pool.query(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?,?,?,?)",
    [id, userId, tokenHash, expiresAt],
  );
  return token;
}

export async function findSessionUser(token: string): Promise<SessionUserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id AS session_id, s.expires_at,
            u.id, u.name, u.email, u.role, u.institution_code, u.status, u.password_hash
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
    [sha256Hex(token)],
  );
  const row = rows[0];
  if (!row) return null;
  const expiresAt = new Date(row.expires_at);
  if (expiresAt.getTime() <= Date.now()) {
    await deleteSessionById(String(row.session_id));
    return null;
  }
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    institutionCode: row.institution_code ? String(row.institution_code) : null,
    status: String(row.status),
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    sessionId: String(row.session_id),
    expiresAt,
  };
}

async function deleteSessionById(sessionId: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id = ?", [sessionId]);
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = ?", [sha256Hex(token)]);
}

// Cabut semua sesi lain setelah ganti sandi (sesi saat ini dipertahankan bila ada).
export async function deleteOtherSessions(userId: string, keepToken: string | null): Promise<void> {
  if (keepToken) {
    await pool.query("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?", [
      userId,
      sha256Hex(keepToken),
    ]);
  } else {
    await pool.query("DELETE FROM sessions WHERE user_id = ?", [userId]);
  }
}

export async function purgeExpiredSessions(): Promise<number> {
  const [result] = await pool.query("DELETE FROM sessions WHERE expires_at <= NOW(3)");
  return (result as unknown as { affectedRows: number }).affectedRows ?? 0;
}
