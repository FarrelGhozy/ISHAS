# V2 — Backlog Pembangunan (Berurutan + Dependensi)

> Antrean ini belum aktif. Saat ini hanya V2-00 untuk diskusi dan perbaikan dokumen.
> Urutan pembangunan berikut masih calon urutan; perlu diselaraskan setelah keputusan terbuka dijawab.

## Sebelum Tahap A — Selesaikan validasi rencana

- Ikuti `DECISIONS.md`, `VALIDATION_REVIEW.md`, dan `DATA_REQUIREMENTS.md`.
- Tentukan cara pembangunan serta batas proyek (D-01), data publik (D-02), hak lapor (D-03),
  sumber hasil/agregat (D-04), dan hubungan status/temuan/riwayat (D-05–D-07).
- Perjelas akun, pesantren, draft/versi, lokasi, dan desain (D-08–D-12).
- Tinjau urutan dependensi: kontrak Peneliti dan hasil tidak boleh baru diketahui saat rilis;
  area awal perlu siap untuk demo kirim; integrasi diuji setelah kedua sisi alur tersedia.
- Persetujuan dokumen tidak otomatis menjadi izin mulai kode.

## Tahap A — Fondasi (dependensi: tidak ada)

- A1. Naikkan mock schema ke v4 + entitas `Report`/`SelfAssessmentDraft` + seed minimum (§DATA_MODEL-5) + `resetMockData`.
  Selesai bila: reset menghasilkan seed konsisten; bedakan tiga pesantren `Aktif` dari jumlah pesantren **terdaftar** yang mempunyai pengelola aktif (DATA_REQUIREMENTS §8).
- A2. Hapus asesor dari `demo-accounts`, `workspace-config`, `login-screen`, guard; route `/asesor/*` menampilkan pesan khusus.
  Selesai bila: grep `asesor` tidak menemukan impor aktif (kecuali dokumen/migrasi).
- A3. Arsip landing ke `features/_archived-landing/`; `/` merender dashboard publik.
  Selesai bila: `/` tanpa login menampilkan dashboard, tanpa redirect.

## Tahap B — Publik (dependensi: A)

- B1. Shell publik + pemilih pesantren + agregat (hanya `Diterima`).
  Selesai bila: filter pesantren mengubah seluruh angka/grafik/temuan; nol pesantren → empty state + CTA nonaktif.
- B2. `/lapor` + validasi field + layar sukses bernomor + audit + notifikasi pengelola.
  Selesai bila: kirim tanpa login berhasil; laporan tidak tampil di dashboard; muncul di antrean pengelola pemilik scope.
- B3. `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut` (baca), `/laporan` dengan filter pesantren.
  Selesai bila: tiap halaman hanya menampilkan data `Diterima` dan konsisten lintas halaman untuk filter yang sama.

## Tahap C — Moderasi (dependensi: B)

- C1. `/pengelola/validasi-laporan` (filter + detail hanya-baca + terima/tolak wajib field).
  Selesai bila: terima tanpa severity/priority DITOLAK sistem; tolak tanpa alasan DITOLAK sistem.
- C2. Lifecycle `Pending → Proses → Completed` + syarat per transisi (PIC/tenggat/bukti) + hapus `Completed` + audit.
  Selesai bila: seluruh transisi sah/locked sesuai FLOWS §5; penghapusan meninggalkan audit.
- C3. Lokasi (gedung/lantai/area/denah) + tindak lanjut kelola + laporan pimpinan scope sendiri.
  Selesai bila: area baru muncul di dropdown lapor pesantren yang sama.

## Tahap D — Self-assessment (dependensi: A, B2, C1)

- D1. Pindahan `AssessmentFlow` → self-assessment (tanpa penugasan) + kunci versi Published + draft lokal + tinjau 4 kelompok.
  Selesai bila: refresh melanjutkan dari indikator terakhir; kirim membentuk `Report` + kandidat temuan; tidak ada jalur finalisasi langsung.
- D2. Tampilkan hasil penilaian mandiri yang `Diterima` di hasil/peta/rekomendasi dengan label kanal.

## Tahap E — Admin & sinkron dokumen (dependensi: C)

- E1. Admin: verifikasi pesantren, buat akun pengelola → pemilih publik bertambah; hapus opsi asesor.
- E2. Inventaris kebutuhan sinkronisasi dokumen root/frontend. Eksekusi hanya pada pekerjaan pembangunan berikutnya sesuai D-01; file di luar V2 tidak diubah pada sesi diskusi ini.
- E3. Pemeriksaan akhir: 27+ route, guard anonim/3 peran, desktop/tablet/ponsel, lint, TypeScript, test, build → Stage 12 `REVIEW`.

## Ditunda ke backend / luar prototipe (dilarang dikerjakan di V2)

- Auth produksi, CAPTCHA/rate-limit nyata, upload/object storage nyata, render denah unggahan, PDF/Excel nyata, email nyata.
- Rumus indeks, bobot, ambang, recommendation rule resmi (tetap dummy berlabel).
- Rename `/pengelola` → `/pesantren`, GIS, multi-bahasa, mobile native, IoT.
- Landing permanen (menunggu keputusan dosen).

## Keputusan ilmiah yang masih menunggu (dicatat, bukan diputuskan frontend)

- Rumus indeks akhir dan bobot dimensi; ambang kategori; standar wajib per indikator; skala severity/priority resmi; pemilik verifikasi lintas pesantren.

## Catatan integrasi per tahap

- V2-03 dapat memeriksa kiriman tersimpan, status, scope, audit, dan notifikasi pada data dummy;
  uji UI pengelola menerima/menolak baru lengkap bersama V2-05.
- V2-07 dapat memeriksa area di form laporan cepat; uji area di penilaian mandiri menunggu V2-08.
- Saat V2-09 menguji integrasi, stage terdahulu yang sudah `DONE` tetap `DONE` kecuali pemilik
  meminta pembukaan ulang. Catat hasil integrasi dan regresi secara terpisah.
