// Test bank instrumen live (D-24): opsi bawaan, checksum, skor beku.

import { describe, expect, test } from "bun:test";
import {
  bobotJawaban,
  buildBankLiveDariVersi,
  defaultOptionsForType,
  hitungChecksumInstrument,
  isJawabanTemuan,
  skorLaporanBeku,
} from "./instrument-bank";
import { SEED } from "./seed/seed";

describe("opsi bawaan per tipe", () => {
  test("empat tipe baru punya bobot 0–100 + flag temuan", () => {
    for (const t of ["ya-tidak", "kualitas-1-5", "frekuensi", "keparahan"] as const) {
      const options = defaultOptionsForType(t);
      expect(options.length).toBeGreaterThanOrEqual(2);
      for (const o of options) {
        expect(o.weight).toBeGreaterThanOrEqual(0);
        expect(o.weight).toBeLessThanOrEqual(100);
      }
      expect(options.some((o) => o.isFinding)).toBe(true);
    }
    expect(defaultOptionsForType("ya-tidak").find((o) => o.value === "Ya")?.weight).toBe(100);
  });
});

describe("bank dari versi warisan", () => {
  test("INS-v1.1 menjadi 10 indikator dengan nilai lama tetap sah", () => {
    const bank = buildBankLiveDariVersi(
      SEED.instrumentVersions.find((v) => v.id === "INS-v1.1"),
    );
    const all = bank.dimensions.flatMap((d) => d.indicators);
    expect(all.length).toBe(10);
    const kabel = all.find((i) => i.id === "IND-K3L-002")!;
    expect(kabel.options.map((o) => o.value)).toContain("2");
    expect(bobotJawaban(kabel, "2")).not.toBeNull();
  });

  test("checksum berubah saat opsi/bobot diubah", () => {
    const bank = buildBankLiveDariVersi(
      SEED.instrumentVersions.find((v) => v.id === "INS-v1.1"),
    );
    const before = bank.checksum;
    bank.dimensions[0].indicators[0].options[0].weight = 99;
    expect(hitungChecksumInstrument(bank.dimensions)).not.toBe(before);
  });
});

describe("skor beku + temuan", () => {
  test("rata-rata terbobot, N/A dilewati", () => {
    const bank = SEED.instrument;
    const frozen = bank.dimensions.flatMap((dim) =>
      dim.indicators.map((ind) => ({
        id: ind.id,
        code: ind.code,
        title: ind.title,
        prompt: ind.prompt,
        dimensionId: dim.id,
        dimensionName: dim.name,
        categoryId: ind.categoryId,
        aspectId: ind.aspectId,
        answerType: ind.answerType,
        weight: 1,
        options: ind.options,
      })),
    );
    const answers: Record<string, { value: string }> = {};
    for (const f of frozen) {
      const best = f.options.filter((o) => o.value !== "N/A").sort((a, b) => b.weight - a.weight)[0];
      answers[f.id] = { value: best.value };
    }
    const { scorePercent } = skorLaporanBeku(frozen, answers);
    expect(scorePercent).toBe(100);
    answers[frozen[0].id] = { value: "N/A" };
    const { scorePercent: after } = skorLaporanBeku(frozen, answers);
    expect(after).toBe(100);
  });

  test("flag temuan mengikuti opsi bank", () => {
    const bank = SEED.instrument;
    const ind = bank.dimensions.flatMap((d) => d.indicators)[0];
    const temu = ind.options.find((o) => o.isFinding)!;
    const aman = ind.options.find((o) => !o.isFinding && o.value !== "N/A")!;
    expect(isJawabanTemuan(ind, temu.value)).toBe(true);
    expect(isJawabanTemuan(ind, aman.value)).toBe(false);
    expect(isJawabanTemuan(ind, "N/A")).toBe(false);
  });
});
