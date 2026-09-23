import { expect, test } from "bun:test";
import {
  buildSeedPdfBlob,
  hasPdfHeader,
  isInstrumentDocAssetId,
  isSeedInstrumentDocAssetId,
  validateInstrumentDocFile,
} from "./instrument-docs";

test("validasi menolak non-PDF dan berkas terlalu besar", () => {
  expect(validateInstrumentDocFile({ name: "foto.png", size: 100, type: "image/png" })).toBe(
    "Hanya berkas PDF yang didukung.",
  );
  expect(validateInstrumentDocFile({ name: "dok.txt", size: 100, type: "application/pdf" })).toBe(
    "Hanya berkas PDF yang didukung.",
  );
  expect(
    validateInstrumentDocFile({ name: "besar.pdf", size: 11 * 1024 * 1024, type: "application/pdf" }),
  ).toBe("Ukuran PDF harus lebih dari 0 dan maksimal 10 MB.");
  expect(validateInstrumentDocFile({ name: "ok.pdf", size: 1024, type: "application/pdf" })).toBeNull();
});

test("pola id membedakan unggahan dan seed", () => {
  expect(isInstrumentDocAssetId("instrument-doc-123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  expect(isInstrumentDocAssetId("seed-instrument-doc-IND-K3L-001")).toBe(true);
  expect(isInstrumentDocAssetId("evidence-asset-123")).toBe(false);
  expect(isSeedInstrumentDocAssetId("seed-instrument-doc-IND-K3L-001")).toBe(true);
  expect(isSeedInstrumentDocAssetId("instrument-doc-123e4567-e89b-12d3-a456-426614174000")).toBe(false);
});

test("PDF seed diawali header %PDF-", async () => {
  const blob = buildSeedPdfBlob("IND-K3L-001", "Instalasi listrik", "detail.pdf");
  expect(blob.type).toBe("application/pdf");
  expect(await hasPdfHeader(blob)).toBe(true);
  expect(await hasPdfHeader(new Blob(["bukan pdf"], { type: "application/pdf" }))).toBe(false);
});
