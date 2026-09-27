// Jawaban penilaian mandiri pada modal validasi — hanya-baca.
// Dipisah dari halaman agar satu file satu tanggung jawab.

import type {
  CampusPlanVersion,
  InstrumentVersion,
  SelfAssessmentSnapshot,
} from "~/mocks/types";
import { SavedLocation } from "~/shared/components/campus-plan";

export function ReviewAnswers({
  snapshot,
  version,
  areaLabel,
  plans,
}: {
  snapshot: SelfAssessmentSnapshot;
  version: InstrumentVersion;
  areaLabel: Map<string, string>;
  plans: CampusPlanVersion[];
}) {
  return (
    <section className="mt-4 rounded-lg border border-line p-3">
      <h3 className="text-sm font-bold text-heading">
        Jawaban penilaian mandiri · {version.label} (hanya-baca)
      </h3>
      <div className="mt-3 space-y-3">
        {version.dimensions.map((dim) => (
          <div key={dim.id}>
            <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">
              {dim.name}
            </p>
            <ul className="mt-1 space-y-2">
              {dim.indicators.map((ind) => {
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
