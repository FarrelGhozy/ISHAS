// Runner migrasi DDL. Pemakaian:
//   bun run migrate           # terapkan migrasi yang belum dijalankan
//   bun run migrate --fresh   # DROP + CREATE database lalu terapkan semua
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { dbConfig } from "./config";
import { closePool, pool, runScript } from "./db";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const fresh = process.argv.includes("--fresh");

async function bootstrapDatabase(): Promise<void> {
  if (fresh) {
    const admin = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });
    try {
      await admin.query(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);
      await admin.query(
        `CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`[migrate] database ${dbConfig.database} dibuat ulang (--fresh)`);
    } finally {
      await admin.end();
    }
    return;
  }
  const admin = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await admin.end();
  }
}

async function appliedMigrations(): Promise<Set<string>> {
  const [rows] = await pool.query("SELECT id FROM schema_migrations");
  return new Set((rows as { id: string }[]).map((row) => row.id));
}

async function main(): Promise<void> {
  await bootstrapDatabase();
  await runScript(
    "CREATE TABLE IF NOT EXISTS schema_migrations (" +
      "id VARCHAR(64) PRIMARY KEY, " +
      "applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  );
  const applied = await appliedMigrations();
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] lewati ${file} (sudah diterapkan)`);
      continue;
    }
    const sqlText = await readFile(join(migrationsDir, file), "utf8");
    await runScript(sqlText);
    await pool.query("INSERT INTO schema_migrations (id) VALUES (?)", [file]);
    console.log(`[migrate] diterapkan ${file}`);
    count += 1;
  }
  console.log(`[migrate] selesai, ${count} migrasi baru.`);
}

main()
  .catch((error) => {
    console.error("[migrate] gagal:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
