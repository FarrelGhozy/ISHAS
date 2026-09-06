'use client';

import { useSyncExternalStore } from 'react';
import type {
  ActionResult,
  AddInstitutionInput,
  AddUserInput,
  MockRepository,
} from '@/mocks/adapters/mock-repository';
import type { AnswerState } from '@/mocks/seed/asesor';
import type { BuilderDimension, RubricOption } from '@/mocks/seed/peneliti';
import type {
  AreaRecord,
  BuildingRecord,
  FloorRecord,
  RecommendationStatus,
  RiskFinding,
  RiskLevel,
} from '@/mocks/seed/pengelola';
import { calculateAssessmentCompleteness } from '@/mocks/processors/assessment';
import { buildAssessmentIndicators } from '@/mocks/processors/instrument';
import {
  createInitialMockState,
  MOCK_SCHEMA_VERSION,
  MOCK_STORAGE_KEY,
  type MockDomainState,
} from '@/mocks/store/state';

const serverSnapshot = createInitialMockState();
let browserSnapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function persist() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify(browserSnapshot),
  );
}

function initialize() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  const stored = window.localStorage.getItem(MOCK_STORAGE_KEY);
  if (!stored) {
    browserSnapshot = createInitialMockState();
    persist();
    return;
  }

  try {
    const parsed = JSON.parse(stored) as MockDomainState;
    if (parsed.schemaVersion !== MOCK_SCHEMA_VERSION) {
      browserSnapshot = createInitialMockState();
      persist();
      return;
    }
    browserSnapshot = parsed;
  } catch {
    browserSnapshot = createInitialMockState();
    persist();
  }
}

function emit(next: MockDomainState) {
  browserSnapshot = next;
  persist();
  listeners.forEach((listener) => listener());
}

function mutate<T>(producer: (draft: MockDomainState) => T): T {
  initialize();
  const draft = clone(browserSnapshot);
  const result = producer(draft);
  draft.revision += 1;
  emit(draft);
  return result;
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  initialize();
  return browserSnapshot;
}

function makeId(prefix: string, currentLength: number) {
  return `${prefix}-${String(currentLength + 1).padStart(3, '0')}`;
}

function addAudit(
  draft: MockDomainState,
  action: string,
  target: string,
  category: string,
  actor = 'Pengguna Demo',
) {
  draft.auditRecords.unshift({
    actor,
    initials: actor
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    action,
    target,
    category,
    time: 'Baru saja',
    reference: makeId('AUD-DEMO', draft.auditRecords.length),
  });
}

function addNotification(
  draft: MockDomainState,
  role: MockDomainState['notifications'][number]['role'],
  title: string,
  message: string,
  targetPath: string,
) {
  draft.notifications.unshift({
    id: makeId('NOT', draft.notifications.length),
    role,
    title,
    message,
    targetPath,
    read: false,
    createdAt: 'Baru saja',
  });
}

function addUser(input: AddUserInput): ActionResult<string> {
  initialize();
  if (
    browserSnapshot.users.some(
      (user) => user.email.toLowerCase() === input.email.toLowerCase(),
    )
  ) {
    return { ok: false, message: 'Email sudah digunakan pada data demo.' };
  }

  const id = mutate((draft) => {
    const userId = makeId('USR', draft.users.length);
    draft.users.unshift({
      id: userId,
      name: input.name,
      email: input.email,
      initials: input.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      role: input.role,
      roleId: input.roleId,
      institution: input.institution,
      institutionCodes: input.institutionCodes,
      status: 'Menunggu',
      lastActive: 'Belum pernah masuk',
    });
    addAudit(
      draft,
      'Membuat akun pengguna',
      `${input.name} · ${input.role}`,
      'Pengguna',
    );
    addNotification(
      draft,
      'admin',
      'Akun demo baru dibuat',
      `${input.name} menunggu aktivasi.`,
      '/admin/pengguna',
    );
    return userId;
  });
  return { ok: true, data: id };
}

