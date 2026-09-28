# Backend ISHAS — Kontrak API (REST)

Sumber perilaku: `apps/web/mocks/store/mock-store.ts` + `adapters/mock-repository.ts`.
Semua validasi di bawah adalah port 1:1; angka mengacu ke baris mock.

## 0. Konvensi

- Basis: `/api/v1`. Format sukses: `{ok:true, data:...}`; gagal:
  `{ok:false, error:"pesan bahasa Indonesia"}` (cermin `ActionResult`).
- Kode HTTP: `200` baca/tulis ok, `201` buat, `400` validasi, `401` tanpa sesi,
  `403` peran/scope salah, `404` tidak ada, `409` konflik (draft basi, hapus
  dipakai, lock denah), `413` file kebesaran, `429` kirim ganda/spam.
- Idempotensi kirim: header `X-Request-Id` (cermin `clientRequestId`,
  `seenReportRequests` cap 500). Kirim ulang ID sama → kembalikan ID lama.
- Pagination daftar: `?page&limit` (default 20, maks 100); sort default
  `submitted_at DESC` kecuali ditentukan.
- Auth fase 1–5: header `X-Demo-Account: USR-xxx` (cermin kartu login, hanya
  untuk pengembangan); fase 6 diganti cookie sesi (lihat §16).

### 0.a Amplop sukses/gagal + pagination

```json
// 200 daftar
{ "ok": true, "data": { "items": [ /* ... */ ], "page": 1, "limit": 20, "total": 57 } }
// 201 buat
{ "ok": true, "data": { "id": "RPT-0020" } }
// 400/403/404/409/413/429
{ "ok": false, "error": "Nama minimal 2 karakter." }
```

Field `error` **harus** sama persis dengan pesan mock (`mock-store.ts`) agar test
frontend tetap hijau; kode HTTP mengikuti tabel 0.b.

### 0.b Pemetaan pesan validasi → kode HTTP

| Kelas validasi (contoh pesan) | HTTP |
|---|---|
| Field tidak sah: "Nama minimal 2 karakter.", "Judul minimal 10 karakter.", "Usulan rekomendasi minimal 10 karakter." | 400 |
| Relasi tidak sah: "Kategori/aspek tidak konsisten.", "Lokasi/area tidak sah untuk pesantren ini.", "Pesantren tidak tersedia untuk pelaporan.", "Lampiran bukti tidak sah. Pilih gambar kembali." | 400 |
| Tanpa sesi fase 6 / cookie kedaluwarsa | 401 |
| Peran/scope: "Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim laporan.", "Anda tidak berwenang mengubah laporan pesantren ini.", "Hanya Validator aktif yang dapat mengunggah bukti." | 403 |
| "Laporan tidak ditemukan." | 404 |
| "Hanya laporan Menunggu validasi yang dapat diterima.", draft basi (checksum beda), lock denah `expectedActiveId` salah, hapus denah sedang dipakai | 409 |
| Ukuran/tipe berkas melebihi batas (5 MB/10 MB/20 MP) | 413 |
| Kirim ganda cepat / spam login | 429 |

## 1. Matriks otorisasi (server wajib menegakkan)

| Akses | Publik tanpa login | Pesantren | Validator | Super Admin |
|---|---|---|---|---|
| `GET` publik (dashboard, hasil, peta, rekomendasi, tindak lanjut baca, `/hasil`, dokumen Public) | ya | ya | ya | ya |
| `POST` lapor-cepat + upload bukti lapor | ya | ya (scope bebas, lapor ke mana pun) | **tidak** (D-03) | **tidak** (D-03) |
| `POST` penilaian-mandiri + draft + bukti jawaban | ya | ya | **tidak** (kecuali SAM) | **tidak** |
| Antrean validasi + Terima/Tolak + lifecycle + arsip | tidak | **scope sendiri** | tidak | tidak |
| Lokasi/denah + tindak lanjut kelola | tidak | **scope sendiri** | tidak | tidak |
| Bank instrumen + scoring/audit + dokumen + dataset/impor | tidak | tidak | ya | tidak |
| SAM-iSAFE + bank SAM (pengecualian D-03 terbatas) | tidak | tidak | ya | tidak |
| Pesantren + user + audit global + reset | tidak | tidak | tidak | ya |
| Dokumen `Privat` (metadata penuh + blob) | tidak | tidak | ya | tidak |

