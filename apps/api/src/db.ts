// Koneksi MySQL 8 (mysql2/promise). Pool tunggal dipakai seluruh modul backend.

import mysql from "mysql2/promise";
import { dbConfig } from "./config";

export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4_unicode_ci",
  timezone: "Z",
  supportBigNumbers: true,
});

export async function pingDb(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}

// Jalankan banyak statement multi-baris (khusus migrasi DDL). Koneksi terpisah
// ber-`multipleStatements` agar pool aplikasi tidak mengizinkan multi-statement.
export async function runScript(sqlText: string): Promise<void> {
  const conn = await mysql.createConnection({
    ...dbConfig,
    charset: "utf8mb4_unicode_ci",
    multipleStatements: true,
  });
  try {
    await conn.query(sqlText);
  } finally {
    await conn.end();
  }
}
