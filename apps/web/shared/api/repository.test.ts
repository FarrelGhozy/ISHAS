// Uji adapter HTTP (issue #10): bentuk request + amplop hasil, tanpa jaringan nyata.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { apiRequest } from "./http-client";
import { httpRepository } from "./http-repository";
import { repository } from "./repository";

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

  test("uploadSelfEvidence mengirim ke /uploads/self-evidence", async () => {
    stubFetch({ ok: true, data: { id: "evidence-asset-self" } }, 201);
    const file = new File([new Uint8Array([1, 2, 3])], "jawab.png", { type: "image/png" });
    const result = await httpRepository.uploadSelfEvidence(
      { name: "Ahmad", role: "Publik" },
      "PSN-0018",
      file,
    );
    expect(result).toEqual({ ok: true, id: "evidence-asset-self" });
    expect(calls[0].url).toContain("/api/v1/uploads/self-evidence");
    expect(calls[0].init.body instanceof FormData).toBe(true);
  });

  test("openCampusPlanAsset mengambil blob via /files/:assetId", async () => {
    calls = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init: init ?? {} });
      return new Response(new Uint8Array([0x89, 0x50]), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      });
    }) as typeof fetch;
    const blob = await httpRepository.openCampusPlanAsset("campus-asset-campus-psn-0018-v1");
    expect(blob).not.toBeNull();
    expect(calls[0].url).toContain("/api/v1/files/campus-asset-campus-psn-0018-v1");
  });

  test("deleteSelfAssessmentDraft memakai method DELETE", async () => {
    stubFetch({ ok: true, data: { id: "SELF-1" } });
    await httpRepository.deleteSelfAssessmentDraft("SELF-1");
    expect(calls[0].init.method).toBe("DELETE");
    expect(calls[0].url).toContain("/api/v1/self-assessments/drafts/SELF-1");
  });

  test("getSelfAssessmentDraft → GET /self-assessments/drafts/:id (D-31)", async () => {
    const draft = {
      id: "SELF-PSN-0018",
      institutionCode: "PSN-0018",
      reporterName: "Ahmad",
      instrumentVersionId: "INS-LIVE",
      answers: {},
      activeIndex: 0,
      updatedAt: "2026-09-29T00:00:00.000Z",
    };
    stubFetch({ ok: true, data: { draft } });
    const result = await httpRepository.getSelfAssessmentDraft("SELF-PSN-0018");
    expect(result).toEqual({ ok: true, draft });
    expect(calls[0].init.method ?? "GET").toBe("GET");
    expect(calls[0].url).toContain("/api/v1/self-assessments/drafts/SELF-PSN-0018");
  });
});

describe("httpRepository Pesantren (Fase 2)", () => {
  test("acceptReport mengirim severity/priority/rekomendasiFinal", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.acceptReport(
      { name: "Mustofa", role: "Pesantren" },
      "RPT-0001",
      "Tinggi",
      "Sedang",
      "Catatan",
      "Ganti kabel dalam 3 hari.",
    );
    expect(calls[0].url).toContain("/api/v1/pesantren/reports/RPT-0001/accept");
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    expect(body.severity).toBe("Tinggi");
    expect(body.rekomendasiFinal).toBe("Ganti kabel dalam 3 hari.");
  });

  test("updateTindakLanjut verify memakai endpoint /verify", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.updateTindakLanjut(
      { name: "Mustofa", role: "Pesantren" },
      "REC-RPT-0001-1",
      { note: "Bukti sesuai.", verify: true },
    );
    expect(calls[0].url).toContain("/recommendations/REC-RPT-0001-1/verify");
  });

  test("updateTindakLanjut progres memakai endpoint /progress", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.updateTindakLanjut(
      { name: "Mustofa", role: "Pesantren" },
      "REC-RPT-0001-1",
      { note: "Setengah jalan.", progress: 50 },
    );
    expect(calls[0].url).toContain("/recommendations/REC-RPT-0001-1/progress");
  });

  test("uploadCampusPlan dua langkah (upload lalu publish)", async () => {
    calls = [];
    let step = 0;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init: init ?? {} });
      step += 1;
      const data = step === 1 ? { id: "campus-asset-x" } : { id: "CAMPUS-PSN-0018-v2" };
      return new Response(JSON.stringify({ ok: true, data }), {
        status: step === 1 ? 201 : 201,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const result = await httpRepository.uploadCampusPlan(
      { name: "Mustofa", role: "Pesantren" },
      {
        institutionCode: "PSN-0018",
        file: new File([new Uint8Array([1])], "denah.png", { type: "image/png" }),
        width: 1000,
        height: 900,
        expectedActiveId: "CAMPUS-PSN-0018-v1",
        acknowledged: true,
      },
    );
    expect(result).toEqual({ ok: true, id: "CAMPUS-PSN-0018-v2" });
    expect(calls[0].url).toContain("/api/v1/uploads/campus-plan");
    expect(calls[1].url).toContain("/api/v1/pesantren/campus-plans/publish");
    const body = JSON.parse(String(calls[1].init.body)) as Record<string, unknown>;
    expect(body.assetId).toBe("campus-asset-x");
  });
});

