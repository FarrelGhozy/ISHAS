import { beforeEach, describe, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";
import { selectRegisteredInstitutions } from "./selectors";

describe("administrasi Super Admin", () => {
  beforeEach(() => storeActions.resetMockData());

  test("pengguna baru divalidasi dan admin aktif terakhir dilindungi", () => {
    const invalid = storeActions.addUser({
      id: "USR-099",
      name: "A",
      email: "salah",
      initials: "A",
      role: "Pesantren",
      roleId: "pesantren",
      institution: "",
      institutionCodes: [],
      status: "Aktif",
      lastActive: new Date().toISOString(),
    });
    expect(invalid.ok).toBe(false);
    expect(storeActions.setUserStatus("USR-001", "Nonaktif")).toEqual({
      ok: false,
      error: "Minimal satu Super Admin harus tetap aktif.",
    });
  });

  test("alur flow: Persiapan → Aktif dulu, akun Pesantren menyusul, baru terdaftar", () => {
    // Tambah pesantren baru sesuai FLOWS §1 (nama + kota + alamat + penanggung jawab).
    expect(
      storeActions.addInstitution({
        code: "PSN-0022",
        name: "PP Uji Aman",
        location: "Kota Batu",
        address: "Jl. Uji Aman No. 10, Kota Batu",
        manager: "Ust. Uji Aman",
        assessment: "Belum dimulai",
        status: "Persiapan",
      }).ok,
    ).toBe(true);
    expect(getState().counters.institution).toBe(24); // seed 23 (termasuk PSN-0023) + 1
    // Validasi form: nama duplikat, alamat pendek, dan penanggung jawab kosong ditolak.
    expect(
      storeActions.addInstitution({
        code: "PSN-0023",
        name: "PP Uji Aman",
        location: "Kota Batu",
        address: "Jl. Uji Aman No. 11, Kota Batu",
        manager: "Ust. Uji Dua",
        assessment: "Belum dimulai",
        status: "Persiapan",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.addInstitution({
        code: "PSN-0023",
        name: "PP Uji Baru",
        location: "Kota Batu",
        address: "Pendek",
        manager: "Ust. Uji Baru",
        assessment: "Belum dimulai",
        status: "Persiapan",
      }).ok,
    ).toBe(false);
    // Aktivasi boleh tanpa akun dulu (mengikuti FLOWS §1); belum terdaftar.
    expect(storeActions.setInstitutionStatus("PSN-0022", "Aktif").ok).toBe(true);
    expect(
      selectRegisteredInstitutions(getState()).some((x) => x.code === "PSN-0022"),
    ).toBe(false);
    // Akun Pesantren wajib memilih pesantren Aktif; dibuat sebagai Menunggu.
    expect(
      storeActions.addUser({
        id: "USR-099",
        name: "Pengelola Uji",
        email: "uji@ishas.demo",
        initials: "PU",
        role: "Pesantren",
        roleId: "pesantren",
        institution: "PP Uji Aman",
        institutionCodes: ["PSN-0022"],
        status: "Menunggu",
        lastActive: new Date().toISOString(),
      }).ok,
    ).toBe(true);
    // Menunggu belum membuat terdaftar; setelah diaktifkan baru terdaftar.
    expect(
      selectRegisteredInstitutions(getState()).some((x) => x.code === "PSN-0022"),
    ).toBe(false);
    expect(storeActions.setUserStatus("USR-099", "Aktif").ok).toBe(true);
    expect(
      selectRegisteredInstitutions(getState()).some((x) => x.code === "PSN-0022"),
    ).toBe(true);
    // Nonaktifkan akun terakhir → hilang lagi dari terdaftar (D-08).
    expect(storeActions.setUserStatus("USR-099", "Nonaktif").ok).toBe(true);
    expect(
      selectRegisteredInstitutions(getState()).some((x) => x.code === "PSN-0022"),
    ).toBe(false);
  });
});

describe("kelola akun Super Admin: ubah, hapus, reset sandi", () => {
  beforeEach(() => storeActions.resetMockData());

  test("ubah nama/email/scope divalidasi; email duplikat dan pesantren nonaktif ditolak", () => {
    expect(
      storeActions.updateUser("USR-003", {
        name: "U",
        email: "pesantren@ishas.demo",
        institutionCode: "PSN-0018",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateUser("USR-003", {
        name: "Pengelola Baru",
        email: "pesantren2@ishas.demo",
        institutionCode: "PSN-0018",
      }),
    ).toEqual({ ok: false, error: "Email sudah digunakan pada data demo." });
    // PSN-0021 masih Persiapan → pindah scope ditolak.
    expect(
      storeActions.updateUser("USR-003", {
        name: "Pengelola Baru",
        email: "baru@ishas.demo",
        institutionCode: "PSN-0021",
      }).ok,
    ).toBe(false);
    expect(
      storeActions.updateUser("USR-003", {
        name: "Pengelola Baru",
        email: "baru@ishas.demo",
        institutionCode: "PSN-0019",
      }).ok,
    ).toBe(true);
    const updated = getState().users.find((u) => u.id === "USR-003")!;
    expect(updated.name).toBe("Pengelola Baru");
    expect(updated.institutionCodes).toEqual(["PSN-0019"]);
  });

  test("hapus dilindungi untuk admin terakhir dan akun demo tunggal; reset sandi teraudit", () => {
    expect(storeActions.deleteUser("USR-001")).toEqual({
      ok: false,
      error: "Super Admin terakhir tidak dapat dihapus.",
    });
    expect(storeActions.deleteUser("USR-999").ok).toBe(false);
    // USR-005 validator kedua (bukan kartu login) boleh dihapus.
    expect(storeActions.deleteUser("USR-005").ok).toBe(true);
    expect(getState().users.some((u) => u.id === "USR-005")).toBe(false);
    const auditsBefore = getState().auditEvents.length;
    expect(storeActions.resetUserPassword("USR-003").ok).toBe(true);
    expect(getState().auditEvents.length).toBe(auditsBefore + 1);
    expect(getState().auditEvents[0].action).toBe("Mereset kata sandi");
  });
});

describe("versioning instrumen Validator", () => {
  beforeEach(() => storeActions.resetMockData());

  test("draft baru dapat dipublikasikan dan versi aktif lama diarsipkan", () => {
    const created = storeActions.createInstrumentDraft();
    expect(created.ok).toBe(true);
    const id = created.ok ? created.id! : "";
    expect(storeActions.publishInstrument(id).ok).toBe(true);
    expect(getState().activeInstrumentVersionId).toBe(id);
    expect(getState().instrumentVersions.find((item) => item.id === "INS-v1.0")?.status).toBe(
      "Archived",
    );
    expect(storeActions.publishInstrument(id).ok).toBe(false);
  });
});
