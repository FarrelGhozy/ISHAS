// Selector khusus form lapor-cepat (V2-03): area milik satu pesantren + label tampilan
// "Gedung · Lantai · Area" (FLOWS §2). Label dihitung di sini agar komponen halaman
// tidak mendefinisikan ulang data domain (AGENTS §5).

import type { IshasState } from "../types";
import { selectRegisteredInstitutions } from "./selectors";

export { selectRegisteredInstitutions };

export type AreaOption = { id: string; label: string };

export function selectAreasByInstitution(
  state: Pick<IshasState, "areas" | "buildings">,
  institutionCode: string | null,
): AreaOption[] {
  if (!institutionCode) return [];
  const buildingName = new Map(state.buildings.map((b) => [b.id, b.name]));
  return state.areas
    .filter((a) => a.institutionCode === institutionCode)
    .map((a) => ({
      id: a.id,
      label: `${buildingName.get(a.buildingId) ?? "Gedung"} · ${a.floor} · ${a.name}`,
    }));
}
