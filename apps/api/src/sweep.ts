// Skrip job malam storage: `bun run sweep` (BACKEND_STORAGE.md §5) + sesi kedaluwarsa.
import { closePool } from "./db";
import { sweepOrphans } from "./storage-jobs";
import { purgeExpiredSessions } from "./repo/sessions";

const hours = Number.parseInt(process.argv.find((a) => a.startsWith("--hours="))?.slice(8) ?? "24", 10);

sweepOrphans({ olderThanHours: Number.isFinite(hours) ? hours : 24 })
  .then(async (result) => {
    const sessions = await purgeExpiredSessions();
    console.log(
      `[sweep] aset staging dihapus: ${result.assets}, file tmp: ${result.tmpFiles}, ` +
        `dilewati seed: ${result.skippedSeed}, sesi kedaluwarsa: ${sessions}`,
    );
  })
  .catch((error) => {
    console.error("[sweep] gagal:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
