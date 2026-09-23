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
  const input = { indicatorId: "IND-K3L-002", fileName: "detail.pdf", fileSize: 1000, assetId: "instrument-doc-123e4567-e89b-12d3-a456-426614174000" };
  expect(storeActions.upsertInstrumentDoc(PENGELOLA, input).ok).toBe(false);
  expect(storeActions.setInstrumentDocVisibility(PENGELOLA, "IND-K3L-001", "Public").ok).toBe(false);
  expect(storeActions.deleteInstrumentDoc(PENGELOLA, "IND-K3L-001").ok).toBe(false);
  expect(storeActions.upsertInstrumentDoc(PENELITI, { ...input, indicatorId: "TIDAK-ADA" }).ok).toBe(false);
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

test("migrasi v6 ke v7 mempertahankan record dan menambah instrumentDocs", () => {
  const v6 = JSON.stringify({ ...structuredClone(SEED), schemaVersion: 6, instrumentDocs: undefined });
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