Invarian baca publik (D-02): hanya `validationStatus=Diterima`,
`archivedAt NULL`, `handlingStatus!=Completed`, pesantren terdaftar.
Tanpa: nama/kontak pelapor, bukti lapor-cepat & penyelesaian, jawaban mentah,
alasan tolak, catatan internal, tenggat, audit mentah.
Pengecualian: foto bukti penilaian-mandiri tampil di PDF (D-27);
`alasan pembatalan` tampil (D-21).

## 2. Publik baca (tanpa login)

| Method + Path | Validasi | Efek |
|---|---|---|
| `GET /public/dashboard?institution=&period=` | `institution` tak dikenal → fallback semua + notice (bukan error) | Agregat D-04 ilustratif: 1 snapshot `Diterima` terbaru/lembaga, rata-rata per lembaga, `indexHistory` untuk tren |
| `GET /public/results`, `/public/risk-map`, `/public/recommendations`, `/public/follow-ups` | Filter `institution` sama; peta butuh 1 pesantren dipilih (D-14) | Daftar Area + temuan aktif (tanpa `Dibatalkan`), rekomendasi final |
| `GET /public/reports/:id/pdf-data` | Hanya laporan `penilaian-mandiri` + `Diterima` | Kop + skor beku + dimensi + temuan (lokasi, severity/priority final, status/progres/PIC) + foto bukti + metadata (D-28). Tanpa jawaban mentah: `snapshot.answers` hanya memuat `evidenceAssetId`/`evidenceName` (foto) + `institution` + `instrumentLabel` |
| `GET /public/docs?q=&category=&visibility=` | Blob privat di-strip (`assetId=""`) | Baris katalog + filter; `Privat` hanya nama + gembok |
| `GET /public/institutions` | — | Hanya terdaftar (pemilih publik) |
| `GET /public/institutions/:code` | Tak dikenal → empty, bukan 404 teknis | Profil ringkas (kota saja, tanpa alamat lengkap — D-02) |
| `GET /public/state` | Proyeksi publik `IshasState` (D-30.b) | Adapter frontend issue #10; menerapkan invarian D-02 yang sama (tanpa identitas pelapor, jawaban mentah, alasan tolak, audit mentah) |

## 3. Lapor-cepat

| Method + Path | Validasi (mock-store.ts:287-373) | Efek |
|---|---|---|
| `POST /reports/lapor-cepat` | Aktor publik/Pesantren aktif. `reporterName` 2–100, `title` 10–140, `description` ≥20, `contact` ≤100. `institutionCode` terdaftar. `areaId` milik pesantren ATAU `manualLocation` ≥3. `categoryId/aspectId` konsisten (aspek tanpa kategori ditolak). `reporterSeverity/Priority` ∈ daftar. `reporterRecommendation` 10–500 bila diisi (D-29). `evidenceAssetId` pola + nama cocok + blob ada + `institutionCode` sama | `RPT-XXXX`, `Menunggu validasi`, severity/priority `Belum ditentukan` + audit + notifikasi ke Pesantren pemilik scope |
| `POST /uploads/report-evidence` | PNG/JPEG/WebP, 0–5 MB, nama ≤200, decode ok, ≤20 MP (report-evidence.ts) | `evidence-asset-<uuid>` (lihat `BACKEND_STORAGE.md`) |
| `DELETE /uploads/report-evidence/:assetId` | Pemilik upload / scope sama | Hapus blob yatim |

