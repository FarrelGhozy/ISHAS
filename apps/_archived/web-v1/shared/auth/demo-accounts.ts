import {
  Building2,
  ClipboardCheck,
  Microscope,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export type RoleId = 'admin' | 'peneliti' | 'asesor' | 'pengelola';

export type DemoAccount = {
  role: RoleId;
  roleLabel: string;
  name: string;
  email: string;
  initials: string;
  responsibility: string;
  Icon: LucideIcon;
};

export const demoAccounts: DemoAccount[] = [
  {
    role: 'admin',
    roleLabel: 'Admin',
    name: 'Nadia Permata',
    email: 'admin@ishas.demo',
    initials: 'NP',
    responsibility: 'Mengelola sistem, akun, lembaga, akses, dan audit.',
    Icon: UserCog,
  },
  {
    role: 'peneliti',
    roleLabel: 'Peneliti',
    name: 'Dr. M. Ridwan',
    email: 'peneliti@ishas.demo',
    initials: 'MR',
    responsibility:
      'Mengelola ilmu, instrumen, versi, dan konfigurasi scoring.',
    Icon: Microscope,
  },
  {
    role: 'asesor',
    roleLabel: 'Asesor',
    name: 'Ahmad Fauzan',
    email: 'asesor@ishas.demo',
    initials: 'AF',
    responsibility: 'Melaksanakan assessment dan menghasilkan bukti lapangan.',
    Icon: ClipboardCheck,
  },
  {
    role: 'pengelola',
    roleLabel: 'Pengelola Pesantren',
    name: 'Ust. K.H. Mustofa Kamal',
    email: 'pengelola@ishas.demo',
    initials: 'MK',
    responsibility: 'Membaca hasil dan mengelola tindak lanjut pesantren.',
    Icon: Building2,
  },
];

export function isRoleId(value: string): value is RoleId {
  return demoAccounts.some((account) => account.role === value);
}

export function getDemoAccount(role: RoleId) {
  return demoAccounts.find((account) => account.role === role)!;
}
