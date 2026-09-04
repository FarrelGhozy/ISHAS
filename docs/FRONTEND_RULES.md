# Aturan frontend ISHAS

## Tujuan tahap prototipe

Frontend digunakan untuk menyepakati navigasi, hierarki informasi, hak akses, formulir, dashboard, peta risiko, dan bentuk laporan sebelum backend dibangun.

## Data dan integrasi

- Semua data prototipe disimpan di `apps/web/lib/mock-data.ts`.
- Komponen tidak boleh menganggap data dummy sebagai formula ilmiah final.
- Model UI harus mudah dipindahkan dari mock data ke API.
- Kondisi loading, kosong, gagal, tidak berwenang, draft, submitted, dan finalized harus dirancang sebelum integrasi backend.

## Peran

- Admin Sistem: konfigurasi teknis, pengguna, pesantren, draft instrumen, versi, dan audit.
- Asesor: assessment yang ditugaskan.
- Pengelola Pesantren: data dan hasil pesantrennya.
- Tim K3 atau Satgas: risiko, rekomendasi, dan tindak lanjut.
- Pimpinan Yayasan: ringkasan lintas pesantren.
- Pemerintah atau Kemenag: ringkasan agregat sesuai izin.
- Peneliti atau Auditor: data penelitian, versi instrumen, ekspor, dan audit.

Pemilih peran pada prototipe hanya mensimulasikan konteks. Penyaringan menu dan otorisasi nyata harus dilakukan bersama backend.

## Instrumen

- Status minimum: Draft, Published, Archived.
- Draft dapat diubah oleh pengguna berwenang.
- Published dikunci.
- Perubahan setelah publish dilakukan melalui clone atau versi baru.
- Jangan menetapkan jumlah dimensi, indikator, jenis jawaban, bobot, threshold, atau recommendation rule secara permanen sebelum hasil penelitian final.

## Assessment

- Alur prototipe: pilih pesantren dan periode, isi indikator, unggah bukti jika diminta, tinjau, submit, lalu finalisasi.
- Draft dapat disimpan.
- Finalized terkunci dan koreksi harus memiliki alasan serta jejak audit.
- Progres dihitung dari kelengkapan field wajib, bukan sekadar jumlah halaman yang dibuka.

## Dashboard

- Nilai indeks selalu disertai kategori, periode, versi instrumen, dan status data.
- Skor per dimensi tidak boleh hanya dibedakan dengan warna.
- Tren memakai periode yang konsisten.
- Rekomendasi menampilkan prioritas, penanggung jawab, dan tenggat.
- Label `data dummy` tetap terlihat selama tahap prototipe.

## Risk map

- Tahap awal memakai denah dua dimensi dan koordinat relatif `x/y`.
- Titik risiko terkait dengan area, assessment, temuan, level, dan rekomendasi.
- Warna selalu disertai label teks Tinggi, Sedang, atau Rendah.
- Denah geografis atau GIS belum diperlukan.
- Bila kemudian dibutuhkan zoom, banyak lantai, dan denah unggahan, gunakan image overlay dengan coordinate reference system sederhana.
- IndoorGML baru dipertimbangkan jika proyek membutuhkan navigasi indoor atau interoperabilitas spasial tingkat lanjut.

## Visual

- Merah adalah aksen prioritas dan keselamatan, bukan warna latar seluruh aplikasi.
- Permukaan utama memakai putih dan netral agar data mudah dibaca.
- Komponen menggunakan radius, jarak, tipografi, dan ikon yang konsisten.
- Tampilan harus berfungsi pada desktop, tablet, dan ponsel.
- Logo saat ini bersifat sementara dan tidak boleh didaftarkan sebagai identitas resmi tanpa review.

## Batas frontend dan backend

Frontend mengatur presentasi, input, validasi pengalaman pengguna, dan simulasi alur. Backend nantinya menjadi sumber kebenaran untuk autentikasi, izin, versioning, scoring, finalisasi, audit, file, dan ekspor.
