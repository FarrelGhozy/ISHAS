// Akun demo persis — docs ROLES.md §2–§4. Akun pengelola kedua (USR-004) ada di seed
// untuk demo scope isolation; cara memilihnya saat login menunggu D-09 (TANPA pemilih peran).
// Dilarang menyimpan/meminta kata sandi: login demo memakai kartu akun (persis V1).

import type { RoleId, RoleLabel } from "~/mocks/types";

export type DemoAccount = {
  id: string; // menunjuk User.id di seed
  name: string;
  email: string;
  initials: string;
  role: RoleLabel;
  roleId: RoleId;
  scope: string; // teks ringkas di kartu login
  description: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "USR-001",
    name: "Nadia Permata",
    email: "admin@ishas.demo",
    initials: "NP",
    role: "Super Admin",
    roleId: "admin",
    scope: "Seluruh sistem",
    description: "Mengelola pesantren, akun, audit.",
  },
  {
    id: "USR-002",
    name: "Dr. M. Ridwan",
    email: "peneliti@ishas.demo",
    initials: "MR",
    role: "Peneliti",
    roleId: "peneliti",
    scope: "Seluruh sistem",
    description: "Mengelola instrumen dan penilaian.",
  },
  {
    id: "USR-003",
    name: "Ust. K.H. Mustofa Kamal",
    email: "pengelola@ishas.demo",
    initials: "MK",
    role: "Pengelola Pesantren",
    roleId: "pengelola",
    scope: "PSN-0018 · PP Al-Hikmah Malang",
    description: "Memvalidasi laporan dan mengelola tindak lanjut.",
  },
];
