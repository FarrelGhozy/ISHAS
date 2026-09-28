// Jawaban penilaian mandiri pada modal validasi — hanya-baca.
// Dipisah dari halaman agar satu file satu tanggung jawab.
// D-24: soal dibaca dari snapshot beku; fallback bank live untuk arsip lama.

import type {
  CampusPlanVersion,
  FrozenIndicator,
  Instrument,
  SelfAssessmentSnapshot,
} from "~/mocks/types";
import { SavedLocation } from "~/shared/components/denah-preview";

export function ReviewAnswers({
  snapshot,
  bank,
  areaLabel,
  plans,
}: {
  snapshot: SelfAssessmentSnapshot;
  bank: Instrument;
  areaLabel: Map<string, string>;
  plans: CampusPlanVersion[];
}) {
  const frozen: FrozenIndicator[] =
    snapshot.frozenIndicators ??
    bank.dimensions.flatMap((dim) =>
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
        weight: ind.weight ?? 1,
        options: ind.options,
      })),
    );
  const groups = new Map<string, { name: string; items: FrozenIndicator[] }>();
  for (const ind of frozen) {
    const entry = groups.get(ind.dimensionId) ?? { name: ind.dimensionName, items: [] };
    entry.items.push(ind);
    groups.set(ind.dimensionId, entry);
  }
  return (
    <section className="mt-4 rounded-lg border border-line p-3">
      <h3 className="text-sm font-bold text-heading">
        Jawaban penilaian mandiri · {bank.label} (hanya-baca)
      </h3>
      {snapshot.scorePercent !== undefined && snapshot.scorePercent !== null ? (
        <p className="mt-1 text-sm text-secondary-text">
          Skor beku: {Math.round(snapshot.scorePercent)}% · tidak berubah bila bank diedit.
        </p>
      ) : null}
      <div className="mt-3 space-y-3">
        {[...groups.entries()].map(([dimId, group]) => (
          <div key={dimId}>
            <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">
              {group.name}
            </p>
            <ul className="mt-1 space-y-2">
              {group.items.map((ind) => {
                const a = snapshot.answers[ind.id];
                return (
                  <li key={ind.id} className="rounded border border-line-soft p-3 text-sm">
                    <strong className="block text-heading">
                      {ind.code} · {ind.title}
                    </strong>
                    <span className="text-secondary-text">
                      Jawaban: {a?.value || "—"}
                    </span>
                    {a?.note ? (
                      <span className="block text-secondary-text">
                        Catatan: {a.note}
                      </span>
                    ) : null}
                    {a?.evidenceName ? (
                      <span className="block text-secondary-text">
                        Bukti: {a.evidenceName}
                      </span>
                    ) : null}
                    {a?.areaId || a?.manualLocation ? (
                      <span className="block text-secondary-text">
                        Lokasi:{" "}
                        {a.areaId
                          ? (areaLabel.get(a.areaId) ?? a.areaId)
                          : a.manualLocation}
                      </span>
                    ) : null}
                    {a?.locationSnapshot ? (
                      <SavedLocation
                        plans={plans}
                        location={a.locationSnapshot}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
