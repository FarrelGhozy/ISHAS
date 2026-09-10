import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, FileText, MapPin, Save } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { EmptyState } from "~/shared/components/empty-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { canSubmitReport } from "~/shared/auth/session";
import type { IndicatorAnswer, InstrumentVersion } from "~/mocks/types";

type Indicator = InstrumentVersion["dimensions"][number]["indicators"][number];

const fieldClass = "mt-1.5 min-h-11 w-full rounded-lg border border-line-soft bg-white px-3 text-sm text-heading";

function answerIsComplete(indicator: Indicator, answer?: Partial<IndicatorAnswer>) {
  const hasLocation = Boolean(answer?.areaId) || (answer?.manualLocation?.trim().length ?? 0) >= 3;
  return Boolean(answer?.value && (!indicator.evidenceRequired || answer.evidenceName?.trim()) && (!indicator.locationRequired || hasLocation) && (answer.value !== "N/A" || (answer.note?.trim().length ?? 0) >= 10));
}

function answerOptions(type: Indicator["answerType"]) {
  if (type === "boolean-ya-tidak") return [{ value: "Ya", label: "Ya" }, { value: "Tidak", label: "Tidak" }];
  if (type === "likert-1-2-tidak") return [{ value: "1", label: "1 — Belum sesuai" }, { value: "2", label: "2 — Sesuai" }, { value: "Tidak", label: "Tidak tersedia" }];
  return [{ value: "1", label: "1 — Sangat kurang" }, { value: "2", label: "2 — Kurang" }, { value: "3", label: "3 — Cukup" }, { value: "4", label: "4 — Baik" }, { value: "5", label: "5 — Sangat baik" }, { value: "N/A", label: "Tidak dapat dinilai" }];
}

