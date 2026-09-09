// `/admin/pengaturan` — V2-01: tombol reset data demo ke seed V2 (DATA_MODEL §4).
// Halaman preferensi non-ilmiah lengkap menyusul di V2-09.

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { storeActions } from "~/mocks/store/mock-store";

export function AdminPengaturanPage() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <header>
        <p className="kicker">Pengaturan</p>
        <h1 className="text-lg font-extrabold text-heading">Pengaturan sistem (demo)</h1>
      </header>
      {error ? <p role="alert" className="text-sm text-[#b91c1c]">{error}</p> : null}
      <div className="surface flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-heading">Reset data demo</p>
          <p className="text-[10px] text-secondary-text">
            Mengembalikan seluruh data ISHAS pada perangkat ini ke seed V2 (`ishas-mock-v4`).
            Riwayat demo sebelumnya hilang; audit kembali mengikuti seed.
          </p>
          {done ? (
            <p className="mt-1 text-[10px] font-bold status status-green inline-flex">
              Data demo dikembalikan ke seed.
            </p>
          ) : null}
        </div>
        {confirming ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                try { storeActions.resetMockData(); } catch (error) {
                  setError(error instanceof Error ? error.message : "Reset gagal. Coba lagi.");
                  setDone(false);
                  return;
                }
                setError(null);
                setConfirming(false);
                setDone(true);
              }}
            >
              Ya, reset
            </button>
            <button type="button" className="secondary-button" onClick={() => setConfirming(false)}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" className="secondary-button" onClick={() => setConfirming(true)}>
            <RotateCcw size={13} aria-hidden />
            Reset data demo
          </button>
        )}
      </div>
    </section>
  );
}
