# TODO — Kontrol Kerja Aktif

## Implementasi backend Fase 1 + adapter publik (D-30.b) — 29 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan fase 1`): endpoint Fase 1
(issue #4) + swap adapter frontend publik (issue #10 parsial). Cakupan:
`apps/api` (router, middleware aktor, repo/state, domain, storage, test) dan
`apps/web` (http-client/repository/resolver/public-state). Status stage lain
tidak berubah sepihak.

- [x] Backend: baca publik + `/public/state`, lapor-cepat (+idempotensi),
      penilaian-mandiri (draft/submit), unggah bukti, berkas, audit/notifikasi.
- [x] Adapter: flag `VITE_USE_BACKEND`, proxy Vite, `usePublicState`; tulis
      lapor/mandiri/bukti + baca publik beralih; sisanya fallback mock.
- [x] Verifikasi: lint + typecheck + 48 test backend + 234 test frontend +
      migrate/seed + build + smoke endpoint.
- [ ] Cek visual 3 viewport + alur klik browser (publik adapter) — belum dijalankan.
- [ ] Review pemilik; issue #4/#10 ditutup setelah disetujui/terverifikasi.

## Rancangan backend (D-30) — 28 September 2026 — `REVIEW`

Rancangan dulu, kode backend setelah review pemilik. Stack: Bun + TypeScript +
MySQL 8.0.13+, storage lokal (tanpa S3), auth ditunda fase 6, seed satu file dua mode.
Dokumen: `BACKEND_OVERVIEW/DATA_MODEL/API_CONTRACT/STORAGE/MIGRATION/ISSUES.md`.
Issues GitHub: **8 issue `#3`–`#10`**, milestone `Backend MVP`, label
`backend`/`fase-0`…`fase-6`/`adapter`, relasi `blocked-by`. Sinkron idempoten via
`bash scripts/create-backend-issues.sh` (pakai `env -u GITHUB_TOKEN` bila token environment invalid).

- [x] Tulis 6 dokumen backend + D-30 + skrip issues.
- [x] Validasi & pendetailan dokumentasi + issue (D-30.a): sinkron `DATA_MODEL.md`
      ke v15; lengkapi DDL (kolom hilang, FK, `sequences`, `index_history`,
      `lapor_drafts`, `k3_*`, `instrument_versions`); perdetail API/storage;
      skrip issues idempoten + label fase/milestone/blocked-by.
- [x] Fase 0 (issue #3): `apps/api` (Bun+TS+MySQL) — migrasi schema v15, seed
      `--mode=demo|empty`, `GET /health`. Verifikasi: migrate + seed demo/empty +
      3 test + health lulus; lint + typecheck bersih (28 Sep 2026).
- [x] Fase 1 (issue #4): baca publik + lapor + penilaian-mandiri + unggah bukti +
      berkas + `/public/state` (D-30.b). Verifikasi: lint + typecheck + 48 test
      (unit + integrasi DB) + migrate/seed + smoke endpoint lulus (29 Sep 2026).
- [x] Adapter frontend publik (issue #10, parsial): `shared/api/http-client`,
      `http-repository`, resolver `VITE_USE_BACKEND`, `usePublicState`, proxy
      Vite; tulis `lapor`/`mandiri`/bukti + baca publik beralih. Verifikasi:
      lint + typecheck + 229 test + build lulus (29 Sep 2026); modul lain
      (Pesantren/Validator/SAM/admin) menyusul per fase, fallback mock.
- [ ] Fase 2 (issue #5): validasi + lifecycle + lokasi/denah + tindak lanjut.
- [ ] Fase 3 (issue #6): bank live + dokumen PDF + dataset/impor.
- [ ] Fase 4 (issue #7): SAM-iSAFE + bank.
- [ ] Fase 5 (issue #8): admin + audit + notifikasi + storage lokal.
- [ ] Fase 6 (issue #9): auth server + RBAC.
- [ ] Cek visual 3 viewport adapter publik + review pemilik (Fase 1/#10).

## Perbaikan invarian seed + bug alur data frontend — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`kerjakan semuanya`) dari hasil validasi seed
dan alur data frontend. Cakupan: seed, dua bug store, robustness processor, dan
sinkronisasi satu dokumen. Tanpa mengubah perilaku produk, hak akses, copy, atau
rumus/ambang. Issues: **#11–#15**. Status stage lain tidak berubah sepihak.

- [x] #11 Seed invarian: `RPT-0003` → `Proses` (rec sudah `Berjalan`); `RPT-0007`
      → `Pending` (rec masih `Belum ditindaklanjuti`) + test invarian; komposisi
      19 laporan/17 temuan/17 rekomendasi dipertahankan. Catatan: temuan awal
      RPT-0004 keliru (finding-nya memang `Berjalan`), tidak diubah.
- [x] #12 `upsertInstrumentDoc` mengenali indikator bank live (`instrument`), bukan
      hanya `instrumentVersions` + test unggah.
- [x] #13 `createSamAssessment` memakai `selectRegisteredInstitutions` + test negatif.
- [x] #14 Draft seed `SELF-PSN-0018` diberi `instrumentChecksum`;
      `kategoriOfFinding` meneruskan bank live.
- [x] #15 Sinkronkan `DASHBOARD_DATA_FLOW.md` schema v6 → v15.
- [x] Verifikasi: lint + typecheck + 224 test + build lulus (28 Sep 2026; +5 test baru).
- [ ] Review pemilik.

Catatan validasi 28 September 2026: alur inti `lapor → Menunggu validasi →
Terima/Tolak → selectPublicReports` sudah benar dan tidak membocorkan laporan
Menunggu/Ditolak/Completed/arsip. Temuan hanya konsistensi data seed (RPT-0003 &
RPT-0007), dua celah store, robustness processor, dan satu dokumen usang.

## Penjelasan label Diterima + stage Proses di area Validator — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan, kaya gini dulu aja`):
label `Validator Pesantren` rancu dengan peran Validator, dan stage `Proses`
membingungkan untuk penilaian mandiri. Cakupan baca-saja (tanpa ubah perilaku):
`StatusChip` dapat tooltip arti tiap stage; label dataset menjadi
`Diterima oleh (akun Pesantren)`; placeholder cari menyebut akun Pesantren;
checklist audit memakai `Diterima akun Pesantren`. Tambahan 28 Sep 2026:
daftar Audit publikasi menjadi tabel (kolom Laporan + Checklist kesiapan +
Validasi + Aksi) dengan tombol PDF/Scoring/Dataset di akhir; kartu menumpuk
tetap dipakai di layar kecil. Scope Stage 08 + sentuhan baca Validator;
status stage lain tidak berubah sepihak.

- [x] Kode + test render (+ tooltip chip, label, placeholder).
- [x] Verifikasi: lint + typecheck + 219 test + build lulus (28 Sep 2026).
- [x] Tabel audit + tombol aksi (kode + test; lint + typecheck + 219 test + build lulus, 28 Sep 2026).
- [ ] Cek visual browser (tooltip hover chip + label dataset/audit): belum dijalankan di lingkungan ini (Chrome tidak tersedia).
- [ ] Review pemilik.

## Usulan rekomendasi pelapor + final Pesantren (D-29) — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan`): rekomendasi tindakan
diusulkan pelapor di `/lapor` (opsional), difinalkan Pesantren saat Terima,
baru tampil di `/rekomendasi`. Scope lapor-cepat dulu; satu laporan satu
rekomendasi; penilaian-mandiri tetap perilaku lama. Schema v14→v15.

- [x] Catat D-29 + sinkron FLOWS/WIREFRAMES/DATA_MODEL sebelum mengubah kode.
- [x] Kode + migrasi v14→v15 + test (lint + typecheck + 219 test + build lulus, 28 Sep 2026; +4 test D-29).
- [ ] Cek visual 3 viewport + alur klik browser (lapor → validasi → rekomendasi): belum dijalankan di lingkungan ini (Chrome tidak tersedia).
- [ ] Review pemilik.

## Pengayaan seed demo presentasi — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (seed harus menampilkan semua data dan
kondisi untuk presentasi). Cakupan: seed saja (tanpa perubahan perilaku):
RPT-0017 arsip D-07, RPT-0018 Pending prioritas Rendah + bukti, RPT-0019
milik PSN-0023 Nonaktif (demo D-08), USR-006 Menunggu, draft SELF-PSN-0018,
SAM-0004 Berlangsung, AREA-013/BLD-005 tanpa denah, audit + notifikasi,
counters report 20/institusi 23. Test komposisi
`seed-composition.test.ts` mengunci kondisi demo.

- [x] Tambah record + sesuaikan test angka (laporan 19, kanal 9/4, rekap 6/4, peta 6, RPT-0020).
- [x] Verifikasi teknis: lint + typecheck + 215 test + build lulus (28 Sep 2026).
- [ ] Cek visual browser (arsip tampil, filter Berlangsung/Menunggu terisi, draft lanjut, PSN-0023 tersembunyi publik).
- [ ] Review pemilik.

## Pematangan bank data SAM-iSAFE (D-26.f) — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan`): bank SAM-iSAFE kurang
matang + tampilan HP lemah. Cakupan: CRUD lengkap kategori/soal (ubah, hapus
berkonfirmasi, pindah kategori, urutan), panduan observasi + contoh bukti per
soal yang bisa diubah, penanda duplikat KAT-03/KAT-05, accordion + tombol
44px + input 16px untuk portrait 390×844. Bank `SAM-KAT-*` terpisah dari
kategori sistem `KAT-*`. Schema v13→v14. Stage: `planning/STAGE_SAM_ISAFE.md`.

- [x] Catat D-26.f + revisi IN PROGRESS sebelum mengubah kode.
- [x] Kode + migrasi v13→v14 + seed + test.
- [x] Verifikasi teknis: lint + typecheck + 208 test + build lulus (28 Sep 2026; +10 test bank D-26.f).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (bank CRUD, accordion HP): belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## SAM-iSAFE fase 2 Validator (D-26.e) — 27 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan fase 2` + UI profesional):
foto bukti per jawaban, tindak lanjut temuan, grafik perkembangan + statistik,
cetak browser, review `Ditinjau`, jejak audit di detail, polish seluruh halaman
SAM-iSAFE. Tetap Validator-only. Stage: `planning/STAGE_SAM_ISAFE_FASE2.md`.

- [x] Catat D-26.e + stage IN PROGRESS sebelum mengubah kode.
- [x] Kode + migrasi v12→v13 + seed demo + test.
- [x] Verifikasi teknis: lint + typecheck + 198 test + build lulus (27 Sep 2026; +17 test SAM fase 2/store).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (dashboard, foto, tindak lanjut, cetak, review, audit): belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## SAM-iSAFE khusus Validator (D-26) — 28 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik: satu navbar Validator, bank dinamis,
27 soal awal, maks dinamis, ambang prototipe 80/60, khusus Validator fase 1.
Stage: `planning/STAGE_SAM_ISAFE.md`.

- [x] Catat D-26 + stage IN PROGRESS sebelum mengubah kode.
- [x] Kode + migrasi v11→v12 + seed + test (lint + typecheck + 185 test + build lulus, 28 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (riwayat → baru → detail → bank): belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## Pematangan Super Admin + deadlock onboarding — 27 September 2026 — `IN PROGRESS`

Revisi atas arahan langsung pemilik (kerja penuh + ikuti flow: pesantren ada
dan Aktif dulu, baru tambah akun Pesantren). Cakupan: docs (FLOWS §1/§5,
DATA_MODEL §1–§2, STAGE_08, STAGE_09, TODO) + `apps/web` (store deadlock,
form pesantren/pengguna, dashboard, hak-akses, audit, pengaturan) + test.
Revisi D-17/D-19–D-25 yang kode selesai dipindah ke `REVIEW` (visual + review
pemilik menyusul); Stage 00/07/08/09 tetap `IN PROGRESS`.

- [x] Perbaiki deadlock: `setInstitutionStatus(Aktif)` tanpa syarat akun; `addUser` Pesantren tetap wajib pesantren Aktif; akun baru default `Menunggu` + aktivasi eksplisit.
- [x] Form pesantren wajib nama/kota/alamat/PJ + detail terdaftar + konfirmasi efek pemilih; seed 4 alamat internal.
- [x] Dashboard terdaftar-vs-Aktif, matriks hak-akses baca, filter pelaku audit, teks reset seed v11.
- [x] Sinkron docs + test alur end-to-end store (Persiapan → Aktif → Menunggu → Aktif = terdaftar → Nonaktif = hilang).
- [x] Kelola akun via popup: buat (nama/email/sandi + konfirmasi/peran/scope → `Menunggu`), ubah (peran tidak diganti), reset sandi demo teraudit, hapus berkonfirmasi + proteksi akun sendiri/admin terakhir/demo tunggal. Sandi tidak disimpan di browser (login kartu).
- [x] Verifikasi: lint + typecheck + 177 test + build lulus (27 Sep 2026; +2 test kelola akun).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (tambah → aktif → akun → pemilih).
- [ ] Review pemilik.

## Audit publikasi + dataset maksimal Validator (D-25) — 28 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik (`ok kerjakan` Opsi B): rapikan Scoring +
Audit publikasi (ex Validasi & publikasi) + Data penelitian sekaligus —
tampilan konsisten + alur jelas + istilah Validator vs Pesantren diluruskan.
Keputusan D-25. Cakupan: docs + UI validator + selector/ekspor/impor aman +
test. Schema tetap v11 (tanpa migrasi). Scope Stage 08 + sentuhan baca
laporan/dashboard validator; status stage lain tidak berubah sepihak.

- [x] Catat D-25 + revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-25, ROLES §4, ROUTES §2, FLOWS §7, WIREFRAMES §6, REQUIREMENTS §9, TEST_PLAN §3, STAGE_08).
- [x] Kode + test (label Audit publikasi, filter terdaftar, nama dimensi, link PDF, checklist 5 kriteria, provenance, ekspor whitelist, impor→Menunggu validasi).
- [x] Verifikasi teknis: lint + typecheck + 175 test + build lulus (28 Sep 2026; naik dari 163).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (Scoring filter/link, Audit checklist, Dataset ekspor/impor, dashboard alur): belum dijalankan di lingkungan ini (Chromium tidak tersedia).
- [ ] Review pemilik.

## Bank instrumen live + bobot + PDF per laporan (D-24) — 28 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik (`ok kerjakan`): hapus versioning, bank
instrumen live edit-penuh Validator, 4 tipe jawaban + bobot per opsi,
draft checksum (berubah = ulang), snapshot beku + skor % + PDF per laporan
penilaian (tampil publik setelah Diterima), registrasi penilai.
Keputusan D-24. Cakupan: docs + schema v10→v11 + store/processor + UI
validator/penilaian-mandiri/laporan publik + seed + test. Scope Stage 08 +
sentuhan baca laporan; status stage lain tidak berubah sepihak.

- [x] Catat D-24 + revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-24, FLOWS §3/§7, DATA_MODEL schema v11, ROLES, ROUTES, WIREFRAMES §3/§5/§6, KATEGORI §6/§8, REQUIREMENTS §1/§4, TEST_PLAN §3/§7, README, STAGE_08).
- [x] Kode + migrasi v10→v11 + seed bank live + snapshot beku + skor % + PDF artifact (`/laporan/:id`).
- [x] Verifikasi: lint + typecheck + 157 test + build lulus (28 Sep 2026).
- [x] Perbaikan lanjutan (28 Sep 2026): anti loop autosave (dep checksum + skip bila sama),
  draft tersimpan tanpa nama + pesantren terakhir diingat, hint kurang-apa per soal,
  panel Acuan bobot di atas Bank instrumen. Verifikasi: lint + typecheck + 163 test lulus.
- [ ] Cek visual 3 viewport + keyboard + alur klik browser (bank CRUD, isi→kirim→validasi→PDF, panel bobot, reload draft): belum dijalankan di lingkungan ini (Chromium tidak tersedia).
- [ ] Review pemilik.

## Validasi ruang kerja Pesantren + perbaikan alur (D-23) — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik (`ok kerjakan`): bandingkan `main` vs
cabang `validator` untuk bagian Pesantren, evaluasi kekurangan data flow, dan
perbaiki. Keputusan D-23 (sumber status, Ekstrem eksplisit per temuan,
deprecasi lembut, arsip keluar dari kelola, filter validasi lengkap).
Cakupan: docs + schema tetap v10 (tanpa migrasi) + store/selector + UI
validasi/lokasi/tindak-lanjut/laporan + test. Scope Stage 07 + sentuhan baca
Validasi; status stage lain tidak berubah sepihak.

- [x] Catat D-23 + revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-23, FLOWS §4–§6, DATA_MODEL §4, WIREFRAMES §4–§5, TODO, STAGE_07).
- [x] Kode + test (selector arsip, `setFindingLevel` Ekstrem, filter validasi, lantai per-gedung, sync kartu, progres non-Dibatalkan).
- [x] Verifikasi: lint + typecheck + 149 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard di browser: belum dijalankan di lingkungan ini (Chromium tidak tersedia).
- [ ] Review pemilik.

## Denah pratinjau kecil + klik perbesar (D-22) — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: denah baca tampil satu layar penuh; jadikan
pratinjau kecil dulu (`Lihat denah besar` → penuh → `Tutup`). Keputusan D-22.
Cakupan: docs + shared `TombolDenahBesar` + peta publik + `SavedLocation` +
manager denah + test render. Form penandaan titik tetap penuh. Status stage lain
tidak berubah sepihak.

- [x] Catat D-22 + revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Kode + test (shared `TombolDenahBesar`/`SavedLocation` di `denah-preview.tsx`, peta publik pratinjau + pin/daftar terpecah, manager denah; 2 test render baru).
- [x] Verifikasi: lint + typecheck + 146 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard buka/tutup denah di browser: belum dijalankan di lingkungan ini (Chromium tidak tersedia).
- [ ] Review pemilik.

## Pembatalan + bukti upload + detail tindak lanjut (D-21) — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: `/pesantren/tindak-lanjut` terlihat kosong,
detail kurang, belum bisa upload bukti, dan butuh aksi batal perbaikan beralasan
yang tampil di dashboard umum. Keputusan D-21 (`Dibatalkan` per rekomendasi +
alasan min 10 + tampil publik; upload bukti pola `/lapor`; panel relasi penuh).
Cakupan: docs + schema v9→v10 + store/repository + UI kelola/publik + seed +
test. Scope Stage 07; status stage lain tidak berubah sepihak.

- [x] Catat D-21 + revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-21, FLOWS §5–§6, DATA_MODEL, ROLES, WIREFRAMES §5/§8, DATA_REQUIREMENTS §6, DESIGN_SYSTEM §2, TODO).
- [x] Kode + migrasi v9→v10 + seed contoh Dibatalkan (RPT-0009 + alasan publik).
- [x] Verifikasi: lint + typecheck + 144 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard slider/upload/dialog + alur klik browser: belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## Slider progres tindak lanjut 5 titik (D-20) — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: `Progres (%)` pada kartu tindak lanjut
Pesantren memakai slider titik `0/25/50/75/100` + label tahap; nilai lama
dibulatkan ke titik terdekat saat tampil/simpan. Keputusan D-20. Cakupan:
docs + shared `ProgressSlider` + kartu tindak lanjut + normalisasi store +
test. Scope Stage 07; status stage lain tidak berubah sepihak.

- [x] Catat revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-20, FLOWS, WIREFRAMES, TODO).
- [x] Kode + test.
- [x] Verifikasi: lint + typecheck + 133 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard slider di browser: belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## Revisi lapor-cepat + validasi (D-19) — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: `/lapor` tanpa `Indikator terkait`
(hanya `Kategori → Aspek` opsional + usulan mandiri `Tingkat keparahan` /
`Prioritas perbaikan` opsional); `severity/priority` final tetap diputus
Pesantren; detail `/pesantren/validasi-laporan` dilengkapi. Keputusan D-19.
Cakupan: docs + `apps/web/` (types, store v8→v9, repository, validasi
lapor-cepat, draft, form `/lapor`, detail validasi) + test. Status stage lain
tidak berubah sepihak.

- [x] Catat revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (DECISIONS D-19, FLOWS, DATA_MODEL, KATEGORI_K3, WIREFRAMES, TODO).
- [x] Kode + migrasi v8→v9 + seed usulan.
- [x] Verifikasi: lint + typecheck + 128 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + alur klik browser (/lapor tanpa indikator + usulan, validasi detail lengkap + gambar bukti): belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## Rename peran Peneliti→Validator + Pengelola→Pesantren — 27 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: `Peneliti` menjadi `Validator` (fungsi tetap),
`Pengelola Pesantren` menjadi `Pesantren` (fungsi tetap); `/peneliti/*` menjadi
`/validator/*`, `/pengelola/*` menjadi `/pesantren/*` (contoh: `/pesantren/tindak-lanjut`).
Keputusan D-17. Cakupan: docs normatif + `apps/web/` role-aware + migrasi schema v7→v8
+ redirect URL lama. Status stage lain tidak berubah sepihak.

- [x] Catat revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Sinkron docs (AGENTS, DECISIONS D-17, ROLES, ROUTES, FLOWS, DATA_MODEL, WIREFRAMES, README + sisa: TEST_PLAN, BACKLOG, DATA_REQUIREMENTS, VALIDATION_REVIEW V-19, DASHBOARD_*, KATEGORI, RISK_MAP, planning stages, TODO).
- [x] Rename kode + migrasi v8 + redirect.
- [x] Verifikasi: lint + typecheck + 123 test + build lulus (27 Sep 2026).
- [ ] Cek visual 3 viewport + alur klik browser (login 3 kartu, guard direct URL, redirect lama, validasi→terbit): belum dijalankan di lingkungan ini.
- [ ] Review pemilik.

## Perapihan format kode apps/web — 23 September 2026 — `REVIEW`

Revisi atas arahan langsung pemilik: rapikan format seluruh kode `apps/web/`
yang berantakan (baris raksasa gaya minified) agar mudah dibaca. Whitespace-only,
tanpa mengubah desain, copy, atau behavior; lalu commit per area. Cakupan: file
sumber `*.ts/*.tsx/*.css` ter-track (±153 file); tanpa `build/`,
`node_modules/`, `.react-router/`, tanpa `bun.lock`. Acuan AGENTS §Format: satu
elemen JSX/statement per baris, lebar ±100 kolom, tanpa baris ±500 karakter.
Status stage lain tidak berubah.

- [x] Catat revisi IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Format seluruh file sumber (prettier, print-width 100).
- [x] Verifikasi: lint + typecheck + 123 test + build lulus (23 Sep 2026).
- [x] Commit kecil per area (Conventional Commits); tanpa push.
- [ ] Review pemilik.

## Pustaka detail indikator (PDF Public/Privat) — 23 September 2026 — `IN PROGRESS`

Revisi atas arahan pemilik (`ok kerjakan`): Peneliti mengunggah satu PDF per
indikator; tampil di dashboard utama + halaman publik `/dokumen` (navbar umum
baru); `Privat` hanya tampil nama tanpa tombol Lihat/Unduh; isi privat penuh
hanya untuk Peneliti; independen dari versioning; frontend-only, backend
menyusul. Keputusan D-16; stage: [STAGE_DOKUMEN_INDIKATOR.md](../planning/STAGE_DOKUMEN_INDIKATOR.md).

- [x] Catat D-16 + stage IN PROGRESS dengan cakupan jelas sebelum mengubah kode.
- [x] Mocks schema v7 + adapter IndexedDB + seed + actions + selector publik.
- [x] UI Peneliti (`/peneliti/instrumen` seksi tabel) + UI publik (`/dokumen` + panel `/`).
- [x] Verifikasi: lint + typecheck + 115 test + build + 3 viewport + alur utama lulus (23 Sep 2026; uji klik workspace peneliti + unduh PDF bahan review).
- [ ] D-16.g revisi pemilik: tombol `Tambah dokumen` di `/peneliti/dokumen-instrumen` membuat entri dokumen indikator baru (kode/judul/kategori/aspek + PDF), metadata denormalisasi pada `InstrumentDoc`, tanpa mengubah `InstrumentVersion`; default `Privat`.
  - [x] Sinkron docs (DECISIONS D-16.g, WIREFRAMES §9, FLOWS §8, DATA_MODEL §0) + kode store/repository/prosesor/UI + test.
  - [ ] Verifikasi lint + typecheck + test + build + cek visual 3 viewport.
- [ ] Review pemilik; DONE hanya setelah disetujui. Stage: `REVIEW`.

## Infrastruktur Docker Compose + `.env` — 21 September 2026 — `REVIEW`

Revisi lintas fitur atas arahan pemilik: proyek memakai Docker Compose dengan
environment dari `.env`. Cakupan: `docker-compose.yml` root (service `web-dev` +
`web-prod`), `apps/web/Dockerfile` multi-stage, `nginx.conf`, `.dockerignore`,
`.env.example` + `.env` lokal, dan seksi Docker di README. Tanpa perubahan kode
aplikasi, copy, desain, maupun status stage lain (Stage 07–09 tetap `IN PROGRESS`,
Stage 01–06 tetap `REVIEW`).

- [x] Arahan pemilik: compose berbasis `.env`; frontend dev+prod; nginx multi-stage; satu port 3003 (dev/prod bergantian via profile).
- [x] Builder produksi memakai Node (`node:22-slim`, Bun dari npm) karena `react-router build` memerlukan kondisi ekspor Node (`renderToPipeableStream`); `bun.lock` tetap sumber kebenaran dependensi.
- [x] Verifikasi 21 Sep 2026: `compose config` kedua profile; prod (`/`, `/hasil`, `/lapor`, `/peta-risiko`, `/login` HTTP 200 + konten aplikasi), dev (`/` 200, Vite client 200, bind mount live/hot reload); lint + typecheck + 106 test + build lulus.
- [x] Sinkronisasi 23 Sep 2026: perbaiki `bun run dev` EACCES (`.react-router/` milik root dari container dev). `.react-router/`/`build/` dev diisolasi di volume Compose; `vite.config.ts` baca `PORT` + `VITE_ALLOWED_HOSTS` dari env (default 3003 + daftar host tetap, container dev tetap listen 3003). Verifikasi: dev lokal + dev Docker (`/` HTTP 200) jalan bergantian, `.react-router` host tetap milik pengguna; lint + typecheck + 106 test + build lulus.
- [ ] Review pemilik; DONE hanya setelah disetujui.

## Kontrol terkini — 18 September 2026

Revisi dashboard untuk REVIEW: [STAGE_DASHBOARD_POLISH.md](../planning/STAGE_DASHBOARD_POLISH.md).
Arahan pemilik sudah menetapkan dashboard publik mengikuti referensi pertama,
empat kategori dipertahankan, fokus penyempurnaan. D-18 kemudian mengganti
identitas marun menjadi biru.
Checklist pada stage revisi menjadi kontrol pekerjaan sesi ini. Bagian historis
“tanpa kode”, “BACKLOG”, dan “menunggu jawaban D-13” di bawah tidak lagi membatasi
izin implementasi ini. Stage 03 dan 04 berstatus REVIEW sesuai file stage dan
hasil historis; revisi baru memiliki hasil pemeriksaan terpisah. Stage 07–09 tetap
IN PROGRESS karena pemeriksaan penerimaannya belum lengkap, bukan dinyatakan DONE.



- [x] Arahan review terbaru: kartu kategori/lokasi desktop sejajar 22rem, tabel scroll vertikal dengan header sticky; ponsel mengikuti isi. Browser, lint/typecheck/106 test/build lulus (menggantikan koreksi tinggi isi desktop sebelumnya).

## Kategori/aspek K3 (D-15) — 19 September 2026

- [x] Patokan dokumen: `KATEGORI_K3.md` + D-15 (struktur Kategori→Aspek→Indikator, Ekstrem prototipe, risiko tetap pengelola).
- [x] Sinkronisasi: DATA_MODEL (schema v6, RiskLevel, category/aspect), FLOWS (cascading opsional lapor-cepat), DESIGN_SYSTEM (Ekstrem → status-red + Flame).
- [ ] Review dokumen bersama pemilik/dosen sebelum implementasi dianggap final.
- [x] Implementasi kode mengikuti patokan ini (seed INS-v1.1, migrasi v6, rekap per kategori, form cascading, test).
- [x] Verifikasi: lint + typecheck + 103 test + build lulus (19 Sep 2026). Cek visual 3 viewport browser menyusul (Chromium tak tersedia di lingkungan ini).

## Gambar bukti Pelaporan — 18 September 2026

Arahan pemilik mengaktifkan revisi terbatas `/lapor`: satu gambar opsional
PNG/JPEG/WebP, maksimum 5 MB/20 megapiksel, pratinjau dan lepas/ganti lampiran.
Blob di IndexedDB, ID pada draft/laporan; pengelola membaca bukti pada validasi,
bukan ruang publik. Backend/publikasi tidak termasuk.
Hasil dan batas uji di [stage bukti gambar](../planning/STAGE_REPORT_EVIDENCE.md).

## Rancangan Risk Map — 18 September 2026

Cakupan: rancangan detail dan ilustrasi, tanpa perubahan kode aplikasi.
Aturan denah publik diperbarui terbatas melalui D-14; catatan historis larangan
denah pada bagian lain dibaca bersama amendemen ini.

- [x] Catat keputusan denah besar per pesantren, titik pelaporan, dan syarat pilih pesantren.
- [x] Audit alur upload → titik → validasi → temuan → peta publik → arsip.
- [x] Catat arahan peringatan sebelum unggah/penggantian denah (D-14.a),
  copy kontekstual, pembatalan aman, serta usulan konfirmasi penerbitan versi baru.
- [x] Susun [rancangan](RISK_MAP_DESIGN.md), kontrak data, versi, state, migrasi dan uji.
- [x] Selesaikan dan periksa [ilustrasi denah fiktif](assets/risk-map-campus-illustration-v1.png)
  tanpa pin tertanam; tampilan keseluruhan, tanpa ruangan/per lantai/identitas lokasi nyata.
- [ ] Review rancangan/ilustrasi bersama pemilik; tentukan kewajiban titik.
- [x] Revisi implementasi diaktifkan melalui `ok kerjakan`; hasil pada stage Risk Map, belum DONE.

## Implementasi Risk Map — 18 September 2026 — REVIEW

- [x] Denah kampus satu pesantren, unggah pengelola, dua tahap peringatan dan versi historis.
- [x] Titik opsional lapor cepat dan per jawaban penilaian mandiri; floor teks, draft dan snapshot.
- [x] Validasi → temuan dengan lineage → peta publik; pending/ditolak/Completed tidak tampil.
- [x] Schema v5, migrasi v4 tanpa titik legacy otomatis, aset IndexedDB dan reset demo.
- [x] Dashboard general meminta pilih pesantren; peta lengkap mendukung versi, risiko, status dan pembesaran.
- [x] Uji otomatis dan pemeriksaan browser; rincian hasil/batas di [stage Risk Map](../planning/STAGE_RISK_MAP.md).
- [ ] Review pemilik; putuskan apakah titik wajib. Belum DONE, tanpa push/publikasi.

## Persiapan revisi dashboard — 18 September 2026

Cakupan sesi terbaru: evaluasi dokumentasi dan persiapan redesign, bukan perubahan
kode. Bagian “tanpa kode/BACKLOG” di bawah adalah catatan historis audit awal;
progres implementasi tercatat pada bagian stage berikutnya.

- [x] Analisis referensi gambar dosen dan bandingkan dengan dokumen serta kode dashboard lokal.
- [x] Catat perbedaan unit/angka, batas bidang publik, struktur aspek, dan skala risiko.
- [x] Siapkan [rencana review dashboard](DASHBOARD_REDESIGN_REVIEW.md), kontrak metrik,
  dependensi, dan pemeriksaan penerimaan untuk redesign.
- [x] Ajukan tiga pertanyaan keputusan D-13 (sasaran dashboard, warna, aturan baru).
- [x] Catat amendemen D-13: tema/warna tetap, penyempurnaan dashboard publik; sinkronkan spesifikasi/stage.
- [ ] Rekonsiliasi status historis README/TODO/planning dan pastikan target aplikasi sebelum kode.
- [x] Izin penyempurnaan diberikan pemilik; hasil revisi dicatat terpisah pada STAGE_DASHBOARD_POLISH.md.

### Implementasi redesign dashboard — 18 September 2026

Perbaikan navigasi atas arahan pemilik pada sesi yang sama: navigasi publik
dipindahkan ke shared shell agar konsisten di seluruh route publik, halaman aktif
ditandai marun, menu seluler berada di header dan menutup setelah memilih tautan.
Header tetap terlihat saat scroll; filter pesantren/periode terbawa pada tautan.
Lint, typecheck, build, serta pemeriksaan visual desktop dan navigasi ke `/hasil` lulus.

Arahan lanjutan pemilik: navigasi utama mengikuti tampilan role lain. Shell publik
memakai sidebar 256px dengan logo compact, menu aktif marun solid, header 68px,
dan Modal menu seluler yang sama dengan workspace. Menu/izin tetap publik;
filter URL tetap terbawa. Arahan ini menggantikan susunan header sticky di atas.

Tambahan pemilik: menu `Pelaporan` menuju `/lapor` tersedia pada navbar publik
desktop dan menu ponsel; konteks pesantren/periode tetap terbawa lewat URL.

Tambahan 18 September: menu `Penilaian mandiri` menuju `/penilaian-mandiri`
ditambahkan setelah `Pelaporan` pada shared navbar publik desktop/menu ponsel.
Konteks pesantren/periode, penanda halaman aktif dan penutupan menu tetap memakai
alur navigasi bersama; tidak mengubah hak mengirim penilaian.

- [x] Bangun ulang dashboard publik `/` dengan sidebar desktop/menu ringkas seluler,
  ringkasan skor, statistik, tren, risiko, sumber laporan, status tindak lanjut,
  aspek, rekap lokasi, temuan, dan CTA kanal kirim.
- [x] Pertahankan filter pesantren berbasis URL, selector `Diterima`, batas D-02,
  tiga tingkat risiko, dan fallback `Belum dipetakan` untuk temuan tanpa indikator.
- [x] Verifikasi visual desktop; lint, typecheck, 70 test, dan build lulus.
- [x] Verifikasi responsivitas revisi dashboard pada browser terkendali 18 September 2026;
  rincian ukuran dan batas pengujian pada STAGE_DASHBOARD_POLISH.md.

Cakupan aktif: validasi dan penyempurnaan rencana, hanya di `docs/`, tanpa kode.
Keputusan produk dicatat di `DECISIONS.md`; calon pembangunan di `planning/` belum diaktifkan.

## Stage 00 — Validasi dan perbaikan rencana — `IN PROGRESS`

- [x] Baca seluruh dokumen dan bandingkan dengan keputusan evaluasi dosen September 2026, dokumen sumber, serta acuan lama yang relevan.
- [x] Catat konflik, kekurangan, dan batas pemeriksaan dalam `VALIDATION_REVIEW.md`.
- [x] Tambahkan daftar keputusan terbuka dan rincian kebutuhan data yang belum tertampung.
- [x] Koreksi fase kerja: Stage 01 kembali `BACKLOG`; tidak ada pekerjaan kode aktif.
- [x] Dapatkan jawaban pemilik untuk cara pembangunan, batas data publik, dan hak melapor (D-01–D-03) — dijawab 8 September 2026: aplikasi ISHAS (React Router, folder per fitur, bun 1.4); publik ringkasan saja + nama validator/PIC; kirim hanya publik + pengelola.
- [ ] Bahas keputusan lanjutan D-04–D-12 sebelum spesifikasi terkait dinyatakan siap.
- [x] Sinkronkan semua dokumen yang terdampak setelah keputusan diberikan (README, ROUTES, ROLES, FLOWS, DATA_MODEL, DATA_REQUIREMENTS §6, WIREFRAMES, BACKLOG, TEST_PLAN, planning/README, stage Stage 01–Stage 09).
- [x] Verifikasi 11 tautan file, konsistensi status, dan 188 file proyek di luar `docs/` tetap sama dengan kondisi sebelum pemeriksaan.
- [x] Rapihkan konsistensi kecil lintas dokumen (8 September 2026): pemetaan Tahap A–E ↔ stage Stage 01–09 di BACKLOG, kalimat uji Stage 09 diselaraskan dengan TEST_PLAN (27 pola kanonis), penjelasan `Dihapus` pada enum HandlingStatus, penanda D-03 pada hak lapor Peneliti di ROLES §4, catatan field field lama (tidak dipakai sebagai status resmi) pada DATA_MODEL, usulan key sesi/draft di SUGGESTIONS §7.
- [ ] Ajukan hasil perbaikan rencana untuk review pemilik; jangan menandai rencana disetujui sendiri.

## Cara pakai

- Saat ini kerjakan Stage 00 saja. Urutan Stage 01 → Stage 09 adalah calon urutan implementasi setelah ada arahan pemilik untuk mulai kode.
- Centang `[x]` hanya setelah diverifikasi (lihat `TEST_PLAN.md`), bukan saat niat.
- Temuan baru ditulis sebagai sub-item baru, bukan menghapus item lama.

## Stage 01 — Fondasi aplikasi ISHAS (scaffold + data + login + `/` publik) — `REVIEW`

- [x] Scaffold ISHAS: React Router + bun 1.4 + TypeScript, folder per fitur (app/routes, features, shared, mocks).
- [x] Mock schema v4 + entitas `Report`/`SelfAssessmentDraft` + seed minimum (`DATA_MODEL.md` §5).
- [x] `resetMockData` mengembalikan seed yang konsisten.
- [x] Login 3 kartu (tanpa asesor) + sesi menunjuk ID akun + guard workspace + `/akses-ditolak`.
- [x] `/` merender dashboard publik tanpa redirect; sesi tidak mengubah isinya.
- [x] Grep `asesor` nihil di kode aktif; lint + typecheck + build lulus.

## Stage 02 — Shell publik + dashboard agregat — `REVIEW`

- [x] Shell publik ringan (header + penanda + tombol Masuk/Ruang kerja).
- [x] Pemilih pesantren (hanya terdaftar) + empty state nol pesantren.
- [x] Agregat + grafik + dimensi + temuan prioritas (tanpa panel count antrean — D-02; hanya data `Diterima`).
- [x] Cek 3 viewport tanpa overflow; lint + typecheck + build.
- [x] Aturan ilustrasi D-04 (usulan di `DECISIONS.md`) dipakai processor agregat; saat D-04 final, processor + label wajib ditinjau ulang (U-09).
- [x] Seed diperkaya untuk dashboard penuh: RPT-0007 penilaian mandiri `Diterima` PSN-0019 + temuan/rekomendasi turunan + `indexHistory` 6 periode ilustratif.
- [x] Perbaikan kecil lintas stage: chip `Data publik · ilustrasi` berikon `Info`; Keluar dipindah ke shell workspace; kelas `text-secondary` → `text-secondary-text` pada `EmptyState`.

## Stage 03 — Laporan cepat `/lapor` — `REVIEW` (diaktifkan + dikerjakan 8 September 2026)

- [x] Form satu langkah + validasi tiap field + error inline (`FLOWS.md` §2).
- [x] Kirim tanpa login + kirim saat login pengelola (nama otomatis; Super Admin/Peneliti kirim nonaktif — D-03) + layar sukses bernomor.
- [x] Laporan tidak tampil di dashboard; muncul di antrean pemilik scope + audit + notifikasi.
- [ ] Cek 3 viewport + keyboard di browser; lint + typecheck + build (lint/typecheck/test/build lulus; viewport/keyboard browser menyusul sebelum REVIEW).
- [ ] Ajukan hasil untuk review pemilik; interim D-11 (kunci kirim) + draft per pesantren menunggu D-10/D-11 final.

## Stage 04 — Halaman baca publik — `REVIEW`

- [x] Bangun halaman hasil, peta risiko, rekomendasi, tindak lanjut, dan laporan dengan filter URL bersama.
- [x] Pastikan semua tampilan publik membaca data `Diterima` dan memenuhi matriks bidang publik D-02.
- [x] Perbaikan visual dashboard `/` 19 Sep 2026: batang `Temuan per kategori` menapak baseline + nol garis tipis + skala; `Rekap per kategori` jadi diagram + detail (kartu ponsel + tabel rincian details/sticky). Prosesor/seed tak diubah. Lint + typecheck + 103 test + build lulus (19 Sep 2026, termasuk fiks tinggi batang HP: hapus `flex-1` penyebab track collapse, pakai `h-32/sm:h-36` tetap; fiks PC 19 Sep 2026: grid `items-stretch` + kolom `justify-end` + track `min-h-32/sm:min-h-36` + `xl:flex-1` agar batang mengisi sisa kartu dan baseline menapak bawah; diagram/kartu rekap dilepas atas arahan pemilik — tersisa tabel 9 kolom saja dengan header/kolom diperbesar di HP (`text-base`, `px-5 py-3.5`, `min-w-[880px]`, kolom pertama sticky + hint geser)); cek visual browser menyusul (Chromium tak tersedia di lingkungan ini).
- [ ] Filter pesantren di tiap halaman; konsistensi lintas halaman untuk filter sama.
- [ ] Pemeriksaan lintas route/filter Stage 04 terbaru masih terbuka; dashboard revisi sendiri telah diperiksa (STAGE_DASHBOARD_POLISH.md).

## Stage 05 — Antrean validasi — `REVIEW`

- [x] Implementasi `/pengelola/validasi-laporan`: filter + detail + Terima/Tolak tersedia (file Stage 05); uji browser penerimaan penuh masih terbuka.
- [x] Test store membuktikan penolakan syarat severity/priority/alasan; selector publik hanya menerima laporan Diterima.
- [x] Test store membuktikan isolasi scope: pengelola tidak dapat memoderasi laporan pesantren lain.
- [ ] Cek 3 viewport + keyboard + dialog fokus; lint + typecheck + build.

## Stage 06 — Lifecycle + arsip completed — `REVIEW`

- [x] Transisi Pending→Proses→Completed + syarat tiap langkah + aturan mundur + arsip Completed + audit abadi.
- [x] Pemetaan status→warna/ikon/label persis `DESIGN_SYSTEM.md` §2.
- [x] Test store untuk tiap transisi sah dan tiap penolakan; lint + typecheck lulus.
- [ ] Pemeriksaan visual 3 viewport + build akhir.

## Stage 07 — Lokasi + tindak lanjut + laporan pengelola — `IN PROGRESS`

- [x] Gedung/lantai/area/denah (tambah + unggah versi); area baru muncul di dropdown lapor.
- [x] Rencana tindak lanjut (PIC/tenggat) + progres + bukti + verifikasi.
- [x] Laporan pimpinan scope sendiri + simulasi unduh berlabel dummy.
- [ ] Cek 3 viewport; lint + typecheck + build (lint, typecheck, test, dan build lulus; cek viewport menyusul).

## Stage 08 — Penilaian mandiri — `IN PROGRESS`

- [x] Salin-adaptasi alur tanpa penugasan + kunci versi Published + draft lokal + lanjutkan setelah refresh.
- [x] Tinjau kelengkapan + kirim untuk validasi (tidak ada jalur tampil langsung sebelum validasi).
- [ ] Hasil yang `Diterima` tampil dengan label kanal; cek 3 viewport; lint + typecheck + build.

## Stage 09 — Admin + sinkron dokumen + rilis REVIEW — `IN PROGRESS`

- [x] Tambah pesantren Persiapan + buat akun Pesantren; tanpa opsi asesor.
- [ ] Uji penuh `TEST_PLAN.md` (lint, typecheck, test, build lulus; route/visual menyusul).
- [ ] Isi `Hasil Pemeriksaan` sesuai hasil nyata tiap stage. Stage `DONE` yang telah disetujui tidak diturunkan menjadi `REVIEW`; review integrasi dicatat di Stage 09.

## Menunggu keputusan (bukan tugas eksekusi)

- Skala severity/priority resmi (sementara `Tinggi/Sedang/Rendah`).
- Rumus indeks, bobot, ambang kategori, recommendation rule resmi.
- Halaman perkenalan `/perkenalan` di aplikasi ISHAS (menunggu keputusan).
- ~~Rename `/pengelola` → `/pesantren`~~ — dikerjakan via D-17 (27 Sep 2026).
- D-04–D-12: arti hasil/agregat, temuan/status/riwayat, pesantren/akun, draft/versi, lokasi awal, tampilan.

## Review ulang frontend Stage 01–03 — 8 September 2026

- [x] Stage 01: perbaiki shell responsif/keyboard, sesi, serta kegagalan persistensi mock.
- [x] Stage 02: perbaiki keterbacaan, grafik sempit, konsistensi filter dan CTA.
- [x] Stage 03: perbaiki draft lintas pesantren/URL, batal, kirim ganda, error penyimpanan dan aksesibilitas.
- [x] Jalankan lint, typecheck, test, build, dan browser pada desktop/tablet/ponsel; 45 test dan 24 kelompok pemeriksaan browser lulus.

Arahan langsung pemilik di bagian ini mengatasi keterangan historis "tanpa kode" di atas.
