// Rute Super Admin + notifikasi — Fase 5 (API §12 + BACKEND_STORAGE §5–§6).

import type { Institution, IshasState, User } from "../../../web/mocks/types";
import type { Actor, Route, RouteContext } from "../router";
import { actionResponse, fail, ok, paginate } from "../http";
import {
  addInstitution,
  addUser,
  deleteUser,
  listAudit,
  resetDemo,
  resetUserPassword,
  setInstitutionStatus,
  setUserStatus,
  updateUser,
} from "../domain/admin";
import { migrateAssets, migrationStatus } from "../domain/migrate";
import { markNotificationsRead } from "../repo/admin";
import { sweepOrphans } from "../storage-jobs";

export type AdminRouteDeps = { loadState: () => Promise<IshasState> };

type StateContext = RouteContext & { state: IshasState };

const FORBIDDEN = "Anda tidak berwenang mengelola data admin.";

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

function isAdmin(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "Aktif" && actor.roleId === "admin");
}

export function buildAdminRoutes(deps: AdminRouteDeps): Route[] {
  const withState = (handler: (ctx: StateContext) => Promise<Response>) =>
    async (ctx: RouteContext) => handler({ ...ctx, state: await deps.loadState() });

  const guard = (ctx: RouteContext): Response | null => {
    if (!ctx.actor || ctx.actor.status !== "Aktif") return fail("Sesi tidak dikenal.", 401);
    return isAdmin(ctx.actor) ? null : fail(FORBIDDEN, 403);
  };

  return [
    {
      method: "GET",
      pattern: "/api/v1/admin/state",
      handler: withState(async (ctx) => guard(ctx) ?? ok(ctx.state)),
    },
    {
      method: "GET",
      pattern: "/api/v1/admin/audit",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const { url } = ctx;
        const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
        const rawLimit = Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20;
        const limit = Math.min(100, Math.max(1, rawLimit));
        const result = listAudit(
          ctx.state,
          {
            actor: url.searchParams.get("actor") ?? undefined,
            object: url.searchParams.get("object") ?? undefined,
            institution: url.searchParams.get("institution") ?? undefined,
          },
          page,
          limit,
        );
        return ok(result);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/institutions",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          name: string;
          location: string;
          address?: string;
          manager?: string;
          status?: string;
        }>(ctx.request);
        return actionResponse(await addInstitution(ctx.state, ctx.actor, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/institutions/:code/status",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ status: Institution["status"] }>(ctx.request);
        return actionResponse(
          await setInstitutionStatus(ctx.state, ctx.actor, ctx.params.code, body.status),
        );
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/users",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          name: string;
          email: string;
          roleId: User["roleId"];
          institutionCode?: string;
        }>(ctx.request);
        return actionResponse(await addUser(ctx.state, ctx.actor, body));
      }),
    },
    {
      method: "PATCH",
      pattern: "/api/v1/admin/users/:id",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ name: string; email: string; institutionCode?: string }>(
          ctx.request,
        );
        return actionResponse(await updateUser(ctx.state, ctx.actor, ctx.params.id, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/users/:id/status",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ status: User["status"] }>(ctx.request);
        return actionResponse(
          await setUserStatus(ctx.state, ctx.actor, ctx.params.id, body.status),
        );
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/users/:id/reset-password",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await resetUserPassword(ctx.state, ctx.actor, ctx.params.id));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/users/:id/delete",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await deleteUser(ctx.state, ctx.actor, ctx.params.id));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/reset-demo",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await resetDemo());
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/storage/sweep",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ olderThanHours?: number }>(ctx.request);
        const result = await sweepOrphans({
          olderThanHours: Number.isFinite(body.olderThanHours) ? body.olderThanHours : 24,
        });
        return ok(result);
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/admin/migrate/status",
      handler: withState(async (ctx) => guard(ctx) ?? ok(await migrationStatus())),
    },
    {
      method: "POST",
      pattern: "/api/v1/admin/migrate/assets",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ items?: Parameters<typeof migrateAssets>[1] }>(ctx.request);
        const result = await migrateAssets(ctx.actor?.id ?? "admin", body.items ?? []);
        if (!result.ok) return fail(result.error, result.status ?? 400);
        return ok({ imported: result.imported }, 201);
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/notifications",
      handler: withState(async (ctx) => {
        if (!ctx.actor || ctx.actor.status !== "Aktif") {
          return fail("Sesi tidak dikenal.", 401);
        }
        const requested = ctx.url.searchParams.get("account") ?? ctx.actor.id;
        if (requested !== ctx.actor.id && ctx.actor.roleId !== "admin") {
          return fail("Anda tidak berwenang membaca notifikasi akun lain.", 403);
        }
        const items = ctx.state.notifications.filter(
          (item) => item.recipientAccountId === requested,
        );
        return ok(paginate(items, ctx.url));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/notifications/read",
      handler: withState(async (ctx) => {
        if (!ctx.actor || ctx.actor.status !== "Aktif") {
          return fail("Sesi tidak dikenal.", 401);
        }
        const body = await readJson<{ ids?: string[] }>(ctx.request);
        const ids = (body.ids ?? [])
          .map((id) => Number.parseInt(String(id).replace(/\D+/g, ""), 10))
          .filter((n) => Number.isFinite(n));
        const affected = await markNotificationsRead(ctx.actor.id, ids);
        return ok({ affected });
      }),
    },
  ];
}
