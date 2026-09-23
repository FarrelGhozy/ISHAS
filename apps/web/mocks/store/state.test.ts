import { afterEach, expect, test } from "bun:test";
import { loadState, MOCK_STORAGE_KEY } from "./state";
import { SEED } from "../seed/seed";
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

for (const [name, raw] of [
  ["JSON rusak", "{"],
  ["schema lama", JSON.stringify({ ...SEED, schemaVersion: 3 })],
  ["schema v4 tidak lengkap", JSON.stringify({ schemaVersion: 4, reports: [] })],
  ["dimensi instrumen rusak", JSON.stringify({ ...SEED, instrumentVersions: [{ id: "rusak" }] })],
])
  test(`state ${name} pulih ke seed utuh`, () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem(key: string) {
          expect(key).toBe(MOCK_STORAGE_KEY);
          return raw;
        },
      },
    });
    expect(loadState()).toEqual(SEED);
  });

test("state entri instrumen null tidak melempar dan pulih ke seed", () => {
  const bad = structuredClone(SEED) as unknown as Record<string, unknown>;
  bad["instrumentVersions"] = [{ id: "rusak", dimensions: [null] }];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(bad);
      },
    },
  });
  expect(loadState()).toEqual(SEED);
});

test("state v6 tanpa instrumentDocs dimigrasi ke v7 berisi seed docs", () => {
  const v6 = structuredClone(SEED) as unknown as Record<string, unknown>;
  delete v6["instrumentDocs"];
  v6["schemaVersion"] = 6;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v6);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(7);
  expect(loaded.instrumentDocs).toEqual(SEED.instrumentDocs);
});

test("state v5 valid dimigrasi ke v7 tanpa kehilangan record", () => {
  const v5 = JSON.stringify({ ...structuredClone(SEED), schemaVersion: 5 });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return v5;
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(7);
  expect(loaded.reports.length).toBe(SEED.reports.length);
});
