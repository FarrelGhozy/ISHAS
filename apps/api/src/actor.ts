// Identitas pemanggil. Fase 6: cookie sesi `ishas_session` (dihash di DB) jadi
// sumber utama. Header `X-Demo-Account: USR-xxx` hanya cadangan pengembangan
// (mirror kartu login) dan mati di production.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "./db";
import { HttpError } from "./http";
import { demoAuthEnabled } from "./config";
import { sessionTokenFrom } from "./auth/cookie";
import { findSessionUser } from "./repo/sessions";
import type { Actor } from "./router";

const ROLE_LABEL: Record<string, Actor["role"]> = {
  admin: "Super Admin",
  validator: "Validator",
  pesantren: "Pesantren",
};

function toActor(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  institution_code: string | null;
  status: string;
}): Actor {
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

async function loadDemoActor(request: Request): Promise<Actor | null> {
  const id = request.headers.get("x-demo-account")?.trim();
  if (!id) return null;
  if (!demoAuthEnabled()) {
    throw new HttpError(401, "Sesi tidak dikenal.");
  }
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
  const row = rows[0];
  if (!row) throw new HttpError(401, "Sesi tidak dikenal.");
  return toActor(row as Parameters<typeof toActor>[0]);
}

export async function loadActor(request: Request): Promise<Actor | null> {
  const token = sessionTokenFrom(request);
  if (token) {
    const session = await findSessionUser(token);
    if (session) {
      return toActor({
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        institution_code: session.institutionCode,
        status: session.status,
      });
    }
  }
  return loadDemoActor(request);
}

export function requireRole(actor: Actor | null, role: Actor["roleId"], message: string): Actor {
  if (!actor || actor.status !== "Aktif" || actor.roleId !== role) {
    throw new HttpError(403, message);
  }
  return actor;
}
