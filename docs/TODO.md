# TODO — Kontrol Kerja Aktif

## Perapihan format kode apps/web — 23 September 2026 — `IN PROGRESS`

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

## Infrastruktur Docker Compose + `.env` — 21 September 2026 — `IN PROGRESS`

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

## Kontrol terkini — 18 September 2026

Revisi dashboard untuk REVIEW: [STAGE_DASHBOARD_POLISH.md](../planning/STAGE_DASHBOARD_POLISH.md).
Arahan pemilik sudah menetapkan dashboard publik mengikuti referensi pertama,
tema/warna tetap, empat kategori dipertahankan, fokus penyempurnaan.
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

- [x] Tambah pesantren Persiapan + buat akun pengelola; tanpa opsi asesor.
- [ ] Uji penuh `TEST_PLAN.md` (lint, typecheck, test, build lulus; route/visual menyusul).
- [ ] Isi `Hasil Pemeriksaan` sesuai hasil nyata tiap stage. Stage `DONE` yang telah disetujui tidak diturunkan menjadi `REVIEW`; review integrasi dicatat di Stage 09.

## Menunggu keputusan (bukan tugas eksekusi)

- Skala severity/priority resmi (sementara `Tinggi/Sedang/Rendah`).
- Rumus indeks, bobot, ambang kategori, recommendation rule resmi.
- Halaman perkenalan `/perkenalan` di aplikasi ISHAS (menunggu keputusan).
- Rename `/pengelola` → `/pesantren`.
- D-04–D-12: arti hasil/agregat, temuan/status/riwayat, pesantren/akun, draft/versi, lokasi awal, tampilan.

## Review ulang frontend Stage 01–03 — 8 September 2026

- [x] Stage 01: perbaiki shell responsif/keyboard, sesi, serta kegagalan persistensi mock.
- [x] Stage 02: perbaiki keterbacaan, grafik sempit, konsistensi filter dan CTA.
- [x] Stage 03: perbaiki draft lintas pesantren/URL, batal, kirim ganda, error penyimpanan dan aksesibilitas.
- [x] Jalankan lint, typecheck, test, build, dan browser pada desktop/tablet/ponsel; 45 test dan 24 kelompok pemeriksaan browser lulus.

Arahan langsung pemilik di bagian ini mengatasi keterangan historis "tanpa kode" di atas.
