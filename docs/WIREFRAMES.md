# Spesifikasi Halaman (Wireframe Tertulis)

## Susunan dashboard terkini — amendemen D-13, 18 September 2026

Tema, warna, token, dan gaya dasar dipertahankan. Sidebar desktop/menu mobile
berasal dari shared shell publik. Konten utama: ringkasan dan tren, statistik,
aktivitas/risiko/kanal/status, grafik kategori dan rekap lokasi, tabel kategori,
lalu temuan prioritas. Pada layar sangat lebar (breakpoint 2xl), kolom pendamping
20rem berisi kategori, peta, tindak lanjut, dan hasil dimensi. Di layar lebih
sempit kolom pendamping turun ke bawah, kemudian seluruh kartu menumpuk di ponsel.
Grafik kategori horizontal di ponsel; label tidak dipotong. Pada desktop xl,
kartu kategori dan lokasi sama tinggi 22rem; tabel lokasi scroll vertikal dengan
header sticky dan legenda tetap. Di bawah xl tinggi mengikuti isi. Tabel kategori tetap
9 kolom, scroll di panel dengan kolom pertama sticky dan baris total.

Acuan metrik/filter: [DASHBOARD_DATA_FLOW.md](DASHBOARD_DATA_FLOW.md).
Susunan ini menggantikan region dashboard historis §1; perubahan tidak menambah
menu pengaturan publik atau form penetapan risiko publik.



**Amendemen D-14 — 18 September 2026:** larangan denah/titik publik pada
wireframe historis di bawah diganti terbatas: denah gambaran besar dan pin temuan
Diterima boleh tampil setelah memilih satu pesantren. Scope general menampilkan
ajakan pilih pesantren tanpa gambar. Lantai hanya keterangan, bukan denah terpisah.
Susunan panel, detail pin, responsif dan empty/error state baru di
[RISK_MAP_DESIGN.md](RISK_MAP_DESIGN.md) §2–7; masih rancangan untuk review.

Semua token visual mengacu ke `DESIGN_SYSTEM.md`. Copy dan layout di bawah adalah
**rancangan untuk diskusi**, belum final. Perubahan besar tampilan menunggu D-12;
bidang publik mengikuti D-02 (ringkasan saja + nama validator/PIC — matriks di
`DATA_REQUIREMENTS.md` §6) dan hak kirim mengikuti D-03 (publik + Pesantren).

## 0. Pola umum semua halaman publik

- Header publik: logo ISHAS + teks `ISHAS` + subteks `Penilaian K3L Pesantren` | kanan: penanda `Data publik · ilustrasi` (`status-blue`) + tombol **Masuk** (`secondary-button`; bila sudah login menjadi tombol **Ruang kerja** + nama akun).
- Di bawah header pada `/`: bar konteks berisi **Pemilih pesantren** (dropdown, opsi pertama `Semua pesantren terdaftar`) + info periode + tombol **Laporkan temuan** (`primary-button`, ikon plus) + tombol **Penilaian mandiri** (`secondary-button`, ikon clipboard).
- Setiap angka indeks/skor selalu disertai: kategori + periode + versi instrumen + status data. Tidak ada angka telanjang.
- State halaman: `loading` ("Menyiapkan halaman…"), `empty` (pesan + aksi), `error` (pesan + tombol muat ulang). Tabel lebar di ponsel boleh scroll horizontal; halaman tidak boleh overflow.

## 1. `/` Dashboard publik

**Region (atas → bawah):**

