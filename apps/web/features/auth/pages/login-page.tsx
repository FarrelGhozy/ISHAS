// `/login` — panel kiri gradien marun + 3 kartu akun (tanpa asesor).
// Login menunjuk ID akun; tujuan setelah login diperiksa terhadap peran aktif (ROUTES §3).

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { DEMO_ACCOUNTS } from "~/shared/auth/demo-accounts";
import { sessionStore } from "~/shared/auth/session";
import { IshasMark } from "~/shared/components/ishas-mark";
import { resolveLoginRedirect } from "~/shared/auth/access-policy";

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  function login(accountId: string, roleId: (typeof DEMO_ACCOUNTS)[number]["roleId"]) {
    try { sessionStore.login(accountId); } catch {
      setError("Sesi tidak dapat disimpan. Izinkan penyimpanan browser lalu coba lagi.");
      return;
    }
    navigate(resolveLoginRedirect(redirectTo, roleId), { replace: true });
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div
        className="hidden flex-col justify-between p-10 text-white lg:flex"
        style={{ background: "linear-gradient(145deg, #3f0710, #6d0c18, #9f1239)" }}
      >
        <IshasMark inverse variant="login" />
        <div>
          <h1 className="text-2xl font-extrabold leading-snug">
            Penilaian Keselamatan, Kesehatan
            <br />
            Kerja, dan Lingkungan Pesantren
          </h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-white/80">
            Laporan publik divalidasi pengelola pondok sebelum tampil di dashboard. Instrumen
            berversi; seluruh angka pada prototipe adalah data ilustrasi.
          </p>
        </div>
        <span className="text-sm font-semibold text-white/70">
          Prototipe frontend · data dummy · tanpa kata sandi nyata
        </span>
      </div>
      <div className="flex flex-col justify-center gap-5 bg-app-bg px-6 py-12">
        <Link to="/" className="secondary-button self-start">
          <ArrowLeft size={16} aria-hidden />
          Dashboard publik
        </Link>
        <div>
          <p className="kicker">Masuk</p>
          <h2 className="text-lg font-extrabold text-heading">Pilih akun demo</h2>
          <p className="mt-1 text-sm text-secondary-text">
            Tiga peran login. Pelapor publik tidak perlu masuk — cukup buka dashboard.
          </p>
        </div>
        {error ? <p role="alert" className="text-sm text-[#b91c1c]">{error}</p> : null}
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.id}
            type="button"
            className="surface flex items-center gap-3 px-4 py-3 text-left transition hover:border-marun-border hover:bg-marun-bg"
            onClick={() => login(acc.id, acc.roleId)}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
              {acc.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold text-heading">
                Masuk sebagai {acc.role}
              </span>
              <span className="block text-sm text-secondary-text">
                {acc.description}
              </span>
              <span className="block text-xs font-semibold text-secondary-text">{acc.scope}</span>
            </span>
            <ArrowRight size={15} className="text-primary" aria-hidden />
          </button>
        ))}
        <p className="flex items-start gap-1.5 text-sm font-semibold text-secondary-text">
          <ShieldCheck size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          Bukan akun nyata; sesi demo disimpan di perangkat ini.
        </p>
      </div>
    </div>
  );
}
