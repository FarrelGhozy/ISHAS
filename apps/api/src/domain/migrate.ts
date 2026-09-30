// Migrasi satu kali aset IndexedDB perangkat → storage server
// (BACKEND_STORAGE.md §6). Dikunci flag `indexeddb_migrated` di `app_settings`.

import type { InstrumentDoc, InstrumentDocVisibility } from "../../../web/mocks/types";
import { imageInfo } from "../image";
import { getSetting, setSetting } from "../repo/admin";
import { upsertInstrumentDocRow } from "../repo/docs";
import { insertFileAssetTx, type FileAssetRow } from "../repo/files";
import { withTransaction } from "../repo/writes";
import { saveStoredBlob, sha256Hex } from "../storage";

export const MIGRATION_FLAG = "indexeddb_migrated";

export type MigrateItem = {
  kind: string;
  assetId: string;
  institutionCode?: string;
  ownerRef?: string;
  indicatorId?: string;
  fileName: string;
  mime: string;
  base64: string;
  width?: number;
  height?: number;
  visibility?: InstrumentDocVisibility;
};

export type MigrateResult =
  | { ok: true; imported: number }
  | { ok: false; error: string; status?: number };

const IMAGE_KINDS = [
  "campus-plan",
  "report-evidence",
  "self-evidence",
  "sam-evidence",
  "completion-evidence",
];
const ALL_KINDS = [...IMAGE_KINDS, "instrument-doc"];
const PREFIX: Record<string, string> = {
  "campus-plan": "campus-asset-",
  "report-evidence": "evidence-asset-",
  "self-evidence": "evidence-asset-",
  "sam-evidence": "evidence-asset-",
  "completion-evidence": "evidence-asset-",
  "instrument-doc": "instrument-doc-",
};

function hasPdfHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function migrationStatus(): Promise<{ migrated: boolean; at: string | null }> {
  const value = await getSetting(MIGRATION_FLAG);
  return { migrated: Boolean(value), at: value };
}

export async function migrateAssets(
  actorUploadedBy: string,
  items: MigrateItem[],
): Promise<MigrateResult> {
  if (await getSetting(MIGRATION_FLAG)) {
    return { ok: false, error: "Migrasi aset hanya dapat dijalankan sekali.", status: 409 };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Tidak ada aset untuk dimigrasikan." };
  }
  for (const item of items) {
    if (!ALL_KINDS.includes(item.kind)) {
      return { ok: false, error: `Jenis aset tidak dikenal: ${item.kind}.` };
    }
    if (!item.assetId.startsWith(PREFIX[item.kind])) {
      return { ok: false, error: `Aset ${item.assetId} tidak sesuai jenis ${item.kind}.` };
    }
    if (!item.fileName?.trim() || item.fileName.length > 200) {
      return { ok: false, error: "Nama file harus terisi dan maksimal 200 karakter." };
    }
    const maxBytes = item.kind === "instrument-doc" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const bytes = Buffer.from(item.base64 ?? "", "base64");
    if (bytes.length <= 0 || bytes.length > maxBytes) {
      return { ok: false, error: "Ukuran berkas melebihi batas." };
    }
    if (item.kind === "instrument-doc") {
      if (item.mime !== "application/pdf" || !hasPdfHeader(bytes)) {
        return { ok: false, error: "Berkas bukan PDF yang valid." };
      }
    } else {
      const info = imageInfo(bytes);
      if (!info) return { ok: false, error: "Berkas gambar tidak valid." };
      if (item.kind === "campus-plan" && Math.min(info.width, info.height) < 800) {
        return { ok: false, error: "Sisi pendek denah minimal 800 piksel." };
      }
      if (item.kind !== "campus-plan" && info.width * info.height > 20_000_000) {
        return { ok: false, error: "Resolusi gambar terlalu besar. Maksimal 20 megapiksel." };
      }
    }
  }

  let imported = 0;
  await withTransaction(async (conn) => {
    for (const item of items) {
      const bytes = new Uint8Array(Buffer.from(item.base64, "base64"));
      const info = item.kind === "instrument-doc" ? null : imageInfo(bytes);
      const { storedPath } = await saveStoredBlob(item.kind, item.mime, bytes);
      const row: FileAssetRow = {
        assetId: item.assetId,
        kind: item.kind,
        institutionCode: item.institutionCode ?? null,
        ownerRef: item.ownerRef ?? null,
        originalName: item.fileName.trim(),
        storedPath,
        mime: item.mime,
        sizeBytes: bytes.length,
        width: info?.width ?? item.width ?? null,
        height: info?.height ?? item.height ?? null,
        sha256: sha256Hex(bytes),
        visibility: item.kind === "instrument-doc" ? (item.visibility ?? "Privat") : "Privat",
        uploadedBy: actorUploadedBy,
      };
      await insertFileAssetTx(conn, row);
      if (item.kind === "instrument-doc" && item.indicatorId) {
        const doc: InstrumentDoc = {
          id: `DOC-${item.indicatorId}`,
          indicatorId: item.indicatorId,
          fileName: row.originalName,
          fileSize: bytes.length,
          mime: "application/pdf",
          assetId: item.assetId,
          visibility: row.visibility as InstrumentDocVisibility,
          updatedBy: actorUploadedBy,
          updatedAt: new Date().toISOString(),
        };
        await upsertInstrumentDocRow(conn, doc);
      }
      imported += 1;
    }
  });
  await setSetting(MIGRATION_FLAG, new Date().toISOString());
  return { ok: true, imported };
}
