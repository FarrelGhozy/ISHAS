// Single source of truth kategori/aspek K3 — turunan kode dari docs/KATEGORI_K3.md (D-15).
// Dilarang mendefinisikan ulang daftar kategori di komponen/processor/seed lain;
// impor dari sini. Ikon berupa nama komponen lucide-react yang sudah tersedia.

export type K3CategoryId =
  | "KAT-KESELAMATAN"
  | "KAT-KESEHATAN"
  | "KAT-LINGKUNGAN"
  | "KAT-PSIKOSOSIAL";

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
  icon: "ShieldCheck" | "HeartPulse" | "Leaf" | "Brain";
  coverage: string[];
  aspects: K3Aspect[];
};

export const K3_CATEGORIES: K3Category[] = [
  {
    id: "KAT-KESELAMATAN",
    name: "Keselamatan",
    description:
      "Aspek yang berkaitan dengan keselamatan fisik, fasilitas, dan kondisi lingkungan kerja/tempat kegiatan.",
    icon: "ShieldCheck",
    coverage: [
      "Keselamatan bangunan",
      "Instalasi listrik",
      "Risiko kebakaran",
      "Jalur evakuasi",
      "APAR",
      "Tangga",
      "Kondisi lantai",
      "Pintu darurat",
      "Peralatan keselamatan",
    ],
    aspects: [
      { id: "ASP-KES-001", categoryId: "KAT-KESELAMATAN", name: "Instalasi listrik" },
      { id: "ASP-KES-002", categoryId: "KAT-KESELAMATAN", name: "Proteksi kebakaran & APAR" },
      { id: "ASP-KES-003", categoryId: "KAT-KESELAMATAN", name: "Jalur evakuasi & pintu darurat" },
      { id: "ASP-KES-004", categoryId: "KAT-KESELAMATAN", name: "Bangunan, tangga & lantai" },
      { id: "ASP-KES-005", categoryId: "KAT-KESELAMATAN", name: "Peralatan keselamatan" },
    ],
  },
  {
    id: "KAT-KESEHATAN",
    name: "Kesehatan",
    description:
      "Aspek yang berkaitan dengan kesehatan penghuni/pengguna lingkungan pesantren.",
    icon: "HeartPulse",
    coverage: [
      "Kebersihan",
      "Sanitasi",
      "Ketersediaan air bersih",
      "Toilet",
      "Pengelolaan makanan",
      "Kebersihan dapur",
      "Ventilasi",
      "Sirkulasi udara",
    ],
    aspects: [
      { id: "ASP-SEH-001", categoryId: "KAT-KESEHATAN", name: "Air bersih & sanitasi" },
      { id: "ASP-SEH-002", categoryId: "KAT-KESEHATAN", name: "Kebersihan dapur & makanan" },
      { id: "ASP-SEH-003", categoryId: "KAT-KESEHATAN", name: "Ventilasi & sirkulasi udara" },
    ],
  },
  {
    id: "KAT-LINGKUNGAN",
    name: "Lingkungan",
    description:
      "Aspek yang berkaitan dengan kondisi dan pengelolaan lingkungan pesantren.",
    icon: "Leaf",
    coverage: [
      "Pengelolaan sampah",
      "Drainase",
      "Kualitas air",
      "Kualitas udara",
      "Limbah",
      "Penghijauan",
      "Kebersihan lingkungan",
    ],
    aspects: [
      { id: "ASP-LING-001", categoryId: "KAT-LINGKUNGAN", name: "Pengelolaan sampah" },
      { id: "ASP-LING-002", categoryId: "KAT-LINGKUNGAN", name: "Drainase, limbah & kualitas air" },
      { id: "ASP-LING-003", categoryId: "KAT-LINGKUNGAN", name: "Kualitas udara & penghijauan" },
    ],
  },
  {
    id: "KAT-PSIKOSOSIAL",
    name: "Psikososial",
    description:
      "Aspek yang berkaitan dengan kondisi psikologis, sosial, beban aktivitas, dan interaksi antar individu.",
    icon: "Brain",
    coverage: [
      "Beban kerja",
      "Beban aktivitas",
      "Dukungan sosial",
      "Stres",
      "Konflik",
      "Kepuasan kerja",
      "Tekanan aktivitas",
      "Hubungan antar individu",
    ],
    aspects: [
      { id: "ASP-PSI-001", categoryId: "KAT-PSIKOSOSIAL", name: "Beban kerja & aktivitas" },
      { id: "ASP-PSI-002", categoryId: "KAT-PSIKOSOSIAL", name: "Dukungan sosial & hubungan" },
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
