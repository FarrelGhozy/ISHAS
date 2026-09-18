# Revisi bukti gambar Pelaporan — 18 September 2026

Status: IN PROGRESS. Arahan pemilik: tambahkan upload gambar sebagai bukti pelaporan.
Revisi terbatas `/lapor` dan tampilan bukti internal, tanpa backend/publikasi.

- [ ] Unggah satu gambar opsional, pratinjau, ganti/lepas lampiran, validasi tipe/ukuran/dekode.
- [ ] Simpan blob di IndexedDB dan ID stabil pada draft/laporan; refresh tetap tersedia.
- [ ] Pengelola pemilik scope membaca gambar saat validasi; bukti tidak tampil publik.
- [ ] Kegagalan penyimpanan tidak membuang isian; reset demo membersihkan aset bukti.
- [ ] Pemeriksaan kode, test, build dan alur browser responsif.

Asumsi prototipe: satu PNG/JPEG/WebP, maksimum 5 MB. Penyimpanan hanya perangkat/origin sama.
DONE hanya setelah review/persetujuan pemilik.

## Pembaruan pemeriksaan — 18 September 2026

Kode unggah/pratinjau dan adapter aset sudah tersedia. Enam test report-evidence
lulus dalam suite 106 test: tipe/ukuran, alur upload→draft→kirim→validasi,
referensi hilang/lintas scope, gambar rusak, kegagalan simpan, dan reset. Lint,
typecheck, build seluruh aplikasi lulus. Checklist visual unggah, refresh nyata,
ganti/lepas dan pemeriksaan pengelola di browser belum diverifikasi ulang pada
sesi dashboard ini; status tetap IN PROGRESS, bukan DONE.
