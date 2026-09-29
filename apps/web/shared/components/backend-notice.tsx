// Banner kegagalan memuat state server saat mode backend (D-31). Tanpa ini,
// kegagalan API akan tampak seperti data kosong biasa.

import { AlertTriangle } from "lucide-react";

export function BackendNotice({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="surface mb-4 flex flex-wrap items-center gap-3 border-l-4 border-l-[#b91c1c] p-3"
    >
      <AlertTriangle size={16} className="shrink-0 text-[#b91c1c]" aria-hidden />
      <p className="min-w-0 flex-1 text-xs font-semibold text-heading">
        Gagal memuat data dari server. {error}
      </p>
      <button type="button" className="secondary-button" onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  );
}