1. Bar konteks (lihat §0) + banner scope: ikon gedung + `Pesantren aktif: [Semua terdaftar | nama]` + `Periode hasil: [periode]` + chip `Data ilustrasi` (`status-blue`).
2. Kartu statistik (4, `stats-grid`): Indeks K3L (nilai + "Naik/turun X dari periode lalu" + ikon perisai), Risiko tinggi (`stat-red`, "Perlu tindakan segera"), Tindak lanjut (`stat-amber`, rata-rata progres + "N pekerjaan"), Terverifikasi (`stat-blue`, count + "Oleh akun Pesantren").
3. Panel grafik: `Perkembangan indeks` (sub: "Perbandingan enam periode terakhir") + tren `+X periode ini` (`trend-up` hijau) + grafik area biru (identitas D-18); panel samping `Hasil per dimensi` (bar per dimensi + "Area nilai terendah diprioritaskan").
4. Panel `Temuan yang perlu ditindaklanjuti` (sub: "Peta risiko awal memakai lokasi/area pesantren, bukan peta geografis") + link `Buka peta bahaya →` + kartu temuan (chip severity + zona + lokasi + isu + tombol `Kelola tindak lanjut →`). Nama validator tampil pada kartu; nama pelapor tidak tampil (D-02).
5. Panel count antrean **dihapus** (D-02, 8 Sep 2026): jumlah laporan menunggu validasi tidak publik.

**Empty states:** nol pesantren → "Belum ada pesantren terdaftar. Pendaftaran dilakukan oleh Super Admin." + sembunyikan grafik + nonaktifkan CTA lapor (tooltip menjelaskan).

## 2. `/lapor` Laporan cepat

- Judul: kicker `Laporan publik` + H1 `Laporkan temuan bahaya` + deskripsi "Laporan Anda tidak langsung tampil; akun Pesantren memvalidasi dan menentukan tingkat bahaya terlebih dahulu."
- Field berurutan: Nama pelapor* → Pesantren* (dropdown terdaftar) → Lokasi/area* (dropdown mengikuti pesantren; bila kosong tampilkan pesan hubungi akun Pesantren) → Kategori K3 (opsional) → Aspek (opsional, terfilter kategori) → Usulan mandiri: Tingkat keparahan (opsional) + Prioritas perbaikan (opsional) → Judul temuan* → Deskripsi* (dengan hint "Tulis apa, di mana tepatnya, sejak kapan, siapa terdampak") → Foto (tombol unggah, label "Opsional · tersimpan sebagai nama file pada prototipe") → Kontak (opsional). Tanpa field Indikator terkait (D-19). Checkbox anonim dihapus (D-02); nama selalu tampil apa adanya secara internal.
- Tombol: **Kirim laporan** (`primary-button`, disabled sampai semua wajib valid) + **Batal** (kembali, dengan konfirmasi bila sudah mengetik).
- Error inline per field (contoh: "Nama minimal 2 karakter.", "Deskripsi minimal 20 karakter.", "Pilih pesantren terdaftar.").
- Layar sukses: ikon centang hijau + `Laporan terkirim` + nomor `RPT-XXXX` + chip `Menunggu validasi` (`status-neutral`) + teks "Belum tampil di dashboard sebelum divalidasi." + tombol **Kembali ke dashboard**.

## 3. `/penilaian-mandiri` Self-assessment (amendemen D-24)

- Header halaman: kicker `Penilaian mandiri` + H1 `Periksa kondisi K3L pesantren` +
  banner bank live ("Bank instrumen live · perubahan soal membuat draft harus mengulang") +
  seksi `Registrasi penilai`: pesantren* + nama penilai* + kontak (opsional).
  Satu penilai = satu laporan PDF.
- Tiap soal menampilkan hint kurangnya ("Kurang: jawaban/bukti/area-lokasi/catatan N/A")
  + status tersimpan ("Draft tersimpan otomatis · HH:MM"); autosave tanpa menunggu nama.
  Bukti berupa tombol upload + pratinjau hanya pada indikator `evidenceRequired` (D-27);
  foto tampil di PDF publik.
- Tiga kolom (desktop; menumpuk vertikal di ponsel): kiri navigasi dimensi (tombol per dimensi: nomor + nama + "x/y terisi" + centang bila penuh + kunci versi di bawah), tengah panel pertanyaan (kode + "Indikator n dari N" + chip `Wajib`/`Bukti wajib` + judul + prompt + lokasi observasi + opsi radio + catatan + bukti + sumber instrumen + tombol Sebelumnya/Berikutnya), kanan panel kelengkapan (4 statistik: jawaban/bukti/catatan N/A/lokasi + tombol `Lihat ringkasan` + catatan "Draft tersimpan di perangkat ini").
- Dialog Tinjau: daftar semua indikator (ikon lengkap/belum + kode + judul + jawaban) + klik melompat ke indikator + tombol **Kirim untuk validasi** (disabled bila ada yang kurang) + dialog konfirmasi final ("Setelah dikirim tidak dapat diubah…") → layar sukses seperti lapor.

