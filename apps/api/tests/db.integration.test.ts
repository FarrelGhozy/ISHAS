// Uji integrasi DB (dilewati otomatis bila MySQL tidak tersedia atau DB_NAME
// bukan database uji): skema, komposisi seed demo/empty, invarian relasi, alur HTTP.
// Jalankan dengan DB uji terpisah (mis. `DB_NAME=ishas_test bun run migrate && DB_NAME=ishas_test bun test`)
// karena seed melakukan TRUNCATE — dilarang menyentuh DB pengembangan.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { RowDataPacket } from "mysql2/promise";
import { SEED } from "../../web/mocks/seed/seed";
import { K3_CATEGORIES } from "../../web/mocks/kategori-k3";
import { loadActor } from "../src/actor";
import { createApp } from "../src/app";
import { closePool, pingDb, pool } from "../src/db";
import { loadIshasState } from "../src/repo/state";
import { hitungChecksumInstrument } from "../src/checksum";
import { seedDemo } from "../src/seed/demo";
import { seedEmpty } from "../src/seed/empty";
import { ALL_TABLES, countRows } from "../src/seed/helpers";

const dbName = process.env.DB_NAME ?? "ishas";
const isTestDb = /test/i.test(dbName);

let dbReady = false;
if (isTestDb) {
  try {
    await pingDb();
    dbReady = true;
  } catch {
    dbReady = false;
  }
}

if (!isTestDb) {
  console.warn(
    `[test] DB_NAME="${dbName}" bukan database uji → lewati uji integrasi DB ` +
      "(pakai DB_NAME=ishas_test agar tidak menghapus data pengembangan).",
  );
} else if (!dbReady) {
  console.warn("[test] MySQL tidak tersedia → lewati uji integrasi DB.");
}

async function scalar(sql: string, params: unknown[] = []): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return Number(rows[0]?.c ?? 0);
}

describe.skipIf(!dbReady)("skema database", () => {
  test("seluruh tabel domain + schema_migrations ada", async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
    );
    const names = new Set(rows.map((row) => String(row.name)));
    for (const table of [...ALL_TABLES, "schema_migrations"]) {
      expect(names.has(table)).toBe(true);
    }
  });

  test("semua tabel memakai kolasi utf8mb4_unicode_ci", async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT table_name AS name, table_collation AS collation FROM information_schema.tables " +
        "WHERE table_schema = DATABASE()",
    );
    for (const row of rows) {
      expect(String(row.collation)).toBe("utf8mb4_unicode_ci");
    }
  });

  test("migrasi v15 tercatat", async () => {
    expect(await scalar("SELECT COUNT(*) AS c FROM schema_migrations WHERE id = ?", [
      "0001_schema_v15.sql",
    ])).toBe(1);
  });

  test("FK evidence merujuk file_assets (migrasi 0004)", async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT CONSTRAINT_NAME AS name, TABLE_NAME AS tbl, COLUMN_NAME AS col, " +
        "REFERENCED_TABLE_NAME AS ref FROM information_schema.KEY_COLUMN_USAGE " +
        "WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'file_assets'",
    );
    const found = new Set(rows.map((row) => `${row.tbl}.${row.col}`));
    for (const key of [
      "campus_plans.asset_id",
      "instrument_docs.asset_id",
      "reports.evidence_asset_id",
      "recommendations.completion_evidence_asset_id",
    ]) {
      expect(found.has(key)).toBe(true);
    }
  });
});

describe.skipIf(!dbReady)("seed demo", () => {
  test("komposisi baris sesuai SEED mock", async () => {
    await seedDemo();
    const bankIndicators = SEED.instrument.dimensions.reduce(
      (total, dim) => total + dim.indicators.length,
      0,
    );
    expect(await countRows("institutions")).toBe(SEED.institutions.length);
    expect(await countRows("users")).toBe(SEED.users.length);
    expect(await countRows("reports")).toBe(SEED.reports.length);
    expect(await countRows("findings")).toBe(SEED.findings.length);
    expect(await countRows("recommendations")).toBe(SEED.recommendations.length);
    expect(await countRows("sam_assessments")).toBe(SEED.samAssessments.length);
    expect(await countRows("sam_follow_ups")).toBe(SEED.samFollowUps.length);
    expect(await countRows("audit_events")).toBe(SEED.auditEvents.length);
    expect(await countRows("notifications")).toBe(SEED.notifications.length);
    expect(await countRows("bank_indicators")).toBe(bankIndicators);
    expect(await countRows("sam_questions")).toBe(SEED.samQuestions.length);
    expect(await countRows("file_assets")).toBe(
      SEED.campusPlans.length + SEED.instrumentDocs.length,
    );
    const [legacy] = await pool.query<RowDataPacket[]>(
      "SELECT legacy_id AS id FROM notifications ORDER BY id",
    );
    expect(legacy.map((row) => String(row.id))).toEqual(
      SEED.notifications.map((n) => n.id),
    );
    const [vdims] = await pool.query<RowDataPacket[]>(
      "SELECT version_id, id FROM instrument_version_dimensions WHERE description IS NOT NULL",
    );
    const expectedDims = SEED.instrumentVersions.flatMap((v) =>
      v.dimensions.filter((d) => d.description).map((d) => `${v.id}/${d.id}`),
    );
    expect(vdims.map((row) => `${row.version_id}/${row.id}`).sort()).toEqual(
      expectedDims.sort(),
    );
    const [docs] = await pool.query<RowDataPacket[]>(
      "SELECT DISTINCT updated_by AS u FROM instrument_docs",
    );
    expect(docs.map((row) => String(row.u))).toEqual(["Dr. M. Ridwan"]);
  });

  test("checksum bank di DB sama dengan hitungChecksumInstrument", async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT checksum FROM instrument_meta WHERE id = 'INS-LIVE'",
    );
    expect(String(rows[0]?.checksum)).toBe(SEED.instrument.checksum);
  });

  test("komposisi kanal & status validasi laporan", async () => {
    const byChannel = (channel: string) =>
      scalar("SELECT COUNT(*) AS c FROM reports WHERE channel = ?", [channel]);
    expect(await byChannel("lapor-cepat")).toBe(14);
    expect(await byChannel("penilaian-mandiri")).toBe(5);
    const byStatus = (status: string) =>
      scalar("SELECT COUNT(*) AS c FROM reports WHERE validation_status = ?", [status]);
    expect(await byStatus("Menunggu validasi")).toBe(3);
    expect(await byStatus("Ditolak")).toBe(2);
    expect(await byStatus("Diterima")).toBe(14);
  });

  test("tidak ada relasi yatim antar tabel", async () => {
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM reports r LEFT JOIN institutions i ON i.code = r.institution_code " +
          "WHERE i.code IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM findings f LEFT JOIN reports r ON r.id = f.report_id " +
          "WHERE r.id IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM recommendations x LEFT JOIN reports r ON r.id = x.report_id " +
          "WHERE r.id IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM self_assessment_snapshots s LEFT JOIN reports r ON r.id = s.report_id " +
          "WHERE r.id IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM campus_plans cp LEFT JOIN file_assets fa ON fa.asset_id = cp.asset_id " +
          "WHERE fa.asset_id IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM reports r LEFT JOIN file_assets fa ON fa.asset_id = r.evidence_asset_id " +
          "WHERE r.evidence_asset_id IS NOT NULL AND fa.asset_id IS NULL",
      ),
    ).toBe(0);
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM recommendations x LEFT JOIN file_assets fa " +
          "ON fa.asset_id = x.completion_evidence_asset_id " +
          "WHERE x.completion_evidence_asset_id IS NOT NULL AND fa.asset_id IS NULL",
      ),
    ).toBe(0);
  });

  test("sequences mengikuti counters seed (demo)", async () => {
    const value = async (name: string) =>
      scalar("SELECT value AS c FROM sequences WHERE seq_name = ?", [name]);
    expect(await value("report")).toBe(SEED.counters.report);
    expect(await value("institution")).toBe(SEED.counters.institution);
  });
});

