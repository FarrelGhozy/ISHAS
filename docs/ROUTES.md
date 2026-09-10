# Peta Route dan Guard (Definisi Rinci)

Aplikasi terpisah bernama **ISHAS** (D-01, dijawab 8 September 2026): frontend React Router,
file dipecah per folder fitur, dijalankan dengan bun 1.4. URL adalah sumber kebenaran halaman aktif.
Tabel di bawah adalah peta route aplikasi. Isi publik mengikuti D-02 (ringkasan saja +
nama validator/PIC); hak kirim mengikuti D-03 (publik + pengelola).

## 1. Calon route publik — akses baca dan hak mengirim dibedakan

| URL | Nama halaman | Isi ringkas | Catatan |
|---|---|---|---|
| `/` | Dashboard publik | Agregat semua pesantren terdaftar + pemilih pesantren + tren + prioritas + CTA lapor/nilai | Pengganti landing; tanpa guard login |
| `/lapor` | Laporan cepat | Form ringan satu langkah | Bisa juga dibuka sebagai dialog dari `/`, tapi URL kanonis tetap `/lapor` |
| `/penilaian-mandiri` | Penilaian mandiri | Instrumen Published penuh + draft lokal + kirim validasi | Satu-satunya tempat isi indikator |
| `/hasil` | Hasil assessment | Per dimensi + antarperiode, mengikuti filter pesantren | Hanya data `Diterima` |
| `/peta-risiko` | Peta bahaya & risiko | Daftar Area (default) + Daftar Temuan; tampilan Denah Bangunan khusus pengelola (denah rinci tidak publik, D-02) | Filter: pesantren, gedung, lantai, severity, status |
| `/rekomendasi` | Rekomendasi | Prioritas + PIC + tenggat + progres | Sumber menunjuk `reportId` |
| `/tindak-lanjut` | Tindak lanjut (baca) | Progres + status + nama PIC; bukti penyelesaian tidak publik (D-02) | Tombol kelola hanya muncul bila login pengelola pemilik scope |
| `/laporan` | Laporan pimpinan | Ringkasan + dimensi + status + metadata versi instrumen | Simulasi unduh PDF/Excel (label dummy) |
| `/pesantren/[kode]` | Profil ringkas lembaga | Sama seperti `/` dengan filter terkunci ke `[kode]` | `[kode]` = `institutionCode` mis. `PSN-0018`; kode tak dikenal → empty state, bukan crash |
| `/login` | Masuk | 3 kartu akun: Super Admin, Peneliti, Pengelola Pesantren | Tanpa kartu asesor; tanpa link "kembali ke beranda" (beranda = `/` itu sendiri) |
| `/akses-ditolak` | Akses ditolak | Pesan + tombol kembali kontekstual | Lihat §3 |

**Query param yang didukung di route publik:**

- `?pesantren=PSN-0018` — preset filter pesantren (setara membuka `/pesantren/PSN-0018`).
- `?periode=Semester 1 2026` — preset periode hasil.
- Pada halaman baca agregat, param filter tidak valid memakai konteks default dan menampilkan konteks yang benar-benar dipakai. `/pesantren/[kode]` tetap memakai aturan kode tak dikenal pada §3.
- Pada `/lapor` dan `/penilaian-mandiri`, kode pesantren tak dikenal/nonaktif tidak boleh diganti otomatis ke pesantren lain: tampilkan `Pesantren tidak tersedia untuk pelaporan.` dan minta pilihan terdaftar yang eksplisit sebelum kirim. Jika param tidak diberikan, pengguna tetap harus memilih pesantren.
- Mengganti pesantren mengharuskan pemeriksaan ulang area/gedung/titik terkait; ID lokasi dari pesantren sebelumnya tidak boleh ikut terkirim.

**Perilaku `/` yang ditetapkan (anti-ambiguitas):**

- `/` MERENDER dashboard publik secara langsung (bukan redirect ke `/pengelola/dashboard`). Tidak ada kedipan landing, tidak ada redirect berantai.
- Sesi login yang aktif TIDAK mengubah isi `/` — admin/peneliti/pengelola yang membuka `/` melihat tampilan publik yang sama, plus tombol menuju ruang kerjanya di header.
- Jika nol pesantren terdaftar: tampilkan empty state "Belum ada pesantren terdaftar — hubungi Super Admin", sembunyikan grafik dan nonaktifkan tombol lapor (dengan penjelasan).

## 2. Route workspace — wajib login + role cocok

