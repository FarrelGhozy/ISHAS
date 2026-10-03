// Identitas draft penilaian mandiri per perangkat (D-24.b).
// Di mode backend draft disimpan di server dengan id ini, jadi id harus unik
// per perangkat untuk satu pesantren agar dua penilai tidak saling menimpa.
// Id acak disimpan di localStorage; panjang ≤ varchar(24).

const STORE_KEY = "ishas-penilaian-draft-id";

type PetaDraft = Record<string, string>;

function bacaPeta(): PetaDraft {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === "object" ? (parsed as PetaDraft) : {};
  } catch {
    return {};
  }
}

function tulisPeta(peta: PetaDraft): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(peta));
  } catch {
    // penyimpanan tak tersedia — abaikan, id tetap unik selama sesi
  }
}

function akhiranAcak(): string {
  try {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  } catch {
    return Math.random().toString(36).slice(2, 14).padEnd(12, "0");
  }
}

// Id draft stabil per (perangkat, pesantren) selama penyimpanan tersedia.
export function deviceDraftId(institutionCode: string): string {
  if (!institutionCode || typeof localStorage === "undefined") return "SELF-baru";
  const peta = bacaPeta();
  const tersimpan = peta[institutionCode];
  if (tersimpan) return tersimpan;
  const id = `SELF-${akhiranAcak()}`;
  peta[institutionCode] = id;
  tulisPeta(peta);
  return id;
}

export function lupakanDeviceDraft(institutionCode: string): void {
  if (!institutionCode) return;
  const peta = bacaPeta();
  if (!peta[institutionCode]) return;
  delete peta[institutionCode];
  tulisPeta(peta);
}
