# Stage V2-09 — Admin + Sinkron Dokumen + Rilis REVIEW

**Status:** IN PROGRESS
**Catatan review:** belum diizinkan membuat kode tanpa arahan pemilik. D-01 dan D-02 telah dijawab
(8 September 2026): aplikasi terpisah — dokumen V1/root tidak disinkron, cukup dokumen proyek ISHAS.
Bagian terkait D-04, D-08 dan D-09 masih menunggu keputusan di `../DECISIONS.md`.
Checklist di bawah adalah rancangan awal; ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01…V2-08 `DONE`/`REVIEW` (tahap penutup).
**Tujuan:** melengkapi sisi Super Admin, menyinkronkan seluruh dokumen,
dan menjalankan uji rilis penuh sebelum meminta persetujuan.

## Ruang lingkup

### 1. Super Admin (`/admin/*`, login admin)

- [x] `pesantren`: tambah (`Persiapan`) + daftar status dan onboarding.
  (konfirmasi + penjelasan efek ke pemilih publik); detail (pengelola, akun, status assessment/onboarding).
- [x] `pengguna`: buat akun `Pengelola Pesantren` pada satu pesantren Aktif; email duplikat ditolak.
  email duplikat ditolak; TIDAK ADA opsi Asesor di dropdown/filter/fallback.
- [ ] Menambah pengelola pertama yang aktif → pesantren MUNCUL di pemilih publik (dibuktikan end-to-end);
  menonaktifkan pengelola terakhir → pesantren HILANG dari pemilih (arsip `Diterima` tetap tampil).
- [x] `hak-akses`: matriks 3 peran + publik.
- [x] `audit-log`: pencarian jejak kirim/terima/tolak/status/hapus V2.
- [ ] `pengaturan`: preferensi non-ilmiah + konfirmasi tindakan berisiko + reset data demo ke seed V2.

### 2. Peneliti — verifikasi fungsi dan hubungan data

- [ ] Pastikan tidak ada teks/dependensi asesor tersisa; Published aktif menjadi sumber V2-08
  (uji publikasi versi baru → self-assessment memakai snapshot baru tanpa merusak hasil lama).
- [ ] Verifikasi hasil V2 dan dataset mempunyai sumber kiriman yang konsisten, status sesuai V2,
  akses bidang sesuai D-02/D-04, serta simulasi import tidak melompati moderasi. Kontraknya
  harus sudah dibahas pada fondasi, bukan baru ditentukan saat rilis.

### 3. Dokumen proyek ISHAS (wajib sebelum REVIEW)

D-01 dijawab: aplikasi terpisah — dokumen root/FRONTEND_RULES V1 tidak disentuh. Yang ditulis/dipbarui
adalah dokumen milik proyek ISHAS yang baru.

- [x] `README` proyek ISHAS: `/` = dashboard publik; akun demo 3 peran; tanpa landing/asesor.
- [x] Dokumen alur ringkas proyek ISHAS: lapor + validasi + lifecycle V2 (pengganti `flow.md` V1).
- [ ] `TODO`/planning proyek ISHAS: status akhir stage V2.

### 4. Uji rilis penuh (EXEKSI TEST_PLAN utuh)

- [ ] Matriks route 12 baris + guard/sesi + 8 skenario E2E + visual 3 viewport + keyboard.
- [ ] Lint + typecheck + test + build hijau; grep kebersihan (asesor/assignment/empat peran) nihil.
- [ ] Catat hasil aktual tiap stage dan pemeriksaan integrasi di V2-09; hanya stage yang baru selesai diperiksa dipindahkan ke `REVIEW`. Stage yang sudah disetujui `DONE` tetap `DONE`.

## Acceptance criteria

- [ ] Seluruh acceptance V2-01…V2-08 tetap hijau setelah integrasi penuh (tidak ada regresi tahap akhir).
- [ ] Dokumen proyek ISHAS konsisten dengan implementasi (tidak ada kontradiksi peran/route/status); V1 tetap utuh.
- [ ] Paket REVIEW lengkap: 9 stage terisi hasil + `TODO.md` V2 sinkron.

## Hasil Pemeriksaan

- 9 September 2026: lint, typecheck, 52 test, build, dan pemeriksaan whitespace lulus.
