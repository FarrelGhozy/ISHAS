import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Building2,
  FileCheck2,
  FileClock,
  FileText,
  FlaskConical,
  History,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Plus,
  Settings,
  SlidersHorizontal,
  Users,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import type { RoleId } from '@/shared/auth/demo-accounts';

export type NavigationItem = {
  id: string;
  slug: string;
  label: string;
  Icon: LucideIcon;
  badge?: string;
};

export const roleNavigation: Record<RoleId, NavigationItem[]> = {
  admin: [
    {
      id: 'dashboard',
      slug: 'dashboard',
      label: 'Dashboard Sistem',
      Icon: LayoutDashboard,
    },
    {
      id: 'users',
      slug: 'pengguna',
      label: 'Pengguna',
      Icon: Users,
      badge: '3',
    },
    {
      id: 'institutions',
      slug: 'pesantren',
      label: 'Pesantren',
      Icon: Building2,
    },
    {
      id: 'permissions',
      slug: 'hak-akses',
      label: 'Hak Akses',
      Icon: KeyRound,
    },
    { id: 'audit', slug: 'audit-log', label: 'Audit Log', Icon: History },
    {
      id: 'settings',
      slug: 'pengaturan',
      label: 'Pengaturan',
      Icon: Settings,
    },
  ],
  peneliti: [
    {
      id: 'dashboard',
      slug: 'dashboard',
      label: 'Dashboard Penelitian',
      Icon: LayoutDashboard,
    },
    {
      id: 'instruments',
      slug: 'instrumen',
      label: 'Instrumen',
      Icon: BookOpenCheck,
      badge: '2',
    },
    {
      id: 'versions',
      slug: 'versioning',
      label: 'Versioning',
      Icon: FileClock,
    },
    {
      id: 'scoring',
      slug: 'scoring',
      label: 'Konfigurasi Scoring',
      Icon: SlidersHorizontal,
    },
    {
      id: 'validation',
      slug: 'validasi-publikasi',
      label: 'Validasi & Publikasi',
      Icon: FileCheck2,
    },
    {
      id: 'research',
      slug: 'data-penelitian',
      label: 'Data Penelitian',
      Icon: FlaskConical,
    },
  ],
  asesor: [
    {
      id: 'dashboard',
      slug: 'dashboard',
      label: 'Dashboard Asesor',
      Icon: LayoutDashboard,
    },
    {
      id: 'assignments',
      slug: 'penugasan',
      label: 'Assessment Saya',
      Icon: ClipboardList,
      badge: '3',
    },
    {
      id: 'new-assessment',
      slug: 'assessment-baru',
      label: 'Assessment Baru',
      Icon: Plus,
    },
    {
      id: 'evidence',
      slug: 'bukti',
      label: 'Bukti Lapangan',
      Icon: FileCheck2,
    },
    { id: 'history', slug: 'riwayat', label: 'Riwayat', Icon: History },
  ],
  pengelola: [
    {
      id: 'dashboard',
      slug: 'dashboard',
      label: 'Ringkasan K3L',
      Icon: LayoutDashboard,
    },
    {
      id: 'results',
      slug: 'hasil',
      label: 'Hasil Assessment',
      Icon: BarChart3,
    },
    {
      id: 'locations',
      slug: 'lokasi',
      label: 'Gedung & Denah',
      Icon: Building2,
    },
    {
      id: 'risk-map',
      slug: 'peta-risiko',
      label: 'Peta Bahaya & Risiko',
      Icon: MapPinned,
      badge: '2',
    },
    {
      id: 'recommendations',
      slug: 'rekomendasi',
      label: 'Rekomendasi',
      Icon: ListChecks,
      badge: '6',
    },
    {
      id: 'follow-up',
      slug: 'tindak-lanjut',
      label: 'Tindak Lanjut',
      Icon: Activity,
    },
    { id: 'reports', slug: 'laporan', label: 'Laporan', Icon: FileText },
  ],
};

export const roleMeta: Record<
  RoleId,
  { workspace: string; scope: string; eyebrow: string }
> = {
  admin: {
    workspace: 'Ruang Kerja Admin',
    scope: 'Seluruh sistem dan lembaga',
    eyebrow: 'Kendali sistem',
  },
  peneliti: {
    workspace: 'Ruang Kerja Peneliti',
    scope: 'Instrumen dan data penelitian',
    eyebrow: 'Tata kelola ilmiah',
  },
  asesor: {
    workspace: 'Ruang Kerja Asesor',
    scope: 'Penugasan assessment aktif',
    eyebrow: 'Pelaksanaan lapangan',
  },
  pengelola: {
    workspace: 'Ruang Kerja Pesantren',
    scope: 'PP Al-Hikmah Malang',
    eyebrow: 'Pemanfaatan hasil',
  },
};

export function getWorkspacePath(role: RoleId, sectionId = 'dashboard') {
  const item = roleNavigation[role].find((entry) => entry.id === sectionId);
  return `/${role}/${item?.slug ?? 'dashboard'}`;
}

export function getNavigationItem(role: RoleId, slug: string) {
  return roleNavigation[role].find((item) => item.slug === slug);
}
