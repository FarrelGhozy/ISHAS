// Test penunjuk draft inspeksi kantor per Validator (D-49.e).

import { describe, expect, test } from "bun:test";
import { bacaOfficeDraftId, ingatOfficeDraft, lupakanOfficeDraft } from "./office-draft";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  },
});

describe("penunjuk draft inspeksi kantor", () => {
  test("ingat lalu baca lalu lupakan", () => {
    expect(bacaOfficeDraftId("USR-002")).toBeNull();
    ingatOfficeDraft("USR-002", "KTR-0009");
    expect(bacaOfficeDraftId("USR-002")).toBe("KTR-0009");
    lupakanOfficeDraft("USR-002");
    expect(bacaOfficeDraftId("USR-002")).toBeNull();
  });

  test("antar Validator tidak saling menimpa", () => {
    ingatOfficeDraft("USR-002", "KTR-0009");
    ingatOfficeDraft("USR-005", "KTR-0010");
    expect(bacaOfficeDraftId("USR-002")).toBe("KTR-0009");
    expect(bacaOfficeDraftId("USR-005")).toBe("KTR-0010");
    lupakanOfficeDraft("USR-002");
    lupakanOfficeDraft("USR-005");
  });

  test("tanpa user mengembalikan null", () => {
    expect(bacaOfficeDraftId(undefined)).toBeNull();
  });
});
