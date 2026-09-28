// Server HTTP backend ISHAS (Fase 0: health check + koneksi DB).
import { apiPort } from "./config";
import { closePool, pingDb } from "./db";

const startedAt = Date.now();
const VERSION = "0.1.0";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

const server = Bun.serve({
  port: apiPort,
  hostname: "0.0.0.0",
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      try {
        await pingDb();
        return jsonResponse({
          ok: true,
          data: {
            status: "ok",
            db: "ok",
            version: VERSION,
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
  },
});

console.log(`[api] ISHAS backend berjalan di http://localhost:${server.port}`);

async function shutdown(): Promise<void> {
  await server.stop();
  await closePool();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
