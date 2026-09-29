// Validasi + mutasi SAM-iSAFE (Fase 4) — port 1:1 `mock-store.ts` §SAM
// (bank kategori/soal, pengamatan, tindak lanjut) + fungsi murni `sam-isafe.ts`.
// Pesan bahasa Indonesia identik mock. Skor dinamis: maks = soal aktif × 2.

import {
  SAM_KINDS,
  isValidSamDate,
  samActiveQuestions,
  samCompute,
} from "../../../web/mocks/sam-isafe";
import { selectRegisteredInstitutions } from "../../../web/mocks/store/selectors";
import type {
  IshasState,
  SamAnswer,
  SamAssessment,
  SamFollowUp,
  SamFollowUpStatus,
} from "../../../web/mocks/types";
import type { Actor } from "../router";
import { getFileAsset, setFileAssetOwner } from "../repo/files";
import { insertAudit, nextSequence, withTransaction, type Tx } from "../repo/writes";
import {
  deleteSamAssessmentRow,
  deleteSamCategoryRow,
  deleteSamQuestionRow,
  insertSamAssessment,
  insertSamCategory,
  insertSamFollowUp,
  insertSamQuestion,
  updateSamAssessmentFields,
  updateSamCategoryFields,
  updateSamFollowUpFields,
  updateSamQuestionFields,
} from "../repo/sam";

export type SamActionResult = { ok: true; id?: string } | { ok: false; error: string };

const nowIso = (): string => new Date().toISOString();
const pad = (value: number, size: number): string => String(value).padStart(size, "0");

type AuditInput = {
  objectType: string;
  objectId: string;
  institutionCode?: string;
  action: string;
  note?: string;
};

function requireValidator(state: IshasState, actor: Actor | null, message: string): { error: string } | null {
  const account = actor ? state.users.find((user) => user.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
    return { error: message };
  }
  return null;
}

async function writeAudit(conn: Tx, actor: Actor, entry: AuditInput, at: string): Promise<void> {
  await insertAudit(conn, {
    id: "",
    objectType: entry.objectType,
    objectId: entry.objectId,
    actorAccountId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as never,
    institutionCode: entry.institutionCode,
    action: entry.action,
    note: entry.note,
    at,
  });
}

function assessmentId(sequence: number): string {
  return `SAM-${pad(sequence, 4)}`;
}

function followUpId(sequence: number): string {
  return `SMF-${pad(sequence, 4)}`;
}

// ---- Bank kategori ----

export async function addSamCategory(
  state: IshasState,
  actor: Actor | null,
  input: { name: string; description?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menambah kategori.");
  if (auth) return { ok: false, error: auth.error };
  const name = input.name.trim();
  if (name.length < 3) return { ok: false, error: "Nama kategori minimal 3 karakter." };
  if (state.samCategories.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "Nama kategori sudah digunakan." };
  }
  const description = input.description?.trim() ?? "";
  if (description.length > 280) return { ok: false, error: "Deskripsi maksimal 280 karakter." };
  const used = new Set(state.samCategories.map((item) => Number(item.id.replace("SAM-KAT-", "")) || 0));
  const sortOrder = Math.max(0, ...state.samCategories.map((item) => item.sortOrder)) + 1;
  let n = sortOrder;
  while (used.has(n)) n += 1;
  const id = `SAM-KAT-${pad(n, 2)}`;
  const at = nowIso();
  await withTransaction(async (conn) => {
    await insertSamCategory(conn, { id, name, description, sortOrder, isActive: true });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamCategory",
      objectId: id,
      action: "Menambah kategori SAM-iSAFE",
      note: name,
    }, at);
  });
  return { ok: true, id };
}

export async function updateSamCategory(
  state: IshasState,
  actor: Actor | null,
  categoryId: string,
  patch: { name?: string; description?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengubah kategori.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samCategories.find((item) => item.id === categoryId);
  if (!target) return { ok: false, error: "Kategori tidak ditemukan." };
  const name = patch.name?.trim() ?? target.name;
  if (name.length < 3) return { ok: false, error: "Nama kategori minimal 3 karakter." };
  if (
    state.samCategories.some(
      (item) => item.id !== categoryId && item.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    return { ok: false, error: "Nama kategori sudah digunakan." };
  }
  const description = patch.description?.trim() ?? target.description;
  if (description.length > 280) return { ok: false, error: "Deskripsi maksimal 280 karakter." };
  await withTransaction(async (conn) => {
    await updateSamCategoryFields(conn, categoryId, { name, description });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamCategory",
      objectId: categoryId,
      action: "Mengubah kategori SAM-iSAFE",
      note: name,
    }, nowIso());
  });
  return { ok: true };
}

