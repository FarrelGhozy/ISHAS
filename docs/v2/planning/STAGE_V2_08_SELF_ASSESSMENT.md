# Stage V2-08 — Penilaian Mandiri (Self-Assessment)

**Status:** IN PROGRESS
**Catatan review:** belum diizinkan membuat kode tanpa arahan pemilik. Bagian terkait D-04, D-05, D-06, D-10 dan D-11
masih menunggu keputusan di `../DECISIONS.md`; D-03 telah dijawab (kirim: publik + pengelola).
Checklist di bawah adalah rancangan awal; ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01 (model), V2-03 (pola kirim), V2-05 (antrean penerima) `DONE`;
V2-07 disarankan (area tersedia).
**Tujuan:** memindahkan kemampuan `AssessmentFlow` asesor menjadi penilaian mandiri publik:
tanpa penugasan, versi terkunci otomatis, draft lokal, kirim untuk validasi.

## Ruang lingkup

### 1. Salin-adaptasi komponen penilaian dari V1 (aplikasi terpisah — D-01; bukan pemindahan file)

- [ ] Salin pola `features/asesor/components/assessment-flow.tsx` V1 menjadi
  `features/publik/`… `self-assessment-flow.tsx` di aplikasi ISHAS
  dengan props `{ institutionCode, reporterName, onSubmitForValidation }`.
- [ ] HAPUS dari salinan: pemilih penugasan, 4 checkbox verifikasi, teks "di luar penugasan", nama asesor hard-code
  (`Ahmad Fauzan` → identitas pelapor dinamis; `observedAt` berisi waktu observasi, bukan nama).
- [ ] Halaman penilaian mandiri dibangun baru di aplikasi ISHAS; tidak ada file asesor yang dipindah.

### 2. Halaman `/penilaian-mandiri`

- [x] Pemilih pesantren* + nama pelapor* (aturan sama V2-03) SEBELUM pertanyaan; banner kunci versi
  `Menggunakan [ISHAS vX.Y] · terkunci selama pengisian` (versi = Published aktif; tanpa Published →
  halaman terkunci + pesan `Belum ada instrumen yang dipublikasikan.`).
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
  layar sukses bernomor (sama V2-03). Tidak ada jalur tampil langsung sebelum validasi.

### 3. Hasil yang diterima

- [ ] Laporan penilaian yang `Diterima` membentuk hasil dimensi ilustratif + temuan + rekomendasi
  berlabel kanal `Penilaian mandiri`; hasil skor berasal dari instrumen, sedangkan lapor-cepat menyumbang laporan/temuan tanpa skor instrumen.

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 8 lulus penuh (termasuk tanpa-Published, tak-lengkap, refresh, kirim).
- [ ] Tidak ada sisa istilah penugasan/asesor/finalisasi di halaman ini (grep bersih).
- [ ] Copy WIREFRAMES §3; visual 3 viewport; keyboard; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
