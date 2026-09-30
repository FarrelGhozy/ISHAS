// Uji unit auth Fase 6 tanpa DB: hash sandi, rate limit, cookie, RBAC prefix,
// dan CSRF double-submit. Handler diuji lewat `createApp` dengan dependensi disuntik.
import { describe, expect, test } from "bun:test";
import type { Actor, Route } from "../src/router";
import { createApp } from "../src/app";
import { ok } from "../src/http";
import { hashPassword, validateNewPassword, verifyPassword } from "../src/auth/password";
import { RateLimiter } from "../src/auth/rate-limit";
import {
  buildSessionCookies,
  clearSessionCookies,
  parseCookies,
} from "../src/auth/cookie";
import { buildAuthRoutes } from "../src/routes/auth";

describe("password", () => {
  test("hash bcrypt 60 karakter + verify benar/salah", async () => {
    const hash = await hashPassword("rahasia-ku");
    expect(hash.length).toBe(60);
    expect(await verifyPassword("rahasia-ku", hash)).toBe(true);
    expect(await verifyPassword("salah", hash)).toBe(false);
  });

  test("hash kosong/null selalu gagal (bukan crash)", async () => {
    expect(await verifyPassword("apa saja", null)).toBe(false);
    expect(await verifyPassword("", "$2b$10$abcdefghijklmnopqrstuv")).toBe(false);
  });

  test("sandi baru minimal 8 karakter", () => {
    expect(validateNewPassword("1234567")).toBe("Sandi baru minimal 8 karakter.");
    expect(validateNewPassword("12345678")).toBeNull();
    expect(validateNewPassword(undefined)).toBe("Sandi baru minimal 8 karakter.");
  });
});

describe("RateLimiter", () => {
  test("memblokir setelah batas di dalam jendela", () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check("k", 0)).toBe(true);
    expect(limiter.check("k", 100)).toBe(true);
    expect(limiter.check("k", 200)).toBe(false);
  });

  test("kembali mengizinkan setelah jendela lewat", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("k", 0)).toBe(true);
    expect(limiter.check("k", 500)).toBe(false);
    expect(limiter.check("k", 1001)).toBe(true);
  });

  test("kunci berbeda tidak saling memblokir + reset", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("b", 0)).toBe(true);
    limiter.reset();
    expect(limiter.check("a", 0)).toBe(true);
  });
});

describe("cookie", () => {
  test("parse beberapa cookie", () => {
    expect(parseCookies("a=1; b=dua%20tiga")).toEqual({ a: "1", b: "dua tiga" });
    expect(parseCookies(null)).toEqual({});
  });

  test("cookie sesi HttpOnly + CSRF terbaca", () => {
    const cookies = buildSessionCookies("tok", "csrf");
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("ishas_session=tok");
    expect(cookies[0]).toContain("HttpOnly");
    expect(cookies[0]).toContain("SameSite=Lax");
    expect(cookies[1]).toContain("ishas_csrf=csrf");
    expect(cookies[1]).not.toContain("HttpOnly");
  });

  test("clear cookie berumur 0", () => {
    expect(clearSessionCookies().every((c) => c.includes("Max-Age=0"))).toBe(true);
  });

  test("COOKIE_DOMAIN → cookie memakai Domain (subdomain terpisah)", () => {
    const prev = process.env.COOKIE_DOMAIN;
    process.env.COOKIE_DOMAIN = ".utc.web.id";
    try {
      const cookies = buildSessionCookies("tok", "csrf");
      expect(cookies.every((c) => c.includes("Domain=.utc.web.id"))).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.COOKIE_DOMAIN;
      else process.env.COOKIE_DOMAIN = prev;
    }
  });

  test("tanpa COOKIE_DOMAIN → cookie host-only", () => {
    const prev = process.env.COOKIE_DOMAIN;
    delete process.env.COOKIE_DOMAIN;
    try {
      expect(buildSessionCookies("tok", "csrf").some((c) => c.includes("Domain="))).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.COOKIE_DOMAIN;
      else process.env.COOKIE_DOMAIN = prev;
    }
  });
});

