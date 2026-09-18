import { afterEach, beforeEach, expect, test } from "bun:test";
import { mockRepository } from "./mock-repository";
import { getEvidenceAsset, isEvidenceAssetId, validateEvidenceFile, EVIDENCE_MAX_BYTES } from "./report-evidence";
import { getState, storeActions } from "../store/mock-store";
import { selectPublicCampusMap } from "../processors/campus-map";
import { EMPTY_LAPOR_VALUES } from "~/features/publik/lib/lapor-validation";
import { isLaporEmpty, loadLaporDraft, saveLaporDraft } from "~/features/publik/lib/lapor-draft";

const descriptors = Object.fromEntries(["indexedDB", "createImageBitmap", "localStorage"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const assets = new Map<string, unknown>();
const manager = { id: "USR-003", name: "Penguji", role: "Pengelola Pesantren" };
const input = { institutionCode: "PSN-0018", reporterName: "Penguji", areaId: "AREA-001", title: "Bukti kabel koridor terbuka", description: "Kabel listrik terlihat terbuka di koridor asrama." };
const file = () => new File(["bytes-gambar-uji"], "bukti.png", { type: "image/png" });

// Fake minimal IDB hanya untuk kontrak adapter; dekode bitmap nyata diuji di browser.
beforeEach(() => {
  storeActions.resetMockData(); assets.clear();
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: {
    open() {
      const request = { result: {
        close() {},
        transaction() {
          const tx = { oncomplete: undefined as undefined | (() => void), objectStore() {
            return {
              put(value: unknown, id: string) { assets.set(id, value); queueMicrotask(() => tx.oncomplete?.()); },
              get(id: string) { const read = { result: assets.get(id), onsuccess: undefined as undefined | (() => void) }; queueMicrotask(() => { read.onsuccess?.(); tx.oncomplete?.(); }); return read; },
              clear() { assets.clear(); queueMicrotask(() => tx.oncomplete?.()); },
              delete(id: string) { assets.delete(id); queueMicrotask(() => tx.oncomplete?.()); },
            };
          } }; return tx;
        },
      }, onsuccess: undefined as undefined | (() => void) };
      queueMicrotask(() => request.onsuccess?.()); return request;
    },
  } });
  Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, value: async () => ({ width: 100, height: 100, close() {} }) });
});
afterEach(() => {
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

test("PNG/JPEG/WebP dan batas 5 MB; menolak kosong, terlalu besar dan MIME lain", () => {
  for (const type of ["image/png", "image/jpeg", "image/webp"]) expect(validateEvidenceFile({ type, size: EVIDENCE_MAX_BYTES, name: "bukti.jpg" })).toBeNull();
  for (const value of [{ type: "image/svg+xml", size: 100, name: "bukti.svg" }, { type: "image/png", size: 0, name: "bukti.png" }, { type: "image/png", size: EVIDENCE_MAX_BYTES + 1, name: "bukti.png" }]) expect(validateEvidenceFile(value)).not.toBeNull();
  expect(isEvidenceAssetId("/images/risk-map-campus-v1.png")).toBe(false);
});

test("upload → draft → kirim → validasi menjaga blob/id dan tidak publik", async () => {
  const uploaded = await mockRepository.uploadReportEvidence(manager, input.institutionCode, file());
  if (!uploaded.ok || !uploaded.id) throw Error("Upload gagal");
  expect((await getEvidenceAsset(uploaded.id))?.blob.size).toBe(file().size);
  const local = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { setItem(key: string, value: string) { local.set(key, value); }, getItem(key: string) { return local.get(key) ?? null; } } });
  const draft = { ...EMPTY_LAPOR_VALUES, ...input, evidenceName: "bukti.png", evidenceAssetId: uploaded.id };
  expect(saveLaporDraft(input.institutionCode, draft)).toBe(true);
  expect(loadLaporDraft(input.institutionCode)?.evidenceAssetId).toBe(uploaded.id);
  expect(isLaporEmpty({ ...EMPTY_LAPOR_VALUES, evidenceAssetId: uploaded.id })).toBe(false);
  const result = await mockRepository.submitLaporCepat(manager, draft);
  if (!result.ok || !result.id) throw Error("Kirim gagal");
  expect(getState().reports.find((report) => report.id === result.id)?.evidenceAssetId).toBe(uploaded.id);
  expect(storeActions.acceptReport(manager, result.id, "Tinggi", "Sedang").ok).toBe(true);
  expect((await getEvidenceAsset(uploaded.id))?.name).toBe("bukti.png");
  const publicItem = selectPublicCampusMap(getState(), input.institutionCode).items.find((item) => item.issue === input.title)!;
  expect("evidenceAssetId" in publicItem).toBe(false);
  expect("evidenceName" in publicItem).toBe(false);
});

test("lampiran hilang/nama salah/lintas scope tidak membuat laporan", async () => {
  const uploaded = await mockRepository.uploadReportEvidence(manager, input.institutionCode, file());
  if (!uploaded.ok || !uploaded.id) throw Error("Upload gagal");
  const count = getState().reports.length;
  for (const override of [
    { evidenceAssetId: "evidence-asset-00000000-0000-0000-0000-000000000000", evidenceName: "bukti.png" },
    { evidenceAssetId: uploaded.id, evidenceName: "salah.png" },
    { institutionCode: "PSN-0019", areaId: "AREA-005", evidenceAssetId: uploaded.id, evidenceName: "bukti.png" },
  ]) expect((await mockRepository.submitLaporCepat(manager, { ...input, ...override })).ok).toBe(false);
  expect(getState().reports).toHaveLength(count);
});

test("gambar rusak/dekode gagal atau role dilarang tidak menyimpan aset", async () => {
  expect((await mockRepository.uploadReportEvidence({ id: "USR-001", name: "Penguji" }, input.institutionCode, file())).ok).toBe(false);
  Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, value: async () => { throw Error("Rusak"); } });
  expect((await mockRepository.uploadReportEvidence(manager, input.institutionCode, file())).ok).toBe(false);
  expect(assets.size).toBe(0);
});

test("gagal penyimpanan gambar tidak membuat laporan dan isian boleh dikirim tanpa bukti", async () => {
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: undefined });
  expect((await mockRepository.uploadReportEvidence(manager, input.institutionCode, file())).ok).toBe(false);
  expect((await mockRepository.submitLaporCepat(manager, input)).ok).toBe(true);
});

test("reset demo membersihkan blob bukti dan referensi laporan", async () => {
  const uploaded = await mockRepository.uploadReportEvidence(manager, input.institutionCode, file());
  if (!uploaded.ok || !uploaded.id) throw Error("Upload gagal");
  await mockRepository.submitLaporCepat(manager, { ...input, evidenceAssetId: uploaded.id, evidenceName: "bukti.png" });
  await mockRepository.reset();
  expect(await getEvidenceAsset(uploaded.id)).toBeUndefined();
  expect(getState().reports.every((report) => !report.evidenceAssetId)).toBe(true);
});
