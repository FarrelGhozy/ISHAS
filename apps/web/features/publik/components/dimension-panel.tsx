// Panel `Hasil per dimensi` — WIREFRAMES.md §1 region 3 (panel samping).
// Bar per dimensi; area nilai terendah diprioritaskan (diurut naik).

import type { DimensiSkor } from "~/mocks/processors/dashboard-aggregate";

export function DimensionPanel({ dimensions }: { dimensions: DimensiSkor[] }) {
  const terisi = dimensions.filter((d) => d.score !== null);
  const terurut = [...terisi].sort((a, b) => (a.score as number) - (b.score as number));

  return (
    <div className="surface p-4">
      <h2 className="text-sm font-extrabold text-heading">Hasil per dimensi</h2>
      <p className="mt-0.5 text-xs text-secondary-text">
        Area nilai terendah diprioritaskan · skala 0–100 · data ilustrasi
      </p>
      {terurut.length === 0 ? (
        <p className="mt-3 text-sm text-secondary-text">
          Belum ada jawaban instrumen tervalidasi untuk konteks ini.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {terurut.map((d) => (
            <li key={d.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-heading">{d.name}</span>
                <span className="text-sm font-extrabold text-heading">
                  {Math.round(d.score as number)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-strip">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(d.score as number)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
