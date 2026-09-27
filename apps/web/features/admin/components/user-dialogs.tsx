// Dialog kelola akun Super Admin: buat (popup), ubah, dan reset kata sandi.
// Kata sandi hanya simulasi kelengkapan form — prototipe tidak menyimpan
// kata sandi di browser (login demo memakai kartu akun).

import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "~/shared/components/modal";
import type { Institution, RoleId, User } from "~/mocks/types";

export const SANDI_MIN = 8;

export function validasiSandi(sandi: string, konfirmasi: string): string | null {
  if (sandi.length < SANDI_MIN) return `Kata sandi minimal ${SANDI_MIN} karakter.`;
  if (sandi !== konfirmasi) return "Konfirmasi kata sandi tidak cocok.";
  return null;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-bold text-heading">
      {label}
      <span className="mt-1 block font-normal">{children}</span>
    </label>
  );
}

const inputCls = "min-h-11 w-full rounded border border-line-soft px-3";

function CatatanSandi() {
  return (
    <p className="text-xs text-secondary-text">
      Prototipe: kata sandi tidak disimpan di browser — login demo memakai kartu akun.
      Kolom ini simulasi kelengkapan administrasi.
    </p>
  );
}

export type NilaiAkunBaru = {
  name: string;
  email: string;
  roleId: RoleId;
  institutionCode: string;
};

