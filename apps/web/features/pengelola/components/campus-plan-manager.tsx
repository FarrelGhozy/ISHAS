import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import type { User } from "~/mocks/types";
import { useMockState } from "~/mocks/store/mock-store";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import { CampusPlan } from "~/shared/components/campus-plan";
import { Modal } from "~/shared/components/modal";

export function CampusPlanManager({ user }: { user: User }) {
  const state = useMockState();
  const code = user.institutionCodes[0];
  const institution = state.institutions.find((item) => item.code === code);
  const plans = state.campusPlans
    .filter((item) => item.institutionCode === code)
    .sort((a, b) => b.revision - a.revision);
  const activePlan = plans.find((item) => item.id === institution?.activeCampusPlanVersionId);
  const input = useRef<HTMLInputElement>(null);
  const chooseVersion = useRef<string | undefined>(undefined);
  const busy = useRef(false);
  const [confirm, setConfirm] = useState(false);
  const [candidate, setCandidate] = useState<{
    file: File;
    width: number;
    height: number;
    expectedActiveId?: string;
  } | null>(null);
  const [preview, setPreview] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!candidate) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(candidate.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [candidate]);
  const affected = state.findings.filter(
    (finding) =>
      finding.locationSnapshot?.point &&
      finding.locationSnapshot.campusPlanVersionId === activePlan?.id,
  ).length;
  const selectFile = () => {
    chooseVersion.current = institution?.activeCampusPlanVersionId;
    input.current?.click();
  };
  const publish = async () => {
    if (!candidate || !acknowledged || busy.current) return;
    busy.current = true;
    setSaving(true);
    setMessage("");
    const result = await mockRepository.uploadCampusPlan(user, {
      institutionCode: code,
      file: candidate.file,
      width: candidate.width,
      height: candidate.height,
      expectedActiveId: candidate.expectedActiveId,
      acknowledged,
    });
    if (result.ok) {
      setCandidate(null);
      setAcknowledged(false);
      setMessage(
        "Versi denah baru diterbitkan. Titik laporan lama tetap tersimpan pada versi asal.",
      );
    } else setMessage(result.error);
    busy.current = false;
    setSaving(false);
  };
  return (
    <section className="surface min-w-0 space-y-4 p-4 sm:p-5" aria-labelledby="campus-plan-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="campus-plan-title" className="text-lg font-extrabold text-heading">
            Denah Pesantren
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            Satu gambaran besar kompleks pesantren. Lantai ditulis sebagai keterangan, bukan denah
            terpisah.
          </p>
        </div>
        <span className="text-xs text-secondary-text">Simulasi prototipe · perangkat ini</span>
      </div>
      <div
        role="note"
        className="flex items-start gap-2 rounded-lg border border-marun-border bg-marun-bg p-3 text-sm text-primary"
      >
        <AlertTriangle size={20} className="shrink-0" />
        <p>
          Gunakan denah yang akan dipakai secara tetap. Sebisa mungkin jangan mengganti denah
          setelah digunakan untuk pelaporan. Perubahan tata letak, orientasi, atau pemotongan gambar
          dapat membuat titik laporan lama tidak sesuai dengan denah baru.
        </p>
      </div>
      <p className="text-sm text-secondary-text">
        Denah ini akan terlihat publik setelah pesantren dipilih. Jangan unggah denah ruangan rinci
        atau gambar berisi informasi pribadi. PNG/JPEG/WebP maksimum 5 MB, sisi pendek minimal 800
        piksel.
      </p>
      {message ? (
        <p role="status" className="rounded border border-line p-3 text-sm text-heading">
          {message}
        </p>
      ) : null}
      <input
        ref={input}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;
          setCandidate(null);
          setAcknowledged(false);
          setMessage("");
          if (
            !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
            file.size > 5 * 1024 * 1024
          ) {
            setMessage("Pilih PNG, JPEG atau WebP maksimum 5 MB.");
            return;
          }
          try {
            const bitmap = await createImageBitmap(file);
            const width = bitmap.width,
              height = bitmap.height;
            bitmap.close();
            if (Math.min(width, height) < 800) {
              setMessage("Sisi pendek denah minimal 800 piksel.");
              return;
            }
            setCandidate({ file, width, height, expectedActiveId: chooseVersion.current });
          } catch {
            setMessage("Berkas tidak dapat dibaca sebagai gambar. Pilih gambar lain.");
          }
        }}
      />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold text-heading">
            {activePlan ? `Denah aktif · versi ${activePlan.revision}` : "Belum ada denah aktif"}
          </h3>
          {activePlan ? (
            <>
              <CampusPlan key={activePlan.id} plan={activePlan} />
              <p className="mt-2 text-sm text-secondary-text">
                {activePlan.illustration
                  ? "Ilustrasi denah · bukan lokasi sebenarnya"
                  : "Denah unggahan pengelola"}{" "}
                · {affected} temuan bertitik terkait
              </p>
            </>
          ) : (
            <p className="rounded bg-strip p-4 text-sm text-secondary-text">
              Unggah gambaran besar pesantren agar pelapor dapat memilih titik lokasi.
            </p>
          )}
          <button
            type="button"
            disabled={saving}
            className="secondary-button mt-3"
            onClick={() => (activePlan ? setConfirm(true) : selectFile())}
          >
            <Upload size={16} />
            {activePlan ? "Ganti denah" : "Pilih gambar denah"}
          </button>
        </div>
        {candidate ? (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-heading">Calon denah baru (belum diterbitkan)</h3>
            {preview ? (
              <img
                src={preview}
                alt="Pratinjau calon denah pesantren"
                className="h-auto w-full rounded-lg border border-line"
              />
            ) : null}
            <p className="text-sm text-secondary-text">
              {candidate.width} × {candidate.height} piksel · {candidate.file.name}
            </p>
            <p className="rounded bg-marun-bg p-3 text-sm text-primary">
              Titik lama tidak dipindahkan otomatis. Laporan lama tetap menggunakan versi denah
              asal. Pastikan tata letak gambar baru benar sebelum menerbitkan.
            </p>
            <label className="flex min-h-11 items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={acknowledged}
                disabled={saving}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              Saya memahami bahwa titik lama tidak otomatis sesuai dengan denah baru.
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="primary-button"
                disabled={saving || !acknowledged}
                onClick={publish}
              >
                {saving ? "Menyimpan…" : "Terbitkan versi baru"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={() => {
                  setCandidate(null);
                  setAcknowledged(false);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {plans.length > 1 ? (
        <details>
          <summary className="cursor-pointer text-sm font-bold text-heading">
            Riwayat versi denah ({plans.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {plans.map((plan) => (
              <li key={plan.id} className="text-sm text-secondary-text">
                Versi {plan.revision} · {new Date(plan.uploadedAt).toLocaleDateString("id-ID")}
                {plan.id === activePlan?.id ? " · aktif" : " · titik historis tetap pada versi ini"}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <Modal open={confirm} onClose={() => setConfirm(false)} label="Ganti denah pesantren?">
        <div className="max-w-lg space-y-4">
          <h3 className="text-xl font-extrabold text-heading">Ganti denah pesantren?</h3>
          <p className="text-sm leading-6 text-secondary-text">
            Mengganti denah dapat membuat titik laporan lama tidak sesuai dengan posisi pada denah
            baru. Sebisa mungkin gunakan denah yang sama. Titik lama tetap tersimpan pada versi
            denah asal dan tidak dipindahkan otomatis.
          </p>
          <p className="text-sm font-bold text-heading">
            {affected} temuan bertitik mengacu denah aktif saat ini.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="secondary-button" onClick={() => setConfirm(false)}>
              Batal
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setConfirm(false);
                selectFile();
              }}
            >
              Lanjut pilih denah
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