function addInstitution(input: AddInstitutionInput): ActionResult<string> {
  initialize();
  if (
    browserSnapshot.institutions.some(
      (institution) =>
        institution.name.toLowerCase() === input.name.toLowerCase(),
    )
  ) {
    return { ok: false, message: 'Nama pesantren sudah tersedia.' };
  }

  const code = mutate((draft) => {
    const institutionCode = `PSN-${String(
      60 + draft.institutions.length,
    ).padStart(4, '0')}`;
    draft.institutions.unshift({
      name: input.name,
      location: input.location,
      code: institutionCode,
      manager: input.manager || 'Belum ditetapkan',
      users: 0,
      assessment: 'Belum dimulai',
      status: 'Persiapan',
    });
    addAudit(draft, 'Membuat data pesantren', input.name, 'Pesantren');
    return institutionCode;
  });
  return { ok: true, data: code };
}

function createInstrumentVersion(input: {
  name: string;
  note: string;
}): ActionResult<string> {
  initialize();
  const published = browserSnapshot.instrumentVersions.find(
    (version) => version.status === 'Published',
  );
  if (!published) {
    return { ok: false, message: 'Tidak ada versi published sebagai induk.' };
  }

  const id = mutate((draft) => {
    const versionId = `INS-DRAFT-${draft.instrumentVersions.length + 1}`;
    draft.instrumentVersions.unshift({
      ...published,
      id: versionId,
      name: input.name,
      status: 'Draft',
      updated: 'Baru saja',
      author: 'Dr. M. Ridwan',
      note: input.note,
    });
    addAudit(
      draft,
      'Membuat versi instrumen',
      input.name,
      'Instrumen',
      'Dr. M. Ridwan',
    );
    return versionId;
  });
  return { ok: true, data: id };
}

function completeValidationItem(id: string) {
  mutate((draft) => {
    const item = draft.validationItems.find((candidate) => candidate.id === id);
    if (item) item.done = true;
  });
}

function saveBuilderDimensions(dimensions: BuilderDimension[]) {
  mutate((draft) => {
    draft.builderDimensions = clone(dimensions);
    addAudit(
      draft,
      'Menyimpan draft instrumen',
      'Struktur dimensi dan indikator',
      'Instrumen',
      'Dr. M. Ridwan',
    );
  });
}

function saveScoring(input: { weights: number[]; rubrics: RubricOption[] }) {
  mutate((draft) => {
    draft.instrumentDimensions = draft.instrumentDimensions.map(
      (dimension, index) => ({
        ...dimension,
        weight: input.weights[index] ?? dimension.weight,
      }),
    );
    draft.defaultRubrics = clone(input.rubrics);
    addAudit(
      draft,
      'Menyimpan konfigurasi scoring',
      'Draft instrumen aktif',
      'Instrumen',
      'Dr. M. Ridwan',
    );
  });
}

function publishInstrumentVersion(id: string): ActionResult<string> {
  initialize();
  const version = browserSnapshot.instrumentVersions.find(
    (candidate) => candidate.id === id,
  );
  if (!version)
    return { ok: false, message: 'Versi instrumen tidak ditemukan.' };
  if (version.status !== 'Draft') {
    return {
      ok: false,
      message: 'Hanya versi Draft yang dapat dipublikasikan.',
    };
  }
  if (browserSnapshot.validationItems.some((item) => !item.done)) {
    return {
      ok: false,
      message: 'Seluruh checklist validasi harus selesai sebelum publikasi.',
    };
  }

  mutate((draft) => {
    for (const candidate of draft.instrumentVersions) {
      if (candidate.status === 'Published') candidate.status = 'Archived';
    }
    const target = draft.instrumentVersions.find(
      (candidate) => candidate.id === id,
    );
    if (target) {
      target.status = 'Published';
      target.updated = 'Baru saja';
      target.dimensions = draft.builderDimensions.length;
      target.indicators = draft.builderDimensions.reduce(
        (total, dimension) => total + dimension.indicators.length,
        0,
      );
      draft.indicatorsByVersion[id] = buildAssessmentIndicators(
        draft.builderDimensions,
      );
    }
    for (const assignment of draft.assignments) {
      if (assignment.status === 'Terjadwal') {
        assignment.instrumentVersionId = id;
        assignment.version = target?.name ?? version.name;
      }
    }
    addAudit(
      draft,
      'Mempublikasikan instrumen',
      version.name,
      'Instrumen',
      'Dr. M. Ridwan',
    );
    addNotification(
      draft,
      'asesor',
      'Versi instrumen baru tersedia',
      `${version.name} menjadi sumber penugasan terjadwal.`,
      '/asesor/penugasan',
    );
  });
  return { ok: true, data: id };
}

