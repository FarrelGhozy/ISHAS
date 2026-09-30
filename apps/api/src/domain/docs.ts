// Validasi + mutasi pustaka dokumen indikator (Fase 3) — port 1:1
// `mock-store.ts` §upsertInstrumentDoc…deleteInstrumentDoc (D-16). Satu
// indicatorId = satu berkas; entri manual D-16.g di-denormalisasi.

import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "../../../web/mocks/kategori-k3";
import type { InstrumentDoc, InstrumentDocVisibility, IshasState } from "../../../web/mocks/types";
import type { Actor } from "../router";
import { getFileAsset } from "../repo/files";
import { insertAudit, withTransaction } from "../repo/writes";
import {
  deleteFileAssetRow,
  deleteInstrumentDocRow,
  updateFileAssetVisibility,
  updateInstrumentDocVisibility,
  upsertInstrumentDocRow,
} from "../repo/docs";
import { removeStoredBlob } from "../storage";

export type DocActionResult = { ok: true; id?: string } | { ok: false; error: string };

const nowIso = (): string => new Date().toISOString();
const pad = (value: number): string => String(value).padStart(3, "0");

type CatalogEntry = {
  dim: { categoryId?: string };
  ind: { categoryId?: string; aspectId?: string; code: string; title: string };
};

function findCatalog(state: IshasState, indicatorId: string): CatalogEntry | null {
  for (const dim of state.instrument.dimensions) {
    const ind = dim.indicators.find((item) => item.id === indicatorId);
    if (ind) return { dim, ind };
  }
  for (const version of state.instrumentVersions) {
    for (const dim of version.dimensions) {
      const ind = dim.indicators.find((item) => item.id === indicatorId);
      if (ind) return { dim, ind };
    }
  }
  return null;
}

function accountFor(state: IshasState, actor: Actor | null, message: string): { error: string } | { account: { id: string; name: string } } {
  const account = actor ? state.users.find((user) => user.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
    return { error: message };
  }
  return { account: { id: account.id, name: account.name } };
}

function validFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf") && fileName.length <= 200;
}

function validFileSize(fileSize: number): boolean {
  return Number.isSafeInteger(fileSize) && fileSize > 0 && fileSize <= 10 * 1024 * 1024;
}

export async function upsertInstrumentDoc(
  state: IshasState,
  actor: Actor | null,
  indicatorIdInput: string,
  input: {
    fileName: string;
    fileSize: number;
    assetId: string;
    visibility?: InstrumentDocVisibility;
    categoryId?: string;
    aspectId?: string;
  },
): Promise<DocActionResult> {
  const auth = accountFor(state, actor, "Hanya akun Validator aktif yang dapat mengelola berkas indikator.");
  if ("error" in auth) return { ok: false, error: auth.error };
  const indicatorId = indicatorIdInput.trim();
  const fileName = input.fileName.trim();
  if (!indicatorId) return { ok: false, error: "Indikator tidak ditemukan." };
  const catalog = findCatalog(state, indicatorId);
  const existing = state.instrumentDocs.find((item) => item.indicatorId === indicatorId);
  if (!catalog && !existing) return { ok: false, error: "Indikator tidak ditemukan." };
  if (!validFileName(fileName)) return { ok: false, error: "Hanya berkas PDF yang didukung." };
  if (!validFileSize(input.fileSize)) {
    return { ok: false, error: "Ukuran PDF harus lebih dari 0 dan maksimal 10 MB." };
  }
  if (typeof input.assetId !== "string" || !input.assetId) {
    return { ok: false, error: "Berkas belum tersimpan. Unggah ulang PDF." };
  }
  const visibility: InstrumentDocVisibility = input.visibility === "Public" ? "Public" : "Privat";
  const id = `DOC-${indicatorId}`;
  const doc: InstrumentDoc = {
    id,
    indicatorId,
    indicatorCode: existing?.indicatorCode,
    indicatorTitle: existing?.indicatorTitle,
    categoryId: input.categoryId ?? catalog?.ind.categoryId ?? catalog?.dim.categoryId ?? existing?.categoryId,
    aspectId: input.aspectId ?? catalog?.ind.aspectId ?? existing?.aspectId,
    manual: existing?.manual,
    fileName,
    fileSize: input.fileSize,
    mime: "application/pdf",
    assetId: input.assetId,
    visibility,
    updatedBy: auth.account.name,
    updatedAt: nowIso(),
  };
  await withTransaction(async (conn) => {
    await upsertInstrumentDocRow(conn, doc);
    await updateFileAssetVisibility(conn, input.assetId, visibility);
    await insertAudit(conn, {
      id: "",
      objectType: "InstrumentDoc",
      objectId: id,
      actorAccountId: auth.account.id,
      actorName: auth.account.name,
      actorRole: (actor as Actor).role as never,
      action: "Mengunggah berkas indikator",
      note: `${fileName} · ${visibility}`,
      at: doc.updatedAt,
    });
  });
  return { ok: true, id };
}

