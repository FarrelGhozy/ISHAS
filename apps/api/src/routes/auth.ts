// Rute auth Fase 6 (BACKEND_API_CONTRACT §16): login/logout/me/ubah sandi +
// demo-login khusus pengembangan. Cookie ditulis lewat helper `auth/cookie`.

import type { Route } from "../router";
import { demoAuthEnabled } from "../config";
import { fail, ok } from "../http";
import {
  buildSessionCookies,
  clearSessionCookies,
  csrfCookieFrom,
  sessionTokenFrom,
} from "../auth/cookie";
import { changePassword, demoLogin, login, logout } from "../domain/auth";

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "lokal";
  return request.headers.get("x-real-ip") ?? "lokal";
}

export function buildAuthRoutes(): Route[] {
  return [
    {
      method: "POST",
      pattern: "/api/v1/auth/login",
      handler: async ({ request }) => {
        const body = await readJson<{ email?: string; password?: string }>(request);
        const result = await login(body.email ?? "", body.password ?? "", clientIp(request));
        if (!result.ok) return fail(result.error, result.status);
        const { actor, token, csrf } = result;
        return ok({ account: actor, csrfToken: csrf }, 200, buildSessionCookies(token, csrf));
      },
    },
    {
      method: "POST",
      pattern: "/api/v1/auth/demo-login",
      handler: async ({ request }) => {
        if (!demoAuthEnabled()) return fail("Endpoint tidak ditemukan.", 404);
        const body = await readJson<{ accountId?: string }>(request);
        const result = await demoLogin(body.accountId ?? "");
        if (!result.ok) return fail(result.error, result.status);
        const { actor, token, csrf } = result;
        return ok({ account: actor, csrfToken: csrf }, 200, buildSessionCookies(token, csrf));
      },
    },
    {
      method: "POST",
      pattern: "/api/v1/auth/logout",
      handler: async ({ request }) => {
        await logout(sessionTokenFrom(request));
        return ok({ loggedOut: true }, 200, clearSessionCookies());
      },
    },
    {
      method: "GET",
      pattern: "/api/v1/auth/me",
      handler: async ({ request, actor }) => {
        if (!actor || actor.status !== "Aktif") return fail("Sesi tidak dikenal.", 401);
        return ok({ account: actor, csrfToken: csrfCookieFrom(request) });
      },
    },
    {
      method: "POST",
      pattern: "/api/v1/auth/password",
      handler: async ({ request, actor }) => {
        if (!actor || actor.status !== "Aktif") return fail("Sesi tidak dikenal.", 401);
        const body = await readJson<{ oldPassword?: string; newPassword?: string }>(request);
        const result = await changePassword(
          actor,
          body.oldPassword ?? "",
          body.newPassword ?? "",
          sessionTokenFrom(request),
        );
        if (!result.ok) return fail(result.error, result.status);
        return ok({ changed: true });
      },
    },
  ];
}