function addBuilding(input: {
  institutionCode: string;
  name: string;
  code: string;
}): ActionResult<string> {
  const id = mutate((draft) => {
    const buildingId = makeId('BLD', draft.buildings.length);
    draft.buildings.push({
      id: buildingId,
      institutionCode: input.institutionCode,
      code: input.code,
      name: input.name,
      floors: [
        {
          id: makeId(
            'FLR',
            draft.buildings.flatMap((item) => item.floors).length,
          ),
          name: 'Lantai 1',
          planFile: '',
          planVersion: '',
          uploadedBy: '',
          uploadedAt: '',
        },
      ],
    });
    addAudit(
      draft,
      'Menambahkan gedung',
      input.name,
      'Lokasi',
      'Ust. M. Kamal',
    );
    addNotification(
      draft,
      'asesor',
      'Lokasi assessment diperbarui',
      `Gedung ${input.name} ditambahkan oleh Pengelola.`,
      '/asesor/assessment-baru',
    );
    return buildingId;
  });
  return { ok: true, data: id };
}

function updateFloorPlan(
  buildingId: string,
  floorId: string,
  fileName: string,
): ActionResult<string> {
  initialize();
  const floor = browserSnapshot.buildings
    .find((building) => building.id === buildingId)
    ?.floors.find((item) => item.id === floorId);
  if (!floor) return { ok: false, message: 'Lantai tidak ditemukan.' };

  mutate((draft) => {
    const target = draft.buildings
      .find((building) => building.id === buildingId)!
      .floors.find((item) => item.id === floorId)!;
    target.planFile = fileName;
    target.planVersion = target.planVersion
      ? `DENAH-v${Number(target.planVersion.split('v')[1]) + 1}`
      : 'DENAH-v1';
    target.uploadedBy = 'Ust. M. Kamal · Pengelola';
    target.uploadedAt = 'Hari ini · data dummy';
    addAudit(
      draft,
      'Mengunggah versi denah',
      `${buildingId} · ${target.name}`,
      'Lokasi',
      'Ust. M. Kamal',
    );
  });
  return { ok: true, data: floorId };
}

function addFloor(buildingId: string, name: string): ActionResult<string> {
  initialize();
  const building = browserSnapshot.buildings.find(
    (item) => item.id === buildingId,
  );
  if (!building) return { ok: false, message: 'Gedung tidak ditemukan.' };

  const id = mutate((draft) => {
    const target = draft.buildings.find((item) => item.id === buildingId)!;
    const floorId = makeId(
      'FLR',
      draft.buildings.flatMap((item) => item.floors).length,
    );
    target.floors.push({
      id: floorId,
      name,
      planFile: '',
      planVersion: '',
      uploadedBy: '',
      uploadedAt: '',
    });
    addAudit(
      draft,
      'Menambahkan lantai',
      `${target.name} · ${name}`,
      'Lokasi',
      'Ust. M. Kamal',
    );
    return floorId;
  });
  return { ok: true, data: id };
}

function addArea(input: {
  institutionCode: string;
  buildingId: string;
  floor: string;
  name: string;
  zone: string;
}): ActionResult<string> {
  initialize();
  const building = browserSnapshot.buildings.find(
    (item) => item.id === input.buildingId,
  );
  if (!building) return { ok: false, message: 'Gedung tidak ditemukan.' };

  const id = mutate((draft) => {
    const areaId = makeId('AREA', draft.areas.length);
    draft.areas.push({
      id: areaId,
      institutionCode: input.institutionCode,
      buildingId: input.buildingId,
      name: input.name,
      floor: input.floor,
      zone: input.zone,
      x: 10,
      y: 10,
      width: 32,
      height: 24,
    });
    addAudit(
      draft,
      'Menambahkan area',
      `${building.name} · ${input.name}`,
      'Lokasi',
      'Ust. M. Kamal',
    );
    addNotification(
      draft,
      'asesor',
      'Area assessment baru tersedia',
      `${input.name} dapat dipilih pada assessment terkait.`,
      '/asesor/assessment-baru',
    );
    return areaId;
  });
  return { ok: true, data: id };
}

