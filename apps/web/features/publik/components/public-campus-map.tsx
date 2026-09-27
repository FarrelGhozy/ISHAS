import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { MapPin } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import {
  clusterMapItems,
  selectPublicCampusMap,
} from "~/mocks/processors/campus-map";
import { CampusPlan } from "~/shared/components/campus-plan";
import { TombolDenahBesar } from "~/shared/components/denah-preview";
import { PetaPin, PetaDaftarTemuan, PetaRingkasanTitik, URUTAN_LEVEL } from "./peta-pin";
import { StatusChip } from "~/shared/components/status-chip";

export function PublicCampusMap({
  institutionCode,
  compact = false,
}: {
  institutionCode?: string;
  compact?: boolean;
}) {
  return (
    <MapContent
      key={institutionCode ?? "general"}
      institutionCode={institutionCode}
      compact={compact}
    />
  );
}

function MapContent({ institutionCode, compact }: { institutionCode?: string; compact: boolean }) {
  const state = useMockState();
  const [params, setParams] = useSearchParams();
  const [opened, setOpened] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [besar, setBesar] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height: 213 });
  const { plans, activeId, items } = selectPublicCampusMap(state, institutionCode);
  const requested = params.get("denah");
  const plan =
    plans.find((item) => item.id === requested) ?? plans.find((item) => item.id === activeId);
  const risk = params.get("risiko") ?? "";
  const status = params.get("statusPeta") ?? "";
  const filtered = items.filter(
    (item) => (!risk || item.level === risk) && (!status || item.status === status),
  );
  const visible = filtered.filter((item) => item.point && item.versionId === plan?.id);
  const other = filtered.filter((item) => item.point && item.versionId !== plan?.id);
  const unplaced = filtered.filter((item) => !item.point);
  const groups = clusterMapItems(visible, size.width, size.height);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [plan?.id, compact, besar]);
  const detail = filtered.filter((item) => opened.includes(item.key));
  const institution = state.institutions.find((item) => item.code === institutionCode);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setOpened([]);
  };
  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete("risiko");
    next.delete("statusPeta");
    setParams(next);
    setOpened([]);
  };
  const linkParams = new URLSearchParams(params);
  if (institutionCode) linkParams.set("pesantren", institutionCode);
  return (
    <article className="surface min-w-0 overflow-hidden" aria-label="Peta Risiko">
      <header className="flex flex-wrap items-start gap-2 border-b border-line p-4">
        <MapPin size={20} className="shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-heading">Peta Risiko</h2>
          <p className="mt-1 text-sm text-secondary-text">
            {institution?.name ?? "Gambaran lokasi temuan tervalidasi"}
          </p>
        </div>
        <span className="text-xs text-secondary-text">Data publik · ilustrasi</span>
      </header>
      <div className="space-y-3 p-4">
        {!institutionCode || (!plans.length && !institution) ? (
          <div className="rounded-lg bg-strip p-5 text-center">
            <MapPin size={28} className="mx-auto text-secondary-text" />
            <p className="mt-3 text-sm font-bold text-heading">
              Pilih pesantren untuk melihat peta risiko
            </p>
            <p className="mt-1 text-sm text-secondary-text">
              Denah ditampilkan untuk satu pesantren, bukan gabungan semua pesantren.
            </p>
            <button
              className="secondary-button mt-3"
              type="button"
              onClick={() =>
                document
                  .querySelector<HTMLSelectElement>(
                    'select[name="pesantren"], #filter-pesantren, #dashboard-pesantren',
                  )
                  ?.focus()
              }
            >
              Pilih pesantren
            </button>
          </div>
        ) : (
          <>
            {plans.length > 1 ? (
              <label className="block text-sm font-bold text-heading">
                Versi denah
                <select
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
                  value={plan?.id ?? ""}
                  onChange={(event) => update("denah", event.target.value)}
                >
                  {plans.map((item) => (
                    <option key={item.id} value={item.id}>
                      Versi {item.revision}
                      {item.id === activeId ? " · aktif" : " · sebelumnya"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {requested && !plans.some((item) => item.id === requested) ? (
              <p role="status" className="text-sm text-primary">
                Versi pada tautan tidak tersedia. Menampilkan denah aktif.
              </p>
            ) : null}
            {!compact ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  Tingkat risiko
                  <select
                    className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
                    value={risk}
                    onChange={(event) => update("risiko", event.target.value)}
                  >
                    <option value="">Semua tingkat</option>
                    {Object.keys(URUTAN_LEVEL).map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Status penanganan
                  <select
                    className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
                    value={status}
                    onChange={(event) => update("statusPeta", event.target.value)}
                  >
                    <option value="">Semua status</option>
                    <option>Pending</option>
                    <option>Proses</option>
                  </select>
                </label>
              </div>
            ) : null}
            {params.has("periode") ? (
              <p className="text-xs text-secondary-text">
                Peta menampilkan temuan aktif lintas periode; filter periode historis belum
                diterapkan.
              </p>
            ) : null}
            {plan ? (
              besar ? (
                <>
                  {!compact ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setZoom((value) => (value === 1 ? 2 : 1))}
                      >
                        {zoom === 1 ? "Perbesar denah" : "Ukuran normal"}
                      </button>
                      <span className="self-center text-sm text-secondary-text">
                        {zoom === 2
                          ? "Geser area denah untuk melihat bagian lain."
                          : "Klik penanda atau pilih temuan di daftar."}
                      </span>
                    </div>
                  ) : null}
                  <div
                    className="max-w-full overflow-auto rounded-lg"
                    style={{ maxHeight: compact ? undefined : "70vh" }}
                  >
                    <div ref={canvasRef} style={{ width: `${compact ? 100 : zoom * 100}%` }}>
                      <CampusPlan key={plan.id} plan={plan}>
                        <PetaPin groups={groups} opened={opened} onBuka={setOpened} />
                      </CampusPlan>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setBesar(false)}
                    >
                      Tutup denah besar
                    </button>
                    <p className="text-xs text-secondary-text">
                      Versi {plan.revision} ·{" "}
                      {plan.illustration
                        ? "Ilustrasi denah · bukan lokasi sebenarnya"
                        : "Denah gambaran besar pesantren"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <TombolDenahBesar plan={plan} onBuka={() => setBesar(true)} />
                  <p className="text-xs text-secondary-text">
                    Versi {plan.revision} ·{" "}
                    {plan.illustration
                      ? "Ilustrasi denah · bukan lokasi sebenarnya"
                      : "Denah gambaran besar pesantren"}
                  </p>
                </>
              )
            ) : (
              <p role="status" className="rounded-lg bg-strip p-4 text-sm text-secondary-text">
                Denah pesantren belum tersedia. Ringkasan lokasi temuan tetap dapat dibaca.
              </p>
            )}
            <ul className="flex flex-wrap gap-3 text-sm" aria-label="Legenda risiko">
              {(["Ekstrem", "Tinggi", "Sedang", "Rendah"] as const).map((level) => (
                <li key={level}>
                  <StatusChip value={level} />
                </li>
              ))}
            </ul>
            <p className="text-sm text-secondary-text">
              {filtered.length} temuan · {visible.length} bertitik pada denah ini · {other.length}{" "}
              pada versi lain · {unplaced.length} tanpa titik
            </p>
            {other.length ? (
              <p role="status" className="rounded bg-brand-bg p-3 text-sm text-primary">
                Ada {other.length} temuan pada versi denah sebelumnya/lain. Pilih versinya untuk
                melihat titik; titik tidak dipindahkan otomatis.
              </p>
            ) : null}
            {!filtered.length ? (
              <div role="status" className="rounded bg-strip p-3 text-sm text-secondary-text">
                {items.length ? (
                  <>
                    Tidak ada temuan pada filter ini.{" "}
                    <button type="button" className="text-button" onClick={reset}>
                      Reset filter
                    </button>
                  </>
                ) : (
                  "Belum ada temuan tervalidasi. Ini bukan pernyataan bahwa lokasi aman."
                )}
              </div>
            ) : null}
            <PetaRingkasanTitik detail={detail} onTutup={() => setOpened([])} />
            {compact ? (
              <>
                {unplaced.length ? (
                  <p className="text-sm text-secondary-text">
                    Temuan tanpa titik tersedia pada daftar peta lengkap.
                  </p>
                ) : null}
                <Link className="secondary-button" to={`/peta-risiko?${linkParams}`}>
                  Lihat peta lengkap
                </Link>
              </>
            ) : (
              <PetaDaftarTemuan
                filtered={filtered}
                plans={plans}
                opened={opened}
                onSorot={(item) => {
                  const next = new URLSearchParams(params);
                  next.set("denah", item.versionId!);
                  setParams(next);
                  setOpened([item.key]);
                }}
              />
            )}
          </>
        )}
      </div>
    </article>
  );
}
