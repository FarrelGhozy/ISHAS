// Test helper cooldown anti-spam D-50 (murni, tanpa DOM).

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  COOLDOWN_LAPOR_MS,
  formatSisa,
  simpanCooldown,
  sisaCooldown,
} from "./anti-spam";

const KEY = "ishas-uji-cooldown";

// Pola stub sama seperti lapor-draft.test.ts (bun tanpa localStorage).
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
beforeEach(() => {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key: string) {
        return entries.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        entries.set(key, value);
      },
      removeItem(key: string) {
        entries.delete(key);
      },
    },
  });
});
afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

describe("sisaCooldown", () => {
  test("tanpa catatan → 0 (boleh kirim)", () => {
    localStorage.removeItem(KEY);
    expect(sisaCooldown(KEY, COOLDOWN_LAPOR_MS, 1_000)).toBe(0);
  });

  test("baru kirim → sisa 60 detik lalu meluruh", () => {
    simpanCooldown(KEY, 1_000);
    expect(sisaCooldown(KEY, COOLDOWN_LAPOR_MS, 1_000)).toBe(60);
    expect(sisaCooldown(KEY, COOLDOWN_LAPOR_MS, 31_000)).toBe(30);
    expect(sisaCooldown(KEY, COOLDOWN_LAPOR_MS, 61_000)).toBe(0);
  });

  test("nilai rusak → 0 (tidak mengunci selamanya)", () => {
    localStorage.setItem(KEY, "bukan-angka");
    expect(sisaCooldown(KEY, COOLDOWN_LAPOR_MS, 1_000)).toBe(0);
  });
});

describe("formatSisa", () => {
  test("detik → m:ss", () => {
    expect(formatSisa(60)).toBe("1:00");
    expect(formatSisa(42)).toBe("0:42");
    expect(formatSisa(5)).toBe("0:05");
    expect(formatSisa(-3)).toBe("0:00");
  });
});
