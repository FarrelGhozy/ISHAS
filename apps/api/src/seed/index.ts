// CLI seed: `bun run src/seed/index.ts --mode=demo|empty` (default: demo).
import { closePool } from "../db";
import { seedDemo } from "./demo";
import { seedEmpty } from "./empty";
import { countRows } from "./helpers";

type Mode = "demo" | "empty";

function parseMode(argv: string[]): Mode {
  const inline = argv.find((arg) => arg.startsWith("--mode="));
  if (inline) return inline.split("=")[1] === "empty" ? "empty" : "demo";
  const index = argv.indexOf("--mode");
  if (index >= 0 && argv[index + 1] === "empty") return "empty";
  return "demo";
}

async function main(): Promise<void> {
  const mode = parseMode(process.argv.slice(2));
  console.log(`[seed] mode=${mode}`);
  if (mode === "empty") {
    await seedEmpty();
  } else {
    await seedDemo();
  }
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