describe("httpRepository SAM-iSAFE (Fase 4)", () => {
  test("saveSamAnswer memakai endpoint answers + metode PUT", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.saveSamAnswer(
      { id: "USR-002", name: "M. Ridwan", role: "Validator" },
      { assessmentId: "SAM-0001", questionId: "SAM-Q-001", score: 2, note: "Aman." },
    );
    expect(calls[0].url).toContain("/api/v1/validator/sam/assessments/SAM-0001/answers");
    expect(calls[0].init.method).toBe("PUT");
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    expect(body.questionId).toBe("SAM-Q-001");
    expect(body.score).toBe(2);
  });

  test("moveSamQuestion mengirim arah naik/turun", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.moveSamQuestion(
      { id: "USR-002", name: "M. Ridwan", role: "Validator" },
      "SAM-Q-001",
      "turun",
    );
    expect(calls[0].url).toContain("/api/v1/validator/sam/questions/SAM-Q-001/move");
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    expect(body.direction).toBe("turun");
  });

  test("cancelSamFollowUp memakai endpoint cancel + alasan", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.cancelSamFollowUp(
      { id: "USR-002", name: "M. Ridwan", role: "Validator" },
      "SMF-0001",
      "Tidak relevan setelah verifikasi ulang.",
    );
    expect(calls[0].url).toContain("/api/v1/validator/sam/follow-ups/SMF-0001/cancel");
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    expect(body.reason).toContain("Tidak relevan");
  });

  test("uploadSamEvidence mengirim FormData ke endpoint sam-evidence", async () => {
    stubFetch({ ok: true, data: { id: "evidence-asset-sam" } }, 201);
    const result = await httpRepository.uploadSamEvidence(
      { id: "USR-002", name: "M. Ridwan", role: "Validator" },
      "PSN-0018",
      new File([new Uint8Array([1, 2, 3])], "temuan.png", { type: "image/png" }),
    );
    expect(result).toEqual({ ok: true, id: "evidence-asset-sam" });
    expect(calls[0].url).toContain("/api/v1/uploads/sam-evidence");
    expect(calls[0].init.body instanceof FormData).toBe(true);
  });
});

