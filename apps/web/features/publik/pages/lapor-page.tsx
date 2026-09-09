// `/lapor` — form laporan cepat satu langkah (V2-03: FLOWS §2, WIREFRAMES §2).
// Tanpa login maupun login pengelola (nama otomatis, tetap editable — D-03).
// Super Admin/Peneliti: baca saja, kirim nonaktif + pesan keluar dari akun.
// Draft per pesantren bertahan saat refresh; kirim-ganda dicegah via tombol terkunci
// + requestId idempotency yang sama bila klik ganda terjadi sebelum render ulang.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import {
  selectAreasByInstitution,
  selectRegisteredInstitutions,
} from "~/mocks/store/lapor-selectors";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { canSubmitReport } from "~/shared/auth/session";
import { EmptyState } from "~/shared/components/empty-state";
import { LaporForm } from "../components/lapor-form";
import { LaporSuccess } from "../components/lapor-success";
import {
  EMPTY_LAPOR_VALUES,
  isLaporValid,
  validateLapor,
  type LaporValues,
} from "../lib/lapor-validation";
import {
  clearLaporDraft,
  isLaporEmpty,
  loadLaporDraft,
  saveLaporDraft,
} from "../lib/lapor-draft";

const FOCUS_ORDER: (keyof LaporValues)[] = [
  "reporterName",
  "institutionCode",
  "areaId",
  "manualLocation",
  "title",
  "description",
  "contact",
];

function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function LaporPage() {
  const [params] = useSearchParams();
  const user = useCurrentUser();
  return <LaporPageContent key={`${params.get("pesantren") ?? "umum"}:${user?.id ?? "publik"}`} />;
}

