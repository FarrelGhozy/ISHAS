// Validasi + mutasi bank instrumen live (Fase 3) — port 1:1 `mock-store.ts`
// §addBankDimension…setBankIndicatorOptions (D-24). Pesan Indonesia identik mock.
// Tiap perubahan memperbarui `updatedAt` + `checksum` (draft basi = ulang) + audit.

import { defaultOptionsForType } from "../../../web/mocks/instrument-bank";
import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "../../../web/mocks/kategori-k3";
import type {
  Instrument,
  InstrumentAnswerType,
  InstrumentIndicator,
  InstrumentOption,
  IshasState,
} from "../../../web/mocks/types";
import { hitungChecksumInstrument } from "../checksum";
import type { Actor } from "../router";
import { insertAudit, withTransaction, type Tx } from "../repo/writes";
import {
  deleteBankDimension,
  deleteBankIndicator,
  insertBankDimension,
  insertBankIndicator,
  replaceBankOptions,
  updateBankDimension,
  updateBankIndicator,
  updateInstrumentChecksum,
} from "../repo/bank";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const ANSWER_TYPES: InstrumentAnswerType[] = [
  "ya-tidak",
  "kualitas-1-5",
  "frekuensi",
  "keparahan",
];

const nowIso = (): string => new Date().toISOString();
const pad = (value: number, size: number): string => String(value).padStart(size, "0");

function touchBank(bank: Instrument): void {
  bank.updatedAt = nowIso();
  bank.checksum = hitungChecksumInstrument(bank.dimensions);
}

function requireValidator(state: IshasState, actor: Actor | null, message: string): { error: string } | null {
  const account = actor ? state.users.find((user) => user.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
    return { error: message };
  }
  return null;
}

async function writeAudit(
  conn: Tx,
  actor: Actor,
  entry: { objectId: string; action: string; note?: string },
  at: string,
): Promise<void> {
  await insertAudit(conn, {
    id: "",
    objectType: "Instrument",
    objectId: entry.objectId,
    actorAccountId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as never,
    action: entry.action,
    note: entry.note,
    at,
  });
}

function findIndicator(
  state: IshasState,
  id: string,
): { dimensionId: string; indicator: InstrumentIndicator } | null {
  for (const dim of state.instrument.dimensions) {
    const indicator = dim.indicators.find((item) => item.id === id);
    if (indicator) return { dimensionId: dim.id, indicator };
  }
  return null;
}

function nextDimensionId(bank: Instrument): string {
  let n = bank.dimensions.length + 1;
  let id = `DIM-${pad(n, 2)}`;
  while (bank.dimensions.some((dim) => dim.id === id)) {
    n += 1;
    id = `DIM-${pad(n, 2)}`;
  }
  return id;
}

function nextIndicatorId(bank: Instrument): string {
  let n = bank.dimensions.flatMap((dim) => dim.indicators).length + 1;
  let id = `IND-K3L-${pad(n, 3)}`;
  while (bank.dimensions.flatMap((dim) => dim.indicators).some((ind) => ind.id === id)) {
    n += 1;
    id = `IND-K3L-${pad(n, 3)}`;
  }
  return id;
}

function codeUsed(bank: Instrument, code: string, exceptId?: string): boolean {
  return bank.dimensions
    .flatMap((dim) => dim.indicators)
    .some((ind) => ind.id !== exceptId && ind.code.toLowerCase() === code.toLowerCase());
}

const VALIDATOR_MSG = "Hanya akun Validator aktif yang dapat mengelola bank instrumen.";

