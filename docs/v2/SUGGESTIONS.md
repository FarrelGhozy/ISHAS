# V2 — Masukan Tambahan (Opsional, Di Luar Permintaan)

> Setiap poin di bawah adalah USULAN, bukan keputusan. Jangan diimplementasikan tanpa persetujuan eksplisit. Alasan: mencegah salah paham "fitur bonus" dianggap wajib.

Pada tahap sekarang semua usulan hanya dibahas sebagai dokumen. Keputusan inti yang belum
jelas ada di `DECISIONS.md`; tambahan opsional di sini tidak boleh mendahului penyelesaian konflik inti.

## 1. Nomor laporan yang ramah pelapor (disarankan)

- Format `RPT-2026-0001` (tahun + urutan) agar mudah disebut via telepon/WA ke pengelola pondok.
- Tampilkan juga QR/kode pendek pada layar sukses untuk cek status laporan tanpa login (cek status read-only per nomor; tanpa data pribadi pelapor lain).

## 2. Cek status laporan publik (disarankan)

- Halaman `/lapor/status?nomor=RPT-XXXX`: menampilkan status (`Menunggu validasi/Pending/Proses/Completed/Ditolak` + alasan ringkas bila ditolak) untuk nomor miliknya.
- Anti-ambiguitas: hanya nomor + status + pesantren + waktu; TIDAK menampilkan antrean orang lain.

**Catatan review:** nomor `RPT-XXXX` berurutan dapat ditebak dan belum membuktikan bahwa pengguna
adalah pemilik laporan. Status/penolakan belum otomatis publik. Jika fitur ini dipilih, tentukan
bidang yang dapat dibaca dan mekanisme akses bersama D-02; jangan menganggap “nomor miliknya”
sudah terjamin oleh form pencarian nomor. Kanal klarifikasi/notifikasi nyata tetap di luar prototipe.

## 3. Anti-spam ringan versi prototipe (disarankan)

- Batas 1 kiriman per 60 detik per perangkat + konfirmasi "Saya bertanggung jawab atas kebenaran laporan ini" (checkbox wajib).
- CAPTCHA/rate-limit nyata tetap ditunda ke backend; yang ini hanya penahan demo, bukan keamanan.

## 4. Template deskripsi terpandu (disarankan)

- Placeholder terstruktur di field deskripsi: "Apa yang terjadi: … / Lokasi tepat: … / Sejak kapan: … / Siapa terdampak: …" untuk menaikkan kualitas laporan tanpa menambah field.

## 5. Notifikasi pelapor yang login (disarankan)

- Bila pelapor login sebagai pengelola lalu lapor ke pesantrennya sendiri, tampilkan badge status laporannya di header ("Laporan RPT-XXXX: Pending").
- Tidak berlaku untuk anonim (mereka memakai cek status via nomor).

## 6. Usulan yang SENGAJA tidak disarankan

- Pendaftaran pesantren mandiri oleh publik (risiko data sampah; tetap via Super Admin).
- Komentar/diskusi publik per laporan (risiko moderasi ganda; cukup kanal validasi pengelola).
- Skor reputasi pelapor (tidak relevan untuk K3L pesantren dan sensitif secara sosial).
- Mengubah warna identitas (marun `#9f1239` + rose `#be123c` sudah menjadi identitas ISHAS; perubahan hanya mengulang kerja branding).
