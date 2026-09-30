// Pemilihan pesantren awal dari tautan `?pesantren=`.
//
// Param URL adalah sumber kebenaran tautan (ROUTES §1). Pada muat dingin mode
// backend, daftar pesantren terdaftar belum termuat sehingga validitas
// "terdaftar" belum bisa dinilai; karena itu param dipakai apa adanya dan
// pesan "tidak sah" baru ditampilkan setelah daftar siap.

export function pilihInstitusiAwal(input: {
  param: string | null;
  kodeAkun?: string;
  ingatan?: string;
  registeredCodes: string[];
}): string {
  if (input.param) return input.param;
  if (input.kodeAkun) return input.kodeAkun;
  if (input.ingatan && input.registeredCodes.includes(input.ingatan)) return input.ingatan;
  return "";
}

// true hanya bila daftar terdaftar sudah termuat dan param tidak ada di dalamnya.
export function paramPesantrenTidakSah(
  param: string | null,
  registeredCodes: string[],
): boolean {
  return param !== null && registeredCodes.length > 0 && !registeredCodes.includes(param);
}