function LaporPageContent() {
  const state = useMockState();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const registered = useMemo(() => selectRegisteredInstitutions(state), [state]);
  const registeredCodes = useMemo(() => registered.map((i) => i.code), [registered]);

  const blocked = user !== null && !canSubmitReport(user.roleId);
  const isPrefilledManager = user?.roleId === "pengelola";

  const param = searchParams.get("pesantren");
  const paramValid = param !== null && registeredCodes.includes(param);
  // ROUTES §1: kode tak dikenal/nonaktif tidak diganti diam-diam — minta pilihan eksplisit.
  const paramInvalid = param !== null && !paramValid;
  const initialCode = paramValid && param ? param : "";

  const [values, setValues] = useState<LaporValues>(() => {
    if (initialCode) {
      const draft = loadLaporDraft(initialCode);
      if (draft) return { ...draft, institutionCode: initialCode, reporterName: draft.reporterName || (isPrefilledManager ? user.name : "") };
      return {
        ...EMPTY_LAPOR_VALUES,
        institutionCode: initialCode,
        reporterName: user?.roleId === "pengelola" ? (user.name ?? "") : "",
      };
    }
    if (paramInvalid) return { ...EMPTY_LAPOR_VALUES, reporterName: isPrefilledManager ? user.name : "" };
    // Tanpa param: pulihkan cermin draft terakhir ("umum") bila ada isinya.
    const mirror = loadLaporDraft(null);
    if (mirror && (!isLaporEmpty(mirror) || mirror.institutionCode)) return mirror;
    return {
      ...EMPTY_LAPOR_VALUES,
      reporterName: user?.roleId === "pengelola" ? (user.name ?? "") : "",
    };
  });
  const [touched, setTouched] = useState<Partial<Record<keyof LaporValues, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const submitLock = useRef(false);
  const [draftSaved, setDraftSaved] = useState(true);
  const requestIdRef = useRef<string>(newRequestId());
  const fieldRefs = useRef<Partial<Record<keyof LaporValues, HTMLElement | null>>>({});

  const areas = useMemo(
    () => selectAreasByInstitution(state, values.institutionCode || null),
    [state, values.institutionCode],
  );
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);
  const selectedHasNoAreas = values.institutionCode !== "" && areas.length === 0;

  const errors = useMemo(
    () =>
      validateLapor(values, {
        registeredCodes,
        areaIdsOfSelected: areaIds,
        selectedHasNoAreas,
      }),
    [values, registeredCodes, areaIds, selectedHasNoAreas],
  );
  const visibleErrors = useMemo(() => {
    const out: typeof errors = {};
    for (const key of Object.keys(errors) as (keyof LaporValues)[]) {
      if (attempted || touched[key]) out[key] = errors[key];
    }
    return out;
  }, [errors, attempted, touched]);

  // Draft bertahan saat refresh: tulis per pesantren + cermin "umum" pemulih sesi.
  useEffect(() => {
    if (blocked || successId) return;
    const scoped = !values.institutionCode || saveLaporDraft(values.institutionCode, values);
    const mirror = saveLaporDraft(null, values);
    setDraftSaved(scoped && mirror);
  }, [values, blocked, successId]);

  if (registered.length === 0) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4">
        <header>
          <p className="kicker">Laporan publik</p>
          <h1 className="text-xl font-extrabold text-heading">Laporkan temuan bahaya</h1>
        </header>
        <EmptyState
          title="Belum ada pesantren terdaftar"
          description="Pendaftaran dilakukan oleh Super Admin. Pelaporan dinonaktifkan sampai ada pesantren terdaftar."
          action={<Link className="secondary-button" to="/">Kembali ke dashboard</Link>}
        />
      </section>
    );
  }

  if (successId) {
    return (
      <LaporSuccess
        reportId={successId}
        onReportAnother={() => {
          submitLock.current = false;
          requestIdRef.current = newRequestId();
          setSuccessId(null);
          setAttempted(false);
          setTouched({});
          setFormError(null);
          setValues({ ...EMPTY_LAPOR_VALUES, institutionCode: values.institutionCode, reporterName: isPrefilledManager ? user.name : "" });
          requestAnimationFrame(() => fieldRefs.current.reporterName?.focus());
        }}
      />
    );
  }

  function handleChange(field: keyof LaporValues, value: string) {
    setFormError(null);
    if (field === "institutionCode") {
      if (!blocked) {
        const currentSaved = !values.institutionCode || saveLaporDraft(values.institutionCode, values);
        const existing = loadLaporDraft(value || null);
        const next = existing ?? { ...EMPTY_LAPOR_VALUES, reporterName: isPrefilledManager ? user.name : values.reporterName, institutionCode: value };
        if (!currentSaved || !saveLaporDraft(value || null, next)) {
          setFormError("Draft belum dapat disimpan. Periksa penyimpanan browser sebelum berpindah pesantren.");
          return;
        }
      }
      const nextParams = new URLSearchParams(searchParams);
      // Explicit empty selection must not restore the last institution mirror.
      nextParams.set("pesantren", value);
      setSearchParams(nextParams);
      requestAnimationFrame(() => document.getElementById("lapor-pesantren")?.focus());
      return;
    }
    setValues((v) => ({ ...v, [field]: value }));
  }

  function handleSubmit() {
    if (submitLock.current || blocked) return;
    setAttempted(true);
    setTouched({
      reporterName: true,
      institutionCode: true,
      areaId: true,
      manualLocation: true,
      title: true,
      description: true,
      contact: true,
    });
    if (!isLaporValid(errors)) {
      const first = FOCUS_ORDER.find((f) => errors[f]);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }
    if (blocked) return;
    // Kunci kirim ganda: tombol disabled saat mengirim + requestId sama bila
    // klik ganda lolos sebelum render ulang (store mengembalikan id yang sama).
    submitLock.current = true;
    setSubmitting(true);
    const result = mockRepository.submitLaporCepat(
      {
        id: user?.id,
        name: user?.name ?? values.reporterName.trim(),
        email: user?.email,
        role: user?.role ?? "Publik",
      },
      {
        institutionCode: values.institutionCode,
        reporterName: values.reporterName.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        areaId: values.areaId,
        manualLocation: values.manualLocation.trim() || undefined,
        evidenceName: values.evidenceName.trim() || undefined,
        contact: values.contact.trim() || undefined,
        clientRequestId: requestIdRef.current,
      },
    );
    if (result.ok && result.id) {
      clearLaporDraft(values.institutionCode);
      clearLaporDraft(null);
      setSuccessId(result.id);
    } else if (!result.ok) {
      submitLock.current = false;
      setFormError(result.error);
    }
    setSubmitting(false);
  }

  function handleCancel() {
    if (isLaporEmpty(values)) navigate("/");
    else setConfirmCancel(true);
  }

  const canSubmit = isLaporValid(errors) && !blocked;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4">
      <header>
        <p className="kicker">Laporan publik</p>
        <h1 className="text-xl font-extrabold text-heading">Laporkan temuan bahaya</h1>
        <p className="mt-1 text-sm text-secondary-text">
          Laporan Anda tidak langsung tampil; pengelola pondok memvalidasi dan menentukan
          tingkat bahaya terlebih dahulu.
        </p>
      </header>

      {paramInvalid && param !== "" ? (
        <div
          role="alert"
          className="rounded-[7px] border border-line bg-white px-3 py-2 text-xs font-semibold text-[#b91c1c]"
        >
          Pesantren tidak tersedia untuk pelaporan. Pilih pesantren terdaftar di bawah ini.
        </div>
      ) : null}

      {blocked ? (
        <div
          role="note"
          className="rounded-[7px] border border-line bg-strip px-3 py-2 text-xs font-semibold text-secondary-text"
        >
          Kirim dinonaktifkan untuk akun Anda — Anda login sebagai {user?.role}. Keluar dari
          akun untuk melapor sebagai publik.
        </div>
      ) : null}

      {!blocked ? <p role="status" className={`text-sm ${draftSaved ? "text-secondary-text" : "text-[#b91c1c]"}`}>
        {draftSaved ? "Draft tersimpan di perangkat ini. Foto hanya dicatat sebagai nama file." : "Draft belum tersimpan. Jangan tutup halaman; periksa ruang dan izin penyimpanan browser."}
      </p> : null}
      {selectedHasNoAreas ? <p role="status" className="text-sm text-secondary-text">Belum ada area terdaftar; hubungi Pengelola Pesantren. Laporan belum dapat dikirim.</p> : null}
      <LaporForm
        values={values}
        errors={visibleErrors}
        registered={registered}
        areas={areas}
        areasEmpty={selectedHasNoAreas}
        readOnly={blocked}
        submitting={submitting}
        submitDisabled={blocked || submitting || !canSubmit}
        confirmCancel={confirmCancel}
        isPrefilledManager={isPrefilledManager}
        formError={formError}
        onChange={handleChange}
        onBlur={(field) => setTouched((t) => ({ ...t, [field]: true }))}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onConfirmCancel={() => {
          const scoped = !values.institutionCode || clearLaporDraft(values.institutionCode);
          const mirror = clearLaporDraft(null);
          if (scoped && mirror) navigate("/");
          else { setConfirmCancel(false); setFormError("Draft belum dapat dihapus. Periksa izin penyimpanan browser lalu coba lagi."); }
        }}
        onKeepEditing={() => setConfirmCancel(false)}
        registerField={(field, el) => {
          fieldRefs.current[field] = el;
        }}
      />
    </section>
  );
}
