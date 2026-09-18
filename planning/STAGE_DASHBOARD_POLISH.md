# Penyempurnaan dashboard dan konsistensi dokumentasi

**Status:** REVIEW

**Arahan review terbaru:** samakan tinggi kartu grafik kategori dan rekap lokasi
pada desktop; batasi isi tabel dengan scroll vertikal dan header tetap terlihat.
Ini menggantikan koreksi items-start sebelumnya; ponsel tetap mengikuti isi.

**Catatan historis koreksi review pemilik:** panel grafik kategori desktop masih terlihat
mengambang karena tinggi kartu mengikuti tabel lokasi. Revisi terbatas:
kedua panel mengikuti tinggi isinya, dengan tema, warna, data dan baseline tetap.
**Dasar:** arahan eksplisit pemilik 18 September 2026: mengikuti susunan gambar
dashboard pertama, mempertahankan tema/warna, menyempurnakan responsivitas,
visualisasi, dokumentasi, alur data, dan memperbarui stage berdasarkan bukti.

## Ruang lingkup

- [x] Responsivitas ringkasan, grafik, tabel, navigasi, dan peta dashboard publik.
- [x] Grafik proporsional, nol tanpa batang semu, label lengkap, total konsisten.
- [x] Rekap jawaban memakai versi snapshot; katalog memakai instrumen Published.
- [x] Tautan tindak lanjut mempertahankan konteks pesantren/periode.
- [x] Dokumentasikan alur bersama, unit metrik, periode pratinjau, dan batas publik.
- [x] Sinkronkan README/TODO/daftar stage dengan file stage; pertahankan bukti lama.
- [x] Lint, typecheck, test, build; pemeriksaan browser dan keterbatasannya.

Tema/warna, hak peran, rumus normalisasi ilustratif, dan snapshot historis tetap
mengikuti keputusan yang ada. Dimensi ilmiah tambahan pada gambar Master tidak
ditambahkan pada revisi ini. Status DONE menunggu persetujuan pemilik.

## Hasil pemeriksaan

18 September 2026:

- Lint: tanpa temuan; typecheck lulus; 106 test / 394 assertion lulus; build SPA lulus.
- Regresi tambahan: definisi jawaban/kategori dari versi snapshot asal, Draft tidak
  menambah katalog, laporan pending/ditolak/Completed tidak masuk rekap, dan
  kartu tindakan segera mencakup Tinggi + Ekstrem aktif.
- Browser: ponsel 390×844, tablet 834×1112, desktop 1440×900 dan 1920×1080 diperiksa
  visual. Pemeriksaan batas halaman tambahan pada 320×740 dan 1024×768 lulus.
  Browser memiliki skala tampilan bawaan: lebar CSS teramati 291, 355, 758, 931,
  1309 dan 1745; seluruh scrollWidth halaman ≤ innerWidth.
- Tabel scroll lokal (420/880px pada ponsel), grafik kategori horizontal ponsel,
  SVG tablet dengan baseline/nol, kartu/ringkasan desktop dan kolom kategori pada
  desktop lebar diperiksa. Tema/token warna tidak diubah.
- Tabel kategori dapat digeser dengan keyboard ArrowRight; header tetap satu
  baris dan kolom pertama tetap terlihat. Build ulang setelah perbaikan header lulus.
- Scope semua pesantren dan PSN-0018, filter ke PSN-0019, Back/Forward, notice periode
  Apr 2026, tautan tindak lanjut berpesantren/periode, serta buka/tutup menu ponsel lulus.
- Snapshot lama RPT-0007 / IND-K3L-002 bernilai 3 di luar skala 1/2/Tidak tetap
  tersimpan; 32 jawaban terisi vs 31 diklasifikasi dijelaskan dalam kontrak data.
- Dokumentasi: D-13 amendemen, README/TODO/planning dan file stage diselaraskan;
  Stage 03/04 REVIEW, Stage 07/08/09 IN PROGRESS sesuai pemeriksaan yang belum lengkap.

Batas: bukan uji E2E ulang seluruh peran/alur kirim–validasi–arsip melalui UI.
Pengujian otomatis store mencakup alur terkait; checklist browser stage lain tetap
terbuka. Periode masih pratinjau, rumus ilmiah final belum ada. REVIEW menunggu
pemilik, tanpa commit/push/publikasi.

## Koreksi grafik mengambang — review lanjutan

Grid rekap memakai items-start: kartu kategori mengikuti isi (314px pada
browser desktop 1440×900), bukan tinggi tabel lokasi (614px). Baseline, rasio
batang, tema/warna dan data tetap. Screenshot browser memastikan ruang kosong
besar di dalam kartu hilang; halaman tidak overflow. Lint/typecheck, 106 test
dan build ulang lulus. Status kembali REVIEW; belum DONE.

## Kartu sejajar dan tabel scroll — arahan review terbaru

Desktop breakpoint xl: kedua kartu 22rem (352px), tabel lokasi mengisi sisa ruang
203px pada browser 1440×900 dan dapat digeser vertikal; header sticky serta
legenda tetap terlihat. Keyboard End menggeser scrollTop ke 277px, header tetap
pada offset 0. Screenshot menunjukkan batas atas/bawah kartu sejajar. Ponsel
390×844: kartu mengikuti isi, tabel tinggi 555px tanpa batas vertikal; halaman
tidak overflow. Tema/warna/data tetap. Lint/typecheck, 106 test, build lulus.
Arahan ini menggantikan tinggi isi desktop pada koreksi sebelumnya. REVIEW,
belum DONE.
