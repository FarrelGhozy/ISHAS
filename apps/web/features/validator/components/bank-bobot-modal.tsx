// Modal Atur Bobot (D-24): bobot 0–100 + flag temuan per opsi + pengali indikator.

import { useState } from "react";
import { storeActions } from "~/mocks/store/mock-store";
import type { InstrumentIndicator, InstrumentOption } from "~/mocks/types";

type Baris = { value: string; label: string; weight: string; isFinding: boolean };

export function BankBobotModal({
  indicator,
  onClose,
}: {
  indicator: InstrumentIndicator;
  onClose: (note: string) => void;
}) {
  const [baris, setBaris] = useState<Baris[]>(() =>
    indicator.options.map((o) => ({
      value: o.value,
      label: o.label,
      weight: String(o.weight),
      isFinding: o.isFinding,
    })),
  );
  const [pengali, setPengali] = useState(String(indicator.weight ?? 1));
  const [error, setError] = useState("");

  const patch = (index: number, next: Partial<Baris>) =>
    setBaris((old) => old.map((row, i) => (i === index ? { ...row, ...next } : row)));

  const simpan = () => {
    const options: InstrumentOption[] = baris.map((row) => ({
      value: row.value.trim(),
      label: row.label.trim(),
      weight: Number(row.weight),
      isFinding: row.isFinding,
    }));
    const r = storeActions.setBankIndicatorOptions(
      indicator.id,
      options,
      pengali.trim() ? Number(pengali) : undefined,
    );
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onClose(`Bobot ${indicator.code} disimpan. Skor lama tetap beku.`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5">
        <h2 className="font-extrabold text-heading">
          Atur bobot · {indicator.code}
        </h2>
        <p className="mt-1 text-sm text-secondary-text">
          Bobot 0–100 per opsi + pengali indikator. Berlaku untuk pengisian baru;
          laporan terkirim tidak berubah.
        </p>
        <div className="mt-4 space-y-2">
          {baris.map((row, i) => (
            <div className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-12" key={row.value}>
              <label className="text-xs font-bold sm:col-span-4">
                Nilai
                <input
                  className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                  value={row.value}
                  onChange={(e) => patch(i, { value: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold sm:col-span-4">
                Label
                <input
                  className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                  value={row.label}
                  onChange={(e) => patch(i, { label: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                Bobot
                <input
                  className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                  inputMode="numeric"
                  value={row.weight}
                  onChange={(e) => patch(i, { weight: e.target.value })}
                />
              </label>
              <label className="flex items-end gap-1 pb-2 text-xs sm:col-span-2">
                <input
                  type="checkbox"
                  checked={row.isFinding}
                  onChange={(e) => patch(i, { isFinding: e.target.checked })}
                />
                Temuan
              </label>
            </div>
          ))}
        </div>
        <label className="mt-3 block max-w-48 text-xs font-bold">
          Pengali indikator (0–10)
          <input
            className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
            inputMode="decimal"
            value={pengali}
            onChange={(e) => setPengali(e.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-sm font-semibold text-[#b91c1c]">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="primary-button" onClick={simpan}>
            Simpan bobot
          </button>
          <button type="button" className="secondary-button" onClick={() => onClose("")}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
