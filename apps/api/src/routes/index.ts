// Kumpulan rute REST Fase 1 (baca publik + lapor + penilaian-mandiri + upload).

import {
  selectFindingsByReports,
  selectPublicReports,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
} from "../../../web/mocks/store/selectors";
import { selectPublicCampusMap } from "../../../web/mocks/processors/campus-map";
import {
  buatDashboardInsight,
  hitungIndexSummary,
  resolvePeriodeParam,
} from "../../../web/mocks/processors/dashboard-aggregate";
import type { IshasState } from "../../../web/mocks/types";
import type { Route, RouteContext } from "../router";
import { actionResponse, fail, httpStatusForError, ok } from "../http";
import { requireRole } from "../actor";
import { buildPublicState, projectPublicRecommendation, projectPublicReport } from "../domain/public-state";
import { resolveSender, submitLaporCepat, validateEvidence, validateLapor } from "../domain/lapor";
import { deleteDraftById, saveDraft, submitSelfAssessment, type DraftInput } from "../domain/self-assessment";
import { uploadEvidence } from "../domain/uploads";
import { deleteFileAsset, getFileAsset } from "../repo/files";
import { removeStoredBlob, tryReadStoredBlob } from "../storage";
import { buildPesantrenRoutes } from "./pesantren";
import { buildValidatorRoutes } from "./validator";
import { buildAdminRoutes } from "./admin";

export type RouteDeps = { loadState: () => Promise<IshasState> };

type StateContext = RouteContext & { state: IshasState };

