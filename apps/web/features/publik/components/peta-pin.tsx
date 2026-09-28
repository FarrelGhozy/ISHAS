// Penanda titik temuan pada denah — tombol cluster per kelompok (D-14).
// Dipakai mode denah besar peta publik; pratinjau kecil tanpa pin.

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PublicMapItem } from "~/mocks/processors/campus-map";
import { StatusChip } from "~/shared/components/status-chip";

export const URUTAN_LEVEL: Record<string, number> = { Ekstrem: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };

const WARNA: Record<string, string> = {
  Ekstrem: "#7f1d1d",
  Tinggi: "#b91c1c",
  Sedang: "#b45309",
  Rendah: "#047857",
};

export function PetaPin({
  groups,
  opened,
  onBuka,
}: {
  groups: PublicMapItem[][];
  opened: string[];
  onBuka: (keys: string[]) => void;
}) {
  return (
    <>
      {groups.map((group, index) => {
        const highest = [...group].sort((a, b) => URUTAN_LEVEL[a.level] - URUTAN_LEVEL[b.level])[0];
        const selected = group.some((item) => opened.includes(item.key));
        return (
          <button
            type="button"
            key={group[0].key}
            aria-pressed={selected}
            aria-label={
              group.length > 1
                ? `${group.length} temuan. Tingkat tertinggi ${highest.level}`
                : `${highest.issue}. Risiko ${highest.level}. ${highest.floor}`
            }
            className={`absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
            style={{
              left: `clamp(22px, ${group[0].point!.x}%, calc(100% - 22px))`,
              top: `clamp(22px, ${group[0].point!.y}%, calc(100% - 22px))`,
              backgroundColor: group.length > 1 ? "#102a35" : WARNA[highest.level],
              color: "white",
            }}
            onClick={() => onBuka(group.map((item) => item.key))}
          >
            {group.length > 1 ? (
              <strong>{group.length}</strong>
            ) : (
              <span className="flex items-center gap-0.5">
                {highest.level === "Rendah" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                <strong className="text-sm">{index + 1}</strong>
              </span>
            )}
            </button>
        );
      })}
    </>
  );
}

export function MapDetail({ item }: { item: PublicMapItem }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <StatusChip value={item.level} />
        <StatusChip value={item.status} />
      </div>
      <h4 className="mt-2 text-sm font-bold text-heading">{item.issue}</h4>
      <p className="mt-1 text-sm text-secondary-text">
        {item.location}
        {item.floor ? ` · ${item.floor}` : ""}
      </p>
      {item.validator ? (
        <p className="mt-1 text-sm text-secondary-text">Validator: {item.validator}</p>
      ) : null}
      {item.pic ? <p className="text-sm text-secondary-text">PIC: {item.pic}</p> : null}
    </div>
  );
}

export function PetaRingkasanTitik({
  detail,
  onTutup,
}: {
  detail: PublicMapItem[];
  onTutup: () => void;
}) {
  if (!detail.length) return null;
  return (
    <div className="space-y-2 rounded-lg border border-brand-border bg-brand-bg p-3" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Ringkasan titik</h3>
        <button type="button" className="secondary-button" onClick={onTutup}>
          Tutup
        </button>
      </div>
      {detail.map((item) => (
        <MapDetail key={item.key} item={item} />
      ))}
    </div>
  );
}

export function PetaDaftarTemuan({  filtered,
  plans,
  opened,
  onSorot,
}: {
  filtered: PublicMapItem[];
  plans: { id: string; revision: number }[];
  opened: string[];
  onSorot: (item: PublicMapItem) => void;
}) {
  return (
    <section className="space-y-2" aria-label="Daftar temuan pada peta">
      <h3 className="font-bold text-heading">Daftar temuan ({filtered.length})</h3>
      {filtered.map((item) => (
        <div
          key={item.key}
          className={`rounded-lg border p-3 ${opened.includes(item.key) ? "border-primary bg-brand-bg" : "border-line"}`}
        >
          <MapDetail item={item} />
          <p className="mt-2 text-sm text-secondary-text">
            {item.point
              ? `Titik pada versi ${plans.find((entry) => entry.id === item.versionId)?.revision ?? "—"}`
              : "Belum memiliki titik"}
          </p>
          {item.point ? (
            <button className="secondary-button mt-2" type="button" onClick={() => onSorot(item)}>
              Sorot titik
            </button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