describe.skipIf(!dbReady)("seed empty", () => {
  test("struktur kosong tapi valid", async () => {
    await seedEmpty();
    expect(await countRows("institutions")).toBe(0);
    expect(await countRows("users")).toBe(1);
    expect(await countRows("reports")).toBe(0);
    expect(await countRows("findings")).toBe(0);
    expect(await countRows("recommendations")).toBe(0);
    expect(await countRows("sam_questions")).toBe(0);
    expect(await countRows("bank_indicators")).toBe(1);
    expect(await countRows("bank_options")).toBe(2);
    expect(await countRows("k3_categories")).toBe(K3_CATEGORIES.length);
  });

  test("admin awal aktif + bank bercabang checksum ck-", async () => {
    const [admins] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND status = 'Aktif'",
    );
    expect(Number(admins[0]?.c)).toBe(1);
    const [meta] = await pool.query<RowDataPacket[]>(
      "SELECT checksum FROM instrument_meta WHERE id = 'INS-LIVE'",
    );
    expect(String(meta[0]?.checksum).startsWith("ck-")).toBe(true);
  });

  test("sequences awal = 1", async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT seq_name AS name, value FROM sequences",
    );
    const map = new Map(rows.map((row) => [String(row.name), Number(row.value)]));
    expect(map.get("report")).toBe(1);
    expect(map.get("institution")).toBe(1);
  });
});

describe.skipIf(!dbReady)("Fase 1 HTTP (lapor + mandiri + publik)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined)),
    },
    body: JSON.stringify(body),
  });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));
  const owner = SEED.users.find(
    (u) => u.roleId === "pesantren" && u.institutionCodes.includes("PSN-0018"),
  )!;

  beforeAll(async () => {
    await seedDemo();
  });

  test("GET /public/state: hanya Diterima + tanpa identitas pelapor", async () => {
    const response = await call("/api/v1/public/state");
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: {
        reports: { validationStatus: string; reporterName: string }[];
        recommendations: Record<string, unknown>[];
      };
    };
    expect(body.ok).toBe(true);
    expect(body.data.reports.length).toBeGreaterThan(0);
    expect(body.data.reports.every((r) => r.validationStatus === "Diterima")).toBe(true);
    expect(body.data.reports.every((r) => r.reporterName === "")).toBe(true);
    expect(body.data.recommendations.length).toBeGreaterThan(0);
    for (const rec of body.data.recommendations) {
      expect(rec.dueDate).toBe("");
      for (const key of [
        "lastNote",
        "completionEvidence",
        "completionEvidenceAssetId",
        "canceledBy",
        "canceledAt",
        "verifiedBy",
        "verifiedAt",
      ]) {
        expect(rec[key]).toBeUndefined();
      }
    }
  });

  test("GET /public/results|recommendations|follow-ups: redaksi D-02", async () => {
    const results = (await (await call("/api/v1/public/results")).json()) as {
      ok: boolean;
      data: { items: Record<string, unknown>[] };
    };
    expect(results.ok).toBe(true);
    expect(results.data.items.length).toBeGreaterThan(0);
    for (const item of results.data.items) {
      expect(item.reporterName).toBe("");
      for (const key of [
        "reporterUserId",
        "reporterAccountEmail",
        "contact",
        "reporterRecommendation",
        "rejectionReason",
        "validationNote",
        "evidenceAssetId",
        "evidenceName",
        "instrumentChecksum",
      ]) {
        expect(item[key]).toBeUndefined();
      }
    }
    for (const path of ["/api/v1/public/recommendations", "/api/v1/public/follow-ups"]) {
      const res = (await (await call(path)).json()) as {
        ok: boolean;
        data: { items: Record<string, unknown>[] };
      };
      expect(res.ok).toBe(true);
      expect(res.data.items.length).toBeGreaterThan(0);
      for (const item of res.data.items) {
        expect(item.dueDate).toBe("");
        for (const key of [
          "lastNote",
          "completionEvidence",
          "completionEvidenceAssetId",
          "canceledBy",
          "canceledAt",
          "verifiedBy",
          "verifiedAt",
        ]) {
          expect(item[key]).toBeUndefined();
        }
      }
    }
  });

  test("POST /reports/lapor-cepat: validasi 1:1 + idempotensi", async () => {
    const invalid = await call(
      "/api/v1/reports/lapor-cepat",
      json(
        { institutionCode: "PSN-0018", reporterName: "A", title: "x", description: "y" },
        { method: "POST" },
      ),
    );
    expect(invalid.status).toBe(400);
    expect(((await invalid.json()) as { error: string }).error).toBe("Nama minimal 2 karakter.");

    const area = SEED.areas.find((a) => a.institutionCode === "PSN-0018")!;
    const payload = {
      institutionCode: "PSN-0018",
      reporterName: "Ahmad",
      title: "Kabel terkelupas di dapur",
      description: "Kabel dekat kompor terkelupas dan berisiko tersengat.",
      areaId: area.id,
      clientRequestId: "it-request-1",
    };
    const created = await call("/api/v1/reports/lapor-cepat", json(payload, { method: "POST" }));
    expect(created.status).toBe(201);
    const first = (await created.json()) as { data: { id: string } };
    const repeated = await call("/api/v1/reports/lapor-cepat", json(payload, { method: "POST" }));
    const second = (await repeated.json()) as { data: { id: string } };
    expect(second.data.id).toBe(first.data.id);

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT validation_status, handling_status FROM reports WHERE id = ?",
      [first.data.id],
    );
    expect(rows[0]?.validation_status).toBe("Menunggu validasi");
    expect(rows[0]?.handling_status).toBe("Menunggu validasi");
    const audits = await scalar(
      "SELECT COUNT(*) AS c FROM audit_events WHERE object_id = ? AND action = 'Mengirim laporan publik'",
      [first.data.id],
    );
    expect(audits).toBe(1);
    const notifs = await scalar(
      "SELECT COUNT(*) AS c FROM notifications WHERE source_object_id = ?",
      [first.data.id],
    );
    expect(notifs).toBeGreaterThan(0);
  });

  test("POST /reports/lapor-cepat: idempotensi via header X-Request-Id", async () => {
    const area = SEED.areas.find((a) => a.institutionCode === "PSN-0018")!;
    const payload = {
      institutionCode: "PSN-0018",
      reporterName: "Siti",
      title: "Lantai musholla licin saat hujan",
      description: "Lantai musholla menjadi licin setiap hujan dan berbahaya bagi jamaah.",
      areaId: area.id,
    };
    const headers = {
      "Content-Type": "application/json",
      "X-Request-Id": "it-request-header-1",
    };
    const first = await call(
      "/api/v1/reports/lapor-cepat",
      { method: "POST", headers, body: JSON.stringify(payload) },
    );
    expect(first.status).toBe(201);
    const firstId = ((await first.json()) as { data: { id: string } }).data.id;
    const second = await call(
      "/api/v1/reports/lapor-cepat",
      { method: "POST", headers, body: JSON.stringify(payload) },
    );
    expect(second.status).toBe(201);
    expect(((await second.json()) as { data: { id: string } }).data.id).toBe(firstId);
  });

  test("denah seed: GET /files publik menyajikan blob image/png", async () => {
    const served = await call("/api/v1/files/campus-asset-campus-psn-0018-v1");
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("image/png");
    expect((await served.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  test("penilaian-mandiri: draft → submit → snapshot beku", async () => {
    const state = await loadIshasState();
    const bank = state.instrument;
    const answers: Record<string, Record<string, unknown>> = {};
    for (const dim of bank.dimensions) {
      for (const ind of dim.indicators) {
        answers[ind.id] = {
          value: ind.options[0].value,
          note: "",
          evidenceName: ind.evidenceRequired ? "bukti.jpg" : "",
          areaId: ind.locationRequired ? SEED.areas.find((a) => a.institutionCode === "PSN-0018")!.id : "",
          manualLocation: "",
          planPoint: null,
        };
      }
    }
    const draft = {
      id: "SELF-IT-1",
      institutionCode: "PSN-0018",
      reporterName: "Ahmad",
      instrumentVersionId: "INS-LIVE",
      instrumentChecksum: bank.checksum,
      answers,
      activeIndex: 0,
      updatedAt: new Date().toISOString(),
    };
    const saved = await call("/api/v1/self-assessments/drafts", json(draft, { method: "POST" }));
    expect(saved.status).toBe(200);

    const submitted = await call(
      "/api/v1/self-assessments/submit",
      json({ draftId: "SELF-IT-1", reporterName: "Ahmad" }, { method: "POST" }),
    );
    expect(submitted.status).toBe(201);
    const body = (await submitted.json()) as { data: { id: string } };
    const [reports] = await pool.query<RowDataPacket[]>(
      "SELECT channel, validation_status, score_percent FROM reports WHERE id = ?",
      [body.data.id],
    );
    expect(reports[0]?.channel).toBe("penilaian-mandiri");
    expect(reports[0]?.validation_status).toBe("Menunggu validasi");
    const snapshots = await scalar(
      "SELECT COUNT(*) AS c FROM self_assessment_snapshots WHERE report_id = ?",
      [body.data.id],
    );
    expect(snapshots).toBe(1);
    const remainingDrafts = await scalar(
      "SELECT COUNT(*) AS c FROM self_assessment_drafts WHERE id = 'SELF-IT-1'",
    );
    expect(remainingDrafts).toBe(0);
  });

  test("unggah bukti → file_assets + serve scope + hapus", async () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    png[18] = 0x03;
    png[19] = 0x20;
    png[22] = 0x02;
    png[23] = 0x1c;
    const form = new FormData();
    form.append("file", new File([png], "bukti.png", { type: "image/png" }));
    form.append("institutionCode", "PSN-0018");
    const uploaded = await call("/api/v1/uploads/report-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": owner.id },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const asset = (await uploaded.json()) as { data: { id: string } };
    const fileResponse = await call(`/api/v1/files/${asset.data.id}`, {
      headers: { "X-Demo-Account": owner.id },
    });
    expect(fileResponse.status).toBe(200);
    const anonymous = await call(`/api/v1/files/${asset.data.id}`);
    expect(anonymous.status).toBe(401);
    const deleted = await call(`/api/v1/uploads/report-evidence/${asset.data.id}`, {
      method: "DELETE",
      headers: { "X-Demo-Account": owner.id },
    });
    expect(deleted.status).toBe(200);
    expect(
      await scalar("SELECT COUNT(*) AS c FROM file_assets WHERE asset_id = ?", [asset.data.id]),
    ).toBe(0);
  });

  test("unggah bukti: peran salah 403 + ukuran 413 + hapus scope/kind", async () => {
    const tiny = new Uint8Array(24);
    tiny.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    tiny[18] = 0x03;
    tiny[19] = 0x20;
    tiny[22] = 0x02;
    tiny[23] = 0x1c;
    const roleForm = new FormData();
    roleForm.append("file", new File([tiny], "bukti.png", { type: "image/png" }));
    roleForm.append("institutionCode", "PSN-0018");
    const denied = await call("/api/v1/uploads/report-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": "USR-002" },
      body: roleForm,
    });
    expect(denied.status).toBe(403);
    expect(((await denied.json()) as { error: string }).error).toBe(
      "Akun ini tidak dapat mengunggah bukti pelaporan.",
    );

    const big = new Uint8Array(6 * 1024 * 1024);
    big.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const bigForm = new FormData();
    bigForm.append("file", new File([big], "besar.png", { type: "image/png" }));
    bigForm.append("institutionCode", "PSN-0018");
    const tooLarge = await call("/api/v1/uploads/report-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": owner.id },
      body: bigForm,
    });
    expect(tooLarge.status).toBe(413);

    const selfForm = new FormData();
    selfForm.append("file", new File([tiny], "jawab.png", { type: "image/png" }));
    selfForm.append("institutionCode", "PSN-0018");
    const selfUp = await call("/api/v1/uploads/self-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": owner.id },
      body: selfForm,
    });
    expect(selfUp.status).toBe(201);
    const selfAsset = (await selfUp.json()) as { data: { id: string } };
    const crossKind = await call(`/api/v1/uploads/report-evidence/${selfAsset.data.id}`, {
      method: "DELETE",
      headers: { "X-Demo-Account": owner.id },
    });
    expect(crossKind.status).toBe(404);

    const reportForm = new FormData();
    reportForm.append("file", new File([tiny], "lapor.png", { type: "image/png" }));
    reportForm.append("institutionCode", "PSN-0018");
    const reportUp = await call("/api/v1/uploads/report-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": owner.id },
      body: reportForm,
    });
    expect(reportUp.status).toBe(201);
    const reportAsset = (await reportUp.json()) as { data: { id: string } };
    const adminDelete = await call(`/api/v1/uploads/report-evidence/${reportAsset.data.id}`, {
      method: "DELETE",
      headers: { "X-Demo-Account": "USR-001" },
    });
    expect(adminDelete.status).toBe(403);
    const ownerDelete = await call(`/api/v1/uploads/report-evidence/${reportAsset.data.id}`, {
      method: "DELETE",
      headers: { "X-Demo-Account": owner.id },
    });
    expect(ownerDelete.status).toBe(200);
  });

  test("pdf-data publik: foto bukti self-evidence disajikan tanpa jawaban mentah", async () => {
    const state = await loadIshasState();
    const bank = state.instrument;
    const tiny = new Uint8Array(24);
    tiny.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    tiny[18] = 0x03;
    tiny[19] = 0x20;
    tiny[22] = 0x02;
    tiny[23] = 0x1c;
    const form = new FormData();
    form.append("file", new File([tiny], "foto.png", { type: "image/png" }));
    form.append("institutionCode", "PSN-0018");
    const uploaded = await call("/api/v1/uploads/self-evidence", { method: "POST", body: form });
    expect(uploaded.status).toBe(201);
    const assetId = ((await uploaded.json()) as { data: { id: string } }).data.id;

    const answers: Record<string, Record<string, unknown>> = {};
    for (const dim of bank.dimensions) {
      for (const ind of dim.indicators) {
        answers[ind.id] = {
          value: ind.options[0].value,
          note: "",
          evidenceName: ind.evidenceRequired ? "foto.png" : "",
          evidenceAssetId: ind.evidenceRequired ? assetId : undefined,
          areaId: ind.locationRequired
            ? SEED.areas.find((a) => a.institutionCode === "PSN-0018")!.id
            : "",
          manualLocation: "",
          planPoint: null,
        };
      }
    }
    const saved = await call(
      "/api/v1/self-assessments/drafts",
      json(
        {
          id: "SELF-PDF-1",
          institutionCode: "PSN-0018",
          reporterName: "Ahmad",
          instrumentVersionId: "INS-LIVE",
          instrumentChecksum: bank.checksum,
          answers,
          activeIndex: 0,
          updatedAt: new Date().toISOString(),
        },
        { method: "POST" },
      ),
    );
    expect(saved.status).toBe(200);
    const submitted = await call(
      "/api/v1/self-assessments/submit",
      json({ draftId: "SELF-PDF-1", reporterName: "Ahmad" }, { method: "POST" }),
    );
    expect(submitted.status).toBe(201);
    const reportId = ((await submitted.json()) as { data: { id: string } }).data.id;

    const accepted = await call(
      `/api/v1/pesantren/reports/${reportId}/accept`,
      json(
        { severity: "Sedang", priority: "Sedang", note: "Diterima untuk uji." },
        { method: "POST", headers: { "X-Demo-Account": owner.id } },
      ),
    );
    expect(accepted.status).toBe(200);

    const pdf = await call(`/api/v1/public/reports/${reportId}/pdf-data`);
    expect(pdf.status).toBe(200);
    const body = (await pdf.json()) as {
      data: {
        report: Record<string, unknown>;
        snapshot: { answers: Record<string, { evidenceAssetId?: string }> } | null;
        institution: { code: string } | null;
      };
    };
    expect(body.data.report.reporterName).toBe("");
    expect(body.data.institution?.code).toBe("PSN-0018");
    const evidenceEntry = Object.values(body.data.snapshot?.answers ?? {}).find(
      (entry) => entry.evidenceAssetId === assetId,
    );
    expect(evidenceEntry).toBeTruthy();
    expect(Object.values(body.data.snapshot?.answers ?? {}).every(
      (entry) => !("value" in entry),
    )).toBe(true);

    const photo = await call(`/api/v1/files/${assetId}`);
    expect(photo.status).toBe(200);
    expect(photo.headers.get("content-type")).toBe("image/png");
  });
});

