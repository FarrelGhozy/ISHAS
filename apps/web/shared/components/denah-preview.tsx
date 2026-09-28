// Pratinjau denah baca — kecil dulu, klik baru besar (D-22).
// Dipakai peta baca, detail laporan/temuan, dan pratinjau denah aktif.
// Form penandaan titik (LocationPicker) tetap penuh agar presisi.

import { useState } from "react";
import { MapPin, Maximize2 } from "lucide-react";
import type { CampusPlanVersion, LocationSnapshot } from "~/mocks/types";
import { CampusPlan } from "./campus-plan";

export function TombolDenahBesar({
  plan,
  onBuka,
}: {
  plan: CampusPlanVersion;
  onBuka: () => void;
}) {
  return (
    <button
      type="button"
      className="block w-full rounded-lg border border-line text-left focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      aria-label={`Lihat denah besar versi ${plan.revision}`}
      onClick={onBuka}
    >
      <div aria-hidden className="max-h-48 overflow-hidden rounded-t-lg bg-strip">
        <CampusPlan plan={plan} />
      </div>
      <span className="flex min-h-11 items-center justify-center gap-2 p-2 text-sm font-bold text-primary">
        <Maximize2 size={16} aria-hidden />
        Lihat denah besar
      </span>
    </button>
  );
}

export function SavedLocation({
  plans,
  location,
}: {
  plans: CampusPlanVersion[];
  location?: LocationSnapshot;
}) {
  const [besar, setBesar] = useState(false);
  const plan = plans.find((item) => item.id === location?.campusPlanVersionId);
  if (!location)
    return <p className="mt-2 text-sm text-secondary-text">Tidak ada titik denah tercatat.</p>;
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-secondary-text">
        {location.locationText} {location.floorNote ? `· ${location.floorNote}` : ""}
      </p>
      {plan && location.point ? (
        besar ? (
          <>
            <CampusPlan key={plan.id} plan={plan}>
              <span
                aria-hidden
                className="absolute -translate-x-1/2 -translate-y-full text-primary"
                style={{ left: `${location.point.x}%`, top: `${location.point.y}%` }}
              >
                <MapPin size={30} fill="white" />
              </span>
            </CampusPlan>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="secondary-button" onClick={() => setBesar(false)}>
                Tutup denah besar
              </button>
              <p className="text-sm text-secondary-text">
                Versi denah {plan.revision} · titik {location.point.x}% / {location.point.y}%
                (hanya-baca)
              </p>
            </div>
          </>
        ) : (
          <>
            <TombolDenahBesar plan={plan} onBuka={() => setBesar(true)} />
            <p className="text-sm text-secondary-text">
              Versi denah {plan.revision} · titik {location.point.x}% / {location.point.y}%
              (hanya-baca)
            </p>
          </>
        )
      ) : (
        <p className="text-sm text-secondary-text">Laporan ini tidak memiliki titik denah.</p>
      )}
    </div>
  );
}