## 4. `/pesantren/validasi-laporan` Antrean validasi (login Pesantren)

- Judul: kicker `Moderasi` + H1 `Validasi laporan` + deskripsi "Hanya laporan milik [nama pesantren]. Laporan yang diterima tampil di dashboard publik."
- Filter: status (`Menunggu validasi/Pending/Proses/Completed/Ditolak/Semua`) + kanal (`lapor-cepat/penilaian-mandiri`) + severity + pencarian teks.
- Kartu/baris antrean: nomor + chip kanal + pelapor (nama apa adanya, tanpa opsi anonim — D-02) + judul + lokasi + waktu + chip status validasi + chip handling + tombol **Periksa**. Pencarian mencakup deskripsi.
- Detail: seluruh isi laporan (hanya-baca: identitas, kontak internal, kategori/aspek, usulan pelapor, lokasi + teks denah, bukti gambar, waktu, jejak keputusan) + untuk penilaian mandiri: jawaban per indikator (hanya-baca) + panel keputusan: **Terima** (dua dropdown wajib `Tingkat keparahan`, `Prioritas perbaikan` placeholder `Pilih…` + pre-fill dari usulan sah + catatan opsional + tombol konfirmasi; ganti Terima/Tolak membersihkan error) dan **Tolak** (textarea alasan wajib min 10 + counter + konfirmasi). Arsip tidak tampil di antrean.
- Setelah terima: tidak ada kontrol status manual di halaman ini; status bergerak lewat `/pesantren/tindak-lanjut` (D-23.a). Arsip `Completed` via `/pesantren/laporan` (konfirmasi + alasan min 5).

## 5. `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut`, `/laporan/:id`

- Amendemen D-28 (gabung hasil): `/hasil` adalah satu-satunya halaman hasil
  publik — baris metrik (Indeks K3L · Temuan aktif · Terverifikasi) + dimensi
  hasil + daftar PDF penilaian (satu penilai = satu PDF; kartu per laporan:
  pesantren, periode, skor %, validator + tautan `Lihat PDF laporan`).
  Halaman `/laporan` publik dihapus (404); `/laporan/:id` = halaman cetak
  rekapan satu PDF (kop + skor % beku + dimensi + temuan diperkaya: lokasi
  lengkap, severity/priority, status/progres/PIC tindak lanjut + foto bukti
  per jawaban + metadata bank/checksum/validator/waktu + tombol
  `Cetak / simpan PDF`); hanya `Diterima`; tanpa nama pelapor/kontak/jawaban
  mentah (D-02, amendemen D-27 untuk foto bukti).

