# Peta Route dan Guard (Definisi Rinci)

Aplikasi terpisah bernama **ISHAS** (D-01, dijawab 8 September 2026): frontend React Router,
file dipecah per folder fitur, dijalankan dengan bun 1.4. URL adalah sumber kebenaran halaman aktif.
Tabel di bawah adalah peta route aplikasi. Isi publik mengikuti D-02 (ringkasan saja +
nama validator/PIC); hak kirim mengikuti D-03 (publik + Pesantren).

## 1. Calon route publik — akses baca dan hak mengirim dibedakan

| URL | Nama halaman | Isi ringkas | Catatan |
|---|---|---|---|
| `/` | Dashboard publik | Agregat semua pesantren terdaftar + pemilih pesantren + tren + prioritas + CTA lapor/nilai | Pengganti landing; tanpa guard login |
| `/lapor` | Laporan cepat | Form ringan satu langkah | Bisa juga dibuka sebagai dialog dari `/`, tapi URL kanonis tetap `/lapor` |
| `/penilaian-mandiri` | Penilaian mandiri | Bank live + registrasi penilai + draft lokal checksum + kirim validasi (D-24) | Satu-satunya tempat isi indikator |
| `/hasil` | Hasil assessment | Per dimensi + antarperiode, mengikuti filter pesantren | Hanya data `Diterima` |
| `/peta-risiko` | Peta bahaya & risiko | D-14: pilih satu pesantren untuk denah gambaran besar + titik temuan Diterima yang aktif; daftar temuan termasuk tanpa titik | Filter URL: pesantren, `denah`, `risiko`, `statusPeta`; lantai berupa keterangan. Frontend REVIEW |
| `/rekomendasi` | Rekomendasi | Prioritas + PIC + tenggat + progres | Sumber menunjuk `reportId` |
| `/tindak-lanjut` | Tindak lanjut (baca) | Progres + status + nama PIC; bukti penyelesaian tidak publik (D-02) | Tombol kelola hanya muncul bila login Pesantren pemilik scope |
| `/dokumen` | Dokumen indikator (D-16) | Pustaka PDF per indikator: search + filter kategori/status; Public = Lihat tab baru + Unduh; Privat = nama + terkunci tanpa tombol | Global (filter pesantren tidak memfilter dokumen); guard publik `allowed` semua sesi |
| `/laporan` | Laporan pimpinan | Ringkasan + dimensi + status + daftar PDF penilaian (D-24) | Satu penilai = satu PDF; unduh Excel simulasi (label dummy) |
| `/laporan/:id` | PDF laporan penilaian (D-24) | Skor % beku + dimensi + temuan tervalidasi + validator; tombol cetak/simpan PDF browser | Hanya `Diterima`; tanpa nama pelapor/kontak/bukti/jawaban mentah (D-02) |
| `/pesantren/[kode]` | Profil ringkas lembaga | Sama seperti `/` dengan filter terkunci ke `[kode]` | `[kode]` = `institutionCode` mis. `PSN-0018`; kode tak dikenal → empty state, bukan crash |
| `/login` | Masuk | 3 kartu akun: Super Admin, Validator, Pesantren | Tanpa kartu asesor; tanpa link "kembali ke beranda" (beranda = `/` itu sendiri) |
| `/akses-ditolak` | Akses ditolak | Pesan + tombol kembali kontekstual | Lihat §3 |

**Query param yang didukung di route publik:**

- `?pesantren=PSN-0018` — preset filter pesantren (setara membuka `/pesantren/PSN-0018`).
- `?periode=Semester 1 2026` — preset periode hasil.
- Pada halaman baca agregat, param filter tidak valid memakai konteks default dan menampilkan konteks yang benar-benar dipakai. `/pesantren/[kode]` tetap memakai aturan kode tak dikenal pada §3.
- Pada `/lapor` dan `/penilaian-mandiri`, kode pesantren tak dikenal/nonaktif tidak boleh diganti otomatis ke pesantren lain: tampilkan `Pesantren tidak tersedia untuk pelaporan.` dan minta pilihan terdaftar yang eksplisit sebelum kirim. Jika param tidak diberikan, pengguna tetap harus memilih pesantren.
- Mengganti pesantren mengharuskan pemeriksaan ulang area/gedung/titik terkait; ID lokasi dari pesantren sebelumnya tidak boleh ikut terkirim.