## 4. Validasi Pesantren (scope sendiri — mock-store.ts:3155-3180)

| Method + Path | Validasi | Efek |
|---|---|---|
| `GET /pesantren/queue?status=&channel=&severity=&q=` | Scope = `institutionCode` akun | Antrean `Menunggu validasi` terbaru dulu + chip kanal/lokasi/handling |
| `GET /pesantren/reports/:id` | Scope sendiri | Detail penuh internal (identitas, kontak, usulan, bukti, jejak) |
| `POST /pesantren/reports/:id/accept` | `severity/priority` wajib ≠ `Belum ditentukan`; status harus `Menunggu validasi`; lapor-cepat wajib `rekomendasiFinal` 10–500 (D-29) | `Diterima/Pending` + `validatedBy/At` + temuan/rekomendasi turunan (idempoten) + audit |
| `POST /pesantren/reports/:id/reject` | `reason` ≥10; status harus `Menunggu validasi` | `Ditolak` terminal + audit; tidak tampil publik |
| `GET /pesantren/state` | Scope = `institutionCode` akun (D-30.c) | Proyeksi internal untuk adapter frontend (laporan Menunggu/Ditolak + snapshot + audit scope); **bukan** endpoint publik |

## 5. Lifecycle + temuan

| Method + Path | Validasi (mock-store.ts:527-602) | Efek |
|---|---|---|
| `POST /pesantren/reports/:id/status` `{next, owner?, dueDate?, note?}` | Mesin: `Pending→Proses` (PIC ≥2 + tenggat ≥ hari ini + catatan; propagasi ke rekomendasi), `Proses→Completed` (semua temuan `Terverifikasi` + progres 100 + bukti + catatan), mundur butuh alasan ≥10 | `handlingStatus` + audit |
| `POST /pesantren/reports/:id/archive` | `reason` ≥5; harus `Completed` + belum arsip | `archivedAt` + audit; hilang dari publik/kelola |
| `PATCH /pesantren/findings/:id/level` | `level` ∈ Rendah/Sedang/Tinggi/Ekstrem; laporan `Diterima` + belum arsip | Level eksplisit per temuan (bukan rumus) + audit |

## 6. Lokasi + denah

| Method + Path | Validasi | Efek |
|---|---|---|
| `POST /pesantren/buildings` | `code` ≥2 unik/lembaga (case-insensitive), `name` ≥2 | Gedung + Lantai 1 otomatis |
| `POST /pesantren/buildings/:id/floors` | `name` ≥2 unik/gedung | Lantai |
| `POST /pesantren/areas` | `floor` + `name` ≥2 + `zone` ≥2; gedung se-scope | Area (langsung muncul di form lapor) |
| `POST /uploads/campus-plan` | PNG/JPEG/WebP ≤5 MB; sisi pendek ≥800 px | `campus-asset-<uuid>` staging |
| `POST /pesantren/campus-plans/publish` | `acknowledged=true`; `expectedActiveId` = aktif kini (optimistic lock); asset unik + ukuran sah | `CAMPUS-<kode>-v<rev>` + aktif; titik lama tetap di versi asal |

## 7. Tindak lanjut

| Method + Path | Validasi (mock-store.ts:932-1062) | Efek |
|---|---|---|
| `POST /pesantren/recommendations/:id/progress` | `note` wajib; dari `Belum`: PIC ≥2 + tenggat ≥ hari ini → `Berjalan` + laporan → `Proses`; `progress` snap kelipatan 25 (D-20); 100 wajib `evidenceName` (+`assetId` bila ada) → `Menunggu verifikasi`; semua `Terverifikasi` → laporan `Completed` | Mutasi + sinkron temuan + audit |
| `POST /uploads/completion-evidence` | Sama seperti bukti (≤5 MB/20 MP) | Asset bukti penyelesaian |
| `POST /pesantren/recommendations/:id/verify` `{verify:true, note}` | Hanya dari `Menunggu verifikasi` | Temuan terkait `Terverifikasi` + audit |
| `POST /pesantren/recommendations/:id/cancel` | `reason` ≥10; tidak dari `Terverifikasi`/`Dibatalkan` | `Dibatalkan` + temuan ikut; tampil publik + alasan; blokir `Completed` otomatis |

