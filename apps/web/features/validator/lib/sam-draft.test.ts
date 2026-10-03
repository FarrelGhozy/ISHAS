// Test penunjuk draft SAM-iSAFE per Validator: ingat/baca/lupakan.

import { describe, expect, test } from "bun:test";
import { bacaSamDraftId, ingatSamDraft, lupakanSamDraft } from "./sam-draft";

const mem = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => void mem.set(key, value),
    removeItem: (key: string) => void mem.delete(key),
  },
});

describe("penunjuk draft SAM", () => {
  test("ingat → baca → lupakan per pengguna", () => {
    mem.clear();
    expect(bacaSamDraftId("USR-002")).toBeNull();
    ingatSamDraft("USR-002", "SAM-0005");
    expect(bacaSamDraftId("USR-002")).toBe("SAM-0005");
    expect(bacaSamDraftId("USR-003")).toBeNull();
    lupakanSamDraft("USR-002");
    expect(bacaSamDraftId("USR-002")).toBeNull();
  });

  test("tanpa id pengguna tidak menyimpan", () => {
    mem.clear();
    ingatSamDraft(undefined, "SAM-0001");
    expect(bacaSamDraftId(undefined)).toBeNull();
  });
});
