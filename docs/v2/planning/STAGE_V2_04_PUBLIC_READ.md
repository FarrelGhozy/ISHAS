# Stage V2-04 — Halaman Baca Publik

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-02, D-04 dan D-08
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01 + V2-02 `DONE` (agregat + selector + filter pesantren).
**Tujuan:** lima halaman baca + deep-link lembaga, semuanya steril dari data belum divalidasi
dan konsisten satu sama lain untuk filter yang sama.

## Ruang lingkup (satu checklist per halaman)

### 1. `/hasil` — Hasil assessment

- [ ] Filter pesantren (mengikuti pilihan `/`) + pemilih periode/hasil penilaian yang `Diterima`; kebijakan beberapa hasil per periode menunggu D-04.
- [ ] Skor total + kategori ilustratif + status `Diterima` + versi instrumen + per dimensi + perbandingan periode yang dapat dibandingkan. Lapor cepat tidak mempunyai skor instrumen.
- [ ] Sumber tiap angka menunjuk `reportId` + pelapor + validator (bukan asesor).

### 2. `/peta-risiko` — Peta bahaya & risiko

- [ ] Tiga tampilan: Daftar Area (default, selalu tersedia) + Denah Bangunan (marker bernomor bila denah ada)
  + Daftar Temuan; filter pesantren/gedung/lantai/severity/status.
- [ ] Detail temuan: bahaya, dampak, kemungkinan, keparahan, paparan, pengendalian, residual risk,
  sumber assessment/indikator/bukti/versi denah; tombol ke rekomendasi/tindak lanjut terkait.
- [ ] Area tanpa temuan aktif tampil netral (bukan marker hijau).

### 3. `/rekomendasi` — Rekomendasi

- [ ] Filter prioritas/status + sumber `IND-XXX · RPT-XXXX` + PIC + tenggat + progres.
- [ ] Tombol kelola hanya bila login pengelola pemilik scope; publik mode baca + ajakan masuk.

### 4. `/tindak-lanjut` (baca publik) — Progres + bukti penyelesaian; kelola penuh di V2-07.

- [ ] Bedakan `Berjalan`/`Menunggu verifikasi`/`Terverifikasi`; publik tidak bisa mengubah.

### 5. `/laporan` — Laporan pimpinan

- [ ] Ringkasan + dimensi + status tindak lanjut + metadata (periode, versi, waktu, pembuat) +
  simulasi unduh PDF/Excel berlabel dummy.

### 6. `/pesantren/[kode]` — Deep-link lembaga

- [ ] Sama seperti `/` dengan filter terkunci ke `[kode]`; kode tak dikenal → empty state
  `Pesantren tidak ditemukan.` (bukan crash/404 teknis).

## Aturan konsistensi (wajib)

- [ ] Semua halaman membaca selector validated yang SAMA; filter identik → angka identik.
- [ ] Tidak ada halaman yang membaca antrean `Menunggu validasi`/`Ditolak` (kecuali count netral di `/`).

## Acceptance criteria

- [ ] TEST_PLAN §1 baris 5–7 + §3 nomor 7 lulus; visual 3 viewport; keyboard; copy persis WIREFRAMES §5.
- [ ] Lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
