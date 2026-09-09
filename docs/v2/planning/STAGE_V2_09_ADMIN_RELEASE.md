# Stage V2-09 — Admin + Sinkron Dokumen + Rilis REVIEW

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-01, D-02, D-04, D-08 dan D-09
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01…V2-08 `DONE`/`REVIEW` (tahap penutup).
**Tujuan:** melengkapi sisi Super Admin, menyinkronkan seluruh dokumen,
dan menjalankan uji rilis penuh sebelum meminta persetujuan.

## Ruang lingkup

### 1. Super Admin (`/admin/*`, login admin)

- [ ] `pesantren`: tambah (`Persiapan`) + verifikasi eksplisit `→ Aktif` + nonaktifkan `→ Nonaktif`
  (konfirmasi + penjelasan efek ke pemilih publik); detail (pengelola, akun, status assessment/onboarding).
- [ ] `pengguna`: buat akun `Pengelola Pesantren` (tepat satu pesantren Aktif*) + nonaktifkan;
  email duplikat ditolak; TIDAK ADA opsi Asesor di dropdown/filter/fallback.
- [ ] Menambah pengelola pertama yang aktif → pesantren MUNCUL di pemilih publik (dibuktikan end-to-end);
  menonaktifkan pengelola terakhir → pesantren HILANG dari pemilih (arsip `Diterima` tetap tampil).
- [ ] `hak-akses`: matriks 3 peran + publik (baca; backend menegakkan nyata).
- [ ] `audit-log`: filter kategori + pencarian; memuat jejak kirim/terima/tolak/status/hapus V2.
- [ ] `pengaturan`: preferensi non-ilmiah + konfirmasi tindakan berisiko + reset data demo ke seed V2.

### 2. Peneliti — verifikasi fungsi dan hubungan data

- [ ] Pastikan tidak ada teks/dependensi asesor tersisa; Published aktif menjadi sumber V2-08
  (uji publikasi versi baru → self-assessment memakai snapshot baru tanpa merusak hasil lama).
- [ ] Verifikasi hasil V2 dan dataset mempunyai sumber kiriman yang konsisten, status sesuai V2,
  akses bidang sesuai D-02/D-04, serta simulasi import tidak melompati moderasi. Kontraknya
  harus sudah dibahas pada fondasi, bukan baru ditentukan saat rilis.

### 3. Sinkron dokumen (wajib sebelum REVIEW)

Bagian ini adalah inventaris dampak untuk pembangunan mendatang sesuai D-01. **Tidak diizinkan
pada sesi diskusi sekarang**; file di luar `docs/v2/` tetap tidak diubah. Jika proyek terpisah
dipilih, tentukan dokumen aplikasi mana yang harus disinkronkan sebelum menjalankan checklist ini.

- [ ] Root `flow.md`: hapus alur penugasan/asesor; tulis alur lapor + validasi + lifecycle V2.
- [ ] Root `README.md`: `/` = dashboard publik; akun demo 3 peran; tanpa landing/asesor.
- [ ] Root `TODO.md` + `planning/README.md`: status akhir stage V2.
- [ ] `docs/FRONTEND_RULES.md`: tiga peran + publik; moderasi wajib; status ganda.

### 4. Uji rilis penuh (EXEKSI TEST_PLAN utuh)

- [ ] Matriks route 12 baris + guard/sesi + 8 skenario E2E + visual 3 viewport + keyboard.
- [ ] Lint + typecheck + test + build hijau; grep kebersihan (asesor/assignment/empat peran) nihil.
- [ ] Catat hasil aktual tiap stage dan pemeriksaan integrasi di V2-09; hanya stage yang baru selesai diperiksa dipindahkan ke `REVIEW`. Stage yang sudah disetujui `DONE` tetap `DONE`.

## Acceptance criteria

- [ ] Seluruh acceptance V2-01…V2-08 tetap hijau setelah integrasi penuh (tidak ada regresi tahap akhir).
- [ ] Dokumen root + `docs/FRONTEND_RULES.md` konsisten dengan V2 (tidak ada kontradiksi peran/route/status).
- [ ] Paket REVIEW lengkap: 9 stage terisi hasil + `TODO.md` V2 sinkron.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6 — ditempel di sini + ringkasan lintas stage.)
