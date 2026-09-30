// Grafik perkembangan SAM-iSAFE (batang vertikal CSS murni, tanpa lib).
// Membandingkan persen antar pengamatan Selesai dari waktu ke waktu.

import type { SamAssessment } from "~/mocks/types";

function warna(risk: SamAssessment["riskLevel"]): string {
  if (risk === "Risiko Rendah") return "#047857";
  if (risk === "Risiko Sedang") return "#b45309";
  return "#b91c1c";
}

function labelTanggal(iso: string): string {
  const [tahun, bulan, tanggal] = iso.split("-");
  return `${tanggal}/${bulan}/${tahun?.slice(2) ?? ""}`;
}

export function SamTrendChart({ items }: { items: SamAssessment[] }) {
  if (items.length === 0) return null;
  const maks = Math.max(100, ...items.map((item) => item.percent));
  return (
    <figure>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[28rem] items-end gap-3"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`Perkembangan ${items.length} pengamatan, terakhir ${items[items.length - 1].percent.toFixed(1)} persen`}
        >
          {items.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 flex-col items-center gap-1"
            title={`${item.id} · ${item.percent.toFixed(1)}% · ${item.riskLevel}`}
          >
            <span className="text-xs font-extrabold text-heading">
              {item.percent.toFixed(0)}
            </span>
            <div
              className="flex h-36 w-full items-end justify-center border-b border-line bg-[linear-gradient(to_top,var(--color-line)_1px,transparent_1px)] bg-size-[100%_25%] sm:h-44"
            >
              <div
                className="w-3/4 max-w-14 rounded-t"
                style={{
                  height: `${maks ? (item.percent / maks) * 100 : 0}%`,
                  background: warna(item.riskLevel),
                  minHeight: item.percent > 0 ? 8 : 0,
                }}
              />
            </div>
            <span className="text-[11px] text-faint">
              {labelTanggal(item.observedAt)}
            </span>
          </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-faint">
        Sumbu persen 0–{maks}. Arah naik berarti kondisi membaik.
      </figcaption>
    </figure>
  );
}
