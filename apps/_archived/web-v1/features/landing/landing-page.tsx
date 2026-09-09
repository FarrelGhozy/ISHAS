'use client';

import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  ListChecks,
  MapPinned,
  ShieldCheck,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuthStore } from '@/shared/auth/auth-store';
import { demoAccounts } from '@/shared/auth/demo-accounts';
import { IshasMark } from '@/shared/components/ishas-mark';
import { getWorkspacePath } from '@/shared/navigation/workspace-config';
import styles from './landing-page.module.css';

export function LandingPage() {
  const { account, ready } = useAuthStore();
  const activeAccount = ready ? account : null;
  const entryPath = activeAccount
    ? getWorkspacePath(activeAccount.role)
    : '/login';
  const entryLabel = activeAccount ? 'Buka ruang kerja' : 'Masuk ke ISHAS';
  const primaryClass = `${buttonVariants()} ${styles.primaryLink}`;

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#konten-utama">
        Lewati navigasi
      </a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="ISHAS — Beranda">
            <IshasMark />
          </Link>
          <nav className={styles.navigation} aria-label="Navigasi pengenalan">
            <a href="#tentang">Tentang ISHAS</a>
            <a href="#peran">Peran pengguna</a>
            <a href="#alur">Alur penggunaan</a>
          </nav>
          <div className={styles.accountActions}>
            {activeAccount && (
              <div className={styles.account}>
                <b>{activeAccount.name}</b>
                <span>{activeAccount.roleLabel}</span>
              </div>
            )}
            <Link className={primaryClass} href={entryPath}>
              {activeAccount ? 'Ruang kerja' : 'Masuk'}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="konten-utama" tabIndex={-1}>
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="hero-title"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" /> PLATFORM ASSESSMENT K3L PESANTREN
            </p>
            <h1 id="hero-title">
              Kenali risikonya.
              <br />
              <em>Wujudkan pesantren yang lebih aman.</em>
            </h1>
            <p className={styles.heroDescription}>
              ISHAS membantu penilaian keselamatan, kesehatan kerja, dan
              lingkungan (K3L) pesantren secara terstruktur. Hubungkan bukti
              lapangan dengan hasil penilaian dan langkah perbaikan yang jelas.
            </p>
            <div className={styles.heroActions}>
              <Link className={primaryClass} href={entryPath}>
                {entryLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <a className={styles.textLink} href="#alur">
                Pelajari alurnya <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <p className={styles.demoNote}>
              <ShieldCheck aria-hidden="true" />
              Prototipe penelitian · Menggunakan data dummy
            </p>
          </div>

          <aside className={styles.overview} aria-labelledby="overview-title">
            <div className={styles.overviewTop}>
              <span>KENALI ISHAS</span>
              <span className={styles.prototypeBadge}>Prototipe</span>
            </div>
            <h2 id="overview-title">Dari temuan ke perbaikan.</h2>
            <p>Satu alur yang saling terhubung dan dapat ditelusuri.</p>
            <ol className={styles.journey}>
              <li>
                <span className={styles.journeyIcon}>
                  <ClipboardCheck aria-hidden="true" />
                </span>
                <div>
                  <h3>Assessment berbasis instrumen</h3>
                  <p>Indikator, lokasi, dan bukti lapangan.</p>
                </div>
              </li>
              <li>
                <span className={styles.journeyIcon}>
                  <MapPinned aria-hidden="true" />
                </span>
                <div>
                  <h3>Hasil dan pemetaan risiko</h3>
                  <p>Kenali temuan serta area yang perlu perhatian.</p>
                </div>
              </li>
              <li>
                <span className={styles.journeyIcon}>
                  <ListChecks aria-hidden="true" />
                </span>
                <div>
                  <h3>Tindak lanjut yang terarah</h3>
                  <p>Rekomendasi, penanggung jawab, dan progres.</p>
                </div>
              </li>
            </ol>
            <div className={styles.overviewFoot}>
              <FileCheck2 aria-hidden="true" />
              <span>
                Versi instrumen dan bukti menjadi bagian dari jejak assessment.
              </span>
            </div>
          </aside>
        </section>

        <section
          id="tentang"
          className={styles.about}
          aria-labelledby="about-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <p className={styles.eyebrow}>TENTANG ISHAS</p>
                <h2 id="about-title">
                  Dasar yang lebih jelas
                  <br />
                  untuk langkah yang lebih tepat.
                </h2>
              </div>
              <p>
                Integrated Safety &amp; Health Assessment System dirancang untuk
                mendukung siklus penilaian K3L pesantren: menyusun instrumen,
                mengumpulkan data, membaca hasil, dan memantau perbaikan.
              </p>
            </div>
            <div className={styles.benefits}>
              <article>
                <Layers3 aria-hidden="true" />
                <h3>Penilaian yang terstruktur</h3>
                <p>
                  Instrumen berversi membantu menjaga konteks setiap assessment
                  dan konsistensi pengumpulan data.
                </p>
              </article>
              <article>
                <MapPinned aria-hidden="true" />
                <h3>Risiko yang mudah dipahami</h3>
                <p>
                  Hasil per dimensi, lokasi temuan, dan peta risiko membantu
                  pengelola memahami kondisi pesantren.
                </p>
              </article>
              <article>
                <ListChecks aria-hidden="true" />
                <h3>Perbaikan yang dapat dipantau</h3>
                <p>
                  Rekomendasi diteruskan menjadi rencana tindak lanjut dengan
                  penanggung jawab, tenggat, dan bukti penyelesaian.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="peran"
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="roles-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>PERAN PENGGUNA</p>
            <h2 id="roles-title">Empat peran. Satu tujuan bersama.</h2>
            <p>
              Setiap peran memiliki ruang kerja dan tanggung jawab yang jelas.
            </p>
          </div>
          <div className={styles.roles}>
            {demoAccounts.map(({ role, roleLabel, responsibility, Icon }) => (
              <article key={role}>
                <span className={styles.roleIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <h3>{roleLabel}</h3>
                <p>{responsibility}</p>
              </article>
            ))}
          </div>
          <p className={styles.roleNote}>
            Masuk dengan akun sesuai peran Anda. Untuk mencoba peran lain pada
            demo, keluar terlebih dahulu lalu masuk dengan akun lain.
          </p>
        </section>

        <section
          id="alur"
          className={`${styles.container} ${styles.workflow}`}
          aria-labelledby="flow-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>ALUR PENGGUNAAN</p>
            <h2 id="flow-title">
              Mulai dari persiapan, lanjutkan dengan perbaikan.
            </h2>
            <p>Kenali tahapan utama sebelum menjelajahi ruang kerja Anda.</p>
          </div>
          <ol className={styles.steps}>
            <li>
              <span>01</span>
              <h3>Siapkan penilaian</h3>
              <p>
                Admin menyiapkan lembaga dan akun, Peneliti menyusun instrumen,
                serta Pengelola melengkapi lokasi pesantren.
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>Lakukan assessment</h3>
              <p>
                Asesor membuka penugasan, mengisi indikator dan bukti, lalu
                meninjau kelengkapan sebelum finalisasi.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Pahami hasilnya</h3>
              <p>
                Pengelola membaca hasil assessment, menelusuri temuan risiko,
                dan melihat rekomendasi prioritas.
              </p>
            </li>
            <li>
              <span>04</span>
              <h3>Pantau tindak lanjut</h3>
              <p>
                Pengelola menyusun rencana perbaikan, menentukan penanggung
                jawab, dan memperbarui progres serta bukti.
              </p>
            </li>
          </ol>
        </section>

        <section className={styles.closing} aria-labelledby="start-title">
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div>
              <p className={styles.eyebrow}>JELAJAHI PROTOTIPE</p>
              <h2 id="start-title">Kenali alurnya. Coba ruang kerjanya.</h2>
              <p>
                {activeAccount
                  ? 'Lanjutkan eksplorasi dengan akun aktif Anda.'
                  : 'Halaman login menyediakan akun demo untuk keempat peran.'}
              </p>
            </div>
            <Link className={primaryClass} href={entryPath}>
              {entryLabel}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        <div>
          <IshasMark />
          <p>Assessment K3L untuk lingkungan pesantren.</p>
        </div>
        <p>
          ISHAS masih dalam tahap validasi tampilan dan alur. Data, skor, dan
          kategori pada demo merupakan ilustrasi, bukan hasil penelitian atau
          ketentuan ilmiah final.
        </p>
        <a className={styles.textLink} href="#konten-utama">
          Kembali ke atas ↑
        </a>
      </footer>
    </div>
  );
}