describe("RBAC prefix + CSRF", () => {
  const actors: Record<string, Actor> = {
    admin: { id: "USR-001", name: "Admin", email: "a@x", roleId: "admin", role: "Super Admin", status: "Aktif", institutionCodes: [] },
    validator: { id: "USR-002", name: "Val", email: "v@x", roleId: "validator", role: "Validator", status: "Aktif", institutionCodes: [] },
    pesantren: { id: "USR-003", name: "Pon", email: "p@x", roleId: "pesantren", role: "Pesantren", status: "Aktif", institutionCodes: ["PSN-0018"] },
  };
  const routes: Route[] = [
    { method: "GET", pattern: "/api/v1/admin/rahasia", handler: () => ok({ scope: "admin" }) },
    { method: "GET", pattern: "/api/v1/validator/rahasia", handler: () => ok({ scope: "validator" }) },
    { method: "POST", pattern: "/api/v1/pesantren/ubah", handler: () => ok({ scope: "pesantren" }) },
  ];
  const loadActor = async (request: Request): Promise<Actor | null> => {
    const role = request.headers.get("x-test-role");
    return role ? actors[role] ?? null : null;
  };
  const app = createApp({ ping: async () => {}, routes, loadActor });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));

  test("tanpa sesi → 401", async () => {
    for (const path of ["/api/v1/admin/rahasia", "/api/v1/validator/rahasia"]) {
      const response = await call(path);
      expect(response.status).toBe(401);
    }
  });

  test("peran salah → 403", async () => {
    const response = await call("/api/v1/admin/rahasia", { headers: { "x-test-role": "validator" } });
    expect(response.status).toBe(403);
  });

  test("peran benar → 200", async () => {
    const response = await call("/api/v1/admin/rahasia", { headers: { "x-test-role": "admin" } });
    expect(response.status).toBe(200);
  });

  test("mutasi dengan cookie tanpa CSRF → 403", async () => {
    const response = await call("/api/v1/pesantren/ubah", {
      method: "POST",
      headers: { "x-test-role": "pesantren", cookie: "ishas_session=tok; ishas_csrf=csrf" },
    });
    expect(response.status).toBe(403);
  });

  test("mutasi dengan cookie + CSRF cocok → 200", async () => {
    const response = await call("/api/v1/pesantren/ubah", {
      method: "POST",
      headers: {
        "x-test-role": "pesantren",
        cookie: "ishas_session=tok; ishas_csrf=csrf",
        "x-csrf-token": "csrf",
      },
    });
    expect(response.status).toBe(200);
  });
});

describe("GET /auth/methods", () => {
  const app = createApp({
    ping: async () => {},
    routes: buildAuthRoutes(),
    loadActor: async () => null,
  });
  const getMethods = async () => {
    const response = await app(new Request("http://localhost/api/v1/auth/methods"));
    return (await response.json()) as { data: { password: boolean; demo: boolean } };
  };
  const withDemoEnv = async (value: string | undefined, run: () => Promise<void>) => {
    const prev = process.env.DEMO_AUTH_ENABLED;
    if (value === undefined) delete process.env.DEMO_AUTH_ENABLED;
    else process.env.DEMO_AUTH_ENABLED = value;
    try {
      await run();
    } finally {
      if (prev === undefined) delete process.env.DEMO_AUTH_ENABLED;
      else process.env.DEMO_AUTH_ENABLED = prev;
    }
  };

  test("demo aktif → { password:true, demo:true }", async () => {
    await withDemoEnv("true", async () => {
      expect((await getMethods()).data).toEqual({ password: true, demo: true });
    });
  });

  test("demo mati (production) → { password:true, demo:false }", async () => {
    await withDemoEnv("false", async () => {
      expect((await getMethods()).data).toEqual({ password: true, demo: false });
    });
  });
});
