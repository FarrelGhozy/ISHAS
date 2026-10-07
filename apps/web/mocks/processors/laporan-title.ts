// Judul otomatis laporan lapor-cepat — D-47.
// Pelapor tidak mengisi judul; turunan deterministik dari deskripsi + lokasi.
// Dipakai mock-store dan backend (domain/lapor.ts) agar paritas.

const MAKS_JUDUL = 140;
const MAKS_KATA = 10;

export function rapikanTeks(teks: string): string {
  return teks.replace(/\s+/g, " ").trim();
}

function potongBatasKata(teks: string): string {
  if (teks.length <= MAKS_JUDUL) return teks;
  const potongan = teks.slice(0, MAKS_JUDUL);
  const spasi = potongan.lastIndexOf(" ");
  return (spasi > 0 ? potongan.slice(0, spasi) : potongan).trimEnd();
}

export function buatJudulLaporanOtomatis(
  description: string,
  konteks: { namaKategori?: string; labelLokasi?: string } = {},
): string {
  const bersih = rapikanTeks(description);
  if (bersih) {
    return potongBatasKata(bersih.split(" ").slice(0, MAKS_KATA).join(" "));
  }
  const lokasi = rapikanTeks(konteks.labelLokasi ?? "");
  const kategori = rapikanTeks(konteks.namaKategori ?? "");
  if (lokasi) {
    const judul = kategori ? `Temuan ${kategori} di ${lokasi}` : `Temuan di ${lokasi}`;
    return potongBatasKata(judul);
  }
  return "Temuan tanpa deskripsi";
}
