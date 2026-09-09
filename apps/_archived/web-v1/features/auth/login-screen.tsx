'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/shared/auth/auth-store';
import { demoAccounts } from '@/shared/auth/demo-accounts';
import { IshasMark } from '@/shared/components/ishas-mark';
import { getWorkspacePath } from '@/shared/navigation/workspace-config';
import landingStyles from '@/features/landing/landing-page.module.css';

export function LoginScreen() {
  const router = useRouter();
  const { account, ready, signIn, signInAs } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && account) {
      router.replace(getWorkspacePath(account.role));
    }
  }, [account, ready, router]);

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const matched = signIn(email, password);
    if (!matched) {
      setError('Email atau kata sandi demo tidak sesuai.');
      return;
    }
    setError('');
    router.replace(getWorkspacePath(matched.role));
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story-inner">
          <IshasMark inverse variant="login" />
          <div className="login-copy">
            <span className="stage-chip">
              <Sparkles /> Prototipe validasi fitur
            </span>
            <h1>
              Assessment K3L pesantren yang terstruktur dan dapat ditelusuri.
            </h1>
            <p>
              Dari penyusunan instrumen ilmiah, assessment lapangan, hingga
              rekomendasi tindak lanjut dalam satu alur kerja yang dapat
              diaudit.
            </p>
          </div>
          <div className="role-flow" aria-label="Alur empat peran ISHAS">
            {demoAccounts.map(({ role, roleLabel, Icon }, index) => (
              <div className="role-flow-item" key={role}>
                <span>
                  <Icon />
                </span>
                <div>
                  <small>0{index + 1}</small>
                  <b>{roleLabel}</b>
                </div>
              </div>
            ))}
          </div>
          <p className="prototype-note">
            Data dan skor pada prototipe ini hanya untuk memvalidasi tampilan.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Link className={landingStyles.loginBack} href="/">
            <ArrowLeft aria-hidden="true" /> Kembali ke beranda
          </Link>
          <div className="mobile-logo">
            <IshasMark variant="login" />
          </div>
          <p className="section-kicker">Selamat datang</p>
          <h2>Masuk ke ISHAS</h2>
          <p className="login-intro">
            Gunakan akun demo atau pilih akses cepat sesuai peran yang ingin
            diperiksa.
          </p>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <div className="input-shell">
              <Mail />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@ishas.demo"
                autoComplete="username"
              />
            </div>
            <div className="label-row">
              <label htmlFor="password">Kata sandi</label>
              <span>Semua akun: demo1234</span>
            </div>
            <div className="input-shell">
              <LockKeyhole />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={
                  showPassword
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                }
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="primary-button login-submit" type="submit">
              Masuk ke ruang kerja <ArrowRight />
            </button>
          </form>

          <div className="divider">
            <span>Akses cepat akun demo</span>
          </div>
          <div className="demo-grid">
            {demoAccounts.map((demoAccount) => (
              <button
                className="demo-account"
                key={demoAccount.role}
                type="button"
                onClick={() => {
                  const matched = signInAs(demoAccount.role);
                  router.replace(getWorkspacePath(matched.role));
                }}
              >
                <span className="demo-icon">
                  <demoAccount.Icon />
                </span>
                <span>
                  <b>Masuk sebagai {demoAccount.roleLabel}</b>
                  <small>{demoAccount.responsibility}</small>
                </span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>
        <footer className="login-footer">
          <span>ISHAS Prototype v0.1</span>
          <i aria-hidden="true" />
          <span>Data dummy</span>
          <i aria-hidden="true" />
          <span>Akses berbasis peran</span>
        </footer>
      </section>
    </main>
  );
}
