# Backlog Pembangunan (Berurutan + Dependensi)

> Antrean ini belum aktif. Saat ini hanya Stage 00 untuk diskusi dan perbaikan dokumen.
> Urutan pembangunan berikut masih calon urutan; perlu diselaraskan setelah keputusan terbuka dijawab.

## Sebelum Tahap A — Keputusan fondasi (D-01–D-03 dijawab 8 September 2026)

- D-01 dijawab: **aplikasi ISHAS** — React Router, file dipecah per folder fitur,
  dijalankan dengan bun 1.4. Lokasi folder aplikasi menunggu konfirmasi pemilik.
- D-02 dijawab: publik **ringkasan saja** + nama validator/PIC; count antrean tidak publik;
 opsi anonim tidak dibangun; matriks bidang di `DATA_REQUIREMENTS.md` §6.
- D-03 dijawab: hanya publik + pengelola yang boleh kirim; pengelola boleh lapor ke pesantren lain
 sebagai pelapor umum; Super Admin/Peneliti harus keluar dahulu.
- Masih terbuka sebelum/bersamaan pembangunan: sumber hasil/agregat (D-04), temuan/status/riwayat
 (D-05–D-07), pesantren/akun (D-08/D-09), draft/versi (D-10), lokasi awal (D-11), tampilan (D-12).
 Kontrak Peneliti dan hasil tidak boleh baru diketahui saat rilis; area awal perlu siap untuk demo kirim.
- Persetujuan dokumen tidak otomatis menjadi izin mulai kode — arahan mulai kode datang dari pemilik.

## Tahap A (Stage 01) — Fondasi (dependensi: tidak ada)

- A1. Scaffold aplikasi ISHAS (React Router + bun 1.4 + TypeScript, folder per fitur) + mock schema v4
 + entitas `Report`/`SelfAssessmentDraft` + seed minimum (§DATA_MODEL-5) + `resetMockData`.
 Selesai bila: reset menghasilkan seed konsisten; bedakan tiga pesantren `Aktif` dari jumlah pesantren **terdaftar** yang mempunyai pengelola aktif (DATA_REQUIREMENTS §8).
- A2. Bangun login 3 kartu (tanpa asesor) + sesi dummy menunjuk ID akun + guard workspace + route
 `/asesor/*` menampilkan pesan penghentian bila ada URL lama tersimpan di browser.
 Selesai bila: grep `asesor` nihil di kode aktif (kecuali pesan penghentian/dokumen).
- A3. `/` merender dashboard publik dari awal (tanpa landing, tanpa redirect).
  Selesai bila: `/` tanpa login menampilkan dashboard, tanpa redirect.

## Tahap B (Stage 02–Stage 04) — Publik (dependensi: A)

- B1. Shell publik + pemilih pesantren + agregat (hanya `Diterima`; tanpa panel count antrean — D-02).
 Selesai bila: filter pesantren mengubah seluruh angka/grafik/temuan; nol pesantren → empty state + CTA nonaktif.
- B2. `/lapor` + validasi field + layar sukses bernomor + audit + notifikasi pengelola.
 Selesai bila: kirim tanpa login berhasil; laporan tidak tampil di dashboard; muncul di antrean pengelola pemilik scope.
- B3. `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut` (baca), `/laporan` dengan filter pesantren.
 Selesai bila: tiap halaman hanya menampilkan data `Diterima` dan konsisten lintas halaman untuk filter yang sama.

## Tahap C (Stage 05–Stage 07) — Moderasi (dependensi: B)

- C1. `/pengelola/validasi-laporan` (filter + detail hanya-baca + terima/tolak wajib field).
 Selesai bila: terima tanpa severity/priority DITOLAK sistem; tolak tanpa alasan DITOLAK sistem.
- C2. Lifecycle `Pending → Proses → Completed` + syarat per transisi (PIC/tenggat/bukti) + hapus `Completed` + audit.
 Selesai bila: seluruh transisi sah/locked sesuai FLOWS §5; penghapusan meninggalkan audit.
- C3. Lokasi (gedung/lantai/area/denah) + tindak lanjut kelola + laporan pimpinan scope sendiri.
 Selesai bila: area baru muncul di dropdown lapor pesantren yang sama.

## Tahap D (Stage 08) — Self-assessment (dependensi: A, B2, C1)

- D1. Pindahan `AssessmentFlow` → self-assessment (tanpa penugasan) + kunci versi Published + draft lokal + tinjau 4 kelompok.
 Selesai bila: refresh melanjutkan dari indikator terakhir; kirim membentuk `Report` + kandidat temuan; tidak ada jalur tampil langsung sebelum validasi.
- D2. Tampilkan hasil penilaian mandiri yang `Diterima` di hasil/peta/rekomendasi dengan label kanal.

## Tahap E (Stage 09) — Admin & sinkron dokumen (dependensi: C)

- E1. Admin: verifikasi pesantren, buat akun pengelola → pemilih publik bertambah; tanpa opsi asesor.
- E2. Dokumen yang diperlukan adalah dokumen proyek ISHAS (README, flow) yang ditulis bersama pembangunan.
- E3. Pemeriksaan akhir: 27 pola route kanonis + kasus redirect/URL lama, guard anonim/3 peran, desktop/tablet/ponsel, lint, TypeScript, test, build.

## Ditunda ke backend / luar prototipe

- Auth produksi, CAPTCHA/rate-limit nyata, upload/object storage nyata, render denah unggahan, PDF/Excel nyata, email nyata.
- Rumus indeks, bobot, ambang, recommendation rule resmi (tetap dummy berlabel).
- Rename `/pengelola` → `/pesantren`, GIS, multi-bahasa, mobile native, IoT.
- Landing permanen (menunggu keputusan dosen).

## Keputusan ilmiah yang masih menunggu (dicatat, bukan diputuskan frontend)

- Rumus indeks akhir dan bobot dimensi; ambang kategori; standar wajib per indikator; skala severity/priority resmi; pemilik verifikasi lintas pesantren.

## Catatan integrasi per tahap

- Stage 03 dapat memeriksa kiriman tersimpan, status, scope, audit, dan notifikasi pada data dummy;
 uji UI pengelola menerima/menolak baru lengkap bersama Stage 05.
- Stage 07 dapat memeriksa area di form laporan cepat; uji area di penilaian mandiri menunggu Stage 08.
- Saat Stage 09 menguji integrasi, stage terdahulu yang sudah `DONE` tetap `DONE` kecuali pemilik
 meminta pembukaan ulang. Catat hasil integrasi dan regresi secara terpisah.
