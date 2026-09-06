/**
 * Kontrak frontend ISHAS untuk mengganti data dummy dengan adapter API.
 * Nilai ilmiah yang belum disahkan selalu nullable atau berbentuk konfigurasi,
 * sehingga frontend tidak menetapkan rumus, bobot, atau threshold sendiri.
 */

export type EntityId = string;
export type IsoDateTime = string;
export type RoleId = 'admin' | 'peneliti' | 'asesor' | 'pengelola';
export type InstrumentStatus = 'draft' | 'published' | 'archived';
export type AssessmentStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'returned'
  | 'finalized';
export type RiskLevel = 'high' | 'medium' | 'low';
export type FollowUpStatus =
  | 'open'
  | 'in_progress'
  | 'awaiting_verification'
  | 'verified'
  | 'rejected';
export type AssessmentInputSourceType =
  | 'questionnaire'
  | 'field_observation'
  | 'supporting_document'
  | 'incident_record'
  | 'sensor';
export type LocationRequirement =
  | 'none'
  | 'area_required'
  | 'point_optional'
  | 'point_required';

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'LOCKED'
  | 'UPLOAD_FAILED'
  | 'INTERNAL_ERROR';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};

export type ApiResult<T> =
  | { ok: true; data: T; requestId?: string }
  | { ok: false; error: ApiError };

