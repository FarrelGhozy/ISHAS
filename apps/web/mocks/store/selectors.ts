import type { Assignment, AnswerState } from '@/mocks/seed/asesor';
import type { RecommendationStatus, RiskLevel } from '@/mocks/seed/pengelola';
import type { MockDomainState } from '@/mocks/store/state';
import { calculateAssessmentCompleteness } from '@/mocks/processors/assessment';

export type AssessmentLocationOption = {
  id: string;
  label: string;
  plan: string;
};

export type RiskWorkspaceFilters = {
  assessmentId: string;
  buildingId: string;
  floor: string;
  riskLevel: RiskLevel | 'Semua risiko';
  workStatus: RecommendationStatus | 'Semua status';
};

export function selectPublishedInstrumentVersions(state: MockDomainState) {
  return state.instrumentVersions.filter(
    (version) => version.status === 'Published',
  );
}

export function selectAssignmentById(
  state: MockDomainState,
  assignmentId: string,
) {
  return state.assignments.find((assignment) => assignment.id === assignmentId);
}

export function selectIndicatorsForAssignment(
  state: MockDomainState,
  assignment: Assignment,
) {
  return (
    state.indicatorsByVersion[assignment.instrumentVersionId] ??
    state.indicators
  );
}

export function selectAssessmentLocations(
  state: MockDomainState,
  assignment: Assignment,
): AssessmentLocationOption[] {
  const buildings = state.buildings.filter(
    (building) => building.institutionCode === assignment.institutionCode,
  );
  const buildingIds = new Set(buildings.map((building) => building.id));

  return state.areas
    .filter(
      (area) =>
        area.institutionCode === assignment.institutionCode &&
        buildingIds.has(area.buildingId),
    )
    .map((area) => {
      const building = buildings.find((item) => item.id === area.buildingId);
      const floor = building?.floors.find((item) => item.name === area.floor);
      return {
        id: area.id,
        label: `${building?.name ?? 'Gedung'} · ${area.floor} · ${area.name}`,
        plan: floor?.planVersion ?? '',
      };
    });
}

export function selectAssessmentCompleteness(
  state: MockDomainState,
  assignmentId: string,
) {
  const assignment = selectAssignmentById(state, assignmentId);
  const indicators = assignment
    ? selectIndicatorsForAssignment(state, assignment)
    : state.indicators;

  return calculateAssessmentCompleteness(
    indicators,
    state.assessmentAnswers[assignmentId] ?? {},
  );
}

export function selectAnswers(
  state: MockDomainState,
  assignmentId: string,
): Record<string, AnswerState> {
  return state.assessmentAnswers[assignmentId] ?? {};
}

export function selectRiskWorkspaceData(
  state: MockDomainState,
  filters: RiskWorkspaceFilters,
) {
  const findings = state.riskFindings.filter(
    (finding) =>
      (filters.assessmentId === 'Semua periode' ||
        finding.assessmentId === filters.assessmentId) &&
      (filters.buildingId === 'Semua gedung' ||
        finding.buildingId === filters.buildingId) &&
      (filters.floor === 'Semua lantai' || finding.floor === filters.floor) &&
      (filters.riskLevel === 'Semua risiko' ||
        finding.level === filters.riskLevel) &&
      (filters.workStatus === 'Semua status' ||
        finding.status === filters.workStatus),
  );
  const filteredAreaIds = new Set(findings.map((finding) => finding.areaId));
  const findingFilterActive =
    filters.assessmentId !== 'Semua periode' ||
    filters.riskLevel !== 'Semua risiko' ||
    filters.workStatus !== 'Semua status';
  const areas = state.areas.filter(
    (area) =>
      (filters.buildingId === 'Semua gedung' ||
        area.buildingId === filters.buildingId) &&
      (filters.floor === 'Semua lantai' || area.floor === filters.floor) &&
      (!findingFilterActive || filteredAreaIds.has(area.id)),
  );

  return { findings, areas };
}

export function validateSeedRelations(state: MockDomainState): string[] {
  const issues: string[] = [];
  const institutionCodes = new Set(
    state.institutions.map((institution) => institution.code),
  );
  const instrumentVersionIds = new Set(
    state.instrumentVersions.map((version) => version.id),
  );
  const buildingIds = new Set(state.buildings.map((building) => building.id));
  const areaIds = new Set(state.areas.map((area) => area.id));
  const recommendationIds = new Set(
    state.recommendations.map((recommendation) => recommendation.id),
  );

  for (const versionId of Object.keys(state.indicatorsByVersion)) {
    if (!instrumentVersionIds.has(versionId)) {
      issues.push(
        `Konfigurasi indikator mengarah ke versi instrumen ${versionId} yang tidak tersedia.`,
      );
    }
  }

  for (const assignment of state.assignments) {
    if (!institutionCodes.has(assignment.institutionCode)) {
      issues.push(
        `Penugasan ${assignment.id} mengarah ke institution yang tidak tersedia.`,
      );
    }
    if (!instrumentVersionIds.has(assignment.instrumentVersionId)) {
      issues.push(
        `Penugasan ${assignment.id} mengarah ke versi instrumen yang tidak tersedia.`,
      );
    }
  }

  for (const building of state.buildings) {
    if (!institutionCodes.has(building.institutionCode)) {
      issues.push(
        `Gedung ${building.id} mengarah ke institution yang tidak tersedia.`,
      );
    }
  }

  for (const area of state.areas) {
    if (!institutionCodes.has(area.institutionCode)) {
      issues.push(
        `Area ${area.id} mengarah ke institution yang tidak tersedia.`,
      );
    }
    if (!buildingIds.has(area.buildingId)) {
      issues.push(`Area ${area.id} mengarah ke gedung yang tidak tersedia.`);
    }
  }

  for (const finding of state.riskFindings) {
    if (!areaIds.has(finding.areaId)) {
      issues.push(`Temuan ${finding.id} mengarah ke area yang tidak tersedia.`);
    }
    if (!recommendationIds.has(finding.recommendationId)) {
      issues.push(
        `Temuan ${finding.id} mengarah ke rekomendasi yang tidak tersedia.`,
      );
    }
  }

  return issues;
}
