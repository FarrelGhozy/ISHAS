# Catatan Keputusan dan Pertanyaan Terbuka

Tanggal pemeriksaan: **8 September 2026**. Dokumen ini memisahkan arahan pemilik,
arah yang diwarisi dari dokumen sebelumnya, dan hal yang belum diputuskan.
Tidak adanya jawaban bukan persetujuan. Rekomendasi di bawah adalah bahan diskusi.

## Arahan yang terkonfirmasi pada sesi ini

| ID | Arahan | Sumber |
|---|---|---|
| D-00 | Validasi dan tambahkan detail rencana hanya di `docs/`; jangan mengubah file lain atau membuat kode. Jika ada kebingungan, tanyakan terlebih dahulu. | Pesan pemilik, 8 September 2026 |

Arahan sebelumnya yang **tercatat** di keputusan evaluasi dosen September 2026:
dashboard publik menggantikan landing sementara, peran Asesor dihentikan, tiga peran login,
dua kanal pelaporan, nama pelapor dicatat, moderasi pengelola wajib, dan frontend memakai dummy.
Audit ini tidak menganggap setiap rincian turunannya telah disetujui kembali.

## Keputusan yang telah dijawab pemilik

### D-01 — Cara pembangunan — DIJAWAB 8 September 2026

- **Keputusan (kata-kata pemilik):** ISHAS adalah **aplikasi**; rancangan
  dijadikan proyek yang sebenarnya (bukan sekadar prototipe). Frontend dibangun dengan
  **React Router**, file **dipecah per folder per area/per bagian** agar tidak ada file raksasa,
  dan dijalankan dengan **bun 1.4** yang ada di laptop (terpasang: bun 1.4.2). Bila perlu
  meniru pola, rujuk proyek `~/Documents/02_Projek/HIBAH_INTERNAL`.
- **Konsekuensi:**
  - Tidak ada landing page terpisah. Bila kelak diminta,
  halaman perkenalan dibuat baru di aplikasi ISHAS (masih menunggu keputusan).
 - Penyimpanan browser aplikasi murni ; tidak ada data lama pada origin aplikasi, jadi
 kekhawatiran hidup berdampingan gugur. Key tetap `ishas-mock-v4` + key sesi/draft baru
 (usulan SUGGESTIONS §7).
- **Konfirmasi lanjutan (8 September 2026):** lokasi aplikasi = `~/Documents/02_Projek/ishasV2/ishas`
 (subfolder di dalam folder dokumen); styling **Tailwind v4** mengikuti pola HIBAH_INTERNAL,
 dengan token `DESIGN_SYSTEM.md` §1 sebagai theme. Pemilik meminta pembangunan frontend dimulai
 pada sesi yang sama (aktivasi Stage 01).
- **Status:** DISETUJUI penuh (inti + lokasi + stack pendukung).

### D-02 — Batas informasi publik — DIJAWAB 8 September 2026

**Amendemen 18 September 2026:** larangan denah/titik publik di bagian historis
ini diganti terbatas oleh D-14: denah gambaran besar dan titik temuan tervalidasi
boleh publik setelah memilih satu pesantren. Larangan bidang privat lainnya tetap.

**Amendemen 28 September 2026 (D-27):** foto bukti penilaian mandiri
dikecualikan dari larangan bukti publik — tampil di PDF `/laporan/:id`
agar pihak luar dapat melihat buktinya. Larangan bukti publik lainnya
(bukti lapor-cepat, bukti penyelesaian tindak lanjut) tetap.

- **Keputusan:** **"Ringkasan saja"** + **nama validator/PIC publik**.
 - Publik melihat ringkasan hasil/progres: angka, kategori ilustratif, tren, temuan
 (judul, lokasi/area, severity, status penanganan), rekomendasi, progres tindak lanjut,
 **nama PIC**, **nama validator**, pesantren, periode, versi instrumen, label data dummy.
 - TIDAK publik: nama/kontak pelapor, identitas akun pelapor, bukti/foto, denah rinci + titik
 koordinat, jawaban mentah per indikator, alasan penolakan, catatan internal, audit log.
- **Rincian yang dijawab lewat pilihan (yang tidak dipilih = tidak boleh):**
 - Count antrean TIDAK publik → panel "N laporan menunggu validasi" **dihapus** dari `/`.
 - Opsi "tampil anonim" TIDAK dibangun → nama pelapor selalu tampil apa adanya pada tampilan
 internal; publik tidak menampilkan nama pelapor sama sekali.
 - Alamat lengkap TIDAK di profil publik (hanya kota/kabupaten).
- **Konsekuensi:** `/peta-risiko` publik = Daftar Area + Daftar Temuan (tanpa tab Denah);
 `/tindak-lanjut` publik tanpa bukti; matriks bidang lengkap di `DATA_REQUIREMENTS.md` §6.
- **Status:** DISETUJUI.

### D-03 — Hak melapor saat login — DIJAWAB 8 September 2026

- **Keputusan:** **"Harus keluar dahulu"** — hanya Publik (tanpa login) dan Pengelola Pesantren
 yang boleh mengirim laporan/penilaian. Super Admin/Peneliti tidak dapat mengirim saat login;
 halaman publik tetap dapat dibaca dengan isi yang sama, dan pada `/lapor`/`/penilaian-mandiri`
 aksi kirim dinonaktifkan dengan pesan ajakan keluar dari akun untuk melapor sebagai publik.
- **Rincian:** Pengelola **BOLEH** melapor ke pesantren lain sebagai pelapor umum; laporannya
 divalidasi oleh pengelola pesantren sasaran; hak kelola tetap terbatas satu pesantren.
- **Status:** DISETUJUI.

## Bahan diskusi berikutnya — belum diajukan satu per satu

### D-04 — Makna hasil dan agregat penilaian

**Pertanyaan:** jika beberapa orang mengisi instrumen untuk pesantren dan periode yang sama,
apakah semua kiriman menjadi data responden, atau pengelola memilih satu hasil yang mewakili pesantren?
Siapa menetapkan periode observasi, dan apakah penilaian individu memang mewakili seluruh lembaga?

**Mengapa perlu:** rata-rata semua kiriman akan memberi bobot lebih besar pada pesantren yang
memiliki lebih banyak pelapor. Memilih kiriman terakhir juga merupakan keputusan produk, bukan default teknis.

**Rincian yang dibutuhkan:** unit hitung kartu statistik, sumber periode, pemilihan hasil per pesantren,
kesetaraan versi, penanganan N/A, data kosong, arah tren, dan data yang masuk dataset Peneliti.
Jumlah laporan cepat tidak mempunyai jawaban instrumen sehingga belum menjadi sumber skor indeks.
Contoh “jawaban 1/2/Tidak menghasilkan temuan” harus berlabel asumsi seed, bukan aturan semua indikator.

**Terkait:** dashboard, hasil, laporan pimpinan, DATA_MODEL, Peneliti. Rumus ilmiah tetap menunggu tim penelitian.

**Usulan untuk pembangunan Stage 02 — DISETUJUI SEBAGAI ATURAN ILUSTRASI (bukan rumus final),
8 September 2026:** pemilik memilih "bangun dengan aturan ilustrasi" dan meminta dashboard
"penuh dengan data" untuk Stage 02. Aturan yang dipakai sementara (semua angka berlabel
`Data ilustrasi · asumsi seed`):
- Sumber skor indeks HANYA snapshot penilaian mandiri dengan laporan `Diterima`; laporan cepat
 bukan sumber skor (konsisten dengan catatan di atas).
- Per pesantren dipakai **satu** snapshot `Diterima` terbaru (yang lain tidak menggandakan bobot).
- Nilai jawaban dinormalisasi: likert 1–5 → 20–100; `Ya` = 100, `Tidak` = 20; jawaban kosong/N/A
 dilewati dari rata-rata (tidak dihitung nol).
- Indeks "Semua terdaftar" = rata-rata sederhana indeks tiap pesantren (bobot sama per lembaga,
 bukan per kiriman).
- Tren 6 periode memakai deret riwayat ilustratif di seed (`indexHistory`), bukan hasil hitung ulang.
- Semua ini **menunggu D-04 final**; perubahan aturan final wajib mengubah processor + label,
 bukan dianggap rumus resmi (aturan §1: rumus resmi dari sumber ilmiah/tim penelitian).

### D-05 — Satu laporan, banyak temuan, dan tanpa temuan

**Pertanyaan:** severity/prioritas ditentukan per laporan atau per temuan? Apakah seluruh temuan
harus selesai sebelum laporan `Completed`? Bagaimana penilaian yang diterima tanpa temuan bahaya ditutup?

Contoh yang perlu disepakati: satu penilaian menghasilkan temuan kabel terbuka dan sanitasi.
Menyelesaikan sanitasi saja tidak menjelaskan status keseluruhan. Penilaian tanpa temuan tidak
semestinya otomatis dianggap mempunyai risiko “Rendah” hanya untuk memenuhi dropdown wajib.

**Usulan:** bedakan keputusan moderasi satu kiriman, temuan turunannya, serta penanganan setiap temuan.
Aturan penggabungan status dan ringkasan tingkat bahaya menunggu jawaban.

### D-06 — Pengelola melapor dan memverifikasi pekerjaannya sendiri

**Pertanyaan:** apakah pengelola boleh menerima laporannya sendiri dan memverifikasi tindak lanjut
yang ia kerjakan? Jika tidak, siapa pemeriksa kedua, terutama ketika satu pesantren hanya memiliki satu pengelola?

**Mengapa perlu:** kewajiban “semua laporan dimoderasi” sudah jelas, tetapi belum menentukan
apakah pembuat laporan dan validator boleh orang yang sama. Audit mengidentifikasi pelaku,
bukan otomatis memisahkan kewenangan. Jangan diam-diam memberi kewenangan baru kepada Super Admin/Peneliti.

### D-07 — Arti hapus dan koreksi laporan yang sudah diterima

**Pertanyaan:** “hapus Completed” berarti menyembunyikan/mengarsipkan dari daftar aktif,
atau membuang isi laporan? Apa yang tetap dapat dilihat dalam riwayat dan hasil periode lama?
Bagaimana memperbaiki laporan yang keliru diterima atau menghubungkan laporan koreksi dengan asalnya?

