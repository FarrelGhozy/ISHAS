// Akun demo persis — docs ROLES.md §2–§4. Kartu Pesantren memakai akun UNIDA
// Gontor (USR-007, PSN-0024) sesuai D-48; akun Pesantren lain (USR-003/USR-004)
// tetap di seed untuk demo scope isolation dan pengujian.
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
    name: "M. Ridwan",
    email: "validator@ishas.demo",
    initials: "MR",
    role: "Validator",
    roleId: "validator",
    scope: "Seluruh sistem",
    description: "Mengelola instrumen dan penilaian.",
  },
  {
    id: "USR-007",
    name: "Eko Prasetio Widhi, M.Kom.",
    email: "unida@ishas.demo",
    initials: "EP",
    role: "Pesantren",
    roleId: "pesantren",
    scope: "PSN-0024 · UNIDA Gontor",
    description: "Memvalidasi laporan dan mengelola tindak lanjut.",
  },
];
