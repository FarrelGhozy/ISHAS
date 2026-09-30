// Akses tabel file_assets (metadata blob) + instrument_docs untuk penyajian.

import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";
import type { Tx } from "./writes";

export type FileAssetRow = {
  assetId: string;
  kind: string;
  institutionCode: string | null;
  ownerRef: string | null;
  originalName: string;
  storedPath: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  sha256: string;
  visibility: string;
  uploadedBy: string;
};

export async function insertFileAssetTx(conn: Tx, row: FileAssetRow): Promise<void> {
  await conn.query(
    `INSERT INTO file_assets (
      asset_id, kind, institution_code, owner_ref, original_name, stored_path,
      mime, size_bytes, width, height, sha256, visibility, uploaded_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.assetId,
      row.kind,
      row.institutionCode,
      row.ownerRef,
      row.originalName,
      row.storedPath,
      row.mime,
      row.sizeBytes,
      row.width,
      row.height,
      row.sha256,
      row.visibility,
      row.uploadedBy,
    ],
  );
}

export async function insertFileAsset(row: FileAssetRow): Promise<void> {
  await pool.query(
    `INSERT INTO file_assets (
      asset_id, kind, institution_code, owner_ref, original_name, stored_path,
      mime, size_bytes, width, height, sha256, visibility, uploaded_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.assetId,
      row.kind,
      row.institutionCode,
      row.ownerRef,
      row.originalName,
      row.storedPath,
      row.mime,
      row.sizeBytes,
      row.width,
      row.height,
      row.sha256,
      row.visibility,
      row.uploadedBy,
    ],
  );
}

export async function getFileAsset(assetId: string): Promise<RowDataPacket | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM file_assets WHERE asset_id = ?",
    [assetId],
  );
  return rows[0] ?? null;
}

export async function deleteFileAsset(assetId: string): Promise<void> {
  await pool.query("DELETE FROM file_assets WHERE asset_id = ?", [assetId]);
}

export async function getInstrumentDocByIndicator(indicatorId: string): Promise<RowDataPacket | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM instrument_docs WHERE indicator_id = ?",
    [indicatorId],
  );
  return rows[0] ?? null;
}

// Finalisasi staging: isi `owner_ref` saat submit (recheck di domain pemanggil).
export async function setFileAssetOwner(
  conn: Tx,
  assetId: string,
  ownerRef: string,
): Promise<void> {
  await conn.query("UPDATE file_assets SET owner_ref = ? WHERE asset_id = ?", [ownerRef, assetId]);
}

// Baris staging (bukti tanpa owner_ref) yang lebih tua dari batas waktu.
export async function listStagingOrphans(
  olderThanHours: number,
): Promise<{ assetId: string; storedPath: string }[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT asset_id, stored_path FROM file_assets " +
      "WHERE owner_ref IS NULL AND kind LIKE '%evidence' " +
      "AND created_at < (NOW(3) - INTERVAL ? HOUR)",
    [olderThanHours],
  );
  return rows.map((row) => ({
    assetId: String(row.asset_id),
    storedPath: String(row.stored_path),
  }));
}
