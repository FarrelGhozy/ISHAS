# TODO — Kontrol Kerja Aktif

Cakupan aktif: validasi dan penyempurnaan rencana, hanya di `docs/`, tanpa kode.
Keputusan produk dicatat di `DECISIONS.md`; calon pembangunan di `planning/` belum diaktifkan.

## Stage 00 — Validasi dan perbaikan rencana — `IN PROGRESS`

- [x] Baca seluruh dokumen dan bandingkan dengan keputusan evaluasi dosen September 2026, dokumen sumber, serta acuan lama yang relevan.
- [x] Catat konflik, kekurangan, dan batas pemeriksaan dalam `VALIDATION_REVIEW.md`.
- [x] Tambahkan daftar keputusan terbuka dan rincian kebutuhan data yang belum tertampung.
- [x] Koreksi fase kerja: Stage 01 kembali `BACKLOG`; tidak ada pekerjaan kode aktif.
- [x] Dapatkan jawaban pemilik untuk cara pembangunan, batas data publik, dan hak melapor (D-01–D-03) — dijawab 8 September 2026: aplikasi ISHAS (React Router, folder per fitur, bun 1.4); publik ringkasan saja + nama validator/PIC; kirim hanya publik + pengelola.
- [ ] Bahas keputusan lanjutan D-04–D-12 sebelum spesifikasi terkait dinyatakan siap.
- [x] Sinkronkan semua dokumen yang terdampak setelah keputusan diberikan (README, ROUTES, ROLES, FLOWS, DATA_MODEL, DATA_REQUIREMENTS §6, WIREFRAMES, BACKLOG, TEST_PLAN, planning/README, stage Stage 01–Stage 09).
- [x] Verifikasi 11 tautan file, konsistensi status, dan 188 file proyek di luar `docs/` tetap sama dengan kondisi sebelum pemeriksaan.
- [x] Rapihkan konsistensi kecil lintas dokumen (8 September 2026): pemetaan Tahap A–E ↔ stage Stage 01–09 di BACKLOG, kalimat uji Stage 09 diselaraskan dengan TEST_PLAN (27 pola kanonis), penjelasan `Dihapus` pada enum HandlingStatus, penanda D-03 pada hak lapor Peneliti di ROLES §4, catatan field field lama (tidak dipakai sebagai status resmi) pada DATA_MODEL, usulan key sesi/draft di SUGGESTIONS §7.
- [ ] Ajukan hasil perbaikan rencana untuk review pemilik; jangan menandai rencana disetujui sendiri.

## Cara pakai

- Saat ini kerjakan Stage 00 saja. Urutan Stage 01 → Stage 09 adalah calon urutan implementasi setelah ada arahan pemilik untuk mulai kode.
- Centang `[x]` hanya setelah diverifikasi (lihat `TEST_PLAN.md`), bukan saat niat.
- Temuan baru ditulis sebagai sub-item baru, bukan menghapus item lama.

## Stage 01 — Fondasi aplikasi ISHAS (scaffold + data + login + `/` publik) — `REVIEW`

- [x] Scaffold ISHAS: React Router + bun 1.4 + TypeScript, folder per fitur (app/routes, features, shared, mocks).
- [x] Mock schema v4 + entitas `Report`/`SelfAssessmentDraft` + seed minimum (`DATA_MODEL.md` §5).
- [x] `resetMockData` mengembalikan seed yang konsisten.
- [x] Login 3 kartu (tanpa asesor) + sesi menunjuk ID akun + guard workspace + `/akses-ditolak`.
- [x] `/` merender dashboard publik tanpa redirect; sesi tidak mengubah isinya.
- [x] Grep `asesor` nihil di kode aktif; lint + typecheck + build lulus.

## Stage 02 — Shell publik + dashboard agregat — `REVIEW`

- [x] Shell publik ringan (header + penanda + tombol Masuk/Ruang kerja).
- [x] Pemilih pesantren (hanya terdaftar) + empty state nol pesantren.
- [x] Agregat + grafik + dimensi + temuan prioritas (tanpa panel count antrean — D-02; hanya data `Diterima`).
- [x] Cek 3 viewport tanpa overflow; lint + typecheck + build.
- [x] Aturan ilustrasi D-04 (usulan di `DECISIONS.md`) dipakai processor agregat; saat D-04 final, processor + label wajib ditinjau ulang (U-09).
- [x] Seed diperkaya untuk dashboard penuh: RPT-0007 penilaian mandiri `Diterima` PSN-0019 + temuan/rekomendasi turunan + `indexHistory` 6 periode ilustratif.
- [x] Perbaikan kecil lintas stage: chip `Data publik · ilustrasi` berikon `Info`; Keluar dipindah ke shell workspace; kelas `text-secondary` → `text-secondary-text` pada `EmptyState`.

## Stage 03 — Laporan cepat `/lapor` — `REVIEW` (diaktifkan + dikerjakan 8 September 2026)

