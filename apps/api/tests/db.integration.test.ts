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

describe.skipIf(!dbReady)("Fase 2 HTTP (validasi + lifecycle + lokasi + tindak lanjut)", () => {
  const app = createApp({ ping: pingDb, loadActor, loadState: loadIshasState });
  const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: { "Content-Type": "application/json" },
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

afterAll(async () => {
  if (dbReady) await closePool();
});