describe.skipIf(!dbReady)("Fase 2 HTTP (validasi + lifecycle + lokasi + tindak lanjut)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined)),
    },
    body: JSON.stringify(body),
  });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));
  const asOwner = (init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), "X-Demo-Account": "USR-003" },
  });
  const pngBytes = (width: number, height: number): Uint8Array => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    png[18] = (width >> 8) & 0xff;
    png[19] = width & 0xff;
    png[22] = (height >> 8) & 0xff;
    png[23] = height & 0xff;
    return png;
  };

  beforeAll(async () => {
    await seedDemo();
  });

  test("accept: sesi dulu, lalu scope — anonim 401, peran salah 403", async () => {
    const anonymous = await call(
      "/api/v1/pesantren/reports/RPT-0002/accept",
      json({ severity: "Belum ditentukan", priority: "Belum ditentukan" }, { method: "POST" }),
    );
    expect(anonymous.status).toBe(401);

    const foreign = await call(
      "/api/v1/pesantren/reports/RPT-0002/accept",
      asOwner(
        json({ severity: "Tinggi", priority: "Tinggi", rekomendasiFinal: "Perbaiki segera." }, { method: "POST" }),
      ),
    );
    expect(foreign.status).toBe(403);
  });

  test("accept: severity/priority wajib + rekomendasi final + turunan", async () => {
    const missing = await call(
      "/api/v1/pesantren/reports/RPT-0001/accept",
      asOwner(json({ severity: "Belum ditentukan", priority: "Sedang" }, { method: "POST" })),
    );
    expect(((await missing.json()) as { error: string }).error).toBe(
      "Severity dan priority wajib dipilih tanpa default.",
    );

    const shortRec = await call(
      "/api/v1/pesantren/reports/RPT-0001/accept",
      asOwner(
        json({ severity: "Tinggi", priority: "Sedang", rekomendasiFinal: "pendek" }, { method: "POST" }),
      ),
    );
    expect(shortRec.status).toBe(400);
    expect(((await shortRec.json()) as { error: string }).error).toBe(
      "Rekomendasi tindakan wajib diisi minimal 10 karakter.",
    );

    const accepted = await call(
      "/api/v1/pesantren/reports/RPT-0001/accept",
      asOwner(
        json(
          {
            severity: "Tinggi",
            priority: "Sedang",
            note: "Dicek hari ini.",
            rekomendasiFinal: "Ganti kabel dan pasang conduit dalam 3 hari.",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(accepted.status).toBe(200);
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT validation_status, handling_status, validated_by FROM reports WHERE id = 'RPT-0001'",
    );
    expect(rows[0]?.validation_status).toBe("Diterima");
    expect(rows[0]?.handling_status).toBe("Pending");
    expect(rows[0]?.validated_by).toBe("USR-003");
    expect(
      await scalar("SELECT COUNT(*) AS c FROM findings WHERE report_id = 'RPT-0001'"),
    ).toBeGreaterThan(0);
    expect(
      await scalar("SELECT COUNT(*) AS c FROM recommendations WHERE report_id = 'RPT-0001'"),
    ).toBeGreaterThan(0);

    const [finding] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM findings WHERE report_id = 'RPT-0001' LIMIT 1",
    );
    const findingId = String(finding[0].id);
    const level = await call(
      `/api/v1/pesantren/findings/${findingId}/level`,
      asOwner(json({ level: "Ekstrem" }, { method: "PATCH" })),
    );
    expect(level.status).toBe(200);
    const [after] = await pool.query<RowDataPacket[]>(
      "SELECT level FROM findings WHERE id = ?",
      [findingId],
    );
    expect(after[0]?.level).toBe("Ekstrem");
  });

  test("accept ulang ditolak (bukan Menunggu validasi)", async () => {
    const again = await call(
      "/api/v1/pesantren/reports/RPT-0001/accept",
      asOwner(
        json(
          { severity: "Rendah", priority: "Rendah", rekomendasiFinal: "Sudah cukup panjang." },
          { method: "POST" },
        ),
      ),
    );
    expect(again.status).toBe(409);
    expect(((await again.json()) as { error: string }).error).toBe(
      "Hanya laporan Menunggu validasi yang dapat diterima.",
    );
  });

  test("lifecycle Pending→Proses→Completed + verify + arsip", async () => {
    const start = await call(
      "/api/v1/pesantren/reports/RPT-0001/status",
      asOwner(
        json(
          { next: "Proses", owner: "Tim Listrik", dueDate: "2026-12-31", note: "Rencana disusun." },
          { method: "POST" },
        ),
      ),
    );
    expect(start.status).toBe(200);
    const [recRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM recommendations WHERE report_id = 'RPT-0001'",
    );
    const recId = String(recRows[0].id);

    const progress = await call(
      `/api/v1/pesantren/recommendations/${recId}/progress`,
      asOwner(json({ note: "Pekerjaan selesai.", progress: 100, evidenceName: "bukti.jpg" }, { method: "POST" })),
    );
    expect(progress.status).toBe(200);
    const [mid] = await pool.query<RowDataPacket[]>(
      "SELECT status FROM recommendations WHERE id = ?",
      [recId],
    );
    expect(mid[0]?.status).toBe("Menunggu verifikasi");

    const verify = await call(
      `/api/v1/pesantren/recommendations/${recId}/verify`,
      asOwner(json({ verify: true, note: "Bukti sesuai." }, { method: "POST" })),
    );
    expect(verify.status).toBe(200);
    const [done] = await pool.query<RowDataPacket[]>(
      "SELECT status FROM recommendations WHERE id = ?",
      [recId],
    );
    expect(done[0]?.status).toBe("Terverifikasi");
    const [report] = await pool.query<RowDataPacket[]>(
      "SELECT handling_status FROM reports WHERE id = 'RPT-0001'",
    );
    expect(report[0]?.handling_status).toBe("Completed");

    const archived = await call(
      "/api/v1/pesantren/reports/RPT-0001/archive",
      asOwner(json({ reason: "Selesai dan terverifikasi." }, { method: "POST" })),
    );
    expect(archived.status).toBe(200);
    const [arsip] = await pool.query<RowDataPacket[]>(
      "SELECT archived_at FROM reports WHERE id = 'RPT-0001'",
    );
    expect(arsip[0]?.archived_at).not.toBeNull();
  });

  test("reject alasan minimal 10 + setFindingLevel", async () => {
    const created = await call(
      "/api/v1/reports/lapor-cepat",
      json(
        {
          institutionCode: "PSN-0018",
          reporterName: "Ahmad",
          title: "Kabel terkelupas di dapur",
          description: "Kabel dekat kompor terkelupas dan berisiko tersengat.",
          manualLocation: "Dapur utama",
        },
        { method: "POST" },
      ),
    );
    const newId = ((await created.json()) as { data: { id: string } }).data.id;

    const short = await call(
      `/api/v1/pesantren/reports/${newId}/reject`,
      asOwner(json({ reason: "pendek" }, { method: "POST" })),
    );
    expect(short.status).toBe(400);
    expect(((await short.json()) as { error: string }).error).toBe(
      "Alasan penolakan minimal 10 karakter.",
    );
    const rejected = await call(
      `/api/v1/pesantren/reports/${newId}/reject`,
      asOwner(json({ reason: "Tidak sesuai kriteria pelaporan." }, { method: "POST" })),
    );
    expect(rejected.status).toBe(200);
  });

  test("cancel tindak lanjut alasan minimal 10", async () => {
    const created = await call(
      "/api/v1/reports/lapor-cepat",
      json(
        {
          institutionCode: "PSN-0018",
          reporterName: "Ahmad",
          title: "Pintu darurat terhalang kursi",
          description: "Akses pintu darurat tertutup tumpukan kursi di koridor.",
          manualLocation: "Koridor lantai 1",
        },
        { method: "POST" },
      ),
    );
    const id = ((await created.json()) as { data: { id: string } }).data.id;
    await call(
      `/api/v1/pesantren/reports/${id}/accept`,
      asOwner(
        json(
          {
            severity: "Sedang",
            priority: "Sedang",
            note: "Diterima.",
            rekomendasiFinal: "Bersihkan jalur evakuasi segera.",
          },
          { method: "POST" },
        ),
      ),
    );
    const [recRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM recommendations WHERE report_id = ? LIMIT 1",
      [id],
    );
    const recId = String(recRows[0].id);
    const short = await call(
      `/api/v1/pesantren/recommendations/${recId}/cancel`,
      asOwner(json({ reason: "pendek" }, { method: "POST" })),
    );
    expect(short.status).toBe(400);
    const canceled = await call(
      `/api/v1/pesantren/recommendations/${recId}/cancel`,
      asOwner(json({ reason: "Perbaikan digantikan renovasi menyeluruh." }, { method: "POST" })),
    );
    expect(canceled.status).toBe(200);
    const [rec] = await pool.query<RowDataPacket[]>(
      "SELECT status, canceled_reason FROM recommendations WHERE id = ?",
      [recId],
    );
    expect(rec[0]?.status).toBe("Dibatalkan");
    expect(String(rec[0]?.canceled_reason)).toContain("renovasi");
  });

  test("lokasi: gedung + lantai + area", async () => {
    const building = await call(
      "/api/v1/pesantren/buildings",
      asOwner(json({ code: "GD-IT", name: "Gedung IT" }, { method: "POST" })),
    );
    expect(building.status).toBe(201);
    const buildingId = ((await building.json()) as { data: { id: string } }).data.id;
    expect(buildingId.startsWith("BLD-")).toBe(true);

    const floor = await call(
      `/api/v1/pesantren/buildings/${buildingId}/floors`,
      asOwner(json({ name: "Lantai 2" }, { method: "POST" })),
    );
    expect(floor.status).toBe(201);

    const area = await call(
      "/api/v1/pesantren/areas",
      asOwner(
        json(
          { buildingId, floor: "Lantai 2", name: "Lab Komputer", zone: "Zona A" },
          { method: "POST" },
        ),
      ),
    );
    expect(area.status).toBe(201);
    const areaId = ((await area.json()) as { data: { id: string } }).data.id;
    expect(
      await scalar("SELECT COUNT(*) AS c FROM areas WHERE id = ? AND institution_code = 'PSN-0018'", [
        areaId,
      ]),
    ).toBe(1);
  });

  test("denah: upload + publish optimistic lock", async () => {
    const form = new FormData();
    form.append("file", new File([pngBytes(1000, 900)], "denah.png", { type: "image/png" }));
    form.append("institutionCode", "PSN-0018");
    const uploaded = await call("/api/v1/uploads/campus-plan", {
      method: "POST",
      headers: { "X-Demo-Account": "USR-003" },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const assetId = ((await uploaded.json()) as { data: { id: string } }).data.id;

    const state = await loadIshasState();
    const active = state.institutions.find((i) => i.code === "PSN-0018")?.activeCampusPlanVersionId;

    const stale = await call(
      "/api/v1/pesantren/campus-plans/publish",
      asOwner(
        json(
          {
            institutionCode: "PSN-0018",
            assetId,
            width: 1000,
            height: 900,
            expectedActiveId: "CAMPUS-PSN-0018-v99",
            acknowledged: true,
          },
          { method: "POST" },
        ),
      ),
    );
    expect(stale.status).toBe(409);

    const published = await call(
      "/api/v1/pesantren/campus-plans/publish",
      asOwner(
        json(
          {
            institutionCode: "PSN-0018",
            assetId,
            width: 1000,
            height: 900,
            expectedActiveId: active,
            acknowledged: true,
          },
          { method: "POST" },
        ),
      ),
    );
    expect(published.status).toBe(201);
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT active_campus_plan_id FROM institutions WHERE code = 'PSN-0018'",
    );
    expect(String(row[0]?.active_campus_plan_id)).toContain("CAMPUS-PSN-0018-v");
  });
});

describe.skipIf(!dbReady)("Fase 3 HTTP (bank + dokumen + dataset)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined)),
    },
    body: JSON.stringify(body),
  });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));
  const asValidator = (init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "X-Demo-Account": "USR-002",
    },
  });
  const pdfBytes = (): Uint8Array => new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");

  beforeAll(async () => {
    await seedDemo();
  });

  test("bank: RBAC 403 untuk non-Validator", async () => {
    const denied = await call(
      "/api/v1/validator/bank/dimensions",
      json({ name: "Dimensi uji" }, { method: "POST", headers: { "X-Demo-Account": "USR-003" } }),
    );
    expect(denied.status).toBe(403);
  });

  test("bank: CRUD + validasi 1:1 + checksum cocok DB", async () => {
    const shortName = await call(
      "/api/v1/validator/bank/dimensions",
      asValidator(json({ name: "xy" }, { method: "POST" })),
    );
    expect(shortName.status).toBe(400);
    expect(((await shortName.json()) as { error: string }).error).toBe(
      "Nama dimensi minimal 3 karakter.",
    );

    const dim = await call(
      "/api/v1/validator/bank/dimensions",
      asValidator(json({ name: "Dimensi Uji Fase 3", categoryId: "KAT-KESELAMATAN" }, { method: "POST" })),
    );
    expect(dim.status).toBe(201);
    const dimensionId = ((await dim.json()) as { data: { id: string } }).data.id;

    const indicator = await call(
      "/api/v1/validator/bank/indicators",
      asValidator(
        json(
          {
            dimensionId,
            code: "IND-TEST-F3",
            title: "Indikator uji fase tiga",
            prompt: "Apakah instalasi aman dan terlindungi?",
            answerType: "ya-tidak",
            required: true,
            evidenceRequired: false,
            locationRequired: false,
          },
          { method: "POST" },
        ),
      ),
    );
    expect(indicator.status).toBe(201);
    const indicatorId = ((await indicator.json()) as { data: { id: string } }).data.id;

    const tooFew = await call(
      `/api/v1/validator/bank/indicators/${indicatorId}/options`,
      asValidator(
        json({ options: [{ value: "Ya", label: "Ya", weight: 100, isFinding: false }] }, { method: "PUT" }),
      ),
    );
    expect(tooFew.status).toBe(400);
    expect(((await tooFew.json()) as { error: string }).error).toBe("Minimal 2 opsi jawaban.");

    const options = await call(
      `/api/v1/validator/bank/indicators/${indicatorId}/options`,
      asValidator(
        json(
          {
            options: [
              { value: "Ya", label: "Ya", weight: 100, isFinding: false },
              { value: "Tidak", label: "Tidak", weight: 10, isFinding: true },
            ],
            weight: 2,
          },
          { method: "PUT" },
        ),
      ),
    );
    expect(options.status).toBe(200);

    const state = await loadIshasState();
    expect(state.instrument.checksum).toBe(hitungChecksumInstrument(state.instrument.dimensions));
    const [meta] = await pool.query<RowDataPacket[]>(
      "SELECT checksum FROM instrument_meta WHERE id = 'INS-LIVE'",
    );
    expect(String(meta[0]?.checksum)).toBe(state.instrument.checksum);
    expect(state.instrument.checksum).not.toBe(SEED.instrument.checksum);

    const removed = await call(
      `/api/v1/validator/bank/indicators/${indicatorId}`,
      asValidator({ method: "DELETE" }),
    );
    expect(removed.status).toBe(200);
    const removedDim = await call(
      `/api/v1/validator/bank/dimensions/${dimensionId}`,
      asValidator({ method: "DELETE" }),
    );
    expect(removedDim.status).toBe(200);

    const after = await loadIshasState();
    expect(after.instrument.checksum).toBe(SEED.instrument.checksum);
  });

  test("dokumen: upload PDF + upsert + visibilitas + blob + hapus", async () => {
    const form = new FormData();
    form.append("file", new File([pdfBytes()], "uji-indikator.pdf", { type: "application/pdf" }));
    const uploaded = await call("/api/v1/uploads/instrument-doc", {
      method: "POST",
      headers: { "X-Demo-Account": "USR-002" },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const assetId = ((await uploaded.json()) as { data: { id: string } }).data.id;

    const upsert = await call(
      "/api/v1/validator/docs/IND-K3L-002",
      asValidator(
        json(
          {
            fileName: "uji-indikator.pdf",
            fileSize: pdfBytes().length,
            assetId,
            visibility: "Privat",
          },
          { method: "PUT" },
        ),
      ),
    );
    expect(upsert.status).toBe(201);

    const privateBlob = await call("/api/v1/docs/IND-K3L-002/blob");
    expect(privateBlob.status).toBe(401);

    const visible = await call(
      "/api/v1/validator/docs/IND-K3L-002/visibility",
      asValidator(json({ visibility: "Public" }, { method: "PATCH" })),
    );
    expect(visible.status).toBe(200);

    const publicBlob = await call("/api/v1/docs/IND-K3L-002/blob");
    expect(publicBlob.status).toBe(200);
    expect(publicBlob.headers.get("content-type")).toBe("application/pdf");

    const fileBlob = await call(`/api/v1/files/${assetId}`);
    expect(fileBlob.status).toBe(200);

    const removed = await call(
      "/api/v1/validator/docs/IND-K3L-002",
      asValidator({ method: "DELETE" }),
    );
    expect(removed.status).toBe(200);
    expect((await call("/api/v1/docs/IND-K3L-002/blob")).status).toBe(404);
  });

  test("dataset: ekspor whitelist D-02 tanpa bocor bidang privat", async () => {
    const csv = await call("/api/v1/validator/dataset/export?format=csv", asValidator());
    expect(csv.status).toBe(200);
    const csvBody = await csv.text();
    expect(csvBody).toContain("reportId,institutionCode");
    expect(csvBody).not.toContain("reporterName");
    expect(csvBody).not.toContain("contact");
    expect(csvBody).not.toContain("answers");

    const exported = await call("/api/v1/validator/dataset/export?format=json", asValidator());
    expect(exported.status).toBe(200);
    const exportedBody = await exported.text();
    expect(exportedBody).not.toContain("reporterName");

    const denied = await call("/api/v1/validator/dataset/export?format=csv");
    expect(denied.status).toBe(401);
  });

  test("dataset: impor ≤200 baris → pratinjau → Menunggu validasi + notifikasi", async () => {
    const text = "institutionCode,reporterName,scorePercent,title\nPSN-0018,Tim impor uji,65,Uji impor dataset\n";
    const preview = await call(
      "/api/v1/validator/dataset/import",
      asValidator(json({ text }, { method: "POST" })),
    );
    expect(preview.status).toBe(200);
    const parsed = (await preview.json()) as { data: { valid: unknown[]; errors: unknown[] } };
    expect(parsed.data.valid.length).toBe(1);

    const applied = await call(
      "/api/v1/validator/dataset/import",
      asValidator(
        json(
          {
            rows: [
              {
                institutionCode: "PSN-0018",
                reporterName: "Tim impor uji",
                scorePercent: 65,
                title: "Uji impor dataset",
              },
            ],
            apply: true,
          },
          { method: "POST" },
        ),
      ),
    );
    expect(applied.status).toBe(201);
    const appliedBody = (await applied.json()) as { data: { applied: number; id: string } };
    expect(appliedBody.data.applied).toBe(1);

    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT validation_status, handling_status, score_percent FROM reports WHERE id = ?",
      [appliedBody.data.id],
    );
    expect(row[0]?.validation_status).toBe("Menunggu validasi");
    expect(row[0]?.handling_status).toBe("Menunggu validasi");
    expect(Number(row[0]?.score_percent)).toBe(65);
    expect(
      await scalar("SELECT COUNT(*) AS c FROM self_assessment_snapshots WHERE report_id = ?", [
        appliedBody.data.id,
      ]),
    ).toBe(1);
  });

  test("audit publikasi: checklist 5 kriteria", async () => {
    const response = await call("/api/v1/validator/publication-audit", asValidator());
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      data: { items: { reportId: string; layak: boolean; lengkap: boolean; checksumCocok: boolean }[] };
    };
    expect(body.data.items.length).toBeGreaterThan(0);
    for (const item of body.data.items) {
      expect(typeof item.layak).toBe("boolean");
      expect(typeof item.lengkap).toBe("boolean");
      expect(typeof item.checksumCocok).toBe("boolean");
    }
  });
});

