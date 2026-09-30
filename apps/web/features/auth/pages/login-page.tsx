// `/login` — mode backend production memakai form email+sandi asli; mode dev
// (demo aktif) memakai 3 kartu akun satu klik. Tujuan setelah login diperiksa
// terhadap peran aktif (ROUTES §3).

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { DEMO_ACCOUNTS, type DemoAccount } from "~/shared/auth/demo-accounts";
import { repository, USE_BACKEND } from "~/shared/api/repository";
import { getServerAccount } from "~/shared/auth/auth-session";
import { resolveLoginRedirect } from "~/shared/auth/access-policy";
import { resolveLoginMode, type LoginMode } from "~/features/auth/lib/login-mode";

const inputCls =
  "min-h-12 w-full rounded-lg border border-line-soft bg-white px-3.5 text-sm outline-none transition placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15";

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
    <div className="min-h-dvh bg-app-bg lg:grid lg:grid-cols-[minmax(28rem,1.1fr)_minmax(30rem,0.9fr)]">
      <BrandPanel />
      <main className="flex min-h-dvh items-start justify-center px-4 py-5 sm:px-8 sm:py-10 lg:items-center lg:px-12 lg:py-12">
        <div className="w-full max-w-[30rem]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link to="/" className="secondary-button min-h-10 px-3 py-2 text-xs sm:text-sm">
              <ArrowLeft size={16} aria-hidden />
              Dashboard publik
            </Link>
            {mode ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-secondary-text">
                {mode === "demo" ? (
                  <ShieldCheck size={14} className="text-primary" />
                ) : (
                  <CheckCircle2 size={14} className="text-primary" />
                )}
                {mode === "demo" ? "Demo lokal" : "Akses aman"}
              </span>
            ) : null}
          </div>
          <section className="rounded-xl border border-line bg-white p-5 shadow-[0_16px_42px_rgb(15_23_42/6%)] sm:p-8" aria-labelledby="login-title">
            <div className="mb-7 border-b border-line pb-5">
              <p className="kicker">Akses ruang kerja</p>
              <h2 id="login-title" className="mt-1 text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                {mode === "demo" ? "Pilih akun demo" : "Masuk ke ruang kerja"}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-secondary-text">
                {mode === "demo"
                  ? "Gunakan akun simulasi sesuai peran untuk menjelajahi alur ISHAS."
                  : "Gunakan email dan kata sandi akun Anda untuk melanjutkan."}
              </p>
            </div>
            {error ? (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-[#b91c1c]"
              >
                {error}
              </p>
            ) : null}
            {mode === null ? (
              <p className="text-sm text-secondary-text" role="status">
                Memuat metode masuk...
              </p>
            ) : mode === "demo" ? (
              <DemoAccountList pending={pending} onSelect={loginDemo} />
            ) : (
              <PasswordLoginForm pending={pending} onSubmit={loginWithPassword} />
            )}
          </section>
          <p className="mt-5 text-center text-xs leading-relaxed text-secondary-text">
            Untuk pelapor: dashboard, laporan cepat, dan penilaian mandiri tersedia tanpa login.
          </p>
        </div>
      </main>
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      className="relative overflow-hidden bg-[#063a73] p-5 text-white sm:min-h-[15rem] sm:p-8 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:justify-between lg:p-12"
      style={{ background: "linear-gradient(145deg, #063A73, #0066CC, #007EFF)" }}
    >
      <div className="relative z-10 flex items-center justify-between gap-4 lg:block">
        <div className="w-[min(160px,50%)] rounded-lg bg-white p-2 shadow-2xl shadow-black/20 sm:w-[180px] sm:p-3">
          <img
            src="/brand/ishas-full-logo.png"
            alt="ISHAS — Integrated Safety and Health Assessment System"
            className="h-auto w-full"
            loading="eager"
          />
        </div>
        <span className="text-right text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/65 lg:mt-5 lg:block lg:text-left">
          K3L Pesantren
        </span>
      </div>
      <div className="relative z-10 mt-8 max-w-xl lg:mt-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/65">
          Sistem terintegrasi
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-[1.15] tracking-tight sm:text-3xl lg:text-4xl">
          Keselamatan yang dapat ditelusuri. Keputusan yang lebih terarah.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
          Satu ruang untuk pelaporan, validasi, penilaian mandiri, dan tindak lanjut K3L Pesantren.
        </p>
        <ul className="mt-7 hidden gap-3 sm:grid lg:mt-9">
          <StoryPoint
            icon={ClipboardCheck}
            title="Pelaporan terstruktur"
            description="Temuan terhubung ke kategori, lokasi, bukti, dan riwayat validasi."
          />
          <StoryPoint
            icon={Building2}
            title="Akses sesuai peran"
            description="Ruang kerja dipisahkan untuk Super Admin, Validator, dan Pesantren."
          />
        </ul>
      </div>
      <div className="relative z-10 mt-7 hidden border-t border-white/15 pt-5 text-xs font-semibold leading-relaxed text-white/65 lg:block">
        Dibuat oleh FarrelGhozy · Projek ISHAS 2026
      </div>
      <span className="absolute -bottom-36 -right-28 size-[30rem] rounded-full border border-white/10 bg-white/5" />
      <span className="absolute -right-16 top-20 size-64 rounded-full border border-white/10" />
    </div>
  );
}

function StoryPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10">
        <Icon size={18} aria-hidden />
      </span>
      <span>
        <strong className="block text-sm">{title}</strong>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/70">{description}</span>
      </span>
    </li>
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
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-fr gap-3">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.id}
            type="button"
            disabled={pending}
            className="surface group grid grid-cols-[2.75rem_minmax(0,1fr)_1.25rem] items-start gap-3 px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-border hover:bg-brand-bg hover:shadow-md disabled:opacity-60"
            onClick={() => void onSelect(acc.id, acc.roleId)}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white shadow-sm">
              {acc.initials}
            </span>
            <span className="min-w-0 self-stretch">
              <span className="block text-sm font-extrabold leading-5 text-heading">
                Masuk sebagai {acc.role}
              </span>
              <span className="mt-1 block text-sm leading-5 text-secondary-text">
                {acc.description}
              </span>
              <span className="mt-2 inline-flex max-w-full rounded-md bg-strip px-2 py-1 text-xs font-semibold leading-4 text-secondary-text">
                <span className="truncate">{acc.scope}</span>
              </span>
            </span>
            <ArrowRight
              size={15}
              className="text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        ))}
      </div>
      <p className="flex items-start gap-1.5 text-sm font-semibold text-secondary-text">
        <ShieldCheck size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        Bukan akun nyata; sesi demo disimpan di perangkat ini.
      </p>
    </div>
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