**Perilaku `/` yang ditetapkan (anti-ambiguitas):**

- `/` MERENDER dashboard publik secara langsung (bukan redirect ke `/pesantren/dashboard`). Tidak ada kedipan landing, tidak ada redirect berantai.
- Sesi login yang aktif TIDAK mengubah isi `/` — admin/validator/pesantren yang membuka `/` melihat tampilan publik yang sama, plus tombol menuju ruang kerjanya di header.
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
| `/validator/dashboard` | validator | Dashboard validator |
| `/validator/instrumen` | validator | Bank live: builder penuh + Atur Bobot (D-24) |
| `/validator/dokumen-instrumen` | validator | Pustaka PDF per indikator (D-16) |
| `/validator/versioning` | validator | Dihapus (D-24): halaman pengalihan ke Bank instrumen |
| `/validator/scoring` | validator | Audit skor % beku (D-24, D-25: filter + nama dimensi + link PDF) |
| `/validator/validasi-publikasi` | validator | Audit publikasi: checklist 5 kriteria kesiapan snapshot, label menu `Audit publikasi` (D-25; route tetap) |
| `/validator/data-penelitian` | validator | Dataset + ekspor CSV/JSON whitelist D-02 + impor validasi→pratinjau→terapkan sebagai `Menunggu validasi` (D-25) |
| `/pesantren/validasi-laporan` | pesantren | **Antrean moderasi (halaman kelola utama)** |
| `/pesantren/lokasi` | pesantren | Gedung & denah |
| `/pesantren/tindak-lanjut` | pesantren | Kelola (PIC, tenggat, progres, bukti) |
| `/pesantren/laporan` | pesantren | Laporan scope sendiri |

> Prefix `/pesantren` workspace disetujui D-17 (menggantikan `/pengelola`).
> URL lama `/peneliti/*` dialihkan ke `/validator/*`, `/pengelola/*` ke `/pesantren/*`.
> Profil publik `/pesantren/[kode]` tetap; route statis workspace lebih diutamakan
> daripada `:kode` dinamis.

## 3. Matriks guard (keputusan per kombinasi)

| Kondisi | Hasil |
|---|---|
| Route publik + tanpa sesi | `allowed` |
| Route baca publik + sesi apa pun | `allowed` (dataset publik sama; header mengikuti akun) |
| `/lapor` atau `/penilaian-mandiri` + sesi Super Admin/Validator | `allowed` membaca; aksi kirim dinonaktifkan + pesan "Keluar dari akun untuk melapor sebagai publik." (D-03, 8 Sep 2026). Pesantren boleh kirim, termasuk ke pesantren lain sebagai pelapor umum |
| Route workspace + tanpa sesi | redirect `/login` (setelah login kembali ke URL tujuan semula) |
| Route workspace + role cocok | `allowed`, scope difilter (`pesantren` hanya `institutionCode` miliknya) |
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
- Notifikasi: target path publik (`/hasil`, `/peta-risiko`) untuk info umum; target `/pesantren/validasi-laporan` hanya untuk Pesantren pemilik scope; target `/admin/pengguna` dan `/admin/pesantren` untuk super admin.

## 5. Kelengkapan navigasi sebelum rencana difinalkan

- Daftar di atas memuat 29 pola route kanonis (12 publik/bantuan + 17 workspace), termasuk satu pola profil dinamis. Ini bukan 29 URL uji saja.
- Tambahkan pemeriksaan URL indeks `/admin`, `/validator`, `/pesantren`, tujuan login tiap peran,
  route lama `/peneliti/*` dan `/pengelola/*` yang dialihkan (D-17), route tidak dikenal, dan `/asesor` maupun `/asesor/*`.
- Tujuan Pesantren pada rancangan baru adalah halaman utama Validasi Laporan; jangan menyisakan
  tombol **Ruang kerja** ke dashboard Pesantren lama yang tidak ada di inventaris baru.
- Tulis URL tujuan untuk setiap CTA/notifikasi; link kelola dari halaman publik tetap memerlukan
  sesi Pesantren yang memiliki objek tersebut. Halaman publik tidak mengubah scope akun aktif.
