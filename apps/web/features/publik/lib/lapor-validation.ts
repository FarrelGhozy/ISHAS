// Validasi murni form lapor-cepat — FLOWS §2 + WIREFRAMES §2 + D-19 + D-47.
// Dipakai halaman `/lapor` untuk error inline; store mengulang pemeriksaan yang sama
// di sisi data (bukan pengganti). Pesan error memakai kalimat persis dokumen.

import type { LocationSnapshot } from "~/mocks/types";

export type LaporValues = {
  locationSnapshot?: LocationSnapshot;
  reporterName: string;
  institutionCode: string;
  areaId: string;
  manualLocation: string;
  categoryId: string; // D-19: KAT-* opsional ("" = tidak memilih)
  aspectId: string; // D-19: ASP-* opsional, harus milik categoryId
  reporterSeverity: string; // D-19: usulan mandiri opsional ("Belum ditentukan" = kosong)
  reporterPriority: string; // D-19: usulan mandiri opsional ("Belum ditentukan" = kosong)
  reporterRecommendation: string; // D-29: usulan rekomendasi tindakan (opsional; bila diisi min 10, maks 500)
  description: string; // D-47: deskripsi temuan opsional (boleh kosong, tanpa min)
  evidenceName: string;
  evidenceAssetId?: string;
  contact: string;
};

export const EMPTY_LAPOR_VALUES: LaporValues = {
  reporterName: "",
  institutionCode: "",
  areaId: "",
  manualLocation: "",
  categoryId: "",
  aspectId: "",
  reporterSeverity: "Belum ditentukan",
  reporterPriority: "Belum ditentukan",
  reporterRecommendation: "",
  description: "",
  evidenceName: "",
  contact: "",
};

export type LaporErrors = Partial<Record<keyof LaporValues, string>>;

export function validateLapor(
  values: LaporValues,
  context: {
    registeredCodes: string[];
    areaIdsOfSelected: string[];
    selectedHasNoAreas: boolean;
    categoryIds?: string[];
    aspectIdsOfCategory?: string[];
  },
): LaporErrors {
  const errors: LaporErrors = {};
  const nama = values.reporterName.trim();
  if (nama.length < 2) errors.reporterName = "Nama minimal 2 karakter.";
  else if (nama.length > 100) errors.reporterName = "Nama maksimal 100 karakter.";

  if (!values.institutionCode || !context.registeredCodes.includes(values.institutionCode)) {
    errors.institutionCode = "Pilih institusi terdaftar.";
  }

  if (!errors.institutionCode) {
    if (!values.areaId && values.manualLocation.trim().length < 3) {
      errors.areaId = context.selectedHasNoAreas
        ? "Tulis lokasi karena daftar area belum tersedia."
        : "Pilih area atau tulis lokasi secara manual.";
    } else if (values.areaId && !context.areaIdsOfSelected.includes(values.areaId)) {
      errors.areaId = "Lokasi/area tidak sah untuk institusi ini.";
    }
  }

  // D-47: tanpa judul (otomatis dari deskripsi); deskripsi temuan opsional.
  if (values.contact.trim().length > 100) {
    errors.contact = "Kontak maksimal 100 karakter.";
  }

  // D-19: cascading opsional kategori → aspek; usulan mandiri opsional dengan
  // nilai tetap; konsistensi penuh dicek di store.
  if (values.aspectId && !values.categoryId) {
    errors.aspectId = "Pilih kategori terlebih dahulu.";
  } else if (
    values.categoryId &&
    context.categoryIds &&
    !context.categoryIds.includes(values.categoryId)
  ) {
    errors.categoryId = "Kategori tidak dikenal.";
  } else if (
    values.aspectId &&
    context.aspectIdsOfCategory &&
    !context.aspectIdsOfCategory.includes(values.aspectId)
  ) {
    errors.aspectId = "Aspek tidak termasuk kategori ini.";
  }
  const levels = ["Belum ditentukan", "Tinggi", "Sedang", "Rendah"];
  if (!levels.includes(values.reporterSeverity)) {
    errors.reporterSeverity = "Usulan tingkat keparahan tidak dikenal.";
  }
  if (!levels.includes(values.reporterPriority)) {
    errors.reporterPriority = "Usulan prioritas perbaikan tidak dikenal.";
  }
  // D-29: usulan rekomendasi opsional; bila diisi min 10, maks 500.
  const usulanRekomendasi = values.reporterRecommendation.trim();
  if (usulanRekomendasi && usulanRekomendasi.length < 10) {
    errors.reporterRecommendation = "Usulan rekomendasi minimal 10 karakter.";
  } else if (usulanRekomendasi.length > 500) {
    errors.reporterRecommendation = "Usulan rekomendasi maksimal 500 karakter.";
  }

  return errors;
}

export function isLaporValid(errors: LaporErrors): boolean {
  return Object.keys(errors).length === 0;
}