## 8. Penilaian-mandiri (D-24 + D-27)

| Method + Path | Validasi (mock-store.ts:1086-1297) | Efek |
|---|---|---|
| `GET /instrument/bank` | Publik boleh (soal untuk diisi; bobot/flag temuan **tidak** ikut ke publik — hanya teks/opsi/label) | Bank live + checksum |
| `POST /self-assessments/drafts` | Pesantren terdaftar; bank berdimensi | Draft + `instrumentChecksum`; checksum beda = basi: kirim dikunci, wajib ulang |
| `DELETE /self-assessments/drafts/:id` | Pemilik draft | Buang draft basi |
| `POST /self-assessments/submit` | Aktor publik/Pesantren; checksum cocok; nama 2–100; per indikator: nilai sah (wajib bila `required`), bukti bila `evidenceRequired` (D-27: upload beneran, 1 foto/soal), lokasi bila `locationRequired`, catatan ≥10 bila N/A | 1 `Report` + 1 snapshot beku (soal+opsi+bobot+jawaban+skor) + `scorePercent` + `pdfGeneratedAt` + audit + notifikasi; draft dihapus |
| `POST /uploads/self-evidence` | Pola bukti (≤5 MB/20 MP) | Asset bukti jawaban |

Skor: rata-rata terbobot (`bobotJawaban` × pengali indikator), N/A dilewati
bukan nol; opsi lama (`likert-1-5` dsb) hanya dibaca untuk snapshot lama.

## 9. Bank instrumen Validator (D-24)

`GET/POST /validator/bank/dimensions`, `PATCH/DELETE /validator/bank/dimensions/:id`
(`name` ≥3), `POST /validator/bank/indicators` (`code` unik global, `title` ≥5,
`prompt` ≥10, tipe 1 dari 4, aspek se-kategori), `PATCH/DELETE .../:id`
(ganti tipe → opsi reset), `PUT /validator/bank/indicators/:id/options`
(≥2 opsi, nilai unik, bobot 0–100, pengali 0–10 dengan nol ditolak — cermin
mock 1:1). Tiap ubah: `checksum` baru +
audit. Hapus tidak memblokir riwayat (snapshot beku tetap).

`GET /validator/bank/dimensions` mengembalikan bank penuh (dimensi→indikator→opsi
+ `weight` + `isFinding` + `checksum`); beda dari `/instrument/bank` publik yang
menyembunyikan bobot/flag. `GET /validator/state` (D-30.d) adalah proyeksi penuh
`IshasState` khusus adapter frontend — bukan endpoint publik.

## 10. Dokumen indikator (D-16)

| Method + Path | Validasi | Efek |
|---|---|---|
| `POST /uploads/instrument-doc` | PDF (`application/pdf` + `.pdf` + header `%PDF-`), 0–10 MB, nama ≤200 | `instrument-doc-<uuid>` staging |
| `PUT /validator/docs/:indicatorId` | Validator aktif; indikator dikenal; `visibility` Public/Privat (default Privat) | Upsert `DOC-*` + audit (1 indikator = 1 berkas) |
| `POST /validator/docs` | + `code` ≥3, `title` ≥5, kategori wajib (entri manual D-16.g) | Entri manual (tidak jadi soal mandiri) |
| `PATCH /validator/docs/:indicatorId/visibility` | ∈ Public/Privat | Ubah visibilitas + audit |
| `DELETE /validator/docs/:indicatorId` | Konfirmasi client | Hapus metadata + blob + audit |
| `GET /docs/:indicatorId/blob` | Alias ramah-tampilan dari `GET /api/files/:assetId` (rute blob kanonik, lihat `BACKEND_STORAGE.md` §4); `Public` bebas; `Privat` hanya Validator aktif | Stream PDF + `Content-Disposition` |

