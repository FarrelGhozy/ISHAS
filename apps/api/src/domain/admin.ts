// Validasi + mutasi Super Admin (Fase 5) — port 1:1 `mock-store.ts` §addUser…
// setInstitutionStatus + resetMockData. Pesan Indonesia identik mock.

import type { AuditEvent, Institution, IshasState, User } from "../../../web/mocks/types";
import type { Actor } from "../router";
import { insertAudit, withTransaction } from "../repo/writes";
import {
  deleteUserRow,
  insertInstitutionRow,
  insertUserRow,
  updateInstitutionStatus,
  updateUserRow,
} from "../repo/admin";
import { seedDemo } from "../seed/demo";
import { clearStorageDir } from "../storage";
import { hashPassword } from "../auth/password";
import { seedDefaultPassword } from "../config";

export type AdminActionResult = { ok: true; id?: string } | { ok: false; error: string };

const nowIso = (): string => new Date().toISOString();
const pad = (value: number, size: number): string => String(value).padStart(size, "0");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORBIDDEN = "Anda tidak berwenang mengelola data admin.";

function requireAdmin(state: IshasState, actor: Actor | null): { error: string } | null {
  const account = actor ? state.users.find((user) => user.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "admin") {
    return { error: FORBIDDEN };
  }
  return null;
}

async function writeAudit(
  conn: Parameters<typeof insertAudit>[0],
  actor: Actor,
  objectType: string,
  objectId: string,
  action: string,
  note?: string,
): Promise<void> {
  await insertAudit(conn, {
    id: "",
    objectType,
    objectId,
    actorAccountId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as never,
    action,
    note,
    at: nowIso(),
  });
}

function nextInstitutionCode(state: IshasState): string {
  const max = state.institutions.reduce((value, item) => {
    const parsed = Number.parseInt(item.code.replace(/\D+/g, ""), 10);
    return Number.isFinite(parsed) ? Math.max(value, parsed) : value;
  }, 0);
  return `PSN-${pad(max + 1, 4)}`;
}

function nextUserId(state: IshasState): string {
  const max = state.users.reduce((value, user) => {
    const parsed = Number.parseInt(user.id.replace(/\D+/g, ""), 10);
    return Number.isFinite(parsed) ? Math.max(value, parsed) : value;
  }, 0);
  return `USR-${pad(max + 1, 3)}`;
}

export async function addInstitution(
  state: IshasState,
  actor: Actor | null,
  input: { name: string; location: string; address?: string; manager?: string; status?: string },
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const name = input.name.trim();
  const location = input.location.trim();
  const address = (input.address ?? "").trim();
  const manager = (input.manager ?? "").trim();
  if (name.length < 3) return { ok: false, error: "Nama pesantren minimal 3 karakter." };
  if (name.length > 120) return { ok: false, error: "Nama pesantren maksimal 120 karakter." };
  if (location.length < 3) return { ok: false, error: "Kota/kabupaten minimal 3 karakter." };
  if (address.length < 10) return { ok: false, error: "Alamat lengkap minimal 10 karakter." };
  if (manager.length < 2) return { ok: false, error: "Penanggung jawab minimal 2 karakter." };
  if (state.institutions.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "Nama pesantren sudah digunakan." };
  }
  const status = input.status === "Aktif" ? "Aktif" : "Persiapan";
  const id = nextInstitutionCode(state);
  await withTransaction(async (conn) => {
    await insertInstitutionRow(conn, { code: id, name, city: location, address, manager, status });
    await writeAudit(conn, actor as Actor, "Institution", id, "Membuat data pesantren");
  });
  return { ok: true, id };
}

export async function setInstitutionStatus(
  state: IshasState,
  actor: Actor | null,
  code: string,
  status: Institution["status"],
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const target = state.institutions.find((item) => item.code === code);
  if (!target) return { ok: false, error: "Pesantren tidak ditemukan." };
  if (status !== "Persiapan" && status !== "Aktif" && status !== "Nonaktif") {
    return { ok: false, error: "Status pesantren tidak dikenal." };
  }
  await withTransaction(async (conn) => {
    await updateInstitutionStatus(conn, code, status);
    await writeAudit(conn, actor as Actor, "Institution", code, "Mengubah status pesantren", status);
  });
  return { ok: true };
}

export async function addUser(
  state: IshasState,
  actor: Actor | null,
  input: {
    name: string;
    email: string;
    roleId: User["roleId"];
    institutionCode?: string;
    password?: string;
  },
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false, error: "Nama pengguna minimal 2 karakter." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid." };
  const roleId = input.roleId;
  if (
    roleId === "pesantren" &&
    (!input.institutionCode ||
      !state.institutions.some(
        (item) => item.code === input.institutionCode && item.status === "Aktif",
      ))
  ) {
    return { ok: false, error: "Pesantren wajib terhubung ke satu pesantren aktif." };
  }
  if ((roleId === "admin" || roleId === "validator") && input.institutionCode) {
    return { ok: false, error: "Super Admin dan Validator tidak terikat pesantren." };
  }
  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    return { ok: false, error: "Email sudah digunakan pada data demo." };
  }
  const id = nextUserId(state);
  // Fase 6: sandi awal opsional; default prototipe agar akun dapat login.
  const passwordHash = await hashPassword(input.password?.trim() || seedDefaultPassword);
  await withTransaction(async (conn) => {
    await insertUserRow(conn, {
      id,
      name,
      email,
      role: roleId,
      institutionCode: roleId === "pesantren" ? (input.institutionCode ?? null) : null,
      status: "Menunggu",
      passwordHash,
    });
    await writeAudit(conn, actor as Actor, "User", id, "Membuat akun pengguna");
  });
  return { ok: true, id };
}

