// Uji unit backfill snapshot warisan + paritas public-state (D-35).
// Murni tanpa DB: memakai SEED mock sebagai sumber.
import { describe, expect, test } from "bun:test";
import { SEED } from "../../web/mocks/seed/seed";
import {
  hitungIndexSummary,
  hitungJawabanTerisi,
  skorSnapshot,
} from "../../web/mocks/processors/dashboard-aggregate";
import { selectRegisteredInstitutions } from "../../web/mocks/store/selectors";
import { bekukanSnapshotWarisan } from "../src/seed/backfill";
import { buildPublicState } from "../src/domain/public-state";

const codes = selectRegisteredInstitutions(SEED).map((i) => i.code);

function seedTerbackfill() {
  return {
    ...SEED,
    selfAssessmentSnapshots: SEED.selfAssessmentSnapshots.map((s) => ({
      ...s,
      ...bekukanSnapshotWarisan(SEED.instrumentVersions, s),
      jawabanTerisi: hitungJawabanTerisi(s),
    })),
  };
}

describe("bekukanSnapshotWarisan", () => {
  test("snapshot warisan menjadi beku dengan skor = jalur warisan mock", () => {
    expect(SEED.selfAssessmentSnapshots.length).toBeGreaterThan(0);
    for (const snapshot of SEED.selfAssessmentSnapshots) {
      const beku = bekukanSnapshotWarisan(SEED.instrumentVersions, snapshot);
      expect(beku.frozenIndicators.length).toBeGreaterThan(0);
      const warisan = skorSnapshot(SEED.instrumentVersions, snapshot);
      expect(beku.scorePercent).toBe(warisan.index);
      expect(beku.byDimension).toEqual(warisan.byDimension);
    }
  });

  test("versi tak dikenal → frozen kosong + skor null, bukan crash", () => {
    const beku = bekukanSnapshotWarisan(SEED.instrumentVersions, {
      ...SEED.selfAssessmentSnapshots[0],
      instrumentVersionId: "INS-v9.9",
    });
    expect(beku.frozenIndicators).toHaveLength(0);
    expect(beku.scorePercent).toBeNull();
  });
});

describe("buildPublicState dari seed ter-backfill (D-35)", () => {
  test("indeks + tren + dimensi terhitung tanpa jawaban mentah", () => {
    const mock = hitungIndexSummary(
      {
        reports: SEED.reports,
        selfAssessmentSnapshots: SEED.selfAssessmentSnapshots,
        instrumentVersions: SEED.instrumentVersions,
        indexHistory: SEED.indexHistory,
      },
      codes,
    );
    expect(mock.currentIndex).not.toBeNull();
    const publik = buildPublicState(seedTerbackfill());
    const ringkas = hitungIndexSummary(
      {
        reports: publik.reports,
        selfAssessmentSnapshots: publik.selfAssessmentSnapshots,
        instrumentVersions: publik.instrumentVersions,
        indexHistory: publik.indexHistory,
      },
      codes,
    );
    expect(ringkas.currentIndex).not.toBeNull();
    expect(ringkas.currentIndex).toBeCloseTo(mock.currentIndex as number, 6);
    expect(ringkas.series.length).toBeGreaterThan(0);
    expect(ringkas.dimensions.length).toBe(mock.dimensions.length);
  });

  test("jawaban mentah tetap tidak publik; cacah terisi dibawa", () => {
    const publik = buildPublicState(seedTerbackfill());
    expect(publik.selfAssessmentSnapshots.length).toBeGreaterThan(0);
    for (const snapshot of publik.selfAssessmentSnapshots) {
      expect(Object.keys(snapshot.answers)).toHaveLength(0);
      expect(typeof snapshot.jawabanTerisi).toBe("number");
      expect(snapshot.jawabanTerisi as number).toBeGreaterThan(0);
    }
    const mentah = SEED.selfAssessmentSnapshots[0].answers["IND-K3L-002"].note;
    expect(JSON.stringify(publik.selfAssessmentSnapshots)).not.toContain(mentah);
  });
});
