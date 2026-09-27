// Kelola tindak lanjut Pesantren — filter + daftar kartu (D-20, D-21).
// Isi kartu tinggal di TindakLanjutCard; halaman ini mengatur filter dan
// empty state yang menjelaskan penyebab kosong.

import { useMemo, useState } from "react";
import { useMockState } from "~/mocks/store/mock-store";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import {
  selectRecommendationsForManager,
  selectReportsForManager,
} from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { TindakLanjutCard } from "../components/tindak-lanjut-card";

export function Page() {
  const state = useMockState();
  const user = useCurrentUser();
  const [status, setStatus] = useState("Semua");
  const [priority, setPriority] = useState("Semua");
  const [query, setQuery] = useState("");
  const code =
    user?.roleId === "pesantren" && user.institutionCodes.length === 1
      ? user.institutionCodes[0]
      : undefined;
  const all = useMemo(
    () => (code ? selectRecommendationsForManager(state, code) : []),
    [state, code],
  );
  const waiting = useMemo(
    () =>
      code
        ? selectReportsForManager(state, code).filter(
            (item) => item.validationStatus === "Menunggu validasi",
          ).length
        : 0,
    [state, code],
  );
  const items = useMemo(
    () =>
      all
        .filter((x) => status === "Semua" || x.status === status)
        .filter((x) => priority === "Semua" || x.priority === priority)
        .filter((x) =>
          `${x.id} ${x.title} ${x.location}`.toLowerCase().includes(query.toLowerCase()),
        ),
    [all, status, priority, query],
  );
  if (!user || !code) return <EmptyState title="Halaman ini hanya untuk Pesantren" />;
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Penanganan</p>
        <h1 className="text-2xl font-extrabold text-heading">Tindak lanjut</h1>
        <p className="mt-1 text-sm text-secondary-text">
          Rencana tindakan mengubah laporan menjadi Proses; seluruh rekomendasi terverifikasi
          menutupnya sebagai Completed. Yang dibatalkan tetap tercatat beserta alasannya.
        </p>
      </header>
      <div className="surface grid gap-3 p-3 md:grid-cols-3">
        <select
          aria-label="Filter status"
          className="min-h-11 rounded border border-line-soft px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Semua</option>
          <option>Belum ditindaklanjuti</option>
          <option>Berjalan</option>
          <option>Menunggu verifikasi</option>
          <option>Terverifikasi</option>
          <option>Dibatalkan</option>
        </select>
        <select
          aria-label="Filter prioritas"
          className="min-h-11 rounded border border-line-soft px-3"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Semua</option>
          <option>Tinggi</option>
          <option>Sedang</option>
          <option>Rendah</option>
        </select>
        <input
          aria-label="Cari rekomendasi"
          className="min-h-11 rounded border border-line-soft px-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nomor, judul, atau lokasi"
        />
      </div>
      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <TindakLanjutCard
              key={`${item.id}-${item.status}-${item.progress}-${item.updatedAt ?? ""}`}
              item={item}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada tindak lanjut yang cocok"
          description={
            all.length === 0
              ? waiting > 0
                ? `Belum ada rencana karena ${waiting} laporan masih Menunggu validasi. Terima laporan di Validasi agar muncul di sini.`
                : "Belum ada laporan Diterima pada pesantren ini, atau seluruhnya telah diarsipkan."
              : "Coba ubah filter status/prioritas atau kata kunci pencarian."
          }
        />
      )}
    </section>
  );
}
