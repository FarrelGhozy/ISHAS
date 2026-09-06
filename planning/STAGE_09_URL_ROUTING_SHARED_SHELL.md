# Stage 09 — URL Routing, Shared Shell, dan Guard Akses

**Status:** DONE

**Tujuan:** mengubah navigasi berbasis state menjadi route URL yang dapat di-refresh, ditelusuri dengan tombol Back/Forward, dan dibatasi berdasarkan role tanpa mengubah arah visual atau menambah backend.

## Latar Belakang

- Seluruh halaman saat ini dirender dari satu route `/` dan dipilih melalui state `section`.
- Refresh selalu mengembalikan pengguna ke posisi awal dan URL tidak dapat dipakai sebagai bookmark atau tautan langsung.
- Sidebar, header, akun aktif, notifikasi, dan pemilihan konten masih berada dalam satu komponen besar.
- Login dummy belum dipulihkan setelah refresh.
- Pemisahan menu per role sudah terlihat, tetapi akses langsung melalui URL belum memiliki guard.

## Keputusan Arsitektur

- Gunakan App Router yang sudah tersedia pada Vinext; jangan mengganti framework atau package manager.
- Pertahankan struktur `apps/web/app/` yang sudah ada. Pemindahan seluruh project ke folder `src/` tidak diperlukan.
- URL menjadi sumber kebenaran untuk halaman aktif. Jangan mempertahankan state `section` sebagai router kedua.
- Gunakan satu shared workspace shell untuk sidebar, header, akun aktif, notifikasi, menu mobile, loading boundary, dan area konten.
- Autentikasi dummy dipusatkan dalam shared session store tanpa provider global agar sesuai dengan renderer Vinext saat ini.
- Sesi dummy boleh disimpan di `sessionStorage` agar refresh tidak melempar pengguna ke login. Jangan menyimpan kata sandi atau memperlakukan penyimpanan browser sebagai autentikasi produksi.
- Guard frontend hanya untuk simulasi UX. Otorisasi nyata tetap wajib diperiksa backend pada tahap integrasi.
- Migrasi dilakukan bertahap per role dan route; tampilan, istilah, serta aksi dummy yang sudah ada harus tetap tersedia.
- Gunakan komponen UI yang sudah tersedia untuk dialog, navigasi, dan feedback ketika relevan; jangan membuat primitive interaktif baru bila padanannya sudah ada.

## Target Route

| Area | Route utama |
| --- | --- |
| Publik | `/login`, `/akses-ditolak` |
| Admin | `/admin/dashboard`, `/admin/pengguna`, `/admin/pesantren`, `/admin/hak-akses`, `/admin/audit-log`, `/admin/pengaturan` |
| Peneliti | `/peneliti/dashboard`, `/peneliti/instrumen`, `/peneliti/versioning`, `/peneliti/scoring`, `/peneliti/validasi-publikasi`, `/peneliti/data-penelitian` |
| Asesor | `/asesor/dashboard`, `/asesor/penugasan`, `/asesor/assessment-baru`, `/asesor/bukti`, `/asesor/riwayat` |
| Pengelola | `/pengelola/dashboard`, `/pengelola/hasil`, `/pengelola/lokasi`, `/pengelola/peta-risiko`, `/pengelola/rekomendasi`, `/pengelola/tindak-lanjut`, `/pengelola/laporan` |

Route detail ber-ID seperti instrumen, assessment, hasil, temuan, dan tindak lanjut dipersiapkan pada struktur folder, lalu diselesaikan bersama pemecahan fitur pada Stage 10.

## Ruang Lingkup

### 1. Routing

- Buat route publik untuk login dan akses ditolak.
- Buat route workspace per role dan halaman menu yang sudah ada.
- Arahkan `/` ke login atau dashboard role dari sesi dummy aktif.
- Pastikan menu aktif berasal dari pathname.
- Pastikan tombol Back/Forward browser mengembalikan halaman yang benar.
- Sediakan fallback untuk route tidak dikenal dan route yang tidak tersedia bagi role aktif.

### 2. Shared application shell

- Pisahkan sidebar, topbar, identitas akun, notifikasi, menu mobile, dan area konten dari `ishas-prototype.tsx`.
- Simpan konfigurasi menu dan metadata role pada modul bersama.
- Pertahankan skip link, responsive sidebar, lazy/loading state, label data dummy, dan logout.
- Pastikan setiap halaman tetap menampilkan akun aktif di kanan atas.

### 3. Sesi login dummy

- Pusatkan akun demo, login, logout, pemulihan sesi, dan role aktif.
- Login mengarahkan pengguna ke dashboard role yang benar.
- Logout membersihkan sesi dummy dan kembali ke `/login`.
- Refresh mempertahankan akun yang sedang aktif selama sesi browser masih berlaku.
- Tidak ada pemilih role setelah login.

### 4. Guard akses

- Pengguna tanpa sesi diarahkan ke `/login`.
- Pengguna yang membuka URL role lain diarahkan ke `/akses-ditolak` atau dashboard miliknya dengan penjelasan yang konsisten.
- Guard tidak hanya menyembunyikan menu; direct URL juga diperiksa.
- Mapping role-route ditulis satu kali dan digunakan oleh navigasi serta guard.

## Di Luar Ruang Lingkup

