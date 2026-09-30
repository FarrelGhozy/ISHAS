// `/login` — mode backend production memakai form email+sandi asli; mode dev
// (demo aktif) memakai 3 kartu akun satu klik. Tujuan setelah login diperiksa
// terhadap peran aktif (ROUTES §3).

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { DEMO_ACCOUNTS, type DemoAccount } from "~/shared/auth/demo-accounts";
import { repository, USE_BACKEND } from "~/shared/api/repository";
import { getServerAccount } from "~/shared/auth/auth-session";
import { resolveLoginRedirect } from "~/shared/auth/access-policy";
import { resolveLoginMode, type LoginMode } from "~/features/auth/lib/login-mode";

const inputCls = "min-h-11 w-full rounded border border-line-soft px-3";

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  // Tanyakan metode yang tersedia; kartu demo hanya tampil bila server
  // mengizinkannya (non-production). Gagal memuat → form sandi (aman).
  useEffect(() => {
    let active = true;
    void repository.authMethods().then((methods) => {
      if (active) setMode(resolveLoginMode(USE_BACKEND, methods));
    });
    return () => {
      active = false;
    };
  }, []);

  function goAfterLogin(roleId: DemoAccount["roleId"]) {
    navigate(resolveLoginRedirect(redirectTo, roleId), { replace: true });
  }

  async function loginDemo(accountId: string, roleId: DemoAccount["roleId"]) {
    setPending(true);
    setError(null);
    try {
      const result = await repository.demoLogin(accountId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      goAfterLogin(roleId);
    } catch {
      setError("Sesi tidak dapat disimpan. Izinkan penyimpanan browser lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function loginWithPassword(event: FormEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setPending(true);
    setError(null);
    try {
      const result = await repository.login(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const account = getServerAccount();
      if (!account) throw new Error("Akun tidak terbaca.");
      goAfterLogin(account.roleId);
    } catch {
      setError("Sesi tidak dapat disimpan. Muat ulang halaman lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel />
      <div className="flex flex-col justify-center gap-5 bg-app-bg px-6 py-12">
        <Link to="/" className="secondary-button self-start">
          <ArrowLeft size={16} aria-hidden />
          Dashboard publik
        </Link>
        <div>
          <p className="kicker">Masuk</p>
          <h2 className="text-lg font-extrabold text-heading">
            {mode === "demo" ? "Pilih akun demo" : "Masuk ke ruang kerja"}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {mode === "demo"
              ? "Tiga peran login. Pelapor publik tidak perlu masuk — cukup buka dashboard."
              : "Gunakan email dan kata sandi akun Anda. Pelapor publik tidak perlu masuk — cukup buka dashboard."}
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-[#b91c1c]">
            {error}
          </p>
        ) : null}
        {mode === null ? (
          <p className="text-sm text-secondary-text" role="status">
            Memuat metode masuk…
          </p>
        ) : mode === "demo" ? (
          <DemoAccountList pending={pending} onSelect={loginDemo} />
        ) : (
          <PasswordLoginForm pending={pending} onSubmit={loginWithPassword} />
        )}
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      className="hidden flex-col justify-between p-10 text-white lg:flex"
      style={{ background: "linear-gradient(145deg, #063A73, #0066CC, #007EFF)" }}
    >
      <div className="w-[min(180px,55%)] rounded-xl bg-white p-3 shadow-2xl shadow-black/20">
        <img
          src="/brand/ishas-full-logo.png"
          alt="ISHAS — Integrated Safety and Health Assessment System"
          className="h-auto w-full"
          loading="eager"
        />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold leading-snug">
          Penilaian Keselamatan, Kesehatan
          <br />
          Kerja, dan Lingkungan Pesantren
        </h1>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-white/80">
          Laporan cepat divalidasi akun Pesantren; penilaian mandiri langsung terbit.
        </p>
      </div>
      <span className="text-sm font-semibold text-white/70">
        Dibuat oleh FarrelGhozy · Projek ISHAS 2026
      </span>
    </div>
  );
}

function DemoAccountList({
  pending,
  onSelect,
}: {
  pending: boolean;
  onSelect: (accountId: string, roleId: DemoAccount["roleId"]) => void;
}) {
  return (
    <>
      {DEMO_ACCOUNTS.map((acc) => (
        <button
          key={acc.id}
          type="button"
          disabled={pending}
          className="surface flex items-center gap-3 px-4 py-3 text-left transition hover:border-brand-border hover:bg-brand-bg disabled:opacity-60"
          onClick={() => void onSelect(acc.id, acc.roleId)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
            {acc.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold text-heading">
              Masuk sebagai {acc.role}
            </span>
            <span className="block text-sm text-secondary-text">{acc.description}</span>
            <span className="block text-xs font-semibold text-secondary-text">{acc.scope}</span>
          </span>
          <ArrowRight size={15} className="text-primary" aria-hidden />
        </button>
      ))}
      <p className="flex items-start gap-1.5 text-sm font-semibold text-secondary-text">
        <ShieldCheck size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        Bukan akun nyata; sesi demo disimpan di perangkat ini.
      </p>
    </>
  );
}

function PasswordLoginForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-heading">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputCls}
          placeholder="nama@pesantren.id"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-heading">
        Kata sandi
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className={inputCls}
          placeholder="••••••••"
        />
      </label>
      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Memproses…" : "Masuk"}
        <ArrowRight size={16} aria-hidden />
      </button>
      <p className="flex items-start gap-1.5 text-sm text-secondary-text">
        <ShieldCheck size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        Sesi disimpan sebagai cookie aman di perangkat ini.
      </p>
    </form>
  );
}