export async function addBankDimension(
  state: IshasState,
  actor: Actor | null,
  name: string,
  categoryId?: string,
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const clean = name.trim();
  if (clean.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
  const category = categoryId?.trim() || undefined;
  if (category && !K3_CATEGORY_MAP[category as keyof typeof K3_CATEGORY_MAP]) {
    return { ok: false, error: "Kategori tidak dikenal." };
  }
  const bank = state.instrument;
  const id = nextDimensionId(bank);
  bank.dimensions.push({ id, name: clean, categoryId: category as never, indicators: [] });
  touchBank(bank);
  await withTransaction(async (conn) => {
    await insertBankDimension(conn, {
      id,
      name: clean,
      categoryId: category ?? null,
      sortOrder: bank.dimensions.length,
    });
    await updateInstrumentChecksum(conn, bank.checksum, new Date(bank.updatedAt));
    await writeAudit(conn, actor as Actor, { objectId: id, action: "Menambah dimensi", note: clean }, bank.updatedAt);
  });
  return { ok: true, id };
}

export async function updateBankDimensionById(
  state: IshasState,
  actor: Actor | null,
  id: string,
  patch: { name?: string; categoryId?: string },
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const target = state.instrument.dimensions.find((dim) => dim.id === id);
  if (!target) return { ok: false, error: "Dimensi tidak ditemukan." };
  const name = patch.name?.trim() ?? target.name;
  if (name.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
  const category = patch.categoryId?.trim() || undefined;
  if (category && !K3_CATEGORY_MAP[category as keyof typeof K3_CATEGORY_MAP]) {
    return { ok: false, error: "Kategori tidak dikenal." };
  }
  target.name = name;
  target.categoryId = category as never;
  touchBank(state.instrument);
  await withTransaction(async (conn) => {
    await updateBankDimension(conn, id, { name, categoryId: category ?? null });
    await updateInstrumentChecksum(conn, state.instrument.checksum, new Date(state.instrument.updatedAt));
    await writeAudit(conn, actor as Actor, { objectId: id, action: "Mengubah dimensi", note: name }, state.instrument.updatedAt);
  });
  return { ok: true };
}

export async function deleteBankDimensionById(
  state: IshasState,
  actor: Actor | null,
  id: string,
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const target = state.instrument.dimensions.find((dim) => dim.id === id);
  if (!target) return { ok: false, error: "Dimensi tidak ditemukan." };
  const used = state.selfAssessmentSnapshots.some((snapshot) =>
    Object.keys(snapshot.answers ?? {}).some((key) =>
      target.indicators.some((ind) => ind.id === key),
    ),
  );
  state.instrument.dimensions = state.instrument.dimensions.filter((dim) => dim.id !== id);
  touchBank(state.instrument);
  await withTransaction(async (conn) => {
    await deleteBankDimension(conn, id);
    await updateInstrumentChecksum(conn, state.instrument.checksum, new Date(state.instrument.updatedAt));
    await writeAudit(
      conn,
      actor as Actor,
      {
        objectId: id,
        action: "Menghapus dimensi",
        note: used ? `${target.name} (punya riwayat snapshot beku)` : target.name,
      },
      state.instrument.updatedAt,
    );
  });
  return { ok: true };
}

export async function addBankIndicator(
  state: IshasState,
  actor: Actor | null,
  dimensionId: string,
  input: {
    code: string;
    title: string;
    prompt: string;
    answerType: InstrumentAnswerType;
    required: boolean;
    evidenceRequired: boolean;
    locationRequired: boolean;
    categoryId?: string;
    aspectId?: string;
  },
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const code = input.code.trim();
  const title = input.title.trim();
  const prompt = input.prompt.trim();
  if (!code) return { ok: false, error: "Kode indikator wajib diisi." };
  if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
  if (prompt.length < 10) return { ok: false, error: "Prompt minimal 10 karakter." };
  if (!ANSWER_TYPES.includes(input.answerType)) {
    return { ok: false, error: "Tipe jawaban tidak dikenal." };
  }
  const bank = state.instrument;
  const dim = bank.dimensions.find((item) => item.id === dimensionId);
  if (!dim) return { ok: false, error: "Dimensi tidak ditemukan." };
  if (codeUsed(bank, code)) return { ok: false, error: "Kode indikator sudah digunakan." };
  const categoryId = input.categoryId?.trim() || undefined;
  if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP]) {
    return { ok: false, error: "Kategori tidak dikenal." };
  }
  const aspectId = input.aspectId?.trim() || undefined;
  if (
    aspectId &&
    (!K3_ASPECT_MAP[aspectId] || (categoryId ?? dim.categoryId) !== K3_ASPECT_MAP[aspectId].categoryId)
  ) {
    return { ok: false, error: "Aspek tidak sesuai kategori." };
  }
  const id = nextIndicatorId(bank);
  dim.indicators.push({
    id,
    code,
    title,
    prompt,
    categoryId: (categoryId ?? dim.categoryId) as never,
    aspectId,
    answerType: input.answerType,
    required: input.required,
    evidenceRequired: input.evidenceRequired,
    locationRequired: input.locationRequired,
    weight: 1,
    options: defaultOptionsForType(input.answerType),
  });
  touchBank(bank);
  const created = dim.indicators.find((ind) => ind.id === id)!;
  await withTransaction(async (conn) => {
    await insertBankIndicator(conn, {
      id,
      dimensionId,
      code,
      title,
      prompt,
      answerType: input.answerType,
      required: input.required,
      evidenceRequired: input.evidenceRequired,
      locationRequired: input.locationRequired,
      weight: created.weight,
      categoryId: (categoryId ?? dim.categoryId) ?? null,
      aspectId: aspectId ?? null,
      sortOrder: dim.indicators.length,
      options: created.options,
    });
    await updateInstrumentChecksum(conn, bank.checksum, new Date(bank.updatedAt));
    await writeAudit(
      conn,
      actor as Actor,
      { objectId: id, action: "Menambah indikator", note: `${code} · ${title}` },
      bank.updatedAt,
    );
  });
  return { ok: true, id };
}

