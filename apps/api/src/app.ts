// Handler HTTP backend ISHAS — dipisah dari server (dan dapat disuntik dependensi)
// agar dapat diuji tanpa membuka port atau menyentuh DB nyata.

import { pingDb } from "./db";
import { loadActor } from "./actor";
import { HttpError, fail, jsonResponse } from "./http";
import { matchRoute, type Actor, type Route } from "./router";
import { buildRoutes } from "./routes";
import { loadIshasState } from "./repo/state";
import type { IshasState } from "../../web/mocks/types";

export const API_VERSION = "0.2.0";
const startedAt = Date.now();

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
