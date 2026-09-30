# Laporan Pengujian Alur Data & API

Tanggal: 30 September 2026
Lingkungan: mode backend (`VITE_USE_BACKEND=true`), MySQL dev `ishas` +
DB uji `ishas_test`, API `:3004`, web `:3003`.
Fokus: endpoint **tulis/input** dan alurnya hingga baca publik/workspace.

## 1. Metode (berlapis)

| Lapis | Alat | Cakupan |
|---|---|---|
| L1 unit | `apps/api/tests`, `apps/web/mocks` | validasi murni, checksum, helper |
| L2 integrasi DB | `db.integration.test.ts` (DB uji) | skema, seed, alur HTTP + scope + transaksi |
| L3 kontrak payload | `repository.test.ts`, `db.integration.test.ts` | bentuk body `http-repository` diterima backend |
| L4 E2E browser | Chromium cache + Playwright script | input lewat UI → persistensi → baca workspace |

Catatan alat: channel Chrome sistem tidak tersedia dan tidak dapat dipasang
(butuh sudo). Playwright MCP menolak start; E2E dijalankan dengan
`playwright-core` + Chromium cache (`chromium-1243`).

## 2. Baseline sebelum perubahan

- API: lint, typecheck, **111 test** (DB uji) hijau.
- Web: lint, typecheck, **292 test** hijau.

## 3. Test yang ditambahkan

| Berkas | Tambahan | Inti |
|---|---|---|
| `apps/api/tests/db.integration.test.ts` | +7 test | isolasi scope tulis Pesantren (reject/status/archive/temuan/rekomendasi/lantai), detail laporan scope, unggah bukti penyelesaian, validasi impor dataset via `rows`, rollback/commit `sequences` |
| `apps/web/shared/api/repository.test.ts` | +6 test | kontrak payload: `{options, weight}`, dokumen dua langkah, `{rows, apply:true}`, `{active}`, follow-up SAM, status/reject/level |
| `apps/web/features/publik/lib/param-pesantren.test.ts` | +7 test (baru) | regresi D-42 (param/ingatan pesantren) |

Hasil akhir: API **118 test**, web **305 test** — hijau.

## 4. Hasil E2E browser (13/13 lulus)

- Login 3 kartu peran (Super Admin → `/admin/dashboard`, Validator, Pesantren).
- `/lapor` tanpa login: kirim → nomor `RPT-0022` tampil → laporan muncul di
  antrean Pesantren pemilik (verifikasi via API).
- `/penilaian-mandiri`: registrasi + jawaban tersimpan ke server
  (`{"IND-K3L-001":{"value":"1"}}`) dan dipulihkan ke UI setelah reload.
- `/validator/instrumen` (baca) memuat indikator.
- `/pesantren/validasi-laporan` menampilkan laporan E2E.
- Deep link `?pesantren=` (`/lapor` dan `/penilaian-mandiri`) memakai param dengan benar.

## 5. Temuan

### F-01 — `?pesantren=` diabaikan pada muat dingin (DIPERBAIKI, D-42)

- Gejala: pada reload/deep link mode backend, select pesantren kosong, draft
  penilaian mandiri tidak dipulihkan (`GET .../drafts/SELF-baru` alih-alih
  `SELF-PSN-0019`), prefill `/lapor` hilang.
- Akar masalah: `registeredCodes` belum termuat pada render pertama sehingga
  `?pesantren=` dianggap tidak valid; state dipilih sekali (`useState`) dan tidak
  disinkronkan saat daftar tiba.
- Perbaikan: helper `pilihInstitusiAwal` + `paramPesantrenTidakSah`
  (`apps/web/features/publik/lib/param-pesantren.ts`); dipakai `/lapor` dan
  `/penilaian-mandiri`; pesan "tidak sah" ditahan sampai daftar siap; pesantren
  terakhir dipulihkan. 7 test regresi + verifikasi E2E deep link.
- Bukti sesudah: select `PSN-0019`, nama draft dipulihkan, `GET
  .../drafts/SELF-PSN-0019`.

### H-01 — Impor dataset via `rows` (TERBUKTI AMAN)

Kekhawatiran awal: `POST /validator/dataset/import` dengan `rows` melewati
parsing server (`validator.ts:540`). Terbukti **tidak** bocor: `applyDatasetImport`
tetap memanggil `validateImportRows` (`domain/dataset.ts:144`). Ditambah test
regresi: baris pesantren tak terdaftar / `scorePercent` di luar 0–100 ditolak
`400` dan tidak ada baris masuk.

### Observasi (bukan bug)

- `GET /api/v1/auth/me` mengembalikan `401` untuk pengunjung anonim di halaman
  publik — perilaku wajar; hanya memunculkan pesan konsol.

## 6. Dampak pada DB demo

E2E berjalan pada data demo apa adanya (sesuai keputusan, tanpa reset). Tercatat
tambahan: laporan `RPT-0020`, `RPT-0021`, `RPT-0022` (`Menunggu validasi`) dan
draft `SELF-PSN-0019`. DB uji `ishas_test` dipakai untuk semua uji destruktif
(`TRUNCATE`/seed) dan boleh di-reset kapan saja.

## 7. Verifikasi akhir

- `apps/api`: lint, typecheck, `DB_NAME=ishas_test bun test` → **118 lulus**.
- `apps/web`: lint, typecheck, `bun test` → **305 lulus**, `bun run build` sukses.

## 8. Batas

- Uji keyboard/fokus dan 3 viewport visual penuh belum dijalankan menyeluruh
  (di luar fokus alur data tulis).
- E2E tidak menguji operasi destruktif admin (reset-demo/hapus) lewat UI; itu
  hanya diuji di DB uji.
