import { useSearchParams } from "react-router";
import type { Institution } from "~/mocks/types";

export function PublicFilter({ institutions }: { institutions: Institution[] }) {
  const [params, setParams] = useSearchParams();
  return (
    <label className="surface flex min-w-0 flex-col gap-1 p-3 text-sm font-bold text-heading sm:flex-row sm:items-center sm:gap-3">
      Pesantren
      <select
        className="min-h-11 min-w-0 flex-1 rounded-[7px] border border-line-soft bg-white px-3 text-sm font-semibold"
        value={params.get("pesantren") ?? ""}
        onChange={(event) => {
          const next = new URLSearchParams(params);
          if (event.target.value) next.set("pesantren", event.target.value);
          else next.delete("pesantren");
          setParams(next);
        }}
      >
        <option value="">Semua pesantren terdaftar</option>
        {institutions.map((institution) => (
          <option key={institution.code} value={institution.code}>
            {institution.code} — {institution.name}
          </option>
        ))}
      </select>
    </label>
  );
}
