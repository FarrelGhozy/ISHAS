# Spesifikasi Halaman (Wireframe Tertulis)

Semua token visual mengacu ke `DESIGN_SYSTEM.md`. Copy dan layout di bawah adalah
**rancangan untuk diskusi**, belum final. Perubahan besar tampilan menunggu D-12;
bidang publik mengikuti D-02 (ringkasan saja + nama validator/PIC — matriks di
`DATA_REQUIREMENTS.md` §6) dan hak kirim mengikuti D-03 (publik + pengelola).

## 0. Pola umum semua halaman publik

- Header publik: logo ISHAS + teks `ISHAS` + subteks `Penilaian K3L Pesantren` | kanan: penanda `Data publik · ilustrasi` (`status-blue`) + tombol **Masuk** (`secondary-button`; bila sudah login menjadi tombol **Ruang kerja** + nama akun).
- Di bawah header pada `/`: bar konteks berisi **Pemilih pesantren** (dropdown, opsi pertama `Semua pesantren terdaftar`) + info periode + tombol **Laporkan temuan** (`primary-button`, ikon plus) + tombol **Penilaian mandiri** (`secondary-button`, ikon clipboard).
- Setiap angka indeks/skor selalu disertai: kategori + periode + versi instrumen + status data. Tidak ada angka telanjang.
- State halaman: `loading` ("Menyiapkan halaman…"), `empty` (pesan + aksi), `error` (pesan + tombol muat ulang). Tabel lebar di ponsel boleh scroll horizontal; halaman tidak boleh overflow.

## 1. `/` Dashboard publik

**Region (atas → bawah):**

1. Bar konteks (lihat §0) + banner scope: ikon gedung + `Pesantren aktif: [Semua terdaftar | nama]` + `Periode hasil: [periode]` + chip `Data ilustrasi` (`status-blue`).
2. Kartu statistik (4, `stats-grid`): Indeks K3L (nilai + "Naik/turun X dari periode lalu" + ikon perisai), Risiko tinggi (`stat-red`, "Perlu tindakan segera"), Tindak lanjut (`stat-amber`, rata-rata progres + "N pekerjaan"), Terverifikasi (`stat-blue`, count + "Oleh pengelola pondok").
3. Panel grafik: `Perkembangan indeks` (sub: "Perbandingan enam periode terakhir") + tren `+X periode ini` (`trend-up` hijau) + grafik area marun; panel samping `Hasil per dimensi` (bar per dimensi + "Area nilai terendah diprioritaskan").
4. Panel `Temuan yang perlu ditindaklanjuti` (sub: "Peta risiko awal memakai lokasi/area pesantren, bukan peta geografis") + link `Buka peta bahaya →` + kartu temuan (chip severity + zona + lokasi + isu + tombol `Kelola tindak lanjut →`). Nama validator tampil pada kartu; nama pelapor tidak tampil (D-02).
5. Panel count antrean **dihapus** (D-02, 8 Sep 2026): jumlah laporan menunggu validasi tidak publik.

**Empty states:** nol pesantren → "Belum ada pesantren terdaftar. Pendaftaran dilakukan oleh Super Admin." + sembunyikan grafik + nonaktifkan CTA lapor (tooltip menjelaskan).

## 2. `/lapor` Laporan cepat