export async function updateUser(
  state: IshasState,
  actor: Actor | null,
  userId: string,
  patch: { name: string; email: string; institutionCode?: string },
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const target = state.users.find((item) => item.id === userId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
  const name = patch.name.trim();
  const email = patch.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false, error: "Nama pengguna minimal 2 karakter." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid." };
  if (state.users.some((user) => user.id !== userId && user.email.toLowerCase() === email)) {
    return { ok: false, error: "Email sudah digunakan pada data demo." };
  }
  if (target.roleId === "pesantren") {
    const institution = state.institutions.find((item) => item.code === patch.institutionCode);
    if (!institution || institution.status !== "Aktif") {
      return { ok: false, error: "Pesantren wajib terhubung ke satu pesantren aktif." };
    }
  }
  await withTransaction(async (conn) => {
    await updateUserRow(conn, userId, {
      name,
      email,
      institutionCode:
        target.roleId === "pesantren" ? (patch.institutionCode ?? undefined) : undefined,
    });
    await writeAudit(conn, actor as Actor, "User", userId, "Mengubah data pengguna");
  });
  return { ok: true };
}

export async function setUserStatus(
  state: IshasState,
  actor: Actor | null,
  userId: string,
  status: User["status"],
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const target = state.users.find((item) => item.id === userId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
  if (actor && actor.id === userId) {
    return { ok: false, error: "Akun sendiri tidak dapat diubah statusnya." };
  }
  if (
    target.roleId === "admin" &&
    status !== "Aktif" &&
    state.users.filter((item) => item.roleId === "admin" && item.status === "Aktif").length === 1
  ) {
    return { ok: false, error: "Minimal satu Super Admin harus tetap aktif." };
  }
  await withTransaction(async (conn) => {
    await updateUserRow(conn, userId, { status });
    await writeAudit(conn, actor as Actor, "User", userId, "Mengubah status pengguna", status);
  });
  return { ok: true };
}

export async function deleteUser(
  state: IshasState,
  actor: Actor | null,
  userId: string,
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const target = state.users.find((item) => item.id === userId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
  if (actor && actor.id === userId) {
    return { ok: false, error: "Akun sendiri tidak dapat dihapus." };
  }
  if (
    target.roleId === "admin" &&
    state.users.filter((item) => item.roleId === "admin").length === 1
  ) {
    return { ok: false, error: "Super Admin terakhir tidak dapat dihapus." };
  }
  if (
    ["USR-001", "USR-002", "USR-003"].includes(userId) &&
    state.users.filter((item) => item.roleId === target.roleId).length === 1
  ) {
    return { ok: false, error: "Akun demo peran ini tidak dapat dihapus." };
  }
  await withTransaction(async (conn) => {
    await deleteUserRow(conn, userId);
    await writeAudit(
      conn,
      actor as Actor,
      "User",
      userId,
      "Menghapus akun pengguna",
      `${target.name} · ${target.email} · ${target.role}`,
    );
  });
  return { ok: true };
}

export async function resetUserPassword(
  state: IshasState,
  actor: Actor | null,
  userId: string,
): Promise<AdminActionResult> {
  const auth = requireAdmin(state, actor);
  if (auth) return { ok: false, error: auth.error };
  const target = state.users.find((item) => item.id === userId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
  // Fase 6: reset ke sandi awal prototipe agar akun tetap dapat masuk.
  const passwordHash = await hashPassword(seedDefaultPassword);
  await withTransaction(async (conn) => {
    await updateUserRow(conn, userId, { passwordHash });
    await writeAudit(
      conn,
      actor as Actor,
      "User",
      userId,
      "Mereset kata sandi",
      "Kembali ke sandi awal prototipe; wajib diganti lewat Ubah sandi.",
    );
  });
  return { ok: true };
}

// Reset demo: bersihkan storage lalu tanam ulang seed (cermin `resetMockData`).
export async function resetDemo(): Promise<AdminActionResult> {
  await clearStorageDir();
  await seedDemo();
  return { ok: true };
}

export type AuditFilter = { actor?: string; object?: string; institution?: string };

export function listAudit(
  state: IshasState,
  filter: AuditFilter,
  page: number,
  limit: number,
): { items: AuditEvent[]; page: number; limit: number; total: number } {
  const actorQuery = (filter.actor ?? "").trim().toLowerCase();
  const objectQuery = (filter.object ?? "").trim().toLowerCase();
  const filtered = state.auditEvents.filter((event) => {
    if (filter.institution && event.institutionCode !== filter.institution) return false;
    if (actorQuery) {
      const haystack = `${event.actorName} ${event.actorAccountId ?? ""}`.toLowerCase();
      if (!haystack.includes(actorQuery)) return false;
    }
    if (objectQuery) {
      const haystack = `${event.objectType} ${event.objectId}`.toLowerCase();
      if (!haystack.includes(objectQuery)) return false;
    }
    return true;
  });
  const start = (page - 1) * limit;
  return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
}
