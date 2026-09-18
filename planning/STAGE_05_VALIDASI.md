# Stage Stage 05 — Antrean Validasi Pengelola

**Pembaruan 18 September 2026:** frontend telah diimplementasikan; catatan izin/
keputusan terbuka pada rancangan awal di bawah bersifat historis. D-06/D-07/D-08/
D-10/D-11 yang terjawab pada 9 September serta D-14/D-15 dibaca dari DECISIONS.md.
Status REVIEW tidak berarti DONE atau seluruh pemeriksaan terbaru sudah lengkap.
Revisi dashboard saat ini dicatat terpisah pada STAGE_DASHBOARD_POLISH.md;
checklist yang belum diverifikasi tetap terbuka.


**Status:** REVIEW
**Acuan terkini:** D-02 menjaga bidang publik; D-06 mengizinkan moderasi laporan
sendiri dengan audit; D-14.b menjaga lineage temuan per jawaban; D-15 menetapkan
kategori/aspek dan Ekstrem untuk level risiko. Severity/priority tetap wajib
pengelola, tanpa default. Pemeriksaan browser penuh stage ini masih terbuka.
**Dependensi:** Stage 03 tersedia (ada laporan masuk antrean).
**Tujuan:** satu-satunya pintu masuk data ke dashboard: pengelola memeriksa lalu Terima
(wajib severity+priority) atau Tolak (wajib alasan) — dengan scope isolation ketat.

## Ruang lingkup

### 1. Halaman `/pengelola/validasi-laporan` (login pengelola, guard scope)

- [x] Header: kicker `Moderasi` + H1 `Validasi laporan` + `Hanya laporan milik [nama pesantren].`
- [x] Filter status (`Menunggu validasi/Pending/Proses/Completed/Ditolak/Semua`) + pencarian teks.
 (`lapor-cepat/penilaian-mandiri`) + severity + pencarian teks (nomor/judul/pelapor).
- [x] Baris antrean: nomor + chip kanal + pelapor (nama apa adanya, tanpa opsi anonim — D-02) + judul + waktu + chip status +
 tombol **Periksa**; urutan terbaru dulu.
- [x] Scope isolation: query selector SELALU memfilter `institutionCode` milik akun; dilarang mengandalkan
 sembunyi-menu saja (dibuktikan test skenario 6).

### 2. Detail + keputusan (isi hanya-baca; yang bisa diubah hanya field keputusan)

- [x] Detail internal: pelapor, lokasi/area, judul, deskripsi, bukti, waktu.
 versi instrumen; untuk penilaian mandiri: jawaban per indikator (hanya-baca).
- [x] Panel Terima: dropdown `Tingkat keparahan`* + `Prioritas perbaikan`* (TANPA default —
 placeholder `Pilih…`) + catatan validasi (opsional) + tombol konfirmasi.
 → `Diterima`/`Pending` + `validatedBy/At` + tampil di dashboard + hasil ilustratif/temuan
 (penilaian mandiri) + audit `Memvalidasi laporan` + notifikasi.
- [x] Panel Tolak: textarea alasan* (min 10, counter karakter) + konfirmasi.
 → `Ditolak` + arsip (filter `Ditolak`) + audit `Menolak laporan`; tidak tampil publik.
- [x] Penolakan sistem: Terima tanpa severity/priority DITOLAK dengan pesan per field;
 Tolak tanpa alasan DITOLAK. Tombol dikunci saat memproses (anti double-submit).
- [ ] Larangan: tidak ada input yang mengubah deskripsi/bukti/jawaban pelapor di halaman ini.

### 3. Dialog dan aksesibilitas

- [x] Dialog Terima/Tolak menjebak fokus; Esc membatalkan; tombol utama `primary-button`,
 tombol mundur/batal `secondary-button`; ikon+label status persis DESIGN_SYSTEM §2.

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 3, 4, 6 lulus (terima/tolak/scope).
- [ ] Copy persis WIREFRAMES §4; guard persis ROUTES §3 (anonim → login, peran salah → ditolak).
- [ ] Visual 3 viewport + keyboard + TEST_PLAN §1 baris 11; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- 8 September 2026: dialog moderasi, validasi field, dan isolasi scope di UI/store dibangun.
 Lint/typecheck dan test store scope lulus. Keputusan D-05/D-06 tentang relasi banyak temuan
 dan pemeriksa kedua tetap belum mengubah perilaku demonstrasi ini.
