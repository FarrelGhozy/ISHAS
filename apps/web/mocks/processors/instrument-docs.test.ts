import { expect, test } from "bun:test";
import { SEED } from "../seed/seed";
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
  expect(filterDocRows(rows, { q: "beban kerja", categoryId: "Semua", visibility: "Semua" }).length).toBe(1);
  expect(
    filterDocRows(rows, { q: "", categoryId: "KAT-PSIKOSOSIAL", visibility: "Semua" }).length,
  ).toBe(2);
  expect(filterDocRows(rows, { q: "", categoryId: "Semua", visibility: "Public" }).length).toBe(2);
  expect(filterDocRows(rows, { q: "detail-air", categoryId: "Semua", visibility: "Semua" }).length).toBe(1);
});
