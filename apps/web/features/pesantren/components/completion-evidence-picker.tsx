// Unggah bukti penyelesaian tindak lanjut — pola sama /lapor (D-21).
// PNG/JPEG/WebP, 5 MB/20 MP, blob privat IndexedDB, pratinjau + lepas/ganti.
// Hanya Pesantren aktif pemilik scope.

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { repository } from "~/shared/api/repository";
import type { ReportActor } from "~/mocks/store/mock-store";
import { EvidencePreview } from "~/shared/components/evidence-preview";

export function CompletionEvidencePicker({
  institutionCode,
  actor,
  assetId,
  name,
  disabled,
  onChange,
  onBusy,
}: {
  institutionCode: string;
  actor: ReportActor;
  assetId?: string;
  name: string;
  disabled: boolean;
  onChange: (id?: string, name?: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const lock = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <section aria-label="Bukti penyelesaian">
      <label
        htmlFor={`bukti-selesai-${institutionCode}`}
        className="mb-1 flex items-center gap-2 text-sm font-bold text-heading"
      >
        <Upload size={18} aria-hidden />
        Bukti penyelesaian (wajib bila 100%)
      </label>
      <p className="mb-2 text-sm text-secondary-text">
        Satu PNG, JPEG atau WebP · maksimal 5 MB dan 20 megapiksel. Bukti privat,
        hanya untuk Pesantren.
      </p>
      <input
        id={`bukti-selesai-${institutionCode}`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled || busy || !institutionCode}
        className="min-h-11 w-full min-w-0 rounded-lg border border-line-soft p-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-brand-bg file:px-3 file:py-2 file:font-semibold file:text-primary disabled:opacity-60"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file || lock.current) return;
          lock.current = true;
          setBusy(true);
          onBusy(true);
          setError("");
          try {
            const result = await repository.uploadCompletionEvidence(
              actor,
              institutionCode,
              file,
            );
            if (!alive.current) return;
            if (result.ok && result.id) onChange(result.id, file.name.trim());
            else if (!result.ok) setError(result.error);
          } finally {
            lock.current = false;
            if (alive.current) {
              setBusy(false);
              onBusy(false);
            }
          }
        }}
      />
      {busy ? (
        <p role="status" className="mt-2 text-sm text-secondary-text">
          Memeriksa dan menyimpan gambar…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-primary">
          {error}
        </p>
      ) : null}
      <EvidencePreview
        assetId={assetId}
        institutionCode={institutionCode}
        name={name}
      />
      {assetId || name ? (
        <button
          type="button"
          className="secondary-button mt-3"
          disabled={disabled || busy}
          onClick={() => {
            setError("");
            onChange();
          }}
        >
          Lepas lampiran
        </button>
      ) : null}
    </section>
  );
}
