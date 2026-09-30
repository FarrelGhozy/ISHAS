// Handler HTTP backend ISHAS — dipisah dari server (dan dapat disuntik dependensi)
// agar dapat diuji tanpa membuka port atau menyentuh DB nyata.

import { pingDb } from "./db";
import { loadActor } from "./actor";
import { HttpError, fail, jsonResponse } from "./http";
import { matchRoute, type Actor, type Route } from "./router";
import { buildRoutes } from "./routes";
import { loadIshasState } from "./repo/state";
import { CSRF_HEADER } from "./config";
import { csrfCookieFrom, sessionTokenFrom } from "./auth/cookie";
import type { IshasState } from "../../web/mocks/types";

export const API_VERSION = "0.3.0";
const startedAt = Date.now();

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// RBAC terpusat per prefix rute (BACKEND_API_CONTRACT §1). Pemeriksaan scope
// halus (lembaga sendiri, visibilitas berkas) tetap di handler masing-masing.
const ROLE_PREFIXES: { prefix: string; role: Actor["roleId"] }[] = [
  { prefix: "/api/v1/admin/", role: "admin" },
  { prefix: "/api/v1/validator/", role: "validator" },
  { prefix: "/api/v1/pesantren/", role: "pesantren" },
];

function requiredRole(pathname: string): Actor["roleId"] | null {
  return ROLE_PREFIXES.find((entry) => pathname.startsWith(entry.prefix))?.role ?? null;
}

// Cookie sesi berlaku → mutasi wajib menyertakan CSRF double-submit.
function checkCsrf(request: Request, url: URL): void {
  if (!MUTATING.has(request.method)) return;
  if (url.pathname.startsWith("/api/v1/auth/")) return;
  if (!sessionTokenFrom(request)) return;
  const cookie = csrfCookieFrom(request);
  const header = request.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    throw new HttpError(403, "Permintaan tidak sah. Muat ulang halaman lalu coba lagi.");
  }
}

function authorize(actor: Actor | null, url: URL): void {
  const needsSession =
    url.pathname.startsWith("/api/v1/notifications") || requiredRole(url.pathname) !== null;
  if (!needsSession) return;
  if (!actor || actor.status !== "Aktif") {
    throw new HttpError(401, "Sesi tidak dikenal.");
  }
  const role = requiredRole(url.pathname);
  if (role && actor.roleId !== role) {
    throw new HttpError(403, "Anda tidak berwenang mengakses sumber daya ini.");
  }
}

export type AppDeps = {
  ping: () => Promise<void>;
  loadActor?: (request: Request) => Promise<Actor | null>;
  loadState?: () => Promise<IshasState>;
  routes?: Route[];
};

export function createApp(deps: AppDeps) {
  const routes =
    deps.routes ??
    (deps.loadState ? buildRoutes({ loadState: deps.loadState }) : []);
  return async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" || url.pathname === "/api/v1/health") {
      try {
        await deps.ping();
        return jsonResponse({
          ok: true,
          data: {
            status: "ok",
            db: "ok",
            version: API_VERSION,
            uptime: Math.round((Date.now() - startedAt) / 1000),
          },
        });
      } catch (error) {
        return jsonResponse(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Koneksi database gagal.",
          },
          503,
        );
      }
    }
    const match = matchRoute(request.method, url.pathname, routes);
    if (!match) {
      return fail("Endpoint tidak ditemukan.", 404);
    }
    try {
      const actor = deps.loadActor ? await deps.loadActor(request) : null;
      authorize(actor, url);
      checkCsrf(request, url);
      return await match.route.handler({
        request,
        url,
        params: match.params,
        actor,
      });
    } catch (error) {
      if (error instanceof HttpError) return fail(error.message, error.status);
      return fail(
        error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
        500,
      );
    }
  };
}

// Handler default aplikasi memakai koneksi DB nyata.
export const handleRequest = createApp({
  ping: pingDb,
  loadActor,
  loadState: loadIshasState,
});
