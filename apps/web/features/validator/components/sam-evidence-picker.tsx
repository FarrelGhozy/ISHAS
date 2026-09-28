// Unggah foto bukti jawaban SAM-iSAFE (D-26.e).
// Pola sama /lapor: PNG/JPEG/WebP 5 MB/20 MP, blob privat IndexedDB.
// Hanya Validator aktif; satu foto per jawaban.

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { repository } from "~/shared/api/repository";
import { EvidencePreview } from "~/shared/components/evidence-preview";

export function SamEvidencePicker({
  institutionCode,
  actorId,
  assetId,
  name,
  disabled,
  onChange,
}: {
  institutionCode: string;
  actorId?: string;
  assetId?: string;
  name?: string;
  disabled: boolean;
  onChange: (assetId?: string, name?: string) => void;
}) {
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");
  const kunci = useRef(false);

  return (
    <div className="mt-2">
      <label
        className="flex items-center gap-2 text-xs font-bold text-secondary-text"
        htmlFor={`sam-foto-${assetId ?? "baru"}`}
      >
        <Camera
          size={14}
          aria-hidden
        />
        Foto bukti (opsional, dianjurkan bila skor 0)
      </label>
      <input
        id={`sam-foto-${assetId ?? "baru"}`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled || sibuk || !institutionCode}
        className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-line-soft p-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-brand-bg file:px-3 file:py-2 file:font-semibold file:text-primary disabled:opacity-60"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file || kunci.current) return;
          kunci.current = true;
          setSibuk(true);
          setGalat("");
          try {
            const hasil = await repository.uploadSamEvidence(
              { id: actorId, name: "Validator" },
              institutionCode,
              file,
            );
            if (hasil.ok && hasil.id) onChange(hasil.id, file.name.trim());
            else if (!hasil.ok) setGalat(hasil.error);
          } finally {
            kunci.current = false;
            setSibuk(false);
          }
        }}
      />
      {sibuk ? (
        <p
          role="status"
          className="mt-1 text-xs text-secondary-text"
        >
          Menyimpan foto…
        </p>
      ) : null}
      {galat ? (
        <p
          role="alert"
          className="mt-1 text-xs font-semibold text-red-700"
        >
          {galat}
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
          className="secondary-button mt-2"
          disabled={disabled || sibuk}
          onClick={() => {
            setGalat("");
            onChange();
          }}
        >
          Lepas foto
        </button>
      ) : null}
    </div>
  );
}
