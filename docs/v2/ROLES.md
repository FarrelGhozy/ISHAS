# V2 — Peran dan Hak Akses (Definisi Rinci)

> Status: rancangan untuk diskusi. D-02 (data publik), D-03 (hak kirim), D-06 (pemeriksa),
> dan D-09 (akun) di `DECISIONS.md` belum diputuskan. Matriks berikut menyimpan arah awal;
> jangan menerapkan bagian yang berkonflik sebelum dijawab. Tidak ada akses kelola implisit.

## 1. Publik / Pelapor (tanpa login — bukan role login)

**Definisi:** siapa pun yang membuka aplikasi tanpa sesi: santri, ustaz, wali santri, tamu, warga sekitar. Tidak memiliki akun, tidak memiliki scope.

**BOLEH (tanpa login):**

- Membuka `/`, `/lapor`, `/penilaian-mandiri`, `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut` (mode baca), `/laporan`, `/pesantren/[kode]`.
- Menggunakan pemilih pesantren (hanya berisi pesantren terdaftar) dan filter periode/tingkat/status pada tampilan publik.
- Mengirim laporan cepat: wajib isi **nama pelapor** (teks bebas, maks 100 karakter), pesantren (pilih dari daftar), lokasi/area, deskripsi. Foto dan kontak opsional.
- Mengisi penilaian mandiri: wajib isi nama + pesantren, lalu seluruh indikator wajib instrumen Published aktif.
- Menyimpan draft penilaian mandiri di perangkat sendiri (localStorage) dan melanjutkannya setelah refresh.
- Melihat nomor laporan + status `Menunggu validasi` sebagai konfirmasi kirim.

**TIDAK BOLEH:**

- Melihat antrean validasi, detail laporan yang belum divalidasi milik orang lain, atau alasan penolakan milik orang lain.
- Mengubah severity, priority, atau status penanganan.
- Mengelola gedung/area/denah, membuat rencana tindak lanjut (PIC/tenggat), menghapus data, membuka `/admin/*`, `/peneliti/*`, halaman kelola `/pengelola/validasi-laporan`.
- Melihat dashboard sebagai "milik pesantren saya" — dashboard publik selalu agregat + filter, tidak ada konsep kepemilikan tanpa login.

**Edge case yang ditetapkan:**

- Publik tidak perlu mendaftar dan tidak ada proses registrasi mandiri pesantren. Pesantren baru hanya lahir dari Super Admin (lihat FLOWS §1).
- Jika pemilih pesantren kosong (belum ada pesantren terdaftar), dashboard menampilkan empty state "Belum ada pesantren terdaftar" dan form lapor dinonaktifkan dengan penjelasan — bukan form dengan dropdown kosong.

## 2. Pengelola Pesantren — mitra (login, `roleId: pengelola`)

**Definisi:** admin lokal satu pondok, dibuatkan akun oleh Super Admin dengan `institutionCodes: [<satu kode>]`. Satu akun mengelola tepat satu pesantren (multi-lembaga per akun tidak didukung di V2).

**Akun demo persis:**

| Field | Nilai |
|---|---|
| Nama | Ust. K.H. Mustofa Kamal |
| Email | `pengelola@ishas.demo` |
| Kata sandi | `demo1234` |
| Label peran | Pengelola Pesantren |
| Scope | `PSN-0018` (PP Al-Hikmah Malang) |

**Kemampuan dalam rancangan awal:**

- Membaca data publik seperti pengunjung lain. Hak melapor di luar pesantren yang dikelola masih menunggu D-03. Saat melapor sebagai pengelola, field nama **terisi otomatis** dari akun aktif + label `Pengelola Pesantren`; tetap dapat diubah manual per laporan.
- Membuka antrean **Validasi Laporan** (hanya laporan dengan `institutionCode` miliknya).
- **Menerima** laporan: wajib mengisi `severity` + `priority` (tidak ada nilai default; harus pilih eksplisit) → status menjadi `Pending` → laporan tampil di dashboard.
- **Menolak** laporan: wajib mengisi alasan (min 10 karakter) → status `Ditolak` → arsip, tidak tampil.
- Mengubah status penanganan `Pending → Proses → Completed` (tidak boleh mundur tanpa catatan audit; aturan mundur lihat FLOWS §5).
- **Menghapus** laporan berstatus `Completed` saja, dengan dialog konfirmasi + alasan; penghapusan menambah audit event (data audit tidak ikut terhapus).
- Mengelola gedung/lantai/area/denah, membuat rencana tindak lanjut (PIC + tenggat + catatan), memperbarui progres, mengunggah bukti penyelesaian dummy, membaca laporan pimpinan.

**TIDAK BOLEH:**

- Melihat antrean/detail internal atau memvalidasi laporan pesantren lain. Data yang memang ditetapkan publik mengikuti akses baca publik; cakupan bidangnya menunggu D-02.
- Mendaftarkan pesantren baru, membuat akun (termasuk akun pengelola lain), mengubah hak akses, membuka audit log global, pengaturan sistem, atau area peneliti.
- Menentukan rumus/skor/ambang ilmiah; skor tetap dihitung sistem (ilustratif).