## 11. SAM-iSAFE Validator (D-26, D-26.e, D-26.f)

| Method + Path | Validasi | Efek |
|---|---|---|
| `GET /validator/sam/bank` | Validator aktif | Kategori + soal aktif + penanda duplikat + hitungan pemakaian |
| `POST /validator/sam/categories` | `name` ≥3, unik | Kategori baru |
| `PATCH /validator/sam/categories/:id` | `name` ≥3, unik | Ubah kategori |
| `DELETE /validator/sam/categories/:id` | Kategori berisi soal → tolak | Hapus kategori |
| `POST /validator/sam/questions` | `text` ≥10, `categoryId` dikenal, `panduan` ≤500, `contohBukti` ≤280 | Soal baru |
| `PATCH /validator/sam/questions/:id` | idem | Ubah soal |
| `POST /validator/sam/questions/:id/move` | `direction up\|down` (juga menerima `naik\|turun` dari UI) | Urutan soal |
| `POST /validator/sam/questions/:id/active` | boolean | Aktif/nonaktif soal |
| `DELETE /validator/sam/questions/:id` | Soal dipakai pengamatan → tolak (suruh nonaktifkan) | Hapus soal |
| `POST /validator/sam/assessments` | Pesantren `Aktif`, area/manual wajib, `observerName` ≥2 | `SAM-xxxx` `Berlangsung` |
| `PUT /validator/sam/assessments/:id/answers` | Skor 0\|1\|2, soal aktif, bukti opsional berpasangan | Jawaban + skor dinamis |
| `POST /validator/sam/assessments/:id/complete` | Semua soal aktif terjawab | `Selesai` + `completedAt` |
| `POST /validator/sam/assessments/:id/review` | Hanya status `Selesai` | `reviewedBy/At` + catatan |
| `DELETE /validator/sam/assessments/:id` | Hanya non-`Selesai` | Hapus pengamatan |
| `POST /validator/sam/follow-ups` | Temuan skor 0/1, unik aktif per soal, PIC ≥2, tenggat ≥ tanggal observasi | `SMF-xxxx` |
| `PATCH /validator/sam/follow-ups/:fid` | PIC ≥2, tenggat ≥ observasi, status sah | Ubah tindak lanjut |
| `POST /validator/sam/follow-ups/:fid/cancel` | `reason` ≥10 | `Dibatalkan` + alasan |

Skor dinamis: `maks = soal aktif × 2`, persen = total/maks × 100, ambang
prototipe ≥80 Rendah / 60–79 Sedang / <60 Tinggi. Tipe observasi dari `SAM_KINDS`.

- `GET /validator/sam/bank` mengembalikan `{categories, questions, duplicates,
  usage, kinds}`; `duplicates` = peta id → id lain berteks sama (D-26.f), `usage`
  = jumlah pengamatan yang menjawab soal itu.
- Bukti jawaban diunggah via `POST /uploads/sam-evidence` (Validator, pesantren
  terdaftar, PNG/JPEG/WebP ≤5 MB/≤20 MP); disajikan lewat `GET /files/:assetId`
  hanya untuk Validator aktif.
- DB menegakkan satu tindak lanjut aktif per `(assessment,question)` lewat
  `active_key` generated (migrasi `0002`); baris `Dibatalkan` boleh menumpuk.

## 12. Admin + dataset + audit

