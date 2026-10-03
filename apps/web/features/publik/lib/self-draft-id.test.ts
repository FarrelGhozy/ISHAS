// Test identitas draft per perangkat (mode backend): id berbeda antar pesantren
// dan stabil untuk pesantren yang sama, agar dua penilai tidak saling menimpa.

import { describe, expect, test } from "bun:test";
import { deviceDraftId, lupakanDeviceDraft } from "./self-draft-id";

const mem = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => void mem.set(key, value),
    removeItem: (key: string) => void mem.delete(key),
  },
});

describe("deviceDraftId", () => {
  test("stabil untuk pesantren yang sama, berbeda antar pesantren", () => {
    mem.clear();
    const a1 = deviceDraftId("PSN-0018");
    const a2 = deviceDraftId("PSN-0018");
    const b = deviceDraftId("PSN-0019");
    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
    expect(a1.startsWith("SELF-")).toBe(true);
    expect(a1.length).toBeLessThanOrEqual(24);
  });

  test("kode kosong memakai id cadangan; lupakan membuat id baru", () => {
    mem.clear();
    expect(deviceDraftId("")).toBe("SELF-baru");
    const sebelum = deviceDraftId("PSN-0018");
    lupakanDeviceDraft("PSN-0018");
    expect(deviceDraftId("PSN-0018")).not.toBe(sebelum);
  });
});
