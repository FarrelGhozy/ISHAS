import { expect, test } from "bun:test";
import { SEED } from "../seed/seed";
import type { InstrumentDoc } from "../types";
import {
  filterDocRows,
  selectIndicatorDocRows,
  selectPublicDocRows,
  stripPrivateAsset,
} from "./instrument-docs";

const rows = selectIndicatorDocRows(SEED);

test("baris mencakup seluruh 10 indikator INS-v1.1 beserta dokumen seed", () => {
  expect(rows.length).toBe(10);
  expect(selectPublicDocRows(rows).length).toBe(4);
  expect(selectPublicDocRows(rows).filter((r) => r.doc?.visibility === "Public").length).toBe(2);
});

test("aset privat disembunyikan dari pembaca umum", () => {
  const privat = rows.find((r) => r.doc?.visibility === "Privat")!;
  expect(stripPrivateAsset(privat, false).doc?.assetId).toBe("");
  expect(stripPrivateAsset(privat, true).doc?.assetId).not.toBe("");
  const publik = rows.find((r) => r.doc?.visibility === "Public")!;
  expect(stripPrivateAsset(publik, false).doc?.assetId).not.toBe("");
});

test("filter mencari kode/judul/nama file + kategori + visibilitas", () => {
  expect(
    filterDocRows(rows, { q: "beban kerja", categoryId: "Semua", visibility: "Semua" }).length,
  ).toBe(1);
  expect(
    filterDocRows(rows, { q: "", categoryId: "KAT-PSIKOSOSIAL", visibility: "Semua" }).length,
  ).toBe(2);
  expect(filterDocRows(rows, { q: "", categoryId: "Semua", visibility: "Public" }).length).toBe(2);
  expect(
    filterDocRows(rows, { q: "detail-air", categoryId: "Semua", visibility: "Semua" }).length,
  ).toBe(1);
});

test("entri dokumen manual (D-16.g) tampil sebagai baris pustaka", () => {
  const manual: InstrumentDoc = {
    id: "DOC-IND-DOC-001",
    indicatorId: "IND-DOC-001",
    categoryId: "KAT-KESELAMATAN",
    aspectId: "ASP-KES-001",
    indicatorCode: "IND-DOC-001",
    indicatorTitle: "Dokumen tambahan peneliti",
    manual: true,
    fileName: "tambahan.pdf",
    fileSize: 1024,
    mime: "application/pdf",
    assetId: "instrument-doc-123e4567-e89b-12d3-a456-426614174000",
    visibility: "Privat",
    updatedBy: "Dr. M. Ridwan",
    updatedAt: "2026-09-23T00:00:00.000Z",
  };
  const withManual = selectIndicatorDocRows({
    ...SEED,
    instrumentDocs: [...SEED.instrumentDocs, manual],
  });
  expect(withManual.length).toBe(11);
  const row = withManual.find((r) => r.indicatorId === "IND-DOC-001")!;
  expect(row.code).toBe("IND-DOC-001");
  expect(row.title).toBe("Dokumen tambahan peneliti");
  expect(row.categoryName).toBe("Keselamatan");
  expect(row.aspectName).toBe("Instalasi listrik");
  expect(selectPublicDocRows(withManual).length).toBe(5);
});
