// Uji unit storage lokal (murni, tanpa DB).
import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearStorageDir } from "../src/storage";

describe("clearStorageDir", () => {
  test("mengosongkan isi tanpa menghapus direktorinya", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ishas-storage-"));
    await mkdir(join(dir, "evidences", "sam"), { recursive: true });
    await writeFile(join(dir, "evidences", "sam", "x.png"), "data");
    await writeFile(join(dir, "top.txt"), "data");
    await clearStorageDir(dir);
    expect(await readdir(dir)).toEqual([]);
  });

  test("direktori tidak ada → diam (bukan error)", async () => {
    const dir = join(tmpdir(), `ishas-tidak-ada-${Date.now()}`);
    await clearStorageDir(dir);
  });
});
