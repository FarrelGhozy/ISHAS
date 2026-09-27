// Test helper slider progres (D-20) — fungsi murni tanpa DOM.

import { describe, expect, test } from "bun:test";
import { PROGRESS_POINTS, progressLabel, snapProgress } from "./progress-slider";

describe("snapProgress", () => {
  test("titik snap dipertahankan", () => {
    for (const point of PROGRESS_POINTS) expect(snapProgress(point)).toBe(point);
  });

  test("nilai lama dibulatkan ke titik terdekat", () => {
    expect(snapProgress(10)).toBe(0);
    expect(snapProgress(15)).toBe(25);
    expect(snapProgress(20)).toBe(25);
    expect(snapProgress(30)).toBe(25);
    expect(snapProgress(40)).toBe(50);
  });

  test("batas dijaga; non-angka menjadi 0", () => {
    expect(snapProgress(-5)).toBe(0);
    expect(snapProgress(140)).toBe(100);
    expect(snapProgress(Number.NaN)).toBe(0);
  });
});

describe("progressLabel", () => {
  test("lima label tahap persis dokumen", () => {
    expect(progressLabel(0)).toBe("Belum mulai");
    expect(progressLabel(25)).toBe("Dimulai");
    expect(progressLabel(50)).toBe("Setengah jalan");
    expect(progressLabel(75)).toBe("Hampir selesai");
    expect(progressLabel(100)).toBe("Selesai");
  });
});
