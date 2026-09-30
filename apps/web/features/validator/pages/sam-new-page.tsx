// SAM-iSAFE pengamatan baru: info dulu, lalu kuesioner (D-26, D-26.e).
// Validator memilih pesantren terdaftar mana pun (general, tidak terikat scope).

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, ClipboardCheck, Save, ShieldCheck } from "lucide-react";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { SAM_KINDS, samActiveQuestions } from "~/mocks/sam-isafe";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState, useValidatorState } from "~/shared/api/validator-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { SamQuestionList } from "../components/sam-question-list";

export function Page() {
  const state = useValidatorState();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const registered = selectRegisteredInstitutions(state);
  const [pesantren, setPesantren] = useState("");
  const [area, setArea] = useState("");
  const [manual, setManual] = useState("");
  const [tanggal, setTanggal] = useState("2026-09-28");
  const [waktu, setWaktu] = useState("08:30");
  const [jenis, setJenis] = useState(SAM_KINDS[0]);
  const [pengamat, setPengamat] = useState(user?.name ?? "");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState("");
  const [idBaru, setIdBaru] = useState("");

  const areas = useMemo(() => {
    if (!pesantren) return [];
    return state.areas.filter((item) => item.institutionCode === pesantren);
  }, [state.areas, pesantren]);
  const aktif = samActiveQuestions(state.samQuestions);
  const assessment = state.samAssessments.find((item) => item.id === idBaru);
  const terjawab = assessment
    ? aktif.filter((item) => assessment.answers[item.id]).length
    : 0;

  const mulai = async () => {
    const hasil = await repository.createSamAssessment(
      { id: user?.id, name: user?.name ?? "Validator" },
      {
        institutionCode: pesantren,
        areaId: area || undefined,
        manualLocation: manual,
        observedAt: tanggal,
        observedTime: waktu,
        kind: jenis,
        observerName: pengamat || user?.name || "Validator",
        note: keterangan,
      },
    );
    if (!hasil.ok || !hasil.id) {
      setPesan(hasil.ok ? "Gagal membuat pengamatan." : hasil.error);
      return;
    }
    setPesan("");
    refreshValidatorState();
    setIdBaru(hasil.id);
  };

  const selesaikan = async () => {
    if (!assessment) return;
    const hasil = await repository.completeSamAssessment(
      { id: user?.id, name: user?.name ?? "Validator" },
      assessment.id,
    );
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    refreshValidatorState();
    navigate(`/validator/sam-isafe/${assessment.id}`);
  };

  const hapusDraft = async () => {
    if (!assessment) return;
    if (!window.confirm(`Hapus draft ${assessment.id}? Jawaban yang terisi ikut terhapus.`)) return;
    const hasil = await repository.deleteSamDraft(
      { id: user?.id, name: user?.name ?? "Validator" },
      assessment.id,
    );
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    refreshValidatorState();
    navigate("/validator/sam-isafe");
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 pb-24">
      <header className="surface overflow-hidden">
        <div className="border-b border-line bg-brand-bg px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-primary">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-white">{assessment ? <Check size={15} /> : "1"}</span>
            <span>Informasi</span>
            <span className="h-px w-8 bg-brand-border" />
            <span className={`inline-flex size-7 items-center justify-center rounded-full ${assessment ? "bg-primary text-white" : "border border-brand-border bg-white text-primary"}`}>{assessment ? <Check size={15} /> : "2"}</span>
            <span className={assessment ? "text-primary" : "text-secondary-text"}>Penilaian</span>
            <span className="h-px w-8 bg-brand-border" />
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-brand-border bg-white text-secondary-text">3</span>
            <span className="text-secondary-text">Selesai</span>
          </div>
        </div>
        <div className="p-5 sm:p-6">
        <p className="kicker">
          Penilaian Validator
        </p>
        <h1 className="text-2xl font-extrabold text-heading">
          Pengamatan baru
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-secondary-text">
          {assessment
            ? `Menilai ${assessment.id} · ${terjawab}/${aktif.length} selesai · sementara ${assessment.totalScore}/${assessment.maxScore} (${assessment.percent.toFixed(1)}%)`
            : `Isi info pengamatan, lalu nilai ${aktif.length} pertanyaan (maks ${aktif.length * 2}).`}
        </p>
        </div>
      </header>
      <Link
        className="text-button print:hidden"
        to="/validator/sam-isafe"
      >
        <ArrowLeft size={15} />
        Kembali ke riwayat
      </Link>
      {pesan ? (
        <p
          className="rounded-lg border border-brand-border bg-brand-bg p-3 text-sm font-semibold text-primary"
          role="alert"
        >
          {pesan}
        </p>
      ) : null}
      {!assessment ? (
        <div className="surface overflow-hidden">
          <div className="border-b border-line bg-strip px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-bg text-primary"><ClipboardCheck size={18} /></span>
              <div>
                <h2 className="font-bold text-heading">Informasi pengamatan</h2>
                <p className="mt-0.5 text-xs text-secondary-text">Lengkapi konteks sebelum mulai menilai.</p>
              </div>
            </div>
          </div>
          <div className="p-5">
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
              Pesantren terdaftar *
              <select
                className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                value={pesantren}
                onChange={(event) => {
                  setPesantren(event.target.value);
                  setArea("");
                }}
              >
                <option value="">
                  Pilih pesantren
                </option>
                {registered.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Area (mengikuti pesantren)
                <select
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                >
                  <option value="">
                    Tanpa area spesifik
                  </option>
                  {areas.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} · {item.floor}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Lokasi manual (wajib bila tanpa area)
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={manual}
                  onChange={(event) => setManual(event.target.value)}
                  placeholder="Contoh: Asrama Putra Blok A"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Tanggal *
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  type="date"
                  value={tanggal}
                  onChange={(event) => setTanggal(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Waktu
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  type="time"
                  value={waktu}
                  onChange={(event) => setWaktu(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Jenis pengamatan
                <select
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={jenis}
                  onChange={(event) => setJenis(event.target.value)}
                >
                  {SAM_KINDS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Pengamat *
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={pengamat}
                  onChange={(event) => setPengamat(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Keterangan
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={keterangan}
                  onChange={(event) => setKeterangan(event.target.value)}
                  placeholder="Opsional"
                />
              </label>
            </div>
            <div>
              <button
                className="primary-button"
                onClick={() => void mulai()}
                type="button"
              >
                <ShieldCheck size={16} />
                Mulai pengamatan
              </button>
            </div>
          </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="mr-auto">
              <p className="kicker">Sedang mengisi</p>
              <p className="mt-1 text-sm font-extrabold text-heading">{assessment.id} · {assessment.institutionCode}</p>
              <p className="mt-1 text-xs text-secondary-text">{assessment.observedAt} · skor sementara {assessment.totalScore}/{assessment.maxScore}</p>
            </div>
            <div className="rounded-xl bg-brand-bg px-4 py-2 text-right">
              <p className="text-xl font-extrabold text-primary">{assessment.percent.toFixed(1)}%</p>
              <p className="text-[11px] font-bold text-secondary-text">skor sementara</p>
            </div>
          </div>
          <SamQuestionList
            accountId={user?.id}
            assessment={assessment}
            categories={state.samCategories.filter((item) => item.isActive)}
            questions={state.samQuestions}
            pesan={pesan}
            setPesan={setPesan}
          />
          <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 p-3 backdrop-blur">
            <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-2">
              <span className="mr-auto inline-flex items-center gap-2 text-sm font-bold text-heading">
                <Save size={16} />
                {terjawab}/{aktif.length} · {assessment.percent.toFixed(1)}%
              </span>
              <button
                type="button"
                className="text-button"
                onClick={() => void hapusDraft()}
              >
                Hapus draft
              </button>
              <Link
                className="secondary-button"
                to="/validator/sam-isafe"
              >
                <Save size={15} />
                Simpan draft
              </Link>
              <button
                className="primary-button"
                onClick={() => void selesaikan()}
                type="button"
              >
                <Check size={15} />
                Selesaikan pengamatan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
