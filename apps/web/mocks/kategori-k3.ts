// Single source of truth kategori/aspek K3 — turunan kode dari docs/KATEGORI_K3.md (D-15, D-44).
// Dilarang mendefinisikan ulang daftar kategori di komponen/processor/seed lain;
// impor dari sini. Ikon berupa nama komponen lucide-react yang sudah tersedia.

export type K3CategoryId =
  | "KAT-KESELAMATAN"
  | "KAT-DARURAT"
  | "KAT-KESEHATAN"
  | "KAT-LINGKUNGAN"
  | "KAT-PSIKOSOSIAL"
  | "KAT-AKSESIBILITAS";

export type K3Aspect = {
  id: string;
  categoryId: K3CategoryId;
  name: string;
};

export type K3Category = {
  id: K3CategoryId;
  name: string;
  description: string;
  /** Nama ikon lucide-react yang sudah dipakai proyek (tanpa lib baru). */
  icon: "ShieldCheck" | "Siren" | "HeartPulse" | "Leaf" | "Brain" | "Accessibility";
  coverage: string[];
  aspects: K3Aspect[];
};

export const K3_CATEGORIES: K3Category[] = [
  {
    id: "KAT-KESELAMATAN",
    name: "Keselamatan dan Keamanan Gedung & Asrama",
    description:
      "Aspek keselamatan fisik gedung/asrama, keamanan lingkungan, serta fasilitas khusus tempat kegiatan.",
    icon: "ShieldCheck",
    coverage: [
      "Kelaikan bangunan",
      "Kondisi tangga",
      "Koridor & jalur sirkulasi",
      "Pintu & akses keluar",
      "Instalasi listrik",
      "Pencegahan kebakaran",
      "Keamanan asrama",
      "Keamanan area kampus",
      "Keselamatan fasilitas olahraga",
      "Keselamatan laboratorium/workshop",
    ],
    aspects: [
      { id: "ASP-KES-001", categoryId: "KAT-KESELAMATAN", name: "Struktur & bangunan" },
      { id: "ASP-KES-002", categoryId: "KAT-KESELAMATAN", name: "Kelistrikan & kebakaran" },
      { id: "ASP-KES-003", categoryId: "KAT-KESELAMATAN", name: "Keamanan lingkungan" },
      { id: "ASP-KES-004", categoryId: "KAT-KESELAMATAN", name: "Fasilitas khusus" },
    ],
  },
  {
    id: "KAT-DARURAT",
    name: "Sistem Tanggap Darurat & Antisipasi Kebencanaan",
    description:
      "Aspek kesiapan evakuasi, sistem peringatan, perlengkapan darurat, serta prosedur dan simulasi kebencanaan.",
    icon: "Siren",
    coverage: [
      "Jalur evakuasi",
      "Titik kumpul",
      "Rambu keselamatan",
      "Sistem alarm darurat",
      "APAR",
      "Kotak P3K",
      "Emergency lighting",
      "Sistem komunikasi darurat",
      "Simulasi kebencanaan",
      "SOP/Rencana tanggap darurat",
    ],
    aspects: [
      { id: "ASP-DAR-001", categoryId: "KAT-DARURAT", name: "Jalur & titik evakuasi" },
      { id: "ASP-DAR-002", categoryId: "KAT-DARURAT", name: "Sistem peringatan & perlengkapan" },
      { id: "ASP-DAR-003", categoryId: "KAT-DARURAT", name: "Kesiapan & prosedur" },
    ],
  },
  {
    id: "KAT-KESEHATAN",
    name: "Kesehatan",
    description:
      "Aspek kesehatan penghuni/pengguna lingkungan pesantren: layanan, sanitasi personal, dan kualitas lingkungan sehat.",
    icon: "HeartPulse",
    coverage: [
      "Ruang/fasilitas kesehatan",
      "Pelayanan kesehatan",
      "Akses pertolongan medis",
      "P3K",
      "Ketersediaan air minum",
      "Sanitasi personal",
      "Ventilasi & kualitas udara",
      "Pencahayaan",
      "Pengendalian penyakit",
      "Fasilitas kebugaran/olahraga",
    ],
    aspects: [
      { id: "ASP-SEH-001", categoryId: "KAT-KESEHATAN", name: "Layanan & fasilitas kesehatan" },
      { id: "ASP-SEH-002", categoryId: "KAT-KESEHATAN", name: "Air & sanitasi personal" },
      { id: "ASP-SEH-003", categoryId: "KAT-KESEHATAN", name: "Kualitas lingkungan & aktivitas" },
    ],
  },
  {
    id: "KAT-LINGKUNGAN",
    name: "Kesehatan Lingkungan",
    description:
      "Aspek pengelolaan sampah/limbah, air & drainase, sanitasi, pengendalian vektor, serta kebersihan lingkungan.",
    icon: "Leaf",
    coverage: [
      "Pengelolaan sampah",
      "Pengelolaan limbah",
      "Drainase",
      "Air bersih",
      "Air limbah",
      "Toilet & kamar mandi",
      "Pengendalian vektor",
      "Kebersihan lingkungan",
      "Ruang terbuka hijau",
      "Kualitas lingkungan",
    ],
    aspects: [
      { id: "ASP-LING-001", categoryId: "KAT-LINGKUNGAN", name: "Sampah & limbah" },
      { id: "ASP-LING-002", categoryId: "KAT-LINGKUNGAN", name: "Air & drainase" },
      { id: "ASP-LING-003", categoryId: "KAT-LINGKUNGAN", name: "Sanitasi & vektor" },
      { id: "ASP-LING-004", categoryId: "KAT-LINGKUNGAN", name: "Kebersihan & kualitas lingkungan" },
    ],
  },
  {
    id: "KAT-PSIKOSOSIAL",
    name: "Psikososial: Bullying & Kesehatan Mental",
    description:
      "Aspek kebijakan dan penanganan bullying, layanan kesehatan mental, serta kondisi psikososial dan perlindungan kelompok rentan.",
    icon: "Brain",
    coverage: [
      "Kebijakan anti-bullying",
      "Mekanisme pelaporan",
      "Penanganan kasus bullying",
      "Fasilitas konseling",
      "Layanan kesehatan mental",
      "Program promotif kesehatan mental",
      "Kondisi psikososial",
      "Perlindungan kelompok rentan",
    ],
    aspects: [
      { id: "ASP-PSI-001", categoryId: "KAT-PSIKOSOSIAL", name: "Kebijakan & penanganan bullying" },
      { id: "ASP-PSI-002", categoryId: "KAT-PSIKOSOSIAL", name: "Layanan kesehatan mental" },
      { id: "ASP-PSI-003", categoryId: "KAT-PSIKOSOSIAL", name: "Kondisi psikososial & perlindungan" },
    ],
  },
  {
    id: "KAT-AKSESIBILITAS",
    name: "Fasilitas Disabilitas & Aksesibilitas",
    description:
      "Aspek ketersediaan jalur, ruang, fasilitas, dan informasi yang aksesibel bagi penyandang disabilitas.",
    icon: "Accessibility",
    coverage: [
      "Jalur aksesibilitas",
      "Toilet aksesibel",
      "Tangga & handrail",
      "Lift/platform lift",
      "Pintu aksesibel",
      "Parkir disabilitas",
      "Guiding block",
      "Signage aksesibilitas",
      "Aksesibilitas asrama",
      "Aksesibilitas ruang akademik",
      "Aksesibilitas informasi",
    ],
    aspects: [
      { id: "ASP-AKS-001", categoryId: "KAT-AKSESIBILITAS", name: "Jalur & sirkulasi" },
      { id: "ASP-AKS-002", categoryId: "KAT-AKSESIBILITAS", name: "Ruang & fasilitas" },
      { id: "ASP-AKS-003", categoryId: "KAT-AKSESIBILITAS", name: "Informasi & akses ruang" },
    ],
  },
];

export const K3_CATEGORY_MAP: Record<K3CategoryId, K3Category> = Object.fromEntries(
  K3_CATEGORIES.map((c) => [c.id, c]),
) as Record<K3CategoryId, K3Category>;

export const K3_ASPECT_MAP: Record<string, K3Aspect> = Object.fromEntries(
  K3_CATEGORIES.flatMap((c) => c.aspects.map((a) => [a.id, a])),
);

export function aspectsOfCategory(categoryId: string): K3Aspect[] {
  return K3_CATEGORIES.find((c) => c.id === categoryId)?.aspects ?? [];
}

/** Label netral untuk temuan tanpa relasi indikator (lapor-cepat). */
export const KATEGORI_BELUM_DIPETAKAN = "Belum dipetakan";
