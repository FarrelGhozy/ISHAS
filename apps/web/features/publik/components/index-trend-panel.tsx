// Panel `Perkembangan indeks` — WIREFRAMES.md §1 region 3.
// Grafik area SVG: stroke #be123c 3px, gradien 24%→0, grid #e2e8f0, label #64748b 11px.
// Tinggi minimum 225px; hanya render setelah panel terlihat (TEST_PLAN §4).

import { useEffect, useId, useRef, useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { IndexSummary } from "~/mocks/processors/dashboard-aggregate";

const TINGGI = 240;
const PADDING = { atas: 12, kanan: 48, bawah: 26, kiri: 34 };

export function IndexTrendPanel({ summary }: { summary: IndexSummary }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const gradientId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const series = summary.series.slice(-6);
  const hasData = series.length >= 1 && summary.currentIndex !== null;
  const trend =
    summary.delta === null ? null : summary.arah === "tetap" ? (
      <span className="flex items-center gap-1 text-sm text-secondary-text"><Minus size={14} aria-hidden />Setara periode lalu</span>
    ) : summary.arah === "turun" ? (
      <span className="flex items-center gap-1 text-sm font-bold text-[#b91c1c]">
        <TrendingDown size={13} aria-hidden />
        {Math.abs(summary.delta)} periode ini
      </span>
    ) : (
      <span className="trend-up flex items-center gap-1 text-sm font-bold text-[#047857]">
        <TrendingUp size={13} aria-hidden />
        +{summary.delta} periode ini
      </span>
    );

  return (
    <div className="surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-extrabold text-heading">Perkembangan indeks</h2>
        {trend}
      </div>
      <p className="mt-0.5 text-xs text-secondary-text">
        Perbandingan enam periode terakhir · skala indeks 0–100 · data ilustrasi
      </p>
      <div ref={ref} className="mt-3 min-h-[225px]" role="img"
        aria-label={
          hasData
            ? `Grafik perkembangan indeks ${summary.periode}: ${series
                .map((p) => `${p.period} ${p.index}`)
                .join(", ")}`
            : "Grafik perkembangan indeks belum tersedia"
        }
      >
        {!visible ? (
          <div className="h-[225px] w-full animate-pulse rounded-lg bg-strip" aria-hidden />
        ) : !hasData ? (
          <div className="flex h-[225px] items-center justify-center text-sm text-secondary-text">
            Belum ada hasil tervalidasi untuk digambarkan.
          </div>
        ) : (
          <GrafikArea series={series} width={Math.max(width, 260)} gradientId={gradientId} />
        )}
      </div>
    </div>
  );
}

function GrafikArea({
  series,
  width,
  gradientId,
}: {
  series: { period: string; index: number }[];
  width: number;
  gradientId: string;
}) {
  const innerW = width - PADDING.kiri - PADDING.kanan;
  const innerH = TINGGI - PADDING.atas - PADDING.bawah;
  const x = (i: number) =>
    PADDING.kiri + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => PADDING.atas + innerH - (v / 100) * innerH;

  const garis = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.index)}`).join(" ");
  const area = `${garis} L${x(series.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${TINGGI}`} width="100%" height={TINGGI} className="block" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#be123c" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={PADDING.kiri} x2={width - PADDING.kanan} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={PADDING.kiri - 6} y={y(v) + 3.5} textAnchor="end" fontSize="10" fill="#64748b">
            {v}
          </text>
        </g>
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={garis} fill="none" stroke="#be123c" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((p, i) => (
        <g key={p.period}>
          <circle cx={x(i)} cy={y(p.index)} r={i === series.length - 1 ? 4.5 : 3} fill="#be123c" />
          <text x={x(i)} y={TINGGI - 8} textAnchor="middle" fontSize="11" fill="#64748b">
            {width < 420 ? p.period.split(" ")[0] : p.period}
          </text>
        </g>
      ))}
    </svg>
  );
}
