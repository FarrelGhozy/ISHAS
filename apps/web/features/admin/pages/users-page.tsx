// Halaman kelola akun — FLOWS §1 + D-09: buat lewat popup sebagai Menunggu,
// ubah data, reset sandi (demo), nonaktif/hapus dengan konfirmasi efek.
// Akun sendiri yang sedang login dan admin terakhir diproteksi.

import { useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import type { User } from "~/mocks/types";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { DialogBuatAkun, DialogResetSandi, DialogUbahAkun } from "../components/user-dialogs";

type DialogState =
  | { kind: "buat" }
  | { kind: "ubah"; user: User }
  | { kind: "reset"; user: User }
  | null;

export function Page() {
  const state = useMockState();
  const saya = useCurrentUser();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua");
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const users = useMemo(
    () =>
      state.users.filter(
        (x) =>
          (status === "Semua" || x.status === status) &&
          `${x.name} ${x.email} ${x.role} ${x.institution}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [state.users, status, query],
  );
  const pesantrenAktif = useMemo(
    () => state.institutions.filter((x) => x.status === "Aktif"),
    [state.institutions],
  );
  const akunAktifPerPesantren = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of state.users) {
      if (u.roleId !== "pesantren" || u.status !== "Aktif") continue;
      for (const code of u.institutionCodes) map.set(code, (map.get(code) ?? 0) + 1);
    }
    return map;
  }, [state.users]);
  const buat = (nilai: { name: string; email: string; roleId: User["roleId"]; institutionCode: string }) => {
    const n = Math.max(0, ...state.users.map((x) => Number(x.id.replace(/\D/g, "")))) + 1;
    const lembaga = state.institutions.find((x) => x.code === nilai.institutionCode);
    const label = nilai.roleId === "admin" ? "Super Admin" : nilai.roleId === "validator" ? "Validator" : "Pesantren";
    const r = storeActions.addUser({
      id: `USR-${String(n).padStart(3, "0")}`,
      name: nilai.name,
      email: nilai.email,
      initials: nilai.name
        .split(" ")
        .filter(Boolean)
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      role: label as User["role"],
      roleId: nilai.roleId,
      institution: nilai.roleId === "pesantren" ? (lembaga?.name ?? "") : "Seluruh sistem",
      institutionCodes: nilai.roleId === "pesantren" ? (nilai.institutionCode ? [nilai.institutionCode] : []) : [],
      status: "Menunggu",
      lastActive: new Date().toISOString(),
    });
    setNote(
      r.ok
        ? `Akun ${label} dibuat sebagai Menunggu. Aktifkan lewat dropdown status agar bisa dipakai.`
        : (r.error ?? "Gagal membuat akun."),
    );
    return r.ok ? { ok: true } : { ok: false, error: r.error };
  };
  const gantiStatus = (target: User, value: User["status"]) => {
    if (target.status === value) return;
    if (saya && target.id === saya.id) {
      setNote("Kamu tidak dapat mengubah status akun sendiri yang sedang login.");
      return;
    }
    if (
      target.roleId === "pesantren" &&
      value === "Nonaktif" &&
      !window.confirm(
        `${target.name} dinonaktifkan?\n\nBila ini akun Pesantren aktif terakhir di pesantrennya, pesantren hilang dari pemilih publik (D-08).`,
      )
    ) {
      return;
    }
    const r = storeActions.setUserStatus(target.id, value);
    setNote(r.ok ? `Status ${target.name} diperbarui menjadi ${value}.` : (r.error ?? "Gagal."));
  };
  const hapus = (target: User) => {
    if (saya && target.id === saya.id) {
      setNote("Tidak dapat menghapus akun sendiri yang sedang login.");
      return;
    }
    const code = target.institutionCodes[0];
    const terakhir =
      target.roleId === "pesantren" && code && (akunAktifPerPesantren.get(code) ?? 0) <= 1 && target.status === "Aktif";
    if (
      !window.confirm(
        `Hapus akun ${target.name} (${target.email})?\n\nRiwayat validasi yang sudah tercatat tidak ikut berubah (nama tersimpan sebagai snapshot).` +
          (terakhir ? `\n\nIni akun Pesantren aktif terakhir di ${code}: pesantren hilang dari pemilih publik.` : ""),
      )
    ) {
      return;
    }
    const r = storeActions.deleteUser(target.id);
    setNote(r.ok ? `Akun ${target.name} dihapus.` : (r.error ?? "Gagal menghapus."));
  };
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <p className="kicker">Administrasi</p>
          <h1 className="text-2xl font-extrabold text-heading">Pengguna</h1>
          <p className="text-sm text-secondary-text">
            Akun baru dibuat sebagai Menunggu lalu diaktifkan. Peran tidak dapat diganti —
            ganti peran berarti buat akun baru.
          </p>
        </div>
        <button
          type="button"
          className="primary-button w-full sm:w-auto"
          onClick={() => setDialog({ kind: "buat" })}
        >
          <Plus size={16} aria-hidden />
          Buat akun
        </button>
      </header>
      {note && (
        <p
          role={note.includes("dibuat") || note.includes("diperbarui") || note.includes("dihapus") || note.includes("disimpan") || note.includes("kembali") ? "status" : "alert"}
          className="text-sm"
        >
          {note}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-3" size={18} />
          <input
            aria-label="Cari pengguna"
            className="min-h-11 w-full rounded border border-line-soft pl-10 pr-3"
            placeholder="Cari nama, email, peran…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter status pengguna"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Semua</option>
          <option>Aktif</option>
          <option>Menunggu</option>
          <option>Nonaktif</option>
        </select>
      </div>
      {users.length ? (
        <div className="surface divide-y divide-line">
          {users.map((x) => {
            const milikSendiri = saya?.id === x.id;
            return (
              <article key={x.id} className="flex flex-col gap-3 p-4 text-sm sm:flex-row sm:flex-wrap sm:items-center">
                <div className="sm:mr-auto sm:min-w-48">
                  <strong className="text-heading">{x.name}</strong>
                  <p className="text-xs text-secondary-text">
                    {x.email} · {x.role}
                  </p>
                  <p className="text-xs text-faint">{x.institution}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip value={x.status} />
                  <select
                    aria-label={`Status ${x.name}`}
                    title={milikSendiri ? "Status akun sendiri tidak dapat diubah" : undefined}
                    className="min-h-11 flex-1 rounded border border-line-soft px-2 disabled:opacity-50 sm:flex-none"
                    value={x.status}
                    disabled={milikSendiri}
                    onChange={(e) => gantiStatus(x, e.target.value as User["status"])}
                  >
                    <option>Aktif</option>
                    <option>Menunggu</option>
                    <option>Nonaktif</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    className="secondary-button"
                    aria-label={`Ubah akun ${x.name}`}
                    onClick={() => setDialog({ kind: "ubah", user: x })}
                  >
                    <Pencil size={14} aria-hidden />
                    Ubah
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-label={`Reset kata sandi ${x.name}`}
                    onClick={() => setDialog({ kind: "reset", user: x })}
                  >
                    <KeyRound size={14} aria-hidden />
                    Reset
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    title={milikSendiri ? "Tidak dapat menghapus akun sendiri" : "Hapus akun"}
                    aria-label={`Hapus akun ${x.name}`}
                    disabled={milikSendiri}
                    onClick={() => hapus(x)}
                  >
                    <Trash2 size={14} aria-hidden />
                    Hapus
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Pengguna tidak ditemukan"
          description="Ubah kata pencarian atau filter status."
        />
      )}
      <DialogBuatAkun
        open={dialog?.kind === "buat"}
        pesantrenAktif={pesantrenAktif}
        onClose={() => setDialog(null)}
        onCreate={buat}
      />
      <DialogUbahAkun
        open={dialog?.kind === "ubah"}
        user={dialog?.kind === "ubah" ? dialog.user : null}
        pesantrenAktif={pesantrenAktif}
        onClose={() => setDialog(null)}
        onSave={(id, nilai) => {
          const r = storeActions.updateUser(id, nilai);
          setNote(r.ok ? "Data akun disimpan." : (r.error ?? "Gagal menyimpan."));
          return r.ok ? { ok: true } : { ok: false, error: r.error };
        }}
      />
      <DialogResetSandi
        open={dialog?.kind === "reset"}
        user={dialog?.kind === "reset" ? dialog.user : null}
        onClose={() => setDialog(null)}
        onReset={(id) => {
          const r = storeActions.resetUserPassword(id);
          setNote(
            r.ok
              ? "Kata sandi dikembalikan ke kredensial demo dan tercatat di audit."
              : (r.error ?? "Gagal mereset sandi."),
          );
          return r.ok ? { ok: true } : { ok: false, error: r.error };
        }}
      />
    </section>
  );
}