export function PenilaianMandiriPage() {
  const state = useMockState();
  const user = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const registeredCodes = selectRegisteredInstitutions(state).map((i) => i.code);
  const param = searchParams.get("pesantren");
  const paramValid = param !== null && registeredCodes.includes(param);
  const paramInvalid = param !== null && !paramValid;
  // ROUTES §1: preset ?pesantren= dihormati bila terdaftar; kode tak dikenal tidak
  // diganti diam-diam — minta pilihan eksplisit (seperti /lapor).
  const initialInstitution = paramValid && param ? param : (user?.institutionCodes[0] ?? "");
  const initialDraft = state.selfAssessmentDrafts[`SELF-${initialInstitution}`];
  const [institutionCode, setInstitutionCode] = useState(initialInstitution);
  const [reporterName, setReporterName] = useState(initialDraft?.reporterName ?? user?.name ?? "");
  const [active, setActive] = useState(initialDraft?.activeIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, Partial<IndicatorAnswer>>>(initialDraft?.answers ?? {});
  const [draftVersionId, setDraftVersionId] = useState(initialDraft?.instrumentVersionId ?? "");
  const [notice, setNotice] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const blocked = user !== null && !canSubmitReport(user.roleId);
  const instrument = state.instrumentVersions.find((item) => item.id === state.activeInstrumentVersionId && item.status === "Published");
  const indicators = useMemo(() => instrument?.dimensions.flatMap((dimension) => dimension.indicators) ?? [], [instrument]);
  const areas = state.areas.filter((area) => area.institutionCode === institutionCode);
  const draftId = `SELF-${institutionCode || "baru"}`;
  const storedDraft = state.selfAssessmentDrafts[draftId];
  const effectiveVersionId = draftVersionId || storedDraft?.instrumentVersionId || instrument?.id || "";
  // D-10: draft terikat versi lama yang sudah diarsip tidak boleh dikirim.
  // Versi draft tidak diganti diam-diam saat Published baru terbit.
  const draftStale = Boolean(instrument && effectiveVersionId && effectiveVersionId !== instrument.id);
  const current = indicators[active];
  const dimension = instrument?.dimensions.find((item) => item.indicators.some((indicator) => indicator.id === current?.id));
  const answer = current ? answers[current.id] ?? {} : {};
  const completedCount = indicators.filter((indicator) => answerIsComplete(indicator, answers[indicator.id])).length;
  const answeredCount = indicators.filter((indicator) => Boolean(answers[indicator.id]?.value)).length;
  const progress = indicators.length ? Math.round((completedCount / indicators.length) * 100) : 0;
  const identityComplete = Boolean(institutionCode && reporterName.trim().length >= 2);
  const valid = identityComplete && completedCount === indicators.length && !draftStale;

  useEffect(() => {
    if (!institutionCode || !instrument || reporterName.trim().length < 2 || submittedId || draftStale) return;
    mockRepository.saveSelfAssessmentDraft({ id: draftId, institutionCode, reporterName: reporterName.trim(), instrumentVersionId: effectiveVersionId || instrument.id, answers, activeIndex: active, updatedAt: new Date().toISOString() });
  }, [institutionCode, reporterName, answers, active, draftId, submittedId, draftStale, effectiveVersionId, instrument]);

  if (blocked) return <EmptyState title="Kirim dinonaktifkan untuk akun Anda" description={`Anda login sebagai ${user?.role}. Keluar dari akun untuk mengisi penilaian sebagai publik.`} />;
  if (!instrument) return <EmptyState title="Belum ada instrumen yang dipublikasikan." />;
  if (submittedId) return <section className="surface mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center"><span className="grid size-14 place-items-center rounded-full bg-[#dff7ed] text-[#047857]"><CheckCircle2 size={30} /></span><p className="kicker mt-5">Penilaian berhasil dikirim</p><h1 className="mt-1 text-2xl font-extrabold text-heading">Terima kasih, data Anda sudah diterima</h1><p className="mt-2 max-w-lg text-sm text-secondary-text">Penilaian <strong className="text-heading">{submittedId}</strong> akan diperiksa oleh pengelola pesantren sebelum digunakan dalam hasil K3L.</p><button type="button" className="secondary-button mt-6" onClick={() => { setSubmittedId(""); setAnswers({}); setActive(0); setNotice(""); }}>Isi penilaian baru</button></section>;

  const selectInstitution = (code: string) => {
    const nextDraft = state.selfAssessmentDrafts[`SELF-${code}`];
    setInstitutionCode(code); setReporterName(nextDraft?.reporterName ?? user?.name ?? ""); setAnswers(nextDraft?.answers ?? {}); setDraftVersionId(nextDraft?.instrumentVersionId ?? instrument?.id ?? ""); setActive(Math.min(nextDraft?.activeIndex ?? 0, Math.max(indicators.length - 1, 0))); setNotice("");
    const next = new URLSearchParams(searchParams);
    if (code) next.set("pesantren", code); else next.delete("pesantren");
    setSearchParams(next);
  };
  const discardStaleDraft = () => {
    if (storedDraft) mockRepository.deleteSelfAssessmentDraft(draftId);
    setAnswers({}); setActive(0); setDraftVersionId(instrument?.id ?? ""); setNotice("");
  };
  const setAnswer = (key: keyof IndicatorAnswer, value: string) => {
    if (!current) return;
    setAnswers((old) => ({ ...old, [current.id]: { ...old[current.id], [key]: value } })); setNotice("");
  };
  const submit = () => {
    if (draftStale) { setNotice("Versi instrumen draft sudah diarsipkan. Buang draft lama dan mulai penilaian baru dengan versi Published terbaru."); return; }
    if (!valid) { setNotice(!identityComplete ? "Lengkapi identitas penilaian terlebih dahulu." : `Masih ada ${indicators.length - completedCount} pertanyaan yang belum lengkap.`); return; }
    const actor = user ? { id: user.id, name: user.name, email: user.email, role: user.role } : { name: reporterName.trim(), role: "Publik" };
    const result = mockRepository.submitSelfAssessment(actor, draftId);
    if (result.ok) setSubmittedId(result.id ?? "Nomor penilaian dibuat"); else setNotice(result.error ?? "Penilaian belum dapat dikirim. Coba lagi.");
  };

  return <section className="mx-auto flex max-w-6xl flex-col gap-5">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="kicker">Penilaian mandiri</p><h1 className="text-2xl font-extrabold text-heading">Periksa kondisi K3L pesantren</h1><p className="mt-1 max-w-2xl text-sm text-secondary-text">Jawab sesuai kondisi yang Anda lihat. Data tersimpan otomatis di perangkat ini dan baru dikirim setelah seluruh isian lengkap.</p></div><span className="status status-neutral w-fit"><FileText size={14} />{instrument.label}</span></header>
    {paramInvalid ? <p role="alert" className="rounded-lg border border-line bg-white p-3 text-sm font-semibold text-[#b91c1c]">Pesantren tidak tersedia untuk pelaporan. Pilih pesantren terdaftar di bawah ini.</p> : null}

    <section className="surface overflow-hidden" aria-labelledby="identity-title"><div className="border-b border-line bg-strip px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-extrabold text-white">1</span><h2 id="identity-title" className="font-extrabold text-heading">Identitas penilaian</h2></div><p className="ml-9 text-xs text-secondary-text">Pilih pesantren agar daftar lokasi dan draft yang sesuai dapat dimuat.</p></div><div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"><label className="text-sm font-bold text-heading">Pesantren <span className="text-primary">*</span><select className={fieldClass} value={institutionCode} onChange={(event) => selectInstitution(event.target.value)}><option value="">Pilih pesantren</option>{selectRegisteredInstitutions(state).map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="text-sm font-bold text-heading">Nama pengisi <span className="text-primary">*</span><input className={fieldClass} value={reporterName} onChange={(event) => setReporterName(event.target.value)} placeholder="Masukkan nama lengkap" autoComplete="name" /><span className="mt-1 block text-xs font-normal text-secondary-text">Nama dicatat sebagai pengisi penilaian.</span></label></div></section>

    <div className="grid items-start gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="surface overflow-hidden lg:sticky lg:top-4"><div className="border-b border-line p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-extrabold text-heading">Progres pengisian</h2><strong className="text-sm text-primary">{progress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-strip" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={indicators.length} aria-label={`${completedCount} dari ${indicators.length} pertanyaan lengkap`}><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-secondary-text">{completedCount} dari {indicators.length} pertanyaan lengkap</p></div>
        <nav className="max-h-[28rem] overflow-y-auto p-3" aria-label="Daftar pertanyaan penilaian">{instrument.dimensions.map((group) => <div key={group.id} className="mb-4 last:mb-0"><p className="px-2 text-xs font-extrabold uppercase tracking-wide text-secondary-text">{group.name}</p><div className="mt-1 space-y-1">{group.indicators.map((indicator) => { const index = indicators.findIndex((item) => item.id === indicator.id); const complete = answerIsComplete(indicator, answers[indicator.id]); const selected = index === active; return <button type="button" key={indicator.id} aria-current={selected ? "step" : undefined} className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-semibold transition ${selected ? "bg-marun-bg text-primary ring-1 ring-marun-border" : "text-body-text hover:bg-strip"}`} onClick={() => { setActive(index); setNotice(""); }}><span className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${complete ? "border-[#047857] bg-[#dff7ed] text-[#047857]" : "border-line-soft text-secondary-text"}`}>{complete ? <Check size={13} strokeWidth={3} /> : index + 1}</span><span className="truncate">{indicator.title}</span></button>; })}</div></div>)}</nav>
        <div className="border-t border-line bg-strip px-4 py-3 text-xs text-secondary-text"><span className="flex items-center gap-1.5 font-semibold"><Save size={14} />Draft tersimpan otomatis</span></div></aside>

      <div className="space-y-4">{current ? <main className="surface overflow-hidden" aria-labelledby="question-title"><div className="border-b border-line bg-strip px-4 py-3 sm:px-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-extrabold uppercase tracking-wide text-primary">Langkah 2 · Pertanyaan {active + 1} dari {indicators.length}</p><span className="text-xs font-semibold text-secondary-text">{dimension?.name}</span></div></div>
        <div className="p-4 sm:p-6"><div className="flex flex-wrap gap-2"><span className="status status-neutral">{current.code}</span>{current.evidenceRequired ? <span className="status status-amber"><FileText size={13} />Bukti wajib</span> : null}{current.locationRequired ? <span className="status status-blue"><MapPin size={13} />Lokasi wajib</span> : null}</div><h2 id="question-title" className="mt-3 text-xl font-extrabold text-heading sm:text-2xl">{current.title}</h2><p className="mt-2 text-sm leading-6 text-secondary-text">{current.prompt}</p>
          <fieldset className="mt-6"><legend className="text-sm font-extrabold text-heading">Pilih jawaban <span className="text-primary">*</span></legend><div className={`mt-2 grid gap-2 ${current.answerType === "likert-1-5" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-3"}`}>{answerOptions(current.answerType).map((option) => <label key={option.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold transition ${answer.value === option.value ? "border-primary bg-marun-bg text-primary ring-1 ring-primary" : "border-line-soft bg-white text-heading hover:border-primary"}`}><input type="radio" className="size-4 accent-primary" name={`answer-${current.id}`} value={option.value} checked={answer.value === option.value} onChange={(event) => setAnswer("value", event.target.value)} /><span>{option.label}</span></label>)}</div></fieldset>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{current.locationRequired ? <div><label className="text-sm font-bold text-heading">Area yang dinilai <span className="text-primary">*</span><select className={fieldClass} value={answer.areaId ?? ""} onChange={(event) => setAnswer("areaId", event.target.value)} disabled={!institutionCode}><option value="">{institutionCode ? "Pilih area" : "Pilih pesantren dahulu"}</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name} · {area.floor}</option>)}</select></label><label className="mt-3 block text-sm font-bold text-heading">Lokasi belum ada di daftar?<input className={fieldClass} value={answer.manualLocation ?? ""} onChange={(event) => setAnswer("manualLocation", event.target.value)} disabled={!institutionCode} maxLength={140} placeholder="Tulis lokasi lengkap (bila area tak tersedia)" /></label><p className="mt-1 text-xs font-normal text-secondary-text">Pilih area bila tersedia. Bila belum ada, tulis lokasi ini; salah satu wajib diisi.</p></div> : null}{current.evidenceRequired ? <label className="text-sm font-bold text-heading">Bukti pendukung <span className="text-primary">*</span><input className={fieldClass} value={answer.evidenceName ?? ""} onChange={(event) => setAnswer("evidenceName", event.target.value)} placeholder="Contoh: foto-kabel-aula.jpg" /><span className="mt-1 block text-xs font-normal text-secondary-text">Tuliskan nama foto atau dokumen yang Anda siapkan.</span></label> : null}</div>
          <label className="mt-5 block text-sm font-bold text-heading">Catatan {answer.value === "N/A" ? <span className="text-primary">* minimal 10 karakter</span> : <span className="font-normal text-secondary-text">(opsional)</span>}<textarea className={`${fieldClass} min-h-28 p-3`} value={answer.note ?? ""} onChange={(event) => setAnswer("note", event.target.value)} placeholder={answer.value === "N/A" ? "Jelaskan mengapa kondisi tidak dapat dinilai…" : "Tambahkan konteks kondisi bila diperlukan…"} /></label></div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-strip px-4 py-3 sm:px-5"><button type="button" className="secondary-button" disabled={active === 0} onClick={() => { setActive((value) => value - 1); setNotice(""); }}><ChevronLeft size={16} />Sebelumnya</button><span className={`text-xs font-bold ${answerIsComplete(current, answer) ? "text-[#047857]" : "text-secondary-text"}`}>{answerIsComplete(current, answer) ? "Pertanyaan ini lengkap" : "Lengkapi isian wajib"}</span><button type="button" className="secondary-button" disabled={active === indicators.length - 1} onClick={() => { setActive((value) => value + 1); setNotice(""); }}>Berikutnya<ChevronRight size={16} /></button></div></main> : null}

        {draftStale ? <p role="alert" className="flex flex-wrap items-center gap-2 rounded-lg border border-marun-border bg-marun-bg p-3 text-sm font-semibold text-primary"><AlertCircle size={18} />Draft ini terikat {effectiveVersionId} yang sudah diarsip. Kirim dikunci — <button type="button" className="text-button" onClick={discardStaleDraft}>buang draft lama dan mulai baru ({instrument?.id})</button>.</p> : null}

        <section className="surface p-4 sm:p-5" aria-labelledby="submit-title"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className={`grid size-11 shrink-0 place-items-center rounded-full ${valid ? "bg-[#dff7ed] text-[#047857]" : "bg-strip text-secondary-text"}`}><ClipboardCheck size={22} /></span><div className="mr-auto"><p className="kicker">Langkah 3</p><h2 id="submit-title" className="font-extrabold text-heading">Kirim untuk divalidasi</h2><p className="mt-1 text-xs text-secondary-text">{valid ? "Semua data lengkap. Setelah dikirim, jawaban tidak dapat diubah." : `${answeredCount} terjawab · ${completedCount} lengkap · ${indicators.length - completedCount} perlu diselesaikan`}</p></div><button type="button" className="primary-button shrink-0" disabled={!valid} onClick={submit}>Kirim penilaian</button></div>{notice ? <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-marun-border bg-marun-bg p-3 text-sm font-semibold text-primary"><AlertCircle size={18} />{notice}</p> : null}</section>
      </div>
    </div>
  </section>;
}
