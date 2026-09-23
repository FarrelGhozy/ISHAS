// Validasi murni form lapor-cepat — FLOWS §2 + WIREFRAMES §2.
// Dipakai halaman `/lapor` untuk error inline; store mengulang pemeriksaan yang sama
// di sisi data (bukan pengganti). Pesan error memakai kalimat persis dokumen.

import type { LocationSnapshot } from "~/mocks/types";

export type LaporValues = {
  locationSnapshot?: LocationSnapshot;
  reporterName: string;
  institutionCode: string;
  areaId: string;
  manualLocation: string;
  categoryId: string; // D-15: KAT-* opsional ("" = tidak memilih)
  aspectId: string; // D-15: ASP-* opsional, harus milik categoryId
  indicatorId: string; // D-15: IND-* opsional, harus milik aspectId
  title: string;
  description: string;
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
  indicatorId: "",
  title: "",
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
    indicatorIdsOfAspect?: string[];
  },
): LaporErrors {
  const errors: LaporErrors = {};
  const nama = values.reporterName.trim();
  if (nama.length < 2) errors.reporterName = "Nama minimal 2 karakter.";
  else if (nama.length > 100) errors.reporterName = "Nama maksimal 100 karakter.";

  if (!values.institutionCode || !context.registeredCodes.includes(values.institutionCode)) {
    errors.institutionCode = "Pilih pesantren terdaftar.";
  }

  if (!errors.institutionCode) {
    if (!values.areaId && values.manualLocation.trim().length < 3) {
      errors.areaId = context.selectedHasNoAreas
        ? "Tulis lokasi karena daftar area belum tersedia."
        : "Pilih area atau tulis lokasi secara manual.";
    } else if (values.areaId && !context.areaIdsOfSelected.includes(values.areaId)) {
      errors.areaId = "Lokasi/area tidak sah untuk pesantren ini.";
    }
  }

  const judul = values.title.trim();
  if (judul.length < 10) errors.title = "Judul minimal 10 karakter.";
  else if (judul.length > 140) errors.title = "Judul maksimal 140 karakter.";

  if (values.description.trim().length < 20) {
    errors.description = "Deskripsi minimal 20 karakter.";
  }

  if (values.contact.trim().length > 100) {
    errors.contact = "Kontak maksimal 100 karakter.";
  }

  // D-15 cascading opsional: aspek butuh kategori; indikator butuh aspek; semua
  // harus konsisten dengan opsi yang tersedia (konsistensi penuh dicek di store).
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
  if (values.indicatorId && !values.aspectId) {
    errors.indicatorId = "Pilih aspek terlebih dahulu.";
  } else if (
    values.indicatorId &&
    context.indicatorIdsOfAspect &&
    !context.indicatorIdsOfAspect.includes(values.indicatorId)
  ) {
    errors.indicatorId = "Indikator tidak termasuk aspek ini.";
  }

  return errors;
}

export function isLaporValid(errors: LaporErrors): boolean {
  return Object.keys(errors).length === 0;
}