export async function deleteSamCategory(
  state: IshasState,
  actor: Actor | null,
  categoryId: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menghapus kategori.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samCategories.find((item) => item.id === categoryId);
  if (!target) return { ok: false, error: "Kategori tidak ditemukan." };
  if (state.samCategories.length <= 1) {
    return { ok: false, error: "Kategori terakhir tidak dapat dihapus." };
  }
  const isi = state.samQuestions.filter((item) => item.categoryId === categoryId);
  if (isi.length > 0) {
    return {
      ok: false,
      error: `Kategori masih berisi ${isi.length} pertanyaan. Pindahkan atau hapus dulu.`,
    };
  }
  await withTransaction(async (conn) => {
    await deleteSamCategoryRow(conn, categoryId);
    await writeAudit(conn, actor as Actor, {
      objectType: "SamCategory",
      objectId: categoryId,
      action: "Menghapus kategori SAM-iSAFE",
      note: `${target.name} (pengamatan baru memakai bank sisa)`,
    }, nowIso());
  });
  return { ok: true };
}

// ---- Bank pertanyaan ----

export async function addSamQuestion(
  state: IshasState,
  actor: Actor | null,
  input: { categoryId: string; text: string; panduan?: string; contohBukti?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menambah pertanyaan.");
  if (auth) return { ok: false, error: auth.error };
  const category = state.samCategories.find((item) => item.id === input.categoryId);
  if (!category) return { ok: false, error: "Kategori tidak ditemukan." };
  const text = input.text.trim();
  if (text.length < 10) return { ok: false, error: "Teks pertanyaan minimal 10 karakter." };
  const panduan = input.panduan?.trim() ?? "";
  const contohBukti = input.contohBukti?.trim() ?? "";
  if (panduan.length > 500) return { ok: false, error: "Panduan maksimal 500 karakter." };
  if (contohBukti.length > 280) return { ok: false, error: "Contoh bukti maksimal 280 karakter." };
  const sortOrder =
    Math.max(
      0,
      ...state.samQuestions
        .filter((item) => item.categoryId === input.categoryId)
        .map((item) => item.sortOrder),
    ) + 1;
  const used = new Set(state.samQuestions.map((item) => Number(item.id.replace("SAM-Q-", "")) || 0));
  let n = state.samQuestions.length + 1;
  while (used.has(n)) n += 1;
  const id = `SAM-Q-${pad(n, 3)}`;
  await withTransaction(async (conn) => {
    await insertSamQuestion(conn, {
      id,
      categoryId: input.categoryId,
      text,
      panduan,
      contohBukti,
      sortOrder,
      isActive: true,
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamQuestion",
      objectId: id,
      action: "Menambah pertanyaan SAM-iSAFE",
      note: category.name,
    }, nowIso());
  });
  return { ok: true, id };
}

export async function updateSamQuestion(
  state: IshasState,
  actor: Actor | null,
  questionId: string,
  patch: { text?: string; panduan?: string; contohBukti?: string; categoryId?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengubah pertanyaan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samQuestions.find((item) => item.id === questionId);
  if (!target) return { ok: false, error: "Pertanyaan tidak ditemukan." };
  const text = patch.text?.trim() ?? target.text;
  if (text.length < 10) return { ok: false, error: "Teks pertanyaan minimal 10 karakter." };
  const panduan = patch.panduan?.trim() ?? target.panduan ?? "";
  const contohBukti = patch.contohBukti?.trim() ?? target.contohBukti ?? "";
  if (panduan.length > 500) return { ok: false, error: "Panduan maksimal 500 karakter." };
  if (contohBukti.length > 280) return { ok: false, error: "Contoh bukti maksimal 280 karakter." };
  const categoryId = patch.categoryId ?? target.categoryId;
  const category = state.samCategories.find((item) => item.id === categoryId);
  if (!category) return { ok: false, error: "Kategori tujuan tidak ditemukan." };
  const moving = categoryId !== target.categoryId;
  const sortOrder = moving
    ? Math.max(
        0,
        ...state.samQuestions
          .filter((item) => item.categoryId === categoryId)
          .map((item) => item.sortOrder),
      ) + 1
    : undefined;
  await withTransaction(async (conn) => {
    await updateSamQuestionFields(conn, questionId, {
      categoryId: moving ? categoryId : undefined,
      sortOrder,
      text,
      panduan,
      contohBukti,
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamQuestion",
      objectId: questionId,
      action: "Mengubah pertanyaan SAM-iSAFE",
      note: `${category.name} (pengamatan baru memakai teks baru)`,
    }, nowIso());
  });
  return { ok: true };
}

export async function deleteSamQuestion(
  state: IshasState,
  actor: Actor | null,
  questionId: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menghapus pertanyaan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samQuestions.find((item) => item.id === questionId);
  if (!target) return { ok: false, error: "Pertanyaan tidak ditemukan." };
  const dipakai = state.samAssessments.filter((item) => item.answers[questionId] !== undefined).length;
  if (dipakai > 0) {
    return {
      ok: false,
      error: `Sudah dipakai ${dipakai} pengamatan. Nonaktifkan saja agar riwayat utuh.`,
    };
  }
  const remaining = state.samQuestions
    .filter((item) => item.categoryId === target.categoryId && item.id !== questionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  await withTransaction(async (conn) => {
    await deleteSamQuestionRow(conn, questionId);
    for (const [index, item] of remaining.entries()) {
      await updateSamQuestionFields(conn, item.id, { sortOrder: index + 1 });
    }
    await writeAudit(conn, actor as Actor, {
      objectType: "SamQuestion",
      objectId: questionId,
      action: "Menghapus pertanyaan SAM-iSAFE",
      note: `${target.id} (belum pernah dipakai pengamatan)`,
    }, nowIso());
  });
  return { ok: true };
}

export async function moveSamQuestion(
  state: IshasState,
  actor: Actor | null,
  questionId: string,
  direction: "naik" | "turun",
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengurutkan pertanyaan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samQuestions.find((item) => item.id === questionId);
  if (!target) return { ok: false, error: "Pertanyaan tidak ditemukan." };
  const group = state.samQuestions
    .filter((item) => item.categoryId === target.categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const posisi = group.findIndex((item) => item.id === questionId);
  const tukar = direction === "naik" ? posisi - 1 : posisi + 1;
  if (tukar < 0 || tukar >= group.length) return { ok: false, error: "Sudah di ujung urutan." };
  const lawan = group[tukar];
  await withTransaction(async (conn) => {
    await updateSamQuestionFields(conn, target.id, { sortOrder: lawan.sortOrder });
    await updateSamQuestionFields(conn, lawan.id, { sortOrder: target.sortOrder });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamQuestion",
      objectId: questionId,
      action: "Mengurutkan pertanyaan SAM-iSAFE",
      note: `${direction} dalam ${target.categoryId}`,
    }, nowIso());
  });
  return { ok: true };
}

export async function setSamQuestionActive(
  state: IshasState,
  actor: Actor | null,
  questionId: string,
  isActive: boolean,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengubah pertanyaan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samQuestions.find((item) => item.id === questionId);
  if (!target) return { ok: false, error: "Pertanyaan tidak ditemukan." };
  await withTransaction(async (conn) => {
    await updateSamQuestionFields(conn, questionId, { isActive });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamQuestion",
      objectId: questionId,
      action: isActive ? "Mengaktifkan pertanyaan SAM-iSAFE" : "Menonaktifkan pertanyaan",
    }, nowIso());
  });
  return { ok: true };
}

