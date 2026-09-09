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
]) test(`state ${name} pulih ke seed utuh`, () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem(key: string) { expect(key).toBe(MOCK_STORAGE_KEY); return raw; },
  } });
  expect(loadState()).toEqual(SEED);
});