- Judul: kicker `Laporan publik` + H1 `Laporkan temuan bahaya` + deskripsi "Laporan Anda tidak langsung tampil; pengelola pondok memvalidasi dan menentukan tingkat bahaya terlebih dahulu."
- Field berurutan: Nama pelapor* → Pesantren* (dropdown terdaftar) → Lokasi/area* (dropdown mengikuti pesantren; bila kosong tampilkan pesan hubungi pengelola) → Judul temuan* → Deskripsi* (dengan hint "Tulis apa, di mana tepatnya, sejak kapan, siapa terdampak") → Foto (tombol unggah, label "Opsional · tersimpan sebagai nama file pada prototipe") → Kontak (opsional). Checkbox anonim dihapus (D-02); nama selalu tampil apa adanya secara internal.
- Tombol: **Kirim laporan** (`primary-button`, disabled sampai semua wajib valid) + **Batal** (kembali, dengan konfirmasi bila sudah mengetik).
- Error inline per field (contoh: "Nama minimal 2 karakter.", "Deskripsi minimal 20 karakter.", "Pilih pesantren terdaftar.").
- Layar sukses: ikon centang hijau + `Laporan terkirim` + nomor `RPT-XXXX` + chip `Menunggu validasi` (`status-neutral`) + teks "Belum tampil di dashboard sebelum divalidasi." + tombol **Kembali ke dashboard**.

## 3. `/penilaian-mandiri` Self-assessment

- Header halaman: kicker `Penilaian mandiri` + H1 `Penilaian mandiri K3L` + banner kunci versi: "Menggunakan [ISHAS vX.Y] · terkunci selama pengisian" + pemilih pesantren* + nama pelapor* (aturan sama seperti lapor).
- Tiga kolom (desktop; menumpuk vertikal di ponsel): kiri navigasi dimensi (tombol per dimensi: nomor + nama + "x/y terisi" + centang bila penuh + kunci versi di bawah), tengah panel pertanyaan (kode + "Indikator n dari N" + chip `Wajib`/`Bukti wajib` + judul + prompt + lokasi observasi + opsi radio + catatan + bukti + sumber instrumen + tombol Sebelumnya/Berikutnya), kanan panel kelengkapan (4 statistik: jawaban/bukti/catatan N/A/lokasi + tombol `Lihat ringkasan` + catatan "Draft tersimpan di perangkat ini").
- Dialog Tinjau: daftar semua indikator (ikon lengkap/belum + kode + judul + jawaban) + klik melompat ke indikator + tombol **Kirim untuk validasi** (disabled bila ada yang kurang) + dialog konfirmasi final ("Setelah dikirim tidak dapat diubah…") → layar sukses seperti lapor.

## 4. `/pengelola/validasi-laporan` Antrean validasi (login pengelola)

- Judul: kicker `Moderasi` + H1 `Validasi laporan` + deskripsi "Hanya laporan milik [nama pesantren]. Laporan yang diterima tampil di dashboard publik."
- Filter: status (`Menunggu validasi/Pending/Proses/Completed/Ditolak/Semua`) + kanal (`lapor-cepat/penilaian-mandiri`) + severity + pencarian teks.
- Kartu/baris antrean: nomor + kanal + pelapor (nama apa adanya, tanpa opsi anonim — D-02) + judul + lokasi + waktu + chip status + tombol **Periksa**.
- Detail: seluruh isi laporan (hanya-baca) + untuk penilaian mandiri: jawaban per indikator (hanya-baca) + panel keputusan: **Terima** (dua dropdown wajib `Tingkat keparahan`, `Prioritas perbaikan` + catatan opsional + tombol konfirmasi) dan **Tolak** (textarea alasan wajib min 10 + konfirmasi).
- Setelah terima: kontrol status `Pending → Proses → Completed` + tombol hapus (hanya saat `Completed`, konfirmasi + alasan).

## 5. `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut`, `/laporan`

- Struktur dan copy mengikuti lama (hasil per dimensi/periode; Daftar Area default + Daftar Temuan; rekomendasi + PIC + tenggat; tindak lanjut + status; laporan pimpinan + metadata versi), dengan perubahan wajib : (a) tambah **filter pesantren** di tiap halaman, (b) sumber temuan menunjuk `reportId` + nama validator (nama validator publik sesuai D-02; nama pelapor dan bukti internal), (c) area tanpa temuan aktif tampil netral (bukan marker hijau), (d) tampilan Denah Bangunan dan bukti penyelesaian hanya di workspace pengelola, tidak di halaman publik (D-02).
- Tombol kelola (buat rencana, ubah status, unggah bukti) hanya render bila login sebagai pengelola pemilik scope; publik melihat mode baca + ajakan "Masuk sebagai pengelola untuk mengelola."