export async function createInstrumentDocEntry(
  state: IshasState,
  actor: Actor | null,
  input: {
    code: string;
    title: string;
    categoryId: string;
    aspectId?: string;
    visibility?: InstrumentDocVisibility;
    fileName: string;
    fileSize: number;
    assetId: string;
  },
): Promise<DocActionResult> {
  const auth = accountFor(state, actor, "Hanya akun Validator aktif yang dapat menambah dokumen indikator.");
  if ("error" in auth) return { ok: false, error: auth.error };
  const code = input.code.trim();
  const title = input.title.trim();
  const categoryId = input.categoryId.trim();
  if (code.length < 3) return { ok: false, error: "Kode indikator minimal 3 karakter." };
  if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
  if (!K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP]) {
    return { ok: false, error: "Kategori wajib dipilih." };
  }
  const aspectId = input.aspectId?.trim() ?? "";
  if (aspectId && (!K3_ASPECT_MAP[aspectId] || K3_ASPECT_MAP[aspectId].categoryId !== categoryId)) {
    return { ok: false, error: "Aspek tidak sesuai kategori." };
  }
  const fileName = input.fileName.trim();
  if (!validFileName(fileName)) return { ok: false, error: "Hanya berkas PDF yang didukung." };
  if (!validFileSize(input.fileSize)) {
    return { ok: false, error: "Ukuran PDF harus lebih dari 0 dan maksimal 10 MB." };
  }
  if (typeof input.assetId !== "string" || !input.assetId) {
    return { ok: false, error: "Berkas belum tersimpan. Unggah ulang PDF." };
  }
  const catalogCodes = [
    ...state.instrument.dimensions.flatMap((dim) => dim.indicators.map((ind) => ind.code.toLowerCase())),
    ...state.instrumentVersions.flatMap((version) =>
      version.dimensions.flatMap((dim) => dim.indicators.map((ind) => ind.code.toLowerCase())),
    ),
  ];
  const manualCodes = state.instrumentDocs
    .filter((doc) => doc.manual)
    .map((doc) => (doc.indicatorCode ?? "").toLowerCase());
  if (catalogCodes.includes(code.toLowerCase()) || manualCodes.includes(code.toLowerCase())) {
    return { ok: false, error: "Kode indikator sudah digunakan." };
  }
  const visibility: InstrumentDocVisibility = input.visibility === "Public" ? "Public" : "Privat";
  let n = state.instrumentDocs.filter((doc) => doc.manual).length + 1;
  let indicatorId = `IND-DOC-${pad(n)}`;
  while (state.instrumentDocs.some((doc) => doc.indicatorId === indicatorId)) {
    n += 1;
    indicatorId = `IND-DOC-${pad(n)}`;
  }
  const id = `DOC-${indicatorId}`;
  const doc: InstrumentDoc = {
    id,
    indicatorId,
    categoryId,
    aspectId: aspectId || undefined,
    indicatorCode: code,
    indicatorTitle: title,
    manual: true,
    fileName,
    fileSize: input.fileSize,
    mime: "application/pdf",
    assetId: input.assetId,
    visibility,
    updatedBy: auth.account.name,
    updatedAt: nowIso(),
  };
  await withTransaction(async (conn) => {
    await upsertInstrumentDocRow(conn, doc);
    await updateFileAssetVisibility(conn, input.assetId, visibility);
    await insertAudit(conn, {
      id: "",
      objectType: "InstrumentDoc",
      objectId: id,
      actorAccountId: auth.account.id,
      actorName: auth.account.name,
      actorRole: (actor as Actor).role as never,
      action: "Menambahkan dokumen indikator",
      note: `${code} · ${fileName} · ${visibility}`,
      at: doc.updatedAt,
    });
  });
  return { ok: true, id };
}

export async function setInstrumentDocVisibility(
  state: IshasState,
  actor: Actor | null,
  indicatorId: string,
  visibility: InstrumentDocVisibility,
): Promise<DocActionResult> {
  const auth = accountFor(state, actor, "Hanya akun Validator aktif yang dapat mengubah visibilitas berkas.");
  if ("error" in auth) return { ok: false, error: auth.error };
  if (visibility !== "Public" && visibility !== "Privat") {
    return { ok: false, error: "Visibilitas harus Public atau Privat." };
  }
  const target = state.instrumentDocs.find((item) => item.indicatorId === indicatorId);
  if (!target) return { ok: false, error: "Berkas indikator belum diunggah." };
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateInstrumentDocVisibility(conn, indicatorId, visibility, auth.account.name, new Date(at));
    await updateFileAssetVisibility(conn, target.assetId, visibility);
    await insertAudit(conn, {
      id: "",
      objectType: "InstrumentDoc",
      objectId: target.id,
      actorAccountId: auth.account.id,
      actorName: auth.account.name,
      actorRole: (actor as Actor).role as never,
      action: "Mengubah visibilitas berkas",
      note: visibility,
      at,
    });
  });
  return { ok: true };
}

export async function deleteInstrumentDoc(
  state: IshasState,
  actor: Actor | null,
  indicatorId: string,
): Promise<DocActionResult> {
  const auth = accountFor(state, actor, "Hanya akun Validator aktif yang dapat menghapus berkas.");
  if ("error" in auth) return { ok: false, error: auth.error };
  const target = state.instrumentDocs.find((item) => item.indicatorId === indicatorId);
  if (!target) return { ok: false, error: "Berkas indikator belum diunggah." };
  const asset = await getFileAsset(target.assetId);
  await withTransaction(async (conn) => {
    await deleteInstrumentDocRow(conn, indicatorId);
    await deleteFileAssetRow(conn, target.assetId);
    await insertAudit(conn, {
      id: "",
      objectType: "InstrumentDoc",
      objectId: target.id,
      actorAccountId: auth.account.id,
      actorName: auth.account.name,
      actorRole: (actor as Actor).role as never,
      action: "Menghapus berkas indikator",
      note: target.fileName,
      at: nowIso(),
    });
  });
  if (asset?.stored_path && !String(asset.stored_path).startsWith("seed/")) {
    await removeStoredBlob(String(asset.stored_path));
  }
  return { ok: true };
}