// ---- Pengamatan ----

export async function createSamAssessment(
  state: IshasState,
  actor: Actor | null,
  input: {
    institutionCode: string;
    areaId?: string;
    manualLocation?: string;
    observedAt: string;
    observedTime?: string;
    kind: string;
    observerName: string;
    note?: string;
  },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat membuat pengamatan.");
  if (auth) return { ok: false, error: auth.error };
  if (
    !input.institutionCode ||
    !selectRegisteredInstitutions(state).some((item) => item.code === input.institutionCode)
  ) {
    return { ok: false, error: "Pilih pesantren terdaftar." };
  }
  const areaOk =
    !input.areaId ||
    state.areas.some(
      (area) => area.id === input.areaId && area.institutionCode === input.institutionCode,
    );
  if (!areaOk) return { ok: false, error: "Area tidak sesuai pesantren." };
  if (!input.manualLocation?.trim() && !input.areaId) {
    return { ok: false, error: "Lokasi wajib diisi (area atau deskripsi manual)." };
  }
  if (!input.observedAt) return { ok: false, error: "Tanggal pengamatan wajib diisi." };
  if (!isValidSamDate(input.observedAt)) {
    return { ok: false, error: "Tanggal pengamatan tidak valid." };
  }
  if (!SAM_KINDS.includes(input.kind)) {
    return { ok: false, error: "Jenis pengamatan tidak dikenal." };
  }
  if (input.observerName.trim().length < 2) {
    return { ok: false, error: "Nama pengamat minimal 2 karakter." };
  }
  const created = nowIso();
  let id = "";
  await withTransaction(async (conn) => {
    const sequence = await nextSequence(conn, "assessment");
    id = assessmentId(sequence);
    const assessment: SamAssessment = {
      id,
      institutionCode: input.institutionCode,
      areaId: input.areaId || undefined,
      manualLocation: input.manualLocation?.trim() || undefined,
      observedAt: input.observedAt,
      observedTime: input.observedTime || undefined,
      kind: input.kind,
      observerName: input.observerName.trim(),
      note: input.note?.trim() || undefined,
      observerAccountId: actor?.id,
      status: "Berlangsung",
      answers: {},
      totalScore: 0,
      maxScore: samActiveQuestions(state.samQuestions).length * 2,
      percent: 0,
      riskLevel: "Risiko Tinggi",
      createdAt: created,
    };
    await insertSamAssessment(conn, assessment);
    await writeAudit(conn, actor as Actor, {
      objectType: "SamAssessment",
      objectId: id,
      institutionCode: input.institutionCode,
      action: "Membuat pengamatan SAM-iSAFE",
    }, created);
  });
  return { ok: true, id };
}

