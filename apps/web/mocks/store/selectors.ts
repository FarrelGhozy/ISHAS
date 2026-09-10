// Selector murni di atas IshasState. Semua pembacaan data tervalidasi lewat sini
// agar dashboard/hasil/peta konsisten — docs DATA_MODEL.md §3, DATA_REQUIREMENTS §6.

import type {
  Institution,
  Recommendation,
  Report,
  RiskFinding,
  User,
} from "../types";

export function selectRegisteredInstitutions(state: {
  institutions: Institution[];
  users: User[];
}): Institution[] {
  const activeManagerCodes = new Set(
    state.users
      .filter(
        (u) =>
          u.roleId === "pengelola" &&
          u.status === "Aktif" &&
          u.institutionCodes.length === 1,
      )
      .flatMap((u) => u.institutionCodes),
  );
  return state.institutions.filter(
    (i) => i.status === "Aktif" && activeManagerCodes.has(i.code),
  );
}

export function selectValidatedReports(state: { reports: Report[] }): Report[] {
  return state.reports.filter(
    (r) => r.validationStatus === "Diterima" && !r.archivedAt,
  );
}

// Bacaan publik (D-08): hanya laporan Diterima + belum diarsip + milik pesantren
// yang MASIH terdaftar. Hasil lama pesantren Nonaktif/kehilangan pengelola tidak
// tampil publik; data tetap tersimpan untuk baca internal sesuai scope.
export function selectPublicReports(
  state: { institutions: Institution[]; reports: Report[]; users: User[] },
  institutionCode: string | null,
): Report[] {
  const registered = new Set(
    selectRegisteredInstitutions(state).map((i) => i.code),
  );
  const validated = selectValidatedReports(state).filter((r) =>
    registered.has(r.institutionCode),
  );
  if (!institutionCode) return validated;
  return validated.filter((r) => r.institutionCode === institutionCode);
}

export function selectValidationQueue(
  state: { reports: Report[] },
  institutionCode: string,
): Report[] {
  return state.reports
    .filter(
      (r) =>
        r.institutionCode === institutionCode &&
        r.validationStatus === "Menunggu validasi",
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function selectReportsByInstitution(
  state: { institutions: Institution[]; reports: Report[]; users: User[] },
  institutionCode: string | null,
): Report[] {
  // Alias internal = bacaan publik (D-08). Test lama + dashboard peneliti lewat sini.
  return selectPublicReports(state, institutionCode);
}

export function selectFindingsByReports(
  state: { findings: RiskFinding[] },
  reports: Report[],
): RiskFinding[] {
  const ids = new Set(reports.map((r) => r.id));
  return state.findings.filter((f) => ids.has(f.reportId));
}

export function selectRecommendationsByReports(
  state: { recommendations: Recommendation[] },
  reports: Report[],
): Recommendation[] {
  const ids = new Set(reports.map((r) => r.id));
  return state.recommendations.filter((rec) => ids.has(rec.reportId));
}

export function selectInstitutionByCode(
  state: { institutions: Institution[] },
  code: string | undefined,
): Institution | undefined {
  if (!code) return undefined;
  return state.institutions.find((i) => i.code === code);
}

export function selectUserById(
  state: { users: User[] },
  id: string | undefined,
): User | undefined {
  if (!id) return undefined;
  return state.users.find((u) => u.id === id);
}

export function selectNotificationsForAccount(
  state: { notifications: { recipientAccountId?: string }[] },
  accountId: string,
) {
  return state.notifications.filter(
    (n) => n.recipientAccountId === accountId,
  );
}
