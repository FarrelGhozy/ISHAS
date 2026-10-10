// Pemuat seed demo lokal: file `demo.local.ts` (salinan privat, TIDAK ikut
// commit — lihat .gitignore). Dipakai mode CLI `--mode=demo-local` dan Reset
// data demo saat `SEED_LOCAL_ENABLED=true`. Bila file tidak ada, pemanggil
// kembali ke seed demo bawaan sehingga test tetap deterministik.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { seedDemo } from "./demo";
import { seedLocalEnabled } from "../config";

export type LocalSeedModule = {
  seedLocalDemo: () => Promise<void>;
};

const localSeedUrl = new URL("./demo.local.ts", import.meta.url);

export function localSeedFilePath(): string {
  return fileURLToPath(localSeedUrl);
}

export async function loadLocalSeed(): Promise<LocalSeedModule | null> {
  if (!existsSync(localSeedUrl)) return null;
  const loaded = (await import(localSeedUrl.href)) as Partial<LocalSeedModule>;
  return typeof loaded.seedLocalDemo === "function" ? (loaded as LocalSeedModule) : null;
}

// Seed pilihan komputer ini: pakai seed lokal bila diaktifkan lewat `.env`;
// selain itu seed demo bawaan (dipakai test dan mesin lain).
export async function seedDemoPreferLocal(): Promise<void> {
  if (seedLocalEnabled()) {
    const local = await loadLocalSeed();
    if (local) {
      await local.seedLocalDemo();
      return;
    }
    console.warn(
      `[seed] SEED_LOCAL_ENABLED=true tetapi ${localSeedFilePath()} tidak ditemukan; memakai seed bawaan.`,
    );
  }
  await seedDemo();
}
