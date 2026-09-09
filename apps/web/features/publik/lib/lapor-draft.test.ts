import { afterEach, beforeEach, expect, test } from "bun:test";
import { clearLaporDraft, loadLaporDraft, saveLaporDraft, EMPTY_LAPOR_VALUES } from "./lapor-draft";
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
beforeEach(() => {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem(key: string) { return entries.get(key) ?? null; },
    setItem(key: string, value: string) { entries.set(key, value); },
    removeItem(key: string) { entries.delete(key); },
  } });
});
afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});
test("draft tersimpan terpisah dan membatalkan A tidak menghapus B", () => {
  const a = { ...EMPTY_LAPOR_VALUES, institutionCode: "PSN-0018", title: "Draft A" };
  const b = { ...EMPTY_LAPOR_VALUES, institutionCode: "PSN-0019", title: "Draft B" };
  expect(saveLaporDraft(a.institutionCode, a)).toBe(true);
  expect(saveLaporDraft(b.institutionCode, b)).toBe(true);
  expect(loadLaporDraft(a.institutionCode)).toEqual(a);
  expect(clearLaporDraft(a.institutionCode)).toBe(true);
  expect(loadLaporDraft(a.institutionCode)).toBeNull();
  expect(loadLaporDraft(b.institutionCode)).toEqual(b);
});
test("kuota/izin penyimpanan gagal dilaporkan, bukan sukses diam-diam", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    setItem() { throw new Error("quota"); }, removeItem() { throw new Error("denied"); },
  } });
  expect(saveLaporDraft(null, EMPTY_LAPOR_VALUES)).toBe(false);
  expect(clearLaporDraft(null)).toBe(false);
});