export function DialogBuatAkun({
  open,
  pesantrenAktif,
  onClose,
  onCreate,
}: {
  open: boolean;
  pesantrenAktif: Institution[];
  onClose: () => void;
  onCreate: (nilai: NilaiAkunBaru) => { ok: boolean; error?: string };
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [tampil, setTampil] = useState(false);
  const [roleId, setRoleId] = useState<RoleId>("pesantren");
  const [institutionCode, setInstitutionCode] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setSandi("");
    setKonfirmasi("");
    setTampil(false);
    setRoleId("pesantren");
    setInstitutionCode("");
    setGalat(null);
  }, [open]);
  const simpan = () => {
    if (name.trim().length < 2) {
      setGalat("Nama pengguna minimal 2 karakter.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat("Format email tidak valid.");
      return;
    }
    const salahSandi = validasiSandi(sandi, konfirmasi);
    if (salahSandi) {
      setGalat(salahSandi);
      return;
    }
    if (roleId === "pesantren" && !institutionCode) {
      setGalat("Pesantren wajib memilih satu pesantren aktif.");
      return;
    }
    const hasil = onCreate({ name, email, roleId, institutionCode });
    if (hasil.ok) onClose();
    else setGalat(hasil.error ?? "Gagal membuat akun.");
  };
  return (
    <Modal open={open} onClose={onClose} label="Buat akun baru">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-extrabold text-heading">Buat akun</h2>
        <p className="text-xs text-secondary-text">
          Akun dibuat sebagai Menunggu, lalu diaktifkan lewat daftar.
        </p>
        <Field label="Nama*">
          <input
            className={inputCls}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email*">
          <input
            type="email"
            className={inputCls}
            value={email}
            maxLength={100}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Kata sandi* (tidak disimpan di prototipe)">
          <input
            type={tampil ? "text" : "password"}
            className={inputCls}
            value={sandi}
            autoComplete="new-password"
            onChange={(e) => setSandi(e.target.value)}
          />
        </Field>
        <Field label="Konfirmasi kata sandi*">
          <input
            type={tampil ? "text" : "password"}
            className={inputCls}
            value={konfirmasi}
            autoComplete="new-password"
            onChange={(e) => setKonfirmasi(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-xs text-secondary-text">
          <input
            type="checkbox"
            checked={tampil}
            onChange={(e) => setTampil(e.target.checked)}
          />
          Tampilkan sandi
        </label>
        <Field label="Peran*">
          <select
            className={inputCls}
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value as RoleId);
              setInstitutionCode("");
            }}
          >
            <option value="pesantren">Pesantren</option>
            <option value="validator">Validator</option>
            <option value="admin">Super Admin</option>
          </select>
        </Field>
        <Field label="Pesantren aktif* (wajib untuk peran Pesantren)">
          <select
            className={inputCls}
            value={institutionCode}
            disabled={roleId !== "pesantren"}
            onChange={(e) => setInstitutionCode(e.target.value)}
          >
            <option value="">
              {roleId === "pesantren" ? "Pilih pesantren" : "Tanpa scope lembaga"}
            </option>
            {pesantrenAktif.map((x) => (
              <option key={x.code} value={x.code}>
                {x.code} · {x.name}
              </option>
            ))}
          </select>
        </Field>
        <CatatanSandi />
        {galat && (
          <p role="alert" className="text-sm text-[#b91c1c]">
            {galat}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="primary-button" onClick={simpan}>
            Buat akun
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function DialogUbahAkun({
  open,
  user,
  pesantrenAktif,
  onClose,
  onSave,
}: {
  open: boolean;
  user: User | null;
  pesantrenAktif: Institution[];
  onClose: () => void;
  onSave: (id: string, nilai: { name: string; email: string; institutionCode: string }) => {
    ok: boolean;
    error?: string;
  };
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !user) return;
    setName(user.name);
    setEmail(user.email);
    setInstitutionCode(user.institutionCodes[0] ?? "");
    setGalat(null);
  }, [open, user]);
  if (!user) return null;
  const simpan = () => {
    if (name.trim().length < 2) {
      setGalat("Nama pengguna minimal 2 karakter.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat("Format email tidak valid.");
      return;
    }
    if (user.roleId === "pesantren" && !institutionCode) {
      setGalat("Pesantren wajib terhubung ke satu pesantren aktif.");
      return;
    }
    const hasil = onSave(user.id, { name, email, institutionCode });
    if (hasil.ok) onClose();
    else setGalat(hasil.error ?? "Gagal menyimpan.");
  };
  return (
    <Modal open={open} onClose={onClose} label={`Ubah akun ${user.name}`}>
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-extrabold text-heading">Ubah akun</h2>
        <p className="text-xs text-secondary-text">
          {user.role} · peran tidak dapat diganti (ganti peran = buat akun baru).
        </p>
        <Field label="Nama*">
          <input
            className={inputCls}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email*">
          <input
            type="email"
            className={inputCls}
            value={email}
            maxLength={100}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {user.roleId === "pesantren" && (
          <Field label="Pesantren aktif*">
            <select
              className={inputCls}
              value={institutionCode}
              onChange={(e) => setInstitutionCode(e.target.value)}
            >
              <option value="">Pilih pesantren</option>
              {pesantrenAktif.map((x) => (
                <option key={x.code} value={x.code}>
                  {x.code} · {x.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {galat && (
          <p role="alert" className="text-sm text-[#b91c1c]">
            {galat}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="primary-button" onClick={simpan}>
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function DialogResetSandi({
  open,
  user,
  onClose,
  onReset,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onReset: (id: string, sandiBaru: string) => { ok: boolean; error?: string };
}) {
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setSandi("");
    setKonfirmasi("");
    setGalat(null);
  }, [open]);
  if (!user) return null;
  const simpan = () => {
    const salah = validasiSandi(sandi, konfirmasi);
    if (salah) {
      setGalat(salah);
      return;
    }
    const hasil = onReset(user.id, sandi);
    if (hasil.ok) onClose();
    else setGalat(hasil.error ?? "Gagal mereset sandi.");
  };
  return (
    <Modal open={open} onClose={onClose} label={`Reset kata sandi ${user.name}`}>
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-extrabold text-heading">Reset kata sandi</h2>
        <p className="text-xs text-secondary-text">
          {user.name} · {user.email} — reset tercatat di audit log.
        </p>
        <Field label="Kata sandi baru*">
          <input
            type="password"
            className={inputCls}
            value={sandi}
            autoComplete="new-password"
            onChange={(e) => setSandi(e.target.value)}
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
        <CatatanSandi />
        {galat && (
          <p role="alert" className="text-sm text-[#b91c1c]">
            {galat}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="primary-button" onClick={simpan}>
            Reset sandi
          </button>
        </div>
      </div>
    </Modal>
  );
}
