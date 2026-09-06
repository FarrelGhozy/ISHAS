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
- Arah visual: modern, akademis, tenang, dan mudah diaudit; merah-marun adalah identitas utama ISHAS. Status bahaya tetap harus dibedakan dengan label dan ikon, bukan warna saja.
- Instrumen yang sudah dipublikasikan tidak boleh diubah langsung; perubahan dibuat sebagai versi baru.
- Assessment yang sudah final harus tetap dapat ditelusuri ke versi instrumen dan bukti yang digunakan.

## Arsitektur Frontend Selama Refactor

- Gunakan route URL sebagai sumber kebenaran halaman aktif; jangan membuat router kedua melalui state komponen.
- Gunakan satu shared workspace shell untuk sidebar, header, akun aktif, notifikasi, menu mobile, dan area konten.
- Sesi login dummy dipusatkan pada shared store. Penyimpanan browser hanya untuk kebutuhan prototipe dan tidak boleh menyimpan kata sandi atau token produksi.
- Guard frontend harus memeriksa direct URL berdasarkan role aktif, tetapi tidak boleh dianggap sebagai pengganti otorisasi backend.
- Data domain dummy tidak boleh didefinisikan ulang di komponen halaman. Simpan seed, mock adapter, mutation, dan processor ilustratif di `apps/web/mocks/`.
- Semua hubungan user, lembaga, instrumen, penugasan, assessment, lokasi, hasil, risiko, rekomendasi, dan tindak lanjut memakai ID stabil.
- Perubahan lintas halaman/role harus melalui shared store atau repository; state lokal hanya untuk interaksi sementara yang belum disimpan.
- Data dummy yang dipersistenkan harus mempunyai versi schema dan mekanisme reset agar demo dapat kembali ke kondisi awal.
- Pecah komponen berdasarkan role dan fitur tanpa mengubah desain, copy, atau behavior di luar ruang lingkup stage aktif.
- Pertahankan `apps/web/app/` sebagai root App Router. Jangan memindahkan project ke `src/` hanya untuk mengikuti contoh struktur.
- Gunakan komponen yang sudah tersedia di `apps/web/components/ui/` sebelum membuat primitive interaktif baru.
- Lakukan migrasi bertahap per route dan hapus implementasi lama hanya setelah parity serta pemeriksaan teknis berhasil.

## Git dan Identitas

- Gunakan identitas Git milik pemilik repository yang sudah dikonfigurasi.
- Jangan menambahkan identitas AI, `Co-authored-by`, atau atribusi lain atas nama asisten.
- Commit harus kecil, jelas, dan mengikuti format Conventional Commits.
- Jangan melakukan push tanpa permintaan atau persetujuan eksplisit pemilik repository.
- Jangan memasukkan file referensi atau perubahan milik pengguna yang tidak terkait ke commit.
