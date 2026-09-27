// Slider progres tindak lanjut — 5 titik snap 0/25/50/75/100 + label tahap (D-20).
// Primitif shared untuk kartu kelola tindak lanjut Pesantren.

export const PROGRESS_POINTS = [0, 25, 50, 75, 100] as const;

const LABELS: Record<number, string> = {
  0: "Belum mulai",
  25: "Dimulai",
  50: "Setengah jalan",
  75: "Hampir selesai",
  100: "Selesai",
};

// Bulatkan nilai lama ke titik terdekat; non-angka menjadi 0.
export function snapProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const snapped = Math.round(value / 25) * 25;
  return Math.min(100, Math.max(0, snapped));
}

export function progressLabel(value: number): string {
  return LABELS[snapProgress(value)] ?? "Belum mulai";
}

export function ProgressSlider({
  id,
  value,
  disabled = false,
  onChange,
}: {
  id: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const snapped = snapProgress(value);
  const listId = `${id}-titik`;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <output htmlFor={id} className="text-2xl font-extrabold text-heading">
          {snapped}%
        </output>
        <span className="text-sm text-secondary-text">
          {progressLabel(snapped)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={25}
        list={listId}
        value={snapped}
        disabled={disabled}
        aria-label="Progres dalam persen"
        className="mt-2 min-h-10 w-full accent-primary"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <datalist id={listId}>
        {PROGRESS_POINTS.map((point) => (
          <option key={point} value={point} label={`${point}%`} />
        ))}
      </datalist>
      <div aria-hidden className="flex justify-between text-xs text-secondary-text">
        {PROGRESS_POINTS.map((point) => (
          <span key={point}>
            {point}%
          </span>
        ))}
      </div>
    </div>
  );
}
