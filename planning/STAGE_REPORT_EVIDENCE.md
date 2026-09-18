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
