// Domain auth Fase 6 (D-30, BACKEND_API_CONTRACT §16): login, demo-login dev,
// logout, ubah sandi, rate limit, dan audit. Tidak ada sandi/hash keluar ke klien.

import type { RowDataPacket } from "mysql2/promise";
import type { Actor } from "../router";
import { pool } from "../db";
import { loginRateLimit, sessionTtlMs } from "../config";
import { hashPassword, validateNewPassword, verifyPassword } from "../auth/password";
import { RateLimiter } from "../auth/rate-limit";
import { csrfToken } from "../auth/session";
import {
  deleteOtherSessions,
  deleteSessionByToken,
  findSessionUser,
  insertSession,
} from "../repo/sessions";
import { insertAudit, withTransaction } from "../repo/writes";
import { updateUserLastActive } from "../repo/admin";

export const loginLimiter = new RateLimiter(loginRateLimit.max, loginRateLimit.windowMs);

export type AuthResult =
  | { ok: true; token: string; csrf: string; actor: Actor }
  | { ok: false; error: string; status: number };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  institution_code: string | null;
  status: string;
  password_hash: string | null;
};

const ROLE_LABEL: Record<string, Actor["role"]> = {
  admin: "Super Admin",
  validator: "Validator",
  pesantren: "Pesantren",
};

export function actorFromRow(row: UserRow): Actor {
  const roleId = row.role as Actor["roleId"];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleId,
    role: ROLE_LABEL[roleId] ?? "Pesantren",
    status: row.status as Actor["status"],
    institutionCodes: row.institution_code ? [row.institution_code] : [],
  };
}

async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
  return (rows[0] as UserRow | undefined) ?? null;
}

async function writeLoginAudit(actor: Actor, action: string, note?: string): Promise<void> {
  await withTransaction(async (conn) => {
    await insertAudit(conn, {
      id: "",
      objectType: "Auth",
      objectId: actor.id,
      actorAccountId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      institutionCode: actor.institutionCodes[0] ?? undefined,
      action,
      note,
      at: new Date().toISOString(),
    });
  });
}

async function startSession(row: UserRow, ip: string): Promise<AuthResult> {
  const actor = actorFromRow(row);
  const csrf = csrfToken();
  const token = await insertSession(row.id, sessionTtlMs);
  await withTransaction(async (conn) => {
    await updateUserLastActive(conn, row.id, new Date());
  });
  await writeLoginAudit(actor, "Masuk", `Login dari ${ip || "lokal"}.`);
  return { ok: true, token, csrf, actor };
}

// POST /auth/login — email + sandi; rate limit per IP+email.
export async function login(email: string, password: string, ip: string): Promise<AuthResult> {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "Email dan sandi wajib diisi.", status: 400 };
  }
  if (!loginLimiter.check(`${ip}:${normalized}`)) {
    return { ok: false, error: "Terlalu banyak percobaan masuk. Coba lagi nanti.", status: 429 };
  }
  const row = await findUserByEmail(normalized);
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return { ok: false, error: "Email atau sandi salah.", status: 401 };
  }
  if (row.status !== "Aktif") {
    return { ok: false, error: "Akun belum aktif. Hubungi Super Admin.", status: 403 };
  }
  return startSession(row, ip);
}

// POST /auth/demo-login — hanya di luar production; kartu login dev.
export async function demoLogin(accountId: string): Promise<AuthResult> {
  const row = await findUserById((accountId ?? "").trim());
  if (!row) return { ok: false, error: "Sesi tidak dikenal.", status: 401 };
  return startSession(row, "demo");
}

// POST /auth/logout — hapus baris sesi.
export async function logout(token: string | null): Promise<void> {
  if (!token) return;
  const row = await findSessionUser(token);
  await deleteSessionByToken(token);
  if (row) {
    await writeLoginAudit(
      actorFromRow({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        institution_code: row.institutionCode,
        status: row.status,
        password_hash: null,
      }),
      "Keluar",
    );
  }
}

// POST /auth/password — sandi lama wajib benar; cabut sesi lain.
export async function changePassword(
  actor: Actor,
  oldPassword: string,
  newPassword: string,
  currentToken: string | null,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const row = await findUserById(actor.id);
  if (!row) return { ok: false, error: "Pengguna tidak ditemukan.", status: 404 };
  if (!(await verifyPassword(oldPassword, row.password_hash))) {
    return { ok: false, error: "Sandi lama tidak sesuai.", status: 400 };
  }
  const invalid = validateNewPassword(newPassword);
  if (invalid) return { ok: false, error: invalid, status: 400 };
  const passwordHash = await hashPassword(newPassword);
  await withTransaction(async (conn) => {
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, actor.id]);
  });
  await deleteOtherSessions(actor.id, currentToken);
  await writeLoginAudit(actor, "Mengubah kata sandi");
  return { ok: true };
}
