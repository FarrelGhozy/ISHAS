// Uji helper kompresi gambar bukti (D-33): matematika skala + jalan aman
// di lingkungan tanpa canvas (SSR/uji bun).

import { describe, expect, test } from "bun:test";
import {
  compressImageFile,
  IMAGE_MAX_DIMENSION,
  scaleDimensions,
  shouldCompress,
} from "./image-compress";

describe("scaleDimensions", () => {
  test("gambar kecil tidak diperbesar", () => {
    expect(scaleDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  test("sisi terpanjang dibatasi, rasio dipertahankan (landscape)", () => {
    expect(scaleDimensions(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });

  test("portrait memakai sisi tinggi sebagai acuan", () => {
    expect(scaleDimensions(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  test("dimensi tak sah → 0 (tidak dibagi nol)", () => {
    expect(scaleDimensions(0, 100)).toEqual({ width: 0, height: 0 });
    expect(scaleDimensions(100, -1)).toEqual({ width: 0, height: 0 });
  });

  test("batas kustom dipatuhi", () => {
    expect(scaleDimensions(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
    expect(IMAGE_MAX_DIMENSION).toBe(1600);
  });
});

describe("shouldCompress", () => {
  test("kompres bila byte besar walau dimensi kecil", () => {
    expect(shouldCompress(1_500_000, 640, 480)).toBe(true);
  });

  test("kompres bila dimensi melebihi batas walau byte kecil", () => {
    expect(shouldCompress(100_000, 3000, 2000)).toBe(true);
  });

  test("gambar kecil dan pendek dilewati", () => {
    expect(shouldCompress(120_000, 800, 600)).toBe(false);
  });
});

describe("compressImageFile", () => {
  test("berkas non-gambar dilewatkan apa adanya", async () => {
    const file = new File(["halo"], "catatan.txt", { type: "text/plain" });
    expect(await compressImageFile(file)).toBe(file);
  });

  test("tanpa canvas (SSR/uji) berkas gambar dikembalikan utuh", async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([bytes], "foto.png", { type: "image/png" });
    const hasil = await compressImageFile(file);
    expect(hasil).toBe(file);
  });
});
