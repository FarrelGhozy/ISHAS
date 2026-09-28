// Server HTTP backend ISHAS (Fase 0: health check + koneksi DB).
import { handleRequest } from "./app";
import { apiPort } from "./config";
import { closePool } from "./db";

const server = Bun.serve({
  port: apiPort,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});

console.log(`[api] ISHAS backend berjalan di http://localhost:${server.port}`);

async function shutdown(): Promise<void> {
  await server.stop();
  await closePool();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
