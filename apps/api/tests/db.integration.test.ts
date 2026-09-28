// Uji integrasi DB (dilewati otomatis bila MySQL tidak tersedia):
// skema, komposisi seed demo/empty, dan invarian relasi antar tabel.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { RowDataPacket } from "mysql2/promise";
import { SEED } from "../../web/mocks/seed/seed";
import { K3_CATEGORIES } from "../../web/mocks/kategori-k3";
import { loadActor } from "../src/actor";
import { createApp } from "../src/app";
import { closePool, pingDb, pool } from "../src/db";
import { loadIshasState } from "../src/repo/state";
import { seedDemo } from "../src/seed/demo";
import { seedEmpty } from "../src/seed/empty";
import { ALL_TABLES, countRows } from "../src/seed/helpers";

let dbReady = false;
try {
  await pingDb();
  dbReady = true;
} catch {
  dbReady = false;
}

if (!dbReady) {
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
    headers: { "Content-Type": "application/json" },
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
      data: { reports: { validationStatus: string; reporterName: string }[] };
    };
    expect(body.ok).toBe(true);
    expect(body.data.reports.length).toBeGreaterThan(0);
    expect(body.data.reports.every((r) => r.validationStatus === "Diterima")).toBe(true);
    expect(body.data.reports.every((r) => r.reporterName === "")).toBe(true);
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
    expect(anonymous.status).toBe(403);
    const deleted = await call(`/api/v1/uploads/report-evidence/${asset.data.id}`, {
      method: "DELETE",
      headers: { "X-Demo-Account": owner.id },
    });
    expect(deleted.status).toBe(200);
    expect(
      await scalar("SELECT COUNT(*) AS c FROM file_assets WHERE asset_id = ?", [asset.data.id]),
    ).toBe(0);
  });
});

afterAll(async () => {
  if (dbReady) await closePool();
});
