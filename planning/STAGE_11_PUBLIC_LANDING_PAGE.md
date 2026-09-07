# Stage 11 — Landing Page Publik

**Status:** REVIEW
**Basis:** permintaan pemilik proyek pada 7 September 2026 agar tautan utama membuka pengenalan ISHAS sebelum login.

## Tujuan dan Ruang Lingkup

- Jadikan `/` halaman publik yang mengenalkan ISHAS, manfaat, empat peran setara, dan alur assessment hingga tindak lanjut.
- Pertahankan identitas marun, logo, login dummy, shared session store, dan guard workspace.
- Sediakan tautan ke `/login` serta jalan kembali ke beranda dari login.
- Sesi aktif tetap dapat membaca landing page; tampilkan identitas akun di kanan atas dan akses ke workspace sesuai peran, tanpa pemilih peran.
- Jelaskan bahwa produk masih prototipe dengan data dummy; jangan menambah klaim hasil penelitian, angka, atau formula final.
- Tidak mencakup backend, perubahan workspace, atau publikasi/push tanpa permintaan eksplisit.

## Keputusan

- Permintaan ini mengaktifkan Stage 11; stage terdahulu yang masih REVIEW tetap menunggu review.
- Landing page menggantikan redirect `/` dari Stage 09. Direct URL workspace tanpa sesi dan logout tetap menuju `/login`.
- Konten berupa pengenalan dan diagram alur tanpa membuat dataset assessment baru.
- Gunakan style khusus landing page agar tampilan workspace tetap terjaga.

## Acceptance Criteria

- [x] `/` dapat dibaca tanpa login dan tidak mengalihkan sesi aktif secara otomatis.
- [x] Pengenalan, manfaat, empat peran, alur penggunaan, dan status prototipe tersedia dalam bahasa Indonesia.
- [x] Navigasi bagian, tombol login, kembali ke beranda, dan akses workspace sesi aktif berfungsi.
- [x] Identitas akun aktif tampil di kanan atas tanpa pemilih peran.
- [x] Desktop, tablet, ponsel, navigasi keyboard, dan alur login/logout diperiksa.
- [x] Lint, TypeScript, test regresi yang tersedia, formatter, dan production build lulus.
- [x] Dokumentasi diperbarui dan stage dipindahkan ke REVIEW.

## Hasil Pemeriksaan — 7 September 2026

- Landing page `/` merespons HTTP 200 dan menampilkan metadata khusus pengenalan ISHAS.
- Navigasi ke bagian peran/alur, kembali ke atas, CTA login, dan tautan kembali ke beranda berhasil.
- Login demo Pengelola, akses kembali ke workspace, beranda dengan sesi aktif, refresh, logout, dan guard direct URL setelah logout berhasil. Pengujian otomatis guard mencakup seluruh role.
- Tampilan desktop, tablet, dan ponsel diperiksa lewat browser dengan preset 1440×900, 834×1112, dan 390×844. Browser menerapkan zoom bawaan, sehingga lebar CSS efektif yang diperiksa sekitar 1309, 758, dan 355 piksel; tidak ada luapan horizontal halaman.
- Identitas akun aktif tetap di kanan atas pada ponsel. Header tidak melekat pada layar kecil agar navigasi bagian tidak menutupi judul.
- Navigasi keyboard Tab → Lewati navigasi → Enter memindahkan fokus ke konten utama. Tidak ditemukan error pada log browser.
- Lint, TypeScript, 11 test regresi (32 assertion), formatter file yang diubah, pemeriksaan diff, dan build produksi setelah perbaikan CSS lulus.
- README, flow penggunaan, TODO, dan indeks planning disinkronkan. REVIEW menunggu persetujuan pemilik proyek; tidak ada push atau publikasi.
