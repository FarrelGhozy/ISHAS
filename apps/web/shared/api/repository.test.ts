// Uji adapter HTTP (issue #10): bentuk request + amplop hasil, tanpa jaringan nyata.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { apiRequest } from "./http-client";
import { httpRepository } from "./http-repository";

type Call = { url: string; init: RequestInit };

let calls: Call[] = [];
const originalFetch = globalThis.fetch;

function stubFetch(payload: unknown, status = 200): void {
  calls = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("httpRepository", () => {
  test("submitLaporCepat → POST /reports/lapor-cepat + X-Request-Id", async () => {
    stubFetch({ ok: true, data: { id: "RPT-0099" } }, 201);
    const result = await httpRepository.submitLaporCepat(
      { name: "Ahmad", role: "Publik" },
      {
        institutionCode: "PSN-0018",
        reporterName: "Ahmad",
        title: "Kabel terkelupas di dapur",
        description: "Kabel dekat kompor terkelupas dan berisiko tersengat.",
        clientRequestId: "req-1",
      },
    );
    expect(result).toEqual({ ok: true, id: "RPT-0099" });
    expect(calls[0].url).toContain("/api/v1/reports/lapor-cepat");
    expect(calls[0].init.method).toBe("POST");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers["X-Request-Id"]).toBe("req-1");
  });

  test("amplop gagal diteruskan apa adanya", async () => {
    stubFetch({ ok: false, error: "Nama minimal 2 karakter." }, 400);
    const result = await httpRepository.submitLaporCepat(
      { name: "A", role: "Publik" },
      { institutionCode: "PSN-0018", reporterName: "A", title: "x", description: "y" },
    );
    expect(result).toEqual({ ok: false, error: "Nama minimal 2 karakter." });
  });

  test("uploadReportEvidence mengirim FormData", async () => {
    stubFetch({ ok: true, data: { id: "evidence-asset-abc" } }, 201);
    const file = new File([new Uint8Array([1, 2, 3])], "bukti.png", { type: "image/png" });
    const result = await httpRepository.uploadReportEvidence(
      { name: "Ahmad", role: "Publik" },
      "PSN-0018",
      file,
    );
    expect(result).toEqual({ ok: true, id: "evidence-asset-abc" });
    expect(calls[0].init.body instanceof FormData).toBe(true);
    expect(calls[0].url).toContain("/api/v1/uploads/report-evidence");
  });

  test("deleteSelfAssessmentDraft memakai method DELETE", async () => {
    stubFetch({ ok: true, data: { id: "SELF-1" } });
    await httpRepository.deleteSelfAssessmentDraft("SELF-1");
    expect(calls[0].init.method).toBe("DELETE");
    expect(calls[0].url).toContain("/api/v1/self-assessments/drafts/SELF-1");
  });
});

describe("apiRequest", () => {
  test("kegagalan jaringan → pesan ramah", async () => {
    globalThis.fetch = (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const result = await apiRequest("/public/state");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Tidak dapat menghubungi server");
  });
});
