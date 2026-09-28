// Storage file lokal (disk) — minimal untuk Fase 1: bukti lapor + jawaban mandiri.
// Rute penyajian kanonik ada di routes/files.ts; path tidak pernah diekspos langsung.

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export const STORAGE_DIR = process.env.STORAGE_DIR
  ? resolve(process.env.STORAGE_DIR)
  : join(process.cwd(), "storage");

const SUBDIR: Record<string, string> = {
  "report-evidence": "evidences/report",
  "self-evidence": "evidences/self",
  "sam-evidence": "evidences/sam",
  "completion-evidence": "evidences/completion",
  "campus-plan": "campus-plans",
  "instrument-doc": "instrument-docs",
};

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function extensionFor(mime: string): string | null {
  return EXT[mime] ?? null;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function newAssetId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

// Simpan blob ke disk dengan nama UUID; kembalikan path relatif untuk `file_assets`.
export async function saveStoredBlob(
  kind: string,
  mime: string,
  bytes: Uint8Array,
): Promise<{ storedPath: string; absolutePath: string }> {
  const ext = extensionFor(mime) ?? "bin";
  const now = new Date();
  const folder = join(
    STORAGE_DIR,
    SUBDIR[kind] ?? "misc",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
  );
  await mkdir(folder, { recursive: true });
  const storedPath = join(
    SUBDIR[kind] ?? "misc",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${ext}`,
  );
  const absolutePath = join(STORAGE_DIR, storedPath);
  await writeFile(absolutePath, bytes);
  return { storedPath, absolutePath };
}

export async function readStoredBlob(storedPath: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(join(STORAGE_DIR, storedPath)));
}

export async function removeStoredBlob(storedPath: string): Promise<void> {
  await rm(join(STORAGE_DIR, storedPath), { force: true });
  void dirname(storedPath);
}