**Konflik:** rancangan sekarang meminta hapus laporan dan temuan, tetapi juga meminta seluruh hasil
tetap tertelusur. Audit peristiwa penghapusan saja tidak menyimpan jawaban, bukti, dan hasil asli.

**Usulan:** arsip dengan alasan dan riwayat lebih mudah mempertahankan ketertelusuran;
mekanisme, hak akses arsip, dan pengaruh pada statistik belum ditetapkan.

### D-08 — Pesantren nonaktif atau kehilangan pengelola terakhir

**Pertanyaan:** setelah tidak memenuhi definisi “terdaftar”, apakah hasil lama tetap publik sebagai arsip?
Apa yang terjadi pada laporan menunggu validasi, pekerjaan berjalan, akun yang sedang login, dan draft pelapor?

**Konflik:** FLOWS meminta hasil lama tetap tampil, sementara DATA_MODEL hanya mengagregasi pesantren terdaftar.
Perlu membedakan kelayakan menerima laporan baru dari kebijakan menampilkan riwayat lama.
Pilihan sementara menyembunyikan seluruh hasil atau tetap membuka seluruh arsip belum disepakati.

### D-09 — Pembuatan, aktivasi, dan lingkup akun

**Pertanyaan:** Super Admin hanya membuat akun pengelola, atau juga Super Admin/Peneliti?
Siapa mengaktifkan akun `Menunggu → Aktif`, dan apakah satu pesantren boleh mempunyai beberapa pengelola?

**Konflik:** alur tambah pengguna menawarkan tiga peran, sedangkan hak Super Admin hanya menyebut membuat pengelola.
Seed meminta tiga pesantren aktif tetapi hanya menyediakan pengelola untuk dua pesantren;
berstatus `Aktif` saja belum membuat pesantren terdaftar.

**Rincian yang dibutuhkan:** cara memilih akun pengelola kedua saat demo tanpa pemilih peran setelah login;
hubungan akun baru dengan login dummy; pergantian pengelola utama; penanganan penonaktifan akun aktif.

### D-10 — Draft lama dan versi instrumen baru

**Pertanyaan:** draft terikat v1.0 masih boleh dikirim ketika v1.1 dipublikasikan dan v1.0 diarsipkan,
atau pelapor harus memulai ulang? Berapa draft boleh tersimpan dan apakah tersisa setelah logout/pergantian akun?

**Batas yang sudah berasal dari rancangan:** versi draft tidak boleh diam-diam diganti; hasil historis
tidak dihitung ulang menggunakan konfigurasi baru. Kebijakan penerimaan draft lama belum ditetapkan.

**Rincian yang dibutuhkan:** identitas pemilik draft pada perangkat bersama, kehilangan penyimpanan,
bukti yang hanya berupa nama file, reset demo, dan apakah draft laporan cepat memang ikut disimpan.

### D-11 — Lokasi belum tersedia

**Pertanyaan:** jika pesantren terdaftar belum mempunyai area, laporan harus menunggu pengelola
membuat area atau boleh dikirim dengan deskripsi lokasi sementara?

**Konflik:** FLOWS dan Stage 03 mewajibkan area serta mengunci kirim, tetapi DATA_MODEL menjadikan area
opsional bila tidak tersedia. Pilihan ini memengaruhi onboarding, kesiapan demo, dan pemetaan temuan.
Tanpa denah berbeda dari tanpa area; lokasi dapat berbentuk daftar area tanpa titik denah.

### D-12 — Seberapa besar perubahan tampilan dan alur lama

**Pertanyaan:** apakah layout/copy yang ada dipertahankan atau boleh dirancang ulang mengikuti kebutuhan?
Apakah istilah status `Pending/Proses/Completed` tetap digunakan atau diubah menjadi bahasa Indonesia seluruhnya?

**Konflik:** tujuan perubahan besar berhadapan dengan larangan mengubah copy/layout “FINAL” dan
instruksi peran Peneliti tanpa memetakan data hasil.

**Usulan:** pisahkan identitas marun yang telah tercatat dari detail layout, ukuran teks, navigasi,
dan kalimat UI yang masih bisa dibahas. Ini belum mengizinkan redesign aplikasi.

## Cara mencatat jawaban

Untuk setiap jawaban, tambahkan: tanggal, keputusan dengan kata-kata pemilik, bagian yang belum
terjawab, dokumen/stage yang terdampak, serta status sinkronisasinya. Jawaban satu subpertanyaan
tidak otomatis menjawab seluruh D-ID. Tandai `DISETUJUI` hanya pada keputusan yang benar-benar diberikan.

Sebelum tahap kode: keputusan penghambat stage tersebut telah dijawab, rancangan yang bertentangan
telah diselaraskan, acceptance criteria dapat diperiksa, dan pemilik meminta pembangunan dimulai.

## D-13 — Referensi dashboard dosen — PENYEMPURNAAN DIIZINKAN 18 September 2026

**Amendemen sesi penyempurnaan:** pemilik menetapkan susunan mengikuti gambar
dashboard pertama, tema dan warna tetap, fokus responsivitas semua ukuran layar,
visualisasi data, dokumentasi/alur data, serta pembaruan stage sesuai bukti.
Empat kategori D-15 dipertahankan; tidak menambahkan dimensi ilmiah, mengganti
rumus, atau memindahkan kewenangan risiko dari pengelola. Angka/skema pada kedua
gambar adalah referensi, bukan ketentuan ilmiah final. Arahan ini menggantikan
status persiapan/menunggu jawaban untuk sasaran dan warna pada catatan di bawah.
Pelaksanaan: `planning/STAGE_DASHBOARD_POLISH.md`.

### Catatan historis persiapan

**Arahan pemilik:** analisis gambar dashboard dari dosen, evaluasi dokumentasi, dan
persiapkan pengerjaan yang kurang lebih mengikuti gambar; pertanyaan boleh diajukan.
Persiapan redesign diizinkan. Belum ada keputusan untuk menyalin seluruh aturan,
angka contoh, warna, maupun field form di gambar menjadi ketentuan final.

Analisis dan rencana: [DASHBOARD_REDESIGN_REVIEW.md](DASHBOARD_REDESIGN_REVIEW.md).

Pertanyaan yang diajukan pada sesi ini:

1. Sasaran: halaman utama publik `/`, workspace Pengelola Pesantren, atau keduanya?
2. Warna: marun ISHAS atau hijau/toska referensi?
3. Apakah Ekstrem, Likelihood × Severity, form dalam dashboard, dan denah bertitik
   merupakan aturan baru wajib, atau contoh visual yang mengikuti aturan lama?

**Status:** menunggu jawaban; D-12 terjawab sebagian pada arah susunan visual saja.
D-02/D-03, aturan ilustrasi D-04, dan keputusan 9 September tetap berlaku sampai
ada jawaban yang secara eksplisit mengubahnya. Skala/ambang ilmiah tidak disahkan
oleh referensi gambar. Jika aturan baru diwajibkan, detail per subaturan dicatat
sebelum perubahan spesifikasi terkait dianggap siap kode.

Dokumen terdampak setelah keputusan: ROLES, ROUTES, FLOWS, DATA_MODEL,
DATA_REQUIREMENTS, WIREFRAMES, DESIGN_SYSTEM, TEST_PLAN, TODO, dan stage dashboard/
halaman baca/lokasi/penilaian/integrasi sesuai scope. Review ini hanya persiapan
di `docs/`; status stage implementasi dan kode tidak diubah.

## Review frontend stage 1–3 — arahan pemilik 8 September 2026

Pemilik meminta validasi dan perbaikan coding stage 1–3, fokus UI/UX, keluwesan di semua layar, dan alur data frontend. Backend ditunda sampai frontend disepakati. Review perbaikan Stage 01 → Stage 02 → Stage 03 diaktifkan berurutan; stage BACKLOG tidak diaktifkan. Arahan ini mengizinkan perbaikan keterbacaan, ukuran kontrol, navigasi responsif, dan konsistensi draft/filter; identitas warna serta keputusan ilmiah/hak peran tetap mengikuti ketentuan yang sudah disetujui. D-04–D-11 final tetap terbuka; kebijakan interim Stage 03 tetap berlaku. Status akhir menunggu review pemilik, bukan DONE.

## Keputusan lanjutan pemilik — 9 September 2026

### D-06 — Pengelola memoderasi laporannya sendiri — DISETUJUI

Pengelola Pesantren boleh mengirim laporan dan menerima laporan yang ia kirim sendiri. Audit mencatat akun pengirim dan validator secara terpisah, walaupun keduanya sama.

### D-07 — Completed menjadi arsip — DISETUJUI

Laporan `Completed` diarsipkan, bukan dihapus permanen. Data tetap berada di sistem dan dapat dibaca Pengelola Pesantren pemilik scope, tetapi tidak tampil pada dashboard publik. Audit tetap tersimpan.

### D-08 — Pesantren tidak terdaftar — DISETUJUI

Pesantren `Nonaktif` atau yang kehilangan pengelola aktif terakhir tidak lagi `Pesantren terdaftar`; tidak tampil publik, tidak dapat dipilih di form, dan tidak dapat menerima laporan baru. Hasil lama juga tidak tampil publik. Data tetap disimpan untuk pembacaan internal sesuai scope yang masih tersedia.

### D-10 — Draft instrumen versi lama — DISETUJUI

Ketika versi Published baru terbit, draft yang terikat versi lama tidak boleh dikirim. Draft lama boleh tetap terlihat sebagai referensi lokal, tetapi aksi kirim dikunci dan pelapor harus memulai penilaian baru dengan versi Published terbaru. Hasil terkirim tetap memakai snapshot versi asalnya dan tidak dihitung ulang.

### D-11 — Lokasi pelaporan — DISETUJUI