export async function updateBankIndicatorById(
  state: IshasState,
  actor: Actor | null,
  id: string,
  patch: {
    code?: string;
    title?: string;
    prompt?: string;
    answerType?: InstrumentAnswerType;
    required?: boolean;
    evidenceRequired?: boolean;
    locationRequired?: boolean;
    categoryId?: string;
    aspectId?: string;
  },
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const found = findIndicator(state, id);
  if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
  const code = patch.code?.trim() ?? found.indicator.code;
  const title = patch.title?.trim() ?? found.indicator.title;
  const prompt = patch.prompt?.trim() ?? found.indicator.prompt;
  if (!code) return { ok: false, error: "Kode indikator wajib diisi." };
  if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
  if (prompt.length < 10) return { ok: false, error: "Prompt minimal 10 karakter." };
  if (patch.answerType && !ANSWER_TYPES.includes(patch.answerType)) {
    return { ok: false, error: "Tipe jawaban tidak dikenal." };
  }
  if (codeUsed(state.instrument, code, id)) {
    return { ok: false, error: "Kode indikator sudah digunakan." };
  }
  const categoryId = patch.categoryId?.trim() || found.indicator.categoryId;
  if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP]) {
    return { ok: false, error: "Kategori tidak dikenal." };
  }
  const aspectId = patch.aspectId?.trim() || undefined;
  if (aspectId && (!K3_ASPECT_MAP[aspectId] || K3_ASPECT_MAP[aspectId].categoryId !== categoryId)) {
    return { ok: false, error: "Aspek tidak sesuai kategori." };
  }
  const nextType = patch.answerType ?? found.indicator.answerType;
  const typeChanged = nextType !== found.indicator.answerType;
  Object.assign(found.indicator, {
    code,
    title,
    prompt,
    answerType: nextType,
    required: patch.required ?? found.indicator.required,
    evidenceRequired: patch.evidenceRequired ?? found.indicator.evidenceRequired,
    locationRequired: patch.locationRequired ?? found.indicator.locationRequired,
    categoryId: categoryId as never,
    aspectId,
  });
  if (typeChanged) found.indicator.options = defaultOptionsForType(nextType);
  touchBank(state.instrument);
  await withTransaction(async (conn) => {
    await updateBankIndicator(conn, id, {
      code,
      title,
      prompt,
      answerType: nextType,
      required: found.indicator.required,
      evidenceRequired: found.indicator.evidenceRequired,
      locationRequired: found.indicator.locationRequired,
      categoryId: categoryId ?? null,
      aspectId: aspectId ?? null,
    });
    if (typeChanged) await replaceBankOptions(conn, id, found.indicator.options);
    await updateInstrumentChecksum(conn, state.instrument.checksum, new Date(state.instrument.updatedAt));
    await writeAudit(
      conn,
      actor as Actor,
      { objectId: id, action: "Mengubah indikator", note: `${code} · ${title}` },
      state.instrument.updatedAt,
    );
  });
  return { ok: true };
}

