// Storage file lokal (disk) — Fase 1–5. Blob ditulis dulu ke `tmp-uploads/`
// lalu di-rename atomik ke path final; path tidak pernah diekspos ke respons API.
// Penyajian kanonik hanya lewat `GET /api/files/:assetId` (routes/index.ts).

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export const STORAGE_DIR = process.env.STORAGE_DIR
  ? resolve(process.env.STORAGE_DIR)
  : join(process.cwd(), "storage");

export const TMP_DIR = join(STORAGE_DIR, "tmp-uploads");

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

// Simpan blob ke disk: tulis di `tmp-uploads/` lalu rename atomik ke path final.
// Nama file memakai UUID, bukan nama asli pengunggah (BACKEND_STORAGE §2).
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
  await mkdir(TMP_DIR, { recursive: true });
  await mkdir(folder, { recursive: true });
  const tmpPath = join(TMP_DIR, `${randomUUID()}.${ext}`);
  await writeFile(tmpPath, bytes);
  const storedPath = join(
    SUBDIR[kind] ?? "misc",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${ext}`,
  );
  const absolutePath = join(STORAGE_DIR, storedPath);
  await rename(tmpPath, absolutePath);
  return { storedPath, absolutePath };
}

export async function readStoredBlob(storedPath: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(join(STORAGE_DIR, storedPath)));
}

export async function removeStoredBlob(storedPath: string): Promise<void> {
  await rm(join(STORAGE_DIR, storedPath), { force: true });
}

// Hapus seluruh isi storage (reset demo). Direktori dibuat ulang saat dibutuhkan
// `saveStoredBlob`, jadi tidak perlu dibuat di sini.
export async function clearStorageDir(): Promise<void> {
  await rm(STORAGE_DIR, { recursive: true, force: true });
}

// File staging di `tmp-uploads/` yang lebih tua dari batas (job yatim malam).
export async function listStaleTmpFiles(olderThanHours: number): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(TMP_DIR);
  } catch {
    return [];
  }
  const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000;
  const stale: string[] = [];
  for (const name of names) {
    const full = join(TMP_DIR, name);
    try {
      const info = await stat(full);
      if (info.isFile() && info.mtimeMs < cutoff) stale.push(full);
    } catch {
      // file hilang di tengah proses → abaikan
    }
  }
  return stale;
}

export async function removeAbsoluteFile(absolutePath: string): Promise<void> {
  await rm(absolutePath, { force: true });
}
