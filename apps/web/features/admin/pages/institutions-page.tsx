import { useMemo, useState } from "react";
import { repository } from "~/shared/api/repository";
import { useAdminState } from "~/shared/api/admin-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

// Halaman kelola pesantren — FLOWS §1: tambah Persiapan (nama + kota +
// alamat + penanggung jawab) → verifikasi Aktif → buat akun Pesantren di
// halaman Pengguna → baru terdaftar di pemilih publik.
export function Page() {
  const state = useAdminState();
  const user = useCurrentUser();
  const actor = { id: user?.id, name: user?.name ?? "Super Admin" };
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [manager, setManager] = useState("");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const activeAccountsByCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const user of state.users) {
      if (user.roleId !== "pesantren" || user.status !== "Aktif") continue;
      for (const code of user.institutionCodes) {
        map.set(code, (map.get(code) ?? 0) + 1);
      }
    }
    return map;
  }, [state.users]);
  const registeredCodes = useMemo(
    () =>
      new Set(
        state.institutions
          .filter((x) => x.status === "Aktif" && (activeAccountsByCode.get(x.code) ?? 0) > 0)
          .map((x) => x.code),
      ),
    [state.institutions, activeAccountsByCode],
  );
  const rows = useMemo(
    () =>
      state.institutions.filter((x) =>
        `${x.code} ${x.name} ${x.location} ${x.manager} ${x.address ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [state.institutions, query],
  );
  const add = async () => {
    const r = await repository.addInstitution(actor, { name, location, address, manager });
    setNote(
      r.ok
        ? `${r.id} ditambahkan sebagai Persiapan. Verifikasi menjadi Aktif, lalu buat akun Pesantren agar terdaftar di pemilih publik.`
        : (r.error ?? "Gagal menambah pesantren."),
    );
    if (r.ok) {
      setName("");
      setLocation("");
      setAddress("");
      setManager("");
    }
  };
  const update = async (code: string, status: "Persiapan" | "Aktif" | "Nonaktif") => {
    const target = state.institutions.find((x) => x.code === code);
    if (!target || target.status === status) return;
    const effect =
      status === "Aktif"
        ? "Pesantren menjadi Aktif. Ia baru muncul di pemilih publik setelah punya akun Pesantren aktif (lihat halaman Pengguna)."
        : "Pesantren hilang dari pemilih publik dan menolak laporan baru. Laporan Diterima lama tidak tampil publik (D-08).";
    if (!window.confirm(`${code}: ubah ${target.status} → ${status}?\n\n${effect}`)) return;
    const r = await repository.setInstitutionStatus(actor, code, status);
    setNote(r.ok ? `Status ${code} diperbarui menjadi ${status}.` : (r.error ?? "Gagal."));
  };
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Administrasi</p>
        <h1 className="text-2xl font-extrabold text-heading">Pesantren</h1>
        <p className="text-sm text-secondary-text">
          Tambah sebagai Persiapan, verifikasi menjadi Aktif, lalu buat akun Pesantren agar
          terdaftar di pemilih publik.
        </p>
      </header>
      <div className="surface grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-xs font-bold">
          Nama resmi pesantren*
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={name}
            maxLength={120}
            placeholder="Contoh: PP Al-Hikmah Malang"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          Kabupaten/kota*
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={location}
            placeholder="Contoh: Kota Malang"
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          Alamat lengkap* (internal, tidak tampil publik)
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={address}
            placeholder="Contoh: Jl. Pesantren No. 10, Kota Malang"
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          Penanggung jawab utama*
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={manager}
            placeholder="Contoh: Ust. Ahmad Hidayat"
            onChange={(e) => setManager(e.target.value)}
          />
        </label>
        <p className="text-xs text-secondary-text sm:col-span-2">
          Wajib: nama min 3 maks 120 unik, kota min 3, alamat min 10, penanggung jawab min 2.
        </p>
        <div className="sm:col-span-2">
          <button type="button" className="primary-button" onClick={() => void add()}>
            Tambah pesantren
          </button>
        </div>
      </div>
      {note && (
        <p role="status" className="text-sm">
          {note}
        </p>
      )}
      <input
        aria-label="Cari pesantren"
        className="min-h-11 rounded border border-line-soft bg-white px-3"
        placeholder="Cari kode, nama, lokasi, alamat, atau penanggung jawab…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {rows.length ? (
        <div className="surface divide-y divide-line">
          {rows.map((x) => {
            const activeCount = activeAccountsByCode.get(x.code) ?? 0;
            const registered = registeredCodes.has(x.code);
            const isOpen = expanded === x.code;
            return (
              <article className="p-4 text-sm" key={x.code}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="mr-auto">
                    <strong className="text-heading">
                      {x.code} · {x.name}
                    </strong>
                    <p className="text-xs text-secondary-text">
                      {x.location} · {x.manager}
                    </p>
                    <p className="mt-1 text-xs">
                      {registered ? (
                        <span className="status status-green inline-flex">
                          Terdaftar di pemilih publik
                        </span>
                      ) : (
                        <span className="status status-neutral inline-flex">
                          {x.status === "Aktif"
                            ? "Aktif — belum terdaftar (butuh akun Pesantren aktif)"
                            : `${x.status} — tidak tampil di pemilih publik`}
                        </span>
                      )}
                    </p>
                  </div>
                  <StatusChip value={x.status} />
                  <select
                    aria-label={`Status ${x.name}`}
                    className="min-h-11 rounded border border-line-soft px-2"
                    value={x.status}
                    onChange={(e) => void update(x.code, e.target.value as typeof x.status)}
                  >
                    <option>Persiapan</option>
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : x.code)}
                  >
                    {isOpen ? "Tutup detail" : "Detail"}
                  </button>
                </div>
                {isOpen && (
                  <dl className="mt-3 grid gap-2 rounded border border-line-soft p-3 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-bold text-secondary-text">Alamat lengkap (internal)</dt>
                      <dd className="mt-0.5 text-heading">{x.address ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-secondary-text">Akun Pesantren aktif</dt>
                      <dd className="mt-0.5 text-heading">
                        {activeCount} akun
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-secondary-text">Tahap awal</dt>
                      <dd className="mt-0.5 text-heading">{x.assessment}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-secondary-text">Langkah berikut</dt>
                      <dd className="mt-0.5 text-heading">
                        {x.status === "Persiapan"
                          ? "Verifikasi menjadi Aktif."
                          : activeCount === 0
                            ? "Buat akun Pesantren di halaman Pengguna agar terdaftar."
                            : "Sudah terdaftar di pemilih publik."}
                      </dd>
                    </div>
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Pesantren tidak ditemukan" />
      )}
    </section>
  );
}
