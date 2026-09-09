import { beforeEach, describe, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";

describe("administrasi Super Admin", () => {
  beforeEach(() => storeActions.resetMockData());

  test("pengguna baru divalidasi dan admin aktif terakhir dilindungi", () => {
    const invalid = storeActions.addUser({ id: "USR-099", name: "A", email: "salah", initials: "A", role: "Pengelola Pesantren", roleId: "pengelola", institution: "", institutionCodes: [], status: "Aktif", lastActive: new Date().toISOString() });
    expect(invalid.ok).toBe(false);
    expect(storeActions.setUserStatus("USR-001", "Nonaktif")).toEqual({ ok: false, error: "Minimal satu Super Admin harus tetap aktif." });
  });

  test("pesantren baru unik, menaikkan counter, dan aktivasi memerlukan pengelola", () => {
    expect(storeActions.addInstitution({ code: "PSN-0022", name: "PP Uji Aman", location: "Kota Batu", manager: "Belum ditetapkan", assessment: "Belum dimulai", status: "Persiapan" }).ok).toBe(true);
    expect(getState().counters.institution).toBe(23);
    expect(storeActions.setInstitutionStatus("PSN-0022", "Aktif")).toEqual({ ok: false, error: "Tetapkan minimal satu pengelola aktif sebelum aktivasi." });
  });
});

describe("versioning instrumen Peneliti", () => {
  beforeEach(() => storeActions.resetMockData());

  test("draft baru dapat dipublikasikan dan versi aktif lama diarsipkan", () => {
    const created = storeActions.createInstrumentDraft();
    expect(created.ok).toBe(true);
    const id = created.ok ? created.id! : "";
    expect(storeActions.publishInstrument(id).ok).toBe(true);
    expect(getState().activeInstrumentVersionId).toBe(id);
    expect(getState().instrumentVersions.find((item) => item.id === "INS-v1.0")?.status).toBe("Archived");
    expect(storeActions.publishInstrument(id).ok).toBe(false);
  });
});
