import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import type { ReportActor } from "~/mocks/store/mock-store";
import { EvidencePreview } from "~/shared/components/evidence-preview";

export function ReportEvidencePicker({ institutionCode, actor, assetId, name, disabled, onChange, onBusy, onAvailability }: { institutionCode: string; actor: ReportActor; assetId?: string; name: string; disabled: boolean; onChange: (id?: string, name?: string) => void; onBusy: (busy: boolean) => void; onAvailability: (ready: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const lock = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  return <section aria-label="Bukti gambar pelaporan"><label htmlFor="lapor-foto" className="mb-1 flex items-center gap-2 text-sm font-bold text-heading"><Upload size={18} aria-hidden />Gambar bukti (opsional)</label><p id="lapor-foto-hint" className="mb-2 text-sm text-secondary-text">Satu PNG, JPEG atau WebP · maksimal 5 MB dan 20 megapiksel. Bukti hanya untuk pengelola, tidak tampil publik.</p><input id="lapor-foto" type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || busy || !institutionCode} aria-describedby="lapor-foto-hint" className="min-h-11 w-full min-w-0 rounded-lg border border-line-soft p-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-marun-bg file:px-3 file:py-2 file:font-semibold file:text-primary disabled:opacity-60" onChange={async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Memungkinkan memilih ulang file yang sama.
    if (!file || lock.current) return;
    lock.current = true; setBusy(true); onBusy(true); setError("");
    try {
      const result = await mockRepository.uploadReportEvidence(actor, institutionCode, file);
      if (!alive.current) return;
      if (result.ok && result.id) onChange(result.id, file.name.trim());
      else if (!result.ok) setError(result.error);
    } finally { lock.current = false; if (alive.current) { setBusy(false); onBusy(false); } }
  }} />{!institutionCode ? <p className="mt-2 text-sm text-secondary-text">Pilih pesantren sebelum mengunggah bukti.</p> : null}{busy ? <p role="status" className="mt-2 text-sm text-secondary-text">Memeriksa dan menyimpan gambar…</p> : null}{error ? <p role="alert" className="mt-2 text-sm font-semibold text-primary">{error}</p> : null}<EvidencePreview assetId={assetId} institutionCode={institutionCode} name={name} onAvailability={onAvailability} />{assetId || name ? <button type="button" className="secondary-button mt-3" disabled={disabled || busy} onClick={() => { setError(""); onChange(); }}>Lepas lampiran</button> : null}<p className="mt-2 text-sm text-secondary-text">Prototipe lokal: gambar tersimpan di browser perangkat ini. Jangan unggah informasi pribadi yang tidak diperlukan.</p></section>;
}
