# V2 — Rencana Pengujian (TEST PLAN)

Dipakai untuk memverifikasi TIAP stage sebelum pindah ke `REVIEW` sesuai jenis luarannya.
Tulis hasilnya di bagian `Hasil Pemeriksaan` file stage (tanggal + lulus/gagal + catatan).

## 0. Pemeriksaan rencana — V2-00, tanpa kode

- Seluruh dokumen telah dibaca; konflik mempunyai rujukan bukti dan D-ID di `DECISIONS.md`.
- Arahan pemilik, arah terdahulu, usulan, dan keputusan belum dijawab dapat dibedakan.
- README, TODO, planning, dan file stage sepakat bahwa implementasi belum aktif.
- Tautan dokumen relatif mengarah ke berkas yang ada; rujukan bagian diperiksa.
- Tambahan detail tidak menetapkan rumus, izin peran, keterbukaan data, atau kebijakan hapus tanpa keputusan.
- Periksa perubahan hanya di `docs/v2/`; file pengguna yang sudah berubah sebelumnya tetap utuh.
- Catat keputusan terbuka sebagai belum selesai; jangan menandai lulus produk atau selesai diskusi.
- Lint/typecheck/test/build dan browser tidak diperlukan untuk revisi Markdown ini; bukan bukti V2 sudah bekerja.

## 1. Matriks route — setelah pembangunan diizinkan

Periksa hasil navigasi, isi, sesi, dan scope yang benar. Route yang memang mengalihkan pengguna
tidak wajib merespons HTTP 200 pada permintaan awal; periksa tujuan serta tidak ada loop/kebocoran konten.
Inventaris ROUTES memuat 27 pola kanonis; tabel berikut mengelompokkan kasus, bukan menghitung URL unik.
Kasus yang bergantung keputusan terbuka belum mempunyai hasil harapan final.

| # | URL | Kondisi | Harapan |
|---|---|---|---|
| 1 | `/` | tanpa login | dashboard agregat + pemilih pesantren |
| 2 | `/` | login tiap peran | isi SAMA seperti anonim + tombol ruang kerja |
| 3 | `/lapor` | tanpa login | form aktif bila ada pesantren terdaftar |
| 4 | `/penilaian-mandiri` | tanpa login | form aktif bila ada Published |
| 5 | `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut`, `/laporan` | tanpa login | hanya data `Diterima` |
| 6 | `/pesantren/PSN-0018` | tanpa login | filter terkunci ke lembaga itu |
| 7 | `/pesantren/XXX-tak-dikenal` | tanpa login | empty state, bukan crash |
| 8 | `/login` | — | tepat 3 kartu akun, tanpa asesor |
| 9 | `/admin/*` (6 route) | admin / anonim / peran salah | allowed / → `/login` / → `/akses-ditolak` |
| 10 | `/peneliti/*` (6 route) | peneliti / anonim / peran salah | allowed / → `/login` / → `/akses-ditolak` |
| 11 | `/pengelola/validasi-laporan` dkk | pengelola / anonim / peran salah | allowed scope sendiri / → `/login` / → `/akses-ditolak` |
| 12 | `/asesor/*` (sisa lama) | siapa pun | pesan penghapusan + tombol ke `/penilaian-mandiri` |

## 2. Matriks guard dan sesi

- Refresh di tiap route: sesi login pulih; draft lapor/penilaian pulih di indikator terakhir; filter pesantren tidak hilang selama sesi halaman.
- Back/Forward browser: halaman mengikuti URL tanpa state basi.
- Logout: sesi bersih, mendarat di `/`, route workspace mengarah ke `/login`.
- Sesi lama berisi role `asesor` (data browser usang): dibersihkan saat baca, tidak crash.
- State tidak kompatibel yang dibaca dari key V2: pemulihan mengikuti aturan versi; tombol reset V2 mengembalikan seed V2. Penanganan key V1 menunggu D-01.

Catatan key/reset: V1 memakai `ishas-domain-v3`. Pengujian key lama dan hidup berdampingan
harus mengikuti D-01; perubahan key saja bukan migrasi atau penghapusan. Uji dua akun pengelola
dengan role sama untuk memastikan sesi menunjuk ID akun, bukan role saja.

## 3. Alur kritis ujung-ke-ujung (skenario wajib)

1. **Lapor anonim:** isi form → kirim → nomor `RPT-XXXX` + `Menunggu validasi` → TIDAK tampil di dashboard → muncul di antrean pengelola pemilik scope (tidak di scope lain).
2. **Lapor saat login pengelola:** nama terisi otomatis + dapat diubah → perilaku tampil sama seperti anonim.
3. **Terima:** tanpa severity/priority DITOLAK sistem → lengkap → tampil di dashboard/hasil/peta + audit + notifikasi.
4. **Tolak:** tanpa alasan DITOLAK sistem → lengkap → arsip pengelola pemilik, tidak tampil publik; validator/waktu/alasan tersimpan.
5. **Lifecycle:** Pending→Proses tanpa PIC/tenggat DITOLAK → lengkap → Proses→Completed tanpa bukti DITOLAK → lengkap → hapus/arsip hanya sesuai D-07. Audit tidak ikut penghapusan laporan biasa; reset demo adalah tindakan berbeda.
6. **Scope isolation:** pengelola A tidak melihat laporan pesantren B di antrean, filter, maupun notifikasi.
7. **Pesantren tak terdaftar:** tidak muncul di pemilih; lapor langsung via URL dengan kode tak valid DITOLAK dengan pesan.
8. **Self-assessment:** tanpa Published → form terkunci + pesan; kirim tak lengkap DITOLAK; refresh melanjutkan draft; kirim → antrean → terima → hasil berlabel kanal.

