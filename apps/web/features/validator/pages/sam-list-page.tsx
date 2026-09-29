// SAM-iSAFE: dashboard + riwayat pengamatan khusus Validator (D-26, D-26.e).
// Tidak tampil publik/Pesantren pada fase ini.

import { useMemo, useState } from "react";
import { ClipboardCheck, Database, Plus, Search } from "lucide-react";
import { Link } from "react-router";
import { selectRegisteredInstitutions } from "~/mocks/store/selectors";
import { useValidatorState } from "~/shared/api/validator-state";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { SamDashboard } from "../components/sam-dashboard";

function chipRisiko(risk: string): string {
  if (risk === "Risiko Rendah") return "Rendah";
  if (risk === "Risiko Sedang") return "Sedang";
  return "Tinggi";
}

export function Page() {
  const state = useValidatorState();
  const [risiko, setRisiko] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [cari, setCari] = useState("");
  const registered = selectRegisteredInstitutions(state);
  const namaPesantren = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of state.institutions) map.set(item.code, item.name);
    return map;
  }, [state.institutions]);
  const daftar = useMemo(() => {
    const keyword = cari.trim().toLowerCase();
    return [...state.samAssessments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((item) => (risiko === "Semua" ? true : item.riskLevel === risiko))
      .filter((item) => (status === "Semua" ? true : item.status === status))
      .filter((item) => {
        if (!keyword) return true;
        const nama = namaPesantren.get(item.institutionCode) ?? "";
        return `${item.id} ${nama} ${item.observerName}`.toLowerCase().includes(keyword);
      });
  }, [state.samAssessments, risiko, status, cari, namaPesantren]);

  return (
    <section className="flex flex-col gap-5">
      <header className="surface flex flex-wrap items-end gap-4 p-5 sm:p-6">
        <div className="mr-auto">
          <p className="kicker">
            Penilaian Validator
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-heading">
            <ClipboardCheck className="text-primary" size={25} />
            SAM-iSAFE
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Pengamatan keselamatan oleh Validator. Data ilustrasi, bukan ketentuan ilmiah final.
          </p>
        </div>
        <Link
          className="secondary-button"
          to="/validator/sam-isafe/bank"
        >
          <Database size={16} />
          Bank data
        </Link>
        <Link
          className="primary-button"
          to="/validator/sam-isafe/baru"
        >
          <Plus size={16} />
          Pengamatan baru
        </Link>
      </header>
      <SamDashboard
        assessments={state.samAssessments}
        followUps={state.samFollowUps}
        categories={state.samCategories}
        questions={state.samQuestions}
        institutions={state.institutions}
        registeredCount={registered.length}
      />
      <section className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-bold text-heading">Riwayat pengamatan</h2>
          <span className="text-xs text-secondary-text">{daftar.length} hasil</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
            Risiko
            <select
              className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
              value={risiko}
              onChange={(event) => setRisiko(event.target.value)}
            >
              <option value="Semua">
                Semua
              </option>
              <option value="Risiko Rendah">
                Risiko Rendah
              </option>
              <option value="Risiko Sedang">
                Risiko Sedang
              </option>
              <option value="Risiko Tinggi">
                Risiko Tinggi
              </option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
            Status
            <select
              className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Semua">
                Semua
              </option>
              <option value="Berlangsung">
                Berlangsung
              </option>
              <option value="Selesai">
                Selesai
              </option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
            Cari
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-faint" size={16} />
              <input
              className="min-h-11 w-full rounded-lg border border-line-soft bg-white pl-9 pr-3 text-base font-normal text-heading"
              placeholder="Kode, pesantren, pengamat"
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              />
            </div>
          </label>
        </div>
      </section>
      {daftar.length === 0 ? (
        <EmptyState
          title="Belum ada pengamatan"
          description="Buat pengamatan baru untuk mulai menilai."
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-line bg-strip px-4 py-2 text-xs font-bold text-secondary-text md:grid">
            <span>
              Pengamatan
            </span>
            <span>
              Status
            </span>
            <span>
              Risiko
            </span>
            <span>
              Aksi
            </span>
          </div>
          {daftar.map((item) => (
            <div
              className="grid gap-3 border-b border-line p-4 text-sm transition last:border-0 hover:bg-brand-bg/40 md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-3"
              key={item.id}
            >
              <div className="mr-auto">
                <strong className="text-heading">
                  <span className="text-base">{item.id}</span>
                  <span className="ml-2 rounded-full bg-brand-bg px-2 py-0.5 text-xs text-primary">{item.percent.toFixed(1)}%</span>
                </strong>
                <p className="mt-0.5 text-xs text-faint">
                  {namaPesantren.get(item.institutionCode) ?? item.institutionCode} ·{" "}
                  {item.observedAt} · {item.observerName}
                  {item.reviewedBy ? ` · Ditinjau ${item.reviewedBy}` : ""}
                </p>
              </div>
              <StatusChip value={item.status} />
              <StatusChip value={chipRisiko(item.riskLevel)} />
              <Link
                className="text-button"
                to={`/validator/sam-isafe/${item.id}`}
              >
                Detail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
