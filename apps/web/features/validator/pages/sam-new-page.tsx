// SAM-iSAFE pengamatan baru: info dulu, lalu kuesioner (D-26, D-26.e).
// Validator memilih pesantren terdaftar mana pun (general, tidak terikat scope).

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { SAM_KINDS, samActiveQuestions } from "~/mocks/sam-isafe";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { SamQuestionList } from "../components/sam-question-list";

export function Page() {
  const state = useMockState();
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

  const mulai = () => {
    const hasil = storeActions.createSamAssessment(
      { id: user?.id },
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
    setIdBaru(hasil.id);
  };

  const selesaikan = () => {
    if (!assessment) return;
    const hasil = storeActions.completeSamAssessment({ id: user?.id }, assessment.id);
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    navigate(`/validator/sam-isafe/${assessment.id}`);
  };

  const hapusDraft = () => {
    if (!assessment) return;
    if (!window.confirm(`Hapus draft ${assessment.id}? Jawaban yang terisi ikut terhapus.`)) return;
    const hasil = storeActions.deleteSamDraft({ id: user?.id }, assessment.id);
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    navigate("/validator/sam-isafe");
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-24">
      <header>
        <p className="kicker">
          Penilaian Validator
        </p>
        <h1 className="text-2xl font-extrabold text-heading">
          Pengamatan baru
        </h1>
        <p className="mt-1 text-sm text-secondary-text">
          {assessment
            ? `Menilai ${assessment.id} · ${terjawab}/${aktif.length} selesai · sementara ${assessment.totalScore}/${assessment.maxScore} (${assessment.percent.toFixed(1)}%)`
            : `Isi info pengamatan, lalu nilai ${aktif.length} pertanyaan (maks ${aktif.length * 2}).`}
        </p>
      </header>
      <Link
        className="text-button print:hidden"
        to="/validator/sam-isafe"
      >
        ← Kembali ke riwayat
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
        <div className="surface p-5">
          <h2 className="font-bold text-heading">
            Informasi pengamatan
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
              Pesantren terdaftar *
              <select
                className="secondary-button"
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
                  className="secondary-button"
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
                  className="secondary-button"
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
                  className="secondary-button"
                  type="date"
                  value={tanggal}
                  onChange={(event) => setTanggal(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Waktu
                <input
                  className="secondary-button"
                  type="time"
                  value={waktu}
                  onChange={(event) => setWaktu(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Jenis pengamatan
                <select
                  className="secondary-button"
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
                  className="secondary-button"
                  value={pengamat}
                  onChange={(event) => setPengamat(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Keterangan
                <input
                  className="secondary-button"
                  value={keterangan}
                  onChange={(event) => setKeterangan(event.target.value)}
                  placeholder="Opsional"
                />
              </label>
            </div>
            <div>
              <button
                className="primary-button"
                onClick={mulai}
                type="button"
              >
                Mulai pengamatan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="scope-banner text-sm">
            {assessment.id} · {assessment.institutionCode} · {assessment.observedAt} · Skor
            sementara {assessment.totalScore}/{assessment.maxScore} ({assessment.percent.toFixed(1)}%)
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
              <span className="mr-auto text-sm font-bold text-heading">
                {terjawab}/{aktif.length} · {assessment.percent.toFixed(1)}%
              </span>
              <button
                type="button"
                className="text-button"
                onClick={hapusDraft}
              >
                Hapus draft
              </button>
              <Link
                className="secondary-button"
                to="/validator/sam-isafe"
              >
                Simpan draft
              </Link>
              <button
                className="primary-button"
                onClick={selesaikan}
                type="button"
              >
                Selesaikan pengamatan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
