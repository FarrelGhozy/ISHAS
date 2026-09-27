// Kartu kelola satu rekomendasi — rencana/progres/bukti/verifikasi/batal (D-20, D-21).
// Panel baca relasi laporan induk dirender lewat TindakLanjutDetail.

import { useState } from "react";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import type { Recommendation } from "~/mocks/types";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { selectInstitutionByCode } from "~/mocks/store/selectors";
import { selectAreasByInstitution } from "~/mocks/store/lapor-selectors";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { Modal } from "~/shared/components/modal";
import { ProgressSlider, progressLabel, snapProgress } from "~/shared/components/progress-slider";
import { StatusChip } from "~/shared/components/status-chip";
import { CompletionEvidencePicker } from "./completion-evidence-picker";
import { TindakLanjutDetail } from "./tindak-lanjut-detail";

export function TindakLanjutCard({ item }: { item: Recommendation }) {
  const state = useMockState();
  const user = useCurrentUser()!;
  const [pic, setPic] = useState(item.owner);
  const [due, setDue] = useState(item.dueDate);
  const [progress, setProgress] = useState(() => snapProgress(item.progress));
  const [note, setNote] = useState(item.lastNote ?? "");
  const [evidenceName, setEvidenceName] = useState(item.completionEvidence ?? "");
  const [evidenceAssetId, setEvidenceAssetId] = useState(item.completionEvidenceAssetId);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const report = state.reports.find((x) => x.id === item.reportId);
  const findings = state.findings.filter((x) => x.recommendationId === item.id);
  const areas = selectAreasByInstitution(state, report?.institutionCode ?? "");
  const areaLabel =
    areas.find((x) => x.id === report?.areaId)?.label ??
    report?.manualLocation ??
    "Tidak tersedia";
  const institutionName =
    selectInstitutionByCode(state, report?.institutionCode)?.name ??
    report?.institutionCode ??
    "—";
  const plans = state.campusPlans.filter(
    (x) => x.institutionCode === report?.institutionCode,
  );
  const save = async (verify = false) => {
    setBusy(true);
    setMessage("");
    const result = await mockRepository.updateTindakLanjut(
      { id: user.id, name: user.name, role: user.role },
      item.id,
      {
        owner: pic,
        dueDate: due,
        progress,
        note,
        evidenceName: evidenceName || undefined,
        evidenceAssetId,
        verify,
      },
    );
    setBusy(false);
    setMessage(result.ok ? "Tindak lanjut tersimpan." : result.error);
  };
  const cancel = () => {
    const result = storeActions.cancelRecommendation(user, item.id, cancelReason);
    if (result.ok) {
      setCancelOpen(false);
      setCancelReason("");
      setCancelError("");
      setMessage("Perbaikan dibatalkan dan tercatat beserta alasannya.");
    } else {
      setCancelError(result.error);
    }
  };
  const locked = item.status === "Menunggu verifikasi" || item.status === "Terverifikasi";
  const terminal = item.status === "Terverifikasi" || item.status === "Dibatalkan";
  const canCancel =
    item.status === "Belum ditindaklanjuti" ||
    item.status === "Berjalan" ||
    item.status === "Menunggu verifikasi";
  return (
    <article className="surface p-4">
      <div className="flex flex-wrap gap-2">
        <StatusChip value={item.status} />
        <StatusChip value={item.priority} />
      </div>
      <h2 className="mt-2 font-bold text-heading">{item.title}</h2>
      <p className="mt-1 text-sm text-secondary-text">
        {item.location} · {item.action}
      </p>
      <div className="mt-3">
        <TindakLanjutDetail
          item={item}
          report={report}
          findings={findings}
          institutionName={institutionName}
          areaLabel={areaLabel}
          plans={plans}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-bold">
          PIC
          <input
            className="mt-1 min-h-10 w-full rounded border border-line-soft px-3"
            value={pic}
            disabled={item.status !== "Belum ditindaklanjuti"}
            onChange={(e) => setPic(e.target.value)}
          />
        </label>
        <label className="text-sm font-bold">
          Tenggat
          <input
            type="date"
            className="mt-1 min-h-10 w-full rounded border border-line-soft px-3"
            value={due}
            disabled={item.status !== "Belum ditindaklanjuti"}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <div className="text-sm font-bold">
          <span id={`progres-label-${item.id}`}>Progres (%)</span>
          <div className="mt-1" role="group" aria-labelledby={`progres-label-${item.id}`}>
            {item.status === "Belum ditindaklanjuti" || locked || terminal ? (
              <p className="py-2 text-sm font-normal text-secondary-text">
                {progress}% · {progressLabel(progress)}
              </p>
            ) : (
              <ProgressSlider
                id={`progres-${item.id}`}
                value={progress}
                onChange={setProgress}
              />
            )}
          </div>
        </div>
      </div>
      {item.status === "Berjalan" && report ? (
        <div className="mt-3">
          <CompletionEvidencePicker
            institutionCode={report.institutionCode}
            actor={{ id: user.id, name: user.name, role: user.role }}
            assetId={evidenceAssetId}
            name={evidenceName}
            disabled={busy}
            onChange={(id, name) => {
              setEvidenceAssetId(id);
              setEvidenceName(name ?? "");
            }}
            onBusy={setUploadBusy}
          />
        </div>
      ) : null}
      {item.status === "Menunggu verifikasi" || item.status === "Terverifikasi" ? (
        <div className="mt-3">
          <p className="text-sm font-bold text-heading">
            Bukti penyelesaian{item.completionEvidenceAssetId ? "" : " (nama file lama)"}
          </p>
          <EvidencePreview
            assetId={item.completionEvidenceAssetId}
            institutionCode={report?.institutionCode ?? ""}
            name={item.completionEvidence}
          />
        </div>
      ) : null}
      <label className="mt-3 block text-sm font-bold">
        Catatan
        <textarea
          className="mt-1 min-h-20 w-full rounded border border-line-soft p-3 font-normal"
          value={note}
          disabled={terminal}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {message && (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.status === "Menunggu verifikasi" ? (
          <button
            type="button"
            className="primary-button"
            disabled={busy || uploadBusy}
            onClick={() => void save(true)}
          >
            Verifikasi Pesantren
          </button>
        ) : item.status === "Belum ditindaklanjuti" || item.status === "Berjalan" ? (
          <button
            type="button"
            className="primary-button"
            disabled={busy || uploadBusy}
            onClick={() => void save()}
          >
            {item.status === "Belum ditindaklanjuti" ? "Buat rencana tindakan" : "Perbarui progres"}
          </button>
        ) : item.status === "Terverifikasi" ? (
          <p className="text-sm text-secondary-text">
            Terverifikasi · bukti: {item.completionEvidence ?? "—"}
          </p>
        ) : (
          <p className="text-sm text-secondary-text">
            Dibatalkan · alasan: {item.canceledReason ?? "—"}
          </p>
        )}
        {canCancel ? (
          <button
            type="button"
            className="secondary-button"
            disabled={busy || uploadBusy}
            onClick={() => {
              setCancelError("");
              setCancelOpen(true);
            }}
          >
            Batalkan perbaikan
          </button>
        ) : null}
      </div>
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        label={`Batalkan ${item.id}`}
      >
        <h3 className="font-bold text-heading">Batalkan perbaikan {item.id}?</h3>
        <p className="mt-1 text-sm text-secondary-text">
          Baris tidak dihapus; status menjadi Dibatalkan dan tampil publik beserta alasan.
          Laporan induk tetap {report?.handlingStatus ?? "Proses"}.
        </p>
        <label className="mt-3 block text-sm font-bold">
          Alasan pembatalan (minimal 10 karakter)
          <textarea
            className="mt-1 min-h-24 w-full rounded border border-line-soft p-3 font-normal"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <span className="text-secondary-text">{cancelReason.trim().length} karakter</span>
        </label>
        {cancelError ? (
          <p role="alert" className="mt-2 text-sm text-[#b91c1c]">
            {cancelError}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="secondary-button" onClick={() => setCancelOpen(false)}>
            Kembali
          </button>
          <button type="button" className="primary-button" onClick={cancel}>
            Konfirmasi batal
          </button>
        </div>
      </Modal>
    </article>
  );
}
