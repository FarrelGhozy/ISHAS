# Alur ISHAS

1. Publik atau Pengelola Pesantren mengirim laporan cepat atau penilaian mandiri.
2. Pengelola pada pesantren yang sama menerima atau menolak **laporan cepat**.
   Penilaian mandiri tidak divalidasi: kiriman langsung `Terbit` (D-32).
3. Kiriman lapor-cepat yang diterima menjadi `Pending`; rencana tindakan mengubahnya menjadi `Proses`.
4. Bukti dan verifikasi rekomendasi menutup tindak lanjut sebagai `Completed`.
5. Dashboard publik menampilkan data yang telah diterima (`Diterima`) atau terbit
   (`Terbit`) dan belum diarsipkan. Penilaian mandiri hanya menghasilkan skor +
   PDF, tanpa temuan/tindak lanjut.
