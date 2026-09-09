# Stage V2-03 — Laporan Cepat `/lapor`

**Status:** IN PROGRESS
**Catatan review:** diaktifkan eksplisit oleh pemilik pada sesi 8 September 2026 ("kerjakan
stage 3"). D-02/D-03 telah dijawab (8 September 2026): tanpa opsi anonim; kirim hanya publik +
pengelola; Super Admin/Peneliti kirim nonaktif. Jawaban sesi ini: D-11 interim = kunci kirim +
pesan hubungi pengelola bila area kosong (mengikuti FLOWS §2; keputusan final D-11 tetap
menunggu); draft interim = satu draft per pesantren di perangkat, bertahan setelah logout/ganti
akun (cermin `ishas-draft-v2:lapor:*`; kebijakan final D-10 tetap menunggu).
Dialog `/lapor` dari `/` bersifat opsional ("dapat") — sesi ini membangun halaman kanonis
`/lapor` saja; CTA dashboard tetap menaut ke URL kanonis.
**Dependensi:** V2-01 `DONE` (model + seed + area), V2-02 disarankan (CTA sudah ada).
**Tujuan:** form laporan satu langkah yang bisa dikirim tanpa login maupun saat login pengelola,
dengan validasi ketat dan layar sukses bernomor — tanpa pernah tampil langsung di dashboard.

## Ruang lingkup

### 1. Form (satu langkah, tanpa wizard; urutan field tetap)

- [x] Nama pelapor* (2–100 karakter, tanpa opsi anonim — D-02) + penjelasan penyimpanan nama.
  Bila login pengelola: terisi otomatis `nama akun` + label peran; tetap editable.
  Bila login Super Admin/Peneliti: kirim nonaktif + pesan keluar dari akun (D-03).
- [x] Pesantren* (dropdown HANYA terdaftar, `kode — nama`; tidak ada isi manual).
- [x] Lokasi/area* (dropdown area milik pesantren terpilih; kosong → pesan hubungi pengelola, submit dikunci).
- [x] Judul temuan* (10–140) + Deskripsi* (min 20 + hint 4 pertanyaan panduan) +
  Foto (opsional, nama file dummy) + Kontak (opsional, maks 100).
- [x] Error inline per field dengan kalimat persis `WIREFRAMES.md` §2; tombol **Kirim laporan**
  (`primary-button`) disabled sampai semua wajib valid; **Batal** dengan konfirmasi bila sudah mengetik.
- [x] `/lapor` sebagai halaman dengan URL kanonis tetap `/lapor`
  (mendukung `?pesantren=PSN-XXXX`; param tak valid menampilkan pesan dan memerlukan pilihan terdaftar yang eksplisit, bukan penggantian tujuan diam-diam).
  Varian dialog dari `/` tidak dibangun sesi ini (opsional pada rancangan).

### 2. Pengiriman dan jejak

- [x] Sukses → `submitPublicReport`: `RPT-XXXX` berurutan, `Menunggu validasi` ganda
  (validation + handling), severity/priority `Belum ditentukan` + audit `Mengirim laporan publik` +
  notifikasi ke pengelola pemilik scope (`/pengelola/validasi-laporan`).
- [x] Layar sukses persis `WIREFRAMES.md` §2 (nomor + chip + penjelasan belum tampil + tombol kembali).
- [x] Laporan TIDAK masuk selector validated (dashboard/hasil/peta tetap steril) — dibuktikan test.
- [x] Draft form (input belum dikirim) bertahan saat refresh (localStorage per pesantren).

### 3. Penolakan sistem (pesan eksplisit, bukan diam)

- [x] Nol pesantren terdaftar → tombol lapor nonaktif + penjelasan (bukan dropdown kosong).
- [x] Pesantren nonaktif/tak dikenal via URL → `Pesantren tidak tersedia untuk pelaporan.`
- [x] Duplikat kirim ganda (double-click) → satu record (tombol dikunci saat mengirim + idempotency sederhana).

## Di luar ruang lingkup

- Antrean validasi dan lifecycle (V2-05/06), penilaian mandiri (V2-08).

## Acceptance criteria

- [x] Skenario TEST_PLAN §3 nomor 1, 2, 7 lulus pada sisi pengiriman/data; pemeriksaan UI antrean pengelola dilengkapi bersama V2-05 dan dicatat belum diuji sampai tersedia.
- [x] Copy + status + warna persis WIREFRAMES §2 dan DESIGN_SYSTEM §2.
- [ ] Visual 1440/834/390 + keyboard penuh sampai tombol kirim; TEST_PLAN §1 baris 3.
- [x] Lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

```
Tanggal: 8 September 2026
Route (12/#): #3 terimplementasi, verifikasi render browser menyusul — `/lapor` tanpa
  login menampilkan form aktif; `?pesantren=PSN-0018` preset valid;
  `?pesantren=PSN-9999` menampilkan "Pesantren tidak tersedia untuk pelaporan." +
  meminta pilihan eksplisit (logika + pesan diverifikasi telaah kode; piksel menyusul).
  Baris 1–2, 4–12: tidak regresi (file di luar lingkup V2-03 tak disentuh).
Guard/sesi: lulus sisi data — D-03: Super Admin/Peneliti kirim nonaktif + pesan keluar
  dari akun; pengelola nama otomatis + editable + email akun tersimpan
  (dibuktikan test store). Uji guard browser penuh menyusul pola V2-01.
Skenario E2E (1-8): #1, #2, #7 LULUS sisi pengiriman/data (test store: RPT-0008 berurutan,
  Menunggu validasi ganda, Belum ditentukan, audit + notifikasi scope USR-003,
  steril dari selector validated, idempotency requestId, scope isolation area).
  #3–#6, #8: BELUM DIUJI — menunggu V2-05/06/08. UI antrean pengelola menyusul V2-05.
Visual 1440/834/390: BELUM DIUJI di browser — Chrome MCP tak tersedia di perangkat ini.
  Pola kode memakai konstruksi yang sama dengan V2-02 yang lulus (max-w-2xl, flex-col,
  flex-wrap, tanpa lebar tetap/tabel); verifikasi piksel menyusul sebelum DONE.
Aksesibilitas keyboard: terimplementasi (kontrol form native + label terkait,
  tab order = urutan field → Kirim → Batal, fokus otomatis ke field error pertama,
  error role=alert, ring #e11d48 global); walkthrough Tab penuh menyusul verifikasi browser.
Lint/typecheck/test/build: lulus — oxlint 0 temuan; tsc bersih; bun test 36 lulus
  (store 15 termasuk 7 baru V2-03 + validasi form 6 + prosesor 15); `bun run build` SPA sukses.
Catatan/regresi: implementasi mengikuti interim D-11 (kunci kirim) + draft per pesantren
  sesuai jawaban sesi ini; keputusan final D-10/D-11 tetap terbuka di DECISIONS.md.
  Diff: mocks/store/mock-store.ts, mocks/adapters/mock-repository.ts,
  mocks/store/lapor-selectors.ts (+baru), mocks/store/store.test.ts,
  features/publik/lib/lapor-validation.ts (+baru), lapor-validation.test.ts (+baru),
  features/publik/lib/lapor-draft.ts (+baru), features/publik/components/lapor-form.tsx
  (+baru), lapor-success.tsx (+baru), features/publik/pages/lapor-page.tsx.
  Varian dialog /lapor + CTA preset ?pesantren= dari dashboard tidak dibangun sesi ini.
```

## Review ulang 8 September 2026

- [x] Perbaiki pemulihan draft per pesantren, URL invalid, batal, kirim ganda dan pesan penyimpanan.
- [x] Uji ulang UI responsif, keyboard, pengiriman dan regresi lintas stage 1–3.

Hasil review ulang: draft dua pesantren terisolasi dan pulih setelah refresh; URL invalid
tidak memulihkan tujuan lama; batal benar-benar menghapus draft yang dipilih; kegagalan
localStorage tampil sebagai error. Lapisan data menolak akun Super Admin/Peneliti/tidak
dikenal dan menyimpan laporan secara atomik. Pengiriman anonim dan pengelola lintas pesantren,
idempotensi, fokus layar sukses, dialog batal, audit, notifikasi scope, serta isolasi dashboard
lulus di browser. Visual lulus pada lima viewport tanpa overflow. Total 45 test, lint,
typecheck, dan build lulus.