export async function saveSamAnswer(
  state: IshasState,
  actor: Actor | null,
  input: {
    assessmentId: string;
    questionId: string;
    score: number;
    note?: string;
    evidenceName?: string;
    evidenceAssetId?: string;
  },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengisi.");
  if (auth) return { ok: false, error: auth.error };
  if (![0, 1, 2].includes(input.score)) return { ok: false, error: "Nilai harus 0, 1, atau 2." };
  const target = state.samAssessments.find((item) => item.id === input.assessmentId);
  if (!target) return { ok: false, error: "Pengamatan tidak ditemukan." };
  if (target.status === "Selesai") {
    return { ok: false, error: "Pengamatan selesai tidak dapat diubah." };
  }
  const question = state.samQuestions.find((item) => item.id === input.questionId);
  if (!question || !question.isActive) return { ok: false, error: "Pertanyaan tidak aktif." };
  const evidenceName = input.evidenceName?.trim() ?? "";
  const evidenceAssetId = input.evidenceAssetId?.trim() ?? "";
  if (evidenceAssetId || evidenceName) {
    if (!/^evidence-asset-[0-9a-f-]{36}$/.test(evidenceAssetId)) {
      return { ok: false, error: "Lampiran bukti tidak sah. Pilih gambar kembali." };
    }
    if (!evidenceName) return { ok: false, error: "Nama bukti wajib mengikuti berkas yang diunggah." };
    // D-26.h.d: server memverifikasi blob + kind + institusi + nama (cermin lapor-cepat).
    const asset = await getFileAsset(evidenceAssetId);
    if (
      !asset ||
      String(asset.kind) !== "sam-evidence" ||
      String(asset.institution_code) !== target.institutionCode ||
      String(asset.original_name) !== evidenceName
    ) {
      return {
        ok: false,
        error: "Gambar bukti tidak tersedia atau tidak sesuai. Pilih ulang atau lepas lampiran.",
      };
    }
  }
  const answers: Record<string, SamAnswer> = {
    ...target.answers,
    [input.questionId]: {
      score: input.score as 0 | 1 | 2,
      note: input.note?.trim() ?? "",
      evidenceName: evidenceName || undefined,
      evidenceAssetId: evidenceAssetId || undefined,
    },
  };
  const hitung = samCompute({ answers }, state.samQuestions);
  await withTransaction(async (conn) => {
    await updateSamAssessmentFields(conn, input.assessmentId, {
      answers,
      totalScore: hitung.total,
      maxScore: hitung.max,
      percent: hitung.percent,
      riskLevel: hitung.risk,
    });
    if (evidenceAssetId) {
      await setFileAssetOwner(conn, evidenceAssetId, `${input.assessmentId}:${input.questionId}`);
    }
  });
  return { ok: true };
}

