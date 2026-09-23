import { useState } from "react";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { StatusChip } from "~/shared/components/status-chip";

type IndForm = {
  code: string;
  title: string;
  prompt: string;
  answerType: "likert-1-5" | "boolean-ya-tidak" | "likert-1-2-tidak";
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
};

const EMPTY_IND: IndForm = {
  code: "",
  title: "",
  prompt: "",
  answerType: "likert-1-5",
  required: true,
  evidenceRequired: false,
  locationRequired: false,
};

export function Page() {
  const state = useMockState();
  // Normalisasi defensif: data dummy tersimpan di browser tidak boleh
  // meruntuhkan render bila bentuknya menyimpang (pulih ke tampilan kosong).
  const versions = Array.isArray(state.instrumentVersions)
    ? state.instrumentVersions.filter((x) => x && typeof x === "object")
    : [];
  const [versionId, setVersionId] = useState(
    state.activeInstrumentVersionId ?? versions[0]?.id ?? "",
  );
  const version = versions.find((x) => x.id === versionId);
  const dimensions = Array.isArray(version?.dimensions)
    ? version.dimensions.filter((d) => d && typeof d === "object")
    : [];
  const indicatorCount = dimensions.reduce(
    (n, d) => n + (Array.isArray(d.indicators) ? d.indicators.length : 0),
    0,
  );
  const [dimName, setDimName] = useState("");
  const [note, setNote] = useState("");
  const [indForm, setIndForm] = useState<Record<string, IndForm>>({});
  const isDraft = version?.status === "Draft";

  const patchIndForm = (dimId: string, patch: Partial<IndForm>) => {
    setIndForm((o) => ({ ...o, [dimId]: { ...(o[dimId] ?? EMPTY_IND), ...patch } }));
  };

  const addDim = () => {
    if (!version) return;
    const r = storeActions.addInstrumentDimension(version.id, dimName);
    setNote(r.ok ? `Dimensi ditambahkan ke ${version.id}.` : r.error);
    if (r.ok) setDimName("");
  };

  const addInd = (dimId: string) => {
    if (!version) return;
    const f = indForm[dimId] ?? { ...EMPTY_IND };
    const r = storeActions.addInstrumentIndicator(version.id, dimId, f);
    setNote(r.ok ? `Indikator ${f.code || "baru"} ditambahkan.` : r.error);
    if (r.ok) setIndForm((old) => ({ ...old, [dimId]: { ...EMPTY_IND } }));
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Metodologi</p>
        <h1 className="text-2xl font-extrabold text-heading">Instrumen penelitian</h1>
        <p className="text-sm text-secondary-text">
          Tinjau struktur dimensi, indikator, dan aturan pengumpulan bukti. Versi Published terkunci;
          perubahan hanya pada Draft (FLOWS §7).
        </p>
      </header>
      <label className="max-w-sm text-xs font-bold">
        Versi instrumen
        <select
          className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-3"
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
        >
          {versions.map((x) => (
            <option value={x.id} key={x.id}>{x.label} · {x.status}</option>
          ))}
        </select>
      </label>
      {note ? <p role="status" className="text-sm">{note}</p> : null}
      {version ? (
        <>
          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="mr-auto">
              <strong className="text-heading">{version.label}</strong>
              <p className="text-xs text-secondary-text">
                {dimensions.length} dimensi · {indicatorCount} indikator
              </p>
            </div>
            <StatusChip value={version.status} />
          </div>
          {isDraft ? (
            <div className="surface flex flex-wrap items-end gap-3 p-4">
              <label className="min-w-60 flex-1 text-xs font-bold">
                Dimensi baru
                <input
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
                  value={dimName}
                  onChange={(e) => setDimName(e.target.value)}
                  placeholder="Contoh: Keselamatan listrik"
                />
              </label>
              <button type="button" className="primary-button" onClick={addDim}>
                Tambah dimensi
              </button>
            </div>
          ) : (
            <p className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
              Versi {version.status} terkunci. Buat draft baru di Versioning untuk mengubah struktur.
            </p>
          )}
          {dimensions.map((d) => {
            const indicators = Array.isArray(d.indicators)
              ? d.indicators.filter((i) => i && typeof i === "object")
              : [];
            const aspects = Array.isArray(d.aspects) ? d.aspects : [];
            return (
            <article className="surface overflow-hidden" key={d.id}>
              <div className="border-b border-line bg-strip px-4 py-3">
                <h2 className="font-bold text-heading">{d.name}</h2>
                <p className="text-xs text-faint">
                  {d.id}{d.categoryId ? ` · ${d.categoryId}` : ""} · {indicators.length} indikator
                  {aspects.length ? ` · ${aspects.length} aspek` : ""}
                </p>
              </div>
              <div className="divide-y divide-line">
                {indicators.map((i) => (
                  <div className="p-4" key={i.id}>
                    <div className="flex flex-wrap gap-2">
                      <strong className="mr-auto text-sm text-heading">{i.code} · {i.title}</strong>
                      {i.required ? <span className="status status-neutral">Wajib</span> : null}
                      {i.evidenceRequired ? <span className="status status-amber">Bukti wajib</span> : null}
                      {i.locationRequired ? <span className="status status-blue">Lokasi wajib</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-secondary-text">{i.prompt}</p>
                    <p className="mt-2 text-xs text-faint">
                      Jawaban: {i.answerType} · Pemicu temuan: {i.findingTrigger}
                      {i.aspectId ? ` · ${i.aspectId}` : ""}
                    </p>
                  </div>
                ))}
              </div>
              {isDraft ? (
                <div className="grid gap-2 border-t border-line bg-strip p-4 md:grid-cols-3">
                  <label className="text-xs font-bold">
                    Kode
                    <input
                      className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                      value={indForm[d.id]?.code ?? ""}
                      onChange={(e) => patchIndForm(d.id, { code: e.target.value })}
                      placeholder="IND-XXX-000"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Judul
                    <input
                      className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                      value={indForm[d.id]?.title ?? ""}
                      onChange={(e) => patchIndForm(d.id, { title: e.target.value })}
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Tipe jawaban
                    <select
                      className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                      value={indForm[d.id]?.answerType ?? "likert-1-5"}
                      onChange={(e) => patchIndForm(d.id, { answerType: e.target.value as IndForm["answerType"] })}
                    >
                      <option value="likert-1-5">likert-1-5</option>
                      <option value="boolean-ya-tidak">boolean-ya-tidak</option>
                      <option value="likert-1-2-tidak">likert-1-2-tidak</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold md:col-span-3">
                    Prompt
                    <textarea
                      className="mt-1 min-h-16 w-full rounded border border-line-soft p-2 font-normal"
                      value={indForm[d.id]?.prompt ?? ""}
                      onChange={(e) => patchIndForm(d.id, { prompt: e.target.value })}
                      placeholder="Tulis pertanyaan observasi min 10 karakter"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3 text-xs md:col-span-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={indForm[d.id]?.required ?? true}
                        onChange={(e) => patchIndForm(d.id, { required: e.target.checked })}
                      />
                      Wajib
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={indForm[d.id]?.evidenceRequired ?? false}
                        onChange={(e) => patchIndForm(d.id, { evidenceRequired: e.target.checked })}
                      />
                      Bukti wajib
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={indForm[d.id]?.locationRequired ?? false}
                        onChange={(e) => patchIndForm(d.id, { locationRequired: e.target.checked })}
                      />
                      Lokasi wajib
                    </label>
                  </div>
                  <button type="button" className="secondary-button self-end" onClick={() => addInd(d.id)}>
                    Tambah indikator
                  </button>
                </div>
              ) : null}
            </article>
            );
          })}
        </>
      ) : null}
    </section>
  );
}