- `POST /admin/institutions`, `POST /admin/institutions/:code/status`
  (`Persiapan→Aktif` tanpa akun diizinkan; syarat terdaftar tetap di selector),
  `POST /admin/users` (nama ≥2, email valid+unik, Pesantren tepat 1 pesantren
  Aktif → status awal `Menunggu` + aktivasi eksplisit), `PATCH /admin/users/:id`
  (peran tak diubah), `POST /admin/users/:id/status|reset-password|delete`
  (proteksi admin terakhir + akun sendiri), `GET /admin/audit?actor=&object=&
  institution=&page=&limit=` (filter pelaku), `GET /admin/state` (proyeksi penuh
  untuk adapter), `POST /admin/reset-demo` (bersihkan storage + seed ulang).
  Kode pesantren baru = `max(PSN-*)+1`; id pengguna baru = `max(USR-*)+1`.
- Storage (D-30.f): `POST /admin/storage/sweep` body `{olderThanHours?}` menghapus
  baris `file_assets` staging (`owner_ref NULL`, kind `*evidence`) yang lebih tua
  + file `tmp-uploads/` kedaluwarsa. `POST /admin/migrate/assets` (sekali jalan,
  flag `indexeddb_migrated`) menerima `{items:[{kind,assetId,... ,base64}]}`;
  `GET /admin/migrate/status` → `{migrated, at}`.
- Dataset (D-25): `GET /validator/dataset?institution=&includeNonRegistered=`
  (filter utama terdaftar + toggle audit + chip status),
  `GET /validator/dataset/export?format=csv|json` (whitelist D-02),
  `POST /validator/dataset/import` body `{text?, rows?, apply?}`: tanpa `apply`
  mengembalikan pratinjau `{valid,errors}` (D-25: parse CSV/JSON server-side);
  `apply:true` menyisipkan baris valid sebagai `Menunggu validasi` + snapshot beku
  + audit + notifikasi pemilik, tidak langsung publik.
- `GET /notifications?account=` (filter penerima; akun sendiri atau Super Admin),
  `POST /notifications/read` body `{ids?}` — tandai dibaca (semua bila `ids`
  kosong); id frontend `NOT-<n>` dipetakan ke `notifications.id`.

## 13. Aturan publikasi audit (D-25.b)

Layak publik bila 5 poin terpenuhi: snapshot lengkap + `Diterima` +
`scorePercent` ada + `pdfGeneratedAt` ada + checksum cocok
(beda = label "bank berubah", snapshot tetap beku).
Endpoint: `GET /validator/publication-audit` — `items[]` berisi `reportId`,
`institutionCode`, `title`, `validationStatus`, `scorePercent`, `pdfGeneratedAt`
+ checklist `{answered, expected, lengkap, diterima, skorAda, pdfAda,
checksumCocok, warisan, layak}`; UI mengambil `institutionCode` untuk pemilih
institusi pada filter, bukan nama/kontak pelapor.

## 14. Health, konfigurasi, dan berkas

| Method + Path | Akses | Efek |
|---|---|---|
| `GET /health` | publik | `{ok:true,data:{status:"ok",db:"ok",version,uptime}}`; dipakai issue Fase 0 |
| `GET /api/v1/files/:assetId` | sesuai `visibility`+scope (`BACKEND_STORAGE.md` §4) | Stream blob, `Content-Disposition: inline`, `nosniff`, `Cache-Control: private, max-age=3600` |
| `POST /uploads/*` | sesuai matriks §1 | Endpoint staging per jenis (report/self/sam/completion/campus/instrument-doc) |
| `POST /admin/*` | Super Admin aktif | Admin, audit, reset, sweep, migrasi (§12) |
| `GET/POST /notifications` | akun sesi | Daftar (`GET /notifications`) + tandai dibaca (`POST /notifications/read`) |

Tidak ada respons API yang memuat `stored_path`/path storage absolut; blob hanya
disajikan lewat `GET /api/v1/files/:assetId` (atau alias `/docs/:indicatorId/blob`).

