// Test validasi murni form lapor-cepat (V2-03) — pesan persis WIREFRAMES §2 / FLOWS §2.

import { describe, expect, test } from "bun:test";
import { isLaporValid, validateLapor, type LaporValues } from "./lapor-validation";

const BASE: LaporValues = {
  reporterName: "Santri Blok B",
  institutionCode: "PSN-0018",
  areaId: "AREA-001",
  manualLocation: "",
  title: "Kabel terbuka di koridor lantai 2",
  description: "Kabel listrik menggantung di koridor lantai 2 asrama sejak kemarin.",
  evidenceName: "",
  contact: "",
};

const CTX = {
  registeredCodes: ["PSN-0018", "PSN-0019"],
  areaIdsOfSelected: ["AREA-001", "AREA-002"],
  selectedHasNoAreas: false,
};

describe("validateLapor", () => {
  test("nilai sah → tanpa error", () => {
    expect(validateLapor(BASE, CTX)).toEqual({});
    expect(isLaporValid(validateLapor(BASE, CTX))).toBe(true);
  });

  test("nama pendek → pesan persis dokumen", () => {
    const errors = validateLapor({ ...BASE, reporterName: "A" }, CTX);
    expect(errors.reporterName).toBe("Nama minimal 2 karakter.");
  });

  test("pesantren tak terdaftar → pesan persis dokumen", () => {
    const errors = validateLapor({ ...BASE, institutionCode: "PSN-9999" }, CTX);
    expect(errors.institutionCode).toBe("Pilih pesantren terdaftar.");
  });

  test("pesantren tanpa area → pelapor wajib menulis lokasi", () => {
    const errors = validateLapor({ ...BASE, areaId: "" }, { ...CTX, selectedHasNoAreas: true });
    expect(errors.areaId).toBe("Tulis lokasi karena daftar area belum tersedia.");
  });

  test("area milik pesantren lain → ditolak", () => {
    const errors = validateLapor({ ...BASE, areaId: "AREA-005" }, CTX);
    expect(errors.areaId).toBe("Lokasi/area tidak sah untuk pesantren ini.");
  });

  test("judul pendek + deskripsi pendek + kontak panjang", () => {
    const errors = validateLapor(
      { ...BASE, title: "Rusak", description: "Terlalu pendek", contact: "x".repeat(101) },
      CTX,
    );
    expect(errors.title).toBe("Judul minimal 10 karakter.");
    expect(errors.description).toBe("Deskripsi minimal 20 karakter.");
    expect(errors.contact).toBe("Kontak maksimal 100 karakter.");
  });
});
