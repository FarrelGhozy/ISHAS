// CLI seed: `bun run src/seed/index.ts --mode=demo|demo-local|empty`
// (default: demo). `demo-local` memakai `demo.local.ts` privat (bila ada).
import { closePool } from "../db";
import { seedEmpty } from "./empty";
import { loadLocalSeed, localSeedFilePath, seedDemoPreferLocal } from "./local";
import { countRows } from "./helpers";

type Mode = "demo" | "demo-local" | "empty";

function parseMode(argv: string[]): Mode {
  const inline = argv.find((arg) => arg.startsWith("--mode="));
  if (inline) {
    const value = inline.slice("--mode=".length);
    if (value === "empty") return "empty";
    if (value === "demo-local") return "demo-local";
    return "demo";
  }
  const index = argv.indexOf("--mode");
  const value = index >= 0 ? argv[index + 1] : undefined;
  if (value === "empty") return "empty";
  if (value === "demo-local") return "demo-local";
  return "demo";
}

async function runSeed(mode: Mode): Promise<void> {
  if (mode === "empty") {
    await seedEmpty();
    return;
  }
  if (mode === "demo-local") {
    const local = await loadLocalSeed();
    if (!local) throw new Error(`Seed lokal tidak ditemukan: ${localSeedFilePath()}`);
    await local.seedLocalDemo();
    return;
  }
  await seedDemoPreferLocal();
}

async function main(): Promise<void> {
  const mode = parseMode(process.argv.slice(2));
  console.log(`[seed] mode=${mode}`);
  await runSeed(mode);
  const tables = [
    "institutions",
    "users",
    "reports",
    "findings",
    "recommendations",
    "sam_assessments",
    "sam_follow_ups",
    "audit_events",
    "notifications",
    "bank_indicators",
    "sam_questions",
  ];
  const counts: Record<string, number> = {};
  for (const table of tables) counts[table] = await countRows(table);
  console.log("[seed] jumlah baris:", counts);
  console.log("[seed] selesai.");
}

main()
  .catch((error) => {
    console.error("[seed] gagal:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