- Struktur dan copy mengikuti lama (hasil per dimensi/periode; Daftar Area default + Daftar Temuan; rekomendasi + PIC + tenggat; tindak lanjut + status; laporan pimpinan + metadata versi), dengan perubahan wajib : (a) tambah **filter pesantren** di tiap halaman, (b) sumber temuan menunjuk `reportId` + nama validator (nama validator publik sesuai D-02; nama pelapor dan bukti internal), (c) area tanpa temuan aktif tampil netral (bukan marker hijau), (d) tampilan Denah Bangunan dan bukti penyelesaian hanya di workspace Pesantren, tidak di halaman publik (D-02).
- Tombol kelola (buat rencana, ubah status, unggah bukti) hanya render bila login sebagai Pesantren pemilik scope; publik melihat mode baca + ajakan "Masuk sebagai Pesantren untuk mengelola." Input progres pada kartu kelola memakai slider titik `0/25/50/75/100` + label tahap (D-20).
- Kartu kelola Pesantren `/pesantren/tindak-lanjut` (D-21, D-23): panel baca relasi laporan induk (nomor + kanal + judul + deskripsi + kategori/aspek + usulan + severity/priority final + lokasi + bukti pelapor privat + validator/waktu + temuan tertaut) + tautan ke `/pesantren/validasi-laporan`; blok kelola (PIC/tenggat khusus `Belum ditindaklanjuti`, slider khusus `Berjalan`, upload bukti penyelesaian + pratinjau + lepas/ganti, catatan, verifikasi, Batalkan + dialog alasan min 10); editor tingkat risiko per temuan (`Rendah/Sedang/Tinggi/Ekstrem`, teraudit); hint bila `Dibatalkan` menghalangi `Completed`; form tersinkron ulang saat data berubah (`updatedAt`); filter status memuat `Dibatalkan`; empty state menjelaskan penyebab kosong (menunggu validasi / filter / arsip / beda scope).
- `/pesantren/lokasi`: input nama lantai per gedung (tidak berbagi); denah per lantai legacy hanya historis, jalur utama denah gambaran besar.
- `/pesantren/laporan`: progres = rata-rata non-`Dibatalkan`; tanggal memakai data terbaru (bukan `new Date()` saat render); tautan silang ke Validasi/Tindak lanjut; riwayat memuat versi instrumen per laporan.
- Halaman baca publik `/tindak-lanjut` (D-21): status `Dibatalkan` + alasan pembatalan tampil; bukti/tenggat/catatan internal tetap tidak tampil.
- Denah baca tampil sebagai pratinjau kecil dulu (tombol `Lihat denah besar` → penuh + `Tutup`) pada peta publik, detail laporan/temuan, dan pratinjau denah aktif Pesantren (D-22). Form penandaan titik (`LocationPicker`) tetap penuh agar presisi.

## 6. `/login`, `/admin/*`, `/validator/*`, `/pesantren/*`

- Login: panel kiri sama seperti lama (gradien biru identitas D-18 + alur), panel kanan hanya 3 kartu: `Masuk sebagai Super Admin` ("Mengelola pesantren, akun, audit."), `Masuk sebagai Validator` ("Mengelola instrumen dan penilaian."), `Masuk sebagai Pesantren` ("Memvalidasi laporan dan mengelola tindak lanjut."). Tanpa kartu asesor; tanpa link "Kembali ke beranda".
- Admin: halaman sama lama minus semua opsi Asesor; tambah aksi verifikasi pesantren `Persiapan → Aktif` dan alur buat akun Pesantren via popup (`Buat akun` → modal nama/email/sandi + konfirmasi/peran/pesantren → `Menunggu` → aktivasi) + ubah + reset sandi demo + hapus berkonfirmasi dengan proteksi akun sendiri/admin terakhir.
- Validator (D-24): `/validator/instrumen` = Bank live (tambah/edit/hapus dimensi +
  indikator, pilih tipe jawaban 4 opsi, tombol `Atur bobot` per indikator +
  pengali; tanpa kunci versi). Panel `Acuan bobot jawaban` di paling atas
  menampilkan opsi + bobot + flag temuan tiap indikator + tombol `Atur` per baris.
   Menu `Versioning` dihapus; route lama
   `/validator/versioning` menampilkan pengalihan ke Bank + Audit. `/validator/scoring` = audit
   skor % beku (filter pesantren terdaftar + validasi + cari, nama dimensi,
   link PDF, empty state, tabel desktop/kartu ponsel). `/validator/validasi-publikasi`
   berlabel `Audit publikasi` (D-25, route tetap) = checklist 5 kriteria
   (lengkap + Diterima + skor + PDF + checksum) + link silang Scoring/Dataset/PDF,
   tanpa tombol Terima/Tolak. `/validator/data-penelitian` = provenance penuh
   (validator Pesantren + waktu, versi/checksum, skor %, PDF) + filter terdaftar
   + toggle non-terdaftar audit + ekspor CSV/JSON whitelist + impor
   validasi→pratinjau→terapkan sebagai `Menunggu validasi`.

 Catatan D-25: label `Audit publikasi` menghilangkan tabrakan dengan
 `Validasi laporan` milik Pesantren. `Divalidasi oleh` = akun Pesantren,
 bukan peran Validator (`DATA_REQUIREMENTS.md` §9).

## 7. Responsif (wajib diperiksa)

