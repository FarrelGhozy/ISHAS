// Form satu langkah lapor-cepat — presentasional murni (FLOWS §2, WIREFRAMES §2).
// Urutan field tetap: Nama → Pesantren → Lokasi/area → Judul → Deskripsi → Foto → Kontak.
// Logika (draft, kirim, pesantren terpilih) tinggal di halaman; komponen ini hanya render.

import { AlertTriangle, Upload } from "lucide-react";
import { Modal } from "~/shared/components/modal";
import type { LaporErrors, LaporValues } from "../lib/lapor-validation";

export type AreaOption = { id: string; label: string };
export type InstitutionOption = { code: string; name: string };

type Props = {
  values: LaporValues;
  errors: LaporErrors;
  registered: InstitutionOption[];
  areas: AreaOption[];
  areasEmpty: boolean;
  readOnly: boolean;
  submitting: boolean;
  submitDisabled: boolean;
  confirmCancel: boolean;
  isPrefilledManager: boolean;
  formError: string | null;
  onChange: (field: keyof LaporValues, value: string) => void;
  onBlur: (field: keyof LaporValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onConfirmCancel: () => void;
  onKeepEditing: () => void;
  registerField: (field: keyof LaporValues, el: HTMLElement | null) => void;
};

const INPUT =
  "w-full min-w-0 min-h-11 rounded-[7px] border border-line-soft bg-white px-3 py-2 text-base text-heading placeholder:text-faint disabled:cursor-not-allowed disabled:bg-strip disabled:text-secondary-text";
const INPUT_ERROR = "border-[#b91c1c]";
const LABEL = "mb-1 block text-sm font-bold text-heading";
const HINT = "mt-1 text-sm text-secondary-text";
const ERROR = "mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#b91c1c]";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className={ERROR}>
      <AlertTriangle size={14} aria-hidden />{message}
    </p>
  );
}

