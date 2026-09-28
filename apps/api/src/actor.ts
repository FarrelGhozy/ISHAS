// Identitas pemanggil Fase 1–5: header `X-Demo-Account: USR-xxx` (cermin kartu
// login), hanya aktif di luar production. Fase 6 menggantinya dengan cookie sesi.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "./db";
import { HttpError } from "./http";
import type { Actor } from "./router";

const ROLE_LABEL: Record<string, Actor["role"]> = {
  admin: "Super Admin",
  validator: "Validator",
  pesantren: "Pesantren",
};

function demoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function loadActor(request: Request): Promise<Actor | null> {
  const id = request.headers.get("x-demo-account")?.trim();
  if (!id) return null;
  if (!demoAuthEnabled()) {
    throw new HttpError(401, "Sesi tidak dikenal.");
  }
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
  const row = rows[0];
  if (!row) throw new HttpError(401, "Sesi tidak dikenal.");
  const roleId = String(row.role) as Actor["roleId"];
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    roleId,
    role: ROLE_LABEL[roleId] ?? "Pesantren",
    status: row.status,
    institutionCodes: row.institution_code ? [String(row.institution_code)] : [],
  };
}

export function requireRole(actor: Actor | null, role: Actor["roleId"], message: string): Actor {
  if (!actor || actor.status !== "Aktif" || actor.roleId !== role) {
    throw new HttpError(403, message);
  }
  return actor;
}