| URL | Role | Halaman |
|---|---|---|
| `/admin/dashboard` | admin | Dashboard sistem |
| `/admin/pengguna` | admin | Kelola akun (tanpa opsi Asesor) |
| `/admin/pesantren` | admin | Direktori + verifikasi Aktif/Nonaktif |
| `/admin/hak-akses` | admin | Matriks 3 peran + publik (baca) |
| `/admin/audit-log` | admin | Jejak global (baca) |
| `/admin/pengaturan` | admin | Preferensi + reset data demo |
| `/peneliti/dashboard` | peneliti | Dashboard penelitian |
| `/peneliti/instrumen` | peneliti | Builder |
| `/peneliti/versioning` | peneliti | Draft/Published/Archived |
| `/peneliti/scoring` | peneliti | Konfigurasi scoring |
| `/peneliti/validasi-publikasi` | peneliti | Checklist + kunci publish |
| `/peneliti/data-penelitian` | peneliti | Dataset + impor/ekspor dummy |
| `/pengelola/validasi-laporan` | pengelola | **Antrean moderasi (halaman kelola utama)** |
| `/pengelola/lokasi` | pengelola | Gedung & denah |
| `/pengelola/tindak-lanjut` | pengelola | Kelola (PIC, tenggat, progres, bukti) |
| `/pengelola/laporan` | pengelola | Laporan scope sendiri |

> Prefix `/pengelola` adalah rancangan saat ini. Rename masih backlog, bukan konsekuensi otomatis
> dari keputusan membangun ulang; `/pesantren/[kode]` sudah dipakai profil publik.

## 3. Matriks guard (keputusan per kombinasi)

| Kondisi | Hasil |
|---|---|
| Route publik + tanpa sesi | `allowed` |
| Route baca publik + sesi apa pun | `allowed` (dataset publik sama; header mengikuti akun) |
| `/lapor` atau `/penilaian-mandiri` + sesi Super Admin/Peneliti | `allowed` membaca; aksi kirim dinonaktifkan + pesan "Keluar dari akun untuk melapor sebagai publik." (D-03, 8 Sep 2026). Pengelola boleh kirim, termasuk ke pesantren lain sebagai pelapor umum |
| Route workspace + tanpa sesi | redirect `/login` (setelah login kembali ke URL tujuan semula) |
| Route workspace + role cocok | `allowed`, scope difilter (`pengelola` hanya `institutionCode` miliknya) |
| Route workspace + role salah | `/akses-ditolak` dengan pesan "Akun [label] hanya dapat membuka ruang kerjanya" + tombol kembali ke ruang kerja yang benar |
| `/asesor/*` (sisa lama) | `/akses-ditolak` dengan pesan "Peran Asesor sudah dihapus pada ; gunakan Penilaian Mandiri" + tombol ke `/penilaian-mandiri` |
| `/pesantren/[kode tak dikenal]` | `allowed` + empty state "Pesantren tidak ditemukan" (bukan 404 teknis) |

Guard frontend hanya simulasi UX; backend wajib memeriksa ulang role + permission + scope.
URL tujuan setelah login harus tetap berada dalam aplikasi dan diperiksa terhadap peran aktif;
jangan langsung mengikuti tujuan tersimpan yang mengarah ke workspace peran lain.
Pemeriksaan scope juga berlaku pada aksi simpan berdasarkan ID, bukan hanya menu/URL.

## 4. Navigasi dan shell

- Satu shared workspace shell untuk route workspace (sidebar, header, akun aktif kanan atas, notifikasi, menu mobile, konten).
- Route publik memakai shell publik ringan: logo + nama ISHAS + penanda `Data publik · ilustrasi` + pemilih pesantren (di `/`) + tombol **Masuk** / jalan ke workspace bila sudah login.
- Menu aktif selalu diturunkan dari URL. Tidak ada state navigasi kedua.
- Notifikasi: target path publik (`/hasil`, `/peta-risiko`) untuk info umum; target `/pengelola/validasi-laporan` hanya untuk pengelola pemilik scope; target `/admin/pengguna` dan `/admin/pesantren` untuk super admin.

## 5. Kelengkapan navigasi sebelum rencana difinalkan

- Daftar di atas memuat 27 pola route kanonis (11 publik/bantuan + 16 workspace), termasuk satu pola profil dinamis. Ini bukan 27 URL uji saja.
- Tambahkan pemeriksaan URL indeks `/admin`, `/peneliti`, `/pengelola`, tujuan login tiap peran,
 route lama `/pengelola/*` yang berubah, route tidak dikenal, dan `/asesor` maupun `/asesor/*`.
- Tujuan pengelola pada rancangan baru adalah halaman utama Validasi Laporan; jangan menyisakan
 tombol **Ruang kerja** ke dashboard pengelola lama yang tidak ada di inventaris baru.
- Tulis URL tujuan untuk setiap CTA/notifikasi; link kelola dari halaman publik tetap memerlukan
 sesi pengelola yang memiliki objek tersebut. Halaman publik tidak mengubah scope akun aktif.