- [x] Form satu langkah + validasi tiap field + error inline (`FLOWS.md` §2).
- [x] Kirim tanpa login + kirim saat login pengelola (nama otomatis; Super Admin/Peneliti kirim nonaktif — D-03) + layar sukses bernomor.
- [x] Laporan tidak tampil di dashboard; muncul di antrean pemilik scope + audit + notifikasi.
- [ ] Cek 3 viewport + keyboard di browser; lint + typecheck + build (lint/typecheck/test/build lulus; viewport/keyboard browser menyusul sebelum REVIEW).
- [ ] Ajukan hasil untuk review pemilik; interim D-11 (kunci kirim) + draft per pesantren menunggu D-10/D-11 final.

## Stage 04 — Halaman baca publik — `IN PROGRESS`

- [x] Bangun halaman hasil, peta risiko, rekomendasi, tindak lanjut, dan laporan dengan filter URL bersama.
- [x] Pastikan semua tampilan publik membaca data `Diterima` dan memenuhi matriks bidang publik D-02.
- [ ] Filter pesantren di tiap halaman; konsistensi lintas halaman untuk filter sama.
- [ ] Cek 3 viewport; lint + typecheck + build.

## Stage 05 — Antrean validasi — `REVIEW`

- [ ] `/pengelola/validasi-laporan`: filter + detail hanya-baca + Terima (wajib severity+priority) / Tolak (wajib alasan).
- [ ] Penolakan sistem bila syarat tak terpenuhi; laporan diterima tampil di dashboard.
- [ ] Scope isolation: pengelola hanya melihat miliknya.
- [ ] Cek 3 viewport + keyboard + dialog fokus; lint + typecheck + build.

## Stage 06 — Lifecycle + arsip completed — `REVIEW`

- [x] Transisi Pending→Proses→Completed + syarat tiap langkah + aturan mundur + arsip Completed + audit abadi.
- [x] Pemetaan status→warna/ikon/label persis `DESIGN_SYSTEM.md` §2.
- [x] Test store untuk tiap transisi sah dan tiap penolakan; lint + typecheck lulus.
- [ ] Pemeriksaan visual 3 viewport + build akhir.

## Stage 07 — Lokasi + tindak lanjut + laporan pengelola — `IN PROGRESS`

- [x] Gedung/lantai/area/denah (tambah + unggah versi); area baru muncul di dropdown lapor.
- [x] Rencana tindak lanjut (PIC/tenggat) + progres + bukti + verifikasi.
- [x] Laporan pimpinan scope sendiri + simulasi unduh berlabel dummy.
- [ ] Cek 3 viewport; lint + typecheck + build (lint, typecheck, test, dan build lulus; cek viewport menyusul).

## Stage 08 — Penilaian mandiri — `IN PROGRESS`

- [x] Salin-adaptasi alur tanpa penugasan + kunci versi Published + draft lokal + lanjutkan setelah refresh.
- [x] Tinjau kelengkapan + kirim untuk validasi (tidak ada jalur tampil langsung sebelum validasi).
- [ ] Hasil yang `Diterima` tampil dengan label kanal; cek 3 viewport; lint + typecheck + build.

## Stage 09 — Admin + sinkron dokumen + rilis REVIEW — `IN PROGRESS`

- [x] Tambah pesantren Persiapan + buat akun pengelola; tanpa opsi asesor.
- [ ] Uji penuh `TEST_PLAN.md` (lint, typecheck, test, build lulus; route/visual menyusul).
- [ ] Isi `Hasil Pemeriksaan` sesuai hasil nyata tiap stage. Stage `DONE` yang telah disetujui tidak diturunkan menjadi `REVIEW`; review integrasi dicatat di Stage 09.

## Menunggu keputusan (bukan tugas eksekusi)

- Skala severity/priority resmi (sementara `Tinggi/Sedang/Rendah`).
- Rumus indeks, bobot, ambang kategori, recommendation rule resmi.
- Halaman perkenalan `/perkenalan` di aplikasi ISHAS (menunggu keputusan).
- Rename `/pengelola` → `/pesantren`.
- D-04–D-12: arti hasil/agregat, temuan/status/riwayat, pesantren/akun, draft/versi, lokasi awal, tampilan.

## Review ulang frontend Stage 01–03 — 8 September 2026

- [x] Stage 01: perbaiki shell responsif/keyboard, sesi, serta kegagalan persistensi mock.
- [x] Stage 02: perbaiki keterbacaan, grafik sempit, konsistensi filter dan CTA.
- [x] Stage 03: perbaiki draft lintas pesantren/URL, batal, kirim ganda, error penyimpanan dan aksesibilitas.
- [x] Jalankan lint, typecheck, test, build, dan browser pada desktop/tablet/ponsel; 45 test dan 24 kelompok pemeriksaan browser lulus.

Arahan langsung pemilik di bagian ini mengatasi keterangan historis "tanpa kode" di atas.
