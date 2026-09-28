import { describe, expect, test } from "bun:test";
import type { Report, SelfAssessmentSnapshot } from "~/mocks/types";
import { nilaiKesiapan } from "./audit-kesiapan";

function snapshot(
  isi: Partial<SelfAssessmentSnapshot> & { answers: SelfAssessmentSnapshot["answers"] },
): SelfAssessmentSnapshot {
  return {
    reportId: "RPT-0901",
    instrumentVersionId: "INS-LIVE",
    instrumentChecksum: "ck-live",
    submittedAt: "2026-09-28T00:00:00.000Z",
    ...isi,
  };
}

function laporan(isi: Partial<Report>): Report {
  return {
    id: "RPT-0901",
    channel: "penilaian-mandiri",
    institutionCode: "PSN-0018",
    reporterName: "Penilai Uji",
    title: "Penilaian mandiri K3L",
    description: "Uji",
    validationStatus: "Diterima",
    severity: "Sedang",
    priority: "Sedang",
    handlingStatus: "Pending",
    createdAt: "2026-09-28T00:00:00.000Z",
    ...isi,
  } as Report;
}

const beku = [{ id: "IND-1" }, { id: "IND-2" }] as SelfAssessmentSnapshot["frozenIndicators"];

describe("nilaiKesiapan D-25", () => {
  test("layak bila 5 kriteria terpenuhi", () => {
    const siap = nilaiKesiapan(
      snapshot({
        answers: {
          a: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
          b: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
        },
        frozenIndicators: beku,
        scorePercent: 70,
      }),
      laporan({ pdfGeneratedAt: "2026-09-28T01:00:00.000Z", scorePercent: 70 }),
      "ck-live",
      2,
    );
    expect(siap.lengkap).toBe(true);
    expect(siap.layak).toBe(true);
  });

  test("tidak layak bila jawaban kurang", () => {
    const siap = nilaiKesiapan(
      snapshot({
        answers: {
          a: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
        },
        frozenIndicators: beku,
        scorePercent: 70,
      }),
      laporan({ pdfGeneratedAt: "2026-09-28T01:00:00.000Z", scorePercent: 70 }),
      "ck-live",
      2,
    );
    expect(siap.lengkap).toBe(false);
    expect(siap.layak).toBe(false);
  });

  test("warisan tanpa checksum tidak layak", () => {
    const siap = nilaiKesiapan(
      snapshot({
        instrumentChecksum: undefined,
        answers: {
          a: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
        },
        frozenIndicators: undefined,
      }),
      laporan({ validationStatus: "Diterima" }),
      "ck-live",
      99,
    );
    expect(siap.warisan).toBe(true);
    expect(siap.checksumCocok).toBe(false);
    expect(siap.layak).toBe(false);
  });

  test("checksum beda dan status bukan Diterima menggugurkan", () => {
    const penuh = {
      a: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
      b: { value: "Ya", note: "", evidenceName: "", areaId: "", planPoint: null },
    };
    const beda = nilaiKesiapan(
      snapshot({ answers: penuh, frozenIndicators: beku, scorePercent: 80 }),
      laporan({ pdfGeneratedAt: "2026-09-28T01:00:00.000Z", scorePercent: 80 }),
      "ck-baru",
      2,
    );
    expect(beda.checksumCocok).toBe(false);
    expect(beda.layak).toBe(false);
    const tolak = nilaiKesiapan(
      snapshot({ answers: penuh, frozenIndicators: beku, scorePercent: 80 }),
      laporan({
        validationStatus: "Menunggu validasi",
        pdfGeneratedAt: "2026-09-28T01:00:00.000Z",
        scorePercent: 80,
      }),
      "ck-live",
      2,
    );
    expect(tolak.diterima).toBe(false);
    expect(tolak.layak).toBe(false);
  });
});
