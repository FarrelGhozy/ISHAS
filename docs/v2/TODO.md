# TODO V2 — Kontrol Kerja Aktif

Cakupan aktif: validasi dan penyempurnaan rencana, hanya di `docs/v2/`, tanpa kode.
Keputusan produk dicatat di `DECISIONS.md`; calon pembangunan di `planning/` belum diaktifkan.

## V2-00 — Validasi dan perbaikan rencana — `IN PROGRESS`

- [x] Baca seluruh dokumen V2 dan bandingkan dengan Stage 12, blueprint tertulis, serta acuan V1 yang relevan.
- [x] Catat konflik, kekurangan, dan batas pemeriksaan dalam `VALIDATION_REVIEW.md`.
- [x] Tambahkan daftar keputusan terbuka dan rincian kebutuhan data yang belum tertampung.
- [x] Koreksi fase kerja: V2-01 kembali `BACKLOG`; tidak ada pekerjaan kode aktif.
- [ ] Dapatkan jawaban pemilik untuk cara pembangunan, batas data publik, dan hak melapor (D-01–D-03).
- [ ] Bahas keputusan lanjutan D-04–D-12 sebelum spesifikasi terkait dinyatakan siap.
- [ ] Sinkronkan semua dokumen yang terdampak setelah keputusan diberikan.
- [x] Verifikasi 11 tautan file, konsistensi status, dan 188 file proyek di luar `docs/v2/` tetap sama dengan kondisi sebelum pemeriksaan.
- [ ] Ajukan hasil perbaikan rencana untuk review pemilik; jangan menandai rencana disetujui sendiri.

## Cara pakai

- Saat ini kerjakan V2-00 saja. Urutan V2-01 → V2-09 adalah calon urutan implementasi setelah ada arahan pemilik untuk mulai kode.
- Centang `[x]` hanya setelah diverifikasi (lihat `TEST_PLAN.md`), bukan saat niat.
- Temuan baru ditulis sebagai sub-item baru, bukan menghapus item lama.

## V2-01 — Fondasi data + hapus asesor + arsip landing — `BACKLOG`

- [ ] Mock schema v4 + entitas `Report`/`SelfAssessmentDraft` + seed minimum (`DATA_MODEL.md` §5).
- [ ] `resetMockData` mengembalikan seed V2 yang konsisten.
- [ ] Asesor dihapus dari akun, navigasi, login, guard; `/asesor/*` menampilkan pesan khusus.
- [ ] Landing diarsip; `/` merender dashboard publik tanpa redirect.
- [ ] Grep `asesor` bersih dari impor aktif; lint + typecheck + build lulus.

## V2-02 — Shell publik + dashboard agregat — `BACKLOG`

- [ ] Shell publik ringan (header + penanda + tombol Masuk/Ruang kerja).
- [ ] Pemilih pesantren (hanya terdaftar) + empty state nol pesantren.
- [ ] Agregat + grafik + dimensi + temuan prioritas + panel antrean netral (hanya data `Diterima`).
- [ ] Cek 3 viewport tanpa overflow; lint + typecheck + build.

## V2-03 — Laporan cepat `/lapor` — `BACKLOG`

- [ ] Form satu langkah + validasi tiap field + error inline (`FLOWS.md` §2).
- [ ] Kirim anonim + kirim saat login (nama otomatis) + layar sukses bernomor.
- [ ] Laporan tidak tampil di dashboard; muncul di antrean pemilik scope + audit + notifikasi.
- [ ] Cek 3 viewport + keyboard; lint + typecheck + build.

## V2-04 — Halaman baca publik — `BACKLOG`

- [ ] `/hasil`, `/peta-risiko`, `/rekomendasi`, `/tindak-lanjut` (baca), `/laporan`, `/pesantren/[kode]`.
- [ ] Filter pesantren di tiap halaman; konsistensi lintas halaman untuk filter sama.
- [ ] Hanya data `Diterima`; area tanpa temuan tampil netral.
- [ ] Cek 3 viewport; lint + typecheck + build.

## V2-05 — Antrean validasi — `BACKLOG`

- [ ] `/pengelola/validasi-laporan`: filter + detail hanya-baca + Terima (wajib severity+priority) / Tolak (wajib alasan).
- [ ] Penolakan sistem bila syarat tak terpenuhi; laporan diterima tampil di dashboard.
- [ ] Scope isolation: pengelola hanya melihat miliknya.
- [ ] Cek 3 viewport + keyboard + dialog fokus; lint + typecheck + build.

## V2-06 — Lifecycle + hapus completed — `BACKLOG`

- [ ] Transisi Pending→Proses→Completed + syarat tiap langkah + aturan mundur + hapus Completed + audit abadi.
- [ ] Pemetaan status→warna/ikon/label persis `DESIGN_SYSTEM.md` §2.
- [ ] Test store untuk tiap transisi sah dan tiap penolakan; lint + typecheck + build.

## V2-07 — Lokasi + tindak lanjut + laporan pengelola — `BACKLOG`

- [ ] Gedung/lantai/area/denah (tambah + unggah versi); area baru muncul di dropdown lapor.
- [ ] Rencana tindak lanjut (PIC/tenggat) + progres + bukti + verifikasi.
- [ ] Laporan pimpinan scope sendiri + simulasi unduh berlabel dummy.
- [ ] Cek 3 viewport; lint + typecheck + build.

## V2-08 — Penilaian mandiri — `BACKLOG`

- [ ] Pindahan `AssessmentFlow` tanpa penugasan + kunci versi Published + draft lokal + lanjutkan setelah refresh.
- [ ] Tinjau 4 kelompok + kirim untuk validasi (tanpa finalisasi langsung).
- [ ] Hasil yang `Diterima` tampil dengan label kanal; cek 3 viewport; lint + typecheck + build.

## V2-09 — Admin + sinkron dokumen + rilis REVIEW — `BACKLOG`

- [ ] Verifikasi pesantren + buat akun pengelola → pemilih publik bertambah; tanpa opsi asesor.
- [ ] Bila kelak pembangunan diizinkan, tinjau kebutuhan sinkronisasi dokumen di luar V2 sesuai D-01. Pada sesi sekarang hanya catat dampaknya; jangan mengubah file tersebut.
- [ ] Uji penuh `TEST_PLAN.md` (27+ route, guard 4 kondisi, visual 3 viewport, lint, typecheck, test, build).
- [ ] Isi `Hasil Pemeriksaan` sesuai hasil nyata tiap stage. Stage `DONE` yang telah disetujui tidak diturunkan menjadi `REVIEW`; review integrasi dicatat di V2-09.

## Menunggu keputusan (bukan tugas eksekusi)

- Skala severity/priority resmi (sementara `Tinggi/Sedang/Rendah` mengikuti V1).
- Rumus indeks, bobot, ambang kategori, recommendation rule resmi.
- Nasib permanen landing page; rename `/pengelola` → `/pesantren`.
