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
