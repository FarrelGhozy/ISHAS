// Isolasi storage test: suite integrasi memakai `sweep` yang menghapus blob
// yatim. Tanpa isolasi, blob demo `apps/api/storage` ikut terhapus. Arahkan
// STORAGE_DIR ke direktori sementara bila pemanggil belum menetapkannya.

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

if (!process.env.STORAGE_DIR) {
  process.env.STORAGE_DIR = mkdtempSync(join(tmpdir(), "ishas-test-storage-"));
}
