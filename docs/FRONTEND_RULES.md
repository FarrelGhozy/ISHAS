# Aturan frontend ISHAS

## Tujuan tahap prototipe

Frontend digunakan untuk menyepakati navigasi, hierarki informasi, hak akses, formulir, dashboard, peta risiko, dan bentuk laporan sebelum backend dibangun.

## Data dan integrasi

- Selama migrasi Stage 09, data lama boleh tetap berada di lokasi asal agar routing tidak mengubah behavior fitur.
- Setelah Stage 10, seluruh seed, mock adapter, mutation, dan processor data prototipe disimpan di `apps/web/mocks/`; komponen halaman tidak menyimpan ulang data domain yang sama.
- Komponen tidak boleh menganggap data dummy sebagai formula ilmiah final.
- Model UI harus mudah dipindahkan dari mock data ke API.
- Kondisi loading, kosong, gagal, tidak berwenang, draft, submitted, dan finalized harus dirancang sebelum integrasi backend.
- Seluruh relasi antarentitas memakai ID stabil. Label tampilan tidak digunakan sebagai penghubung data.
- Perubahan lintas halaman dan lintas role harus melalui shared store/repository.
- Persistence browser untuk data dummy harus berversi dan menyediakan reset ke seed awal.

## Routing dan arsitektur

- Setiap menu utama memiliki route URL yang stabil.
- URL menjadi sumber kebenaran halaman aktif agar refresh, Back/Forward, bookmark, dan direct link bekerja.
- Route publik, workspace role, akses ditolak, dan fallback route dipisahkan dengan jelas.
- Sidebar, header, akun aktif, notifikasi, menu mobile, dan area konten menggunakan shared workspace shell.
- Autentikasi dummy berada pada shared session store dan dipulihkan saat refresh selama sesi browser berlaku.
- Pengguna tanpa sesi tidak dapat membuka route workspace; role aktif tidak dapat membuka route role lain.
- Guard frontend hanya mensimulasikan UX otorisasi. Backend tetap wajib memeriksa role, permission, dan scope.
- Komponen dipecah berdasarkan fitur/halaman. State lokal hanya digunakan untuk filter, modal, atau input sementara yang belum disimpan.
- Refactor arsitektur mempertahankan arah visual serta cakupan produk dan tidak menjadi alasan untuk redesign di luar stage aktif.

## Peran utama

- Admin: sistem, pengguna, pesantren, hak akses, audit, dan pengaturan non-ilmiah.
- Peneliti: ilmu, instrumen, versi, konfigurasi scoring, validasi, dan data penelitian.
- Asesor: penugasan assessment, jawaban indikator, bukti lapangan, serta finalisasi.
- Pengelola Pesantren: hasil pesantrennya, peta risiko, rekomendasi, tindak lanjut, dan laporan.

Keempat peran memiliki bobot produk yang sama. Pemisahan dilakukan sejak login dan pengguna tidak dapat mengganti peran dari dalam dashboard. Otorisasi nyata nantinya wajib ditegakkan kembali oleh backend.

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

- Merah dan marun adalah warna identitas utama ISHAS, dipadukan dengan putih serta slate agar tetap akademis dan mudah dibaca.
- Status bahaya tinggi, kesalahan, atau tindakan destruktif harus tetap disertai label dan ikon sehingga tidak bergantung pada warna merah saja.
- Permukaan utama memakai putih dan netral agar data mudah dibaca.
- Komponen menggunakan radius, jarak, tipografi, dan ikon yang konsisten.
- Tampilan harus berfungsi pada desktop, tablet, dan ponsel.
- Logo saat ini bersifat sementara dan tidak boleh didaftarkan sebagai identitas resmi tanpa review.

## Batas frontend dan backend

Frontend mengatur presentasi, input, validasi pengalaman pengguna, dan simulasi alur. Backend nantinya menjadi sumber kebenaran untuk autentikasi, izin, versioning, scoring, finalisasi, audit, file, dan ekspor.
