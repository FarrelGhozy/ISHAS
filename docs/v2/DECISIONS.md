# V2 — Catatan Keputusan dan Pertanyaan Terbuka

Tanggal pemeriksaan: **8 September 2026**. Dokumen ini memisahkan arahan pemilik,
arah yang diwarisi dari dokumen sebelumnya, dan hal yang belum diputuskan.
Tidak adanya jawaban bukan persetujuan. Rekomendasi di bawah adalah bahan diskusi.

## Arahan yang terkonfirmasi pada sesi ini

| ID | Arahan | Sumber |
|---|---|---|
| D-00 | Validasi dan tambahkan detail rencana hanya di `docs/v2/`; jangan mengubah file lain atau membuat kode. Jika ada kebingungan, tanyakan terlebih dahulu. | Pesan pemilik, 8 September 2026 |

Arahan sebelumnya yang **tercatat** di [Stage 12](../../planning/STAGE_12_SELF_REPORT_PUBLIK.md):
dashboard publik menggantikan landing sementara, peran Asesor dihentikan, tiga peran login,
dua kanal pelaporan, nama pelapor dicatat, moderasi pengelola wajib, dan frontend memakai dummy.
Audit ini tidak menganggap setiap rincian turunannya telah disetujui kembali.

## Keputusan yang telah dijawab pemilik

### D-01 — Cara pembangunan V2 — DIJAWAB 8 September 2026

- **Keputusan (kata-kata pemilik):** V2 adalah **aplikasi terpisah bernama ISHAS**; rancangan V2
  dijadikan proyek yang sebenarnya (bukan sekadar prototipe). Frontend dibangun dengan
  **React Router**, file **dipecah per folder per area/per bagian** agar tidak ada file raksasa,
  dan dijalankan dengan **bun 1.4** yang ada di laptop (terpasang: bun 1.4.2). Bila perlu
  meniru pola, rujuk proyek `~/Documents/02_Projek/HIBAH_INTERNAL`.
- **Konsekuensi:**
  - V1 (aplikasi lama) **tidak diubah sama sekali**. `MIGRATION_FROM_V1.md` dibaca sebagai
    inventaris kebutuhan/bahan salin-adaptasi untuk aplikasi baru, bukan perintah edit V1.
  - Landing tidak diarsip di aplikasi baru; landing tetap hidup di V1 saja. Bila kelak diminta,
    halaman perkenalan dibuat baru di aplikasi ISHAS (masih menunggu keputusan).
  - Penyimpanan browser aplikasi baru murni V2; tidak ada data V1 pada origin baru, jadi
    kekhawatiran hidup berdampingan gugur. Key tetap `ishas-mock-v4` + key sesi/draft baru
    (usulan SUGGESTIONS §7).
- **Konfirmasi lanjutan (8 September 2026):** lokasi aplikasi baru = `~/Documents/02_Projek/ishasV2/ishas`
  (subfolder di dalam folder dokumen); styling **Tailwind v4** mengikuti pola HIBAH_INTERNAL,
  dengan token `DESIGN_SYSTEM.md` §1 sebagai theme. Pemilik meminta pembangunan frontend dimulai
  pada sesi yang sama (aktivasi V2-01).
- **Status:** DISETUJUI penuh (inti + lokasi + stack pendukung).

### D-02 — Batas informasi publik — DIJAWAB 8 September 2026

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

**Usulan untuk pembangunan V2-02 — DISETUJUI SEBAGAI ATURAN ILUSTRASI (bukan rumus final),
8 September 2026:** pemilik memilih "bangun dengan aturan ilustrasi" dan meminta dashboard
"penuh dengan data" untuk V2-02. Aturan yang dipakai sementara (semua angka berlabel
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

**Konflik:** FLOWS dan V2-03 mewajibkan area serta mengunci kirim, tetapi DATA_MODEL menjadikan area
opsional bila tidak tersedia. Pilihan ini memengaruhi onboarding, kesiapan demo, dan pemetaan temuan.
Tanpa denah berbeda dari tanpa area; lokasi dapat berbentuk daftar area tanpa titik denah.

### D-12 — Seberapa besar perubahan tampilan dan alur lama

**Pertanyaan:** apakah layout/copy V1 dipertahankan atau boleh dirancang ulang mengikuti kebutuhan V2?
Apakah istilah status `Pending/Proses/Completed` tetap digunakan atau diubah menjadi bahasa Indonesia seluruhnya?

**Konflik:** tujuan perubahan besar berhadapan dengan larangan mengubah copy/layout “FINAL” dan
instruksi “Peneliti tidak berubah” tanpa memetakan data hasil V2.

**Usulan:** pisahkan identitas marun yang telah tercatat dari detail layout, ukuran teks, navigasi,
dan kalimat UI yang masih bisa dibahas. Ini belum mengizinkan redesign aplikasi.

## Cara mencatat jawaban

Untuk setiap jawaban, tambahkan: tanggal, keputusan dengan kata-kata pemilik, bagian yang belum
terjawab, dokumen/stage yang terdampak, serta status sinkronisasinya. Jawaban satu subpertanyaan
tidak otomatis menjawab seluruh D-ID. Tandai `DISETUJUI` hanya pada keputusan yang benar-benar diberikan.

Sebelum tahap kode: keputusan penghambat stage tersebut telah dijawab, rancangan yang bertentangan
telah diselaraskan, acceptance criteria dapat diperiksa, dan pemilik meminta pembangunan dimulai.

## Review frontend stage 1–3 — arahan pemilik 8 September 2026

Pemilik meminta validasi dan perbaikan coding stage 1–3, fokus UI/UX, keluwesan di semua layar, dan alur data frontend. Backend ditunda sampai frontend disepakati. Review perbaikan V2-01 → V2-02 → V2-03 diaktifkan berurutan; stage BACKLOG tidak diaktifkan. Arahan ini mengizinkan perbaikan keterbacaan, ukuran kontrol, navigasi responsif, dan konsistensi draft/filter; identitas warna serta keputusan ilmiah/hak peran tetap mengikuti ketentuan yang sudah disetujui. D-04–D-11 final tetap terbuka; kebijakan interim V2-03 tetap berlaku. Status akhir menunggu review pemilik, bukan DONE.

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
