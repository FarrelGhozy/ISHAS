// Inspeksi kantor baru: info dulu, lalu checklist Ya/Tidak (D-49).
// Validator memilih pesantren terdaftar mana pun (general, tidak terikat scope).

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, ClipboardCheck, Save, ShieldCheck } from "lucide-react";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { OFFICE_KINDS, officeActiveQuestions } from "~/mocks/office-inspection";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState, useValidatorState } from "~/shared/api/validator-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { OfficeQuestionList } from "../components/office-question-list";
import { bacaOfficeDraftId, ingatOfficeDraft, lupakanOfficeDraft } from "../lib/office-draft";

export function Page() {
  const state = useValidatorState();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const registered = selectRegisteredInstitutions(state);
  const [pesantren, setPesantren] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [area, setArea] = useState("");
  const [manual, setManual] = useState("");
  const [tanggal, setTanggal] = useState("2026-10-13");
  const [waktu, setWaktu] = useState("09:00");
  const [jenis, setJenis] = useState(OFFICE_KINDS[0]);
  const [pengamat, setPengamat] = useState(user?.name ?? "");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState("");
  const [idBaru, setIdBaru] = useState("");

  const areas = useMemo(() => {
    if (!pesantren) return [];
    return state.areas.filter((item) => item.institutionCode === pesantren);
  }, [state.areas, pesantren]);
  const aktif = officeActiveQuestions(state.officeQuestions ?? []);
  const assessment = (state.officeAssessments ?? []).find((item) => item.id === idBaru);
  const terjawab = assessment
    ? aktif.filter((item) => assessment.answers[item.id]).length
    : 0;

  // Lanjutkan draft Berlangsung milik Validator ini setelah reload. Penunjuk
  // hanya dihapus saat selesai/hapus draft; di sini cukup coba resume agar state
  // yang belum termuat tidak menghapus penunjuk.
  useEffect(() => {
    if (idBaru || !user?.id) return;
    const pointer = bacaOfficeDraftId(user.id);
    if (!pointer) return;
    const draft = (state.officeAssessments ?? []).find(
      (item) =>
        item.id === pointer &&
        item.status === "Berlangsung" &&
        item.observerAccountId === user.id,
    );
    if (draft) setIdBaru(draft.id);
  }, [idBaru, user?.id, state.officeAssessments]);

  const mulai = async () => {
    const hasil = await repository.createOfficeAssessment(
      { id: user?.id, name: user?.name ?? "Validator" },
      {
        institutionCode: pesantren,
        unitKerja,
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
      setPesan(hasil.ok ? "Gagal membuat inspeksi." : hasil.error);
      return;
    }
    setPesan("");
    ingatOfficeDraft(user?.id, hasil.id);
    refreshValidatorState();
    setIdBaru(hasil.id);
  };

  const selesaikan = async () => {
    if (!assessment) return;
    const hasil = await repository.completeOfficeAssessment(
      { id: user?.id, name: user?.name ?? "Validator" },
      assessment.id,
    );
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    lupakanOfficeDraft(user?.id);
    refreshValidatorState();
    navigate(`/validator/inspeksi-kantor/${assessment.id}`);
  };

  const hapusDraft = async () => {
    if (!assessment) return;
    if (!window.confirm(`Hapus draft ${assessment.id}? Jawaban yang terisi ikut terhapus.`)) return;
    const hasil = await repository.deleteOfficeDraft(
      { id: user?.id, name: user?.name ?? "Validator" },
      assessment.id,
    );
    if (!hasil.ok) {
      setPesan(hasil.error);
      return;
    }
    lupakanOfficeDraft(user?.id);
    refreshValidatorState();
    navigate("/validator/inspeksi-kantor");
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
            <span className={assessment ? "text-primary" : "text-secondary-text"}>Pemeriksaan</span>
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
          Inspeksi baru
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-secondary-text">
          {assessment
            ? `Memeriksa ${assessment.id} · ${terjawab}/${aktif.length} selesai · sementara ${assessment.totalScore}/${assessment.maxScore} (${assessment.percent.toFixed(1)}%)`
            : `Isi info inspeksi, lalu nilai ${aktif.length} item (maks ${aktif.length}).`}
        </p>
        </div>
      </header>
      <Link
        className="text-button print:hidden"
        to="/validator/inspeksi-kantor"
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
                <h2 className="font-bold text-heading">Informasi inspeksi</h2>
                <p className="mt-0.5 text-xs text-secondary-text">Lengkapi konteks sebelum mulai memeriksa.</p>
              </div>
            </div>
          </div>
          <div className="p-5">
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
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
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Satker/Fakultas/Prodi *
                <input
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={unitKerja}
                  onChange={(event) => setUnitKerja(event.target.value)}
                  placeholder="Contoh: Fakultas Sains dan Teknologi"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                No ruang / area (mengikuti pesantren)
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
                  placeholder="Contoh: Ruang TU Lt. 2"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
                Tanggal inspeksi *
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
                Jenis inspeksi
                <select
                  className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
                  value={jenis}
                  onChange={(event) => setJenis(event.target.value)}
                >
                  {OFFICE_KINDS.map((item) => (
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
                Pemeriksa *
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
                Mulai inspeksi
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
          <OfficeQuestionList
            accountId={user?.id}
            assessment={assessment}
            categories={(state.officeCategories ?? []).filter((item) => item.isActive)}
            questions={state.officeQuestions ?? []}
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
                to="/validator/inspeksi-kantor"
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
                Selesaikan inspeksi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