export async function deleteSamDraft(
  state: IshasState,
  actor: Actor | null,
  assessmentIdInput: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menghapus draft.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samAssessments.find((item) => item.id === assessmentIdInput);
  if (!target) return { ok: false, error: "Pengamatan tidak ditemukan." };
  if (target.status === "Selesai") {
    return { ok: false, error: "Pengamatan selesai tidak dapat dihapus." };
  }
  await withTransaction(async (conn) => {
    await deleteSamAssessmentRow(conn, assessmentIdInput);
    await writeAudit(conn, actor as Actor, {
      objectType: "SamAssessment",
      objectId: assessmentIdInput,
      institutionCode: target.institutionCode,
      action: "Menghapus draft pengamatan SAM-iSAFE",
    }, nowIso());
  });
  return { ok: true };
}

export async function completeSamAssessment(
  state: IshasState,
  actor: Actor | null,
  assessmentIdInput: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat menyelesaikan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samAssessments.find((item) => item.id === assessmentIdInput);
  if (!target) return { ok: false, error: "Pengamatan tidak ditemukan." };
  const kurang = samActiveQuestions(state.samQuestions).filter((item) => !target.answers[item.id]);
  if (kurang.length > 0) {
    return { ok: false, error: `Masih ada ${kurang.length} pertanyaan belum dinilai.` };
  }
  const hitung = samCompute(target, state.samQuestions);
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateSamAssessmentFields(conn, assessmentIdInput, {
      totalScore: hitung.total,
      maxScore: hitung.max,
      percent: hitung.percent,
      riskLevel: hitung.risk,
      status: "Selesai",
      completedAt: new Date(at),
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamAssessment",
      objectId: assessmentIdInput,
      institutionCode: target.institutionCode,
      action: "Menyelesaikan pengamatan SAM-iSAFE",
      note: `${hitung.total}/${hitung.max} (${hitung.percent}%)`,
    }, at);
  });
  return { ok: true };
}

export async function reviewSamAssessment(
  state: IshasState,
  actor: Actor | null,
  assessmentIdInput: string,
  note?: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mereview.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samAssessments.find((item) => item.id === assessmentIdInput);
  if (!target) return { ok: false, error: "Pengamatan tidak ditemukan." };
  if (target.status !== "Selesai") {
    return { ok: false, error: "Hanya pengamatan Selesai yang dapat ditinjau." };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateSamAssessmentFields(conn, assessmentIdInput, {
      reviewedBy: actor?.name ?? "Validator",
      reviewedById: actor?.id ?? null,
      reviewedAt: new Date(at),
      reviewNote: note?.trim() || null,
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamAssessment",
      objectId: assessmentIdInput,
      institutionCode: target.institutionCode,
      action: "Meninjau pengamatan SAM-iSAFE",
      note: note?.trim() || undefined,
    }, at);
  });
  return { ok: true };
}

// ---- Tindak lanjut ----