describe.skipIf(!dbReady)("Fase 4 HTTP (SAM-iSAFE)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined)),
    },
    body: JSON.stringify(body),
  });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));
  const asValidator = (init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "X-Demo-Account": "USR-002",
    },
  });
  const pngBytes = (width: number, height: number): Uint8Array => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    png[18] = (width >> 8) & 0xff;
    png[19] = width & 0xff;
    png[22] = (height >> 8) & 0xff;
    png[23] = height & 0xff;
    return png;
  };

  beforeAll(async () => {
    await seedDemo();
  });

  test("bank SAM: RBAC + kategori + soal + urutan + aktif + guard hapus", async () => {
    const denied = await call(
      "/api/v1/validator/sam/categories",
      json({ name: "Kategori uji" }, { method: "POST", headers: { "X-Demo-Account": "USR-003" } }),
    );
    expect(denied.status).toBe(403);

    const shortName = await call(
      "/api/v1/validator/sam/categories",
      asValidator(json({ name: "xy" }, { method: "POST" })),
    );
    expect(shortName.status).toBe(400);
    expect(((await shortName.json()) as { error: string }).error).toBe(
      "Nama kategori minimal 3 karakter.",
    );

    const category = await call(
      "/api/v1/validator/sam/categories",
      asValidator(json({ name: "Kategori Uji Fase 4" }, { method: "POST" })),
    );
    expect(category.status).toBe(201);
    const categoryId = ((await category.json()) as { data: { id: string } }).data.id;

    const duplicate = await call(
      "/api/v1/validator/sam/categories",
      asValidator(json({ name: "kategori uji fase 4" }, { method: "POST" })),
    );
    expect(duplicate.status).toBe(400);
    expect(((await duplicate.json()) as { error: string }).error).toBe(
      "Nama kategori sudah digunakan.",
    );

    const shortText = await call(
      "/api/v1/validator/sam/questions",
      asValidator(json({ categoryId, text: "pendek" }, { method: "POST" })),
    );
    expect(shortText.status).toBe(400);
    expect(((await shortText.json()) as { error: string }).error).toBe(
      "Teks pertanyaan minimal 10 karakter.",
    );

    const question = await call(
      "/api/v1/validator/sam/questions",
      asValidator(
        json(
          {
            categoryId,
            text: "Apakah jalur evakuasi bebas hambatan dan mudah diakses?",
            panduan: "Periksa koridor dan pintu keluar.",
            contohBukti: "Foto koridor.",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(question.status).toBe(201);
    const questionId = ((await question.json()) as { data: { id: string } }).data.id;

    const edge = await call(
      `/api/v1/validator/sam/questions/${questionId}/move`,
      asValidator(json({ direction: "up" }, { method: "POST" })),
    );
    expect(edge.status).toBe(400);
    expect(((await edge.json()) as { error: string }).error).toBe("Sudah di ujung urutan.");

    const disabled = await call(
      `/api/v1/validator/sam/questions/${questionId}/active`,
      asValidator(json({ active: false }, { method: "POST" })),
    );
    expect(disabled.status).toBe(200);

    const blockedDelete = await call(
      `/api/v1/validator/sam/categories/${categoryId}`,
      asValidator({ method: "DELETE" }),
    );
    expect(blockedDelete.status).toBe(400);
    expect(((await blockedDelete.json()) as { error: string }).error).toContain(
      "masih berisi 1 pertanyaan",
    );

    expect(
      (
        await call(
          `/api/v1/validator/sam/questions/${questionId}`,
          asValidator({ method: "DELETE" }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await call(
          `/api/v1/validator/sam/categories/${categoryId}`,
          asValidator({ method: "DELETE" }),
        )
      ).status,
    ).toBe(200);
  });

  test("pengamatan: buat → jawab → selesai → review + riwayat utuh setelah bank berubah", async () => {
    const nonRegistered = await call(
      "/api/v1/validator/sam/assessments",
      asValidator(
        json(
          {
            institutionCode: "PSN-0023",
            manualLocation: "Asrama",
            observedAt: "2026-09-28",
            kind: "Pemeriksaan Rutin",
            observerName: "M. Ridwan",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(nonRegistered.status).toBe(400);
    expect(((await nonRegistered.json()) as { error: string }).error).toBe(
      "Pilih pesantren terdaftar.",
    );

    const created = await call(
      "/api/v1/validator/sam/assessments",
      asValidator(
        json(
          {
            institutionCode: "PSN-0018",
            manualLocation: "Asrama Putra Blok B",
            observedAt: "2026-09-28",
            observedTime: "09:00",
            kind: "Pemeriksaan Rutin",
            observerName: "M. Ridwan",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(created.status).toBe(201);
    const assessmentId = ((await created.json()) as { data: { id: string } }).data.id;

    const badScore = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}/answers`,
      asValidator(json({ questionId: "SAM-Q-001", score: 3 }, { method: "PUT" })),
    );
    expect(badScore.status).toBe(400);
    expect(((await badScore.json()) as { error: string }).error).toBe(
      "Nilai harus 0, 1, atau 2.",
    );

    const active = (await loadIshasState()).samQuestions.filter((item) => item.isActive);
    const first = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}/answers`,
      asValidator(json({ questionId: active[0].id, score: 2 }, { method: "PUT" })),
    );
    expect(first.status).toBe(200);

    const incomplete = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}/complete`,
      asValidator({ method: "POST" }),
    );
    expect(incomplete.status).toBe(400);
    expect(((await incomplete.json()) as { error: string }).error).toMatch(
      /Masih ada \d+ pertanyaan belum dinilai\./,
    );

    for (const item of active) {
      const filled = await call(
        `/api/v1/validator/sam/assessments/${assessmentId}/answers`,
        asValidator(json({ questionId: item.id, score: 2 }, { method: "PUT" })),
      );
      expect(filled.status).toBe(200);
    }

    const completed = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}/complete`,
      asValidator({ method: "POST" }),
    );
    expect(completed.status).toBe(200);
    const doneState = await loadIshasState();
    const done = doneState.samAssessments.find((item) => item.id === assessmentId)!;
    expect(done.status).toBe("Selesai");
    expect(done.maxScore).toBe(active.length * 2);
    expect(done.percent).toBe(100);

    const reviewed = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}/review`,
      asValidator(json({ note: "Diperiksa supervisor." }, { method: "POST" })),
    );
    expect(reviewed.status).toBe(200);
    const [reviewRow] = await pool.query<RowDataPacket[]>(
      "SELECT reviewed_by FROM sam_assessments WHERE id = ?",
      [assessmentId],
    );
    expect(String(reviewRow[0]?.reviewed_by)).toBe("M. Ridwan");

    // Riwayat jawaban lama harus utuh meski bank berubah (kriteria hijau #1).
    const target = active[active.length - 1];
    const edited = await call(
      `/api/v1/validator/sam/questions/${target.id}`,
      asValidator(json({ text: "Teks pertanyaan diperbarui untuk uji riwayat." }, { method: "PATCH" })),
    );
    expect(edited.status).toBe(200);
    const toggled = await call(
      `/api/v1/validator/sam/questions/${active[0].id}/active`,
      asValidator(json({ active: false }, { method: "POST" })),
    );
    expect(toggled.status).toBe(200);

    const afterBank = await loadIshasState();
    const frozen = afterBank.samAssessments.find((item) => item.id === assessmentId)!;
    expect(Object.keys(frozen.answers).length).toBe(active.length);
    expect(frozen.percent).toBe(100);
    expect(frozen.totalScore).toBe(active.length * 2);

    const deleteDone = await call(
      `/api/v1/validator/sam/assessments/${assessmentId}`,
      asValidator({ method: "DELETE" }),
    );
    expect(deleteDone.status).toBe(400);
    expect(((await deleteDone.json()) as { error: string }).error).toBe(
      "Pengamatan selesai tidak dapat dihapus.",
    );

    // Kembalikan soal ke aktif agar tidak mengubah komposisi seed untuk uji berikutnya.
    await call(
      `/api/v1/validator/sam/questions/${active[0].id}/active`,
      asValidator(json({ active: true }, { method: "POST" })),
    );
  });

  test("tindak lanjut: unik aktif + batal ≥10 + buat ulang setelah batal", async () => {
    const duplicate = await call(
      "/api/v1/validator/sam/follow-ups",
      asValidator(
        json(
          {
            assessmentId: "SAM-0001",
            questionId: "SAM-Q-005",
            pic: "Bagian Sarpras",
            dueDate: "2026-09-30",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(duplicate.status).toBe(400);
    expect(((await duplicate.json()) as { error: string }).error).toBe(
      "Temuan ini sudah mempunyai tindak lanjut aktif.",
    );

    const first = await call(
      "/api/v1/validator/sam/follow-ups",
      asValidator(
        json(
          {
            assessmentId: "SAM-0001",
            questionId: "SAM-Q-018",
            pic: "Bagian Sarpras",
            dueDate: "2026-09-30",
            note: "Pasang tanda titik kumpul.",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(first.status).toBe(201);
    const firstId = ((await first.json()) as { data: { id: string } }).data.id;

    const shortPic = await call(
      "/api/v1/validator/sam/follow-ups",
      asValidator(
        json(
          { assessmentId: "SAM-0001", questionId: "SAM-Q-019", pic: "A", dueDate: "2026-09-30" },
          { method: "POST" },
        ),
      ),
    );
    expect(shortPic.status).toBe(400);
    expect(((await shortPic.json()) as { error: string }).error).toBe(
      "Penanggung jawab minimal 2 karakter.",
    );

    const earlyDue = await call(
      "/api/v1/validator/sam/follow-ups",
      asValidator(
        json(
          {
            assessmentId: "SAM-0001",
            questionId: "SAM-Q-020",
            pic: "Bagian Sarpras",
            dueDate: "2026-09-01",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(earlyDue.status).toBe(400);
    expect(((await earlyDue.json()) as { error: string }).error).toBe(
      "Tenggat tidak boleh sebelum tanggal pengamatan.",
    );

    const updated = await call(
      `/api/v1/validator/sam/follow-ups/${firstId}`,
      asValidator(json({ status: "Berjalan" }, { method: "PATCH" })),
    );
    expect(updated.status).toBe(200);

    const shortReason = await call(
      `/api/v1/validator/sam/follow-ups/${firstId}/cancel`,
      asValidator(json({ reason: "pendek" }, { method: "POST" })),
    );
    expect(shortReason.status).toBe(400);
    expect(((await shortReason.json()) as { error: string }).error).toBe(
      "Alasan pembatalan minimal 10 karakter.",
    );

    const canceled = await call(
      `/api/v1/validator/sam/follow-ups/${firstId}/cancel`,
      asValidator(json({ reason: "Tidak relevan setelah verifikasi ulang." }, { method: "POST" })),
    );
    expect(canceled.status).toBe(200);

    const second = await call(
      "/api/v1/validator/sam/follow-ups",
      asValidator(
        json(
          {
            assessmentId: "SAM-0001",
            questionId: "SAM-Q-018",
            pic: "Bagian Sarpras",
            dueDate: "2026-10-05",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(second.status).toBe(201);
    const secondId = ((await second.json()) as { data: { id: string } }).data.id;

    const canceledAgain = await call(
      `/api/v1/validator/sam/follow-ups/${secondId}/cancel`,
      asValidator(json({ reason: "Digantikan rencana baru tahap dua." }, { method: "POST" })),
    );
    expect(canceledAgain.status).toBe(200);

    // Migrasi 0002: dua baris Dibatalkan untuk pasangan yang sama diizinkan.
    expect(
      await scalar(
        "SELECT COUNT(*) AS c FROM sam_follow_ups WHERE assessment_id = 'SAM-0001' " +
          "AND question_id = 'SAM-Q-018' AND status = 'Dibatalkan'",
      ),
    ).toBe(2);
  });

  test("bukti SAM: unggah Validator + serve scope + tolak anon", async () => {
    const form = new FormData();
    form.append("file", new File([pngBytes(400, 300)], "temuan.png", { type: "image/png" }));
    form.append("institutionCode", "PSN-0018");
    const uploaded = await call("/api/v1/uploads/sam-evidence", {
      method: "POST",
      headers: { "X-Demo-Account": "USR-002" },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const assetId = ((await uploaded.json()) as { data: { id: string } }).data.id;

    const allowed = await call(`/api/v1/files/${assetId}`, {
      headers: { "X-Demo-Account": "USR-002" },
    });
    expect(allowed.status).toBe(200);

    const anon = await call(`/api/v1/files/${assetId}`);
    expect(anon.status).toBe(401);
  });
});

describe.skipIf(!dbReady)("Fase 5 HTTP (admin + notifikasi + storage + migrasi)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    body: JSON.stringify(body),
  });
  const call = (path: string, init?: RequestInit) =>
    app(new Request(`http://localhost${path}`, init));
  const asAdmin = (init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "X-Demo-Account": "USR-001",
    },
  });
  const pngBytes = (width: number, height: number): Uint8Array => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    png[18] = (width >> 8) & 0xff;
    png[19] = width & 0xff;
    png[22] = (height >> 8) & 0xff;
    png[23] = height & 0xff;
    return png;
  };

  beforeAll(async () => {
    await seedDemo();
  });

  test("admin: RBAC + tambah pesantren + ubah status", async () => {
    const denied = await call("/api/v1/admin/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Demo-Account": "USR-003" },
      body: JSON.stringify({ name: "PP Uji Fase Lima", location: "Kota Uji" }),
    });
    expect(denied.status).toBe(403);

    const invalid = await call(
      "/api/v1/admin/institutions",
      asAdmin(json({ name: "xy", location: "Kota Uji" }, { method: "POST" })),
    );
    expect(invalid.status).toBe(400);
    expect(((await invalid.json()) as { error: string }).error).toBe(
      "Nama pesantren minimal 3 karakter.",
    );

    const created = await call(
      "/api/v1/admin/institutions",
      asAdmin(
        json(
          {
            name: "PP Uji Fase Lima",
            location: "Kota Malang",
            address: "Jl. Uji Nomor 10, Malang",
            manager: "Ust. Uji",
          },
          { method: "POST" },
        ),
      ),
    );
    expect(created.status).toBe(201);
    const code = ((await created.json()) as { data: { id: string } }).data.id;

    const status = await call(
      `/api/v1/admin/institutions/${code}/status`,
      asAdmin(json({ status: "Aktif" }, { method: "POST" })),
    );
    expect(status.status).toBe(200);
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT status FROM institutions WHERE code = ?",
      [code],
    );
    expect(String(row[0]?.status)).toBe("Aktif");
  });

  test("admin: pengguna + proteksi akun sendiri & admin terakhir", async () => {
    const badInstitution = await call(
      "/api/v1/admin/users",
      asAdmin(
        json(
          { name: "Uji Akun", email: "uji@ishas.demo", roleId: "pesantren", institutionCode: "PSN-0023" },
          { method: "POST" },
        ),
      ),
    );
    expect(badInstitution.status).toBe(400);
    expect(((await badInstitution.json()) as { error: string }).error).toBe(
      "Pesantren wajib terhubung ke satu pesantren aktif.",
    );

    const created = await call(
      "/api/v1/admin/users",
      asAdmin(
        json(
          { name: "Uji Akun", email: "uji@ishas.demo", roleId: "pesantren", institutionCode: "PSN-0018" },
          { method: "POST" },
        ),
      ),
    );
    expect(created.status).toBe(201);
    const userId = ((await created.json()) as { data: { id: string } }).data.id;

    const duplicate = await call(
      "/api/v1/admin/users",
      asAdmin(json({ name: "Uji Akun 2", email: "uji@ishas.demo", roleId: "validator" }, { method: "POST" })),
    );
    expect(duplicate.status).toBe(400);
    expect(((await duplicate.json()) as { error: string }).error).toBe(
      "Email sudah digunakan pada data demo.",
    );

    const updated = await call(
      `/api/v1/admin/users/${userId}`,
      asAdmin(json({ name: "Uji Akun Diubah", email: "uji2@ishas.demo", institutionCode: "PSN-0018" }, { method: "PATCH" })),
    );
    expect(updated.status).toBe(200);

    const activated = await call(
      `/api/v1/admin/users/${userId}/status`,
      asAdmin(json({ status: "Aktif" }, { method: "POST" })),
    );
    expect(activated.status).toBe(200);

    const selfStatus = await call(
      "/api/v1/admin/users/USR-001/status",
      asAdmin(json({ status: "Nonaktif" }, { method: "POST" })),
    );
    expect(selfStatus.status).toBe(403);
    expect(((await selfStatus.json()) as { error: string }).error).toBe(
      "Akun sendiri tidak dapat diubah statusnya.",
    );

    const selfDelete = await call(
      "/api/v1/admin/users/USR-001/delete",
      asAdmin({ method: "POST" }),
    );
    expect(selfDelete.status).toBe(403);

    const reset = await call(
      `/api/v1/admin/users/${userId}/reset-password`,
      asAdmin({ method: "POST" }),
    );
    expect(reset.status).toBe(200);

    const removed = await call(
      `/api/v1/admin/users/${userId}/delete`,
      asAdmin({ method: "POST" }),
    );
    expect(removed.status).toBe(200);
    expect(await scalar("SELECT COUNT(*) AS c FROM users WHERE id = ?", [userId])).toBe(0);
  });

  test("notifikasi: daftar penerima + tandai dibaca", async () => {
    const anon = await call("/api/v1/notifications");
    expect(anon.status).toBe(401);

    const list = await call("/api/v1/notifications", {
      headers: { "X-Demo-Account": "USR-003" },
    });
    expect(list.status).toBe(200);
    const body = (await list.json()) as {
      data: { items: { id: string; recipientAccountId: string; read: boolean }[] };
    };
    expect(body.data.items.length).toBeGreaterThan(0);
    expect(body.data.items.every((n) => n.recipientAccountId === "USR-003")).toBe(true);

    const read = await call(
      "/api/v1/notifications/read",
      json({}, { method: "POST", headers: { "X-Demo-Account": "USR-003" } }),
    );
    expect(read.status).toBe(200);
    expect(await scalar("SELECT COUNT(*) AS c FROM notifications WHERE recipient_account_id = 'USR-003' AND is_read = 0")).toBe(0);
  });

  test("storage: owner_ref saat submit + sweep yatim + tanpa bocor path", async () => {
    const form = new FormData();
    form.append("file", new File([pngBytes(320, 240)], "bukti-sah.png", { type: "image/png" }));
    form.append("institutionCode", "PSN-0018");
    const uploaded = await call("/api/v1/uploads/report-evidence", { method: "POST", body: form });
    expect(uploaded.status).toBe(201);
    const assetId = ((await uploaded.json()) as { data: { id: string } }).data.id;

    const report = await call(
      "/api/v1/reports/lapor-cepat",
      json(
        {
          institutionCode: "PSN-0018",
          reporterName: "Penguji Storage",
          title: "Kabel uji penyimpanan",
          description: "Menguji owner_ref pada bukti lapor-cepat fase lima.",
          manualLocation: "Koridor uji",
          evidenceName: "bukti-sah.png",
          evidenceAssetId: assetId,
        },
        { method: "POST" },
      ),
    );
    expect(report.status).toBe(201);
    const reportId = ((await report.json()) as { data: { id: string } }).data.id;
    const [owned] = await pool.query<RowDataPacket[]>(
      "SELECT owner_ref FROM file_assets WHERE asset_id = ?",
      [assetId],
    );
    expect(String(owned[0]?.owner_ref)).toBe(reportId);

    // Aset yatim: diunggah tetapi tak pernah dipakai, umurnya dibuat tua.
    const orphanForm = new FormData();
    orphanForm.append("file", new File([pngBytes(64, 64)], "yatim.png", { type: "image/png" }));
    orphanForm.append("institutionCode", "PSN-0018");
    const orphan = await call("/api/v1/uploads/report-evidence", {
      method: "POST",
      body: orphanForm,
    });
    const orphanId = ((await orphan.json()) as { data: { id: string } }).data.id;
    await pool.query(
      "UPDATE file_assets SET created_at = (NOW(3) - INTERVAL 48 HOUR) WHERE asset_id = ?",
      [orphanId],
    );

    const sweep = await call("/api/v1/admin/storage/sweep", asAdmin({ method: "POST" }));
    expect(sweep.status).toBe(200);
    expect(await scalar("SELECT COUNT(*) AS c FROM file_assets WHERE asset_id = ?", [orphanId])).toBe(0);

    const publicState = await call("/api/v1/public/state");
    const publicText = await publicState.text();
    expect(publicText).not.toContain("stored_path");
    expect(publicText).not.toContain("storage/");

    const adminState = await call("/api/v1/admin/state", asAdmin());
    const adminText = await adminState.text();
    expect(adminText).not.toContain("stored_path");
  });

  test("admin: audit filter pelaku + reset demo", async () => {
    const audit = await call("/api/v1/admin/audit?object=User", asAdmin());
    expect(audit.status).toBe(200);
    const body = (await audit.json()) as {
      data: { items: { objectType: string }[]; total: number };
    };
    expect(body.data.total).toBeGreaterThan(0);
    expect(body.data.items.every((e) => e.objectType === "User")).toBe(true);

    const paged = (await (
      await call("/api/v1/admin/audit?limit=500", asAdmin())
    ).json()) as { data: { items: unknown[]; page: number; limit: number } };
    expect(paged.data.limit).toBe(100);
    const defaultPaged = (await (
      await call("/api/v1/admin/audit", asAdmin())
    ).json()) as { data: { items: unknown[]; page: number; limit: number } };
    expect(defaultPaged.data.limit).toBe(20);
    expect(defaultPaged.data.page).toBe(1);

    const reset = await call("/api/v1/admin/reset-demo", asAdmin({ method: "POST" }));
    expect(reset.status).toBe(200);
    expect(await countRows("users")).toBe(SEED.users.length);
    expect(await scalar("SELECT COUNT(*) AS c FROM app_settings")).toBe(0);
  });

  test("migrasi aset: status + sekali jalan + flag", async () => {
    const before = await call("/api/v1/admin/migrate/status", asAdmin());
    expect(((await before.json()) as { data: { migrated: boolean } }).data.migrated).toBe(false);

    const base64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF").toString("base64");
    const assetId = `instrument-doc-${crypto.randomUUID()}`;
    const migrate = await call(
      "/api/v1/admin/migrate/assets",
      asAdmin(
        json(
          {
            items: [
              {
                kind: "instrument-doc",
                assetId,
                indicatorId: "IND-K3L-002",
                fileName: "migrasi-indikator.pdf",
                mime: "application/pdf",
                base64,
              },
            ],
          },
          { method: "POST" },
        ),
      ),
    );
    expect(migrate.status).toBe(201);
    expect(((await migrate.json()) as { data: { imported: number } }).data.imported).toBe(1);
    expect(await scalar("SELECT COUNT(*) AS c FROM file_assets WHERE asset_id = ?", [assetId])).toBe(1);
    expect(
      await scalar("SELECT COUNT(*) AS c FROM instrument_docs WHERE indicator_id = 'IND-K3L-002'"),
    ).toBe(1);

    const after = await call("/api/v1/admin/migrate/status", asAdmin());
    expect(((await after.json()) as { data: { migrated: boolean } }).data.migrated).toBe(true);

    const again = await call(
      "/api/v1/admin/migrate/assets",
      asAdmin(json({ items: [] }, { method: "POST" })),
    );
    expect(again.status).toBe(409);
  });
});

afterAll(async () => {
  if (dbReady) await closePool();
});
