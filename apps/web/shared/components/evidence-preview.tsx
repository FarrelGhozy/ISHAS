import { useEffect, useState } from "react";
import { getEvidenceAsset } from "~/mocks/adapters/report-evidence";

export function EvidencePreview({
  assetId,
  institutionCode,
  name,
  onAvailability,
}: {
  assetId?: string;
  institutionCode: string;
  name?: string;
  onAvailability?: (ready: boolean) => void;
}) {
  const [image, setImage] = useState<{
    id: string;
    url?: string;
    error?: string;
    loaded?: boolean;
  }>({ id: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!assetId) {
      setImage({ id: "" });
      return;
    }
    let disposed = false,
      url = "";
    setImage({ id: assetId });
    getEvidenceAsset(assetId)
      .then((asset) => {
        if (disposed) return;
        if (!asset || asset.institutionCode !== institutionCode) {
          setImage({
            id: assetId,
            error:
              "Gambar bukti tidak tersedia pada perangkat ini. Pilih ulang atau lepas lampiran sebelum mengirim.",
          });
          return;
        }
        url = URL.createObjectURL(asset.blob);
        setImage({ id: assetId, url });
      })
      .catch(() => {
        if (!disposed)
          setImage({
            id: assetId,
            error: "Gambar bukti gagal dimuat. Periksa penyimpanan browser atau coba lagi.",
          });
      });
    return () => {
      disposed = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [assetId, institutionCode, attempt]);
  const current = image.id === assetId ? image : undefined;
  const ready = !assetId || Boolean(current?.loaded && !current.error);
  useEffect(() => {
    onAvailability?.(ready);
  }, [ready, onAvailability]);
  if (!assetId)
    return name ? (
      <p className="mt-2 break-words text-sm text-secondary-text">
        Bukti lama: {name} (hanya nama file, gambar belum diunggah).
      </p>
    ) : null;
  if (current?.error)
    return (
      <div
        role="alert"
        className="mt-3 rounded-lg border border-marun-border bg-marun-bg p-3 text-sm text-primary"
      >
        <p>{current.error}</p>
        <button
          type="button"
          className="secondary-button mt-2"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Coba muat bukti lagi
        </button>
      </div>
    );
  return (
    <figure className="mt-3 space-y-2 rounded-lg border border-line p-3">
      {current?.url ? (
        <>
          <img
            src={current.url}
            alt={`Bukti pelaporan: ${name ?? "gambar"}`}
            className="max-h-80 w-full rounded object-contain"
            onLoad={() => setImage((value) => ({ ...value, loaded: true }))}
            onError={() =>
              setImage((value) => ({
                ...value,
                error: "File bukti tidak dapat ditampilkan. Pilih gambar yang valid kembali.",
              }))
            }
          />
          <a
            className="text-button inline-block min-h-11 py-2 text-sm"
            href={current.url}
            target="_blank"
            rel="noreferrer"
          >
            Buka gambar penuh
          </a>
        </>
      ) : (
        <p role="status" className="text-sm text-secondary-text">
          Memuat gambar bukti…
        </p>
      )}
      <figcaption className="break-words text-sm text-secondary-text">
        {name} · Bukti privat
      </figcaption>
    </figure>
  );
}