export type PageRequest = {
  page: number;
  pageSize: number;
  query?: string;
  sort?: string;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type SessionUser = {
  id: EntityId;
  name: string;
  email: string;
  role: RoleId;
  institutionIds: EntityId[];
  regionIds: EntityId[];
  permissions: string[];
};

export type Session = {
  user: SessionUser;
  expiresAt: IsoDateTime;
};

export type SignInCommand = {
  email: string;
  password: string;
};

export type UserRecord = {
  id: EntityId;
  name: string;
  email: string;
  role: RoleId;
  status: 'active' | 'pending' | 'inactive';
  institutionIds: EntityId[];
  regionIds: EntityId[];
  lastActiveAt: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type Institution = {
  id: EntityId;
  code: string;
  officialName: string;
  address: string;
  city: string;
  province: string;
  managerUserId: EntityId | null;
  onboardingStatus: 'preparation' | 'verified' | 'inactive';
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type Permission = {
  id: EntityId;
  code: string;
  module: string;
  action: string;
  description: string;
};

export type RolePermission = {
  role: RoleId;
  permissionIds: EntityId[];
  updatedAt: IsoDateTime;
  updatedBy: EntityId;
};

export type SystemSettings = {
  applicationName: string;
  timezone: string;
  sessionDurationMinutes: number;
  maintenanceMode: boolean;
  accountNotificationEnabled: boolean;
  updatedAt: IsoDateTime;
  updatedBy: EntityId;
};

export type InstrumentRecord = {
  id: EntityId;
  code: string;
  name: string;
  description: string | null;
  activeVersionId: EntityId | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type AnswerType =
  | 'likert'
  | 'boolean'
  | 'number'
  | 'single_choice'
  | 'multiple_choice'
  | 'text';

export type AnswerOption = {
  id: EntityId;
  value: string;
  label: string;
  description: string | null;
  order: number;
  score: number | null;
};

export type EvidenceRequirement = {
  required: boolean;
  acceptedMimeTypes: string[];
  maxFiles: number;
  maxFileSizeBytes: number;
  instruction: string | null;
};

export type RecommendationRule = {
  id: EntityId;
  conditionType: 'answer_equals' | 'score_lte' | 'score_gte' | 'risk_level';
  conditionValue: string | number;
  recommendationText: string;
  priority: RiskLevel | null;
};

export type Indicator = {
  id: EntityId;
  dimensionId: EntityId;
  code: string;
  title: string;
  prompt: string;
  answerType: AnswerType;
  answerOptions: AnswerOption[];
  required: boolean;
  allowNotApplicable: boolean;
  weight: number | null;
  reverseScoring: boolean | null;
  scoringRule: Record<string, unknown> | null;
  evidenceRequirement: EvidenceRequirement;
  reference: string | null;
  locationRequirement: LocationRequirement;
  recommendationRules: RecommendationRule[];
  order: number;
};

export type InstrumentDimension = {
  id: EntityId;
  instrumentVersionId: EntityId;
  code: string;
  name: string;
  description: string | null;
  reference: string | null;
  weight: number | null;
  order: number;
  indicators: Indicator[];
};

export type InstrumentVersion = {
  id: EntityId;
  instrumentId: EntityId;
  code: string;
  name: string;
  status: InstrumentStatus;
  parentVersionId: EntityId | null;
  changeNote: string;
  sourceNote: string | null;
  dimensions: InstrumentDimension[];
  riskCategories: RiskCategory[];
  scoringConfigHash: string | null;
  effectiveAt: IsoDateTime | null;
  publishedAt: IsoDateTime | null;
  publishedBy: EntityId | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type RiskCategory = {
  id: EntityId;
  code: string;
  label: string;
  level: RiskLevel;
  minimumScore: number | null;
  maximumScore: number | null;
  description: string | null;
};

export type AssessmentAssignment = {
  id: EntityId;
  institutionId: EntityId;
  assessorUserId: EntityId;
  instrumentVersionId: EntityId;
  period: string;
  scheduledAt: IsoDateTime;
  status: 'scheduled' | 'started' | 'completed' | 'cancelled';
  fieldContactName: string;
  fieldContactPhone: string | null;
  note: string | null;
};

export type AssessmentAnswer = {
  id: EntityId;
  assessmentId: EntityId;
  indicatorId: EntityId;
  rawValue: string | number | boolean | string[] | null;
  normalizedValue: number | null;
  score: number | null;
  notApplicable: boolean;
  note: string | null;
  areaId: EntityId | null;
  floorPlanId: EntityId | null;
  floorPlanVersion: number | null;
  relativeX: number | null;
  relativeY: number | null;
  evidenceFiles: EvidenceFile[];
  answeredAt: IsoDateTime | null;
  answeredBy: EntityId | null;
};

export type EvidenceFile = {
  id: EntityId;
  assessmentId: EntityId;
  answerId: EntityId | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  downloadUrl: string | null;
  uploadedBy: EntityId;
  uploadedAt: IsoDateTime;
  verificationStatus: 'pending' | 'accepted' | 'rejected';
};

export type AssessmentInputSource = {
  id: EntityId;
  assessmentId: EntityId;
  type: AssessmentInputSourceType;
  title: string;
  description: string | null;
  observedAt: IsoDateTime | null;
  occurredAt: IsoDateTime | null;
  payload: Record<string, unknown>;
  evidenceFileIds: EntityId[];
  createdBy: EntityId;
  createdAt: IsoDateTime;
};

export type Assessment = {
  id: EntityId;
  assignmentId: EntityId;
  institutionId: EntityId;
  assessorUserId: EntityId;
  instrumentVersionId: EntityId;
  period: string;
  status: AssessmentStatus;
  answers: AssessmentAnswer[];
  progressPercent: number;
  startedAt: IsoDateTime | null;
  submittedAt: IsoDateTime | null;
  finalizedAt: IsoDateTime | null;
  finalizedBy: EntityId | null;
  revisionReason: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type DimensionResult = {
  dimensionId: EntityId;
  label: string;
  score: number | null;
  riskCategoryId: EntityId | null;
  answeredIndicators: number;
  totalIndicators: number;
};

export type AssessmentResult = {
  id: EntityId;
  assessmentId: EntityId;
  instrumentVersionId: EntityId;
  institutionId: EntityId;
  overallScore: number | null;
  riskCategoryId: EntityId | null;
  dimensionResults: DimensionResult[];
  scoringEngineVersion: string | null;
  scoringConfigHash: string | null;
  calculatedAt: IsoDateTime | null;
};

export type InstitutionBuilding = {
  id: EntityId;
  institutionId: EntityId;
  code: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type InstitutionFloor = {
  id: EntityId;
  buildingId: EntityId;
  name: string;
  order: number;
  activeFloorPlanId: EntityId | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type InstitutionArea = {
  id: EntityId;
  institutionId: EntityId;
  buildingId: EntityId;
  floorId: EntityId;
  name: string;
  zone: string;
  floorPlanId: EntityId | null;
  relativeX: number | null;
  relativeY: number | null;
  relativeWidth: number | null;
  relativeHeight: number | null;
  status: 'active' | 'inactive';
};

export type FloorPlan = {
  id: EntityId;
  institutionId: EntityId;
  buildingId: EntityId;
  floorId: EntityId;
  name: string;
  version: number;
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  status: 'processing' | 'ready' | 'archived' | 'failed';
  uploadedBy: EntityId;
  uploadedAt: IsoDateTime;
  verifiedBy: EntityId | null;
  verifiedAt: IsoDateTime | null;
  updatedAt: IsoDateTime;
};

export type RiskObservation = {
  id: EntityId;
  assessmentId: EntityId;
  indicatorId: EntityId | null;
  areaId: EntityId;
  floorPlanId: EntityId | null;
  floorPlanVersion: number | null;
  relativeX: number | null;
  relativeY: number | null;
  riskCategoryId: EntityId | null;
  level: RiskLevel | null;
  hazard: string;
  possibleImpact: string;
  likelihoodValue: number | null;
  severityValue: number | null;
  exposureNote: string | null;
  existingControl: string | null;
  residualRiskCategoryId: EntityId | null;
  note: string | null;
  evidenceFileIds: EntityId[];
  observedBy: EntityId;
  observedAt: IsoDateTime;
};

export type Recommendation = {
  id: EntityId;
  assessmentResultId: EntityId;
  riskObservationId: EntityId | null;
  indicatorId: EntityId | null;
  priority: RiskLevel | null;
  title: string;
  description: string;
  status: 'open' | 'converted_to_follow_up' | 'closed';
  generatedByRuleId: EntityId | null;
};

export type FollowUp = {
  id: EntityId;
  recommendationId: EntityId;
  institutionId: EntityId;
  ownerUserId: EntityId;
  status: FollowUpStatus;
  dueAt: IsoDateTime | null;
  progressPercent: number;
  note: string | null;
  evidenceFiles: EvidenceFile[];
  submittedForVerificationAt: IsoDateTime | null;
  verifiedAt: IsoDateTime | null;
  verifiedBy: EntityId | null;
  verificationNote: string | null;
};

export type ReportRecord = {
  id: EntityId;
  institutionId: EntityId;
  assessmentId: EntityId;
  assessmentResultId: EntityId;
  instrumentVersionId: EntityId;
  format: 'pdf' | 'xlsx';
  status: 'queued' | 'processing' | 'ready' | 'failed';
  downloadUrl: string | null;
  generatedAt: IsoDateTime | null;
  generatedBy: EntityId;
};

export type AuditEvent = {
  id: EntityId;
  actorUserId: EntityId;
  action: string;
  entityType: string;
  entityId: EntityId;
  reason: string | null;
  previousValue: Record<string, unknown> | null;
  nextValue: Record<string, unknown> | null;
  occurredAt: IsoDateTime;
  requestId: string | null;
};

export type NotificationRecord = {
  id: EntityId;
  userId: EntityId;
  title: string;
  message: string;
  targetPath: string | null;
  readAt: IsoDateTime | null;
  createdAt: IsoDateTime;
};

export type ResearchDataset = {
  id: EntityId;
  institutionId: EntityId;
  assessmentId: EntityId;
  instrumentVersionId: EntityId;
  verificationStatus: 'unverified' | 'verified' | 'excluded';
  answerCount: number;
  evidenceCount: number;
  collectedAt: IsoDateTime;
  verifiedAt: IsoDateTime | null;
  verifiedBy: EntityId | null;
};

export type ImportJob = {
  id: EntityId;
  fileName: string;
  format: 'csv' | 'xlsx';
  status: 'validating' | 'ready' | 'importing' | 'completed' | 'failed';
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errorReportUrl: string | null;
  createdBy: EntityId;
  createdAt: IsoDateTime;
};

export type ExportJob = {
  id: EntityId;
  kind: 'research_dataset' | 'audit_events';
  format: 'csv' | 'xlsx';
  status: 'queued' | 'processing' | 'ready' | 'failed';
  filters: Record<string, string | number | boolean>;
  downloadUrl: string | null;
  generatedAt: IsoDateTime | null;
  generatedBy: EntityId;
};

export interface IshasApi {
  signIn(command: SignInCommand): Promise<ApiResult<Session>>;
  signOut(): Promise<ApiResult<null>>;
  getSession(): Promise<ApiResult<Session>>;

  listUsers(request: PageRequest): Promise<ApiResult<PageResult<UserRecord>>>;
  getUser(id: EntityId): Promise<ApiResult<UserRecord>>;
  createUser(
    input: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>,
  ): Promise<ApiResult<UserRecord>>;
  updateUser(
    id: EntityId,
    input: Partial<Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ApiResult<UserRecord>>;
  listInstitutions(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<Institution>>>;
  createInstitution(
    input: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResult<Institution>>;
  getInstitution(id: EntityId): Promise<ApiResult<Institution>>;
  updateInstitution(
    id: EntityId,
    input: Partial<Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ApiResult<Institution>>;
  listPermissions(): Promise<ApiResult<Permission[]>>;
  listRolePermissions(): Promise<ApiResult<RolePermission[]>>;
  updateRolePermissions(
    role: RoleId,
    permissionIds: EntityId[],
  ): Promise<ApiResult<RolePermission>>;
  getSystemSettings(): Promise<ApiResult<SystemSettings>>;
  updateSystemSettings(
    input: Partial<Omit<SystemSettings, 'updatedAt' | 'updatedBy'>>,
  ): Promise<ApiResult<SystemSettings>>;

  listInstruments(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<InstrumentRecord>>>;
  createInstrument(
    input: Pick<InstrumentRecord, 'code' | 'name' | 'description'>,
  ): Promise<ApiResult<InstrumentRecord>>;
  listInstrumentVersions(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<InstrumentVersion>>>;
  getInstrumentVersion(id: EntityId): Promise<ApiResult<InstrumentVersion>>;
  createInstrumentVersion(
    parentVersionId: EntityId | null,
    changeNote: string,
  ): Promise<ApiResult<InstrumentVersion>>;
  saveInstrumentDraft(
    version: InstrumentVersion,
  ): Promise<ApiResult<InstrumentVersion>>;
  validateInstrumentVersion(
    id: EntityId,
  ): Promise<ApiResult<{ valid: boolean; errors: ApiError[] }>>;
  publishInstrumentVersion(id: EntityId): Promise<ApiResult<InstrumentVersion>>;
  archiveInstrumentVersion(id: EntityId): Promise<ApiResult<InstrumentVersion>>;
  listResearchDatasets(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<ResearchDataset>>>;
  verifyResearchDataset(
    id: EntityId,
    status: ResearchDataset['verificationStatus'],
  ): Promise<ApiResult<ResearchDataset>>;
  createDatasetImport(file: File): Promise<ApiResult<ImportJob>>;
  getDatasetImport(id: EntityId): Promise<ApiResult<ImportJob>>;
  commitDatasetImport(id: EntityId): Promise<ApiResult<ImportJob>>;
  exportResearchDatasets(
    format: 'csv' | 'xlsx',
    request: PageRequest,
  ): Promise<ApiResult<ExportJob>>;

  listAssignments(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<AssessmentAssignment>>>;
  startAssessment(assignmentId: EntityId): Promise<ApiResult<Assessment>>;
  getAssessment(id: EntityId): Promise<ApiResult<Assessment>>;
  listAssessments(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<Assessment>>>;
  saveAssessmentDraft(
    id: EntityId,
    answers: AssessmentAnswer[],
  ): Promise<ApiResult<Assessment>>;
  uploadEvidence(
    assessmentId: EntityId,
    indicatorId: EntityId,
    file: File,
  ): Promise<ApiResult<EvidenceFile>>;
  deleteEvidence(id: EntityId): Promise<ApiResult<null>>;
  listAssessmentInputSources(
    assessmentId: EntityId,
  ): Promise<ApiResult<AssessmentInputSource[]>>;
  createAssessmentInputSource(
    assessmentId: EntityId,
    input: Omit<
      AssessmentInputSource,
      'id' | 'assessmentId' | 'createdBy' | 'createdAt'
    >,
  ): Promise<ApiResult<AssessmentInputSource>>;
  validateAssessment(
    id: EntityId,
  ): Promise<ApiResult<{ valid: boolean; errors: ApiError[] }>>;
  submitAssessment(id: EntityId): Promise<ApiResult<Assessment>>;
  finalizeAssessment(id: EntityId): Promise<ApiResult<Assessment>>;

  getAssessmentResult(
    assessmentId: EntityId,
  ): Promise<ApiResult<AssessmentResult>>;
  listRiskObservations(
    assessmentId: EntityId,
  ): Promise<ApiResult<RiskObservation[]>>;
  createRiskObservation(
    assessmentId: EntityId,
    input: Omit<
      RiskObservation,
      | 'id'
      | 'assessmentId'
      | 'riskCategoryId'
      | 'level'
      | 'residualRiskCategoryId'
      | 'observedBy'
      | 'observedAt'
    >,
  ): Promise<ApiResult<RiskObservation>>;
  listInstitutionAreas(
    institutionId: EntityId,
  ): Promise<ApiResult<InstitutionArea[]>>;
  listInstitutionBuildings(
    institutionId: EntityId,
  ): Promise<ApiResult<InstitutionBuilding[]>>;
  createInstitutionBuilding(
    institutionId: EntityId,
    input: Pick<InstitutionBuilding, 'code' | 'name' | 'description'>,
  ): Promise<ApiResult<InstitutionBuilding>>;
  updateInstitutionBuilding(
    id: EntityId,
    input: Partial<
      Pick<InstitutionBuilding, 'code' | 'name' | 'description' | 'status'>
    >,
  ): Promise<ApiResult<InstitutionBuilding>>;
  listBuildingFloors(
    buildingId: EntityId,
  ): Promise<ApiResult<InstitutionFloor[]>>;
  createBuildingFloor(
    buildingId: EntityId,
    input: Pick<InstitutionFloor, 'name' | 'order'>,
  ): Promise<ApiResult<InstitutionFloor>>;
  updateBuildingFloor(
    id: EntityId,
    input: Partial<Pick<InstitutionFloor, 'name' | 'order'>>,
  ): Promise<ApiResult<InstitutionFloor>>;
  listFloorAreas(floorId: EntityId): Promise<ApiResult<InstitutionArea[]>>;
  createInstitutionArea(
    floorId: EntityId,
    input: Pick<
      InstitutionArea,
      | 'name'
      | 'zone'
      | 'relativeX'
      | 'relativeY'
      | 'relativeWidth'
      | 'relativeHeight'
    >,
  ): Promise<ApiResult<InstitutionArea>>;
  updateInstitutionArea(
    id: EntityId,
    input: Partial<
      Pick<
        InstitutionArea,
        | 'name'
        | 'zone'
        | 'relativeX'
        | 'relativeY'
        | 'relativeWidth'
        | 'relativeHeight'
        | 'status'
      >
    >,
  ): Promise<ApiResult<InstitutionArea>>;
  listFloorPlans(institutionId: EntityId): Promise<ApiResult<FloorPlan[]>>;
  getFloorPlan(id: EntityId): Promise<ApiResult<FloorPlan>>;
  uploadFloorPlan(floorId: EntityId, file: File): Promise<ApiResult<FloorPlan>>;
  verifyFloorPlan(id: EntityId): Promise<ApiResult<FloorPlan>>;
  listRecommendations(
    assessmentResultId: EntityId,
  ): Promise<ApiResult<Recommendation[]>>;
  createFollowUp(
    recommendationId: EntityId,
    input: Omit<
      FollowUp,
      | 'id'
      | 'recommendationId'
      | 'evidenceFiles'
      | 'verifiedAt'
      | 'verifiedBy'
      | 'verificationNote'
    >,
  ): Promise<ApiResult<FollowUp>>;
  updateFollowUp(
    id: EntityId,
    input: Partial<FollowUp>,
  ): Promise<ApiResult<FollowUp>>;
  uploadFollowUpEvidence(
    id: EntityId,
    file: File,
  ): Promise<ApiResult<EvidenceFile>>;
  submitFollowUpForVerification(id: EntityId): Promise<ApiResult<FollowUp>>;
  verifyFollowUp(
    id: EntityId,
    decision: 'verified' | 'rejected',
    note: string,
  ): Promise<ApiResult<FollowUp>>;

  createReport(
    assessmentId: EntityId,
    format: ReportRecord['format'],
  ): Promise<ApiResult<ReportRecord>>;
  getReport(id: EntityId): Promise<ApiResult<ReportRecord>>;
  listAuditEvents(
    request: PageRequest,
  ): Promise<ApiResult<PageResult<AuditEvent>>>;
  exportAuditEvents(
    format: 'csv' | 'xlsx',
    request: PageRequest,
  ): Promise<ApiResult<ExportJob>>;
  listNotifications(): Promise<ApiResult<NotificationRecord[]>>;
  markNotificationRead(id: EntityId): Promise<ApiResult<NotificationRecord>>;
}
