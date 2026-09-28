// Rute ruang kerja Validator minus SAM — Fase 3 (API §9–§10, §12–§13).

import type { InstrumentAnswerType, InstrumentOption, IshasState } from "../../../web/mocks/types";
import type { Actor, Route, RouteContext } from "../router";
import { actionResponse, fail, httpStatusForError, ok } from "../http";
import {
  addBankDimension,
  addBankIndicator,
  deleteBankDimensionById,
  deleteBankIndicatorById,
  setBankIndicatorOptions,
  updateBankDimensionById,
  updateBankIndicatorById,
} from "../domain/bank";
import {
  createInstrumentDocEntry,
  deleteInstrumentDoc,
  setInstrumentDocVisibility,
  upsertInstrumentDoc,
} from "../domain/docs";
import {
  applyDatasetImport,
  buildDatasetRows,
  buildPublicationAudit,
  exportDataset,
  previewDatasetImport,
} from "../domain/dataset";
import { uploadInstrumentDoc } from "../domain/uploads";

export type ValidatorRouteDeps = { loadState: () => Promise<IshasState> };

type StateContext = RouteContext & { state: IshasState };

const FORBIDDEN = "Hanya akun Validator aktif yang dapat mengakses ruang Validator.";

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

function isValidator(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "Aktif" && actor.roleId === "validator");
}

export function buildValidatorRoutes(deps: ValidatorRouteDeps): Route[] {
  const withState = (handler: (ctx: StateContext) => Promise<Response>) =>
    async (ctx: RouteContext) => handler({ ...ctx, state: await deps.loadState() });

  const guard = (ctx: RouteContext): Response | null =>
    isValidator(ctx.actor) ? null : fail(FORBIDDEN, 403);

  return [
    {
      method: "GET",
      pattern: "/api/v1/validator/state",
      handler: withState(async (ctx) => guard(ctx) ?? ok(ctx.state)),
    },
    {
      method: "GET",
      pattern: "/api/v1/validator/bank/dimensions",
      handler: withState(async (ctx) => guard(ctx) ?? ok(ctx.state.instrument)),
    },
    {
      method: "POST",
      pattern: "/api/v1/validator/bank/dimensions",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ name: string; categoryId?: string }>(ctx.request);
        return actionResponse(await addBankDimension(ctx.state, ctx.actor, body.name ?? "", body.categoryId));
      }),
    },
    {
      method: "PATCH",
      pattern: "/api/v1/validator/bank/dimensions/:id",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ name?: string; categoryId?: string }>(ctx.request);
        return actionResponse(await updateBankDimensionById(ctx.state, ctx.actor, ctx.params.id, body));
      }),
    },
    {
      method: "DELETE",
      pattern: "/api/v1/validator/bank/dimensions/:id",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await deleteBankDimensionById(ctx.state, ctx.actor, ctx.params.id));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/validator/bank/indicators",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          dimensionId: string;
          code: string;
          title: string;
          prompt: string;
          answerType: InstrumentAnswerType;
          required: boolean;
          evidenceRequired: boolean;
          locationRequired: boolean;
          categoryId?: string;
          aspectId?: string;
        }>(ctx.request);
        return actionResponse(await addBankIndicator(ctx.state, ctx.actor, body.dimensionId, body));
      }),
    },
    {
      method: "PATCH",
      pattern: "/api/v1/validator/bank/indicators/:id",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<Record<string, never>>(ctx.request);
        return actionResponse(await updateBankIndicatorById(ctx.state, ctx.actor, ctx.params.id, body as never));
      }),
    },
    {
      method: "DELETE",
      pattern: "/api/v1/validator/bank/indicators/:id",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await deleteBankIndicatorById(ctx.state, ctx.actor, ctx.params.id));
      }),
    },
    {
      method: "PUT",
      pattern: "/api/v1/validator/bank/indicators/:id/options",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ options: InstrumentOption[]; weight?: number }>(ctx.request);
        return actionResponse(
          await setBankIndicatorOptions(ctx.state, ctx.actor, ctx.params.id, body.options ?? [], body.weight),
        );
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/uploads/instrument-doc",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const { file } = await formField(ctx.request);
        if (!file) return fail("Pilih berkas PDF.", 400);
        const result = await uploadInstrumentDoc(ctx.state, ctx.actor, file);
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ id: result.id }, 201);
      }),
    },
    {
      method: "PUT",
      pattern: "/api/v1/validator/docs/:indicatorId",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          fileName: string;
          fileSize: number;
          assetId: string;
          visibility?: "Public" | "Privat";
          categoryId?: string;
          aspectId?: string;
        }>(ctx.request);
        return actionResponse(await upsertInstrumentDoc(ctx.state, ctx.actor, ctx.params.indicatorId, body));
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/validator/docs",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          code: string;
          title: string;
          categoryId: string;
          aspectId?: string;
          visibility?: "Public" | "Privat";
          fileName: string;
          fileSize: number;
          assetId: string;
        }>(ctx.request);
        return actionResponse(await createInstrumentDocEntry(ctx.state, ctx.actor, body));
      }),
    },
    {
      method: "PATCH",
      pattern: "/api/v1/validator/docs/:indicatorId/visibility",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{ visibility: "Public" | "Privat" }>(ctx.request);
        return actionResponse(
          await setInstrumentDocVisibility(ctx.state, ctx.actor, ctx.params.indicatorId, body.visibility),
        );
      }),
    },
    {
      method: "DELETE",
      pattern: "/api/v1/validator/docs/:indicatorId",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return actionResponse(await deleteInstrumentDoc(ctx.state, ctx.actor, ctx.params.indicatorId));
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/validator/dataset",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const rows = buildDatasetRows(ctx.state, {
          institution: ctx.url.searchParams.get("institution") ?? undefined,
          includeNonRegistered: ctx.url.searchParams.get("includeNonRegistered") === "true",
          status: ctx.url.searchParams.get("status") ?? undefined,
          q: ctx.url.searchParams.get("q") ?? undefined,
        });
        return ok({ items: rows });
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/validator/dataset/export",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const format = ctx.url.searchParams.get("format") ?? "csv";
        const result = exportDataset(ctx.state, format);
        if (!result.ok) return fail(result.error, 400);
        return new Response(result.content, {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            "Content-Disposition": `attachment; filename="${result.fileName}"`,
          },
        });
      }),
    },
    {
      method: "POST",
      pattern: "/api/v1/validator/dataset/import",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        const body = await readJson<{
          text?: string;
          rows?: {
            institutionCode: string;
            reporterName: string;
            scorePercent: number | null;
            title: string;
          }[];
          apply?: boolean;
        }>(ctx.request);
        const preview = body.rows
          ? { valid: body.rows, errors: [] as string[] }
          : previewDatasetImport(ctx.state, body.text ?? "");
        if (!body.apply) return ok(preview);
        const result = await applyDatasetImport(ctx.state, ctx.actor, preview.valid);
        if (!result.ok) return fail(result.error, httpStatusForError(result.error));
        return ok({ ...preview, applied: preview.valid.length, id: result.id }, 201);
      }),
    },
    {
      method: "GET",
      pattern: "/api/v1/validator/publication-audit",
      handler: withState(async (ctx) => {
        const denied = guard(ctx);
        if (denied) return denied;
        return ok({ items: buildPublicationAudit(ctx.state) });
      }),
    },
  ];
}
