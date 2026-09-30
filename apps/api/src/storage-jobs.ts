// Job pembersihan storage (BACKEND_STORAGE.md §5) — pengganti guard assetEpoch
// mock. Menghapus baris staging tanpa owner_ref (>24 jam) + file tmp kedaluwarsa.

import { deleteFileAsset, listStagingOrphans } from "./repo/files";
import { listStaleTmpFiles, removeAbsoluteFile, removeStoredBlob } from "./storage";

export type SweepResult = { assets: number; tmpFiles: number; skippedSeed: number };

// `seed/...` adalah metadata aset contoh yang belum punya blob fisik; jangan dianggap yatim.
function isSeedPath(storedPath: string): boolean {
  return storedPath.startsWith("seed/") || storedPath.startsWith("seed-");
}

export async function sweepOrphans(options: { olderThanHours?: number } = {}): Promise<SweepResult> {
  const olderThanHours = options.olderThanHours ?? 24;
  const assets = await listStagingOrphans(olderThanHours);
  let removedAssets = 0;
  let skippedSeed = 0;
  for (const asset of assets) {
    if (isSeedPath(asset.storedPath)) {
      skippedSeed += 1;
      continue;
    }
    await removeStoredBlob(asset.storedPath).catch(() => undefined);
    await deleteFileAsset(asset.assetId);
    removedAssets += 1;
  }
  const staleTmp = await listStaleTmpFiles(olderThanHours);
  for (const absolutePath of staleTmp) {
    await removeAbsoluteFile(absolutePath).catch(() => undefined);
  }
  return { assets: removedAssets, tmpFiles: staleTmp.length, skippedSeed };
}
