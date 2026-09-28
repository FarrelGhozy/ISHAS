// Seed demo: mengimpor `SEED` mock (apps/web/mocks/seed/seed.ts) agar komposisi
// 1:1 dengan frontend, lalu memetakan ke tabel MySQL. Lihat BACKEND_DATA_MODEL §10.

import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED } from "../../../web/mocks/seed/seed";
import { K3_CATEGORIES } from "../../../web/mocks/kategori-k3";
import { STORAGE_DIR } from "../storage";
import { hashPassword } from "../auth/password";
import { seedDefaultPassword } from "../config";
import { insertRows, json, text, toDateOnly, toDateTime, truncateAll, type SqlValue } from "./helpers";

const now = (): Date => new Date();
const campusAssetId = (planId: string): string => `campus-asset-${planId.toLowerCase()}`;
const campusStoredPath = (planId: string): string => `campus-plans/${planId.toLowerCase()}.png`;
const baseName = (path: string): string => path.split("/").pop() ?? path;
const bundledCampusImage = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "web",
  "public",
  "images",
  "risk-map-campus-v1.png",
);

// Salin ilustrasi denah bundel ke storage agar `GET /api/v1/files/:assetId`
// dapat menyajikannya (paritas tampilan demo mock ↔ backend).
async function seedCampusBlobs(): Promise<void> {
  const seen = new Set<string>();
  for (const plan of SEED.campusPlans) {
    const stored = campusStoredPath(plan.id);
    if (seen.has(stored)) continue;
    seen.add(stored);
    const target = join(STORAGE_DIR, stored);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(bundledCampusImage, target).catch(() => undefined);
  }
}

