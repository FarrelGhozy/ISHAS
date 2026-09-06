import {
  auditRecords,
  institutions,
  permissionRows,
  users,
} from '@/mocks/seed/admin';
import {
  assignments,
  continuedAnswers,
  indicators,
  initialEvidence,
  type AnswerState,
} from '@/mocks/seed/asesor';
import {
  defaultRubrics,
  initialBuilderDimensions,
  initialValidationItems,
  instrumentDimensions,
  instrumentVersions,
  researchDatasets,
} from '@/mocks/seed/peneliti';
import {
  areaDirectory,
  initialBuildings,
  initialRecommendations,
  periodResults,
  reports,
  riskFindings,
} from '@/mocks/seed/pengelola';

export const MOCK_SCHEMA_VERSION = 3;
export const MOCK_STORAGE_KEY = `ishas-domain-v${MOCK_SCHEMA_VERSION}`;

export type DemoUser = (typeof users)[number];
export type DemoInstitution = (typeof institutions)[number];
export type DemoAuditRecord = (typeof auditRecords)[number];
export type DemoInstrumentVersion = (typeof instrumentVersions)[number];
export type DemoEvidence = (typeof initialEvidence)[number];

export type DemoNotification = {
  id: string;
  role: 'admin' | 'peneliti' | 'asesor' | 'pengelola';
  title: string;
  message: string;
  targetPath: string;
  read: boolean;
  createdAt: string;
};

export type MockDomainState = {
  schemaVersion: number;
  revision: number;
  users: typeof users;
  institutions: typeof institutions;
  auditRecords: typeof auditRecords;
  permissionRows: typeof permissionRows;
  instrumentVersions: typeof instrumentVersions;
  instrumentDimensions: typeof instrumentDimensions;
  defaultRubrics: typeof defaultRubrics;
  builderDimensions: typeof initialBuilderDimensions;
  validationItems: typeof initialValidationItems;
  researchDatasets: typeof researchDatasets;
  assignments: typeof assignments;
  indicators: typeof indicators;
  indicatorsByVersion: Record<string, typeof indicators>;
  assessmentAnswers: Record<string, Record<string, AnswerState>>;
  assessmentActiveIndex: Record<string, number>;
  evidence: typeof initialEvidence;
  buildings: typeof initialBuildings;
  areas: typeof areaDirectory;
  periodResults: typeof periodResults;
  riskFindings: typeof riskFindings;
  recommendations: typeof initialRecommendations;
  reports: typeof reports;
  notifications: DemoNotification[];
  settings: {
    emailNotification: boolean;
    maintenanceNotice: boolean;
  };
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createInitialMockState(): MockDomainState {
  return {
    schemaVersion: MOCK_SCHEMA_VERSION,
    revision: 0,
    users: clone(users),
    institutions: clone(institutions),
    auditRecords: clone(auditRecords),
    permissionRows: clone(permissionRows),
    instrumentVersions: clone(instrumentVersions),
    instrumentDimensions: clone(instrumentDimensions),
    defaultRubrics: clone(defaultRubrics),
    builderDimensions: clone(initialBuilderDimensions),
    validationItems: clone(initialValidationItems),
    researchDatasets: clone(researchDatasets),
    assignments: clone(assignments),
    indicators: clone(indicators),
    indicatorsByVersion: {
      'INS-v1.0': clone(indicators),
      'INS-v0.9': clone(indicators),
      'INS-v1.1-RC2': clone(indicators),
    },
    assessmentAnswers: {
      'ASM-0261': clone(continuedAnswers),
    },
    assessmentActiveIndex: {
      'ASM-0261': 0,
    },
    evidence: clone(initialEvidence),
    buildings: clone(initialBuildings),
    areas: clone(areaDirectory),
    periodResults: clone(periodResults),
    riskFindings: clone(riskFindings),
    recommendations: clone(initialRecommendations),
    reports: clone(reports),
    notifications: [
      {
        id: 'NOT-001',
        role: 'admin',
        title: 'Akun menunggu aktivasi',
        message: 'Satu akun Asesor perlu diperiksa.',
        targetPath: '/admin/pengguna',
        read: false,
        createdAt: '06 Sep 2026, 08.00',
      },
      {
        id: 'NOT-002',
        role: 'peneliti',
        title: 'Draft perlu validasi',
        message: 'ISHAS v1.1 masih memiliki item validasi terbuka.',
        targetPath: '/peneliti/validasi-publikasi',
        read: false,
        createdAt: '06 Sep 2026, 08.05',
      },
      {
        id: 'NOT-003',
        role: 'asesor',
        title: 'Bukti belum lengkap',
        message: 'Assessment ASM-0261 masih memiliki bukti wajib.',
        targetPath: '/asesor/assessment-baru',
        read: false,
        createdAt: '06 Sep 2026, 08.10',
      },
      {
        id: 'NOT-004',
        role: 'pengelola',
        title: 'Tindak lanjut prioritas',
        message: 'Dua rekomendasi prioritas tinggi perlu ditangani.',
        targetPath: '/pengelola/rekomendasi',
        read: false,
        createdAt: '06 Sep 2026, 08.15',
      },
    ],
    settings: {
      emailNotification: true,
      maintenanceNotice: false,
    },
  };
}
