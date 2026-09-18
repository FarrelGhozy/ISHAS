import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import { clusterMapItems, selectPublicCampusMap, type PublicMapItem } from "~/mocks/processors/campus-map";
import { CampusPlan } from "~/shared/components/campus-plan";
import { StatusChip } from "~/shared/components/status-chip";

const rank: Record<string, number> = { Ekstrem: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };
const color: Record<string, string> = { Ekstrem: "#7f1d1d", Tinggi: "#b91c1c", Sedang: "#b45309", Rendah: "#047857" };

export function PublicCampusMap({ institutionCode, compact = false }: { institutionCode?: string; compact?: boolean }) {
  return <MapContent key={institutionCode ?? "general"} institutionCode={institutionCode} compact={compact} />;
}

function MapContent({ institutionCode, compact }: { institutionCode?: string; compact: boolean }) {
  const state = useMockState();
  const [params, setParams] = useSearchParams();
  const [opened, setOpened] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height: 213 });
  const { plans, activeId, items } = selectPublicCampusMap(state, institutionCode);
  const requested = params.get("denah");
  const plan = plans.find((item) => item.id === requested) ?? plans.find((item) => item.id === activeId);
  const risk = params.get("risiko") ?? "";
  const status = params.get("statusPeta") ?? "";
  const filtered = items.filter((item) => (!risk || item.level === risk) && (!status || item.status === status));
  const visible = filtered.filter((item) => item.point && item.versionId === plan?.id);
  const other = filtered.filter((item) => item.point && item.versionId !== plan?.id);
  const unplaced = filtered.filter((item) => !item.point);
  const groups = clusterMapItems(visible, size.width, size.height);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [plan?.id, compact]);
  const detail = filtered.filter((item) => opened.includes(item.key));
  const institution = state.institutions.find((item) => item.code === institutionCode);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); setOpened([]); };
  const reset = () => { const next = new URLSearchParams(params); next.delete("risiko"); next.delete("statusPeta"); setParams(next); setOpened([]); };
  const linkParams = new URLSearchParams(params);
  if (institutionCode) linkParams.set("pesantren", institutionCode);
  return <article className="surface min-w-0 overflow-hidden" aria-label="Peta Risiko"><header className="flex flex-wrap items-start gap-2 border-b border-line p-4"><MapPin size={20} className="shrink-0 text-primary" aria-hidden /><div className="min-w-0 flex-1"><h2 className="font-extrabold text-heading">Peta Risiko</h2><p className="mt-1 text-sm text-secondary-text">{institution?.name ?? "Gambaran lokasi temuan tervalidasi"}</p></div><span className="text-xs text-secondary-text">Data publik · ilustrasi</span></header><div className="space-y-3 p-4">
    {!institutionCode || !plans.length && !institution ? <div className="rounded-lg bg-strip p-5 text-center"><MapPin size={28} className="mx-auto text-secondary-text" /><p className="mt-3 text-sm font-bold text-heading">Pilih pesantren untuk melihat peta risiko</p><p className="mt-1 text-sm text-secondary-text">Denah ditampilkan untuk satu pesantren, bukan gabungan semua pesantren.</p><button className="secondary-button mt-3" type="button" onClick={() => document.querySelector<HTMLSelectElement>('select[name="pesantren"], #filter-pesantren, #dashboard-pesantren')?.focus()}>Pilih pesantren</button></div> : <>
      {plans.length > 1 ? <label className="block text-sm font-bold text-heading">Versi denah<select className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal" value={plan?.id ?? ""} onChange={(event) => update("denah", event.target.value)}>{plans.map((item) => <option key={item.id} value={item.id}>Versi {item.revision}{item.id === activeId ? " · aktif" : " · sebelumnya"}</option>)}</select></label> : null}
      {requested && !plans.some((item) => item.id === requested) ? <p role="status" className="text-sm text-primary">Versi pada tautan tidak tersedia. Menampilkan denah aktif.</p> : null}
      {!compact ? <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Tingkat risiko<select className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal" value={risk} onChange={(event) => update("risiko", event.target.value)}><option value="">Semua tingkat</option>{Object.keys(rank).map((level) => <option key={level}>{level}</option>)}</select></label><label className="text-sm font-bold">Status penanganan<select className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal" value={status} onChange={(event) => update("statusPeta", event.target.value)}><option value="">Semua status</option><option>Pending</option><option>Proses</option></select></label></div> : null}
      {params.has("periode") ? <p className="text-xs text-secondary-text">Peta menampilkan temuan aktif lintas periode; filter periode historis belum diterapkan.</p> : null}
      {plan ? <>{!compact ? <div className="flex flex-wrap gap-2"><button type="button" className="secondary-button" onClick={() => setZoom((value) => value === 1 ? 2 : 1)}>{zoom === 1 ? "Perbesar denah" : "Ukuran normal"}</button><span className="self-center text-sm text-secondary-text">{zoom === 2 ? "Geser area denah untuk melihat bagian lain." : "Klik penanda atau pilih temuan di daftar."}</span></div> : null}<div className="max-w-full overflow-auto rounded-lg" style={{ maxHeight: compact ? undefined : "70vh" }}><div ref={canvasRef} style={{ width: `${compact ? 100 : zoom * 100}%` }}><CampusPlan key={plan.id} plan={plan}>{groups.map((group, index) => {
        const highest = [...group].sort((a, b) => rank[a.level] - rank[b.level])[0];
        const selected = group.some((item) => opened.includes(item.key));
        return <button type="button" key={group[0].key} aria-pressed={selected} aria-label={group.length > 1 ? `${group.length} temuan. Tingkat tertinggi ${highest.level}` : `${highest.issue}. Risiko ${highest.level}. ${highest.floor}`} className={`absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ left: `clamp(22px, ${group[0].point!.x}%, calc(100% - 22px))`, top: `clamp(22px, ${group[0].point!.y}%, calc(100% - 22px))`, backgroundColor: group.length > 1 ? "#102a35" : color[highest.level], color: "white" }} onClick={() => setOpened(group.map((item) => item.key))}>{group.length > 1 ? <strong>{group.length}</strong> : <span className="flex items-center gap-0.5">{highest.level === "Rendah" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}<strong className="text-sm">{index + 1}</strong></span>}</button>;
      })}</CampusPlan></div></div><p className="text-xs text-secondary-text">Versi {plan.revision} · {plan.illustration ? "Ilustrasi denah · bukan lokasi sebenarnya" : "Denah gambaran besar pesantren"}</p></> : <p role="status" className="rounded-lg bg-strip p-4 text-sm text-secondary-text">Denah pesantren belum tersedia. Ringkasan lokasi temuan tetap dapat dibaca.</p>}
      <ul className="flex flex-wrap gap-3 text-sm" aria-label="Legenda risiko">{(["Ekstrem", "Tinggi", "Sedang", "Rendah"] as const).map((level) => <li key={level}><StatusChip value={level} /></li>)}</ul>
      <p className="text-sm text-secondary-text">{filtered.length} temuan · {visible.length} bertitik pada denah ini · {other.length} pada versi lain · {unplaced.length} tanpa titik</p>
      {other.length ? <p role="status" className="rounded bg-marun-bg p-3 text-sm text-primary">Ada {other.length} temuan pada versi denah sebelumnya/lain. Pilih versinya untuk melihat titik; titik tidak dipindahkan otomatis.</p> : null}
      {!filtered.length ? <div role="status" className="rounded bg-strip p-3 text-sm text-secondary-text">{items.length ? <>Tidak ada temuan pada filter ini. <button type="button" className="text-button" onClick={reset}>Reset filter</button></> : "Belum ada temuan tervalidasi. Ini bukan pernyataan bahwa lokasi aman."}</div> : null}
      {detail.length ? <div className="space-y-2 rounded-lg border border-marun-border bg-marun-bg p-3" aria-live="polite"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold">Ringkasan titik</h3><button type="button" className="secondary-button" onClick={() => setOpened([])}>Tutup</button></div>{detail.map((item) => <MapDetail key={item.key} item={item} />)}</div> : null}
      {compact ? <>{unplaced.length ? <p className="text-sm text-secondary-text">Temuan tanpa titik tersedia pada daftar peta lengkap.</p> : null}<Link className="secondary-button" to={`/peta-risiko?${linkParams}`}>Lihat peta lengkap</Link></> : <section className="space-y-2" aria-label="Daftar temuan pada peta"><h3 className="font-bold text-heading">Daftar temuan ({filtered.length})</h3>{filtered.map((item) => <div key={item.key} className={`rounded-lg border p-3 ${opened.includes(item.key) ? "border-primary bg-marun-bg" : "border-line"}`}><MapDetail item={item} /><p className="mt-2 text-sm text-secondary-text">{item.point ? `Titik pada versi ${plans.find((entry) => entry.id === item.versionId)?.revision ?? "—"}` : "Belum memiliki titik"}</p>{item.point ? <button className="secondary-button mt-2" type="button" onClick={() => { const next = new URLSearchParams(params); next.set("denah", item.versionId!); setParams(next); setOpened([item.key]); }}>Sorot titik</button> : null}</div>)}</section>}
    </>}
  </div></article>;
}

function MapDetail({ item }: { item: PublicMapItem }) {
  return <div><div className="flex flex-wrap gap-2"><StatusChip value={item.level} /><StatusChip value={item.status} /></div><h4 className="mt-2 text-sm font-bold text-heading">{item.issue}</h4><p className="mt-1 text-sm text-secondary-text">{item.location}{item.floor ? ` · ${item.floor}` : ""}</p>{item.validator ? <p className="mt-1 text-sm text-secondary-text">Validator: {item.validator}</p> : null}{item.pic ? <p className="text-sm text-secondary-text">PIC: {item.pic}</p> : null}</div>;
}