## 4. Visual dan aksesibilitas (3 viewport: 1440×900, 834×1112, 390×844)

- Tidak ada overflow horizontal halaman; tabel lebar boleh scroll di dalam wadahnya.
- Semua status memakai pasangan kelas+ikon+label `DESIGN_SYSTEM.md` §2 (cek spot: severity, handling, kanal, banner publik).
- Copy halaman sama persis dengan `WIREFRAMES.md` (cek spot per halaman).
- Keyboard: Tab mencapai pemilih pesantren → CTA → form → tombol; dialog validasi menjebak fokus; Esc menutup.
- Grafik tren punya tinggi minimum dan tidak berkedip/kosong saat resize.

## 5. Teknis (wajib lulus tiap stage)

- `bun run lint`, TypeScript (`tsc --noEmit` / `bun run typecheck` bila tersedia), test yang ada, production build.
- Grep kebersihan: `asesor` tidak ada di impor/kode aktif; `assessorEmail`/`assignmentId` tidak ada di model baru; tidak ada teks "empat peran".
- Diff review: hanya file dalam ruang lingkup stage aktif yang berubah.

Grep “bersih” mengecualikan inventaris migrasi, komentar historis, test penghentian role,
dan pesan `/asesor/*` yang memang wajib menyebut peran lama. Yang harus hilang adalah hak,
akun, dependensi alur, dan navigasi operasional peran tersebut.

## 6. Template hasil (salin ke file stage)

```
Tanggal: ...
Route (12/#): lulus ... gagal ...
Guard/sesi: ...
Skenario E2E (1-8): ...
Visual 1440/834/390: ...
Aksesibilitas keyboard: ...
Lint/typecheck/test/build: ...
Catatan/regresi: ...
```

Jangan mengisi “lulus” untuk tahap belum dibangun. Jika integrasi membutuhkan stage berikutnya,
catat `BELUM DIUJI — menunggu V2-XX`, lalu periksa saat dependensinya tersedia.

## 7. Skenario tambahan hasil audit rencana

Skenario berikut menjadi calon acceptance test setelah keputusan terkait disetujui.

| ID | Skenario | Hal yang harus dibuktikan / keputusan penghambat |
|---|---|---|
| U-01 | Akun pengelola A memasukkan ID laporan/area/tindakan pesantren B | Tindakan dan sumber data menolak scope salah, bukan sekadar menyembunyikan menu |
| U-02 | Nama laporan berbeda dari nama akun login | Audit tetap menunjuk akun pengirim, tampilan nama mengikuti D-02/D-03 |
| U-03 | Kirim, hapus draft, lalu buka kiriman untuk validasi | Seluruh jawaban/bukti/lokasi yang terkirim masih dapat ditelusuri dari snapshot |
| U-04 | Kirim dua kali atau ulang setelah respons terputus | Satu kiriman dan satu set temuan/audit kirim; jika gagal, draft tidak hilang |
| U-05 | Dua pengelola memutuskan laporan sama | Keputusan lama tidak menimpa keputusan yang sudah tersimpan tanpa deteksi |
| U-06 | Instrumen baru terbit saat draft versi lama belum dikirim | Versi tidak berubah diam-diam; kebijakan kirim mengikuti D-10 |
| U-07 | Satu penilaian menghasilkan dua temuan, satu selesai | Status induk/progres mengikuti D-05, tidak otomatis menutup seluruh laporan |
| U-08 | Penilaian diterima tanpa temuan / seluruh jawaban N/A | Tidak memaksakan severity fiktif atau skor nol; kebijakan D-04/D-05 |
| U-09 | Banyak kiriman untuk pesantren/periode sama, termasuk versi berbeda | Agregat, tren, dan dataset mengikuti D-04; unit/versi sumber jelas |
| U-10 | Unggah denah baru atau ubah nama area | Titik dan sumber penilaian historis tetap menunjuk versi/ID semula |
| U-11 | Nonaktifkan pesantren atau pengelola terakhir saat form terbuka | Kirim memeriksa ulang kelayakan; arsip/antrean/sesi mengikuti D-08 |
| U-12 | Buka kembali atau hapus/arsip laporan Completed | Status rekomendasi, progres, bukti, hasil, dan audit mengikuti D-05/D-07; tidak ada relasi yatim |
| U-13 | Buka detail publik, ekspor dummy, dan data penelitian | Daftar bidang yang boleh terlihat sesuai D-02, termasuk nama/kontak/bukti/denah/alasan penolakan |
| U-14 | Ganti akun pada perangkat sama atau penyimpanan penuh/rusak | Kepemilikan draft mengikuti D-10, kegagalan simpan tidak ditampilkan sebagai sukses |
| U-15 | Masukkan pesantren tak dikenal melalui URL form | Tidak terkirim diam-diam ke pesantren default atau memakai area pilihan lama |
| U-16 | Reset V2 ketika V1 masih tersimpan | Namespace/data yang disentuh persis sesuai D-01; seluruh relasi seed V2 konsisten |

## 8. Kapan pengujian lintas tahap dilakukan

- V2-03: uji pengiriman pada data/store; UI validasi ujung-ke-ujung dilengkapi di V2-05.
- V2-07: uji area di laporan cepat; hubungan area ke form penilaian dilengkapi di V2-08.
- V2-08: uji Published → pengisian → kirim → moderasi → hasil → dataset Peneliti yang disepakati.
- V2-09: uji integrasi seluruh alur; catat hasil terbaru tanpa mengubah persetujuan stage lama menjadi belum disetujui.
