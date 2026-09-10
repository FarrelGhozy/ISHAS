# Panduan Kerja Proyek ISHAS

Dokumen ini adalah aturan tetap untuk setiap pekerjaan pada repository ISHAS.
Dibaca bersama `docs/README.md` (visi + istilah baku) sebelum menyentuh file apa pun.

## Arah Produk

- ISHAS adalah prototipe platform pelaporan dan pemantauan K3L pesantren.
- Tahap saat ini adalah validasi tampilan, alur, dan fitur menggunakan data dummy.
- Backend dan integrasi API baru dimulai setelah rancangan frontend disetujui.
- Tiga peran login ditambah ruang publik, dengan pemisahan yang jelas:
  - **Super Admin** mengelola pesantren, akun pengelola, audit, dan pengaturan demo.
  - **Peneliti** mengelola ilmu, instrumen, versi, serta konfigurasi penilaian.
  - **Pengelola Pesantren** memvalidasi laporan, mengelola lokasi, tindak lanjut, dan laporan scope-nya.
  - **Publik / Pelapor** (tanpa login) membaca dashboard dan mengirim laporan/penilaian mandiri.

## Sumber Kebenaran

1. Proposal dan dokumen sumber di `docs/source/`.
2. Spesifikasi produk di `docs/` (`ROLES.md`, `ROUTES.md`, `FLOWS.md`, `DATA_MODEL.md`, `WIREFRAMES.md`, `DESIGN_SYSTEM.md`).
3. Keputusan produk yang dicatat dalam `docs/DECISIONS.md`.
4. Stage pembangunan di `planning/` dan kontrol kerja di `docs/TODO.md`.
5. Implementasi dan data dummy di `apps/web/`.

Jika sumber ilmiah belum menetapkan rumus, ambang, atau klasifikasi, tandai sebagai asumsi prototipe. Jangan menyajikannya sebagai ketentuan ilmiah final.

## Alur Kerja per Stage

1. Baca `planning/README.md`, file stage berstatus `IN PROGRESS`, dan `docs/TODO.md`.
2. Kerjakan hanya ruang lingkup stage yang berstatus `IN PROGRESS`.
3. Perbarui checklist dan keputusan selama pekerjaan berlangsung.
4. Uji tampilan desktop, tablet, ponsel, alur utama, lint, typecheck, test, dan build.
5. Pindahkan stage ke `REVIEW` agar dapat diperiksa pemilik proyek/dosen.
6. Stage dinyatakan `DONE` hanya setelah disetujui.

## Aturan Produk dan UX

- `/` adalah dashboard publik tanpa login; sesi login tidak mengubah isinya.
- Laporan `Menunggu validasi`/`Ditolak` tidak pernah tampil di dashboard/hasil/peta/rekomendasi/laporan.
- Severity/priority hanya diisi pengelola saat menerima (tanpa default). Penolakan wajib alasan min 10 karakter.
- Pengguna masuk melalui halaman login dummy dan hanya melihat ruang kerja sesuai perannya.
- Jangan menyediakan pemilih peran setelah login. Pergantian peran dilakukan dengan keluar lalu masuk sebagai akun lain.
- Akun aktif harus tampil di kanan atas pada seluruh halaman setelah login.
- Aturan sistem yang panjang tidak dijadikan menu utama. Tampilkan penjelasan singkat dan kontekstual pada langkah yang memerlukannya.
- Gunakan bahasa Indonesia yang ringkas dan konsisten.
- Arah visual: modern, akademis, tenang, dan mudah diaudit; merah-marun adalah identitas utama ISHAS. Status bahaya tetap harus dibedakan dengan label dan ikon, bukan warna saja.
- Instrumen yang sudah dipublikasikan tidak boleh diubah langsung; perubahan dibuat sebagai versi baru.
- Laporan yang tampil di dashboard harus tetap dapat ditelusuri ke versi instrumen, bukti, lokasi, pelapor, validator, dan audit event.

## Arsitektur Frontend

- Gunakan route URL sebagai sumber kebenaran halaman aktif; jangan membuat router kedua melalui state komponen.
- Gunakan satu shared workspace shell untuk sidebar, header, akun aktif, notifikasi, menu mobile, dan area konten, plus satu shell publik ringan untuk route publik.
- Sesi login dummy dipusatkan pada shared store (sessionStorage). Draft laporan di localStorage terpisah. Penyimpanan browser hanya untuk kebutuhan prototipe dan tidak boleh menyimpan kata sandi atau token produksi.
- Guard frontend harus memeriksa direct URL berdasarkan role aktif, tetapi tidak boleh dianggap sebagai pengganti otorisasi backend.
- Data domain dummy tidak boleh didefinisikan ulang di komponen halaman. Simpan seed, mock adapter, mutation, dan processor ilustratif di `apps/web/mocks/`.
- Semua hubungan user, lembaga, instrumen, laporan, lokasi, hasil, risiko, rekomendasi, dan tindak lanjut memakai ID stabil.
- Perubahan lintas halaman/role harus melalui shared store atau repository; state lokal hanya untuk interaksi sementara yang belum disimpan.
- Data dummy yang dipersistenkan harus mempunyai versi schema dan mekanisme reset agar demo dapat kembali ke kondisi awal.
- Pecah komponen berdasarkan role dan fitur tanpa mengubah desain, copy, atau behavior di luar ruang lingkup stage aktif.
- Gunakan komponen yang sudah tersedia di `apps/web/shared/components/` sebelum membuat primitive interaktif baru.

## Istilah Baku

Pakai persis: `Super Admin`, `Pengelola Pesantren (mitra)` / singkat `Pengelola Pesantren`,
`Peneliti`, `Publik / Pelapor`, `Pesantren terdaftar`, `Menunggu validasi`, `Pending`, `Proses`,
`Completed`, `Ditolak`, `Diterima`, `Tinggi/Sedang/Rendah`, `Belum ditentukan`.

## Git dan Identitas

- Gunakan identitas Git milik pemilik repository yang sudah dikonfigurasi.
- Jangan menambahkan identitas AI, `Co-authored-by`, atau atribusi lain atas nama asisten.
- Commit harus kecil, jelas, dan mengikuti format Conventional Commits (contoh: `docs: ...`, `feat(publik): ...`, `feat(validasi): ...`, `chore(mock): ...`).
- Jangan melakukan push tanpa permintaan atau persetujuan eksplisit pemilik repository.
- Jangan memasukkan file referensi atau perubahan milik pengguna yang tidak terkait ke commit.
