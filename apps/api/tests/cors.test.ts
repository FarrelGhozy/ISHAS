// Uji unit CORS opsional (hosting backend di subdomain terpisah).
// Default tanpa `CORS_ALLOWED_ORIGINS` = tanpa header CORS (satu domain).
import { afterEach, describe, expect, test } from "bun:test";
import { createApp } from "../src/app";
import { ok } from "../src/http";
import type { Route } from "../src/router";

const ORIGIN = "https://ishas.utc.web.id";
const routes: Route[] = [
  { method: "GET", pattern: "/api/v1/publik", handler: () => ok({ x: 1 }) },
];
const makeApp = () => createApp({ ping: async () => {}, routes, loadActor: async () => null });

const prev = process.env.CORS_ALLOWED_ORIGINS;
afterEach(() => {
  if (prev === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
  else process.env.CORS_ALLOWED_ORIGINS = prev;
});

describe("CORS opsional (subdomain terpisah)", () => {
  test("tanpa CORS_ALLOWED_ORIGINS → tanpa header", async () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    const response = await makeApp()(
      new Request("http://localhost/api/v1/publik", { headers: { Origin: ORIGIN } }),
    );
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  test("origin diizinkan → header CORS + credentials", async () => {
    process.env.CORS_ALLOWED_ORIGINS = `${ORIGIN}, https://lain.id`;
    const response = await makeApp()(
      new Request("http://localhost/api/v1/publik", { headers: { Origin: ORIGIN } }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(response.headers.get("access-control-allow-credentials")).toBe("true");
    expect(response.headers.get("vary")).toBe("Origin");
  });

  test("origin tak diizinkan → tanpa header", async () => {
    process.env.CORS_ALLOWED_ORIGINS = ORIGIN;
    const response = await makeApp()(
      new Request("http://localhost/api/v1/publik", { headers: { Origin: "https://jahat.id" } }),
    );
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  test("preflight OPTIONS → 204 + allow methods", async () => {
    process.env.CORS_ALLOWED_ORIGINS = ORIGIN;
    const response = await makeApp()(
      new Request("http://localhost/api/v1/publik", {
        method: "OPTIONS",
        headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET" },
      }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toContain("GET");
  });
});
