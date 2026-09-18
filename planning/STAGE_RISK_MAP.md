# Revisi Risk Map — 18 September 2026

Status: REVIEW. Diaktifkan melalui arahan pemilik `ok kerjakan`.
Satu revisi lintas fitur, tanpa mengubah status historis stage lainnya.
Acuan: docs/RISK_MAP_DESIGN.md, D-14 dan D-14.a.

- [x] Schema/migrasi, aset lokal dan reset demo.
- [x] Unggah denah kampus, peringatan dan versi historis.
- [x] Shared viewer/picker, lapor cepat, draft dan penilaian mandiri.
- [x] Validasi lokasi dan lineage temuan turunan.
- [x] Dashboard/peta publik satu pesantren, tanpa kebocoran bidang privat.
- [x] Lint/typecheck/test/build dan pemeriksaan responsif/alur utama.

Titik sementara opsional; lokasi area/teks tetap wajib. Tidak ada push/publikasi.
REVIEW hanya setelah hasil verifikasi dicatat; DONE setelah persetujuan pemilik.

## Hasil pemeriksaan — 18 September 2026

- Typecheck, lint, seluruh 82 test (12 khusus Risk Map), build: lulus.
- Unit: batas 0/100, koordinat tidak sah, scope terdaftar, pending/ditolak/Completed,
  titik null tanpa centroid, versi lama, konfirmasi unggah dan konflik versi aktif,
  whitelist publik, cluster, migrasi v4, dua jawaban dengan lineage/titik berbeda,
  serta jawaban Sesuai tidak menghasilkan temuan palsu.
- Browser lokal port 3004: kirim laporan bertitik → belum tampil publik → terima
  dengan severity/priority → titik/detail tampil publik. Nama/kontak/bukti pelapor
  tidak disertakan pada ringkasan peta.
- Browser: batal penggantian tidak mengubah versi; unggah bitmap contoh →
  pratinjau → checkbox → versi 2; muat ulang tetap memuat aset dari IndexedDB.
  Titik lama hilang dari versi aktif baru tetapi kembali pada versi asal.
- Browser: draft lapor-cepat bertitik versi lama dikunci, tidak diam-diam dipindah;
  titik per jawaban mandiri independen dan tetap tersimpan setelah muat ulang.
- Browser: general tanpa gambar meminta pilih pesantren; pesantren tanpa denah
  tetap memiliki daftar temuan tanpa titik; filter kosong menyediakan reset;
  versi historis, detail pin/cluster dan pembesaran denah dapat dibuka.
- Responsif: override desktop 1440×900, tablet 834×1112, ponsel 390×844;
  lebar efektif DOM pada lingkungan browser masing-masing 1309/758/355 piksel.
  Dashboard/peta tidak meluber. Form tambah lantai diperbaiki agar tidak meluber
  pada ponsel; dialog penggantian fokus awal Batal dan dapat dibatalkan.
- Log error browser pada alur yang diperiksa: kosong. Build masih memberikan
  peringatan future flags React Router yang sudah ada; bukan kegagalan build.

## Batas review

- Bukan backend: unggahan hanya pada origin/perangkat browser yang sama; pindah
  perangkat tidak membawa blob. Tidak ada autentikasi/otorisasi server produksi.
- Belum ada reproyeksi otomatis/migrasi manual titik, denah per lantai atau peta
  geografis. Periode historis belum menyaring peta; UI menjelaskan batas tersebut.
- Titik opsional dan aturan pemicu temuan masih asumsi prototipe (D-14.b).
- Reset metadata+aset diimplementasikan; reset penghapusan melalui UI tidak
  dijalankan pada sesi ini. Uji otomatis memakai reset metadata seed.
- Kirim mandiri multi-jawaban diverifikasi di unit; browser memeriksa picker,
  perpindahan pertanyaan dan persistensi draft, bukan pengisian seluruh instrumen.
- Data uji lokal pada port 3004 dibiarkan untuk review. Aplikasi pada port 3003
  tidak direset; tidak ada commit, push, atau publikasi.
