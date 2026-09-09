// Konfigurasi ruang kerja per peran — docs ROUTES.md §2. Tanpa asesor (dihapus pada V2).

import {
  Activity,
  Building2,
  ClipboardList,
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
  peneliti: [
    { label: "Dashboard penelitian", path: "/peneliti/dashboard", icon: Activity },
    { label: "Instrumen", path: "/peneliti/instrumen", icon: ListChecks },
    { label: "Versioning", path: "/peneliti/versioning", icon: ClipboardList },
    { label: "Scoring", path: "/peneliti/scoring", icon: Database },
    { label: "Validasi & publikasi", path: "/peneliti/validasi-publikasi", icon: FileCheck2 },
    { label: "Data penelitian", path: "/peneliti/data-penelitian", icon: FileBarChart },
  ],
  pengelola: [
    { label: "Validasi laporan", path: "/pengelola/validasi-laporan", icon: ListChecks },
    { label: "Lokasi & denah", path: "/pengelola/lokasi", icon: MapPinned },
    { label: "Tindak lanjut", path: "/pengelola/tindak-lanjut", icon: Activity },
    { label: "Laporan", path: "/pengelola/laporan", icon: FileBarChart },
  ],
};