## 6. `/login`, `/admin/*`, `/peneliti/*`

- Login: panel kiri sama seperti lama (gradien marun + alur), panel kanan hanya 3 kartu: `Masuk sebagai Super Admin` ("Mengelola pesantren, akun, audit."), `Masuk sebagai Peneliti` ("Mengelola instrumen dan penilaian."), `Masuk sebagai Pengelola Pesantren` ("Memvalidasi laporan dan mengelola tindak lanjut."). Tanpa kartu asesor; tanpa link "Kembali ke beranda".
- Admin: halaman sama lama minus semua opsi Asesor; tambah aksi verifikasi pesantren `Persiapan → Aktif` dan alur buat akun pengelola.
- Peneliti: tidak berubah dari lama.

Catatan review: tujuan Peneliti dipertahankan, tetapi kontrak dataset/hasil harus menyesuaikan
 (`DATA_REQUIREMENTS.md` §9). Layar lama belum otomatis menjadi spesifikasi lengkap .

## 7. Responsif (wajib diperiksa)

- Desktop 1440×900, tablet 834×1112, ponsel 390×844: tidak ada overflow horizontal halaman; header publik memindahkan CTA ke baris kedua di ponsel; tiga kolom penilaian mandiri menumpuk (navigasi dimensi menjadi dropdown/accordion); tabel antrean menjadi kartu; grafik punya tinggi minimum 225px dan hanya render setelah panel terlihat.

## 8. Detail halaman yang perlu dilengkapi sebelum persetujuan

| Halaman/alur | Detail yang belum cukup dijelaskan |
|---|---|
| Dashboard/hasil | Definisi unit setiap kartu, sumber periode, beberapa hasil pada periode sama, versi berbeda, tidak ada hasil, seluruh jawaban N/A, dan tren yang belum bisa dibandingkan (D-04) |
| Peta risiko | Bidang publik vs internal mengikuti matriks D-02 (DATA_REQUIREMENTS §6): denah/titik tidak publik; tidak ada area vs area tanpa denah (D-11), versi denah historis, daftar temuan tanpa titik, dan filter yang tidak menemukan data |
| Rekomendasi/tindak lanjut | Hubungan banyak tindakan ke satu laporan (D-05), pemeriksa penyelesaian (D-06); PIC publik, bukti/catatan internal (D-02); status setelah dibuka kembali |
| Laporan publik/pengelola | Perbedaan isi mengikuti matriks D-02 (DATA_REQUIREMENTS §6), filter yang terbawa ke pratinjau, data sumber, pembuat/waktu, serta efek arsip pada laporan periode lama (D-07/D-08) |
| Form kirim | Salah kode pesantren tanpa penggantian otomatis, gagal simpan/kirim, kirim ganda, pindah pesantren, dan identitas akun yang berbeda dari nama pelapor |
| Draft penilaian | Cara melanjutkan/memulai baru, versi sudah diarsipkan, berganti akun/perangkat, serta bukti yang hanya menyimpan nama file (D-10) |
| Validasi | Keputusan sudah diambil pengelola lain, kiriman sendiri, laporan tanpa temuan, hubungan laporan koreksi, dan riwayat keputusan (D-05–D-07) |
| Admin/login | Aktivasi akun, pemilihan akun pengelola kedua tanpa mengganti peran setelah login, pesantren nonaktif, dan tujuan setelah login (D-08/D-09) |

Pola baca publik memakai aksi melihat detail/progres. Aksi kelola menuju workspace pemilik
dan hanya muncul jika kewenangannya sesuai. Kalimat ajakan masuk tidak menggantikan pemeriksaan hak akses.
Pesan alasan tombol nonaktif harus terbaca juga pada ponsel dan keyboard, bukan hanya tooltip saat hover.