describe("httpRepository Super Admin (Fase 5)", () => {
  const admin = { id: "USR-001", name: "Super Admin", role: "Super Admin" };

  test("addInstitution + setInstitutionStatus + addUser", async () => {
    stubFetch({ ok: true, data: { id: "PSN-0024" } }, 201);
    await httpRepository.addInstitution(admin, {
      name: "PP Uji",
      location: "Kota Uji",
      address: "Jl. Uji Nomor 1",
      manager: "Ust. Uji",
    });
    expect(calls[0].url).toContain("/api/v1/admin/institutions");
    expect(calls[0].init.method).toBe("POST");

    calls = [];
    stubFetch({ ok: true, data: {} });
    await httpRepository.setInstitutionStatus(admin, "PSN-0024", "Aktif");
    expect(calls[0].url).toContain("/api/v1/admin/institutions/PSN-0024/status");

    calls = [];
    stubFetch({ ok: true, data: { id: "USR-007" } }, 201);
    await httpRepository.addUser(admin, {
      name: "Akun Uji",
      email: "uji@ishas.demo",
      roleId: "pesantren",
      institutionCode: "PSN-0018",
    });
    expect(calls[0].url).toContain("/api/v1/admin/users");
  });

  test("status/delete/reset pengguna memakai endpoint yang benar", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.setUserStatus(admin, "USR-007", "Aktif");
    expect(calls[0].url).toContain("/api/v1/admin/users/USR-007/status");

    calls = [];
    await httpRepository.deleteUser(admin, "USR-007");
    expect(calls[0].url).toContain("/api/v1/admin/users/USR-007/delete");

    calls = [];
    await httpRepository.resetUserPassword(admin, "USR-007");
    expect(calls[0].url).toContain("/api/v1/admin/users/USR-007/reset-password");
  });

  test("resetDemo + markNotificationsRead + migrateDeviceAssets", async () => {
    stubFetch({ ok: true, data: {} });
    await httpRepository.resetDemo();
    expect(calls[0].url).toContain("/api/v1/admin/reset-demo");

    calls = [];
    await httpRepository.markNotificationsRead(["NOT-001"]);
    expect(calls[0].url).toContain("/api/v1/notifications/read");
    const readBody = JSON.parse(String(calls[0].init.body)) as { ids: string[] };
    expect(readBody.ids).toEqual(["NOT-001"]);

    calls = [];
    stubFetch({ ok: true, data: { imported: 2 } }, 201);
    const migrated = await httpRepository.migrateDeviceAssets([
      {
        kind: "instrument-doc",
        assetId: "instrument-doc-abc",
        indicatorId: "IND-K3L-002",
        fileName: "a.pdf",
        mime: "application/pdf",
        base64: "JVBERi0=",
      },
    ]);
    expect(migrated).toEqual({ ok: true, imported: 2 });
    expect(calls[0].url).toContain("/api/v1/admin/migrate/assets");
  });
});

describe("auth (fase 6)", () => {
  test("demoLogin → POST /auth/demo-login", async () => {
    stubFetch({ ok: true, data: { account: { id: "USR-003" }, csrfToken: "c1" } });
    const result = await httpRepository.demoLogin("USR-003");
    expect(result.ok).toBe(true);
    expect(calls[0].url).toContain("/api/v1/auth/demo-login");
    expect(calls[0].init.method).toBe("POST");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ accountId: "USR-003" });
  });

  test("login/logout/me/changePassword memetakan endpoint", async () => {
    stubFetch({ ok: true, data: { account: { id: "USR-001" }, csrfToken: null } });
    await httpRepository.login("admin@ishas.demo", "rahasia");
    expect(calls[0].url).toContain("/api/v1/auth/login");

    stubFetch({ ok: true, data: { loggedOut: true } });
    await httpRepository.logout();
    expect(calls[0].url).toContain("/api/v1/auth/logout");

    stubFetch({ ok: true, data: { account: { id: "USR-001" }, csrfToken: null } });
    await httpRepository.getSession();
    expect(calls[0].url).toContain("/api/v1/auth/me");
    expect(calls[0].init.method ?? "GET").toBe("GET");

    stubFetch({ ok: true, data: { changed: true } });
    await httpRepository.changePassword("lama", "baru12345");
    expect(calls[0].url).toContain("/api/v1/auth/password");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      oldPassword: "lama",
      newPassword: "baru12345",
    });
  });

  test("mutasi mengirim X-CSRF-Token dari cookie ishas_csrf", async () => {
    const originalDocument = (globalThis as { document?: unknown }).document;
    (globalThis as { document?: unknown }).document = { cookie: "ishas_csrf=token-uji" };
    try {
      stubFetch({ ok: true, data: { loggedOut: true } });
      await apiRequest("/auth/logout", { method: "POST" });
      const headers = calls[0].init.headers as Record<string, string>;
      expect(headers["X-CSRF-Token"]).toBe("token-uji");
    } finally {
      (globalThis as { document?: unknown }).document = originalDocument;
    }
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

describe("resolver repository (D-31)", () => {
  test("tidak mengekspos selector baca mock", () => {
    for (const name of [
      "registeredInstitutions",
      "validatedReports",
      "findingsFor",
      "recommendationsFor",
    ]) {
      expect(name in repository).toBe(false);
    }
  });
});