export async function deleteBankIndicatorById(
  state: IshasState,
  actor: Actor | null,
  id: string,
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const found = findIndicator(state, id);
  if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
  for (const dim of state.instrument.dimensions) {
    dim.indicators = dim.indicators.filter((ind) => ind.id !== id);
  }
  touchBank(state.instrument);
  await withTransaction(async (conn) => {
    await deleteBankIndicator(conn, id);
    await updateInstrumentChecksum(conn, state.instrument.checksum, new Date(state.instrument.updatedAt));
    await writeAudit(
      conn,
      actor as Actor,
      {
        objectId: id,
        action: "Menghapus indikator",
        note: `${found.indicator.code} (snapshot lama tetap beku)`,
      },
      state.instrument.updatedAt,
    );
  });
  return { ok: true };
}

export async function setBankIndicatorOptions(
  state: IshasState,
  actor: Actor | null,
  id: string,
  options: InstrumentOption[],
  weight?: number,
): Promise<ActionResult> {
  const auth = requireValidator(state, actor, VALIDATOR_MSG);
  if (auth) return { ok: false, error: auth.error };
  const found = findIndicator(state, id);
  if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
  if (options.length < 2) return { ok: false, error: "Minimal 2 opsi jawaban." };
  const seen = new Set<string>();
  for (const option of options) {
    const value = option.value.trim();
    const label = option.label.trim();
    if (!value) return { ok: false, error: "Nilai opsi tidak boleh kosong." };
    if (!label) return { ok: false, error: "Label opsi tidak boleh kosong." };
    if (!Number.isFinite(option.weight) || option.weight < 0 || option.weight > 100) {
      return { ok: false, error: "Bobot opsi harus 0–100." };
    }
    if (seen.has(value.toLowerCase())) return { ok: false, error: "Nilai opsi tidak boleh ganda." };
    seen.add(value.toLowerCase());
  }
  if (weight !== undefined && (!Number.isFinite(weight) || weight <= 0 || weight > 10)) {
    return { ok: false, error: "Pengali indikator harus 0–10." };
  }
  const normalized: InstrumentOption[] = options.map((option) => ({
    value: option.value.trim(),
    label: option.label.trim(),
    weight: Math.round(option.weight),
    isFinding: Boolean(option.isFinding),
  }));
  found.indicator.options = normalized;
  if (weight !== undefined) found.indicator.weight = weight;
  touchBank(state.instrument);
  await withTransaction(async (conn) => {
    await replaceBankOptions(conn, id, normalized);
    if (weight !== undefined) await updateBankIndicator(conn, id, { weight });
    await updateInstrumentChecksum(conn, state.instrument.checksum, new Date(state.instrument.updatedAt));
    await writeAudit(
      conn,
      actor as Actor,
      { objectId: id, action: "Mengatur bobot jawaban" },
      state.instrument.updatedAt,
    );
  });
  return { ok: true };
}
