# Panduan Kerja Proyek ISHAS

Dokumen ini adalah aturan tetap untuk setiap pekerjaan pada repository ISHAS.

## Arah Produk

- ISHAS adalah prototipe platform assessment K3L pesantren.
- Tahap saat ini adalah validasi tampilan, alur, dan fitur menggunakan data dummy.
- Backend dan integrasi API baru dimulai setelah rancangan frontend disetujui.
- Empat peran utama memiliki bobot yang sama dan harus dipisahkan dengan jelas:
  - **Admin** mengelola sistem, akun, lembaga, akses, dan audit.
  - **Peneliti** mengelola ilmu, instrumen, versi, serta konfigurasi penilaian.
  - **Asesor** menghasilkan data assessment dan bukti lapangan.
  - **Pengelola Pesantren** membaca hasil, rekomendasi, dan mengelola tindak lanjut.

## Sumber Kebenaran

1. Proposal dan dokumen sumber di `docs/source/`.
2. Blueprint dan aturan frontend di `docs/blueprint/` serta `docs/FRONTEND_RULES.md`.
3. Keputusan produk yang dicatat dalam `planning/`.
4. Implementasi dan data dummy di `apps/web/`.

Jika sumber ilmiah belum menetapkan rumus, ambang, atau klasifikasi, tandai sebagai asumsi prototipe. Jangan menyajikannya sebagai ketentuan ilmiah final.

## Alur Kerja per Stage

1. Baca `planning/README.md`, issue stage terkait, dan `TODO.md`.
2. Kerjakan hanya ruang lingkup stage yang berstatus `IN PROGRESS`.
3. Perbarui checklist dan keputusan selama pekerjaan berlangsung.
4. Uji tampilan desktop, tampilan mobile, alur utama, lint, dan build.
5. Pindahkan stage ke `REVIEW` agar dapat diperiksa pemilik proyek/dosen.
6. Stage dinyatakan `DONE` hanya setelah disetujui.

## Aturan Produk dan UX

- Pengguna masuk melalui halaman login dummy dan hanya melihat ruang kerja sesuai perannya.
- Jangan menyediakan pemilih peran setelah login. Pergantian peran dilakukan dengan keluar lalu masuk sebagai akun lain.
- Akun aktif harus tampil di kanan atas pada seluruh halaman setelah login.
- Aturan sistem yang panjang tidak dijadikan menu utama. Tampilkan penjelasan singkat dan kontekstual pada langkah yang memerlukannya.
- Gunakan bahasa Indonesia yang ringkas dan konsisten.
- Arah visual: modern, akademis, tenang, mudah diaudit; teal/navy sebagai warna utama dan merah hanya untuk bahaya atau kesalahan.
- Instrumen yang sudah dipublikasikan tidak boleh diubah langsung; perubahan dibuat sebagai versi baru.
- Assessment yang sudah final harus tetap dapat ditelusuri ke versi instrumen dan bukti yang digunakan.

## Git dan Identitas

- Gunakan identitas Git milik pemilik repository yang sudah dikonfigurasi.
- Jangan menambahkan identitas AI, `Co-authored-by`, atau atribusi lain atas nama asisten.
- Commit harus kecil, jelas, dan mengikuti format Conventional Commits.
- Jangan melakukan push tanpa permintaan atau persetujuan eksplisit pemilik repository.
- Jangan memasukkan file referensi atau perubahan milik pengguna yang tidak terkait ke commit.
