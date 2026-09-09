// Validasi murni form lapor-cepat — FLOWS §2 + WIREFRAMES §2.
// Dipakai halaman `/lapor` untuk error inline; store mengulang pemeriksaan yang sama
// di sisi data (bukan pengganti). Pesan error memakai kalimat persis dokumen.

export type LaporValues = {
  reporterName: string;
  institutionCode: string;
  areaId: string;
  manualLocation: string;
  title: string;
  description: string;
  evidenceName: string;
  contact: string;
};

export const EMPTY_LAPOR_VALUES: LaporValues = {
  reporterName: "",
  institutionCode: "",
  areaId: "",
  manualLocation: "",
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
      errors.areaId = context.selectedHasNoAreas ? "Tulis lokasi karena daftar area belum tersedia." : "Pilih area atau tulis lokasi secara manual.";
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

  return errors;
}

export function isLaporValid(errors: LaporErrors): boolean {
  return Object.keys(errors).length === 0;
}
