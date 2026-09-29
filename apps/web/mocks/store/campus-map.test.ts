import { beforeEach, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";
import {
  clusterMapItems,
  isValidPoint,
  selectPublicCampusMap,
  validateMapLocation,
} from "../processors/campus-map";
import { migrateV4 } from "./state";
import { SEED } from "../seed/seed";
import type { IshasState, LocationSnapshot } from "../types";

const manager = { id: "USR-003", name: "Penguji", role: "Pesantren" };
const location: LocationSnapshot = {
  locationText: "Koridor",
  floorNote: "Lantai 2",
  campusPlanVersionId: "CAMPUS-PSN-0018-v1",
  point: { x: 0, y: 100 },
};
const input = {
  institutionCode: "PSN-0018",
  reporterName: "Penguji",
  areaId: "AREA-001",
  title: "Kabel terbuka di koridor",
  description: "Terlihat kabel terbuka di dekat tangga asrama.",
};
beforeEach(() => storeActions.resetMockData());

test("batas titik: 0/100 sah, NaN/Infinity/di luar rentang ditolak", () => {
  expect(isValidPoint({ x: 0, y: 100 })).toBe(true);
  for (const point of [
    null,
    { x: NaN, y: 50 },
    { x: 10, y: Infinity },
    { x: -1, y: 10 },
    { x: 101, y: 20 },
  ])
    expect(isValidPoint(point)).toBe(false);
});

test("scope general/invalid/nonaktif tidak membuka denah atau titik", () => {
  for (const code of [undefined, "PSN-tidak-ada", "PSN-0020"])
    expect(selectPublicCampusMap(getState(), code).plans).toHaveLength(0);
  // D-32: penilaian mandiri tidak lagi menghasilkan temuan; PSN-0018 tinggal
  // temuan lapor-cepat aktif (RPT-0003, RPT-0008); RPT-0009 Dibatalkan bukan pin.
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(2);
  storeActions.setUserStatus("USR-003", "Nonaktif");
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(0);
});

test("kirim → validasi mempertahankan titik persis dan tidak mempublikasikan pending/ditolak", () => {
  const result = storeActions.submitPublicReport(
    { name: "Penguji" },
    { ...input, locationSnapshot: location },
  );
  expect(result.ok).toBe(true);
  if (!result.ok || !result.id) return;
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(2);
  storeActions.acceptReport(
    manager,
    result.id,
    "Tinggi",
    "Sedang",
    undefined,
    "Amankan area dan jadwalkan perbaikan oleh tim sarana.",
  );
  const finding = getState().findings.find((item) => item.reportId === result.id)!;
  expect(finding.locationSnapshot?.point).toEqual({ x: 0, y: 100 });
  expect(finding.locationSnapshot?.floorNote).toBe("Lantai 2");
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(3);
  const rejected = storeActions.submitPublicReport(
    { name: "Penguji" },
    { ...input, locationSnapshot: location },
  );
  if (rejected.ok && rejected.id)
    storeActions.rejectReport(manager, rejected.id, "Titik dan kondisi perlu diperiksa kembali.");
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(3);
});

test("laporan tanpa titik tidak menggunakan centroid area atau 50/50", () => {
  const result = storeActions.submitPublicReport({ name: "Penguji" }, input);
  if (!result.ok || !result.id) throw Error("Submit gagal");
  storeActions.acceptReport(
    manager,
    result.id,
    "Sedang",
    "Sedang",
    undefined,
    "Amankan area dan jadwalkan perbaikan oleh tim sarana.",
  );
  expect(
    getState().findings.find((item) => item.reportId === result.id)?.locationSnapshot?.point,
  ).toBeNull();
  expect(
    selectPublicCampusMap(getState(), "PSN-0018").items.find((item) => item.issue === input.title)
      ?.point,
  ).toBeNull();
});

test("titik invalid/versi salah/lintas pesantren ditolak tanpa membuat laporan", () => {
  const count = getState().reports.length;
  for (const map of [
    { ...location, point: { x: 101, y: 0 } },
    { ...location, campusPlanVersionId: "DENAH-v1" },
    { ...location, areaId: "AREA-005" },
  ])
    expect(
      storeActions.submitPublicReport({ name: "Penguji" }, { ...input, locationSnapshot: map }).ok,
    ).toBe(false);
  expect(getState().reports).toHaveLength(count);
  expect(validateMapLocation(getState(), "PSN-0019", location)).not.toBeNull();
});

test("penggantian memerlukan pesantren scope, persetujuan dan versi aktif yang belum berubah", () => {
  const next = {
    institutionCode: "PSN-0018",
    assetId: "campus-asset-uji",
    width: 1536,
    height: 1024,
    expectedActiveId: "CAMPUS-PSN-0018-v1",
    acknowledged: true,
  };
  expect(storeActions.publishCampusPlan({ id: "USR-004" }, next).ok).toBe(false);
  expect(storeActions.publishCampusPlan(manager, { ...next, acknowledged: false }).ok).toBe(false);
  expect(storeActions.publishCampusPlan(manager, next).ok).toBe(true);
  expect(getState().campusPlans).toHaveLength(3);
  expect(
    selectPublicCampusMap(getState(), "PSN-0018")
      .items.filter((item) => item.versionId)
      .every((item) => item.versionId === "CAMPUS-PSN-0018-v1"),
  ).toBe(true);
  expect(
    storeActions.submitPublicReport({ name: "Penguji" }, { ...input, locationSnapshot: location })
      .ok,
  ).toBe(false);
  expect(
    storeActions.publishCampusPlan(manager, { ...next, assetId: "campus-asset-lagi" }).ok,
  ).toBe(false);
});

test("public projection tidak membawa nomor laporan/identitas/bukti/audit", () => {
  const items = selectPublicCampusMap(getState(), "PSN-0018").items;
  for (const item of items)
    for (const key of [
      "reportId",
      "reporterName",
      "reporterAccountEmail",
      "contact",
      "evidence",
      "evidenceAssetId",
      "auditEvents",
      "sourceAnswerId",
    ])
      expect(key in item).toBe(false);
});

test("cluster menghitung anggota, bukan jumlah kelompok", () => {
  const items = selectPublicCampusMap(getState(), "PSN-0018").items;
  const same = items.map((item) => ({ ...item, point: { x: 20, y: 20 } }));
  expect(clusterMapItems(same)).toHaveLength(1);
  expect(clusterMapItems(same)[0]).toHaveLength(2);
});

test("v4 dimigrasi tanpa kehilangan laporan dan tanpa menganggap titik legacy sebagai observasi", () => {
  const old = { ...structuredClone(SEED), schemaVersion: 4 };
  const migrated = migrateV4(old) as IshasState;
  expect(migrated.schemaVersion).toBe(6);
  expect(migrated.reports.map((item) => item.id)).toEqual(SEED.reports.map((item) => item.id));
  expect(migrated.campusPlans).toHaveLength(2);
  expect(migrated.campusPlans[0].illustration).toBe(true);
  expect(migrated.findings.every((item) => !item.locationSnapshot)).toBe(true);
});

test("penilaian mandiri terbit tanpa temuan dan tidak dapat divalidasi (D-32)", () => {
  const version = getState().instrument;
  const answers = Object.fromEntries(
    version.dimensions
      .flatMap((dimension) => dimension.indicators)
      .map((indicator) => [
        indicator.id,
        {
          value: indicator.options[0].value,
          note: "",
          evidenceName: "bukti.jpg",
          areaId: "AREA-001",
          planPoint: null,
          locationSnapshot: { ...location, point: { x: 20, y: 20 } },
        },
      ]),
  );
  storeActions.saveSelfAssessmentDraft({
    id: "SELF-uji",
    institutionCode: "PSN-0018",
    reporterName: "Penguji",
    instrumentVersionId: "INS-LIVE",
    answers,
    activeIndex: 0,
    updatedAt: new Date().toISOString(),
  });
  const result = storeActions.submitSelfAssessment({ name: "Penguji" }, "SELF-uji");
  if (!result.ok || !result.id) throw Error("Submit gagal");
  const report = getState().reports.find((item) => item.id === result.id)!;
  expect(report.validationStatus).toBe("Terbit");
  expect(report.handlingStatus).toBe("Tidak berlaku");
  expect(getState().findings.filter((item) => item.reportId === result.id)).toHaveLength(0);
  // Penilaian mandiri bukan bagian antrean validasi.
  expect(storeActions.acceptReport(manager, result.id, "Tinggi", "Tinggi").ok).toBe(false);
  // Tidak menambah pin peta publik.
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(2);
});

test("temuan Dibatalkan tidak menjadi pin peta publik (D-21)", () => {
  const items = selectPublicCampusMap(getState(), "PSN-0018").items;
  expect(
    getState().findings.some(
      (item) => item.id === "RSK-RPT-0009-1" && item.status === "Dibatalkan",
    ),
  ).toBe(true);
  expect(items.some((item) => item.issue.includes("Sampah dedaunan"))).toBe(false);
});

test("Completed dan arsip tidak tampil pada peta publik", () => {
  expect(selectPublicCampusMap(getState(), "PSN-0019").items).toHaveLength(3);
  storeActions.archiveCompletedReport(
    { id: "USR-004", name: "Penguji", role: "Pesantren" },
    "RPT-0005",
    "Arsip akhir periode",
  );
  expect(selectPublicCampusMap(getState(), "PSN-0019").items).toHaveLength(3);
});

test("jawaban sesuai tidak menghasilkan pin temuan generik", () => {
  const version = getState().instrument;
  const answers = Object.fromEntries(
    version.dimensions
      .flatMap((dimension) => dimension.indicators)
      .map((indicator) => [
        indicator.id,
        {
          value: indicator.options[0].value,
          note: "",
          evidenceName: "bukti.jpg",
          areaId: "AREA-001",
          planPoint: null,
        },
      ]),
  );
  storeActions.saveSelfAssessmentDraft({
    id: "SELF-sesuai",
    institutionCode: "PSN-0018",
    reporterName: "Penguji",
    instrumentVersionId: "INS-LIVE",
    answers,
    activeIndex: 0,
    updatedAt: new Date().toISOString(),
  });
  const result = storeActions.submitSelfAssessment({ name: "Penguji" }, "SELF-sesuai");
  if (!result.ok || !result.id) throw Error("Submit gagal");
  // D-32: apa pun jawabannya, penilaian mandiri tidak menghasilkan temuan.
  expect(getState().findings.filter((item) => item.reportId === result.id)).toHaveLength(0);
  expect(selectPublicCampusMap(getState(), "PSN-0018").items).toHaveLength(2);
});
