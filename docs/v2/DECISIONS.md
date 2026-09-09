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

## Pertanyaan yang telah diajukan — menunggu jawaban

### D-01 — Cara pembangunan V2

- **Konflik:** README menyebut “dari nol”, tetapi tabel migrasi memerintahkan perubahan langsung pada aplikasi V1 dan pemindahan komponen.
- **Pertanyaan:** bangun aplikasi V2 terpisah, rombak aplikasi sekarang bertahap, atau tunda keputusan sampai kebutuhan matang?
- **Dampak:** lokasi proyek, pemakaian komponen lama, penyimpanan demo, arsip landing, URL lama, dan dokumen di luar V2.
- **Status:** MENUNGGU JAWABAN. Lokasi aplikasi baru dan penghapusan kode lama belum ditentukan.
- **Batas selama menunggu:** tabel migrasi adalah inventaris dampak; tidak ada pemindahan, penghapusan, atau perubahan aplikasi.

### D-02 — Batas informasi publik

- **Konflik:** semua laporan diterima disebut tampil publik, tetapi belum ada pemisahan antara ringkasan dan isi internal. Wireframe juga mencantumkan pelapor, validator, bukti, PIC, dan denah.
- **Pertanyaan:** publik cukup membaca ringkasan hasil/progres, atau juga detail temuan, bukti, dan denah? Bidang apa saja yang tetap khusus pengelola?
- **Usulan untuk ditinjau:** ringkasan hasil/progres publik; nama pelapor, kontak, bukti mentah, serta denah rinci terbatas. Ini belum menjadi keputusan.
- **Status:** MENUNGGU JAWABAN.
- **Dampak:** `/`, `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut`, `/laporan`, profil pesantren, ekspor, dan data penelitian.
- **Rincian lanjutan:** apakah jumlah antrean yang belum divalidasi boleh publik; apakah opsi “tampil anonim” masih diperlukan; apakah nama validator/PIC boleh terlihat; apakah alamat lengkap termasuk profil publik?
- **Batas selama menunggu:** `Diterima` merupakan syarat kelayakan data, belum merupakan izin menampilkan seluruh isinya.

### D-03 — Hak melapor saat login

- **Konflik:** README menyebut hak lapor sama; ROLES melarang Super Admin/Peneliti; ROUTES menyatakan formulir publik selalu dapat dibuka semua sesi.
- **Pertanyaan:** semua sesi boleh mengirim laporan/penilaian, atau Super Admin/Peneliti harus keluar dahulu?
- **Status:** MENUNGGU JAWABAN.
- **Rincian lanjutan:** apakah pengelola boleh melapor ke pesantren lain sebagai pelapor umum, sambil tetap hanya mengelola pesantrennya sendiri? Apakah hak laporan cepat dan instrumen penuh memang sama?
- **Dampak:** matriks akses, tombol pada dashboard, guard tindakan, isian nama otomatis, audit pengirim, dan pengujian lintas peran.
- **Batas selama menunggu:** jangan menambah atau menghapus hak suatu peran berdasarkan pilihan teknis router.

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
