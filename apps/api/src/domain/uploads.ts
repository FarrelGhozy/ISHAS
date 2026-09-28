// Unggah bukti gambar (lapor + jawaban mandiri) ke disk lokal — Fase 1.
// Validasi meniru `adapters/report-evidence.ts` + batas 20 MP mock-repository.

import { selectRegisteredInstitutions } from "../../../web/mocks/store/selectors";
import type { IshasState } from "../../../web/mocks/types";
import type { Actor } from "../router";
import { insertFileAsset } from "../repo/files";
import { imageInfo } from "../image";
import { newAssetId, saveStoredBlob, sha256Hex } from "../storage";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export type UploadResult = { ok: true; id: string } | { ok: false; error: string };

export async function uploadCampusPlan(
  state: IshasState,
  actor: Actor | null,
  institutionCode: string,
  file: File,
): Promise<UploadResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  if (
    !account ||
    account.status !== "Aktif" ||
    account.roleId !== "pesantren" ||
    !account.institutionCodes.includes(institutionCode)
  ) {
    return { ok: false, error: "Anda tidak berwenang mengganti denah pesantren ini." };
  }
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > MAX_BYTES) {
    return { ok: false, error: "Pilih PNG, JPEG atau WebP maksimum 5 MB." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = imageInfo(bytes);
  if (!info) return { ok: false, error: "Pilih PNG, JPEG atau WebP maksimum 5 MB." };
  if (Math.min(info.width, info.height) < 800) {
    return { ok: false, error: "Sisi pendek denah minimal 800 piksel." };
  }
  const id = newAssetId("campus-asset");
  const { storedPath } = await saveStoredBlob("campus-plan", file.type, bytes);
  await insertFileAsset({
    assetId: id,
    kind: "campus-plan",
    institutionCode,
    ownerRef: null,
    originalName: file.name.trim() || "denah",
    storedPath,
    mime: file.type,
    sizeBytes: bytes.length,
    width: info.width,
    height: info.height,
    sha256: sha256Hex(bytes),
    visibility: "Public",
    uploadedBy: account.id,
  });
  return { ok: true, id };
}

export async function uploadCompletionEvidence(
  state: IshasState,
  actor: Actor | null,
  institutionCode: string,
  file: File,
): Promise<UploadResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "pesantren") {
    return { ok: false, error: "Hanya Pesantren aktif yang dapat mengunggah bukti." };
  }
  if (!account.institutionCodes.includes(institutionCode)) {
    return { ok: false, error: "Anda tidak berwenang mengunggah bukti pesantren ini." };
  }
  if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode)) {
    return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
  }
  if (!ALLOWED.includes(file.type)) return { ok: false, error: "Pilih gambar PNG, JPEG atau WebP." };
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false, error: "Ukuran gambar harus lebih dari 0 dan maksimal 5 MB." };
  }
  const name = file.name.trim();
  if (!name || name.length > 200) {
    return { ok: false, error: "Nama file harus terisi dan maksimal 200 karakter." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = imageInfo(bytes);
  if (!info) return { ok: false, error: "Pilih gambar PNG, JPEG atau WebP." };
  if (info.width * info.height > 20_000_000) {
    return {
      ok: false,
      error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel.",
    };
  }
  const id = newAssetId("evidence-asset");
  const { storedPath } = await saveStoredBlob("completion-evidence", file.type, bytes);
  await insertFileAsset({
    assetId: id,
    kind: "completion-evidence",
    institutionCode,
    ownerRef: null,
    originalName: name,
    storedPath,
    mime: file.type,
    sizeBytes: bytes.length,
    width: info.width,
    height: info.height,
    sha256: sha256Hex(bytes),
    visibility: "Privat",
    uploadedBy: account.id,
  });
  return { ok: true, id };
}

export async function uploadEvidence(
  state: IshasState,
  actor: Actor | null,
  kind: "report-evidence" | "self-evidence",
  institutionCode: string,
  file: File,
): Promise<UploadResult> {
  const account = actor ? state.users.find((u) => u.id === actor.id) : undefined;
  if (actor && (!account || account.status !== "Aktif" || account.roleId !== "pesantren")) {
    return { ok: false, error: "Akun ini tidak dapat mengunggah bukti pelaporan." };
  }
  if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode)) {
    return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Pilih gambar PNG, JPEG atau WebP." };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false, error: "Ukuran gambar harus lebih dari 0 dan maksimal 5 MB." };
  }
  const name = file.name.trim();
  if (!name || name.length > 200) {
    return { ok: false, error: "Nama file harus terisi dan maksimal 200 karakter." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = imageInfo(bytes);
  if (!info) return { ok: false, error: "Pilih gambar PNG, JPEG atau WebP." };
  if (info.width * info.height > 20_000_000) {
    return { ok: false, error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel." };
  }
  const id = newAssetId("evidence-asset");
  const { storedPath } = await saveStoredBlob(kind, file.type, bytes);
  try {
    await insertFileAsset({
      assetId: id,
      kind,
      institutionCode,
      ownerRef: null,
      originalName: name,
      storedPath,
      mime: file.type,
      sizeBytes: bytes.length,
      width: info.width,
      height: info.height,
      sha256: sha256Hex(bytes),
      visibility: "Privat",
      uploadedBy: account?.id ?? "publik",
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gambar gagal disimpan.",
    };
  }
  return { ok: true, id };
}
