// Uji integrasi DB (dilewati otomatis bila MySQL tidak tersedia):
// skema, komposisi seed demo/empty, dan invarian relasi antar tabel.
import { afterAll, describe, expect, test } from "bun:test";
import type { RowDataPacket } from "mysql2/promise";
import { SEED } from "../../web/mocks/seed/seed";
import { K3_CATEGORIES } from "../../web/mocks/kategori-k3";
import { closePool, pingDb, pool } from "../src/db";
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

afterAll(async () => {
  if (dbReady) await closePool();
});