function updateAssessmentAnswer(
  assignmentId: string,
  indicatorId: string,
  patch: Partial<AnswerState>,
): ActionResult<string> {
  initialize();
  const assignment = browserSnapshot.assignments.find(
    (candidate) => candidate.id === assignmentId,
  );
  if (!assignment) return { ok: false, message: 'Penugasan tidak ditemukan.' };
  if (assignment.status === 'Final') {
    return { ok: false, message: 'Assessment final tidak dapat diubah.' };
  }
  mutate((draft) => {
    const current = draft.assessmentAnswers[assignmentId] ?? {};
    const previous = current[indicatorId] ?? {
      value: '',
      note: '',
      evidenceName: '',
      areaId: '',
      planPoint: null,
    };
    draft.assessmentAnswers[assignmentId] = {
      ...current,
      [indicatorId]: { ...previous, ...patch },
    };
  });
  return { ok: true, data: indicatorId };
}

function setAssessmentActiveIndex(assignmentId: string, index: number) {
  mutate((draft) => {
    draft.assessmentActiveIndex[assignmentId] = index;
  });
}

function updateEvidence(id: string, fileName: string): ActionResult<string> {
  initialize();
  if (!browserSnapshot.evidence.some((item) => item.id === id)) {
    return { ok: false, message: 'Data bukti tidak ditemukan.' };
  }
  const currentEvidence = browserSnapshot.evidence.find(
    (item) => item.id === id,
  )!;
  const assignment = browserSnapshot.assignments.find(
    (item) => item.id === currentEvidence.assignmentId,
  );
  if (assignment?.status === 'Final') {
    return { ok: false, message: 'Bukti assessment final tidak dapat diubah.' };
  }
  mutate((draft) => {
    const evidence = draft.evidence.find((item) => item.id === id)!;
    evidence.file = fileName;
    evidence.status = fileName ? 'Lengkap' : 'Wajib';
    addAudit(
      draft,
      'Memperbarui bukti assessment',
      `${evidence.indicator} · ${id}`,
      'Assessment',
      'Ahmad Fauzan',
    );
  });
  return { ok: true, data: id };
}

function saveAssessmentDraft(assignmentId: string): ActionResult<number> {
  initialize();
  const assignment = browserSnapshot.assignments.find(
    (candidate) => candidate.id === assignmentId,
  );
  if (!assignment) return { ok: false, message: 'Penugasan tidak ditemukan.' };
  if (assignment.status === 'Final') {
    return { ok: false, message: 'Assessment final tidak dapat diubah.' };
  }

  const completeness = calculateAssessmentCompleteness(
    browserSnapshot.indicatorsByVersion[assignment.instrumentVersionId] ??
      browserSnapshot.indicators,
    browserSnapshot.assessmentAnswers[assignmentId] ?? {},
  );
  mutate((draft) => {
    const target = draft.assignments.find(
      (candidate) => candidate.id === assignmentId,
    );
    if (target) {
      target.status = 'Draft';
      target.progress = completeness.progress;
      target.missingEvidence = completeness.missingEvidenceIds.length;
    }
    addAudit(
      draft,
      'Menyimpan draft assessment',
      assignmentId,
      'Assessment',
      'Ahmad Fauzan',
    );
  });
  return { ok: true, data: completeness.progress };
}

