# V2 — Hasil Validasi Rencana

**Tanggal:** 8 September 2026. **Status:** pemeriksaan dokumentasi; D-01–D-03 telah dijawab pemilik pada 8 September 2026, D-04–D-12 masih terbuka.

Rencana mempunyai arah utama yang dapat diikuti: laporan publik masuk ke pengelola,
moderasi wajib, instrumen berversi, dan hasil memakai data dummy. Namun, rencana **belum siap
menjadi instruksi pembangunan** karena terdapat konflik hak akses, data publik, agregasi hasil,
serta hubungan laporan–temuan–tindak lanjut. Kelengkapan daftar halaman belum berarti alur datanya lengkap.

## Cakupan dan bukti yang diperiksa

- Seluruh 23 file Markdown V2 sebelum revisi, termasuk sembilan stage pembangunan.
- [Stage 12](../../planning/STAGE_12_SELF_REPORT_PUBLIK.md), planning/TODO root, aturan repository,
  [aturan frontend](../FRONTEND_RULES.md), dan bagian relevan [blueprint tertulis](../blueprint/04_PROJECT_SPEC.md).
- Pembacaan terbatas V1 untuk memeriksa nama/path file, bentuk sesi, key penyimpanan, hubungan dataset
  Peneliti, dan token desain. Kode V1 hanya dibaca.
- Sumber ilmiah tetap proposal di `../source/`. Pemeriksaan ini menggunakan blueprint tertulis
  sebagai pembanding; tidak mengulang telaah ilmiah atau validasi visual proposal asli.

## Temuan yang memengaruhi kesiapan rencana

| ID | Temuan dan bukti | Tindakan dokumentasi / keputusan |
|---|---|---|
| V-01 | `TODO`, planning, dan V2-01 berstatus implementasi `IN PROGRESS`, bertentangan dengan permintaan diskusi tanpa kode. | Dikoreksi: V2-00 khusus rencana, seluruh implementasi `BACKLOG`; D-00. |
| V-02 | README “dari nol”, MIGRATION berisi edit/pindah/hapus pada aplikasi sekarang. | Tandai inventaris bersyarat; tunggu D-01 sebelum memilih cara pembangunan. |
| V-03 | README menyamakan hak lapor, ROLES melarang dua peran, ROUTES mengizinkan akses semua sesi. Pengelola juga disebut “semua kemampuan publik” sekaligus “hanya scope sendiri”. | D-03; bedakan akses halaman, hak kirim, hak kelola, dan scope data. |
| V-04 | ROLES §7 mengharuskan akun aktif tampil di semua halaman tetapi melarang identitas pada header publik. | Dikoreksi: akun aktif tampil bagi sesi login, mengikuti aturan repository dan wireframe. Isi dataset publik tetap sama. |
| V-05 | Status `Diterima` dipakai sebagai satu-satunya syarat tampil, tanpa daftar bidang publik. Opsi anonim tidak mengatur kontak, bukti, denah, PIC, atau ekspor. | D-02; tambahkan kebutuhan pemisahan data internal/publik. |
| V-06 | Larangan mutlak data menunggu tampil bertentangan dengan panel jumlah antrean publik. | D-02 mencakup keputusan count antrean; count bukan hasil tervalidasi. |
| V-07 | Skema `Report` tidak menyimpan jawaban penilaian yang telah dikirim; `SelfAssessmentDraft` tidak punya status kirim/tautan report. Pengelola diminta melihat seluruh jawaban. | Tambahkan kebutuhan snapshot kiriman, relasi draft–report, dan bukti kirim idempoten di DATA_REQUIREMENTS. |
| V-08 | Periode dan hasil per dimensi belum dimodelkan; rumus agregat lintas pesantren/versi belum dijelaskan; lapor cepat disebut tampil di hasil seperti instrumen penuh. | D-04; pisahkan metrik laporan/temuan dari skor penilaian. Jangan menciptakan rumus. |
| V-09 | Satu report dapat memiliki banyak temuan/rekomendasi, tetapi severity dan penanganan hanya pada report. Tidak ada jalur penilaian tanpa temuan. | D-05; butuh contoh satu temuan, banyak temuan, dan tidak ada temuan. |
| V-10 | Semua pengelola dapat melapor dan memvalidasi; pemisahan pembuat/pemeriksa serta verifikasi tindak lanjut belum ditentukan. | D-06; jangan menunjuk pemeriksa baru tanpa keputusan. |
| V-11 | Hapus `Completed` membuang report/temuan, tetapi hasil harus tetap dapat ditelusuri. Dampak ke rekomendasi, riwayat hasil, bukti, dan notifikasi tidak disebut. | D-07; catat keseluruhan relasi dan dampak statistik. |
| V-12 | FLOWS mempertahankan arsip pesantren yang kehilangan pengelola, DATA_MODEL hanya membaca pesantren terdaftar. | D-08; bedakan kelayakan kirim dan keterbukaan arsip. |
| V-13 | Form akun menawarkan tiga peran, hak Super Admin hanya membuat pengelola. Akun dibuat `Menunggu` tetapi langkah aktivasi belum ditulis. | D-09; akun harus bisa benar-benar dipakai dalam alur demo yang direncanakan. |
| V-14 | V1 menyimpan sesi berupa role, sedangkan V2 memerlukan pengelola berbeda untuk menguji isolasi scope. | Kebutuhan sesi mengacu akun stabil, bukan role saja; tidak ada perubahan kode. |
| V-15 | `Aktif` tiga pesantren + pengelola dua pesantren belum menghasilkan tiga pesantren terdaftar. Seed lokasi hanya untuk satu pesantren. | Perjelas dua skenario seed yang mungkin; jumlah akhir mengikuti D-09/D-11. |
| V-16 | Model area/lantai/denah memakai beberapa label sebagai relasi; versi denah lama tidak mempunyai entitas riwayat. `RiskFinding` mewajibkan versi instrumen dan koordinat untuk semua kanal. | DATA_REQUIREMENTS merinci ID lantai/versi denah, lokasi tanpa denah, dan kanal tanpa instrumen. |
| V-17 | V2-08 menulis `observedAt` memakai nama pelapor; field tersebut semestinya waktu observasi. | Dikoreksi menjadi waktu; identitas pelapor disimpan terpisah. |
| V-18 | URL pesantren tidak valid diabaikan menjadi default, tetapi test meminta kirim ditolak. Draft berisiko dikirim ke lembaga berbeda. | Dikoreksi: jangan mengganti sasaran form diam-diam; bedakan filter baca dan tujuan kiriman. |
| V-19 | Klaim “Peneliti tidak berubah” tidak memetakan dataset, status `Final` V1, versi aktif, atau import ke laporan V2. | Tambahkan audit dependensi Peneliti; pertahankan fungsi ilmiah, bukan asumsi bahwa semua kontrak datanya tetap. |
| V-20 | Rencana uji mewajibkan semua route HTTP 200, termasuk yang seharusnya redirect; “27+” tidak menjelaskan inventaris. | Koreksi: 27 pola route kanonis + kasus redirect/URL lama/tidak valid; periksa hasil navigasi dan isi. |
| V-21 | V2-03 diminta lulus E2E antrean sebelum V2-05; V2-07 menguji form penilaian sebelum V2-08; V2-09 menurunkan semua stage ke REVIEW walau sudah DONE. | Bedakan pemeriksaan per tahap dan integrasi tertunda; jangan mengarang hasil uji atau menurunkan stage disetujui. |
| V-22 | Key penyimpanan V1 sebenarnya `ishas-domain-v3`, bukan keluarga `ishas-mock-v3`. Mengganti key tidak otomatis membaca/menghapus key lama. | Koreksi fakta key; kebijakan namespace, reset, dan hidup berdampingan menunggu D-01. |
| V-23 | Tautan Stage 12 dari README salah satu tingkat; bagian cara menghidupkan landing dirujuk §3 padahal §4. Larangan menyebut Asesor bertentangan dengan dokumen migrasi/pesan route lama. | Koreksi rujukan dan pengecualian konteks historis. |
| V-24 | Copy/ukuran teks diberi label FINAL tanpa review V2; WIREFRAMES hanya merujuk V1 untuk banyak halaman. | Tandai bahan diskusi; D-12. Detail state dan akses publik perlu diselesaikan sebelum wireframe dianggap lengkap. |