## 3. Super Admin (login, `roleId: admin`)

**Definisi:** operator sistem pusat. Satu-satunya peran yang dapat melahirkan pesantren dan akun pengelola.

**Akun demo persis:**

| Field | Nilai |
|---|---|
| Nama | Nadia Permata |
| Email | `admin@ishas.demo` |
| Kata sandi | `demo1234` |
| Scope | Seluruh sistem |

**BOLEH:**

- Pesantren: tambah (status awal `Persiapan`), verifikasi menjadi `Aktif`, nonaktifkan menjadi `Nonaktif`. Hanya `Aktif` + punya pengelola aktif yang tampil di pemilih publik.
- Pengguna: buat akun `Pengelola Pesantren` (wajib pilih tepat satu pesantren), nonaktifkan akun, lihat detail. Tidak ada pembuatan akun Asesor (peran dihapus).
- Membaca dashboard publik (mode baca, tidak memvalidasi), matriks hak akses (baca), audit log global (baca), pengaturan non-ilmiah + reset data demo.

**TIDAK BOLEH:**

- Memvalidasi/menolak laporan, mengisi severity/priority/status, mengisi penilaian, mengelola lokasi/tindak lanjut pesantren tertentu.
- Menyentuh instrumen, scoring, atau publikasi ilmiah.

## 4. Peneliti (login, `roleId: peneliti`)

**Definisi dan akun demo tidak berubah dari V1** (Dr. M. Ridwan, `peneliti@ishas.demo`, `demo1234`).

**BOLEH:** instrumen (builder dimensi/indikator), versioning Draft/Published/Archived, konfigurasi scoring, validasi & publikasi, data penelitian. Versi Published aktif otomatis menjadi sumber soal penilaian mandiri.

**TIDAK BOLEH:** melihat antrean validasi, memvalidasi laporan, mengelola pesantren/akun, mengisi laporan sebagai peneliti (jika ingin melapor, gunakan mode publik tanpa login).

## 5. Dihapus: Asesor

Daftar hapus eksplisit (agar tidak ada sisa tafsir "asesor masih ada di balik layar"):

- Akun `asesor@ishas.demo` / Ahmad Fauzan, kartu login asesor, filter peran Asesor.
- Seluruh route `/asesor/*`, menu, guard cabang asesor, notifikasi ke asesor.
- Entitas penugasan (`Assignment`, `assessorEmail`, status Terjadwal/Draft/Final versi asesor).
- Istilah "penugasan", "verifikasi 4 data penugasan", "Assessment Saya".
- Atribusi karya ke asesor ("dibuat/diverifikasi Asesor") diganti "dilaporkan oleh [nama]" / "divalidasi oleh [nama pengelola]".

## 6. Matriks akses rancangan awal — bagian konflik menunggu D-03

| Kemampuan | Publik | Pengelola | Super Admin | Peneliti |
|---|---|---|---|---|
| Dashboard agregat + filter pesantren | ✅ | ✅ | ✅ baca | ✅ baca |
| Lapor cepat + penilaian mandiri | ✅ | ✅ | ❌ | ❌ |
| Antrean validasi + terima/tolak | ❌ | ✅ miliknya | ❌ | ❌ |
| Isi severity/priority | ❌ | ✅ miliknya | ❌ | ❌ |
| Status Pending/Proses/Completed + hapus Completed | ❌ | ✅ miliknya | ❌ | ❌ |
| Gedung/area/denah + tindak lanjut kelola | ❌ | ✅ miliknya | ❌ | ❌ |
| Daftar pesantren + buat/verifikasi/nonaktif | ❌ | ❌ | ✅ | ❌ |
| Buat/nonaktifkan akun pengelola | ❌ | ❌ | ✅ | ❌ |
| Audit log + pengaturan + reset demo | ❌ | ❌ | ✅ | ❌ |
| Instrumen/scoring/publikasi/data penelitian | ❌ | ❌ | ❌ | ✅ |

## 7. Aturan sesi (berlaku semua)

1. Pergantian peran = keluar lalu masuk sebagai akun lain. Tidak ada pemilih peran di dalam aplikasi.
2. Akun aktif tampil di kanan atas seluruh halaman setelah login (nama + label peran + inisial).
3. Pada halaman publik: tanpa sesi tampil **Masuk**; dengan sesi tampil identitas akun aktif (nama + label peran + inisial) dan tombol **Ruang kerja**. Penanda `Data publik · ilustrasi` tetap ada. Ini identitas pengguna yang sedang memakai perangkat, bukan publikasi identitas pelapor pada suatu laporan.
4. Refresh tidak boleh mengeluarkan sesi login (sessionStorage) dan tidak boleh menghapus draft laporan (localStorage) — keduanya dipulihkan diam-diam.
5. Logout membersihkan sesi dan mengarah ke `/` (dashboard publik), bukan ke halaman kosong.
6. Sesi perlu membedakan ID akun, bukan role saja, agar dua pengelola memiliki scope yang benar. Cara login akun tambahan dan aktivasi menunggu D-09; draft saat berganti akun menunggu D-10.
