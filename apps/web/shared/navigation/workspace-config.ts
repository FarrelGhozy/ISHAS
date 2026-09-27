// Konfigurasi ruang kerja per peran — docs ROUTES.md §2. Tanpa asesor (dihapus pada V2).

import {
  Activity,
  BookOpen,
  Building2,
  Database,
  FileBarChart,
  FileCheck2,
  ListChecks,
  MapPinned,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { RoleId } from "~/mocks/types";

export type NavItem = {
  label: string;
  path: string;
  icon: typeof Activity;
};

export const ROLE_NAVIGATION: Record<RoleId, NavItem[]> = {
  admin: [
    { label: "Dashboard sistem", path: "/admin/dashboard", icon: Activity },
    { label: "Pengguna", path: "/admin/pengguna", icon: Users },
    { label: "Pesantren", path: "/admin/pesantren", icon: Building2 },
    { label: "Hak akses", path: "/admin/hak-akses", icon: ShieldCheck },
    { label: "Audit log", path: "/admin/audit-log", icon: ScrollText },
    { label: "Pengaturan", path: "/admin/pengaturan", icon: Settings },
  ],
  validator: [
    { label: "Dashboard validator", path: "/validator/dashboard", icon: Activity },
    { label: "Instrumen", path: "/validator/instrumen", icon: ListChecks },
    { label: "Dokumen instrumen", path: "/validator/dokumen-instrumen", icon: BookOpen },
    { label: "Scoring", path: "/validator/scoring", icon: Database },
    { label: "Validasi & publikasi", path: "/validator/validasi-publikasi", icon: FileCheck2 },
    { label: "Data penelitian", path: "/validator/data-penelitian", icon: FileBarChart },
  ],
  pesantren: [
    { label: "Validasi laporan", path: "/pesantren/validasi-laporan", icon: ListChecks },
    { label: "Lokasi & denah", path: "/pesantren/lokasi", icon: MapPinned },
    { label: "Tindak lanjut", path: "/pesantren/tindak-lanjut", icon: Activity },
    { label: "Laporan", path: "/pesantren/laporan", icon: FileBarChart },
  ],
};