export async function createSamFollowUp(
  state: IshasState,
  actor: Actor | null,
  input: { assessmentId: string; questionId: string; pic: string; dueDate: string; note?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat membuat tindak lanjut.");
  if (auth) return { ok: false, error: auth.error };
  const assessment = state.samAssessments.find((item) => item.id === input.assessmentId);
  if (!assessment) return { ok: false, error: "Pengamatan tidak ditemukan." };
  const question = state.samQuestions.find((item) => item.id === input.questionId);
  if (!question) return { ok: false, error: "Pertanyaan tidak ditemukan." };
  const answer = assessment.answers[input.questionId];
  if (!answer || answer.score > 1) {
    return { ok: false, error: "Tindak lanjut hanya untuk temuan (skor 0 atau 1)." };
  }
  if (
    state.samFollowUps.some(
      (item) =>
        item.assessmentId === input.assessmentId &&
        item.questionId === input.questionId &&
        item.status !== "Dibatalkan",
    )
  ) {
    return { ok: false, error: "Temuan ini sudah mempunyai tindak lanjut aktif." };
  }
  const pic = input.pic.trim();
  if (pic.length < 2) return { ok: false, error: "Penanggung jawab minimal 2 karakter." };
  if (!input.dueDate) return { ok: false, error: "Tenggat wajib diisi." };
  if (!isValidSamDate(input.dueDate)) {
    return { ok: false, error: "Tenggat tidak valid." };
  }
  if (input.dueDate < assessment.observedAt) {
    return { ok: false, error: "Tenggat tidak boleh sebelum tanggal pengamatan." };
  }
  const at = nowIso();
  let id = "";
  await withTransaction(async (conn) => {
    const sequence = await nextSequence(conn, "follow_up");
    id = followUpId(sequence);
    const followUp: SamFollowUp = {
      id,
      assessmentId: input.assessmentId,
      questionId: input.questionId,
      title: question.text,
      note: input.note?.trim() || undefined,
      pic,
      dueDate: input.dueDate,
      status: "Belum ditindaklanjuti",
      createdBy: actor?.id,
      createdAt: at,
      updatedAt: at,
    };
    await insertSamFollowUp(conn, followUp);
    await writeAudit(conn, actor as Actor, {
      objectType: "SamFollowUp",
      objectId: id,
      institutionCode: assessment.institutionCode,
      action: "Membuat tindak lanjut SAM-iSAFE",
      note: `${assessment.id} · ${pic}`,
    }, at);
  });
  return { ok: true, id };
}

export async function updateSamFollowUp(
  state: IshasState,
  actor: Actor | null,
  followUpIdInput: string,
  input: { status?: SamFollowUpStatus; pic?: string; dueDate?: string; note?: string },
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat mengubah tindak lanjut.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samFollowUps.find((item) => item.id === followUpIdInput);
  if (!target) return { ok: false, error: "Tindak lanjut tidak ditemukan." };
  if (target.status === "Dibatalkan") {
    return { ok: false, error: "Tindak lanjut yang dibatalkan tidak dapat diubah." };
  }
  if (input.status && !["Belum ditindaklanjuti", "Berjalan", "Selesai"].includes(input.status)) {
    return { ok: false, error: "Status tidak sah. Pembatalan memakai aksi Batal." };
  }
  if (input.pic !== undefined && input.pic.trim().length < 2) {
    return { ok: false, error: "Penanggung jawab minimal 2 karakter." };
  }
  if (input.dueDate) {
    if (!isValidSamDate(input.dueDate)) {
      return { ok: false, error: "Tenggat tidak valid." };
    }
    const assessment = state.samAssessments.find((item) => item.id === target.assessmentId);
    if (assessment && input.dueDate < assessment.observedAt) {
      return { ok: false, error: "Tenggat tidak boleh sebelum tanggal pengamatan." };
    }
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateSamFollowUpFields(conn, followUpIdInput, {
      status: input.status,
      pic: input.pic !== undefined ? input.pic.trim() : undefined,
      dueDate: input.dueDate || undefined,
      note: input.note !== undefined ? input.note.trim() || null : undefined,
      doneAt: input.status !== undefined ? (input.status === "Selesai" ? new Date(at) : null) : undefined,
      updatedAt: new Date(at),
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamFollowUp",
      objectId: followUpIdInput,
      action: "Mengubah tindak lanjut SAM-iSAFE",
      note: input.status ?? "Perbarui rencana",
    }, at);
  });
  return { ok: true };
}

export async function cancelSamFollowUp(
  state: IshasState,
  actor: Actor | null,
  followUpIdInput: string,
  reason: string,
): Promise<SamActionResult> {
  const auth = requireValidator(state, actor, "Hanya akun Validator aktif yang dapat membatalkan.");
  if (auth) return { ok: false, error: auth.error };
  const target = state.samFollowUps.find((item) => item.id === followUpIdInput);
  if (!target) return { ok: false, error: "Tindak lanjut tidak ditemukan." };
  if (target.status === "Selesai" || target.status === "Dibatalkan") {
    return { ok: false, error: "Tindak lanjut selesai/batal tidak dapat dibatalkan." };
  }
  if (reason.trim().length < 10) {
    return { ok: false, error: "Alasan pembatalan minimal 10 karakter." };
  }
  const at = nowIso();
  await withTransaction(async (conn) => {
    await updateSamFollowUpFields(conn, followUpIdInput, {
      status: "Dibatalkan",
      cancelReason: reason.trim(),
      updatedAt: new Date(at),
    });
    await writeAudit(conn, actor as Actor, {
      objectType: "SamFollowUp",
      objectId: followUpIdInput,
      action: "Membatalkan tindak lanjut SAM-iSAFE",
      note: reason.trim(),
    }, at);
  });
  return { ok: true };
}
