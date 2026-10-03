# Panduan Pengguna ISHAS

> **Untuk siapa:** pengguna aplikasi — publik/pelapor, akun Pesantren, Validator,
> dan Super Admin. Ditulis dengan bahasa sehari-hari.
> **Status:** prototipe. Semua angka, skor, kategori, dan isi penilaian adalah
> **data contoh** (bukan hasil penelitian/rumus final). Sebagian data hilang saat
> halaman di-refresh sesuai batas prototipe.
> **Dokumen teknis terkait:** `ROLES.md`, `ROUTES.md`, `FLOWS.md`; istilah baku di
> `README.md`.

## 0. Memulai

- Alamat aplikasi: `/` (beranda) langsung menampilkan **dashboard publik** — tidak
  ada halaman perkenalan.
- **Mode ngoding (dev):** halaman `/login` menampilkan **3 kartu akun contoh** —
  cukup satu klik, tanpa kata sandi.
- **Mode rilis (prod):** halaman `/login` memakai **email + kata sandi**.
- Akun contoh (mode dev): Super Admin `admin@ishas.demo`, Validator
  `validator@ishas.demo`, Pesantren `pesantren@ishas.demo`.
- Ingin berpindah peran? **Keluar** dulu, lalu masuk dengan akun lain. Tidak ada
  pemilih peran di dalam aplikasi.

## 1. Publik / Pelapor (tanpa login)

Siapa pun boleh membuka beranda dan halaman baca. Tidak perlu akun.

### 1.1 Membaca dashboard publik (`/`)

- Dashboard menampilkan ringkasan **semua pesantren terdaftar** (Aktif dan
  memiliki akun Pesantren aktif).
- Gunakan **pemilih pesantren** untuk memfilter seluruh angka/grafik ke satu
  pesantren. Pilihan ini juga tersimpan pada alamat (`?pesantren=PSN-0018`).
- Ada **pratinjau periode**; angka utama masih memakai periode berjalan (filter
  periode penuh menunggu keputusan D-04).
- Hanya laporan berstatus **Diterima/Terbit** yang tampil. Laporan
  `Menunggu validasi` dan `Ditolak` **tidak pernah** muncul di beranda.

### 1.2 Mengirim laporan cepat (`/lapor`)

1. Buka `/` atau `/lapor`, pilih pesantren pada pemilih.
2. Isi satu formulir ringkas: nama pelapor, pesantren, area/lokasi, judul,
   deskripsi; kategori/aspek, usulan tingkat keparahan/prioritas/rekomendasi,
   foto bukti, dan kontak bersifat **opsional**.
3. Tekan **Kirim laporan**. Anda menerima **nomor laporan** (`RPT-XXXX`) dan
   status `Menunggu validasi` — laporan belum tampil publik sampai akun
   Pesantren menerimanya.
4. Draf isian tersimpan di perangkat; jika keluar aplikasi, isian dapat lanjut.

Catatan: laporan **tidak bisa** dikirim saat login sebagai Super Admin/Validator
— keluar dulu untuk melapor sebagai publik. Akun Pesantren boleh melapor
(termasuk ke pesantren lain sebagai pelapor umum).

### 1.3 Mengisi penilaian mandiri (`/penilaian-mandiri`)

1. Daftarkan **nama penilai** dan pilih pesantren (kontak opsional).
2. Jawab semua butir penilaian (6 bidang, 59 butir). Beberapa butir mewajibkan
   **bukti foto** dan/atau **lokasi**.
3. **Draf** otomatis tersimpan; Anda bisa menutup halaman lalu melanjutkan.
4. Setelah lengkap, tekan **Kirim penilaian**. Hasil **langsung terbit** tanpa
   validasi Pesantren dan skor/PDF langsung tampil publik. Kiriman yang sudah
   dikirim tidak dapat diubah.

### 1.4 Halaman baca publik

| Halaman | Isi |
|---|---|
| `/hasil` | Ringkasan nilai, nilai per bidang, dan daftar laporan PDF |
| `/peta-risiko` | Denah pesantren + titik temuan yang sudah sah, dengan filter |
| `/rekomendasi` | Daftar saran perbaikan: prioritas, penanggung jawab, kemajuan (tenggat tidak ditampilkan publik) |
| `/tindak-lanjut` | Kemajuan perbaikan, status, nama penanggung jawab (bukti penyelesaian tidak publik) |
| `/dokumen` | Kumpulan PDF tiap butir: yang **Umum** bisa dilihat/diunduh; yang **Privat** terkunci |
| `/laporan/:id` | Laporan penilaian siap cetak: judul, nilai tetap, foto bukti, tombol cetak/simpan PDF (tanpa temuan) |
| `/pesantren/PSN-XXXX` | Profil singkat satu pesantren (beranda terkunci ke pesantren itu) |

Catatan privasi: nama pelapor, kontak, dan jawaban mentah tidak ditampilkan
publik. Kode pesantren yang tidak dikenal menampilkan pesan "tidak ditemukan",
bukan error.

## 2. Pesantren (login)

Akun admin lokal satu pondok. Setelah login, identitas akun tampil di kanan atas.

### 2.1 Beranda (`/pesantren/dashboard`)

Ringkasan khusus pesantren Anda: jumlah antrean, status penanganan, dan kemajuan
tindak lanjut, beserta nama dan kode pesantren.

### 2.2 Memeriksa laporan (`/pesantren/validasi-laporan`)

1. Buka antrean laporan **lapor-cepat** milik pesantren Anda (penilaian mandiri
   tidak masuk antrean — langsung terbit).
