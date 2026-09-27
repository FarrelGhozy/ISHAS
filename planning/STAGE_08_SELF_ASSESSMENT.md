# Stage Stage 08 — Penilaian Mandiri (Self-Assessment)

**Revisi D-25 — 28 September 2026 — `IN PROGRESS`:** rapikan Validator
sekaligus (Scoring + Audit publikasi ex Validasi & publikasi + Data penelitian
maksimal). Label `Audit publikasi` (route tetap), filter terdaftar + toggle
non-terdaftar audit, nama dimensi + link PDF, checklist 5 kriteria, provenance
penuh, ekspor whitelist D-02, impor → `Menunggu validasi`. Schema tetap v11.
Scope Stage 08 + sentuhan baca; status stage lain tidak berubah sepihak.

**Revisi D-24 — 28 September 2026 — `IN PROGRESS`:** bank instrumen live tanpa
versioning (edit penuh Validator + 4 tipe jawaban + bobot per opsi), registrasi
penilai + kontak, draft checksum (berubah = ulang), snapshot beku + skor % +
PDF per laporan (`/laporan/:id`, tampil publik setelah Diterima). Cakupan:
docs + schema v11 + store/processor + UI validator/penilaian/laporan + seed +
test. Status stage lain tidak berubah sepihak.

**Pembaruan 18 September 2026:** frontend telah diimplementasikan; catatan izin/
keputusan terbuka pada rancangan awal di bawah bersifat historis. D-06/D-07/D-08/
D-10/D-11 yang terjawab pada 9 September serta D-14/D-15 dibaca dari DECISIONS.md.
Status REVIEW tidak berarti DONE atau seluruh pemeriksaan terbaru sudah lengkap.
Revisi dashboard saat ini dicatat terpisah pada STAGE_DASHBOARD_POLISH.md;
checklist yang belum diverifikasi tetap terbuka.


**Status:** IN PROGRESS
**Acuan terkini:** D-03 membatasi pengirim publik/pengelola; D-24 menggantikan
D-10 (draft checksum bank live: checksum beda = buang draft dan mulai baru;
hasil terkirim tetap snapshot beku); D-11 menyediakan lokasi manual
bila area kosong; D-14.b menjaga lineage titik per jawaban; D-15 memakai empat
kategori. D-04 tetap ilustratif. Stage belum selesai uji penerimaan penuh.
**Dependensi:** Stage 01 (model), Stage 03 (pola kirim), Stage 05 (antrean penerima) `DONE`;
Stage 07 disarankan (area tersedia).
**Tujuan:** memindahkan kemampuan `AssessmentFlow` asesor menjadi penilaian mandiri publik:
tanpa penugasan, versi terkunci otomatis, draft lokal, kirim untuk validasi.

## Ruang lingkup

### 1. Salin-adaptasi komponen penilaian dari lama (HISTORIS — sudah lewat D-24)

> Catatan 27 Sep 2026: implementasi sudah memakai `self-assessment-flow`
> baru di aplikasi ISHAS + bank live `INS-LIVE` (bukan salinan asesor, tanpa
> versioning). Checklist salin di bawah historis; acuan berlaku = §2 + D-24.

- [ ] Salin pola `features/asesor/components/assessment-flow.tsx` lama menjadi
 `features/publik/`… `self-assessment-flow.tsx` di aplikasi ISHAS
 dengan props `{ institutionCode, reporterName, onSubmitForValidation }`.
- [ ] HAPUS dari salinan: pemilih penugasan, 4 checkbox verifikasi, teks "di luar penugasan", nama asesor hard-code
 (`Ahmad Fauzan` → identitas pelapor dinamis; `observedAt` berisi waktu observasi, bukan nama).
- [ ] Halaman penilaian mandiri dibangun baru di aplikasi ISHAS; tidak ada file asesor yang dipindah.

### 2. Halaman `/penilaian-mandiri`

- [x] Arahan 18 September: akses `Penilaian mandiri` melalui navbar publik
  dashboard (desktop dan menu ponsel); konteks pesantren/periode tetap terbawa.

- [x] Pemilih pesantren* + registrasi penilai* (aturan sama Stage 03) SEBELUM pertanyaan; banner bank live
 `Bank instrumen live · perubahan soal membuat draft harus mengulang` (D-24; tanpa indikator →
 halaman terkunci + pesan `Belum ada instrumen.`).
- [x] Tiga kolom (navigasi dimensi | pertanyaan | kelengkapan);
 ponsel menumpuk (navigasi menjadi accordion).
- [ ] Per indikator: jawaban* (semua required) + catatan (wajib bila N/A, min 10) +
 bukti* (bila `evidenceRequired`, nama file dummy) + lokasi* (bila `locationRequired`:
 dropdown area + titik denah `x/y` bila denah ada; area saja cukup bila tanpa denah) +
 sumber instrumen (hanya-baca).
- [x] Draft autosave per perubahan (localStorage per pesantren);
 refresh melanjutkan dari `activeIndex` terakhir; pindah pesantren = draft terpisah (peringatan bila beralih).
- [ ] Tinjau: 4 kelompok (jawaban/bukti/catatan N/A/lokasi) + lompat ke indikator bermasalah +
 **Kirim untuk validasi** (disabled bila kurang) + dialog konfirmasi final.
- [x] Kirim → `submitSelfAssessment`: snapshot permanen seluruh jawaban/bukti/lokasi + kunci kiriman + 1 `Report` kanal `penilaian-mandiri` +
 kandidat temuan sesuai konfigurasi ilustratif versi (`1/2/Tidak` hanya contoh seed) + audit + notifikasi pengelola +
 layar sukses bernomor (sama Stage 03). Tidak ada jalur tampil langsung sebelum validasi.

### 3. Hasil yang diterima

- [ ] Laporan penilaian yang `Diterima` membentuk hasil dimensi ilustratif + temuan + rekomendasi
 berlabel kanal `Penilaian mandiri`; hasil skor berasal dari instrumen, sedangkan lapor-cepat menyumbang laporan/temuan tanpa skor instrumen.

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 8 lulus penuh (termasuk bank kosong, tak-lengkap, refresh, checksum basi, kirim).
- [ ] Tidak ada sisa istilah penugasan/asesor/finalisasi di halaman ini (grep bersih).
- [ ] Copy WIREFRAMES §3; visual 3 viewport; keyboard; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- Revisi D-25 (28 Sep 2026): lint + typecheck + 175 test + build lulus.
  Render SSR 4 halaman (Scoring, Audit publikasi, Data penelitian, dashboard
  validator) lulus via test. Cek visual 3 viewport + keyboard browser belum
  dijalankan (Chromium tidak tersedia di lingkungan ini).
- (Template `TEST_PLAN.md` §6.)
- Tambahan navbar 18 September: siap REVIEW untuk perubahan terbatas ini;
  stage lainnya belum dinyatakan selesai. Typecheck, lint, 82 test dan build lulus.
  Browser: tautan `/penilaian-mandiri?pesantren=PSN-0018` membuka pesantren yang
  dipilih, menu menutup setelah klik, penanda aktif benar; navigasi desktop/tablet
  dan menu ponsel diperiksa. Tidak mengubah alur/draft penilaian atau hak akses.
