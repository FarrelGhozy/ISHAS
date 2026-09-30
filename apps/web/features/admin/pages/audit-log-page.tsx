import { useMemo, useState } from "react";
import { useAdminState } from "~/shared/api/admin-state";
import { EmptyState } from "~/shared/components/empty-state";

// Audit log global — baca Super Admin. Jejak kronologis terbaru dulu.
export function Page() {
  const state = useAdminState();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Semua");
  const [actor, setActor] = useState("Semua");
  const types = useMemo(
    () => [...new Set(state.auditEvents.map((x) => x.objectType))],
    [state.auditEvents],
  );
  const actors = useMemo(
    () => [...new Set(state.auditEvents.map((x) => x.actorName))],
    [state.auditEvents],
  );
  const events = useMemo(
    () =>
      state.auditEvents.filter(
        (x) =>
          (type === "Semua" || x.objectType === type) &&
          (actor === "Semua" || x.actorName === actor) &&
          `${x.action} ${x.actorName} ${x.objectId} ${x.institutionCode ?? ""} ${x.note ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [state.auditEvents, query, type, actor],
  );
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Administrasi</p>
        <h1 className="text-2xl font-extrabold text-heading">Audit log</h1>
        <p className="text-sm text-secondary-text">
          Jejak perubahan data sistem yang tersimpan secara kronologis. Reset demo mengembalikan
          audit ke seed.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Cari audit"
          className="min-h-11 min-w-60 flex-1 rounded border border-line-soft bg-white px-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari aksi, pelaku, objek, pesantren, atau catatan…"
        />
        <select
          aria-label="Filter objek audit"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>Semua</option>
          {types.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter pelaku audit"
          className="min-h-11 rounded border border-line-soft bg-white px-3"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
        >
          <option>Semua</option>
          {actors.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-secondary-text" role="status">
        {events.length} dari {state.auditEvents.length} peristiwa.
      </p>
      {events.length ? (
        <div className="surface divide-y divide-line">
          {events.map((x) => (
            <article key={x.id} className="p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <strong className="mr-auto text-heading">{x.action}</strong>
                <span className="status status-neutral">{x.objectType}</span>
              </div>
              <p className="text-secondary-text">
                {x.actorName} · {x.objectId}
                {x.institutionCode ? ` · ${x.institutionCode}` : ""} ·{" "}
                {new Date(x.at).toLocaleString("id-ID")}
              </p>
              {x.note && <p className="mt-1 text-xs">{x.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aktivitas tidak ditemukan"
          description="Ubah pencarian atau filter objek/pelaku."
        />
      )}
    </section>
  );
}