export function LaporForm(props: Props) {
  const {
    values,
    errors,
    registered,
    areas,
    areasEmpty,
    readOnly,
    submitting,
    submitDisabled,
    confirmCancel,
    isPrefilledManager,
    formError,
  } = props;

  return (
    <form
      className="surface flex flex-col gap-4 p-4 sm:p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-[7px] border border-line bg-white px-3 py-2 text-base font-semibold text-[#b91c1c]"
        >
          {formError}
        </div>
      ) : null}

      <div>
        <label htmlFor="lapor-nama" className={LABEL}>
          Nama pelapor*
        </label>
        <input
          id="lapor-nama"
          required
          ref={(el) => props.registerField("reporterName", el)}
          className={`${INPUT} ${errors.reporterName ? INPUT_ERROR : ""}`}
          value={values.reporterName}
          disabled={readOnly}
          autoComplete="name"
          maxLength={100}
          aria-invalid={Boolean(errors.reporterName)}
          aria-describedby={`lapor-nama-hint${errors.reporterName ? " lapor-nama-error" : ""}`}
          onChange={(e) => props.onChange("reporterName", e.target.value)}
          onBlur={() => props.onBlur("reporterName")}
        />
        <p id="lapor-nama-hint" className={HINT}>
          {isPrefilledManager
            ? "Terisi otomatis dari akun Pengelola Pesantren — tetap dapat diubah. "
            : null}
          Nama selalu dicatat dan tampil apa adanya secara internal; tidak ditampilkan di
          dashboard publik.
        </p>
        {errors.reporterName ? (
          <FieldError id="lapor-nama-error" message={errors.reporterName} />
        ) : null}
      </div>

      <div>
        <label htmlFor="lapor-pesantren" className={LABEL}>
          Pesantren*
        </label>
        <select
          id="lapor-pesantren"
          required
          ref={(el) => props.registerField("institutionCode", el)}
          className={`${INPUT} ${errors.institutionCode ? INPUT_ERROR : ""}`}
          value={values.institutionCode}
          disabled={readOnly}
          aria-invalid={Boolean(errors.institutionCode)}
          aria-describedby={errors.institutionCode ? "lapor-pesantren-error" : undefined}
          onChange={(e) => props.onChange("institutionCode", e.target.value)}
          onBlur={() => props.onBlur("institutionCode")}
        >
          <option value="">Pilih pesantren</option>
          {registered.map((i) => (
            <option key={i.code} value={i.code}>
              {i.code} — {i.name}
            </option>
          ))}
        </select>
        {errors.institutionCode ? (
          <FieldError id="lapor-pesantren-error" message={errors.institutionCode} />
        ) : null}
      </div>

      <div>
        <label htmlFor="lapor-area" className={LABEL}>
          Lokasi/area*
        </label>
        <select
          id="lapor-area"
          required
          ref={(el) => props.registerField("areaId", el)}
          className={`${INPUT} ${errors.areaId ? INPUT_ERROR : ""}`}
          value={values.areaId}
          disabled={readOnly || areasEmpty || !values.institutionCode}
          aria-invalid={Boolean(errors.areaId)}
          aria-describedby={errors.areaId ? "lapor-area-error" : undefined}
          onChange={(e) => props.onChange("areaId", e.target.value)}
          onBlur={() => props.onBlur("areaId")}
        >
          <option value="">Pilih lokasi/area</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        {errors.areaId ? <FieldError id="lapor-area-error" message={errors.areaId} /> : null}
        <label htmlFor="lapor-lokasi-manual" className={`${LABEL} mt-3`}>
          Lokasi belum ada di daftar?
        </label>
        <input id="lapor-lokasi-manual" ref={(el) => props.registerField("manualLocation", el)} className={INPUT} value={values.manualLocation} disabled={readOnly || !values.institutionCode} maxLength={140} placeholder="Tulis lokasi lengkap" onChange={(e) => props.onChange("manualLocation", e.target.value)} onBlur={() => props.onBlur("manualLocation")} />
        <p className={HINT}>Pilih area bila tersedia. Bila belum ada, tulis lokasi ini; salah satu wajib diisi.</p>
      </div>

      <div>
        <label htmlFor="lapor-judul" className={LABEL}>
          Judul temuan*
        </label>
        <input
          id="lapor-judul"
          required
          ref={(el) => props.registerField("title", el)}
          className={`${INPUT} ${errors.title ? INPUT_ERROR : ""}`}
          value={values.title}
          disabled={readOnly}
          maxLength={140}
          placeholder="Contoh: Kabel terbuka di koridor lantai 2"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "lapor-judul-error" : undefined}
          onChange={(e) => props.onChange("title", e.target.value)}
          onBlur={() => props.onBlur("title")}
        />
        {errors.title ? <FieldError id="lapor-judul-error" message={errors.title} /> : null}
      </div>

      <div>
        <label htmlFor="lapor-deskripsi" className={LABEL}>
          Deskripsi*
        </label>
        <textarea
          id="lapor-deskripsi"
          required
          ref={(el) => props.registerField("description", el)}
          className={`${INPUT} min-h-24 ${errors.description ? INPUT_ERROR : ""}`}
          value={values.description}
          disabled={readOnly}
          rows={4}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={`lapor-deskripsi-hint${errors.description ? " lapor-deskripsi-error" : ""}`}
          onChange={(e) => props.onChange("description", e.target.value)}
          onBlur={() => props.onBlur("description")}
        />
        <p id="lapor-deskripsi-hint" className={HINT}>
          Tulis apa, di mana tepatnya, sejak kapan, siapa terdampak.
        </p>
        {errors.description ? (
          <FieldError id="lapor-deskripsi-error" message={errors.description} />
        ) : null}
      </div>

      <div>
        <label htmlFor="lapor-foto" className={LABEL}>
          <span className="inline-flex items-center gap-1">
            <Upload size={12} aria-hidden />
            Foto
          </span>
        </label>
        <input
          id="lapor-foto"
          ref={(el) => props.registerField("evidenceName", el)}
          className={INPUT}
          value={values.evidenceName}
          disabled={readOnly}
          placeholder="contoh: koridor.jpg"
          aria-describedby="lapor-foto-hint"
          onChange={(e) => props.onChange("evidenceName", e.target.value)}
          onBlur={() => props.onBlur("evidenceName")}
        />
        <p id="lapor-foto-hint" className={HINT}>
          Opsional · tersimpan sebagai nama file pada prototipe.
        </p>
      </div>

      <div>
        <label htmlFor="lapor-kontak" className={LABEL}>
          Kontak
        </label>
        <input
          id="lapor-kontak"
          ref={(el) => props.registerField("contact", el)}
          className={`${INPUT} ${errors.contact ? INPUT_ERROR : ""}`}
          value={values.contact}
          disabled={readOnly}
          maxLength={100}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={`lapor-kontak-hint${errors.contact ? " lapor-kontak-error" : ""}`}
          onChange={(e) => props.onChange("contact", e.target.value)}
          onBlur={() => props.onBlur("contact")}
        />
        <p id="lapor-kontak-hint" className={HINT}>
          Opsional · maks 100 karakter (untuk klarifikasi).
        </p>
        {errors.contact ? (
          <FieldError id="lapor-kontak-error" message={errors.contact} />
        ) : null}
      </div>

      {!readOnly && submitDisabled ? <p className="text-sm text-secondary-text">Lengkapi nama (minimal 2 karakter), pesantren, area, judul (minimal 10 karakter), dan deskripsi (minimal 20 karakter) untuk mengirim.</p> : null}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="submit" className="primary-button" disabled={submitDisabled}>
          {submitting ? "Mengirim…" : "Kirim laporan"}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={submitting}
          onClick={props.onCancel}
        >
          Batal
        </button>
      </div>

      <Modal open={confirmCancel} onClose={props.onKeepEditing} label="Buang draft laporan?">
          <p className="text-xs font-bold text-heading">Buang perubahan?</p>
          <p className="mt-1 text-sm text-secondary-text">
            Perubahan yang belum dikirim akan hilang.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="secondary-button" onClick={props.onConfirmCancel}>
              Ya, batalkan
            </button>
            <button type="button" className="primary-button" onClick={props.onKeepEditing}>
              Lanjutkan mengisi
            </button>
          </div>
      </Modal>
    </form>
  );
}
