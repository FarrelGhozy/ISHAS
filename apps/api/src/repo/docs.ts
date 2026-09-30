// Penulisan pustaka dokumen indikator (Fase 3) + sinkron visibilitas file_assets.
// Metadata di `instrument_docs`; blob fisik di `file_assets` (storage lokal).

import type { InstrumentDoc } from "../../../web/mocks/types";
import type { Tx } from "./writes";

export async function upsertInstrumentDocRow(conn: Tx, doc: InstrumentDoc): Promise<void> {
  await conn.query(
    `INSERT INTO instrument_docs (
      id, indicator_id, indicator_code, indicator_title, category_id, aspect_id,
      is_manual, file_name, file_size, mime, asset_id, visibility, updated_by, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      indicator_code = VALUES(indicator_code),
      indicator_title = VALUES(indicator_title),
      category_id = VALUES(category_id),
      aspect_id = VALUES(aspect_id),
      is_manual = VALUES(is_manual),
      file_name = VALUES(file_name),
      file_size = VALUES(file_size),
      mime = VALUES(mime),
      asset_id = VALUES(asset_id),
      visibility = VALUES(visibility),
      updated_by = VALUES(updated_by),
      updated_at = VALUES(updated_at)`,
    [
      doc.id,
      doc.indicatorId,
      doc.indicatorCode ?? null,
      doc.indicatorTitle ?? null,
      doc.categoryId ?? null,
      doc.aspectId ?? null,
      Boolean(doc.manual),
      doc.fileName,
      doc.fileSize,
      doc.mime,
      doc.assetId,
      doc.visibility,
      doc.updatedBy,
      new Date(doc.updatedAt),
    ],
  );
}

export async function updateInstrumentDocVisibility(
  conn: Tx,
  indicatorId: string,
  visibility: string,
  updatedBy: string,
  updatedAt: Date,
): Promise<void> {
  await conn.query(
    "UPDATE instrument_docs SET visibility = ?, updated_by = ?, updated_at = ? WHERE indicator_id = ?",
    [visibility, updatedBy, updatedAt, indicatorId],
  );
}

export async function deleteInstrumentDocRow(conn: Tx, indicatorId: string): Promise<void> {
  await conn.query("DELETE FROM instrument_docs WHERE indicator_id = ?", [indicatorId]);
}

export async function updateFileAssetVisibility(
  conn: Tx,
  assetId: string,
  visibility: string,
): Promise<void> {
  await conn.query("UPDATE file_assets SET visibility = ? WHERE asset_id = ?", [visibility, assetId]);
}

export async function deleteFileAssetRow(conn: Tx, assetId: string): Promise<void> {
  await conn.query("DELETE FROM file_assets WHERE asset_id = ?", [assetId]);
}