function finalizeAssessment(assignmentId: string): ActionResult<number> {
  initialize();
  const assignment = browserSnapshot.assignments.find(
    (candidate) => candidate.id === assignmentId,
  );
  if (!assignment) return { ok: false, message: 'Penugasan tidak ditemukan.' };
  if (assignment.status === 'Final') {
    return { ok: false, message: 'Assessment sudah final dan terkunci.' };
  }

  const answers = browserSnapshot.assessmentAnswers[assignmentId] ?? {};
  const assignmentIndicators =
    browserSnapshot.indicatorsByVersion[assignment.instrumentVersionId] ??
    browserSnapshot.indicators;
  const completeness = calculateAssessmentCompleteness(
    assignmentIndicators,
    answers,
  );
  if (!completeness.complete) {
    return {
      ok: false,
      message: `${completeness.missingIndicatorIds.length} indikator wajib belum lengkap.`,
    };
  }

  const numericScores = assignmentIndicators
    .map((indicator) => answers[indicator.id]?.value)
    .filter((value) => value && value !== 'N/A')
    .map((value) =>
      value === 'Ya' ? 4 : value === 'Tidak' ? 1 : Number(value),
    )
    .filter((value) => Number.isFinite(value));
  const illustrativeScore =
    numericScores.length === 0
      ? 0
      : Math.round(
          (numericScores.reduce((total, score) => total + score, 0) /
            numericScores.length /
            4) *
            1000,
        ) / 10;

  mutate((draft) => {
    const target = draft.assignments.find(
      (candidate) => candidate.id === assignmentId,
    )!;
    target.status = 'Final';
    target.progress = 100;
    target.missingEvidence = 0;

    if (!draft.periodResults.some((result) => result.id === assignmentId)) {
      const dimensions = [
        ...new Set(assignmentIndicators.map((item) => item.dimension)),
      ];
      draft.periodResults.unshift({
        id: assignmentId,
        period: target.period,
        date: target.date,
        score: illustrativeScore,
        category: 'Simulasi prototipe',
        version: target.version,
        status: 'Final',
        dimensions: dimensions.map((name) => {
          const dimension = draft.builderDimensions.find(
            (item) => item.name === name,
          );
          return {
            id: dimension?.code ?? name,
            name,
            score: illustrativeScore,
            previous: 0,
            findings: assignmentIndicators.filter((indicator) => {
              const value = answers[indicator.id]?.value;
              return (
                indicator.dimension === name &&
                (value === '1' || value === '2' || value === 'Tidak')
              );
            }).length,
          };
        }),
      });
    }

    const lowIndicators = assignmentIndicators.filter((indicator) => {
      const value = answers[indicator.id]?.value;
      return value === '1' || value === '2' || value === 'Tidak';
    });
    for (const [index, indicator] of lowIndicators.entries()) {
      const recommendationId = `REC-${assignmentId}-${index + 1}`;
      if (draft.recommendations.some((item) => item.id === recommendationId)) {
        continue;
      }
      const answer = answers[indicator.id];
      const area = draft.areas.find((item) => item.id === answer?.areaId);
      const building = draft.buildings.find(
        (item) => item.id === area?.buildingId,
      );
      const priority: RiskLevel =
        answer?.value === '1' || answer?.value === 'Tidak'
          ? 'Tinggi'
          : 'Sedang';
      draft.recommendations.unshift({
        id: recommendationId,
        priority,
        title: `Tindak lanjut ${indicator.title}`,
        location: area ? `${area.name} · ${area.zone}` : target.institution,
        source: `${indicator.code} · ${assignmentId}`,
        action: `Tinjau temuan ${indicator.title.toLowerCase()} dan dokumentasikan perbaikannya.`,
        status: 'Belum ditindaklanjuti',
        owner: 'Belum ditentukan',
        dueDate: 'Belum ditentukan',
        progress: 0,
      });

      if (area && building) {
        const riskId = `RSK-${assignmentId}-${index + 1}`;
        const finding: RiskFinding = {
          id: riskId,
          areaId: area.id,
          buildingId: building.id,
          assessmentId: assignmentId,
          instrumentVersion: target.version,
          recommendationId,
          location: area.name,
          building: building.name,
          zone: area.zone,
          floor: area.floor,
          x: answer?.planPoint?.x ?? area.x,
          y: answer?.planPoint?.y ?? area.y,
          level: priority,
          issue: answer?.note || `Temuan pada ${indicator.title}.`,
          indicator: indicator.code,
          recommendation: `Tinjau dan dokumentasikan perbaikan ${indicator.title.toLowerCase()}.`,
          status: 'Belum ditindaklanjuti',
          hazard:
            answer?.note ||
            `Kondisi ${indicator.title.toLowerCase()} perlu diperbaiki.`,
          impact:
            'Dampak masih berupa ilustrasi prototipe dan perlu validasi ilmiah.',
          likelihood: 'Belum ditetapkan · ilustrasi',
          severity: 'Belum ditetapkan · ilustrasi',
          exposedPeople: 'Belum dicatat',
          existingControl: 'Belum dicatat',
          evidence: answer?.evidenceName ?? '',
          observedAt: 'Baru saja · Ahmad Fauzan',
          planVersion:
            building.floors.find((floor) => floor.name === area.floor)
              ?.planVersion || 'Belum ada denah',
          residualRisk: 'Belum dinilai',
        };
        draft.riskFindings.unshift(finding);
      }
    }

    addAudit(
      draft,
      'Mengunci assessment final',
      assignmentId,
      'Assessment',
      'Ahmad Fauzan',
    );
    addNotification(
      draft,
      'pengelola',
      'Hasil assessment baru tersedia',
      `${assignmentId} sudah final. Nilai yang tampil masih simulasi prototipe.`,
      '/pengelola/hasil',
    );
  });

  return { ok: true, data: illustrativeScore };
}