- Desktop 1440×900, tablet 834×1112, ponsel 390×844: tidak ada overflow horizontal halaman; header publik memindahkan CTA ke baris kedua di ponsel; tiga kolom penilaian mandiri menumpuk (navigasi dimensi menjadi dropdown/accordion); tabel antrean menjadi kartu; grafik punya tinggi minimum 225px dan hanya render setelah panel terlihat.

## 8. Detail halaman yang perlu dilengkapi sebelum persetujuan

| Halaman/alur | Detail yang belum cukup dijelaskan |
|---|---|
| Dashboard/hasil | Definisi unit setiap kartu, sumber periode, beberapa hasil pada periode sama, versi berbeda, tidak ada hasil, seluruh jawaban N/A, dan tren yang belum bisa dibandingkan (D-04) |
| Peta risiko | Bidang publik vs internal mengikuti matriks D-02 (DATA_REQUIREMENTS §6): denah/titik tidak publik; tidak ada area vs area tanpa denah (D-11), versi denah historis, daftar temuan tanpa titik, dan filter yang tidak menemukan data |
| Rekomendasi/tindak lanjut | Hubungan banyak tindakan ke satu laporan (D-05), pemeriksa penyelesaian (D-06); PIC publik, bukti/catatan internal (D-02); status setelah dibuka kembali; batal per rekomendasi + alasan publik (D-21) |
| Laporan publik/Pesantren | Perbedaan isi mengikuti matriks D-02 (DATA_REQUIREMENTS §6), filter yang terbawa ke pratinjau, data sumber, pembuat/waktu, serta efek arsip pada laporan periode lama (D-07/D-08) |
| Form kirim | Salah kode pesantren tanpa penggantian otomatis, gagal simpan/kirim, kirim ganda, pindah pesantren, dan identitas akun yang berbeda dari nama pelapor |
| Draft penilaian | Cara melanjutkan/memulai baru, versi sudah diarsipkan, berganti akun/perangkat, serta bukti yang hanya menyimpan nama file (D-10) |
| Validasi | Keputusan sudah diambil akun Pesantren lain, kiriman sendiri, laporan tanpa temuan, hubungan laporan koreksi, dan riwayat keputusan (D-05–D-07) |
| Admin/login | Aktivasi akun, pemilihan akun Pesantren kedua tanpa mengganti peran setelah login, pesantren nonaktif, dan tujuan setelah login (D-08/D-09) |

Pola baca publik memakai aksi melihat detail/progres. Aksi kelola menuju workspace pemilik
dan hanya muncul jika kewenangannya sesuai. Kalimat ajakan masuk tidak menggantikan pemeriksaan hak akses.
Pesan alasan tombol nonaktif harus terbaca juga pada ponsel dan keyboard, bukan hanya tooltip saat hover.

## 9. Dokumen detail indikator — D-16

- `/dokumen` (navbar umum `Dokumen`): kicker `Pustaka` + H1 `Dokumen detail
  indikator` + deskripsi "Penjelasan PDF per indikator. Berkas Privat hanya
  tampil nama." + search (kode/judul/nama file) + filter Kategori + filter
  Status + tabel desktop/kartu ponsel (kolom: Indikator | Kategori/Aspek |
  Status | Aksi). `Public` = tombol `Lihat` + `Unduh`; `Privat` = teks
  `Terkunci` + gembok, tanpa tombol. State loading/empty/error mengikuti §0.
- Panel ringkas di `/` setelah rekap kategori, sebelum temuan prioritas:
  ringkasan jumlah Public/Privat + 5 baris teratas + link `Buka semua dokumen →`
  ke `/dokumen`. Filter pesantren tidak memfilter dokumen (tulis hint kecil).
- `/validator/dokumen-instrumen` (menu `Dokumen instrumen`, D-16.e): tombol
  `Tambah dokumen` (D-16.g) membuka modal (kode, judul, kategori, aspek opsional,
  pilih PDF, visibilitas default Privat) + tabel per indikator
  (Indikator | Status | Berkas + ukuran/tgl | Aksi: Unggah/Ganti, Lihat,
  Unduh, Jadikan Public/Privat, Hapus) + search/filter + konfirmasi ganti/hapus.
