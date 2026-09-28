// `/admin/pengaturan` — reset data demo + migrasi aset IndexedDB → server.
// Sesi login dan draft perangkat tidak ikut terhapus (penyimpanan terpisah).

import { useEffect, useState } from "react";
import { DatabaseZap, RotateCcw } from "lucide-react";
import { clearCampusAssets } from "~/mocks/adapters/campus-assets";
import { exportDeviceAssets } from "~/mocks/adapters/device-assets";
import { clearInstrumentDocAssets } from "~/mocks/adapters/instrument-docs";
import { clearEvidenceAssets } from "~/mocks/adapters/report-evidence";
import { repository } from "~/shared/api/repository";
import { useAdminState } from "~/shared/api/admin-state";
import { USE_BACKEND } from "~/shared/api/http-client";

export function AdminPengaturanPage() {
  const state = useAdminState();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateNote, setMigrateNote] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_BACKEND) return;
    let active = true;
    void repository.migrationStatus().then((status) => {
      if (active) setMigrated(status.migrated);
    });
    return () => {
      active = false;
    };
  }, []);

  const migrasikan = async () => {
    setError(null);
    setMigrateNote(null);
    setMigrating(true);
    try {
      const items = await exportDeviceAssets(state);
      if (items.length === 0) {
        setMigrateNote("Tidak ada aset perangkat untuk dimigrasikan.");
        setMigrating(false);
        return;
      }
      const result = await repository.migrateDeviceAssets(items);
      if (!result.ok) {
        setError(result.error);
        setMigrating(false);
        return;
      }
      await Promise.allSettled([
        clearCampusAssets(),
        clearEvidenceAssets(),
        clearInstrumentDocAssets(),
      ]);
      setMigrated(true);
      setMigrateNote(`${result.imported} aset perangkat berhasil dipindahkan ke server.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migrasi aset gagal. Coba lagi.");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <header>
        <p className="kicker">Pengaturan</p>
        <h1 className="text-lg font-extrabold text-heading">Pengaturan sistem (demo)</h1>
        <p className="mt-1 text-xs text-secondary-text">
          Preferensi non-ilmiah prototipe + tindakan berisiko. Pengaturan ilmiah
          (bobot, ambang, rumus) milik Validator dan menunggu keputusan ilmiah final.
        </p>
      </header>
      {error ? (
        <p role="alert" className="text-sm text-[#b91c1c]">
          {error}
        </p>
      ) : null}
      {USE_BACKEND ? (
        <div className="surface flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-heading">Migrasi aset perangkat</p>
            <p className="text-[10px] text-secondary-text">
              Memindahkan denah, dokumen PDF, dan gambar bukti yang masih tersimpan di
              IndexedDB perangkat ini ke storage server, lalu membersihkan salinan lokal.
              Hanya dapat dijalankan sekali.
            </p>
            {migrateNote ? (
              <p className="mt-1 text-[10px] font-bold status status-green inline-flex">
                {migrateNote}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="secondary-button"
            disabled={migrating || migrated !== false}
            onClick={() => void migrasikan()}
          >
            <DatabaseZap size={13} aria-hidden />
            {migrated ? "Sudah dimigrasikan" : migrating ? "Memindahkan…" : "Migrasi aset"}
          </button>
        </div>
      ) : null}
      <div className="surface flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-heading">Reset data demo</p>
          <p className="text-[10px] text-secondary-text">
            Mengembalikan data domain, aset denah, dokumen indikator, dan gambar bukti pada
            perangkat ini ke seed demo. Sesi login (sessionStorage) dan draft laporan
            (localStorage) tetap tersimpan terpisah. Riwayat demo sebelumnya hilang; audit
            kembali mengikuti seed.
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
              disabled={resetting}
              onClick={async () => {
                setResetting(true);
                try {
                  await repository.reset();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Reset gagal. Coba lagi.");
                  setDone(false);
                  setResetting(false);
                  return;
                }
                setError(null);
                setConfirming(false);
                setDone(true);
                setResetting(false);
              }}
            >
              {resetting ? "Mereset…" : "Ya, reset"}
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
