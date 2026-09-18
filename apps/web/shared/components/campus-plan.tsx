import { useEffect, useState, type ReactNode } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import type { CampusPlanVersion, LocationSnapshot, PlanPoint } from "~/mocks/types";
import { getCampusAsset } from "~/mocks/adapters/campus-assets";
import { isValidPoint } from "~/mocks/processors/campus-map";

function usePlanImage(assetId: string) {
  const [result, setResult] = useState<{ id: string; url?: string; error?: string }>({ id: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (assetId.startsWith("/images/")) { setResult({ id: assetId, url: assetId }); return; }
    let disposed = false, objectUrl = "";
    getCampusAsset(assetId).then((blob) => {
      if (disposed) return;
      if (!blob) { setResult({ id: assetId, error: "Gambar denah tidak tersedia pada perangkat ini." }); return; }
      objectUrl = URL.createObjectURL(blob);
      setResult({ id: assetId, url: objectUrl });
    }).catch(() => { if (!disposed) setResult({ id: assetId, error: "Gambar denah gagal dimuat." }); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [assetId, attempt]);
  return { ...(result.id === assetId ? result : { id: assetId }), retry: () => { setResult({ id: "" }); setAttempt((value) => value + 1); } };
}

export function CampusPlan({ plan, children, onPoint }: { plan: CampusPlanVersion; children?: ReactNode; onPoint?: (point: PlanPoint) => void }) {
  const { url, error, retry } = usePlanImage(plan.assetId);
  const [broken, setBroken] = useState(false);
  if (error || broken) return <div role="status" className="rounded-lg bg-strip p-4 text-sm text-secondary-text"><AlertTriangle size={18} className="mb-2" />{error ?? "Gambar denah gagal dimuat."}<button type="button" className="secondary-button mt-3" onClick={() => { setBroken(false); retry(); }}>Coba lagi</button></div>;
  if (!url) return <div role="status" className="grid min-h-48 place-items-center rounded-lg bg-strip text-sm text-secondary-text">Memuat denah…</div>;
  return <div className="relative w-full overflow-hidden rounded-lg border border-line bg-strip" style={{ aspectRatio: `${plan.width} / ${plan.height}` }}>
    <img src={url} alt={`Denah gambaran besar pesantren · versi ${plan.revision}`} draggable={false} className="block h-full w-full" onError={() => setBroken(true)} />
    {onPoint ? <button type="button" className="absolute inset-0 cursor-crosshair focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset" aria-label="Pilih titik pada denah dengan klik atau ketuk. Untuk keyboard gunakan kolom koordinat di bawah." onClick={(event) => {
      if (event.detail === 0) return; // Keyboard uses explicit numeric controls; no fake center point.
      const rect = event.currentTarget.getBoundingClientRect();
      const point = { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 };
      if (isValidPoint(point)) onPoint({ x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100 });
    }} /> : null}
    {children}
  </div>;
}

export function LocationPicker({ plan, value, onChange, disabled = false }: { plan?: CampusPlanVersion; value?: LocationSnapshot; onChange: (value: LocationSnapshot) => void; disabled?: boolean }) {
  const stale = Boolean(value?.point && value.campusPlanVersionId !== plan?.id);
  const point = !stale && isValidPoint(value?.point) ? value!.point : null;
  const update = (next: PlanPoint | null, floorNote = value?.floorNote ?? "") => onChange({ areaId: value?.areaId, locationText: value?.locationText ?? "", floorNote, campusPlanVersionId: next ? plan?.id ?? null : null, point: next });
  return <section className="space-y-3 rounded-lg border border-line p-3" aria-label="Titik lokasi pelaporan"><div><h3 className="text-sm font-bold text-heading">Titik pada denah <span className="font-normal text-secondary-text">(opsional)</span></h3><p className="mt-1 text-sm text-secondary-text">Tandai posisi pada gambaran besar pesantren. Lantai cukup ditulis sebagai keterangan.</p></div>
    {stale ? <p role="alert" className="rounded bg-marun-bg p-3 text-sm text-primary">Denah telah berubah. Pilih ulang titik pada versi terbaru atau hapus titik lama sebelum mengirim.</p> : null}
    {plan ? <><CampusPlan key={plan.id} plan={plan} onPoint={disabled ? undefined : (next) => update(next)}>{point ? <span aria-hidden className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-primary drop-shadow" style={{ left: `${point.x}%`, top: `${point.y}%` }}><MapPin size={30} fill="white" /></span> : null}</CampusPlan><p className="text-xs text-secondary-text">Versi {plan.revision} · {plan.illustration ? "Ilustrasi denah · bukan lokasi sebenarnya" : "Denah unggahan pengelola"}</p>
      <details><summary className="cursor-pointer text-sm font-semibold text-primary">Pilih titik dengan keyboard / koordinat</summary><div className="mt-2 grid grid-cols-2 gap-3">{(["x", "y"] as const).map((axis) => <label key={axis} className="text-sm">{axis === "x" ? "Posisi horizontal (%)" : "Posisi vertikal (%)"}<input type="number" min={0} max={100} step="0.01" disabled={disabled} value={point?.[axis] ?? ""} placeholder="0–100" className="mt-1 min-h-11 w-full rounded border border-line-soft px-3" onChange={(event) => {
        if (!event.target.value) { update(null); return; }
        const number = Number(event.target.value);
        if (number < 0 || number > 100) return;
        // Explicit keyboard input establishes a point; opposite axis starts at edge (not midpoint).
        update({ x: point?.x ?? 0, y: point?.y ?? 0, [axis]: number });
      }} /></label>)}</div></details>
    </> : <p role="status" className="rounded bg-strip p-3 text-sm text-secondary-text">Denah pesantren belum tersedia. Tetap isi area atau keterangan lokasi.</p>}
    {value?.point ? <div className="flex flex-wrap items-center gap-3 text-sm"><span>{point ? `Titik dipilih: ${point.x}% · ${point.y}%` : "Titik masih pada denah sebelumnya"}</span><button type="button" className="secondary-button" disabled={disabled} onClick={() => update(null)}>Hapus titik</button></div> : <p className="text-sm text-secondary-text">Belum ada titik. Lokasi area/teks tetap wajib; titik baru tampil publik setelah validasi.</p>}
    <label className="block text-sm font-bold text-heading">Keterangan lantai (opsional)<input maxLength={80} className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal" value={value?.floorNote ?? ""} disabled={disabled} placeholder="Contoh: lantai 2, dekat tangga" onChange={(event) => onChange({ areaId: value?.areaId, locationText: value?.locationText ?? "", floorNote: event.target.value, campusPlanVersionId: value?.campusPlanVersionId ?? null, point: value?.point ?? null })} /></label>
  </section>;
}

export function SavedLocation({ plans, location }: { plans: CampusPlanVersion[]; location?: LocationSnapshot }) {
  const plan = plans.find((item) => item.id === location?.campusPlanVersionId);
  if (!location) return <p className="mt-2 text-sm text-secondary-text">Tidak ada titik denah tercatat.</p>;
  return <div className="mt-3 space-y-2"><p className="text-sm text-secondary-text">{location.locationText} {location.floorNote ? `· ${location.floorNote}` : ""}</p>{plan && location.point ? <><CampusPlan key={plan.id} plan={plan}><span aria-hidden className="absolute -translate-x-1/2 -translate-y-full text-primary" style={{ left: `${location.point.x}%`, top: `${location.point.y}%` }}><MapPin size={30} fill="white" /></span></CampusPlan><p className="text-sm text-secondary-text">Versi denah {plan.revision} · titik {location.point.x}% / {location.point.y}% (hanya-baca)</p></> : <p className="text-sm text-secondary-text">Laporan ini tidak memiliki titik denah.</p>}</div>;
}
