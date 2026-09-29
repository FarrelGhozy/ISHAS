import { beforeEach, describe, expect, test } from "bun:test";
import { getState, storeActions } from "./store/mock-store";
import { selectRegisteredInstitutions } from "./store/selectors";
import {
  buildResearchRows,
  parseResearchImport,
  researchToCSV,
  researchToJSON,
  RESEARCH_TEMPLATE_CSV,
} from "./research-export";

describe("dataset penelitian D-25/D-32", () => {
  beforeEach(() => storeActions.resetMockData());

  test("baris hanya penilaian-mandiri + ekspor whitelist D-02", () => {
    const rows = buildResearchRows(getState());
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.channel === "penilaian-mandiri")).toBe(true);
    const csv = researchToCSV(rows);
    expect(csv.split("\n")[0]).toContain("reportId,institutionCode");
    for (const kolomTerlarang of [
      "reporterName",
      "contact",
      "evidence",
      "jawaban",
      "rejectionReason",
      "audit",
    ]) {
      expect(csv.toLowerCase()).not.toContain(kolomTerlarang.toLowerCase());
    }
    const json = researchToJSON(rows);
    expect(json).toContain("Data ilustrasi");
  });

  test("parser menerima template dan menolak baris bermasalah", () => {
    const state = getState();
    const codes = new Set(selectRegisteredInstitutions(state).map((i) => i.code));
    const kode = [...codes][0];
    const ok = parseResearchImport(
      `institutionCode,reporterName,scorePercent,title\n${kode},Tim Impor,65,Uji impor\n`,
      codes,
    );
    expect(ok.errors).toEqual([]);
    expect(ok.valid).toHaveLength(1);
    expect(ok.valid[0].scorePercent).toBe(65);

    const template = parseResearchImport(RESEARCH_TEMPLATE_CSV, codes);
    expect(template.valid.length + template.errors.length).toBeGreaterThan(0);

    const asing = parseResearchImport(
      "institutionCode,reporterName,scorePercent\nPSN-9999,Uji,50\n",
      codes,
    );
    expect(asing.valid).toHaveLength(0);
    expect(asing.errors.join(" ")).toContain("terdaftar");

    const skorBuruk = parseResearchImport(
      `institutionCode,reporterName,scorePercent\n${kode},Uji,150\n`,
      codes,
    );
    expect(skorBuruk.valid).toHaveLength(0);
    expect(skorBuruk.errors.join(" ")).toContain("0–100");

    expect(parseResearchImport("", codes).errors.length).toBeGreaterThan(0);
    expect(parseResearchImport("institutionCode\n", codes).errors.length).toBeGreaterThan(0);
  });

  test("impor validator langsung Terbit (kanal penilaian mandiri)", () => {
    const state = getState();
    const validator = state.users.find(
      (u) => u.roleId === "validator" && u.status === "Aktif",
    )!;
    const kode = selectRegisteredInstitutions(state)[0].code;
    const sebelum = state.reports.length;
    const hasil = storeActions.importResearchDataset(
      { id: validator.id, name: validator.name },
      [{ institutionCode: kode, reporterName: "Tim Impor", scorePercent: 66, title: "Uji impor" }],
    );
    expect(hasil.ok).toBe(true);
    const sesudah = getState();
    expect(sesudah.reports.length).toBe(sebelum + 1);
    const baru = sesudah.reports[sesudah.reports.length - 1];
    expect(baru.validationStatus).toBe("Terbit");
    expect(baru.handlingStatus).toBe("Tidak berlaku");
    expect(baru.scorePercent).toBe(66);
    expect(
      sesudah.selfAssessmentSnapshots.some((s) => s.reportId === baru.id),
    ).toBe(true);
    expect(
      sesudah.auditEvents.some(
        (a) => a.objectId === baru.id && a.action === "Mengimpor dataset penelitian",
      ),
    ).toBe(true);
  });

  test("impor ditolak untuk non-validator dan pesantren tak terdaftar", () => {
    const state = getState();
    const pesantren = state.users.find(
      (u) => u.roleId === "pesantren" && u.status === "Aktif",
    )!;
    const kode = selectRegisteredInstitutions(state)[0].code;
    const tolakPeran = storeActions.importResearchDataset(
      { id: pesantren.id, name: pesantren.name },
      [{ institutionCode: kode, reporterName: "Tim", scorePercent: null, title: "Uji" }],
    );
    expect(tolakPeran.ok).toBe(false);
    const validator = state.users.find(
      (u) => u.roleId === "validator" && u.status === "Aktif",
    )!;
    const tolakScope = storeActions.importResearchDataset(
      { id: validator.id, name: validator.name },
      [{ institutionCode: "PSN-9999", reporterName: "Tim", scorePercent: null, title: "Uji" }],
    );
    expect(tolakScope.ok).toBe(false);
    expect(
      storeActions.importResearchDataset({ id: validator.id, name: validator.name }, []).ok,
    ).toBe(false);
  });
});
