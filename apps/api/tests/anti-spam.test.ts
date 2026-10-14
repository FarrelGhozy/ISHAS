// Uji unit anti-spam publik D-50 tanpa DB: config, IP klien, limiter,
// pemetaan 429, dan guard route (limit habis → 429 sebelum menyentuh state).
import { beforeEach, describe, expect, test } from "bun:test";
import { createApp } from "../src/app";
import { clientIp } from "../src/auth/client-ip";
import {
  cekDraft,
  cekLapor,
  cekMandiri,
  cekUpload,
  resetAntiSpamLimiters,
} from "../src/domain/anti-spam";
import { draftRateLimit, laporRateLimit, mandiriRateLimit, uploadRateLimit } from "../src/config";
import { httpStatusForError } from "../src/http";
import { buildRoutes } from "../src/routes";
import type { IshasState } from "../../web/mocks/types";

beforeEach(() => {
  resetAntiSpamLimiters();
});

describe("config D-50", () => {
  test("default: lapor 3/10mnt, mandiri 2/jam, draft 30/10mnt, upload 10/10mnt", () => {
    expect(laporRateLimit).toEqual({ max: 3, windowMs: 600_000 });
    expect(mandiriRateLimit).toEqual({ max: 2, windowMs: 3_600_000 });
    expect(draftRateLimit).toEqual({ max: 30, windowMs: 600_000 });
    expect(uploadRateLimit).toEqual({ max: 10, windowMs: 600_000 });
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/api/v1/x", { headers });

  test("X-Forwarded-For pertama dipakai (rantai proxy)", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  test("fallback X-Real-IP lalu lokal", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
    expect(clientIp(req({}))).toBe("lokal");
  });
});

describe("cek limiter", () => {
  test("lapor: 3 lolos, ke-4 ditolak + pesan persis", () => {
    expect(cekLapor("1.1.1.1", 0).ok).toBe(true);
    expect(cekLapor("1.1.1.1", 1).ok).toBe(true);
    expect(cekLapor("1.1.1.1", 2).ok).toBe(true);
    const blocked = cekLapor("1.1.1.1", 3);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(
        "Terlalu sering mengirim laporan. Coba lagi dalam beberapa menit.",
      );
    }
  });

  test("mandiri: 2 lolos, ke-3 ditolak (lebih ketat, langsung Terbit)", () => {
    expect(cekMandiri("2.2.2.2", 0).ok).toBe(true);
    expect(cekMandiri("2.2.2.2", 1).ok).toBe(true);
    const blocked = cekMandiri("2.2.2.2", 2);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toContain("langsung terbit");
    }
  });

  test("draft per draf terpisah + upload per IP", () => {
    expect(cekDraft("3.3.3.3", "SELF-A", 0).ok).toBe(true);
    expect(cekDraft("3.3.3.3", "SELF-B", 0).ok).toBe(true);
    for (let i = 0; i < 10; i += 1) {
      expect(cekUpload("4.4.4.4", i).ok).toBe(true);
    }
    expect(cekUpload("4.4.4.4", 11).ok).toBe(false);
  });

  test("jendela lewat → izin lagi; IP beda tidak saling blokir", () => {
    expect(cekLapor("5.5.5.5", 0).ok).toBe(true);
    expect(cekLapor("5.5.5.5", 1).ok).toBe(true);
    expect(cekLapor("5.5.5.5", 2).ok).toBe(true);
    expect(cekLapor("5.5.5.5", 3).ok).toBe(false);
    expect(cekLapor("5.5.5.5", 600_001).ok).toBe(true);
    expect(cekLapor("6.6.6.6", 3).ok).toBe(true);
  });
});

describe("httpStatusForError", () => {
  test("pesan terlalu sering → 429", () => {
    expect(
      httpStatusForError("Terlalu sering mengirim laporan. Coba lagi dalam beberapa menit."),
    ).toBe(429);
  });
});

describe("guard route (tanpa DB)", () => {
  const stubState = {} as IshasState;
  const app = createApp({
    ping: async () => {},
    loadActor: async () => null,
    loadState: async () => stubState,
    routes: buildRoutes({ loadState: async () => stubState }),
  });
  const post = (path: string, ip: string, body?: unknown) =>
    app(
      new Request(`http://localhost${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify(body ?? {}),
      }),
    );

  test("lapor habis → 429 sebelum validasi (pesan persis)", async () => {
    const ip = "203.0.113.11";
    for (let i = 0; i < 3; i += 1) {
      expect(cekLapor(ip).ok).toBe(true);
    }
    const response = await post("/api/v1/reports/lapor-cepat", ip, {
      institutionCode: "PSN-0018",
      reporterName: "X",
    });
    expect(response.status).toBe(429);
    const payload = (await response.json()) as { error: string };
    expect(payload.error).toBe(
      "Terlalu sering mengirim laporan. Coba lagi dalam beberapa menit.",
    );
  });

  test("submit mandiri habis → 429", async () => {
    const ip = "203.0.113.12";
    expect(cekMandiri(ip).ok).toBe(true);
    expect(cekMandiri(ip).ok).toBe(true);
    const response = await post("/api/v1/self-assessments/submit", ip, {
      draftId: "SELF-X",
    });
    expect(response.status).toBe(429);
  });

  test("draft habis → 429 (butuh id draf)", async () => {
    const ip = "203.0.113.13";
    for (let i = 0; i < 30; i += 1) {
      expect(cekDraft(ip, "SELF-X").ok).toBe(true);
    }
    const response = await post("/api/v1/self-assessments/drafts", ip, {
      id: "SELF-X",
    });
    expect(response.status).toBe(429);
  });

  test("upload habis → 429 tanpa perlu multipart", async () => {
    const ip = "203.0.113.14";
    for (let i = 0; i < 10; i += 1) {
      expect(cekUpload(ip).ok).toBe(true);
    }
    const response = await app(
      new Request("http://localhost/api/v1/uploads/report-evidence", {
        method: "POST",
        headers: { "x-forwarded-for": ip },
        body: new FormData(),
      }),
    );
    expect(response.status).toBe(429);
  });
});
