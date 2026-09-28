// Integrasi: seed demo ke MySQL harus menghasilkan komposisi yang sama dengan
// SEED mock (kriteria hijau Fase 0). Dilewati otomatis bila DB tidak tersedia.
import { afterAll, describe, expect, test } from "bun:test";
import { SEED } from "../../web/mocks/seed/seed";
import { closePool, pingDb, pool } from "../src/db";
import { seedDemo } from "../src/seed/demo";
import { countRows } from "../src/seed/helpers";

let dbReady = false;
try {
  await pingDb();
  dbReady = true;
} catch {
  dbReady = false;
}

if (!dbReady) {
  console.warn("[test] MySQL tidak tersedia → lewati uji integrasi seed.");
}

describe.skipIf(!dbReady)("komposisi seed demo di MySQL", () => {
  test("seedDemo mengisi baris sesuai SEED", async () => {
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
  });

  test("checksum bank di DB sama dengan hitungChecksumInstrument", async () => {
    const [rows] = await pool.query("SELECT checksum FROM instrument_meta WHERE id = 'INS-LIVE'");
    const checksum = (rows as { checksum: string }[])[0]?.checksum;
    expect(checksum).toBe(SEED.instrument.checksum);
  });
});

afterAll(async () => {
  if (dbReady) await closePool();
});