## Detail yang ditambahkan

Lihat [DATA_REQUIREMENTS](DATA_REQUIREMENTS.md) untuk hubungan data dan skenario uji konseptual:
kiriman permanen, identitas akun, status yang sah, periode/hasil, denah historis,
audit/notifikasi, seed konsisten, penyimpanan draft, dan alur Peneliti.

Halaman publik masih perlu keputusan D-02 sebelum menentukan desain detail. Untuk setiap halaman,
rencana akhir harus menyebut: tujuan pembaca, data yang ditampilkan, filter, sumber angka,
tombol yang diperbolehkan, keadaan kosong/gagal, tampilan ponsel, serta kriteria pemeriksaan.
Mewarisi layar internal V1 ke publik tanpa meninjau bidang yang ditampilkan belum cukup.

## Urutan pembahasan yang disarankan

1. D-01–D-03: cara pembangunan, batas informasi publik, dan hak melapor.
2. D-04–D-07: arti hasil penilaian, banyak temuan, pemeriksa, dan riwayat/koreksi.
3. D-08–D-12: pesantren/akun, draft/versi, lokasi awal, serta arah perubahan tampilan.
4. Setelah dijawab, selaraskan ROLES → FLOWS → DATA_MODEL → ROUTES/WIREFRAMES → TEST_PLAN → stage.

Urutan ini usulan pembahasan, bukan prioritas fitur yang diputuskan sepihak.

## Hasil pemeriksaan dan batas klaim

- Tidak ada kode aplikasi yang dibuat atau diubah pada pekerjaan ini.
- Tidak menjalankan lint/build atau uji browser: yang diperiksa adalah rencana, bukan implementasi V2.
- Tidak mengesahkan rumus, jumlah indikator final, skala risiko, atau kelayakan ilmiah laporan masyarakat.
- Keputusan yang belum dijawab tetap terbuka. Dokumen yang telah diperbaiki belum berarti V2 disetujui atau siap dirilis.
- Pemeriksaan akhir: 27 file Markdown, 11 tautan file valid, status stage konsisten, dan
  tidak ada kesalahan whitespace pada diff. Sebanyak 188 file proyek di luar V2 tetap sama
  dengan sebelum pekerjaan; tidak ada file proyek baru di luar V2. Rincian dicatat pada V2-00.