CORS/lingkungan: dev memakai Vite proxy (same-origin, cookie `SameSite=Lax`
cukup). Bila frontend dan API beda origin di produksi, wajib
`Access-Control-Allow-Origin` eksplisit + `Allow-Credentials: true` + daftar
origin dari env; jangan memakai `*` bersama cookie.

## 15. Endpoint legacy / dilarang diekspos

| Sumber mock | Status kontrak |
|---|---|
| `verifyFinding` (`mock-store.ts:662`) | **Tidak diekspos**; verifikasi lewat `POST /pesantren/recommendations/:id/verify` |
| `savePlanVersion` (`mock-store.ts:877`) | **Tidak diekspos**; diganti `POST /pesantren/campus-plans/publish` |
| `deleteCompletedReport` (`mock-store.ts:621`) | **Tidak diekspos**; alias usang → `POST /pesantren/reports/:id/archive` |
| `createInstrumentDraft`/`addInstrumentDimension`/`addInstrumentIndicator`/`publishInstrument` | **Tidak diekspos**; tulis bank hanya lewat §9 |
| `upsertInstrumentDoc`/`createInstrumentDocEntry`/`setInstrumentDocVisibility`/`deleteInstrumentDoc` (store) | Dipetakan ke §10 (`PUT/POST/PATCH/DELETE /validator/docs`) |

Menghapus laporan langsung tidak ada; arsip (`archivedAt`) adalah pengganti (D-07).

## 16. Auth fase 6 (server, dikerjakan terakhir — D-30)

| Method + Path | Validasi | Efek |
|---|---|---|
| `POST /auth/login` | email + sandi; rate-limit per IP+email (mis. 5/menit) | Set cookie `ishas_session` (`HttpOnly`, `Secure`, `SameSite=Lax`, `Max-Age`), rotasi sesi, audit login |
| `POST /auth/logout` | sesi aktif | Hapus baris `sessions` + clear cookie + audit |
| `GET /auth/me` | cookie valid | Akun aktif + peran + scope (pengganti kartu dummy) |
| `POST /auth/password` | sandi lama benar, sandi baru ≥8 | `password_hash` baru + audit |

- Middleware RBAC menegakkan matriks §1 per endpoint (peran + scope lembaga);
  guard frontend tetap ada sebagai UX saja.
- CSRF: karena cookie `SameSite=Lax` + mutasi `POST`, tambah header
  `X-CSRF-Token` (double-submit) untuk fase produksi.
- `X-Demo-Account` hanya aktif bila `NODE_ENV=development`; production menolak
  tanpa cookie (401).

## 17. Contoh payload ringkas

```jsonc
// POST /reports/lapor-cepat  (header: X-Request-Id)
{ "institutionCode": "PSN-0018", "reporterName": "Ahmad", "title": "Kabel terkelupas di dapur",
  "description": "Kabel dekat kompor terkelupas dan berisiko tersengat.",
  "areaId": "AREA-003", "categoryId": "KAT-KESELAMATAN", "aspectId": "ASP-...",
  "reporterRecommendation": "Bungkus/ganti kabel dan pasang pelindung.",
  "evidenceAssetId": "evidence-asset-<uuid>", "evidenceName": "kabel.jpg" }

// POST /pesantren/reports/RPT-0020/accept
{ "severity": "Tinggi", "priority": "Tinggi", "note": "Dicek hari ini.",
  "rekomendasiFinal": "Ganti kabel dan pasang conduit dalam 3 hari." }

// POST /self-assessments/submit
{ "draftId": "SELF-0001", "reporterName": "Ahmad", "instrumentChecksum": "ck-1a2b3c4d" }

// GET /public/dashboard?institution=PSN-0018
{ "ok": true, "data": { "summary": { "index": 58.0, "reports": 9, "findings": 11 },
  "byInstitution": [ { "code": "PSN-0018", "index": 58.0 }, { "code": "PSN-0019", "index": 70.0 } ],
  "indexHistory": [ { "period": "Agu 2026", "index": 61.0 } ] } }
```
