# Stage V2-05 — Antrean Validasi Pengelola

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-02, D-05 dan D-06
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-03 `DONE` (ada laporan masuk antrean).
**Tujuan:** satu-satunya pintu masuk data ke dashboard: pengelola memeriksa lalu Terima
(wajib severity+priority) atau Tolak (wajib alasan) — dengan scope isolation ketat.

## Ruang lingkup

### 1. Halaman `/pengelola/validasi-laporan` (login pengelola, guard scope)

- [ ] Header: kicker `Moderasi` + H1 `Validasi laporan` + `Hanya laporan milik [nama pesantren].`
- [ ] Filter: status (`Menunggu validasi/Pending/Proses/Completed/Ditolak/Semua`) + kanal
  (`lapor-cepat/penilaian-mandiri`) + severity + pencarian teks (nomor/judul/pelapor).
- [ ] Baris antrean: nomor + chip kanal + pelapor (+`Anonim`) + judul + lokasi + waktu + chip status +
  tombol **Periksa**; urutan terbaru dulu.
- [ ] Scope isolation: query selector SELALU memfilter `institutionCode` milik akun; dilarang mengandalkan
  sembunyi-menu saja (dibuktikan test skenario 6).

### 2. Detail + keputusan (isi hanya-baca; yang bisa diubah hanya field keputusan)

- [ ] Detail: pelapor, pesantren, lokasi/area (+ titik denah), judul, deskripsi, bukti, waktu,
  versi instrumen; untuk penilaian mandiri: jawaban per indikator (hanya-baca).
- [ ] Panel Terima: dropdown `Tingkat keparahan`* + `Prioritas perbaikan`* (TANPA default —
  placeholder `Pilih…`) + catatan validasi (opsional) + tombol konfirmasi.
  → `Diterima`/`Pending` + `validatedBy/At` + tampil di dashboard + hasil ilustratif/temuan
  (penilaian mandiri) + audit `Memvalidasi laporan` + notifikasi.
- [ ] Panel Tolak: textarea alasan* (min 10, counter karakter) + konfirmasi.
  → `Ditolak` + arsip (filter `Ditolak`) + audit `Menolak laporan`; tidak tampil publik.
- [ ] Penolakan sistem: Terima tanpa severity/priority DITOLAK dengan pesan per field;
  Tolak tanpa alasan DITOLAK. Tombol dikunci saat memproses (anti double-submit).
- [ ] Larangan: tidak ada input yang mengubah deskripsi/bukti/jawaban pelapor di halaman ini.

### 3. Dialog dan aksesibilitas

- [ ] Dialog Terima/Tolak menjebak fokus; Esc membatalkan; tombol utama `primary-button`,
  tombol mundur/batal `secondary-button`; ikon+label status persis DESIGN_SYSTEM §2.

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 3, 4, 6 lulus (terima/tolak/scope).
- [ ] Copy persis WIREFRAMES §4; guard persis ROUTES §3 (anonim → login, peran salah → ditolak).
- [ ] Visual 3 viewport + keyboard + TEST_PLAN §1 baris 11; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
