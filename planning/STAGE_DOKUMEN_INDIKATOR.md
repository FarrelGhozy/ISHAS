# Stage — Pustaka Detail Indikator (PDF Public/Privat) — `REVIEW`

Arahan pemilik 23 September 2026 (`ok kerjakan`): bangun fitur frontend-only
unggah berkas instrumen oleh Peneliti (satu PDF per indikator) yang tampil di
dashboard utama dan halaman publik baru, dengan visibilitas `Public/Privat`.
Keputusan: D-16 di `../docs/DECISIONS.md`. Backend menyusul; blob PDF di
IndexedDB perangkat, metadata di `localStorage` berversi + reset demo.

## Ruang lingkup (hanya ini)

1. Mocks: `InstrumentDoc` + schema v7 (`ishas-mock-v7`, migrasi v6→v7
   mempertahankan record/ID), adapter IndexedDB `ishas-instrument-docs-v1`,
   seed 4 contoh (2 Public + 2 Privat, berlabel ilustrasi), store actions
   (unggah/ganti, ubah visibilitas, hapus + audit), selector publik yang tidak
   menyajikan blob privat.
2. Peneliti: halaman tersendiri `Dokumen instrumen`
   (`/peneliti/dokumen-instrumen`, menu navbar workspace — D-16.e)
   berisi tabel per indikator `INS-v1.1`: search + filter kategori/status;
   unggah PDF ≤ 10 MB; Lihat tab baru; Unduh; Jadikan Public/Privat; Hapus).
   Independen dari versioning (tidak dikunci Published).
3. Publik: navbar umum + `/dokumen` (search + filter kategori/status +
   tabel/kartu; Public = Lihat tab baru + Unduh; Privat = nama + gembok tanpa
   tombol) + panel ringkas di `/` setelah rekap kategori + link ke `/dokumen`.
4. Tema tetap: token `DESIGN_SYSTEM.md`, `surface`, `primary/secondary/
   text-button`, `StatusChip` (`Public → status-green + CheckCircle2`,
   `Privat → status-neutral + Lock`), `EmptyState`, `Modal`, ikon Lucide
   existing. Bahasa Indonesia ringkas.

## Non-ruang lingkup

Backend/upload server, PDF/Excel nyata, viewer PDF custom, tabel custom
bebas, versioning dokumen ikut instrumen, perubahan skor/agregat/penilaian/
validasi, perubahan tema/warna, perubahan stage lain.

## Checklist penerimaan

- [ ] Peneliti dapat mengunggah PDF per indikator; non-PDF/>10 MB ditolak
      dengan pesan inline; default `Privat`.
- [ ] Ganti berkas memakai konfirmasi; hapus memakai konfirmasi + audit +
      blob terhapus.
- [ ] Publik: `Public` ada tombol `Lihat` (tab baru) + `Unduh`; `Privat`
      tanpa kedua tombol (hanya nama + status terkunci).
- [ ] Blob privat tidak dapat dibuka dari publik (cek visibilitas di adapter,
      bukan hanya sembunyikan tombol).
- [ ] `/dokumen` terdaftar di navbar publik desktop + menu ponsel; URL sumber
      kebenaran; guard publik `allowed` semua sesi.
- [ ] Panel `/` tidak memecah alur; responsif 1440/834/390 tanpa overflow;
      keyboard + fokus terlihat; label + ikon untuk status.
- [ ] Migrasi v6→v7 + reset demo kembali ke seed; lint + typecheck + test +
      build lulus.
- [ ] Review pemilik; `DONE` hanya setelah disetujui.

## Hasil Pemeriksaan

23 September 2026 (implementasi, menunggu review pemilik — status `REVIEW`):

- Lint (`oxlint`), typecheck (`tsc`), 115 test (`bun test`, 13 file, termasuk
  9 test baru D-16), dan build (`react-router build`) lulus. Dua test lama
  yang mengunci schema v6 disesuaikan ke v7.
- Browser headless (dev `:3003`): `/dokumen` 1440/834/390 render tanpa error;
  navbar `Dokumen` aktif marun; Public = tombol Lihat + Unduh; Privat =
  `Terkunci` tanpa tombol. Panel `/` terkonfirmasi di DOM setelah rekap
  kategori + tautan ke `/dokumen`. Tabel lebar di ponsel scroll di panel
  (pola `TabelRekap`), halaman tidak overflow.
- Alur peneliti (unggah/ganti/visibilitas/hapus + proteksi blob privat)
  tercakup test store/adapter/processor; uji klik manual di workspace
  peneliti + uji Lihat tab baru/unduh PDF menjadi bahan review pemilik.
- Batas asumsi prototipe: batas 10 MB, hapus permanen, seed PDF dibuat di
  browser — perlu persetujuan/finalisasi saat review.
- Revisi 23 September 2026 (D-16.e, atas arahan pemilik): kelola berkas pindah
  dari seksi `/peneliti/instrumen` ke menu tersendiri `Dokumen instrumen`
  (`/peneliti/dokumen-instrumen`). Route HTTP 200 + guard login terkonfirmasi;
  lint + typecheck + 115 test + build lulus.
