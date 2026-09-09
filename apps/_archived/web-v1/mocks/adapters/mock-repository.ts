import type { AnswerState } from '@/mocks/seed/asesor';
import type { BuilderDimension, RubricOption } from '@/mocks/seed/peneliti';
import type { RecommendationStatus } from '@/mocks/seed/pengelola';
import type { MockDomainState } from '@/mocks/store/state';

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export type AddUserInput = {
  name: string;
  email: string;
  role: string;
  roleId: 'admin' | 'peneliti' | 'asesor' | 'pengelola';
  institution: string;
  institutionCodes: string[];
};

export type AddInstitutionInput = {
  name: string;
  location: string;
  manager: string;
};

export interface MockRepository {
  addUser(input: AddUserInput): ActionResult<string>;
  addInstitution(input: AddInstitutionInput): ActionResult<string>;
  createInstrumentVersion(input: {
    name: string;
    note: string;
  }): ActionResult<string>;
  completeValidationItem(id: string): void;
  saveBuilderDimensions(dimensions: BuilderDimension[]): void;
  saveScoring(input: { weights: number[]; rubrics: RubricOption[] }): void;
  publishInstrumentVersion(id: string): ActionResult<string>;
  addBuilding(input: {
    institutionCode: string;
    name: string;
    code: string;
  }): ActionResult<string>;
  updateFloorPlan(
    buildingId: string,
    floorId: string,
    fileName: string,
  ): ActionResult<string>;
  addFloor(buildingId: string, name: string): ActionResult<string>;
  addArea(input: {
    institutionCode: string;
    buildingId: string;
    floor: string;
    name: string;
    zone: string;
  }): ActionResult<string>;
  updateAssessmentAnswer(
    assignmentId: string,
    indicatorId: string,
    patch: Partial<AnswerState>,
  ): ActionResult<string>;
  setAssessmentActiveIndex(assignmentId: string, index: number): void;
  updateEvidence(id: string, fileName: string): ActionResult<string>;
  saveAssessmentDraft(assignmentId: string): ActionResult<number>;
  finalizeAssessment(assignmentId: string): ActionResult<number>;
  updateRecommendation(
    id: string,
    input: {
      owner: string;
      dueDate: string;
      progress?: number;
      status?: RecommendationStatus;
      note?: string;
      evidenceName?: string;
    },
  ): ActionResult<string>;
  markNotificationRead(id: string): void;
  updateSettings(input: MockDomainState['settings']): void;
  resetMockData(): void;
}