- Backend, cookie autentikasi produksi, SSO, atau izin server.
- Penyatuan seluruh data domain dan persistence form assessment.
- Perubahan desain visual besar.
- Penambahan role atau modul bisnis baru.
- Perombakan seluruh halaman role menjadi file kecil; pekerjaan itu berada pada Stage 10.
- Perubahan rumus, bobot, threshold, dan keputusan ilmiah.

## Urutan Implementasi

1. Catat baseline route/menu dan hasil lint, TypeScript, serta build.
2. Buat konfigurasi role, menu, dan helper path bersama.
3. Buat sesi login dummy bersama dan route `/login`.
4. Buat shared workspace shell.
5. Migrasikan route Admin.
6. Migrasikan route Peneliti.
7. Migrasikan route Asesor.
8. Migrasikan route Pengelola.
9. Tambahkan guard, redirect awal, akses ditolak, dan fallback route.
10. Hapus navigasi state lama setelah seluruh route lolos pemeriksaan.
11. Periksa refresh, Back/Forward, direct URL, desktop, tablet, dan ponsel.

## Acceptance Criteria

- [x] `/` mengarahkan pengguna sesuai kondisi sesi dummy.
- [x] Login berhasil mengarah ke dashboard role yang benar.
- [x] Logout menghapus sesi dan kembali ke `/login`.
- [x] Refresh mempertahankan akun aktif serta halaman yang sedang dibuka.
- [x] Tombol Back/Forward browser bekerja pada seluruh menu utama.
- [x] Setiap menu utama memiliki URL stabil dan dapat dibuka langsung.
- [x] Menu aktif ditentukan dari URL, bukan state navigasi terpisah.
- [x] Satu shared shell digunakan oleh keempat workspace.
- [x] Sidebar, topbar, akun aktif, notifikasi, menu mobile, dan skip link tetap berfungsi.
- [x] Role tidak dapat membuka route milik role lain melalui direct URL.
- [x] Tidak ada pemilih role di dalam workspace.
- [x] Seluruh tampilan dan aksi dummy yang ada sebelum refactor tetap dapat digunakan.
- [x] Tidak ada data domain baru yang dipindahkan secara prematur pada stage ini.
- [x] Pemeriksaan route desktop dan mobile berhasil.
- [x] Lint, TypeScript, dan production build berhasil.

## Hasil Implementasi dan Pemeriksaan Otomatis

Pemeriksaan otomatis pada 5 September 2026 dan pemeriksaan browser pada 6 September 2026 menghasilkan:

- Konfigurasi bersama memuat 4 role dan 24 route menu yang unik.
- Seluruh 24 route menu merespons HTTP 200 pada server lokal.
- Mapping `id`/slug menu dan seluruh target notifikasi mengarah ke halaman yang tersedia.
- Navigasi state lama pada shell sudah dihapus; pathname menjadi sumber menu aktif.
- Shared session store menggunakan `sessionStorage` dan hanya menyimpan role akun demo, bukan kata sandi.
- Lint, TypeScript (`tsc --noEmit`), `git diff --check`, dan production build berhasil.
- Login melalui formulir dan akses cepat, validasi kredensial salah, logout, pemulihan sesi, redirect `/`, dan redirect index role berjalan sesuai rancangan.
- Back/Forward serta menu aktif diuji pada Admin, Peneliti, Asesor, dan Pengelola.
- Setiap role ditolak ketika membuka satu route dari masing-masing tiga role lain.
- Shared shell, notifikasi, menu tablet/ponsel, akun aktif, dan fallback route berhasil diuji; skip link memiliki target konten serta handler fokus eksplisit.
- Tampilan desktop, tablet, dan ponsel tidak mengalami overflow horizontal; grafik tetap responsif tanpa peringatan runtime baru.
- Stage dipindahkan ke `REVIEW`; status `DONE` tetap menunggu persetujuan pemilik proyek/dosen.

## Matriks Pemeriksaan Akses

Untuk setiap role, periksa minimum:

1. URL dashboard sendiri dapat dibuka.
2. Semua URL menu sendiri dapat dibuka.
3. Satu URL dari masing-masing tiga role lain ditolak.
4. Refresh pada halaman selain dashboard mempertahankan route.
5. Back/Forward setelah membuka tiga halaman mengikuti riwayat browser.
6. Logout dari halaman detail kembali ke login dan route terlindungi tidak dapat dibuka lagi.

## Risiko dan Mitigasi

- **Komponen lama kehilangan state ketika pindah route.** Stage 09 mempertahankan behavior yang sudah ada; state domain baru disatukan pada Stage 10.
- **Dua sumber navigasi berjalan bersamaan.** Hapus state `section` segera setelah role terakhir selesai dimigrasikan.
- **Guard menimbulkan loop redirect.** Pisahkan route publik, fallback, dan redirect berdasarkan satu mapping role yang teruji.
- **Refactor mengubah tampilan.** Gunakan markup/class yang ada terlebih dahulu dan tunda perapihan visual ke luar stage.
- **Login dummy dianggap keamanan produksi.** Tampilkan batas prototipe dan pertahankan catatan bahwa backend akan menjadi sumber otorisasi.

## Definition of Done

Stage dipindahkan ke `REVIEW` setelah seluruh acceptance criteria diperiksa, hasil visual utama tidak berubah, dan lint, TypeScript, serta production build lulus. Stage tidak boleh dinyatakan `DONE` sebelum disetujui pemilik proyek/dosen.