export async function seedDemo(): Promise<void> {
  await truncateAll();

  await insertRows(
    "institutions",
    ["code", "name", "city", "address", "manager", "status", "active_campus_plan_id"],
    SEED.institutions.map((i) => [
      i.code,
      i.name,
      i.location,
      i.address ?? "",
      i.manager,
      i.status,
      i.activeCampusPlanVersionId ?? null,
    ]),
  );

  // Fase 6: setiap akun demo dapat sandi awal prototipe (dokumentasi di
  // BACKEND_DATA_MODEL §10); wajib diganti lewat /auth/password.
  const passwordHash = await hashPassword(seedDefaultPassword);
  await insertRows(
    "users",
    ["id", "name", "email", "role", "institution_code", "status", "last_active_at", "password_hash"],
    SEED.users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.roleId,
      u.institutionCodes[0] ?? null,
      u.status,
      toDateTime(u.lastActive),
      passwordHash,
    ]),
  );

  await insertRows(
    "k3_categories",
    ["id", "name", "sort_order"],
    K3_CATEGORIES.map((c, index) => [c.id, c.name, index + 1]),
  );
  await insertRows(
    "k3_aspects",
    ["id", "category_id", "name", "sort_order"],
    K3_CATEGORIES.flatMap((c) => c.aspects.map((a, index) => [a.id, a.categoryId, a.name, index + 1])),
  );

  // file_assets: denah (satu per campus plan, id disintesis unik + blob disalin
  // ke storage) + dokumen indikator (metadata; blob disiapkan saat migrasi).
  await seedCampusBlobs();
  const campusAssetRows: SqlValue[][] = SEED.campusPlans.map((plan) => [
    campusAssetId(plan.id),
    "campus-plan",
    plan.institutionCode,
    plan.id,
    baseName(plan.assetId),
    campusStoredPath(plan.id),
    "image/png",
    0,
    plan.width,
    plan.height,
    "seed",
    "Public",
    plan.uploadedBy,
  ]);
  const docAssetRows: SqlValue[][] = SEED.instrumentDocs.map((doc) => [
    doc.assetId,
    "instrument-doc",
    null,
    doc.indicatorId,
    doc.fileName,
    `seed/instrument-docs/${doc.fileName}`,
    doc.mime,
    doc.fileSize,
    null,
    null,
    "seed",
    doc.visibility,
    "USR-002",
  ]);
  await insertRows(
    "file_assets",
    [
      "asset_id",
      "kind",
      "institution_code",
      "owner_ref",
      "original_name",
      "stored_path",
      "mime",
      "size_bytes",
      "width",
      "height",
      "sha256",
      "visibility",
      "uploaded_by",
    ],
    [...campusAssetRows, ...docAssetRows],
  );

  await insertRows("instrument_meta", ["id", "label", "checksum"], [
    ["INS-LIVE", SEED.instrument.label, SEED.instrument.checksum],
  ]);

  const bankDimRows: SqlValue[][] = [];
  const bankIndRows: SqlValue[][] = [];
  const bankOptRows: SqlValue[][] = [];
  SEED.instrument.dimensions.forEach((dim, di) => {
    bankDimRows.push([dim.id, dim.name, dim.categoryId ?? null, json(dim.aspects), di + 1]);
    dim.indicators.forEach((ind, ii) => {
      bankIndRows.push([
        ind.id,
        dim.id,
        ind.code,
        ind.title,
        ind.prompt,
        ind.answerType,
        ind.required,
        ind.evidenceRequired,
        ind.locationRequired,
        ind.weight,
        ind.categoryId ?? null,
        ind.aspectId ?? null,
        ii + 1,
      ]);
      ind.options.forEach((opt, oi) => {
        bankOptRows.push([ind.id, opt.value, opt.label, opt.weight, opt.isFinding, oi + 1]);
      });
    });
  });
  await insertRows(
    "bank_dimensions",
    ["id", "name", "category_id", "aspects", "sort_order"],
    bankDimRows,
  );
  await insertRows(
    "bank_indicators",
    [
      "id",
      "dimension_id",
      "code",
      "title",
      "prompt",
      "answer_type",
      "is_required",
      "evidence_required",
      "location_required",
      "weight",
      "category_id",
      "aspect_id",
      "sort_order",
    ],
    bankIndRows,
  );
  await insertRows(
    "bank_options",
    ["indicator_id", "value", "label", "weight", "is_finding", "sort_order"],
    bankOptRows,
  );

  await insertRows(
    "instrument_versions",
    ["id", "label", "status", "published_at"],
    SEED.instrumentVersions.map((v) => [v.id, v.label, v.status, toDateTime(v.publishedAt)]),
  );
  const vDimRows: SqlValue[][] = [];
  const vIndRows: SqlValue[][] = [];
  SEED.instrumentVersions.forEach((version) => {
    version.dimensions.forEach((dim, di) => {
      vDimRows.push([
        version.id,
        dim.id,
        dim.name,
        dim.categoryId ?? null,
        dim.description ?? null,
        json(dim.aspects),
        di + 1,
      ]);
      dim.indicators.forEach((ind, ii) => {
        vIndRows.push([
          version.id,
          dim.id,
          ind.id,
          ind.code,
          ind.title,
          ind.prompt,
          ind.categoryId ?? null,
          ind.aspectId ?? null,
          ind.answerType,
          ind.required,
          ind.evidenceRequired,
          ind.locationRequired,
          ind.findingTrigger ?? null,
          ii + 1,
        ]);
      });
    });
  });
  await insertRows(
    "instrument_version_dimensions",
    ["version_id", "id", "name", "category_id", "description", "aspects", "sort_order"],
    vDimRows,
  );
  await insertRows(
    "instrument_version_indicators",
    [
      "version_id",
      "dimension_id",
      "id",
      "code",
      "title",
      "prompt",
      "category_id",
      "aspect_id",
      "answer_type",
      "is_required",
      "evidence_required",
      "location_required",
      "finding_trigger",
      "sort_order",
    ],
    vIndRows,
  );

  await insertRows(
    "buildings",
    ["id", "institution_code", "code", "name", "floors"],
    SEED.buildings.map((b) => [b.id, b.institutionCode, b.code, b.name, json(b.floors)]),
  );
  await insertRows(
    "areas",
    [
      "id",
      "institution_code",
      "building_id",
      "floor",
      "name",
      "zone",
      "x",
      "y",
      "width",
      "height",
    ],
    SEED.areas.map((a) => [
      a.id,
      a.institutionCode,
      a.buildingId,
      a.floor,
      a.name,
      a.zone,
      a.x,
      a.y,
      a.width,
      a.height,
    ]),
  );
  await insertRows(
    "campus_plans",
    [
      "id",
      "institution_code",
      "revision",
      "asset_id",
      "width",
      "height",
      "uploaded_by",
      "uploaded_at",
      "illustration",
    ],
    SEED.campusPlans.map((plan) => [
      plan.id,
      plan.institutionCode,
      plan.revision,
      campusAssetId(plan.id),
      plan.width,
      plan.height,
      plan.uploadedBy,
      toDateTime(plan.uploadedAt) ?? now(),
      plan.illustration,
    ]),
  );

  await insertRows(
    "reports",
    [
      "id",
      "channel",
      "institution_code",
      "area_id",
      "manual_location",
      "reporter_name",
      "reporter_user_id",
      "reporter_account_email",
      "reporter_contact",
      "reporter_severity",
      "reporter_priority",
      "reporter_recommendation",
      "category_id",
      "aspect_id",
      "indicator_id",
      "title",
      "description",
      "evidence_asset_id",
      "evidence_name",
      "location_snapshot",
      "validation_status",
      "severity",
      "priority",
      "handling_status",
      "rejection_reason",
      "validation_note",
      "validated_by",
      "validated_by_name",
      "validated_by_role",
      "validated_at",
      "instrument_version_id",
      "instrument_checksum",
      "score_percent",
      "pdf_generated_at",
      "observed_at",
      "correction_of",
      "archived_at",
      "archived_reason",
      "client_request_id",
      "created_at",
      "submitted_at",
      "updated_at",
    ],
    SEED.reports.map((r) => {
      const created = toDateTime(r.createdAt) ?? now();
      return [
        r.id,
        r.channel,
        r.institutionCode,
        r.areaId ?? null,
        text(r.manualLocation),
        r.reporterName,
        r.reporterUserId ?? null,
        r.reporterAccountEmail ?? null,
        text(r.contact),
        r.reporterSeverity ?? "Belum ditentukan",
        r.reporterPriority ?? "Belum ditentukan",
        text(r.reporterRecommendation),
        r.categoryId ?? null,
        r.aspectId ?? null,
        r.indicatorId ?? null,
        r.title,
        r.description,
        r.evidenceAssetId ?? null,
        r.evidenceName ?? null,
        json(r.locationSnapshot),
        r.validationStatus,
        r.severity,
        r.priority,
        r.handlingStatus,
        text(r.rejectionReason),
        text(r.validationNote),
        r.validatedBy ?? null,
        r.validatedByName ?? null,
        r.validatedByRole ?? null,
        toDateTime(r.validatedAt),
        r.instrumentVersionId ?? null,
        r.instrumentChecksum ?? null,
        r.scorePercent ?? null,
        toDateTime(r.pdfGeneratedAt),
        toDateTime(r.observedAt),
        r.correctionOf ?? null,
        toDateTime(r.archivedAt),
        text(r.archivedReason),
        null,
        created,
        toDateTime(r.submittedAt) ?? created,
        toDateTime(r.updatedAt) ?? created,
      ];
    }),
  );

  await insertRows(
    "self_assessment_snapshots",
    [
      "report_id",
      "instrument_version_id",
      "instrument_checksum",
      "answers",
      "frozen_indicators",
      "score_percent",
      "by_dimension",
      "submitted_at",
    ],
    SEED.selfAssessmentSnapshots.map((s) => [
      s.reportId,
      s.instrumentVersionId,
      s.instrumentChecksum ?? "",
      json(s.answers),
      json(s.frozenIndicators ?? []),
      s.scorePercent ?? null,
      json(s.byDimension),
      toDateTime(s.submittedAt) ?? now(),
    ]),
  );

  await insertRows(
    "self_assessment_drafts",
    [
      "id",
      "institution_code",
      "reporter_user_id",
      "reporter_name",
      "contact",
      "instrument_version_id",
      "payload",
      "instrument_checksum",
      "submitted_report_id",
      "updated_at",
    ],
    Object.values(SEED.selfAssessmentDrafts).map((d) => [
      d.id,
      d.institutionCode,
      d.reporterUserId ?? null,
      d.reporterName,
      text(d.contact),
      d.instrumentVersionId,
      json({ answers: d.answers, activeIndex: d.activeIndex }),
      d.instrumentChecksum ?? "",
      d.submittedReportId ?? null,
      toDateTime(d.updatedAt) ?? now(),
    ]),
  );

  await insertRows(
    "findings",
    [
      "id",
      "report_id",
      "area_id",
      "building_id",
      "recommendation_id",
      "source_answer_id",
      "category_id",
      "aspect_id",
      "level",
      "status",
      "issue",
      "instrument_version",
      "location",
      "building",
      "zone",
      "floor",
      "x",
      "y",
      "indicator",
      "recommendation",
      "hazard",
      "impact",
      "likelihood",
      "severity_text",
      "exposed_people",
      "existing_control",
      "evidence",
      "location_snapshot",
      "observed_at",
      "plan_version",
      "residual_risk",
    ],
    SEED.findings.map((f) => [
      f.id,
      f.reportId,
      f.areaId || null,
      f.buildingId || null,
      f.recommendationId || null,
      f.sourceAnswerId ?? null,
      f.categoryId ?? null,
      f.aspectId ?? null,
      f.level,
      f.status,
      f.issue,
      f.instrumentVersion,
      f.location,
      f.building,
      f.zone,
      f.floor,
      f.x,
      f.y,
      f.indicator,
      f.recommendation,
      f.hazard,
      f.impact,
      f.likelihood,
      f.severityText,
      f.exposedPeople,
      f.existingControl,
      f.evidence,
      json(f.locationSnapshot),
      toDateTime(f.observedAt),
      f.planVersion,
      f.residualRisk,
    ]),
  );

  await insertRows(
    "recommendations",
    [
      "id",
      "report_id",
      "priority",
      "title",
      "location",
      "source",
      "action",
      "status",
      "owner",
      "due_date",
      "progress",
      "last_note",
      "completion_evidence",
      "completion_evidence_asset_id",
      "canceled_reason",
      "canceled_by",
      "canceled_at",
      "verified_by",
      "verified_at",
      "updated_at",
    ],
    SEED.recommendations.map((rec) => [
      rec.id,
      rec.reportId,
      rec.priority,
      rec.title,
      rec.location,
      rec.source,
      rec.action,
      rec.status,
      text(rec.owner),
      toDateOnly(rec.dueDate),
      rec.progress,
      text(rec.lastNote),
      text(rec.completionEvidence),
      rec.completionEvidenceAssetId ?? null,
      text(rec.canceledReason),
      rec.canceledBy ?? null,
      toDateTime(rec.canceledAt),
      rec.verifiedBy ?? null,
      toDateTime(rec.verifiedAt),
      toDateTime(rec.updatedAt) ?? now(),
    ]),
  );

  await insertRows(
    "instrument_docs",
    [
      "id",
      "indicator_id",
      "indicator_code",
      "indicator_title",
      "category_id",
      "aspect_id",
      "is_manual",
      "file_name",
      "file_size",
      "mime",
      "asset_id",
      "visibility",
      "updated_by",
      "updated_at",
    ],
    SEED.instrumentDocs.map((doc) => [
      doc.id,
      doc.indicatorId,
      doc.indicatorCode ?? null,
      doc.indicatorTitle ?? null,
      doc.categoryId ?? null,
      doc.aspectId ?? null,
      doc.manual ?? false,
      doc.fileName,
      doc.fileSize,
      doc.mime,
      doc.assetId,
      doc.visibility,
      doc.updatedBy ?? "USR-002",
      toDateTime(doc.updatedAt) ?? now(),
    ]),
  );

  await insertRows(
    "sam_categories",
    ["id", "name", "description", "sort_order", "is_active"],
    SEED.samCategories.map((c) => [c.id, c.name, c.description, c.sortOrder, c.isActive]),
  );
  await insertRows(
    "sam_questions",
    ["id", "category_id", "text", "panduan", "contoh_bukti", "sort_order", "is_active"],
    SEED.samQuestions.map((q) => [
      q.id,
      q.categoryId,
      q.text,
      q.panduan,
      q.contohBukti,
      q.sortOrder,
      q.isActive,
    ]),
  );
  await insertRows(
    "sam_assessments",
    [
      "id",
      "institution_code",
      "area_id",
      "manual_location",
      "observer_account_id",
      "observer_name",
      "observed_at",
      "observed_time",
      "kind",
      "note",
      "status",
      "answers",
      "total_score",
      "max_score",
      "percent",
      "risk_level",
      "reviewed_by",
      "reviewed_by_id",
      "reviewed_at",
      "review_note",
      "completed_at",
      "created_at",
    ],
    SEED.samAssessments.map((a) => [
      a.id,
      a.institutionCode,
      a.areaId ?? null,
      text(a.manualLocation),
      a.observerAccountId ?? null,
      a.observerName,
      toDateOnly(a.observedAt),
      a.observedTime ?? null,
      a.kind,
      text(a.note),
      a.status,
      json(a.answers),
      a.totalScore,
      a.maxScore,
      a.percent,
      a.riskLevel,
      a.reviewedBy ?? null,
      a.reviewedById ?? null,
      toDateTime(a.reviewedAt),
      text(a.reviewNote),
      toDateTime(a.completedAt),
      toDateTime(a.createdAt) ?? now(),
    ]),
  );
  await insertRows(
    "sam_follow_ups",
    [
      "id",
      "assessment_id",
      "question_id",
      "title",
      "note",
      "pic",
      "due_date",
      "status",
      "created_by",
      "created_at",
      "updated_at",
      "done_at",
      "cancel_reason",
    ],
    SEED.samFollowUps.map((f) => [
      f.id,
      f.assessmentId,
      f.questionId,
      f.title,
      text(f.note),
      f.pic,
      toDateOnly(f.dueDate),
      f.status,
      f.createdBy ?? null,
      toDateTime(f.createdAt) ?? now(),
      toDateTime(f.updatedAt) ?? now(),
      toDateTime(f.doneAt),
      text(f.cancelReason),
    ]),
  );

  await insertRows(
    "audit_events",
    [
      "legacy_id",
      "object_type",
      "object_id",
      "actor_account_id",
      "actor_name",
      "actor_role",
      "institution_code",
      "action",
      "note",
      "at",
    ],
    SEED.auditEvents.map((ev) => [
      ev.id,
      ev.objectType,
      ev.objectId,
      ev.actorAccountId ?? null,
      ev.actorName,
      ev.actorRole ?? "Publik",
      ev.institutionCode ?? null,
      ev.action,
      text(ev.note),
      toDateTime(ev.at) ?? now(),
    ]),
  );

  await insertRows(
    "notifications",
    [
      "legacy_id",
      "recipient_account_id",
      "institution_code",
      "source_object_id",
      "message",
      "target_url",
      "is_read",
      "at",
    ],
    SEED.notifications.map((n) => [
      n.id,
      n.recipientAccountId ?? null,
      n.institutionCode ?? null,
      n.sourceObjectId,
      n.message,
      n.targetUrl,
      n.read,
      toDateTime(n.at) ?? now(),
    ]),
  );

  const indexRows: SqlValue[][] = [];
  for (const [code, points] of Object.entries(SEED.indexHistory)) {
    points.forEach((point, index) => {
      indexRows.push([code, point.period, point.index, index + 1]);
    });
  }
  await insertRows(
    "index_history",
    ["institution_code", "period", "index_value", "sort_order"],
    indexRows,
  );

  const maxNumeric = (ids: string[]): number =>
    ids.reduce((max, id) => {
      const parsed = Number.parseInt(id.replace(/\D+/g, ""), 10);
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);
  await insertRows("sequences", ["seq_name", "value"], [
    ["report", SEED.counters.report],
    ["institution", SEED.counters.institution],
    ["assessment", maxNumeric(SEED.samAssessments.map((a) => a.id)) + 1],
    ["follow_up", maxNumeric(SEED.samFollowUps.map((f) => f.id)) + 1],
  ]);
}
