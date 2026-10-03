// Dialog ganti kata sandi akun yang sedang aktif (semua peran).
// Hanya tersedia pada mode backend (kata sandi nyata); mode mock memakai kartu demo.

import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "~/shared/components/modal";

export const SANDI_BARU_MIN = 8;

// Aturan kelengkapan form (cermin `validateNewPassword` backend: minimal 8 karakter).
export function validasiGantiSandi(
  sandiLama: string,
  sandiBaru: string,
  konfirmasi: string,
): string | null {
  if (!sandiLama) return "Kata sandi lama wajib diisi.";
  if (sandiBaru.length < SANDI_BARU_MIN) {
    return `Kata sandi baru minimal ${SANDI_BARU_MIN} karakter.`;
  }
  if (sandiBaru !== konfirmasi) return "Konfirmasi kata sandi baru tidak cocok.";
  if (sandiBaru === sandiLama) return "Kata sandi baru harus berbeda dari kata sandi lama.";
  return null;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-bold text-heading">
      {label}
      <span className="mt-1 block font-normal">{children}</span>
    </label>
  );
}

const inputCls = "min-h-11 w-full rounded border border-line-soft px-3";

export function ChangePasswordDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (sandiLama: string, sandiBaru: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);
  const [mengirim, setMengirim] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSandiLama("");
    setSandiBaru("");
    setKonfirmasi("");
    setGalat(null);
    setSukses(false);
    setMengirim(false);
  }, [open]);

  const simpan = async () => {
    const salah = validasiGantiSandi(sandiLama, sandiBaru, konfirmasi);
    if (salah) {
      setGalat(salah);
      return;
    }
    setGalat(null);
    setMengirim(true);
    const hasil = await onSubmit(sandiLama, sandiBaru);
    setMengirim(false);
    if (hasil.ok) {
      setSandiLama("");
      setSandiBaru("");
      setKonfirmasi("");
      setSukses(true);
    } else {
      setGalat(hasil.error ?? "Gagal mengubah kata sandi.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="Ganti kata sandi">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-extrabold text-heading">Ganti kata sandi</h2>
        {sukses ? (
          <>
            <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
              Kata sandi berhasil diubah. Sesi di perangkat lain telah dikeluarkan; perangkat ini
              tetap aktif.
            </p>
            <div className="flex justify-end">
              <button type="button" className="primary-button" onClick={onClose}>
                Tutup
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-secondary-text">
              Masukkan kata sandi lama, lalu kata sandi baru (minimal {SANDI_BARU_MIN} karakter).
            </p>
            <Field label="Kata sandi lama*">
              <input
                type="password"
                className={inputCls}
                value={sandiLama}
                autoComplete="current-password"
                onChange={(e) => setSandiLama(e.target.value)}
              />
            </Field>
            <Field label="Kata sandi baru*">
              <input
                type="password"
                className={inputCls}
                value={sandiBaru}
                autoComplete="new-password"
                onChange={(e) => setSandiBaru(e.target.value)}
              />
            </Field>
            <Field label="Konfirmasi kata sandi baru*">
              <input
                type="password"
                className={inputCls}
                value={konfirmasi}
                autoComplete="new-password"
                onChange={(e) => setKonfirmasi(e.target.value)}
              />
            </Field>
            {galat ? (
              <p role="alert" className="text-sm text-[#b91c1c]">
                {galat}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button type="button" className="secondary-button" onClick={onClose}>
                Batal
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={mengirim}
                onClick={() => void simpan()}
              >
                {mengirim ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
