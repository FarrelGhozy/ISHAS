// Cincin skor SAM-iSAFE (SVG murni, tanpa lib grafik).
// Warna hanya penguat; nilai + label risiko selalu berupa teks.

import type { SamRiskLevel } from "~/mocks/types";

const WARNA: Record<SamRiskLevel, string> = {
  "Risiko Rendah": "#047857",
  "Risiko Sedang": "#b45309",
  "Risiko Tinggi": "#b91c1c",
};

export function SamScoreRing({
  percent,
  risk,
  total,
  max,
  onDark = false,
}: {
  percent: number;
  risk: SamRiskLevel;
  total: number;
  max: number;
  onDark?: boolean;
}) {
  const radius = 52;
  const keliling = 2 * Math.PI * radius;
  const offset = keliling - (Math.min(percent, 100) / 100) * keliling;
  return (
    <div
      className="flex items-center gap-4"
      role="img"
      aria-label={`Skor ${percent.toFixed(1)} persen, ${risk}, ${total} dari ${max}`}
    >
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={onDark ? "rgb(255 255 255 / 24%)" : "#eef2f6"}
          strokeWidth="12"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={WARNA[risk]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
        />
        <text
          x="64"
          y="62"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill={onDark ? "#ffffff" : "#2A3F54"}
        >
          {percent.toFixed(1)}%
        </text>
        <text
          x="64"
          y="82"
          textAnchor="middle"
          fontSize="11"
          fill={onDark ? "#dbeafe" : "#64748b"}
        >
          {total}/{max}
        </text>
      </svg>
      <div>
        <p className={`text-sm font-extrabold ${onDark ? "text-white" : "text-heading"}`}>
          {risk}
        </p>
        <p className={`mt-1 text-xs ${onDark ? "text-blue-100" : "text-secondary-text"}`}>
          {risk === "Risiko Rendah"
            ? "Kesiapan keselamatan baik."
            : risk === "Risiko Sedang"
              ? "Perlu perbaikan."
              : "Tindakan segera diperlukan."}
        </p>
      </div>
    </div>
  );
}