2. Pilih laporan `Menunggu validasi`, lalu:
   - **Terima** — wajib menetapkan **Tingkat bahaya (severity)** dan
     **Prioritas (priority)** tanpa nilai bawaan, serta menulis rekomendasi
     final. Setelah diterima, laporan tampil di beranda publik dan
     `/tindak-lanjut`.
   - **Tolak** — wajib menulis **alasan minimal 10 karakter**. Laporan ditolak
     tidak tampil publik.
3. Anda **tidak boleh** mengubah isi laporan pelapor (deskripsi/jawaban/bukti);
   yang boleh diisi hanya keputusan, catatan validasi, atau alasan tolak.

### 2.3 Mengelola status penanganan (`/pesantren/tindak-lanjut`)

- Alur status: `Pending → Proses → Completed` (dan bisa dikembalikan dengan
  alasan). Laporan `Completed` dapat **diarsipkan** dengan alasan.
- Buat rencana tindakan: **PIC**, **tenggat**, dan catatan → status menjadi
  `Proses`.
- Perbarui **progres** (pilihan 0/25/50/75/100), unggah **bukti penyelesaian**,
  lalu ajukan verifikasi.
- Bisa **membatalkan perbaikan** dengan alasan minimal 10 karakter.

### 2.4 Lokasi & denah (`/pesantren/lokasi`)

Kelola gedung, area, dan **denah** (campus plan): unggah gambar lalu terbitkan.
Denah aktif dipakai untuk titik pelaporan dan peta risiko publik.

### 2.5 Laporan & hasil penilaian mandiri

- `/pesantren/laporan` — daftar laporan cepat milik pesantren Anda.
- `/pesantren/hasil-penilaian-mandiri` — daftar + rincian hasil penilaian mandiri
  milik pesantren Anda (hanya status `Terbit`).

## 3. Validator (login)

Mengelola instrumen/penilaian. Tidak memvalidasi laporan (itu tugas akun
Pesantren).

- `/validator/dashboard` — ringkasan.
- `/validator/instrumen` — **Bank instrumen**: tambah/ubah butir, tipe jawaban,
  pilihan + bobot, dan pengali. Perubahan langsung dipakai penilaian mandiri.
- `/validator/dokumen-instrumen` — pustaka PDF per butir (Umum/Privat).
- `/validator/scoring` — meninjau nilai akhir yang tersimpan; tautan ke laporan PDF.
- `/validator/validasi-publikasi` — daftar periksa **5 syarat** sebelum hasil
  tampil ke umum.
- `/validator/data-penelitian` — data penelitian, unduh CSV/JSON, dan impor
  bertahap (periksa → pratinjau → terapkan).
- `/validator/sam-isafe` (dan sub-halamannya) — modul **SAM-iSAFE**:
  - riwayat pengamatan + bank pertanyaan,
  - formulir pengamatan baru (jawaban 0/1/2),
  - rincian skor per kategori, grafik perkembangan, riwayat perubahan, dan
    tindak lanjut temuan.

Catatan: pengisian SAM-iSAFE dapat dilanjutkan setelah halaman di-refresh;
tombol **Hapus draft** mengosongkan isian yang berjalan.

## 4. Super Admin (login)

Operator sistem pusat. Satu-satunya peran yang membuat pesantren dan akun.

- `/admin/dashboard` — ringkasan sistem.
- `/admin/pesantren` — direktori pesantren: tambah, ubah status
  `Persiapan → Aktif → Nonaktif`. Hanya pesantren `Aktif` yang punya akun
  Pesantren aktif yang muncul di pemilih publik.
- `/admin/pengguna` — kelola akun: buat (nama, email, sandi, peran, scope),
  ubah data, **reset sandi**, aktif/nonaktif, dan hapus (dengan konfirmasi).
- `/admin/hak-akses` — tabel hak akses tiap peran (hanya baca).
- `/admin/audit-log` — catatan aktivitas seluruh sistem (hanya baca).
- `/admin/pengaturan` — **Reset data demo** dan pemindahan aset dari perangkat.

## 5. Akun & sesi

- **Akun aktif** selalu tampil di kanan atas (nama + peran + inisial).
- **Ganti kata sandi** (mode rilis): klik nama akun di kanan atas → *Ganti kata
  sandi* → isi sandi lama + sandi baru (minimal 8 karakter) + konfirmasi. Setelah
  berhasil, sesi di perangkat lain keluar; perangkat ini tetap aktif.
- **Keluar**: klik nama akun → *Keluar dari akun*. Anda diarahkan ke beranda
  publik (`/`).
- Refresh tidak mengeluarkan Anda dari sesi dan tidak menghapus draf isian.

## 6. Warna & label status

Status selalu dibedakan dengan **label teks + ikon**, bukan warna saja:

- `Menunggu validasi` — netral (jam).
- `Pending` — kuning (jam).
- `Proses` — biru (sedang berjalan).
- `Completed` / `Terverifikasi` — hijau (centang).
- `Ditolak` — netral (silang; hanya terlihat di antrean Pesantren).
- `Dibatalkan` — netral (silang; tampil publik beserta alasannya).
- Tingkat bahaya/prioritas: `Tinggi` (merah), `Sedang` (kuning), `Rendah`
  (hijau), `Belum ditentukan` (netral).

## 7. Batasan prototipe

- Semua angka/skor/kategori adalah **ilustrasi**, bukan rumus ilmiah final.
- Beberapa data (mis. foto bukti) hanya tersedia di perangkat pengunggah; setelah
  berpindah perangkat, foto bisa tidak tampil.
- Biaya, domain, dan hosting pada nota terpisah tidak memengaruhi cara pakai
  aplikasi ini.
