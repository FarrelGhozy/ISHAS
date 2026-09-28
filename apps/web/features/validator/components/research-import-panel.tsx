// Panel impor dataset D-25 — upload → validasi → pratinjau → terapkan.
// Terapkan membuat laporan Menunggu validasi (tidak langsung publik).

import { useMemo, useState } from "react";
import {
  RESEARCH_TEMPLATE_CSV,
  parseResearchImport,
  type ValidImportRow,
} from "~/mocks/research-export";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState } from "~/shared/api/validator-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";

function unduh(nama: string, isi: string, tipe: string): void {
  const blob = new Blob([isi], { type: tipe });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function unduhTemplate(): void {
  unduh("template-impor-dataset.csv", RESEARCH_TEMPLATE_CSV, "text/csv");
}

export function PanelImpor({ terdaftar }: { terdaftar: string[] }) {
  const user = useCurrentUser();
  const [teks, setTeks] = useState("");
  const [namaBerkas, setNamaBerkas] = useState("");
  const [catatan, setCatatan] = useState("");

  const codes = useMemo(() => new Set(terdaftar), [terdaftar]);
  const pratinjau = useMemo(() => {
    if (!teks.trim()) {
      return null;
    }
    return parseResearchImport(teks, codes);
  }, [teks, codes]);

  const bacaBerkas = (file: File | undefined): void => {
    if (!file) {
      return;
    }
    setNamaBerkas(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setTeks(String(reader.result ?? ""));
      setCatatan("");
    };
    reader.readAsText(file);
  };

  const terapkan = async (): Promise<void> => {
    const baris: ValidImportRow[] = pratinjau?.valid ?? [];
    if (!baris.length) {
      setCatatan("Tidak ada baris valid untuk diterapkan.");
      return;
    }
    if (!window.confirm(`${baris.length} baris masuk antrean Menunggu validasi?`)) {
      return;
    }
    const hasil = await repository.importResearchDataset(
      { id: user?.id, name: user?.name ?? "Validator" },
      baris,
    );
    setCatatan(
      hasil.ok
        ? `${baris.length} baris masuk antrean Menunggu validasi.`
        : hasil.error,
    );
    if (hasil.ok) {
      refreshValidatorState();
      setTeks("");
      setNamaBerkas("");
    }
  };

  return (
    <section className="surface p-4" aria-label="Impor dataset">
      <h2 className="font-bold text-heading">Impor dataset</h2>
      <p className="mt-1 text-xs text-secondary-text">
        CSV/JSON → validasi → pratinjau → terapkan sebagai Menunggu validasi.
        Tidak langsung tampil publik.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="secondary-button cursor-pointer">
          Pilih berkas
          <input
            type="file"
            accept=".csv,.json"
            className="hidden"
            aria-label="Pilih berkas impor"
            onChange={(e) => bacaBerkas(e.target.files?.[0])}
          />
        </label>
        <button type="button" className="secondary-button" onClick={unduhTemplate}>
          Unduh template
        </button>
      </div>
      {namaBerkas ? (
        <p className="mt-2 text-xs text-faint">{namaBerkas}</p>
      ) : null}
      <label className="mt-3 block text-xs font-bold">
        Tempel isi berkas
        <textarea
          className="mt-1 min-h-24 w-full rounded border border-line-soft px-3 py-2 font-normal"
          placeholder="institutionCode,reporterName,scorePercent,title"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
        />
      </label>
      {pratinjau ? (
        <div className="mt-3 text-xs">
          <p className="font-bold text-heading">
            Pratinjau: {pratinjau.valid.length} valid · {pratinjau.errors.length}{" "}
            galat
          </p>
          {pratinjau.errors.length > 0 ? (
            <ul className="mt-1 max-h-28 overflow-y-auto text-[#b91c1c]">
              {pratinjau.errors.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          ) : null}
          {pratinjau.valid.length > 0 ? (
            <ul className="mt-1 max-h-28 overflow-y-auto text-secondary-text">
              {pratinjau.valid.slice(0, 5).map((v) => (
                <li key={`${v.institutionCode}-${v.reporterName}-${v.scorePercent}`}>
                  • {v.institutionCode} · {v.reporterName} ·{" "}
                  {v.scorePercent === null ? "tanpa skor" : `${v.scorePercent}%`}
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            className="primary-button mt-3"
            disabled={pratinjau.valid.length === 0}
            onClick={() => void terapkan()}
          >
            Terapkan {pratinjau.valid.length} baris
          </button>
        </div>
      ) : null}
      {catatan ? (
        <p role="status" className="mt-2 text-xs">
          {catatan}
        </p>
      ) : null}
    </section>
  );
}