Pengelola Pesantren memasukkan daftar lokasi/area. Pelapor memilih area yang tersedia; jika lokasi tidak tertera, pelapor wajib mengisi deskripsi lokasi manual. Lokasi tidak boleh kosong. Pesantren tanpa pengelola aktif tidak terdaftar dan tidak dapat dipilih atau dilaporkan.

### D-05 — Penyelesaian laporan dengan banyak temuan — DISETUJUI

Satu laporan dianggap `Completed` hanya jika seluruh temuannya telah selesai. Selama masih ada temuan yang belum selesai, status laporan tetap `Proses`.

### D-09 — Kewenangan pembuatan akun — DISETUJUI

Super Admin dapat membuat akun Super Admin lain, Peneliti, dan Pengelola Pesantren. Pengelola tetap harus dihubungkan ke pesantren yang ditentukan; hanya pengelola aktif yang membuat pesantren menjadi `Pesantren terdaftar`.

### D-14 — Denah besar dan Risk Map publik — DISETUJUI 18 September 2026

- Pemilik secara eksplisit mengubah aturan denah publik karena Risk Map penting.
- Pengelola Pesantren mengunggah denah gambaran besar pesantren, yang dipakai
  untuk penentuan titik pelaporan dan penggambaran lokasi di dashboard utama.
- Scope general/semua pesantren tidak langsung menampilkan peta: satu pesantren
  harus dipilih dahulu.
- Bukan denah per gedung/per lantai; lantai ditulis sebagai keterangan lokasi.
- Tahap sekarang hanya rancangan dan generasi ilustrasi; belum izin implementasi.
- D-02 berubah hanya untuk denah besar/titik temuan publik. Denah rinci, nama/kontak
  pelapor, bukti/foto laporan dan bidang privat lain tetap tidak publik.
- Moderasi Diterima, arsip Completed (D-07), syarat pesantren terdaftar (D-08),
  lokasi wajib (D-11), dan kewenangan penetapan risiko pengelola tetap berlaku.
- Rincian alur, versi denah, titik nullable, lineage, dan uji:
  [RISK_MAP_DESIGN.md](RISK_MAP_DESIGN.md), DRAFT UNTUK REVIEW.
- Kewajiban titik, batas unggahan, penyimpanan aset dan UX versi merupakan usulan
  rancangan, belum keputusan final. D-13 lainnya tidak dianggap terjawab otomatis.

#### D-14.a — Peringatan perubahan denah — DISETUJUI 18 September 2026

Pemilik meminta peringatan sebelum unggah agar denah sebisa mungkin tidak diubah,
dan pemberitahuan sebelum penggantian karena perubahan dapat membuat posisi
laporan tidak sesuai. Penggantian tidak dilarang mutlak. Rancangan dua tahap dan
copy di RISK_MAP_DESIGN §4.A.1; detail checkbox/pratinjau merupakan usulan UX.
Peringatan tidak menggantikan integritas data: titik historis tetap terikat versi
denah asal, tidak dipindahkan otomatis atau dihapus. Belum implementasi aplikasi.

#### D-14.b — Aktivasi implementasi frontend — 18 September 2026

Arahan pemilik `ok kerjakan` mengaktifkan revisi Risk Map lintas fitur. Status
implementasi REVIEW, bukan persetujuan DONE atau izin backend/push/publikasi.
Pernyataan “belum izin implementasi” pada D-14/D-14.a merupakan catatan tahap awal.

Asumsi prototipe yang dipakai sementara dan masih perlu review:

- Titik opsional; pilihan area atau deskripsi lokasi tetap wajib. Tidak ada titik
  otomatis/centroid. Lantai keterangan teks, bukan gambar terpisah.
- Unggah PNG/JPEG/WebP maksimum 5 MB, sisi pendek minimal 800 piksel; gambar
  tersimpan di IndexedDB browser, metadata schema v5 di localStorage.
- Penerbitan denah memerlukan pratinjau dan checkbox konfirmasi; versi lama tetap
  tersedia. Draft bertitik versi lama harus dipilih ulang atau dihapus titiknya.
- Migrasi v4 mempertahankan data/ID, memasang ilustrasi kampus fiktif untuk mitra
  demo yang sesuai, tetapi tidak menganggap koordinat legacy sebagai titik laporan.
- Temuan penilaian mandiri diturunkan per jawaban sumber. Pemicu ilustratif:
  Likert 1–5 bernilai 1/2; Likert 1–2/Tidak bernilai 1/Tidak; boolean bernilai Tidak.
  Nilai 2 pada Likert 1–2 berarti Sesuai, bukan temuan risiko. Ini bukan rumus atau
  ambang ilmiah final; severity/priority tetap wajib ditetapkan pengelola saat terima.

Hasil uji: [STAGE_RISK_MAP.md](../planning/STAGE_RISK_MAP.md).

## D-15 — Empat kategori/aspek K3 — DISETUJUI 19 September 2026

- Pemilik meminta 4 kategori utama menjadi struktur baku konsisten:
  Keselamatan, Kesehatan, Lingkungan, Psikososial (detail di [KATEGORI_K3.md](KATEGORI_K3.md)).
- **D-15.a — Struktur:** Kategori → Aspek → Indikator. `dimensions` existing dimigrasikan
  (bukan duplikat); `INS-v1.0` diarsipkan, `INS-v1.1` (4 kategori, 10 indikator) menjadi Published aktif.
