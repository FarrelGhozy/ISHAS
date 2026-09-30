import { afterEach, expect, test } from "bun:test";
import { loadState, MOCK_STORAGE_KEY } from "./state";
import { SEED } from "../seed/seed";
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

for (const [name, raw] of [
  ["JSON rusak", "{"],
  ["schema lama", JSON.stringify({ ...SEED, schemaVersion: 3 })],
  ["schema v4 tidak lengkap", JSON.stringify({ schemaVersion: 4, reports: [] })],
  ["dimensi instrumen rusak", JSON.stringify({ ...SEED, instrumentVersions: [{ id: "rusak" }] })],
])
  test(`state ${name} pulih ke seed utuh`, () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem(key: string) {
          expect(key).toBe(MOCK_STORAGE_KEY);
          return raw;
        },
      },
    });
    expect(loadState()).toEqual(SEED);
  });

test("state entri instrumen null tidak melempar dan pulih ke seed", () => {
  const bad = structuredClone(SEED) as unknown as Record<string, unknown>;
  bad["instrumentVersions"] = [{ id: "rusak", dimensions: [null] }];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(bad);
      },
    },
  });
  expect(loadState()).toEqual(SEED);
});

test("state v6 tanpa instrumentDocs dimigrasi ke v16 berisi seed docs", () => {
  const v6 = structuredClone(SEED) as unknown as Record<string, unknown>;
  delete v6["instrumentDocs"];
  v6["schemaVersion"] = 6;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v6);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.instrumentDocs).toEqual(SEED.instrumentDocs);
  expect(loaded.instrument.dimensions.length).toBeGreaterThan(0);
});

test("state v5 valid dimigrasi ke v16 tanpa kehilangan record", () => {
  const v5 = JSON.stringify({ ...structuredClone(SEED), schemaVersion: 5 });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return v5;
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.reports.length).toBe(SEED.reports.length);
});

test("state v8 tanpa usulan dimigrasi ke v16 dengan default Belum ditentukan", () => {
  const v8 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v8["schemaVersion"] = 8;
  for (const report of (v8["reports"] as Record<string, unknown>[])) {
    delete report["reporterSeverity"];
    delete report["reporterPriority"];
  }
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v8);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(
    loaded.reports.every(
      (report) =>
        report.reporterSeverity === "Belum ditentukan" ||
        ["Tinggi", "Sedang", "Rendah"].includes(report.reporterSeverity ?? ""),
    ),
  ).toBe(true);
});

test("state v9 valid dimigrasi ke v16 tanpa kehilangan record/ID", () => {
  const v9 = JSON.stringify({ ...structuredClone(SEED), schemaVersion: 9 });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return v9;
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.reports.length).toBe(SEED.reports.length);
  expect(loaded.recommendations.length).toBe(SEED.recommendations.length);
  expect(loaded.recommendations.map((item) => item.id)).toEqual(
    SEED.recommendations.map((item) => item.id),
  );
});

test("state v12 tanpa samFollowUps dimigrasi ke v16 tanpa kehilangan record", () => {
  const v12 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v12["schemaVersion"] = 12;
  delete v12["samFollowUps"];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v12);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.samFollowUps).toEqual([]);
  expect(loaded.samAssessments.length).toBe(SEED.samAssessments.length);
});

test("state v10 tanpa bank dibangunkan bank live dari versi aktif warisan", () => {
  const v10 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v10["schemaVersion"] = 10;
  delete v10["instrument"];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v10);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.instrument.id).toBe("INS-LIVE");
  expect(
    loaded.instrument.dimensions.flatMap((d) => d.indicators).length,
  ).toBe(59);
});

test("state v15 dimigrasi ke v16 menambah pesantren demo UNIDA Gontor", () => {
  const v15 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v15["schemaVersion"] = 15;
  (v15["institutions"] as Record<string, unknown>[]) = (
    v15["institutions"] as Record<string, unknown>[]
  ).filter((item) => item["code"] !== "PSN-0024");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v15);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  const unida = loaded.institutions.filter((item) => item.code === "PSN-0024");
  expect(unida).toHaveLength(1);
  expect(unida[0].name).toBe("UNIDA Gontor");
});

test("state v15 yang sudah memuat PSN-0024 tidak menggandakan", () => {
  const v15 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v15["schemaVersion"] = 15;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v15);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.institutions.filter((item) => item.code === "PSN-0024")).toHaveLength(1);
});

test("state v14 dimigrasi ke v16 menormalisasi usulan rekomendasi (D-29)", () => {
  const v14 = structuredClone(SEED) as unknown as Record<string, unknown>;
  v14["schemaVersion"] = 14;
  const reports = v14["reports"] as Record<string, unknown>[];
  delete reports[0]["reporterRecommendation"];
  reports[1]["reporterRecommendation"] = "   ";
  reports[2]["reporterRecommendation"] = "  Amankan area lalu perbaiki segera.  ";
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        return JSON.stringify(v14);
      },
    },
  });
  const loaded = loadState();
  expect(loaded.schemaVersion).toBe(16);
  expect(loaded.reports[0].reporterRecommendation).toBeUndefined();
  expect(loaded.reports[1].reporterRecommendation).toBeUndefined();
  expect(loaded.reports[2].reporterRecommendation).toBe("Amankan area lalu perbaiki segera.");
});
