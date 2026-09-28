// Rute ruang kerja Pesantren — Fase 2 (API §4–§7).

import type { HandlingStatus, IshasState, Priority, RiskLevel, Severity } from "../../../web/mocks/types";
import type { Route, RouteContext } from "../router";
import { actionResponse, fail, httpStatusForError, ok } from "../http";
import {
  acceptReport,
  addArea,
  addBuilding,
  addFloor,
  archiveCompletedReport,
  buildPesantrenState,
  cancelRecommendation,
  publishCampusPlan,
  rejectReport,
  scopedReport,
  setFindingLevel,
  updateHandlingStatus,
  updateRecommendation,
} from "../domain/pesantren";
import { uploadCampusPlan, uploadCompletionEvidence } from "../domain/uploads";

export type PesantrenRouteDeps = { loadState: () => Promise<IshasState> };

type StateContext = RouteContext & { state: IshasState };

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

async function formField(request: Request): Promise<{ file: File | null; fields: Record<string, string> }> {
  const form = await request.formData();
  const fileValue = form.get("file");
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return { file: fileValue instanceof File ? fileValue : null, fields };
}

export function buildPesantrenRoutes(deps: PesantrenRouteDeps): Route[] {
  const withState = (handler: (ctx: StateContext) => Promise<Response>) =>
    async (ctx: RouteContext) => handler({ ...ctx, state: await deps.loadState() });

  const auditAction = (result: { ok: true; id?: string } | { ok: false; error: string }) =>
    actionResponse(result);

  return [
    {
      method: "GET",
      pattern: "/api/v1/pesantren/state",
      handler: withState(async ({ state, actor }) => {
        if (!actor || actor.status !== "Aktif") {
          return fail("Sesi tidak dikenal.", 401);
        }
        if (actor.roleId !== "pesantren") {
          return fail("Anda tidak berwenang mengubah laporan pesantren ini.", 403);
        }
        return ok(buildPesantrenState(state, actor.institutionCodes[0] ?? ""));
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/pesantren/queue",
      handler: withState(async ({ state, actor, url }) => {
        if (!actor || actor.status !== "Aktif") {
          return fail("Sesi tidak dikenal.", 401);
        }
        if (actor.roleId !== "pesantren") {
          return fail("Anda tidak berwenang mengubah laporan pesantren ini.", 403);
        }
        const institutionCode = actor.institutionCodes[0];
        const status = url.searchParams.get("status") ?? "Menunggu validasi";
        const channel = url.searchParams.get("channel");
        const severity = url.searchParams.get("severity");
        const q = (url.searchParams.get("q") ?? "").toLowerCase();
        const items = state.reports
          .filter((r) => r.institutionCode === institutionCode)
          .filter((r) => (status === "all" ? true : r.validationStatus === status))
          .filter((r) => (channel ? r.channel === channel : true))
          .filter((r) => (severity ? r.severity === severity : true))
          .filter((r) => (q ? `${r.id} ${r.title}`.toLowerCase().includes(q) : true))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return ok({ items });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/pesantren/reports/:id",
      handler: withState(async ({ state, actor, params }) => {
        const scope = scopedReport(state, actor, params.id);
        if ("error" in scope) return fail(scope.error, httpStatusForError(scope.error));
        return ok({
          report: scope.report,
          findings: state.findings.filter((f) => f.reportId === params.id),
          recommendations: state.recommendations.filter((r) => r.reportId === params.id),
        });
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/reports/:id/accept",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{
          severity: Severity;
          priority: Priority;
          note?: string;
          rekomendasiFinal?: string;
        }>(request);
        const result = await acceptReport(
          state,
          actor,
          params.id,
          body.severity,
          body.priority,
          body.note,
          body.rekomendasiFinal,
        );
        return auditAction(result);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/reports/:id/reject",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ reason: string }>(request);
        return actionResponse(await rejectReport(state, actor, params.id, body.reason));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/reports/:id/status",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{
          next: HandlingStatus;
          owner?: string;
          dueDate?: string;
          progress?: number;
          evidenceName?: string;
          note?: string;
        }>(request);
        return actionResponse(
          await updateHandlingStatus(state, actor, params.id, body.next, {
            owner: body.owner,
            dueDate: body.dueDate,
            progress: body.progress,
            evidenceName: body.evidenceName,
            note: body.note,
          }),
        );
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/reports/:id/archive",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ reason: string }>(request);
        return actionResponse(await archiveCompletedReport(state, actor, params.id, body.reason));
      }),
    },
    {
      method: "PATCH",
      pattern: "/api/v1/pesantren/findings/:id/level",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ level: RiskLevel }>(request);
        return actionResponse(await setFindingLevel(state, actor, params.id, body.level));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/buildings",
      handler: withState(async ({ state, actor, request }) => {
        const body = await readJson<{ code: string; name: string }>(request);
        return actionResponse(await addBuilding(state, actor, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/buildings/:id/floors",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ name: string }>(request);
        return actionResponse(await addFloor(state, actor, params.id, body.name));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/areas",
      handler: withState(async ({ state, actor, request }) => {
        const body = await readJson<{ buildingId: string; floor: string; name: string; zone: string }>(
          request,
        );
        return actionResponse(await addArea(state, actor, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/uploads/campus-plan",
      handler: withState(async ({ state, actor, request }) => {
        const { file, fields } = await formField(request);
        if (!file) return fail("Pilih PNG, JPEG atau WebP maksimum 5 MB.", 400);
        const result = await uploadCampusPlan(state, actor, fields.institutionCode ?? "", file);
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: result.id }, 201);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/campus-plans/publish",
      handler: withState(async ({ state, actor, request }) => {
        const body = await readJson<{
          institutionCode: string;
          assetId: string;
          width: number;
          height: number;
          expectedActiveId?: string;
          acknowledged: boolean;
        }>(request);
        return actionResponse(await publishCampusPlan(state, actor, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/uploads/completion-evidence",
      handler: withState(async ({ state, actor, request }) => {
        const { file, fields } = await formField(request);
        if (!file) return fail("Pilih gambar PNG, JPEG atau WebP.", 400);
        const result = await uploadCompletionEvidence(
          state,
          actor,
          fields.institutionCode ?? "",
          file,
        );
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: result.id }, 201);
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/recommendations/:id/progress",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{
          owner?: string;
          dueDate?: string;
          note: string;
          progress?: number;
          evidenceName?: string;
          evidenceAssetId?: string;
        }>(request);
        return actionResponse(await updateRecommendation(state, actor, params.id, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/recommendations/:id/verify",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ verify: boolean; note: string }>(request);
        return actionResponse(
          await updateRecommendation(state, actor, params.id, {
            note: body.note,
            verify: body.verify !== false,
          }),
        );
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/pesantren/recommendations/:id/cancel",
      handler: withState(async ({ state, actor, params, request }) => {
        const body = await readJson<{ reason: string }>(request);
        return actionResponse(await cancelRecommendation(state, actor, params.id, body.reason));
      }),
    },
  ];
}