- **D-15.b — Ekstrem:** level risiko menjadi Rendah/Sedang/Tinggi/**Ekstrem** (asumsi prototipe;
  matriks Likelihood×Severity brief hanya ilustrasi visual, ambang resmi menunggu D-04/D-13).
  Tampilan Ekstrem memakai kelas existing `status-red` + ikon `Flame` + label teks.
- **D-15.c — Form:** cascading Kategori → Aspek → Indikator pada pelaporan; field risiko
  (Likelihood/Severity/Risk Score/Rekomendasi) tetap khusus pengelola saat validasi (FLOWS §4).
- **D-15.d — Tahap:** dokumen patokan dulu (`KATEGORI_K3.md` + sinkronisasi), implementasi kode
  setelah review; migrasi schema v5→v6 mempertahankan seluruh record/ID.

## D-16 — Pustaka detail indikator (PDF Public/Privat) — DISETUJUI 23 September 2026

- Pemilik meminta fitur baru: Peneliti mengunggah berkas PDF per indikator
  (satu PDF per indikator `INS-v1.1`); berkas tampil di dashboard utama dan
  halaman publik baru, sinkron dengan ruang Peneliti. Fokus tahap ini
  frontend-only (data dummy + blob lokal); backend menyusul.
- **D-16.a — Unit:** satu PDF per indikator, terikat `indicatorId` stabil
  (`IND-K3L-*`) + denormalisasi `categoryId/aspectId` untuk filter. Bukan tabel
  custom bebas. Independen dari versioning instrumen: tidak ikut
  `Draft/Published/Archived`, tidak mengunci `penilaian-mandiri`.
- **D-16.b — Visibilitas:** `Public` = publik dapat `Lihat` (tab baru) +
  `Unduh`. `Privat` = di publik hanya tampil nama indikator + status
  terkunci; tombol `Lihat`/`Unduh` tidak dirender. Isi privat penuh hanya
  untuk Peneliti. Default saat unggah = `Privat` (aman dulu).
- **D-16.c — Format:** hanya PDF (`application/pdf`, ekstensi `.pdf`, header
  `%PDF`); batas prototipe 10 MB (asumsi, dapat diturunkan ke 5 MB).
  Satu indikator = satu berkas (unggah baru mengganti + konfirmasi).
  Hapus = hapus permanen metadata + blob dengan konfirmasi + audit.
- **D-16.d — Navigasi publik:** navbar umum bertambah `Dokumen` → `/dokumen`
  (halaman penuh search/filter/tabel) + panel ringkas di dashboard utama `/`
  setelah rekap kategori. Filter pesantren tidak memfilter dokumen (global).
- **D-16.e — Navigasi peneliti (23 September 2026):** kelola berkas menempati
  menu tersendiri `Dokumen instrumen` → `/peneliti/dokumen-instrumen`
  (bukan seksi di `/peneliti/instrumen`); guard workspace peneliti berlaku.
- Dokumen terdampak: ROUTES, DATA_MODEL (schema v7), FLOWS §7, WIREFRAMES,
  DESIGN_SYSTEM (`Public → status-green + CheckCircle2`, `Privat →
  status-neutral + Lock`), TEST_PLAN, TODO, stage `STAGE_DOKUMEN_INDIKATOR.md`.
  D-02 tetap berlaku: blob privat tidak pernah disajikan ke publik; guard
  frontend simulasi UX, otorisasi nyata di backend nanti.

## D-16.f — Pemulihan halaman galat + render defensif instrumen (23 September 2026)

- Laporan pemilik: menu `Instrumen` peneliti menampilkan halaman galat
  (`Terjadi kesalahan tak terduga`). Pemeriksaan pada kode saat ini tidak
  mereproduksi crash dengan data baru, migrasi v6→v7, maupun mutasi draft;
  penyebab paling mungkin adalah data dummy tersimpan yang menyimpang di
  browser atau bundel dev yang basi (HMR).
- Perbaikan tanpa mengubah perilaku data valid: render
  `/peneliti/instrumen` menormalisasi `instrumentVersions/dimensions/
  indicators/aspects` (array tak valid → kosong, bukan crash); validasi
  `isValidState` dibuat null-safe; halaman galat global mendapat tombol
  `Kembalikan data demo` (hapus kunci `ishas-mock-v*` lalu muat ulang) agar
  loop galat akibat penyimpanan rusak dapat dipulihkan pengguna. Sesi login
  tidak ikut dihapus.

## D-16.g — Peneliti membuat entri dokumen indikator baru (23 September 2026)

- Arahan pemilik: halaman `Dokumen instrumen` baru dapat *memelihara* berkas
  yang sudah ada; Peneliti juga perlu tombol untuk *membuat* entri dokumen
  instrumen baru. Permintaan ini memperluas D-16.a — sebelumnya entri hanya
  tersedia untuk indikator yang sudah ada di katalog versi.
- **D-16.g.a — Entri baru:** Peneliti menekan `Tambah dokumen` → mengisi kode,
  judul, kategori (wajib), aspek (opsional), dan memilih PDF → entri tampil
  sebagai baris pustaka seperti indikator lain. Metadata indikator
  di-denormalisasi pada `InstrumentDoc` (`indicatorCode`, `indicatorTitle`,
  `manual: true`), bukan ditulis ke `InstrumentVersion`.
- **D-16.g.b — Batas:** tetap independen dari versioning; entri manual tidak
  muncul sebagai soal `penilaian-mandiri` dan tidak mengubah versi `Published`
  (aturan instrumen terkunci tetap berlaku). Default visibilitas `Privat`
  (D-16.b).
- **D-16.g.c — Revisi:** skema tetap `v7` (field opsional aditif, tanpa migrasi
  baru). Ganti/hapus/ubah visibilitas entri manual memakai alur D-16 yang sama;
  audit mencatat `Menambahkan dokumen indikator`. Ini catatan prototipe, bukan
  perubahan struktur ilmiah instrumen.
- Dokumen terdampak: WIREFRAMES §9, FLOWS §8, DATA_MODEL §0, TODO.

## D-19 — Lapor-cepat tanpa indikator + usulan mandiri + detail validasi lengkap — DISETUJUI 27 September 2026

- Arahan pemilik: form `/lapor` tidak memakai `Indikator terkait`; pelapor hanya
  memilih `Kategori` → `Aspek` (opsional) lalu menilai mandiri `Tingkat keparahan`
  dan `Prioritas perbaikan` (opsional, default `Belum ditentukan`).
- **D-19.a — Usulan vs keputusan:** nilai pelapor disimpan sebagai usulan
  (`reporterSeverity/reporterPriority`); `severity/priority` final tetap diisi
  akun Pesantren saat Terima (tanpa default). Halaman validasi menampilkan usulan
  sebagai pre-fill yang wajib ditinjau/diubah sebelum konfirmasi.
- **D-19.b — Detail validasi:** modal `/pesantren/validasi-laporan` menampilkan
  seluruh isi kiriman publik (identitas, kontak internal, kategori/aspek,
  lokasi + teks denah, bukti gambar, waktu, jejak keputusan).
- Dokumen terdampak: FLOWS §2/§4, DATA_MODEL (schema v8→v9), KATEGORI_K3 §7,
  WIREFRAMES §2/§4, TODO. D-02 tetap berlaku: kontak/usulan internal tidak publik.

## D-20 — Slider progres tindak lanjut 5 titik — DISETUJUI 27 September 2026

- Arahan pemilik: input `Progres (%)` pada tindak lanjut Pesantren memakai
  slider dengan titik `0/25/50/75/100` (bukan ketikan bebas).
- **D-20.a — Titik dan label:** `0% Belum mulai · 25% Dimulai · 50% Setengah
  jalan · 75% Hampir selesai · 100% Selesai` (label tahap usulan prototipe).
- **D-20.b — Pembulatan:** nilai lama yang bukan kelipatan 25 ditampilkan dan
  disimpan ke titik terdekat; store menormalisasi (bukan menolak). Seed tidak
  dimigrasi sehingga agregat dashboard tidak bergeser.
- Aturan `100% wajib bukti + catatan` dan alur verifikasi tidak berubah.
- Dokumen terdampak: FLOWS §6, WIREFRAMES §5, TODO. Scope Stage 07.

## D-21 — Pembatalan tindak lanjut + bukti upload + detail relasi — DISETUJUI 27 September 2026

- Arahan pemilik pada evaluasi `/pesantren/tindak-lanjut`: halaman terlihat kosong,
  detail kurang, belum bisa upload bukti, dan butuh aksi batal.
  Jawaban pemilik atas tiga pertanyaan klarifikasi: hapus = batalkan perbaikan
  (bukan hapus permanen/arsip); upload bukti samakan dengan `/lapor`;
  detail kartu memakai panel relasi penuh laporan induk.
- **D-21.a — Batal per rekomendasi:** `Dibatalkan` adalah status terminal per
  `Recommendation` (baris tidak dihapus). Boleh dari `Belum ditindaklanjuti /
  Berjalan / Menunggu verifikasi`; tidak dari `Terverifikasi / Dibatalkan`.
  Wajib alasan min 10 karakter + `canceledBy/canceledAt` + audit
  `Membatalkan tindak lanjut`. Temuan tertaut ikut `Dibatalkan`.
  Laporan induk tetap `Proses`; `Completed` hanya bila seluruh rekomendasi
  `Terverifikasi` (D-05 tetap; `Dibatalkan` menghalangi `Completed` otomatis).
  Tanpa buka-kembali pada prototipe ini.
- **D-21.b — Bukti penyelesaian:** pola sama dengan `/lapor` (PNG/JPEG/WebP,
  5 MB/20 megapiksel, blob privat IndexedDB, pratinjau + lepas/ganti).
  Wajib saat progres 100%. Disimpan sebagai `completionEvidence` (nama) +
  `completionEvidenceAssetId` (blob). Seed lama hanya nama = label `Bukti lama`.
- **D-21.c — Publik:** status `Dibatalkan` tampil publik beserta
  `alasan pembatalan` (amendemen D-02 terbatas untuk transparansi penanganan).
  Bukti penyelesaian, tenggat, dan catatan internal tetap tidak publik.
  Nama PIC/validator tetap publik sesuai D-02.
- **D-21.d — Detail kelola:** kartu Pesantren menampilkan panel baca relasi
  laporan induk (nomor, kanal, judul, deskripsi, kategori/aspek + usulan,
  severity/priority final, lokasi, bukti pelapor privat, validator/waktu,
  temuan tertaut) + tautan ke `/pesantren/validasi-laporan`.
  Empty state menjelaskan penyebab kosong (menunggu validasi / filter / arsip /
  beda scope).
- Dokumen terdampak: FLOWS §5–§6, DATA_MODEL (schema v9→v10), ROLES §2/§6,
  WIREFRAMES §5/§8, DATA_REQUIREMENTS §6, DESIGN_SYSTEM §2, TODO, STAGE_07.
  Scope Stage 07; status stage lain tidak berubah sepihak.

## D-22 — Denah tampil pratinjau kecil, klik untuk besar — DISETUJUI 27 September 2026

- Arahan pemilik: denah tampil terlalu besar (satu layar penuh); tampilkan kecil
  dulu, klik baru menjadi besar agar enak dilihat.
- **D-22.a — Pratinjau:** denah baca (peta publik `/peta-risiko` + panel dashboard,
  `SavedLocation` pada detail validasi/jawaban/tindak lanjut, pratinjau denah aktif
  `/pesantren/lokasi`) tampil sebagai tombol pratinjau kecil (tinggi terbatas) +
  label `Lihat denah besar`; klik membuka tampilan penuh + tombol `Tutup`.
  Pin/isi tetap sama, hanya ukurannya yang bertahap.
- **D-22.b — Batas:** form penandaan titik (`LocationPicker` pada `/lapor` dan
  `/penilaian-mandiri`) tetap tampil penuh agar titik presisi; tidak termasuk
  pratinjau. Tanpa perubahan data, hak akses, atau status stage lain.
- Dokumen terdampak: WIREFRAMES §5, TODO. Scope lintas Stage 04/07 baca-saja;
  status stage lain tidak berubah sepihak.

## D-17 — Rename peran Peneliti → Validator dan Pengelola Pesantren → Pesantren — DISETUJUI 27 September 2026

- Arahan pemilik: sebutan `Peneliti` terlalu mewah; ganti menjadi `Validator`
  dengan fungsi tetap sama (kelola instrumen, versioning, scoring, validasi &
  publikasi, data dan dokumen indikator). Sebutan `Peneliti` tidak dipakai lagi
  untuk peran login.

## D-18 — Identitas visual biru — DISETUJUI 27 September 2026

- Arahan pemilik: identitas utama aplikasi berubah dari marun menjadi biru.
  Palet contoh yang diberikan (`#000000`, `#F5F5F5`, `#E74C3C`, `#2A3F54`,
  `#3498DB`, `#007EFF`) menjadi arah visual, bukan kewajiban memakai setiap
  nilai persis.
- Token identitas baru memakai biru utama `#007EFF`, biru aksen `#3498DB`,
  teks judul `#2A3F54`, dan turunan biru lembut untuk latar/border interaksi.
  Warna bahaya tetap merah dan tidak menjadi warna merek.
- Ruang lingkup: tombol utama, navigasi aktif, fokus, banner, grafik,
  halaman login, logo browser, dan komponen yang sebelumnya memakai aksen
  marun. Struktur, copy, data, hak akses, serta pemetaan status tidak berubah.
- Dokumen terdampak: `DESIGN_SYSTEM.md`, `README.md`, `TODO.md`, planning,
  serta implementasi frontend. Verifikasi visual dan teknis dicatat pada
  Stage 09 sebelum status REVIEW diminta.
- Arahan lanjutan pemilik: `Pengelola Pesantren` disingkat menjadi `Pesantren`
  untuk peran akun lokal pondok. Fungsi tetap sama (validasi laporan, kelola
  lokasi/denah, tindak lanjut, laporan scope-nya). Contoh: `/pengelola/tindak-lanjut`
  menjadi `/pesantren/tindak-lanjut`.
- **D-17.a — Identitas peran:** `RoleId peneliti → validator`, `RoleLabel Peneliti → Validator`;
  `RoleId pengelola → pesantren`, `RoleLabel Pengelola Pesantren → Pesantren`.
  Email demo `peneliti@ishas.demo → validator@ishas.demo`,
  `peneliti2@ → validator2@`, `pengelola@ → pesantren@`, `pengelola2@ → pesantren2@`.
  Nama orang tetap (gelar `Dr.` dilepas agar tidak mewah).
- **D-17.b — Route workspace:** `/peneliti/* → /validator/*` (7 route);
  `/pengelola/* → /pesantren/*` (4 route: `validasi-laporan`, `lokasi`,
  `tindak-lanjut`, `laporan`). URL lama `/peneliti/*` dan `/pengelola/*`
  dialihkan ke URL baru. Profil publik `/pesantren/:kode` tetap; route statis
  workspace (`/pesantren/validasi-laporan` dsb) lebih diutamakan daripada
  `:kode` dinamis.
- **D-17.c — Bedakan dari istilah lama:** peran `Pesantren` (akun) dibedakan dari
  `Pesantren terdaftar` (lembaga Aktif + punya akun Pesantren aktif). Kata
  `validator` pada `validatedBy/nama validator/PIC/Divalidasi oleh` tetap merujuk
  aksi akun Pesantren yang memoderasi laporan, bukan peran Validator instrumen.
  Kata kerja `mengelola/dikelola/pengelolaan` dan frasa ilmiah `tim penelitian`
  tidak diganti.
- **D-17.d — Migrasi:** schema mock `v7 → v8`; mapping `roleId` lama ke baru pada
  `users`, `reporterAccountEmail`, `targetUrl` notifikasi, dan `validatedByRole`
  (`Pengelola Pesantren → Pesantren`); reset demo kembali ke seed baru.
- Dokumen terdampak: AGENTS (istilah), README, ROLES, ROUTES, FLOWS, DATA_MODEL,
  WIREFRAMES, TEST_PLAN, TODO, planning stage, dan seluruh `apps/web/` role-aware.

## D-23 — Validasi ruang kerja Pesantren + perbaikan alur — DISETUJUI 27 September 2026

- Arahan pemilik: `ok kerjakan` atas evaluasi perbandingan `main` vs cabang
  `validator` untuk bagian Pesantren (validasi isi, data flow, kekurangan,
  rancangan perbaikan).
- **D-23.a — Sumber status:** jalur utama `Pending/Proses/Completed` bergerak
  lewat kartu tindak lanjut (`updateRecommendation` otomatis menutup laporan bila
  seluruh rekomendasi `Terverifikasi`). `updateHandlingStatus` manual tetap sah
  untuk laporan tanpa rekomendasi + langkah mundur/arsip; UI Validasi hanya
  `Terima/Tolak`, tidak ada kontrol status manual di sana.
- **D-23.b — Ekstrem terjangkau:** `severity/priority` tetap
  `Tinggi/Sedang/Rendah` (tanpa `Ekstrem`). Level temuan `Ekstrem` diubah
  eksplisit per temuan oleh Pesantren (`setFindingLevel`, teraudit); bukan rumus
  turunan otomatis. Seed 1 Ekstrem tetap ilustrasi, bukan ambang ilmiah final.
- **D-23.c — Deprecasi lembut:** `verifyFinding` dan `savePlanVersion` (denah
  per lantai) tetap berfungsi + peringatan konsol, tetapi bukan jalur utama.
  Jalur utama verifikasi = `updateRecommendation(verify:true)`; jalur utama
  denah = `publishCampusPlan` gambaran besar. Tidak ada hapus mendadak agar
  test lama tetap hijau.
- **D-23.d — Arsip vs kelola:** `selectReportsForManager` tidak memuat laporan
  yang sudah `archivedAt`. Progres laporan Pesantren = rata-rata rekomendasi
  non-`Dibatalkan` (0 bila kosong). Laporan induk yang rekomendasinya
  `Dibatalkan` tetap pada status berjalan (`Pending/Proses`); `Dibatalkan`
  menghalangi `Completed` otomatis + ada hint next-step di UI.
- **D-23.e — Filter validasi:** antrean mendukung filter status + kanal
  (`lapor-cepat/penilaian-mandiri`) + severity + pencarian
  (nomor/judul/pelapor/deskripsi); baris memuat chip kanal + lokasi +
  handling agar konteks jelas sebelum `Periksa`.
- Dokumen terdampak: FLOWS §4–§6, DATA_MODEL §0/§4, WIREFRAMES §4–§5, TODO,
  STAGE_07 (+ catatan lintas Stage 05–06 tanpa mengubah status stage lain).
  Scope Stage 07 + sentuhan baca Validasi; status stage lain tidak berubah sepihak.

## D-24 — Bank instrumen live tanpa versioning + bobot per opsi + PDF per laporan — DISETUJUI 28 September 2026

- Arahan pemilik (`ok kerjakan`): versioning dihapus. Sekali isi langsung selesai;
  ganti soal di tengah jalan berarti penilai mengulang dari awal. Instrumen
  kurang jelas karena tidak bisa tambah/edit isi; Validator harus bisa mengubah
  penuh. Tambah jawaban frekuensi + tingkat keparahan; Validator mengatur tipe
  jawaban per indikator (ya-tidak, kualitas, frekuensi kejadian, tingkat
  keparahan) + bobot tiap opsi. Sistem memakai bank data.
- **D-24.a — Bank live:** satu instrumen live `INS-LIVE` yang langsung diedit
  Validator (tambah/edit/hapus dimensi + indikator, atur kategori/aspek, tipe
  jawaban, opsi + bobot). Tanpa `Draft/Published/Archived`, tanpa halaman
  Versioning, tanpa kunci versi D-10. Perubahan langsung aktif untuk pengisian
  baru + peringatan `draft berjalan harus mengulang`.
- **D-24.b — Draft checksum:** draft penilaian tetap tersimpan di browser per
  pesantren (`SELF-<kode>`, lanjutkan via `activeIndex`). Draft menyimpan
  `instrumentChecksum`; checksum beda = draft basi: kirim dikunci, autosave
  berhenti, pelapor wajib buang draft dan mulai baru. Default ter-record di
  browser; reload normal tidak menghilangkan draft yang checksum-nya sama.
- **D-24.c — Tipe + bobot:** tiap indikator punya `options[]` (`value, label,
  weight 0–100, isFinding`) + `weight` pengali indikator (default 1). Skor
  laporan = persentase rata-rata terbobot (N/A dilewati, bukan nol). Opsi lama
  (`likert-1-5`, `boolean-ya-tidak`, `likert-1-2-tidak`) hanya dibaca untuk
  snapshot lama; indikator baru memakai 4 tipe D-24.
- **D-24.d — Snapshot beku + PDF:** tiap kirim membekukan copy soal + opsi +
  bobot + jawaban + `scorePercent` + `byDimension` pada snapshot; `Report`
  menyimpan `scorePercent` + `pdfGeneratedAt`. PDF laporan dibuat saat kirim
  (render cetak browser, frontend-only) dan baru tampil publik setelah
  `Diterima` Pesantren (moderasi D-02/D-03 tetap). Satu pondok dengan N penilai
  = N PDF pada `/laporan`; agregat memakai rata-rata `%` per pesantren.
  Registrasi penilai di atas `/penilaian-mandiri` (nama penilai + pesantren +
  kontak opsional).
- **D-24.e — Migrasi:** schema mock `v10 → v11`; bank live dibangun dari
  `INS-v1.1` (opsi/bobot default per tipe); `instrumentVersions` lama
  dipertahankan sebagai bacaan legacy + deprecasi lembut agar snapshot lama
  tetap tampil; fungsi versioning lama tidak dipakai UI baru. Reset demo
  kembali ke seed bank live.
- Dokumen terdampak: FLOWS §3/§7, DATA_MODEL (schema v11), ROLES §4,
  ROUTES (hapus menu Versioning), WIREFRAMES §3/§6, KATEGORI_K3 §8,
  DATA_REQUIREMENTS §2/§4, TEST_PLAN, TODO, STAGE_08. Scope Stage 08 +
  sentuhan baca laporan; status stage lain tidak berubah sepihak.

## D-26 — SAM-iSAFE khusus Validator (bank dinamis, MVP) — DISETUJUI 28 September 2026

- Arahan pemilik: SAM-iSAFE menjadi halaman baru di ruang Validator
  (satu entri navbar), dipakai untuk penilaian oleh Validator. Fase 1 hanya
  Validator; tidak tampil di dashboard publik maupun ruang Pesantren.
  Pembahasan tampil di Pesantren menyusul bila MVP sudah pas.
- **D-26.a — Bank dinamis:** kategori + pertanyaan SAM-iSAFE adalah bank data
  (`samCategories/samQuestions`), bukan array hard-code. Validator (semua akun
  Validator aktif) boleh tambah kategori dan tambah/aktifkan pertanyaan.
  Skor maksimum dinamis: `COUNT(aktif) x 2`; persen = `total/max x 100`.
  Rumus `Total/50` pada poster tidak dipakai.
- **D-26.b — Checklist awal:** 27 soal persis panduan dosen (Fisik 5,
  Kesehatan 5, Sosial/Tata kelola 5, Darurat 5, Perilaku 7). Ambang
  prototipe: `>=80 Risiko Rendah, 60-79 Risiko Sedang, <60 Risiko Tinggi`.
  Asumsi prototipe, bukan ketentuan ilmiah final.
- **D-26.c — Scope:** Validator memilih pesantren terdaftar mana pun
  (Validator general, tidak terikat satu pesantren). Foto bukti ditunda fase 2.
- **D-26.d — Pengecualian D-03 terbatas:** Validator boleh membuat/mengisi
  SAM-iSAFE saat login. Larangan kirim lapor-cepat/penilaian-mandiri saat
  login tetap berlaku.
- Dokumen terdampak: ROLES §4, ROUTES §2, FLOWS §baru, DATA_MODEL schema v12,
  WIREFRAMES §validator, TODO, stage `STAGE_SAM_ISAFE.md`.

## D-26.e — SAM-iSAFE fase 2 (bukti, tindak lanjut, tren, cetak, review) — DISETUJUI 27 September 2026

- Arahan pemilik (`ok kerjakan fase 2` + UI profesional): lengkapi modul
  SAM-iSAFE khusus Validator tanpa mengubah scope D-26.a–D-26.d
  (tetap Validator-only, tidak publik/Pesantren).
- **Bukti foto:** tiap jawaban boleh satu foto (PNG/JPEG/WebP, 5 MB/20 MP,
  pola sama `/lapor`, blob privat IndexedDB). Wajib dianjurkan bila skor 0,
  tetap opsional agar alur lapangan tidak terhambat.
- **Tindak lanjut:** tiap temuan (skor 0/1) dapat dibuatkan tindak lanjut
  (PIC + tenggat wajib, catatan opsional) dengan status
  `Belum ditindaklanjuti → Berjalan → Selesai`, plus `Dibatalkan` beralasan
  min 10 karakter. Dikelola Validator di halaman detail pengamatan.
- **Tren + statistik:** halaman riwayat memuat grafik perkembangan persen
  antar pengamatan Selesai dan rata-rata per kategori; murni ilustratif.
- **Cetak/PDF:** halaman detail memakai tombol cetak browser
  (`window.print`, pola `/laporan/:id`); tanpa PDF server.
- **Review supervisor:** pengamatan Selesai dapat ditandai `Ditinjau`
  oleh akun Validator (nama + waktu + catatan teraudit).
- **Audit:** halaman detail memuat jejak audit pengamatan tersebut.
- **UI profesional:** rapikan seluruh halaman SAM-iSAFE mengikuti token
  `DESIGN_SYSTEM.md` (tanpa kelas `.status`/warna merek baru).
- Dokumen terdampak: DATA_MODEL schema v13, TODO, stage `STAGE_SAM_ISAFE_FASE2.md`.

## D-26.f — Pematangan bank data SAM-iSAFE (CRUD lengkap + mobile) — DISETUJUI 28 September 2026

- Arahan pemilik (`ok kerjakan` atas keluhan bank kurang matang + tampilan HP):
  lengkapi `/validator/sam-isafe/bank` menyerupai bank instrumen (D-24),
  tetap Validator-only (D-26.a–D-26.d tidak berubah).
- **CRUD lengkap:** kategori bisa tambah/ubah/hapus; pertanyaan bisa
  tambah/ubah/hapus/pindah kategori/geser urutan. Hapus kategori ditolak bila
  masih berisi pertanyaan; hapus pertanyaan ditolak bila sudah dipakai
  pengamatan (sarankan nonaktifkan agar riwayat Selesai utuh).
- **Detail per soal bisa diubah:** tiap pertanyaan punya `panduan` observasi +
  `contohBukti` opsional yang diisi/diubah Validator (dosen pembimbing sering
  mengganti); isi 27 soal seed tidak diubah sepihak. Duplikat KAT-03 vs KAT-05
  (komite/insiden/briefing) hanya ditandai, tidak ditulis ulang.
- **Bank terpisah:** `SAM-KAT-*` khusus SAM-iSAFE; kategori sistem utama
  `KAT-*` (`kategori-k3.ts`) tidak terpengaruh perubahan bank ini.
- **Mobile portrait dulu:** accordion per kategori, tombol min 44px penuh di HP,
  input 16px, tanpa overflow horizontal (viewport 390×844 acuan).
- Dokumen terdampak: DATA_MODEL schema v14, TODO, stage `STAGE_SAM_ISAFE.md`.

## D-30 — Stack dan tahapan backend — DISETUJUI 28 September 2026

- Arahan pemilik: backend memakai **TypeScript + runtime Bun + MySQL** (serumpun
  frontend, tetap kencang). Storage file memakai **disk lokal dulu**; S3/object
  storage belum butuh dan tidak masuk MVP.
- **Login/auth server ditunda ke fase akhir** (fase 6): login kartu dummy +
  sessionStorage tetap dipakai sampai semua modul backend matang.
- **Seed satu file dua mode** (`scripts/seed.ts --mode=demo|empty`): demo penuh
  untuk presentasi dosen, kosong tapi valid untuk production. Seed tidak dipecah.
- Aturan AGENTS ±300 baris dibaca sebagai panduan keterbacaan komponen/logika,
  bukan kewajiban memecah file data (`seed.ts`) atau sistem yang sedang jalan
  (`mock-store.ts` dipecah hanya bila dibutuhkan saat migrasi).
- Rancangan detail: `BACKEND_OVERVIEW.md`, `BACKEND_DATA_MODEL.md`,
  `BACKEND_API_CONTRACT.md`, `BACKEND_STORAGE.md`, `BACKEND_MIGRATION.md`,
  `BACKEND_ISSUES.md`. Scope: rancangan dulu; kode backend setelah review.

## D-30.a — Validasi & pendetailan dokumentasi backend — DISETUJUI 28 September 2026

- Arahan pemilik (`ok kerjakan`): validasi penulisan dokumentasi backend +
  database + issue GitHub yang masih terbuka, dan pendetailan item yang kurang.
  Scope **dokumentasi dan issue saja**; kode `apps/web/` tidak diubah.
- Sumber kebenaran diperbaiki lebih dulu: `docs/DATA_MODEL.md` disinkronkan ke
  schema **v15** (sebelumnya masih menyebut v14/v11) agar acuan
  `BACKEND_DATA_MODEL.md` tidak bertentangan dengan `store/state.ts`.
- Kolom/entitas DDL yang hilang dilengkapi (pemetaan tipe frontend → kolom),
  termasuk field snapshot temuan, FK, `sequences`, `index_history`,
  `lapor_drafts`, `k3_categories/k3_aspects`, dan `instrument_versions` legacy.
- Kontrak API/storage diperdalam (contoh JSON, pemetaan error→HTTP, `/health`,
  endpoint legacy, rute blob kanonik, detail auth fase 6).
- Skrip `scripts/create-backend-issues.sh` dibuat idempoten (cek judul sebelum
  `gh issue create`); label fase + milestone + relasi `Depends on #` dicatat.
- Catatan lingkungan: `GITHUB_TOKEN` environment di mesin ini invalid dan
  menutupi akun keyring yang sah; perintah `gh` dijalankan dengan
  `env -u GITHUB_TOKEN gh ...`.

## D-30.b — Fase 1 backend + adapter publik — DISETUJUI 28 September 2026

- Arahan pemilik (`ok kerjakan`): kerjakan **Fase 1 backend** (issue #4) dan
  **swap adapter publik** (issue #10 parsial untuk route publik).
- Backend `apps/api`: endpoint baca publik, lapor-cepat, penilaian-mandiri
  (draft/submit), unggah bukti, dan penyajian berkas; penomoran `sequences`
  transaksional; audit + notifikasi ditulis sejak Fase 1. Processor/selector
  murni **diimpor** dari `apps/web/mocks` agar paritas 1:1 (seperti seed Fase 0);
  validasi ditulis ulang di `apps/api/src/domain` dengan pesan Indonesia identik.
- **Ekstensi kontrak:** `GET /api/v1/public/state` — proyeksi publik `IshasState`
  (D-02: tanpa identitas pelapor, jawaban mentah, alasan tolak, audit mentah)
  agar halaman publik dapat beralih tanpa menulis ulang seluruh UI. Endpoint
  granular §2 tetap ada.
- Frontend `apps/web`: `shared/api/http-client.ts`, `http-repository.ts`,
  `repository.ts` (flag `VITE_USE_BACKEND`, default `false`), dan
  `public-state.ts` (`usePublicState`). Proxy Vite `/api` → `API_PORT`.
  Modul di luar scope Fase 1 tetap fallback mock.
- Auth tetap `X-Demo-Account`/kartu dummy (fase 6); production menolak header.
- Batas terverifikasi: lint + typecheck + 48 test backend (unit + integrasi DB)
  + 229 test frontend + build lulus; cek visual 3 viewport belum dijalankan.

## D-30.c — Fase 2 backend + adapter ruang Pesantren — DISETUJUI 29 September 2026

- Arahan pemilik (`ok kerjakan fase 2`): lanjutkan backend issue #5 dan adapter
  ruang Pesantren (issue #10 lanjutan).
- Backend `apps/api`: antrean + detail internal, Terima/Tolak, lifecycle
  `Pending/Proses/Completed` + arsip, `setFindingLevel` (termasuk Ekstrem),
  lokasi (gedung/lantai/area), denah (unggah + publish `optimistic lock`),
  tindak lanjut (progres snap 25, verifikasi, pembatalan). Turunan
  temuan/rekomendasi di `domain/derive.ts` port 1:1 `ensureDerivedWork`.
- **Ekstensi kontrak:** `GET /api/v1/pesantren/state` — proyeksi internal
  scope satu lembaga untuk adapter; bukan endpoint publik.
- Frontend: `usePesantrenState` + `refreshPesantrenState`, method Pesantren di
  `repository`/`http-repository`. Halaman validasi/lokasi/denah/tindak lanjut/
  laporan beralih saat `VITE_USE_BACKEND=true`; fallback mock tetap.
- Batas terverifikasi: lint + typecheck + 55 test backend + 233 test frontend +
  build lulus; cek visual 3 viewport belum dijalankan.

## D-30.d — Fase 3 backend + adapter ruang Validator — DISETUJUI 29 September 2026

- Arahan pemilik (`ok kerjakan semaksimal mungkin kalau frontend perlu disesuaikan`):
  kerjakan backend issue #6 dan sesuaikan frontend Validator yang diperlukan.
- Backend `apps/api`: bank instrumen live (CRUD dimensi/indikator/opsi+bobot/pengali,
  validasi 1:1 mock, tiap ubah → checksum + audit, hapus tak merusak snapshot beku);
  dokumen indikator (unggah PDF `%PDF-` ≤10 MB, upsert 1 berkas/indikator, entri
  manual D-16.g, visibilitas Public/Privat, blob Privat hanya Validator); dataset
  (filter terdaftar + toggle non-terdaftar, ekspor CSV/JSON whitelist D-02, impor
  ≤200 baris → pratinjau → `Menunggu validasi`); audit publikasi 5 kriteria (D-25.b).
  Modul baru `domain/bank.ts`, `domain/docs.ts`, `domain/dataset.ts`,
  `repo/bank.ts`, `repo/docs.ts`, `routes/validator.ts`.
- **Ekstensi kontrak:** `GET /api/v1/validator/state` (proyeksi penuh untuk adapter;
  bukan publik) + `GET /api/v1/validator/bank/dimensions` (bank penuh dengan bobot
  + flag temuan, yang tidak ikut di `/instrument/bank` publik).
- Frontend `apps/web`: `shared/api/validator-state.ts` (`useValidatorState` +
  `refreshValidatorState`), method bank/dokumen/dataset di `http-repository`/
  `repository`, `apiBlob` di `http-client`. Halaman Validator non-SAM (bank,
  dokumen, dataset, audit publikasi, scoring, dashboard) beralih saat
  `VITE_USE_BACKEND=true`; SAM-iSAFE (Fase 4) + modul lain tetap fallback mock.
- Batas terverifikasi: lint + typecheck + 61 test backend + 233 test frontend +
  build lulus; cek visual 3 viewport belum dijalankan di lingkungan ini.

## D-30.e — Fase 4 backend + adapter SAM-iSAFE — DISETUJUI 29 September 2026

- Arahan pemilik (`ok kerjakan fase 4`, jawaban **A** atas pertanyaan unik tindak
  lanjut): kerjakan backend issue #7 (SAM-iSAFE, Validator-only) sekaligus
  adapter frontend halaman SAM.
- Backend `apps/api`: bank SAM (kategori + soal: CRUD, pindah kategori, urutan,
  aktif/nonaktif, tolak hapus kategori berisi soal / soal terpakai pengamatan,
  panduan ≤500 + contohBukti ≤280, penanda duplikat); pengamatan (buat Validator
  atas pesantren terdaftar, jawab 0/1/2 + bukti berpasangan, selesai bila semua
  aktif terjawab, review `Selesai`, hapus non-`Selesai`); tindak lanjut temuan
  skor 0/1 (unik aktif per soal, PIC ≥2, tenggat ≥ tanggal pengamatan, batal
  ≥10); skor dinamis maks = soal aktif × 2, ambang prototipe 80/60. Modul baru
  `domain/sam.ts`, `repo/sam.ts`; unggah bukti di `domain/uploads.ts` + rute
  `POST /uploads/sam-evidence` dan cabang `GET /files/:assetId` khusus Validator.
- **Migrasi `0002_sam_followup_active.sql`:** unique `sam_follow_ups` diganti
  kolom generated `active_key` (`NULL` saat `Dibatalkan`) agar "satu aktif per
  temuan" ditegakkan DB tanpa memblokir riwayat batal berganda (setara mock).
- Perbaikan lintas fase: `repo/state.ts` memetakan kolom DATE (`sam_assessments.
  observed_at`, `sam_follow_ups.due_date`, `recommendations.due_date`) memakai
  `toDateOnly` — sebelumnya `Date` mysql2 menjadi teks Inggris sehingga
  perbandingan tangga/tenggat salah.
- Frontend `apps/web`: method SAM di `http-repository`/`repository`, `useValidatorState`
  dipakai halaman/komponen SAM, `EvidencePreview` memuat blob via repository
  (server saat `VITE_USE_BACKEND=true`); mock tetap default.
- Batas terverifikasi: lint + typecheck + 65 test backend + 238 test frontend +
  build lulus; smoke endpoint SAM OK; cek visual 3 viewport belum dijalankan.

## D-30.f — Fase 5 backend + adapter Super Admin, notifikasi, storage — DISETUJUI 29 September 2026

- Arahan pemilik (`ok kerjakan fase 5`, "semaksimal mungkin … kalau frontend butuh
  perbaikan langsung diperbaiki"): kerjakan backend issue #8 sekaligus adapter
  frontend admin, notifikasi, storage, dan migrasi aset.
- Backend `apps/api`: Super Admin — `POST/PATCH` pesantren (kode `PSN-XXXX` dari
  max+1) + status, pengguna (id `USR-NNN`, status awal `Menunggu`, peran tak
  diubah, proteksi admin terakhir/demo/akun sendiri), reset sandi (audit), audit
  global + filter pelaku, `POST /admin/reset-demo` (bersihkan storage + seed), dan
  `GET /admin/state`. Modul `domain/admin.ts`, `repo/admin.ts`, `routes/admin.ts`.
- Notifikasi: `GET /notifications?account=` + `POST /notifications/read`
  (aksi `markNotificationsRead` ditambahkan ke store mock agar paritas).
- Storage penuh: `tmp-uploads/` + rename atomik, `owner_ref` diisi saat submit
  (lapor/self-assessment/SAM/penyelesaian), job yatim `sweepOrphans` + skrip
  `bun run sweep` + `POST /admin/storage/sweep`. `sharp` **tidak** dipakai
  (uji coba install: proses decode menggantung di lingkungan ini); validasi tetap
  magic-bytes + dimensi (`image.ts`) + header `%PDF-` — dicatat sebagai batas.
- Migrasi sekali-jalan IndexedDB → server: migrasi `0003_app_settings.sql`
  (tabel `app_settings`), `POST /admin/migrate/assets` + `GET
  /admin/migrate/status` (flag `indexeddb_migrated`); frontend mengekspor blob
  perangkat (`mocks/adapters/device-assets.ts`) lalu membersihkan IndexedDB.
- Frontend `apps/web`: `useAdminState` + `useWorkspaceState` (shell role-aware),
  method admin/notifikasi/migrasi di `http-repository`/`repository`, `reset()`
  beralih ke endpoint + refresh semua cache, tombol "Tandai semua dibaca" di
  modal notifikasi, dan kartu "Migrasi aset perangkat" di `/admin/pengaturan`.
- Batas terverifikasi: lint + typecheck + 71 test backend + 242 test frontend +
  build lulus; smoke endpoint admin/notifikasi/sweep OK; cek visual 3 viewport
  belum dijalankan.

## D-30.g — Audit + perbaikan Fase 0–5 sebelum auth (issue #6) — DISETUJUI 29 September 2026

- Arahan pemilik (`validasi issues backend yang sudah ditutup fase 0–5 … sebelum
  lanjut ke #6` lalu `ok kerjakan`): audit menyeluruh #3–#8 + #10, lalu perbaiki
  semua temuan (A–F) sebelum fase auth. Status stage lain tidak berubah sepihak.
- **Perbaikan backend:** redaksi D-02 pada `/public/results|recommendations|follow-ups`
  dan `pdf-data` (foto bukti saja, tanpa jawaban mentah); `DELETE
  /uploads/report-evidence/:assetId` dibatasi kind + scope Pesantren (Super Admin
  dilarang); `accept` memeriksa sesi/scope sebelum validasi; pemetaan status HTTP
  **401** (tanpa sesi) & **413** (ukuran/tipe berkas) selain 403/404/409; idempotensi
  lapor-cepat membaca header `X-Request-Id`; pagination audit 20/100; route berkas
  menyajikan blob via `tryReadStoredBlob` (baris seed tanpa blob → 404, bukan 500).
- **Skema:** migrasi `0004` menambah FK `RESTRICT` `reports.evidence_asset_id`
  dan `recommendations.completion_evidence_asset_id` → `file_assets`; migrasi
  `0005` menambah `notifications.legacy_id` agar ID `NOT-*` stabil.
- **Seed fidelity:** `instrument_version_dimensions.description` disimpan,
  `instrument_docs.updated_by` memakai nama seed, dan ilustrasi denah seed disalin
  ke storage agar `GET /api/v1/files/:assetId` menyajikannya (paritas mock).
- **Adapter #10:** `uploadSelfEvidence` → `POST /uploads/self-evidence` (picker
  penilaian-mandiri sebelumnya salah endpoint), pustaka dokumen publik memakai
  `repository`, halaman PDF publik memakai `GET /public/reports/:id/pdf-data`
  (hook `usePublicReportPdf`) + `openCampusPlanAsset`, dan `refreshPublicState`
  setelah mutasi/reset. Self-evidence publik hanya bila menempel pada laporan
  mandiri `Diterima`.
- **Higiene test:** test integrasi auto-skip bila `DB_NAME` bukan database uji
  (`*test*`); verifikasi memakai `DB_NAME=ishas_test` (seed `TRUNCATE`).
- Verifikasi: lint + typecheck + **78 test backend** (DB uji) + **244 test frontend**
  + build lulus; migrate `--fresh` 5 migrasi + seed demo/empty OK. Cek visual 3
  viewport adapter tetap pending (tercatat di TODO).

## D-30.h — Fase 6 backend: auth server + RBAC + seed dua mode — DISETUJUI 29 September 2026

- Arahan pemilik (`ok kerjakan`): selesaikan Fase 6 backend (issue #9), lalu
  commit + tutup issue (tanpa push). Selama pengembangan **login tetap satu klik
  kartu peran** di `/login` (tanpa ketik email/sandi); frontend disambungkan
  sepenuhnya ke klaim server. Seed harus punya mode data display kaya (demo)
  dan mode akun inti (awal, isi lain kosong).
- **Auth server:** `password_hash` bcrypt via `Bun.password` (CHAR(60)),
  `sessions` (token acak, `token_hash` SHA-256, expiry, cabut sesi lain saat
  ganti sandi), cookie `ishas_session` (`HttpOnly`, `Secure` di production,
  `SameSite=Lax`, `Max-Age`) + `ishas_csrf`. Endpoint `/auth/login`,
  `/auth/demo-login` (dev-only, `404` di production), `/auth/logout`,
  `/auth/me`, `/auth/password`; rate limit 5/menit per IP+email → `429`; audit
  masuk/keluar/ubah sandi.
- **RBAC:** middleware terpusat di `app.ts` per prefix (`/admin/*`,
  `/validator/*`, `/pesantren/*`, `/notifications*`) → anonim `401`, peran salah
  `403`; scope lembaga + visibilitas berkas tetap di handler. `X-Demo-Account`
  hanya fallback non-production.
- **CSRF:** double-submit `X-CSRF-Token` = cookie `ishas_csrf` untuk mutasi
  ber-cookie; `/auth/*` dikecualikan.
- **Frontend (login kartu dipertahankan):** `httpRepository` method auth,
  `auth-session` cache akun `/auth/me`, `useCurrentUser` memakai akun server di
  mode backend, `X-CSRF-Token` otomatis dari cookie, Keluar memanggil
  `/auth/logout`. Mode mock (`VITE_USE_BACKEND=false`) tetap seperti sebelumnya.
- **Seed:** mode `demo` (kaya, semua user diberi sandi awal) dan mode `empty`
  berubah menjadi **inti**: 1 pesantren `PSN-0018` `Aktif` + 3 akun inti
  (`USR-001/002/003`) aktif bersandi, bank minimal; laporan/temuan/SAM/audit/
  denah/dokumen kosong. Sandi default `SEED_DEFAULT_PASSWORD` (prototipe).
- **Catatan:** akun baru `POST /admin/users` menerima `password` opsional
  (default `SEED_DEFAULT_PASSWORD`); reset sandi mengembalikan ke sandi awal.
  Cookie `Secure` mengandalkan HTTPS di production.
- Verifikasi: lint + typecheck + 101 test backend (DB uji) + 249 test frontend +
  build lulus; smoke `demo-login → /auth/me → RBAC 403` OK. Cek visual 3 viewport
  belum dijalankan (Chromium tidak tersedia).

## D-31 — Pengerasan adapter backend (P0–P2) — DISETUJUI 29 September 2026

- Arahan pemilik (`kerjakan`): backend + MySQL sudah menyala dan `VITE_USE_BACKEND=true`,
  jadi tuntaskan celah agar mode backend tidak menyajikan data dummy diam-diam.
- **P0 — Tanpa fallback mock:** keempat sumber state ruang (`public`/`workspace`/
  `validator`/`admin`) memakai satu factory `shared/api/backend-state.ts`. Saat mode
  backend dan state server loading/gagal, hook mengembalikan state kosong (bukan seed
  mock) + status error untuk banner; `refresh()` mereset penanda agar tombol coba lagi
  bekerja. `useCurrentUser` tidak lagi membaca `useMockState()` untuk nama lembaga.
- **P1 — Resolver bersih:** `shared/api/repository.ts` tidak lagi spread `...mockRepository`;
  selector baca mock (`registeredInstitutions`, `validatedReports`, `findingsFor`,
  `recommendationsFor`) tidak dapat terpanggil di mode backend.
- **P2a — Tipe proyeksi publik:** proyeksi `/public/state` diberi tipe eksplisit agar
  field yang sengaja tidak dikirim tidak diam-diam bertipe ada.
- **P2b — Restore draft penilaian mandiri:** draft `SELF-*` tidak lagi dibaca dari
  `/public/state` (sengaja dikosongkan, D-02). Ditambah `GET /self-assessments/drafts/:id`
  (scope pemilik draft) dan halaman penilaian memuat draft dari server saat mode backend.
- **P2c — Modul domain bersama (utang):** backend masih mengimpor `apps/web/mocks/*`
  (types/selector/processor). Pemindahan ke modul bersama dicatat sebagai pekerjaan
  lanjutan tersendiri, bukan bagian perilaku produk.
- **Batasan:** struktur data, aturan akses (D-02/D-03), copy, dan rumus tidak berubah.
- Verifikasi: lint + typecheck + test + build FE/BE; smoke browser per peran + 3 viewport.

## D-25 — Audit publikasi + dataset maksimal Validator — DISETUJUI 28 September 2026

- Arahan pemilik (`ok kerjakan` Opsi B): rapikan tiga halaman Validator
  sekaligus (Scoring, Validasi & publikasi, Data penelitian) karena tampilan
  beda dari halaman lain dan alurnya membingungkan.
- **D-25.a — Istilah:** `Validator` = ex-`Peneliti` (kelola bank, bobot,
  audit skor, audit publikasi, dataset). `Pesantren` = ex-`Pengelola`
  pondok (satu-satunya yang `Terima/Tolak` laporan + isi
  `severity/priority`). `Divalidasi oleh / nama validator` pada publik =
  akun Pesantren penerima, bukan peran Validator (D-17.c tetap berlaku).
- **D-25.b — Rename label:** menu `Validasi & publikasi` menjadi
  `Audit publikasi`. Route `/validator/validasi-publikasi` tetap (kompatibel
  + redirect lama) — hanya label, H1, dan docs yang berubah. Alasan: hindari
  tabrakan dengan `Validasi laporan` milik Pesantren. Kriteria layak publik
  eksplisit 5 poin: snapshot lengkap + `Diterima` + `scorePercent` ada +
  `pdfGeneratedAt` ada + checksum cocok (beda = label bank berubah, snapshot
  tetap beku).
- **D-25.c — Dataset maksimal:** filter utama hanya pesantren terdaftar
  (konsisten pemilih publik + D-08) + toggle `Sertakan non-terdaftar (audit
  internal)` dengan chip status. Ekspor CSV/JSON memakai whitelist D-02
  (tanpa nama/kontak pelapor, bukti, jawaban mentah, alasan tolak, audit
  mentah). Impor = upload → validasi → pratinjau → terapkan sebagai
  `Menunggu validasi` (masuk antrean Pesantren, tidak langsung publik;
  DATA_REQUIREMENTS §9 tetap). Staging in-memory, tanpa migrasi schema
  (tetap v11).
- Dokumen terdampak: ROLES §4, ROUTES §2, FLOWS §7, WIREFRAMES §6,
  DATA_REQUIREMENTS §9, TEST_PLAN §3/§7, TODO, STAGE_08. Scope Stage 08 +
  sentuhan baca laporan/dashboard validator; status stage lain tidak berubah
  sepihak.

## D-27 — Bukti foto penilaian mandiri diunggah beneran + tampil di PDF publik — DISETUJUI 28 September 2026

- Arahan pemilik: bagian bukti pendukung penilaian mandiri selama ini hanya
  kolom ketik nama file sehingga tidak bisa mengunggah gambar; pemilik meminta
  upload beneran agar foto masuk rekapan PDF, dan bukti pada PDF laporan
  menjadi publik supaya orang luar dapat melihatnya.
- **Keputusan:**
  - Kolom ketik nama diganti tombol upload file (PNG/JPEG/WebP, maks 5 MB dan
    20 megapiksel, pola sama `/lapor` — D-21) hanya pada indikator yang
    `evidenceRequired` menurut bank instrumen Validator; indikator lain tanpa
    bagian bukti. Satu pertanyaan = satu foto; pratinjau + lepas/ganti.
  - Foto tersimpan sebagai blob privat di IndexedDB perangkat pengunggah
    (bukan localStorage); draft menyimpan `evidenceAssetId` + `evidenceName`;
    snapshot beku membawa keduanya.
  - Foto bukti penilaian mandiri tampil publik di PDF `/laporan/:id`
    (amendemen D-02 terbatas). Tanpa foto = PDF tanpa gambar pada jawaban itu.
    Bukti lapor-cepat dan bukti penyelesaian tindak lanjut tetap privat.
  - Keterbatasan prototipe: foto hanya tersedia di perangkat pengunggah;
    di perangkat lain PDF menampilkan nama file + catatan gambar tidak
    tersedia di perangkat ini.
- Dokumen terdampak: FLOWS §3/§6, ROUTES §1, DATA_MODEL §2–§3,
  DATA_REQUIREMENTS §6, WIREFRAMES §3/§5, STAGE_08. Scope Stage 08;
  status stage lain tidak berubah sepihak.

## D-28 — Halaman hasil publik digabung; Laporan pimpinan publik dihapus — DISETUJUI 28 September 2026

- Arahan pemilik: `Hasil penilaian` dan `Laporan` di dashboard publik terlalu
  boros (metrik dan daftar PDF dobel); dashboard publik tidak perlu laporan
  pimpinan. Semua isi laporan dikumpulkan di hasil penilaian; detail pra-cetak
  dimatangkan sebagai rekapan.
- **Keputusan:**
  - Halaman publik `/laporan` dihapus (jadi 404); menu `Laporan` dihapus dari
    navigasi publik. Satu-satunya halaman hasil publik adalah `/hasil`:
    baris metrik (Indeks K3L · Temuan aktif · Terverifikasi) + dimensi hasil +
    daftar PDF penilaian. Tombol `Unduh simulasi` (alert dummy) dibuang.
  - Detail `/laporan/:id` tetap sebagai halaman cetak rekapan (opsi a):
    kop + skor + dimensi + temuan diperkaya (lokasi lengkap, severity/priority
    final, status/progres/PIC tindak lanjut) + foto bukti (D-27) + metadata
    (bank, checksum, validator, waktu). Tanpa jawaban mentah per soal (D-02).
  - `/pesantren/laporan` (workspace internal) tidak berubah.
- Dokumen terdampak: ROUTES §1, WIREFRAMES §5, FLOWS §6, ROLES §akses publik,
  DATA_MODEL §3, DATA_REQUIREMENTS §6, TEST_PLAN §3. Scope Stage 08;
  status stage lain tidak berubah sepihak.

## D-29 — Usulan rekomendasi pelapor + final Pesantren (lapor-cepat) — DISETUJUI 28 September 2026

- Arahan pemilik: rekomendasi di `/rekomendasi` adalah rekomendasi tindakan
  perbaikan; untuk sekarang dimasukkan sebagai usulan pelapor dari dashboard
  umum (`/lapor`), divalidasi Pesantren, baru tampil di rekomendasi.
- **Keputusan:**
  - Form `/lapor` tambah `Usulan rekomendasi tindakan` opsional (maks 500
    karakter; bila diisi minimal 10). Tersimpan sebagai `reporterRecommendation`
    (usulan internal, tidak tampil publik — D-02).
  - Validasi Pesantren menampilkan usulan sebagai pre-fill; saat `Terima`
    lapor-cepat wajib isi rekomendasi final (min 10, maks 500, boleh ubah total
    dari usulan). Yang tampil publik di `/rekomendasi` adalah versi final
    (`Recommendation.action`).
  - Scope lapor-cepat dulu; satu laporan = satu rekomendasi. Penilaian-mandiri
    tetap perilaku turunan otomatis lama sampai diputuskan terpisah.
  - Migrasi schema mock `v14 → v15` aditif (field baru, tanpa hapus data/ID).
- Dokumen terdampak: FLOWS §2/§4, WIREFRAMES §2/§4, DATA_MODEL §0/§2/§4, TODO.
  Scope Stage 03+05 + sentuhan baca Stage 04/07; status stage lain tidak berubah sepihak.
