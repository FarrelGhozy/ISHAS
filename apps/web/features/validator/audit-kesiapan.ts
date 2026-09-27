// Kriteria layak publik D-25 — dipakai halaman Audit publikasi + test.
// Lima syarat: snapshot lengkap + Diterima + skor ada + PDF ada + checksum cocok.
// Tanpa aksi moderasi; keputusan Terima/Tolak milik akun Pesantren.

import type { Report, SelfAssessmentSnapshot } from "~/mocks/types";

export type Kesiapan = {
  answered: number;
  expected: number;
  lengkap: boolean;
  diterima: boolean;
  skorAda: boolean;
  pdfAda: boolean;
  checksumCocok: boolean;
  warisan: boolean;
  layak: boolean;
};

export function nilaiKesiapan(
  snapshot: SelfAssessmentSnapshot | undefined,
  report: Report | undefined,
  bankChecksum: string | undefined,
  bankIndicatorCount: number,
): Kesiapan {
  const expected =
    snapshot?.frozenIndicators?.length ?? bankIndicatorCount;
  const answered = snapshot
    ? Object.values(snapshot.answers).filter((a) => Boolean(a?.value)).length
    : 0;
  const lengkap = Boolean(snapshot && expected > 0 && answered === expected);
  const diterima = report?.validationStatus === "Diterima";
  const skor = snapshot?.scorePercent ?? report?.scorePercent ?? null;
  const skorAda = skor !== null && skor !== undefined;
  const pdfAda = Boolean(report?.pdfGeneratedAt);
  const warisan = Boolean(snapshot && !snapshot.frozenIndicators);
  const checksumCocok = Boolean(
    snapshot?.instrumentChecksum &&
      bankChecksum &&
      snapshot.instrumentChecksum === bankChecksum,
  );
  return {
    answered,
    expected,
    lengkap,
    diterima,
    skorAda,
    pdfAda,
    checksumCocok,
    warisan,
    layak: lengkap && diterima && skorAda && pdfAda && checksumCocok,
  };
}
