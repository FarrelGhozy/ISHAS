# Stage 01 — Fondasi dan Login

**Status:** REVIEW

**Tujuan:** membentuk pintu masuk dan struktur produk yang memperlihatkan empat peran secara jelas tanpa backend.

## Ruang Lingkup

- Halaman login ISHAS dengan akun demo untuk empat peran.
- Validasi login dummy dan akses cepat untuk kebutuhan presentasi.
- Navigasi, judul, metrik, dan fokus kerja yang berbeda per peran.
- Identitas akun aktif di kanan atas serta aksi keluar.
- Tata visual teal/navy yang konsisten dengan karakter akademis dan K3L.
- Tampilan desktop dan mobile.

## Acceptance Criteria

- [x] Pengguna selalu melihat halaman login sebelum dashboard.
- [x] Empat akun demo dapat masuk ke ruang kerja yang tepat.
- [x] Tidak ada pemilih peran setelah login.
- [x] Nama dan peran akun aktif terlihat di kanan atas.
- [x] Menu dan isi ringkasan tiap peran berbeda.
- [x] Aturan panjang tidak menjadi halaman utama; hanya konteks ringkas yang relevan.
- [x] Navigasi mobile dapat dibuka dan ditutup.
- [x] Lint dan production build lolos.
- [x] Hasil visual diperiksa melalui browser pada desktop dan mobile.

## Keputusan

- Semua akun demo menggunakan kata sandi `demo1234` agar mudah dipresentasikan.
- Data, skor, jumlah lembaga, dan status pada stage ini adalah data ilustrasi.
- Pendalaman CRUD dan alur kompleks dilakukan pada stage masing-masing peran.
