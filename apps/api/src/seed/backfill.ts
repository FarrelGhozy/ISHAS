// Backfill snapshot warisan (jawaban saja) menjadi setara kiriman beku (D-35).
// Murni tanpa DB: dipakai seed demo agar dashboard publik mode backend
// menghitung indeks dari jalur beku (jawaban mentah tetap tidak publik).

import { skorSnapshot } from "../../../web/mocks/processors/dashboard-aggregate";
import type {
  FrozenIndicator,
  InstrumentVersion,
  SelfAssessmentSnapshot,
} from "../../../web/mocks/types";

export type SnapshotBeku = {
  frozenIndicators: FrozenIndicator[];
  scorePercent: number | null;
  byDimension: Record<string, number | null>;
};

// Bekukan satu snapshot warisan memakai dimensi versi asalnya. Skor dihitung
// lewat jalur warisan `skorSnapshot` yang sama dengan mode mock sehingga angka
// identik (bukan rumus baru). Indikator warisan tanpa opsi/bobot memakai
// `options: []` + `weight: 1`; klasifikasi temuan memakai fallback aturan
// `answerType` pada `isJawabanTemuan`.
export function bekukanSnapshotWarisan(
  versions: InstrumentVersion[],
  snapshot: SelfAssessmentSnapshot,
): SnapshotBeku {
  const version = versions.find((item) => item.id === snapshot.instrumentVersionId);
  const frozenIndicators: FrozenIndicator[] = (version?.dimensions ?? []).flatMap((dim) =>
    dim.indicators.map((ind) => ({
      id: ind.id,
      code: ind.code,
      title: ind.title,
      prompt: ind.prompt,
      dimensionId: dim.id,
      dimensionName: dim.name,
      categoryId: ind.categoryId ?? dim.categoryId,
      aspectId: ind.aspectId,
      answerType: ind.answerType,
      weight: 1,
      options: [],
    })),
  );
  const skor = skorSnapshot(versions, snapshot);
  return {
    frozenIndicators,
    scorePercent: skor.index,
    byDimension: skor.byDimension,
  };
}
