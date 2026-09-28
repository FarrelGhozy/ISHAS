// Handler HTTP backend ISHAS — dipisah dari server (dan dapat disuntik dependensi)
// agar dapat diuji tanpa membuka port atau menyentuh DB nyata.

import { pingDb } from "./db";

export const API_VERSION = "0.1.0";
const startedAt = Date.now();

export type AppDeps = {
  ping: () => Promise<void>;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function createApp(deps: AppDeps) {
  return async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
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
    return jsonResponse({ ok: false, error: "Endpoint tidak ditemukan." }, 404);
  };
}

// Handler default aplikasi memakai koneksi DB nyata.
export const handleRequest = createApp({ ping: pingDb });
