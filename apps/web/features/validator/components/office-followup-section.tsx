// Temuan + tindak lanjut inspeksi kantor (D-49.e).
// Tiap temuan (jawaban Tidak): bukti + catatan, lalu buat/kelola satu tindak lanjut
// (PIC + tenggat wajib; status Belum → Berjalan → Selesai; Batal beralasan).

import { useState } from "react";
import { officeFindings } from "~/mocks/office-inspection";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState } from "~/shared/api/validator-state";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { StatusChip } from "~/shared/components/status-chip";
import type {
  OfficeAssessment,
  OfficeFollowUp,
  OfficeQuestion,
} from "~/mocks/types";

type Props = {
  assessment: OfficeAssessment;
  questions: OfficeQuestion[];
  followUps: OfficeFollowUp[];
  accountId?: string;
  onPesan: (value: string) => void;
};

function KartuTemuan({
  teks,
  catatan,
  suhu,
  assetId,
  namaBukti,
  institutionCode,
  anak,
}: {
  teks: string;
  catatan: string;
  suhu?: number;
  assetId?: string;
  namaBukti?: string;
  institutionCode: string;
  anak: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-line p-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip value="Tinggi" />
        <span className="text-xs font-bold text-secondary-text">
          Jawaban Tidak
        </span>
        {suhu !== undefined ? (
          <span className="text-xs font-bold text-secondary-text">
            Suhu {suhu}°C
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-heading">
        {teks}
      </p>
      {catatan ? (
        <p className="mt-1 text-sm text-secondary-text">
          Temuan: {catatan}
        </p>
      ) : null}
      <EvidencePreview
        assetId={assetId}
        institutionCode={institutionCode}
        name={namaBukti}
      />
      <div className="mt-3">
        {anak}
      </div>
    </article>
  );
}

export function OfficeFollowUpSection(props: Props) {
  const { assessment, questions, followUps, accountId, onPesan } = props;
  const temuan = officeFindings(assessment, questions);
  const [bukaForm, setBukaForm] = useState("");
  const [pic, setPic] = useState("");
  const [tenggat, setTenggat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [alasan, setAlasan] = useState("");
  const [batalId, setBatalId] = useState("");

  if (temuan.length === 0) {
    return (
      <p className="text-sm text-secondary-text">
        Tidak ada temuan. Seluruh item bernilai Ya.
      </p>
    );
  }

  const buat = async (questionId: string) => {
    const hasil = await repository.createOfficeFollowUp(
      { id: accountId, name: "Validator" },
      { assessmentId: assessment.id, questionId, pic, dueDate: tenggat, note: catatan },
    );
    if (!hasil.ok) {
      onPesan(hasil.error);
      return;
    }
    refreshValidatorState();
    onPesan("Tindak lanjut dibuat.");
    setBukaForm("");
    setPic("");
    setTenggat("");
    setCatatan("");
  };

  const ubahStatus = async (id: string, status: OfficeFollowUp["status"]) => {
    const hasil = await repository.updateOfficeFollowUp({ id: accountId, name: "Validator" }, id, {
      status,
    });
    if (hasil.ok) refreshValidatorState();
    onPesan(hasil.ok ? "Status tindak lanjut diperbarui." : hasil.error);
  };

  const batalkan = async (id: string) => {
    const hasil = await repository.cancelOfficeFollowUp({ id: accountId, name: "Validator" }, id, alasan);
    if (!hasil.ok) {
      onPesan(hasil.error);
      return;
    }
    refreshValidatorState();
    onPesan("Tindak lanjut dibatalkan.");
    setBatalId("");
    setAlasan("");
  };

  return (
    <div className="flex flex-col gap-3">
      {temuan.map(({ question, answer }) => {
        const tindak = followUps.find(
          (item) => item.questionId === question.id && item.status !== "Dibatalkan",
        );
        const riwayatBatal = followUps.find(
          (item) => item.questionId === question.id && item.status === "Dibatalkan",
        );
        return (
          <KartuTemuan
            key={question.id}
            teks={question.text}
            catatan={answer.note}
            suhu={answer.suhuRuang}
            assetId={answer.evidenceAssetId}
            namaBukti={answer.evidenceName}
            institutionCode={assessment.institutionCode}
            anak={
              tindak ? (
                <div className="rounded-lg bg-strip p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip value={tindak.status} />
                    <strong className="text-sm text-heading">
                      {tindak.pic}
                    </strong>
                    <span className="ml-auto text-xs text-secondary-text">
                      Tenggat {tindak.dueDate}
                    </span>
                  </div>
                  {tindak.note ? (
                    <p className="mt-1 text-sm text-secondary-text">
                      {tindak.note}
                    </p>
                  ) : null}
                  {tindak.status === "Selesai" && tindak.doneAt ? (
                    <p className="mt-1 text-xs text-faint">
                      Selesai {tindak.doneAt.slice(0, 10)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tindak.status === "Belum ditindaklanjuti" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void ubahStatus(tindak.id, "Berjalan")}
                      >
                        Mulai kerjakan
                      </button>
                    ) : null}
                    {tindak.status === "Berjalan" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void ubahStatus(tindak.id, "Selesai")}
                      >
                        Tandai selesai
                      </button>
                    ) : null}
                    {tindak.status !== "Selesai" ? (
                      batalId === tindak.id ? (
                        <span className="flex w-full flex-col gap-2">
                          <input
                            className="secondary-button"
                            value={alasan}
                            onChange={(event) => setAlasan(event.target.value)}
                            placeholder="Alasan pembatalan (min 10 karakter)"
                          />
                          <span className="flex gap-2">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => void batalkan(tindak.id)}
                            >
                              Konfirmasi batal
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => {
                                setBatalId("");
                                setAlasan("");
                              }}
                            >
                              Urungkan
                            </button>
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setBatalId(tindak.id)}
                        >
                          Batalkan
                        </button>
                      )
                    ) : null}
                  </div>
                </div>
              ) : (
                <div>
                  {riwayatBatal ? (
                    <p className="mb-2 text-xs text-secondary-text">
                      <StatusChip value="Dibatalkan" /> {riwayatBatal.cancelReason}
                    </p>
                  ) : null}
                  {bukaForm === question.id ? (
                    <div className="flex flex-col gap-2 rounded-lg bg-strip p-3">
                      <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                        Penanggung jawab *
                        <input
                          className="secondary-button"
                          value={pic}
                          onChange={(event) => setPic(event.target.value)}
                          placeholder="Contoh: Bagian Sarpras"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                        Tenggat *
                        <input
                          className="secondary-button"
                          type="date"
                          min={assessment.observedAt}
                          value={tenggat}
                          onChange={(event) => setTenggat(event.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                        Catatan rencana
                        <input
                          className="secondary-button"
                          value={catatan}
                          onChange={(event) => setCatatan(event.target.value)}
                          placeholder="Opsional"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => void buat(question.id)}
                        >
                          Simpan tindak lanjut
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setBukaForm("")}
                        >
                          Urungkan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setBukaForm(question.id);
                        onPesan("");
                      }}
                    >
                      Buat tindak lanjut
                    </button>
                  )}
                </div>
              )
            }
          />
        );
      })}
    </div>
  );
}
