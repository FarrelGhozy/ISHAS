// Handler HTTP backend ISHAS — dipisah dari server (dan dapat disuntik dependensi)
// agar dapat diuji tanpa membuka port atau menyentuh DB nyata.

import { pingDb } from "./db";
import { loadActor } from "./actor";
import { HttpError, fail, jsonResponse } from "./http";
import { matchRoute, type Actor, type Route } from "./router";
import { buildRoutes } from "./routes";
import { loadIshasState } from "./repo/state";
import { CSRF_HEADER, corsAllowedOrigins } from "./config";
import { csrfCookieFrom, sessionTokenFrom } from "./auth/cookie";
import type { IshasState } from "../../web/mocks/types";

export const API_VERSION = "0.3.0";
const startedAt = Date.now();

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// CORS untuk hosting backend di subdomain terpisah (mis. api-ishas.utc.web.id).
// Default tanpa `CORS_ALLOWED_ORIGINS` → tidak ada header CORS (satu domain).
function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  if (!origin || !corsAllowedOrigins().includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token, X-Demo-Account",
    Vary: "Origin",
  };
}

// Lampirkan header CORS tanpa mengubah status/body (termasuk respons blob/berkas).
function withCors(request: Request, response: Response): Response {
  const headers = corsHeaders(request);
  if (Object.keys(headers).length === 0) return response;
  const merged = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) merged.set(key, value);
  return new Response(response.body, { status: response.status, headers: merged });
}

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
    // Preflight CORS (hanya relevan bila backend di origin terpisah).
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (url.pathname === "/health" || url.pathname === "/api/v1/health") {
      try {
        await deps.ping();
        return withCors(
          request,
          jsonResponse({
            ok: true,
            data: {
              status: "ok",
              db: "ok",
              version: API_VERSION,
              uptime: Math.round((Date.now() - startedAt) / 1000),
            },
          }),
        );
      } catch (error) {
        return withCors(
          request,
          jsonResponse(
            {
              ok: false,
              error: error instanceof Error ? error.message : "Koneksi database gagal.",
            },
            503,
          ),
        );
      }
    }
    const match = matchRoute(request.method, url.pathname, routes);
    if (!match) {
      return withCors(request, fail("Endpoint tidak ditemukan.", 404));
    }
    try {
      const actor = deps.loadActor ? await deps.loadActor(request) : null;
      authorize(actor, url);
      checkCsrf(request, url);
      return withCors(
        request,
        await match.route.handler({
          request,
          url,
          params: match.params,
          actor,
        }),
      );
    } catch (error) {
      if (error instanceof HttpError) return withCors(request, fail(error.message, error.status));
      return withCors(
        request,
        fail(
          error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
          500,
        ),
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
