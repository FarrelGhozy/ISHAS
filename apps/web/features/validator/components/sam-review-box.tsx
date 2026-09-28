// Review supervisor SAM-iSAFE (D-26.e).
// Pengamatan Selesai dapat ditandai Ditinjau oleh akun Validator.

import { useState } from "react";
import { storeActions } from "~/mocks/store/mock-store";
import { StatusChip } from "~/shared/components/status-chip";
import type { SamAssessment } from "~/mocks/types";

export function SamReviewBox({
  assessment,
  accountId,
  onPesan,
}: {
  assessment: SamAssessment;
  accountId?: string;
  onPesan: (value: string) => void;
}) {
  const [catatan, setCatatan] = useState("");

  if (assessment.status !== "Selesai") {
    return (
      <p className="text-sm text-secondary-text">
        Review tersedia setelah pengamatan diselesaikan.
      </p>
    );
  }

  if (assessment.reviewedBy) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip value="Ditinjau" />
          <strong className="text-sm text-heading">
            {assessment.reviewedBy}
          </strong>
          <span className="text-xs text-faint">
            {assessment.reviewedAt?.slice(0, 10)}
          </span>
        </div>
        {assessment.reviewNote ? (
          <p className="text-sm text-secondary-text">
            {assessment.reviewNote}
          </p>
        ) : null}
      </div>
    );
  }

  const tinjau = () => {
    const hasil = storeActions.reviewSamAssessment(
      { id: accountId },
      assessment.id,
      catatan,
    );
    if (!hasil.ok) {
      onPesan(hasil.error);
      return;
    }
    onPesan("Pengamatan ditandai Ditinjau.");
    setCatatan("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
        Catatan review (opsional)
        <input
          className="secondary-button"
          value={catatan}
          onChange={(event) => setCatatan(event.target.value)}
          placeholder="Contoh: Hasil diperiksa, temuan diteruskan."
        />
      </label>
      <div>
        <button
          type="button"
          className="primary-button"
          onClick={tinjau}
        >
          Tandai Ditinjau
        </button>
      </div>
    </div>
  );
}
