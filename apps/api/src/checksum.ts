// Port 1:1 `hitungChecksumInstrument` (apps/web/mocks/instrument-bank.ts:55).
// Hash DJB2 dari JSON kanonik dimensi/indikator/opsi. Perubahan algoritma atau
// urutan kunci akan membuat draft/snapshot mock dianggap basi — jangan diubah
// tanpa vektor uji bersama (BACKEND_MIGRATION.md §5.a).

export type ChecksumOption = {
  value: string;
  weight: number;
  isFinding: boolean;
};

export type ChecksumIndicator = {
  id: string;
  answerType: string;
  options: ChecksumOption[];
  weight: number;
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
};

export type ChecksumDimension = {
  id: string;
  indicators: ChecksumIndicator[];
};

export function hitungChecksumInstrument(dimensions: ChecksumDimension[]): string {
  const canonical = JSON.stringify(
    dimensions.map((d) => ({
      id: d.id,
      indicators: d.indicators.map((i) => ({
        id: i.id,
        t: i.answerType,
        o: i.options.map((o) => [o.value, o.weight, o.isFinding ? 1 : 0]),
        w: i.weight,
        r: i.required ? 1 : 0,
        e: i.evidenceRequired ? 1 : 0,
        l: i.locationRequired ? 1 : 0,
      })),
    })),
  );
  let hash = 5381;
  for (let n = 0; n < canonical.length; n += 1) {
    hash = ((hash << 5) + hash + canonical.charCodeAt(n)) | 0;
  }
  return `ck-${(hash >>> 0).toString(16)}`;
}
