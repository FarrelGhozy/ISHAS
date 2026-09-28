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
  untuk pengembangan); fase 6 diganti cookie sesi (lihat `BACKEND_MIGRATION.md`).

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
| `GET /public/reports/:id/pdf-data` | Hanya laporan `penilaian-mandiri` + `Diterima` | Kop + skor beku + dimensi + temuan (lokasi, severity/priority final, status/progres/PIC) + foto bukti + metadata (D-28, tanpa jawaban mentah) |
| `GET /public/docs?q=&category=&visibility=` | Blob privat di-strip (`assetId=""`) | Baris katalog + filter; `Privat` hanya nama + gembok |
| `GET /public/institutions` | — | Hanya terdaftar (pemilih publik) |
| `GET /public/institutions/:code` | Tak dikenal → empty, bukan 404 teknis | Profil ringkas (kota saja, tanpa alamat lengkap — D-02) |

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
(≥2 opsi, label unik, bobot 0–100, pengali 0–10). Tiap ubah: `checksum` baru +
audit. Hapus tidak memblokir riwayat (snapshot beku tetap).

## 10. Dokumen indikator (D-16)

| Method + Path | Validasi | Efek |
|---|---|---|
| `POST /uploads/instrument-doc` | PDF (`application/pdf` + `.pdf` + header `%PDF-`), 0–10 MB, nama ≤200 | `instrument-doc-<uuid>` staging |
| `PUT /validator/docs/:indicatorId` | Validator aktif; indikator dikenal; `visibility` Public/Privat (default Privat) | Upsert `DOC-*` + audit (1 indikator = 1 berkas) |
| `POST /validator/docs` | + `code` ≥3, `title` ≥5, kategori wajib (entri manual D-16.g) | Entri manual (tidak jadi soal mandiri) |
| `PATCH /validator/docs/:indicatorId/visibility` | ∈ Public/Privat | Ubah visibilitas + audit |
| `DELETE /validator/docs/:indicatorId` | Konfirmasi client | Hapus metadata + blob + audit |
| `GET /docs/:indicatorId/blob` | `Public` bebas; `Privat` hanya Validator aktif | Stream PDF + `Content-Disposition` |

## 11. SAM-iSAFE Validator (D-26, D-26.e, D-26.f)

- `GET /validator/sam/bank` (kategori + soal aktif + penanda duplikat),
  CRUD `POST/PATCH/DELETE /validator/sam/categories|questions`,
  `POST .../questions/:id/move`, `POST .../questions/:id/active`.
  Hapus kategori berisi soal ditolak; hapus soal yang dipakai pengamatan
  ditolak (suruh nonaktifkan). `panduan` ≤500, `contohBukti` ≤280.
- `POST /validator/sam/assessments` (pesantren Aktif, area/manual wajib,
  `observerName` ≥2), `PUT .../:id/answers` (skor 0|1|2, soal aktif,
  bukti opsional berpasangan), `POST .../:id/complete` (semua soal aktif
  terjawab), `POST .../:id/review` (hanya `Selesai`), `DELETE .../:id`
  (hanya non-`Selesai`).
- Tindak lanjut temuan (skor 0/1): `POST /validator/sam/follow-ups`
  (unik aktif per soal, PIC ≥2, tenggat ≥ observasi),
  `PATCH .../:fid`, `POST .../:fid/cancel` (alasan ≥10).
- Skor dinamis: `maks = soal aktif × 2`, persen = total/maks × 100,
  ambang prototipe ≥80 Rendah / 60–79 Sedang / <60 Tinggi.

## 12. Admin + dataset + audit

- `POST /admin/institutions`, `POST /admin/institutions/:code/status`
  (`Persiapan→Aktif` tanpa akun diizinkan; syarat terdaftar tetap di selector),
  `POST /admin/users` (nama ≥2, email valid+unik, Pesantren tepat 1 pesantren
  Aktif → status awal `Menunggu` + aktivasi eksplisit), `PATCH /admin/users/:id`
  (peran tak diubah), `POST /admin/users/:id/status|reset-password|delete`
  (proteksi admin terakhir + akun sendiri), `GET /admin/audit` (filter pelaku),
  `POST /admin/reset-demo` (`--mode=demo`, audit).
- Dataset (D-25): `GET /validator/dataset?institution=&includeNonRegistered=`
  (filter utama terdaftar + toggle audit + chip status),
  `GET /validator/dataset/export?format=csv|json` (whitelist D-02),
  `POST /validator/dataset/import` (≤200 baris → validasi → pratinjau →
  terapkan sebagai `Menunggu validasi`, tidak langsung publik).
- `GET /notifications?account=` (filter penerima), `POST /notifications/read`.

## 13. Aturan publikasi audit (D-25.b)

Layak publik bila 5 poin terpenuhi: snapshot lengkap + `Diterima` +
`scorePercent` ada + `pdfGeneratedAt` ada + checksum cocok
(beda = label "bank berubah", snapshot tetap beku).
Endpoint: `GET /validator/publication-audit` (checklist per laporan + tautan
PDF/Scoring/Dataset).
