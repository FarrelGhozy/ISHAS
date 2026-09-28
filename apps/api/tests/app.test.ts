// Uji unit handler HTTP dengan dependensi disuntik (tanpa DB / port).
import { describe, expect, test } from "bun:test";
import { API_VERSION, createApp } from "../src/app";

const okApp = createApp({ ping: async () => {} });
const downApp = createApp({
  ping: async () => {
    throw new Error("Koneksi database gagal.");
  },
});

describe("handleRequest", () => {
  test("GET /health saat DB sehat → 200 ok", async () => {
    const response = await okApp(new Request("http://localhost/health"));
    const body = (await response.json()) as {
      ok: boolean;
      data: { status: string; db: string; version: string; uptime: number };
    };
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.db).toBe("ok");
    expect(body.data.version).toBe(API_VERSION);
    expect(body.data.uptime).toBeGreaterThanOrEqual(0);
  });

  test("GET /health saat DB mati → 503 dengan pesan", async () => {
    const response = await downApp(new Request("http://localhost/health"));
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Koneksi database gagal.");
  });

  test("rute tak dikenal → 404", async () => {
    const response = await okApp(new Request("http://localhost/tidak-ada"));
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Endpoint tidak ditemukan.");
  });
});