function updateRecommendation(
  id: string,
  input: {
    owner: string;
    dueDate: string;
    progress?: number;
    status?: RecommendationStatus;
    note?: string;
    evidenceName?: string;
  },
): ActionResult<string> {
  initialize();
  const recommendation = browserSnapshot.recommendations.find(
    (candidate) => candidate.id === id,
  );
  if (!recommendation) {
    return { ok: false, message: 'Rekomendasi tidak ditemukan.' };
  }

  mutate((draft) => {
    const target = draft.recommendations.find(
      (candidate) => candidate.id === id,
    )!;
    target.owner = input.owner;
    target.dueDate = input.dueDate;
    target.progress = input.progress ?? Math.max(target.progress, 10);
    target.status = input.status ?? 'Berjalan';
    if (input.note !== undefined) target.lastNote = input.note;
    if (input.evidenceName !== undefined) {
      target.completionEvidence = input.evidenceName;
    }
    const finding = draft.riskFindings.find(
      (candidate) => candidate.recommendationId === id,
    );
    if (finding) finding.status = target.status;
    addAudit(
      draft,
      'Memperbarui tindak lanjut',
      id,
      'Tindak Lanjut',
      'Ust. M. Kamal',
    );
    addNotification(
      draft,
      'pengelola',
      'Tindak lanjut diperbarui',
      `${id} kini berstatus ${target.status}.`,
      '/pengelola/tindak-lanjut',
    );
  });
  return { ok: true, data: id };
}

function markNotificationRead(id: string) {
  mutate((draft) => {
    const notification = draft.notifications.find((item) => item.id === id);
    if (notification) notification.read = true;
  });
}

function updateSettings(input: MockDomainState['settings']) {
  mutate((draft) => {
    draft.settings = input;
    addAudit(
      draft,
      'Memperbarui pengaturan sistem',
      'Preferensi operasional prototipe',
      'Pengaturan',
    );
  });
}

function resetMockData() {
  initialized = true;
  emit(createInitialMockState());
}

export const mockStoreActions = {
  addUser,
  addInstitution,
  createInstrumentVersion,
  completeValidationItem,
  saveBuilderDimensions,
  saveScoring,
  publishInstrumentVersion,
  addBuilding,
  updateFloorPlan,
  addFloor,
  addArea,
  updateAssessmentAnswer,
  setAssessmentActiveIndex,
  updateEvidence,
  saveAssessmentDraft,
  finalizeAssessment,
  updateRecommendation,
  markNotificationRead,
  updateSettings,
  resetMockData,
} satisfies MockRepository;

export function useMockStore<T>(selector: (state: MockDomainState) => T): T {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot,
  );
  return selector(state);
}

export function getMockStateForTest() {
  return browserSnapshot;
}

export type { ActionResult, AreaRecord, BuildingRecord, FloorRecord };
