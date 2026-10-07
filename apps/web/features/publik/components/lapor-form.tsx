// Form satu langkah lapor-cepat — presentasional murni (FLOWS §2, WIREFRAMES §2, D-19, D-29, D-47).
// Urutan field tetap: Nama → Pesantren → Lokasi/area → Kategori/Aspek → Deskripsi temuan
// (opsional) → Usulan mandiri (keparahan + prioritas + rekomendasi) → Foto → Kontak.
// Tanpa field Judul (otomatis dari deskripsi/lokasi).
// Logika (draft, kirim, pesantren terpilih) tinggal di halaman; komponen ini hanya render.

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Modal } from "~/shared/components/modal";
import type { LaporErrors, LaporValues } from "../lib/lapor-validation";

export type AreaOption = { id: string; label: string };
export type InstitutionOption = { code: string; name: string };
export type KategoriOption = { id: string; name: string };

type Props = {
  locationPicker?: ReactNode;
  evidencePicker: ReactNode;
  values: LaporValues;
  errors: LaporErrors;
  registered: InstitutionOption[];
  areas: AreaOption[];
  areasEmpty: boolean;
  categories: KategoriOption[];
  aspects: KategoriOption[];
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
      <AlertTriangle size={14} aria-hidden />
      {message}
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
            ? "Terisi otomatis dari akun Pesantren — tetap dapat diubah. "
            : null}
          Nama selalu dicatat dan tampil apa adanya secara internal; tidak ditampilkan di dashboard
          publik.
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
        <input
          id="lapor-lokasi-manual"
          ref={(el) => props.registerField("manualLocation", el)}
          className={INPUT}
          value={values.manualLocation}
          disabled={readOnly || !values.institutionCode}
          maxLength={140}
          placeholder="Tulis lokasi lengkap"
          onChange={(e) => props.onChange("manualLocation", e.target.value)}
          onBlur={() => props.onBlur("manualLocation")}
        />
        <p className={HINT}>
          Pilih area bila tersedia. Bila belum ada, tulis lokasi ini; salah satu wajib diisi.
        </p>
      </div>

      {props.locationPicker}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lapor-kategori" className={LABEL}>
            Kategori K3
          </label>
          <select
            id="lapor-kategori"
            ref={(el) => props.registerField("categoryId", el)}
            className={`${INPUT} ${errors.categoryId ? INPUT_ERROR : ""}`}
            value={values.categoryId}
            disabled={readOnly}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? "lapor-kategori-error" : undefined}
            onChange={(e) => props.onChange("categoryId", e.target.value)}
            onBlur={() => props.onBlur("categoryId")}
          >
            <option value="">Pilih kategori (opsional)</option>
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <FieldError id="lapor-kategori-error" message={errors.categoryId} />
          ) : null}
        </div>
        <div>
          <label htmlFor="lapor-aspek" className={LABEL}>
            Aspek
          </label>
          <select
            id="lapor-aspek"
            ref={(el) => props.registerField("aspectId", el)}
            className={`${INPUT} ${errors.aspectId ? INPUT_ERROR : ""}`}
            value={values.aspectId}
            disabled={readOnly || !values.categoryId}
            aria-invalid={Boolean(errors.aspectId)}
            aria-describedby={errors.aspectId ? "lapor-aspek-error" : undefined}
            onChange={(e) => props.onChange("aspectId", e.target.value)}
            onBlur={() => props.onBlur("aspectId")}
          >
            <option value="">
              {values.categoryId ? "Pilih aspek (opsional)" : "Pilih kategori dahulu"}
            </option>
            {props.aspects.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.aspectId ? <FieldError id="lapor-aspek-error" message={errors.aspectId} /> : null}
        </div>
      </div>
      <p className={HINT}>
        Opsional: memilih kategori memfilter aspek. Usulan di bawah ini membantu akun Pesantren;
        keputusan final tetap ditentukan saat validasi.
      </p>
      <div>
        <label htmlFor="lapor-deskripsi" className={LABEL}>
          Deskripsi temuan
        </label>
        <textarea
          id="lapor-deskripsi"
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
          Opsional · tulis apa, di mana tepatnya, sejak kapan, siapa terdampak.
        </p>
        {errors.description ? (
          <FieldError id="lapor-deskripsi-error" message={errors.description} />
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lapor-usulan-severity" className={LABEL}>
            Tingkat keparahan (usulan mandiri)
          </label>
          <select
            id="lapor-usulan-severity"
            ref={(el) => props.registerField("reporterSeverity", el)}
            className={`${INPUT} ${errors.reporterSeverity ? INPUT_ERROR : ""}`}
            value={values.reporterSeverity}
            disabled={readOnly}
            aria-invalid={Boolean(errors.reporterSeverity)}
            aria-describedby={
              errors.reporterSeverity ? "lapor-usulan-severity-error" : undefined
            }
            onChange={(e) => props.onChange("reporterSeverity", e.target.value)}
            onBlur={() => props.onBlur("reporterSeverity")}
          >
            <option>Belum ditentukan</option>
            <option>Tinggi</option>
            <option>Sedang</option>
            <option>Rendah</option>
          </select>
          {errors.reporterSeverity ? (
            <FieldError
              id="lapor-usulan-severity-error"
              message={errors.reporterSeverity}
            />
          ) : null}
        </div>
        <div>
          <label htmlFor="lapor-usulan-priority" className={LABEL}>
            Prioritas perbaikan (usulan mandiri)
          </label>
          <select
            id="lapor-usulan-priority"
            ref={(el) => props.registerField("reporterPriority", el)}
            className={`${INPUT} ${errors.reporterPriority ? INPUT_ERROR : ""}`}
            value={values.reporterPriority}
            disabled={readOnly}
            aria-invalid={Boolean(errors.reporterPriority)}
            aria-describedby={
              errors.reporterPriority ? "lapor-usulan-priority-error" : undefined
            }
            onChange={(e) => props.onChange("reporterPriority", e.target.value)}
            onBlur={() => props.onBlur("reporterPriority")}
          >
            <option>Belum ditentukan</option>
            <option>Tinggi</option>
            <option>Sedang</option>
            <option>Rendah</option>
          </select>
          {errors.reporterPriority ? (
            <FieldError
              id="lapor-usulan-priority-error"
              message={errors.reporterPriority}
            />
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="lapor-usulan-rekomendasi" className={LABEL}>
          Usulan rekomendasi tindakan (opsional)
        </label>
        <textarea
          id="lapor-usulan-rekomendasi"
          ref={(el) => props.registerField("reporterRecommendation", el)}
          className={`${INPUT} min-h-20 ${errors.reporterRecommendation ? INPUT_ERROR : ""}`}
          value={values.reporterRecommendation}
          disabled={readOnly}
          rows={3}
          maxLength={500}
          placeholder="Contoh: Amankan kabel dengan pelindung lalu jadwalkan perbaikan instalasi."
          aria-invalid={Boolean(errors.reporterRecommendation)}
          aria-describedby={`lapor-usulan-rekomendasi-hint${errors.reporterRecommendation ? " lapor-usulan-rekomendasi-error" : ""}`}
          onChange={(e) => props.onChange("reporterRecommendation", e.target.value)}
          onBlur={() => props.onBlur("reporterRecommendation")}
        />
        <p id="lapor-usulan-rekomendasi-hint" className={HINT}>
          Opsional · bila diisi minimal 10 karakter. Usulan ini ditinjau Pesantren; yang tampil
          publik adalah versi final setelah validasi.
        </p>
        {errors.reporterRecommendation ? (
          <FieldError
            id="lapor-usulan-rekomendasi-error"
            message={errors.reporterRecommendation}
          />
        ) : null}
      </div>
      {props.evidencePicker}

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
        {errors.contact ? <FieldError id="lapor-kontak-error" message={errors.contact} /> : null}
      </div>

      {!readOnly && submitDisabled ? (
        <p className="text-sm text-secondary-text">
          Lengkapi nama (minimal 2 karakter), pesantren, dan area/lokasi untuk mengirim.
        </p>
      ) : null}
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
