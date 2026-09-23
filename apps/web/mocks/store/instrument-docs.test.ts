import { beforeEach, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";
import { loadState, MOCK_STORAGE_KEY } from "./state";
import { SEED } from "../seed/seed";

const PENELITI = { id: "USR-002", name: "Dr. M. Ridwan" };
const PENGELOLA = { id: "USR-003", name: "Ust. K.H. Mustofa Kamal" };

beforeEach(() => {
  storeActions.resetMockData();
});

test("hanya peneliti aktif yang dapat mengelola berkas", () => {
  const input = {
    indicatorId: "IND-K3L-002",
    fileName: "detail.pdf",
    fileSize: 1000,
    assetId: "instrument-doc-123e4567-e89b-12d3-a456-426614174000",
  };
  expect(storeActions.upsertInstrumentDoc(PENGELOLA, input).ok).toBe(false);
  expect(storeActions.setInstrumentDocVisibility(PENGELOLA, "IND-K3L-001", "Public").ok).toBe(
    false,
  );
  expect(storeActions.deleteInstrumentDoc(PENGELOLA, "IND-K3L-001").ok).toBe(false);
  expect(
    storeActions.upsertInstrumentDoc(PENELITI, { ...input, indicatorId: "TIDAK-ADA" }).ok,
  ).toBe(false);
});

test("unggah, ubah visibilitas, dan hapus berkas teraudit", () => {
  const assetId = "instrument-doc-123e4567-e89b-12d3-a456-426614174000";
  expect(
    storeActions.upsertInstrumentDoc(PENELITI, {
      indicatorId: "IND-K3L-002",
      fileName: "detail-kabel.pdf",
      fileSize: 2048,
      assetId,
    }).ok,
  ).toBe(true);
  let doc = getState().instrumentDocs.find((d) => d.indicatorId === "IND-K3L-002")!;
  expect(doc.visibility).toBe("Privat"); // default aman
  expect(doc.assetId).toBe(assetId);

  expect(storeActions.setInstrumentDocVisibility(PENELITI, "IND-K3L-002", "Public").ok).toBe(true);
  doc = getState().instrumentDocs.find((d) => d.indicatorId === "IND-K3L-002")!;
  expect(doc.visibility).toBe("Public");

  expect(storeActions.deleteInstrumentDoc(PENELITI, "IND-K3L-002").ok).toBe(true);
  expect(getState().instrumentDocs.some((d) => d.indicatorId === "IND-K3L-002")).toBe(false);
  expect(getState().auditEvents[0].objectType).toBe("InstrumentDoc");
});

const MANUAL_INPUT = {
  code: "IND-DOC-001",
  title: "Dokumen tambahan peneliti",
  categoryId: "KAT-KESELAMATAN",
  aspectId: "ASP-KES-001",
  fileName: "tambahan.pdf",
  fileSize: 2048,
  assetId: "instrument-doc-123e4567-e89b-12d3-a456-426614174001",
};

test("entri dokumen manual (D-16.g): izin, validasi, pembuatan, dan ganti", () => {
  expect(storeActions.createInstrumentDocEntry(PENGELOLA, MANUAL_INPUT).ok).toBe(false);
  expect(
    storeActions.createInstrumentDocEntry(PENELITI, { ...MANUAL_INPUT, categoryId: "" }).ok,
  ).toBe(false);
  expect(
    storeActions.createInstrumentDocEntry(PENELITI, { ...MANUAL_INPUT, title: "abc" }).ok,
  ).toBe(false);
  expect(
    storeActions.createInstrumentDocEntry(PENELITI, {
      ...MANUAL_INPUT,
      categoryId: "KAT-KESEHATAN",
    }).ok,
  ).toBe(false); // aspek tidak sesuai kategori
  expect(
    storeActions.createInstrumentDocEntry(PENELITI, { ...MANUAL_INPUT, code: "IND-K3L-001" }).ok,
  ).toBe(false); // kode katalog

  const created = storeActions.createInstrumentDocEntry(PENELITI, MANUAL_INPUT);
  expect(created.ok).toBe(true);
  let doc = getState().instrumentDocs.find((d) => d.manual)!;
  expect(doc.indicatorId).toBe("IND-DOC-001");
  expect(doc.indicatorCode).toBe("IND-DOC-001");
  expect(doc.indicatorTitle).toBe("Dokumen tambahan peneliti");
  expect(doc.visibility).toBe("Privat"); // default aman
  expect(doc.assetId).toBe(MANUAL_INPUT.assetId);
  expect(getState().auditEvents[0].action).toBe("Menambahkan dokumen indikator");

  const replaced = storeActions.upsertInstrumentDoc(PENELITI, {
    indicatorId: "IND-DOC-001",
    fileName: "tambahan-v2.pdf",
    fileSize: 4096,
    assetId: "instrument-doc-123e4567-e89b-12d3-a456-426614174002",
  });
  expect(replaced.ok).toBe(true);
  doc = getState().instrumentDocs.find((d) => d.indicatorId === "IND-DOC-001")!;
  expect(doc.fileName).toBe("tambahan-v2.pdf");
  expect(doc.manual).toBe(true);
  expect(doc.indicatorTitle).toBe("Dokumen tambahan peneliti");
});

test("migrasi v6 ke v7 mempertahankan record dan menambah instrumentDocs", () => {
  const v6 = JSON.stringify({
    ...structuredClone(SEED),
    schemaVersion: 6,
    instrumentDocs: undefined,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => v6 },
  });
  try {
    const loaded = loadState();
    expect(loaded.schemaVersion).toBe(7);
    expect(loaded.reports.length).toBe(SEED.reports.length);
    expect(loaded.instrumentDocs.length).toBe(SEED.instrumentDocs.length);
    expect(MOCK_STORAGE_KEY).toBe("ishas-mock-v7");
  } finally {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});