function institutionNotice(state: IshasState, url: URL): { selected?: string; notice?: string } {
  const requested = url.searchParams.get("institution") ?? url.searchParams.get("pesantren");
  if (!requested) return {};
  const registered = selectRegisteredInstitutions(state);
  if (registered.some((i) => i.code === requested)) return { selected: requested };
  return { notice: `Pesantren "${requested}" tidak tersedia. Menampilkan semua pesantren terdaftar.` };
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

async function formField(
  request: Request,
): Promise<{ file: File | null; fields: Record<string, string> }> {
  const form = await request.formData();
  const fileValue = form.get("file");
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return { file: fileValue instanceof File ? fileValue : null, fields };
}

export function buildRoutes(deps: RouteDeps): Route[] {
  const withState = (handler: (ctx: StateContext) => Promise<Response>) =>
    async (ctx: RouteContext) => handler({ ...ctx, state: await deps.loadState() });

  return [
    {
      method: "GET",
      pattern: "/api/v1/public/state",
      handler: withState(async ({ state }) => ok(buildPublicState(state))),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/institutions",
      handler: withState(async ({ state }) =>
        ok({
          items: selectRegisteredInstitutions(state).map((i) => ({
            code: i.code,
            name: i.name,
            location: i.location,
            status: i.status,
          })),
        }),
      ),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/institutions/:code",
      handler: withState(async ({ state, params }) => {
        const institution = selectRegisteredInstitutions(state).find((i) => i.code === params.code);
        if (!institution) return ok({ code: params.code, found: false, reports: 0 });
        return ok({
          code: institution.code,
          found: true,
          name: institution.name,
          location: institution.location,
          manager: institution.manager,
          reports: selectPublicReports(state, institution.code).length,
        });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/dashboard",
      handler: withState(async ({ state, url }) => {
        const { selected, notice } = institutionNotice(state, url);
        const registered = selectRegisteredInstitutions(state);
        const reports = selectPublicReports(state, selected ?? null);
        const findings = selectFindingsByReports(state, reports);
        const recommendations = selectRecommendationsByReports(state, reports);
        const scopeCodes = selected ? [selected] : registered.map((i) => i.code);
        const knownPeriods = [
          ...new Set(scopeCodes.flatMap((code) => (state.indexHistory[code] ?? []).map((p) => p.period))),
        ];
        const periodeParam = url.searchParams.get("periode") ?? url.searchParams.get("period");
        const periode = resolvePeriodeParam(periodeParam, knownPeriods);
        const summary = hitungIndexSummary(
          {
            reports,
            selfAssessmentSnapshots: state.selfAssessmentSnapshots,
            instrumentVersions: state.instrumentVersions,
            indexHistory: state.indexHistory,
            instrument: state.instrument,
          },
          scopeCodes,
        );
        const insight = buatDashboardInsight({
          reports,
          findings,
          recommendations,
          institutions: registered,
          users: state.users,
          buildings: state.buildings,
          areas: state.areas,
          scopeCodes,
        });
        return ok({ summary, insight, notice: notice ?? null, periode });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/results",
      handler: withState(async ({ state, url }) => {
        const { selected } = institutionNotice(state, url);
        const reports = selectPublicReports(state, selected ?? null);
        return ok({
          items: reports.map(projectPublicReport),
          findings: selectFindingsByReports(state, reports),
        });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/recommendations",
      handler: withState(async ({ state, url }) => {
        const { selected } = institutionNotice(state, url);
        const reports = selectPublicReports(state, selected ?? null);
        return ok({
          items: selectRecommendationsByReports(state, reports).map(projectPublicRecommendation),
        });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/follow-ups",
      handler: withState(async ({ state, url }) => {
        const { selected } = institutionNotice(state, url);
        const reports = selectPublicReports(state, selected ?? null);
        return ok({
          items: selectRecommendationsByReports(state, reports).map(projectPublicRecommendation),
        });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/risk-map",
      handler: withState(async ({ state, url }) => {
        const { selected } = institutionNotice(state, url);
        return ok(selectPublicCampusMap(state, selected));
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/docs",
      handler: withState(async ({ state, url }) => {
        const q = (url.searchParams.get("q") ?? "").toLowerCase();
        const category = url.searchParams.get("category");
        const visibility = url.searchParams.get("visibility");
        const items = state.instrumentDocs
          .filter((doc) => (category ? doc.categoryId === category : true))
          .filter((doc) => (visibility ? doc.visibility === visibility : true))
          .filter((doc) =>
            q
              ? `${doc.fileName} ${doc.indicatorTitle ?? ""} ${doc.indicatorCode ?? ""}`
                  .toLowerCase()
                  .includes(q)
              : true,
          )
          .map((doc) => ({
            id: doc.id,
            indicatorId: doc.indicatorId,
            indicatorCode: doc.indicatorCode,
            indicatorTitle: doc.indicatorTitle,
            categoryId: doc.categoryId,
            aspectId: doc.aspectId,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mime: doc.mime,
            visibility: doc.visibility,
            assetId: doc.visibility === "Public" ? doc.assetId : "",
          }));
        return ok({ items });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/instrument/bank",
      handler: withState(async ({ state }) =>
        ok({
          id: state.instrument.id,
          label: state.instrument.label,
          updatedAt: state.instrument.updatedAt,
          checksum: state.instrument.checksum,
          dimensions: state.instrument.dimensions.map((dim) => ({
            id: dim.id,
            name: dim.name,
            categoryId: dim.categoryId,
            aspects: dim.aspects,
            indicators: dim.indicators.map((ind) => ({
              id: ind.id,
              code: ind.code,
              title: ind.title,
              prompt: ind.prompt,
              categoryId: ind.categoryId,
              aspectId: ind.aspectId,
              answerType: ind.answerType,
              required: ind.required,
              evidenceRequired: ind.evidenceRequired,
              locationRequired: ind.locationRequired,
              options: ind.options.map((o) => ({ value: o.value, label: o.label })),
            })),
          })),
        }),
      ),
    },
    {
      method: "GET",
      pattern: "/api/v1/public/reports/:id/pdf-data",
      handler: withState(async ({ state, params }) => {
        const report = state.reports.find((r) => r.id === params.id);
        if (!report) return fail("Laporan tidak ditemukan.", 404);
        if (report.channel !== "penilaian-mandiri" || report.validationStatus !== "Diterima") {
          return fail("Laporan tidak tersedia untuk publik.", 404);
        }
        const institution = selectRegisteredInstitutions(state).find(
          (i) => i.code === report.institutionCode,
        );
        const snapshot = state.selfAssessmentSnapshots.find((s) => s.reportId === report.id);
        // D-02 + D-27: tanpa jawaban mentah, tetapi foto bukti per indikator
        // (asset + nama) tetap tersedia untuk PDF publik.
        const evidenceOnly = snapshot
          ? Object.fromEntries(
              Object.entries(snapshot.answers).map(([indicatorId, answer]) => [
                indicatorId,
                {
                  evidenceAssetId: answer.evidenceAssetId,
                  evidenceName: answer.evidenceName,
                },
              ]),
            )
          : {};
        return ok({
          report: projectPublicReport(report),
          snapshot: snapshot ? { ...snapshot, answers: evidenceOnly } : null,
          findings: selectFindingsByReports(state, [report]),
          recommendations: selectRecommendationsByReports(state, [report]).map(
            projectPublicRecommendation,
          ),
          institution: institution
            ? { code: institution.code, name: institution.name, location: institution.location }
            : null,
          instrumentLabel: state.instrument.label,
        });
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/reports/lapor-cepat",
      handler: withState(async ({ state, actor, request }) => {
        const input = await readJson<Parameters<typeof validateLapor>[1]>(request);
        // Kontrak §0/§3: idempotensi lewat header X-Request-Id; body
        // clientRequestId tetap didukung (cermin mock).
        const headerKey = request.headers.get("x-request-id")?.trim();
        if (headerKey && !input.clientRequestId) input.clientRequestId = headerKey;
        const senderOrError = resolveSender(state, actor, "laporan");
        if ("error" in senderOrError) return fail(senderOrError.error, 403);
        const evidenceError = await validateEvidence(input);
        const error = validateLapor(state, input, evidenceError);
        if (error) return fail(error, httpStatusForError(error));
        const result = await submitLaporCepat(state, senderOrError, input);
        return actionResponse(result);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/uploads/report-evidence",
      handler: withState(async ({ state, actor, request }) => {
        const { file, fields } = await formField(request);
        if (!file) return fail("Pilih gambar PNG, JPEG atau WebP.", 400);
        const result = await uploadEvidence(
          state,
          actor,
          "report-evidence",
          fields.institutionCode ?? "",
          file,
        );
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: result.id }, 201);
      }),
    },
    {
      method: "DELETE",
      pattern: "/api/v1/uploads/report-evidence/:assetId",
      handler: withState(async ({ state, actor, params }) => {
        if (!actor || actor.status !== "Aktif") return fail("Sesi tidak dikenal.", 401);
        const asset = await getFileAsset(params.assetId);
        if (!asset || String(asset.kind) !== "report-evidence") {
          return fail("Berkas tidak ditemukan.", 404);
        }
        if (
          actor.roleId !== "pesantren" ||
          !actor.institutionCodes.includes(String(asset.institution_code))
        ) {
          return fail("Anda tidak berwenang menghapus berkas ini.", 403);
        }
        await deleteFileAsset(params.assetId);
        if (asset.stored_path) await removeStoredBlob(String(asset.stored_path));
        void state;
        return ok({ id: params.assetId });
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/self-assessments/drafts",
      handler: withState(async ({ state, actor, request }) => {
        const input = await readJson<DraftInput>(request);
        if (!input.id) return fail("Draft tidak ditemukan.", 404);
        const result = await saveDraft(state, {
          ...input,
          reporterUserId: actor?.id,
        } as DraftInput & { reporterUserId?: string });
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: input.id });
      }),
    },
    {
      method: "DELETE",
      pattern: "/api/v1/self-assessments/drafts/:id",
      handler: withState(async ({ state, params }) => {
        const result = await deleteDraftById(state, params.id);
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: params.id });
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/self-assessments/submit",
      handler: withState(async ({ state, actor, request }) => {
        const body = await readJson<{
          draftId: string;
          reporterName?: string;
          contact?: string;
        }>(request);
        if (!body.draftId) return fail("Draft tidak ditemukan.", 404);
        const result = await submitSelfAssessment(state, actor, body.draftId, {
          reporterName: body.reporterName,
          contact: body.contact,
        });
        return actionResponse(result);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/uploads/self-evidence",
      handler: withState(async ({ state, actor, request }) => {
        const { file, fields } = await formField(request);
        if (!file) return fail("Pilih gambar PNG, JPEG atau WebP.", 400);
        const result = await uploadEvidence(
          state,
          actor,
          "self-evidence",
          fields.institutionCode ?? "",
          file,
        );
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: result.id }, 201);
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/files/:assetId",
      handler: withState(async ({ state, actor, params }) => {
        const asset = await getFileAsset(params.assetId);
        if (!asset) return fail("Berkas tidak ditemukan.", 404);
        const kind = String(asset.kind);
        const active = actor?.status === "Aktif" ? actor : null;
        if (kind === "instrument-doc") {
          const isPublic = String(asset.visibility) === "Public";
          const isValidator = active?.roleId === "validator";
          if (!isPublic && !isValidator) {
            return fail("Berkas Privat hanya dapat dibuka oleh Validator.", 403);
          }
        } else if (kind === "self-evidence") {
          // D-27: foto bukti yang menempel pada laporan mandiri publik boleh
          // tampil di PDF publik; di luar itu tetap privat untuk pemilik scope.
          const ownerReportId = String(asset.owner_ref ?? "");
          const viaPublicPdf = selectPublicReports(state, null).some((r) => r.id === ownerReportId);
          if (!viaPublicPdf) {
            if (!active) return fail("Sesi tidak dikenal.", 401);
            const allowed =
              active.roleId === "admin" ||
              (active.roleId === "pesantren" &&
                active.institutionCodes.includes(String(asset.institution_code)));
            if (!allowed) return fail("Berkas bukti bersifat privat.", 403);
          }
        } else if (kind === "sam-evidence") {
          // Fase 4: bukti SAM-iSAFE hanya untuk Validator aktif.
          if (!active) return fail("Sesi tidak dikenal.", 401);
          if (active.roleId !== "validator") return fail("Berkas bukti bersifat privat.", 403);
        } else if (kind === "campus-plan") {
          // Denah: blob Public dapat dibuka publik (cermin peta publik D-14;
          // pesantren yang dipilih ditentukan client via activeCampusPlanVersionId).
          if (String(asset.visibility) !== "Public") {
            if (!active) return fail("Sesi tidak dikenal.", 401);
            const allowed =
              active.roleId === "admin" ||
              (active.roleId === "pesantren" &&
                active.institutionCodes.includes(String(asset.institution_code)));
            if (!allowed) return fail("Berkas bukti bersifat privat.", 403);
          }
        } else {
          if (!active) return fail("Sesi tidak dikenal.", 401);
          const allowed =
            active.roleId === "admin" ||
            (active.roleId === "pesantren" &&
              active.institutionCodes.includes(String(asset.institution_code)));
          if (!allowed) return fail("Berkas bukti bersifat privat.", 403);
        }
        void state;
        const bytes = await tryReadStoredBlob(String(asset.stored_path));
        if (!bytes) return fail("Berkas belum tersedia di server.", 404);
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": String(asset.mime),
            "Content-Disposition": `inline; filename="${String(asset.original_name)}"`,
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, max-age=3600",
          },
        });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/docs/:indicatorId/blob",
      handler: withState(async ({ state, actor, params }) => {
        const doc = state.instrumentDocs.find((d) => d.indicatorId === params.indicatorId);
        if (!doc) return fail("Berkas belum tersedia untuk indikator ini.", 404);
        if (doc.visibility !== "Public") {
          if (!actor || actor.status !== "Aktif") return fail("Sesi tidak dikenal.", 401);
          if (actor.roleId !== "validator") {
            return fail("Berkas Privat hanya dapat dibuka oleh Validator.", 403);
          }
        }
        const asset = await getFileAsset(doc.assetId);
        if (!asset) {
          return fail("Berkas tidak tersedia pada server. Unggah ulang melalui ruang Validator.", 404);
        }
        const bytes = await tryReadStoredBlob(String(asset.stored_path));
        if (!bytes) {
          return fail("Berkas tidak tersedia pada server. Unggah ulang melalui ruang Validator.", 404);
        }
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${String(asset.original_name)}"`,
            "X-Content-Type-Options": "nosniff",
          },
        });
      }),
    },
    ...buildPesantrenRoutes(deps),
    ...buildValidatorRoutes(deps),
    ...buildAdminRoutes(deps),
  ];
}

export { requireRole };
