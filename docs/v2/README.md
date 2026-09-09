# ISHAS V2 — Dokumentasi Proyek Baru (Frontend-Only)

**Status saat ini: DISKUSI DAN VALIDASI RENCANA — belum pembangunan kode.**

V2 direncanakan sebagai perubahan besar berdasarkan evaluasi dosen (September 2026).
Permintaan pemilik pada 8 September 2026 hanya mengizinkan validasi dan penyempurnaan
dokumen di `docs/v2/`. Aplikasi sekarang dan dokumen di luar folder ini tidak diubah.
Cara pembangunan ulang masih perlu dikonfirmasi; tabel migrasi belum menjadi perintah eksekusi.
Saat nanti disetujui untuk dibangun, tahap frontend memakai data dummy.
Backend, rumus ilmiah final, upload file nyata, dan PDF/Excel nyata belum termasuk.

## Cara membaca hasil validasi

1. Baca [hasil pemeriksaan](VALIDATION_REVIEW.md) untuk melihat kekurangan dan konflik yang ditemukan.
2. Jawab [keputusan terbuka](DECISIONS.md); pertanyaan pertama membahas cara pembangunan, keterbukaan data, dan hak melapor.
3. Tinjau [kebutuhan data tambahan](DATA_REQUIREMENTS.md) sebelum memfinalkan model data dan alur.
4. Stage aktif adalah [V2-00 — Validasi rencana](planning/STAGE_V2_00_PLAN_REVIEW.md). V2-01–V2-09 tetap `BACKLOG`.

Keterangan status isi dokumen:

- **Arahan tercatat**: arah yang sudah tertulis pada Stage 12; sumbernya dapat ditelusuri, bukan persetujuan baru pada sesi ini.
- **Koreksi konsistensi**: perbaikan istilah, rujukan, dan aturan yang saling bertentangan tanpa menambah kewenangan atau fitur baru.
- **Usulan / menunggu keputusan**: belum boleh dipakai sebagai ketentuan final. Jika memengaruhi pekerjaan, tanyakan dahulu dan tunggu jawaban.

Frasa “wajib”, “persis”, dan checklist teknis pada rancangan lama berlaku sebagai calon spesifikasi,
bukan izin mulai membuat kode. Konflik yang tercatat di `DECISIONS.md` tetap terbuka sampai dijawab.
Sumber ilmiah tetap `../source/`; blueprint lama merupakan acuan dengan konteks V1.
Perubahan arah produk V2 tidak mengesahkan rumus, skala, atau kategori ilmiah.

## Perubahan arah utama (arahan tercatat; rincian terbuka ditandai)

1. Landing page **dinonaktifkan sementara, bukan dihapus**. `/` langsung menjadi dashboard pesantren publik. Kode landing diarsip di `features/_archived-landing/` dan dapat dihidupkan kembali sebagai `/perkenalan` (lihat `MIGRATION_FROM_V1.md`).
2. Peran **Asesor dihapus dari kemampuan operasional produk V2**. Tidak ada akun, menu, hak akses, atau data penugasan untuk peran itu. URL lama hanya mempunyai penanganan penghentian, bukan workspace aktif. Penggantinya dalam arahan tercatat adalah **penilaian mandiri (self-assessment)**: publik tanpa login dapat mengisi indikator instrumen Published untuk pesantren terdaftar; rincian kewenangannya masih dibahas pada D-03.
3. Dashboard pesantren bersifat **publik tanpa login**: menampilkan **agregat semua pesantren terdaftar** (bukan satu pesantren hard-code) plus **pemilih pesantren** untuk memfilter ke satu lembaga.
4. `/login` hanya untuk **tiga peran**: Super Admin, Peneliti, Pengelola Pesantren. Demo asesor tidak ada.
5. **Semua laporan — baik dari pelapor anonim maupun yang login — wajib validasi pengelola** sebelum tampil di dashboard. Tidak ada jalur pintas tampil langsung.
6. **Nama pelapor selalu dicatat** pada setiap laporan. Jika pelapor login sebagai pengelola, field nama terisi otomatis dari akun dan tetap dapat diubah manual per laporan. Hak melapor saat login sebagai Super Admin/Peneliti masih bertentangan dengan matriks peran; lihat **D-03** di `DECISIONS.md`. Mencatat nama secara internal tidak otomatis berarti menampilkannya ke publik (**D-02**).

## Istilah baku (wajib dipakai persis di UI dan dokumen)

- **Super Admin** — admin sistem; mengelola pesantren dan akun pengelola. (Bukan "Admin" saja agar tidak tertukar dengan pengelola pondok.)
- **Pengelola Pesantren (mitra)** — admin lokal pondok; validasi laporan, menentukan severity/priority, mengelola status penanganan, lokasi, dan tindak lanjut. Label singkat di UI: `Pengelola Pesantren`.
- **Peneliti** — pengelola instrumen dan konfigurasi penilaian. Tidak berubah dari V1.
- **Publik / Pelapor** — pengguna tanpa login; melihat dashboard dan melapor dengan mengisi nama. Bukan sebuah "role login".
- **Tanpa login** menjelaskan keadaan sesi. **Tampil anonim** menjelaskan penyamaran nama pada tampilan. Keduanya berbeda; opsi penyamaran dan bidang publik masih dibahas pada **D-02**.
- **Pesantren terdaftar** — pesantren berstatus `Aktif` DAN memiliki minimal satu akun pengelola aktif. Hanya pesantren terdaftar yang muncul di pemilih publik dan dapat dilaporkan. Definisi ini menggantikan anggapan "semua data di tabel institutions".
- **Laporan** — satu kiriman dari pelapor, terdiri dari dua kanal: `lapor-cepat` (form ringan) dan `penilaian-mandiri` (instrumen penuh). Keduanya memakai lifecycle status yang sama.
- **Tervalidasi / tampil di dashboard** — artinya `validationStatus: Diterima`. Laporan `Menunggu validasi` atau `Ditolak` tidak pernah tampil di dashboard, hasil, peta, rekomendasi, maupun laporan pimpinan.

## Isi folder

| File | Isi |
|---|---|
| `ROLES.md` | Definisi tiap peran + akun demo persis + daftar boleh/tidak + aturan sesi + edge case |
| `VALIDATION_REVIEW.md` | Hasil audit rencana, bukti konflik, koreksi, dan keterbatasan pemeriksaan |
| `DECISIONS.md` | Arahan yang terkonfirmasi dan pertanyaan produk yang menunggu jawaban |
| `DATA_REQUIREMENTS.md` | Kelengkapan data, hubungan, jejak historis, dan skenario batas yang belum tertampung dalam skema awal |
| `ROUTES.md` | Tabel route lengkap + matriks guard per peran + redirect + deep-link + query param |
| `FLOWS.md` | Langkah operasional per alur + aturan validasi tiap field + transisi status + audit/notifikasi per langkah |
| `DATA_MODEL.md` | Sketsa skema awal, enum, ID, dan seed; belum lengkap, dibaca bersama `DATA_REQUIREMENTS.md` |
| `WIREFRAMES.md` | Region layout + komponen + copy persis + state kosong/loading/error + responsif per halaman |
| `DESIGN_SYSTEM.md` | Token warna V1 (hex persis) + pemetaan status→warna/ikon/label + tombol + tipografi + aksesibilitas |
| `SUGGESTIONS.md` | Masukan tambahan di luar permintaan (opsional, ditandai jelas) |
| `MIGRATION_FROM_V1.md` | Tabel file-per-file: hapus/arsip/pindah/ubah + cara hidupkan landing |
| `BACKLOG.md` | Urutan pembangunan + dependensi + yang ditunda ke backend |
| `../../planning/STAGE_12_SELF_REPORT_PUBLIK.md` | Sumber arah perubahan V1→V2; hanya dibaca pada sesi ini |
| `AGENTS.md` | Aturan tetap pengerjaan V2 (manusia + agen AI) |
| `TODO.md` | Kontrol validasi rencana dan antrean pembangunan yang belum diaktifkan |
| `TEST_PLAN.md` | Matriks route/guard/E2E/visual/teknis + template hasil |
| `planning/` | V2-00 untuk diskusi rencana, diikuti 9 calon stage pembangunan V2-01…V2-09 |

## Aturan prototipe (tidak boleh dilanggar)

- Semua angka, skor, kategori, severity, priority, dan rekomendasi adalah **data dummy** berlabel jelas (`Data ilustrasi` / `data dummy` / `Simulasi prototipe`). Dilarang menyajikannya sebagai ketentuan ilmiah final.
- Instrumen Published dikunci; perubahan lewat versi baru (clone snapshot).
- Laporan yang tampil di dashboard selalu tertelusur ke: versi instrumen (untuk penilaian mandiri), bukti, area/lokasi, pelapor, validator, dan audit event.
- Ketertelusuran internal berbeda dari keterbukaan publik. Daftar bidang yang tampil publik menunggu **D-02**; status `Diterima` saja belum menentukan izin membuka semua bidang.
- `Diterima` berarti diterima pengelola melalui moderasi, bukan sertifikasi keselamatan atau validasi ilmiah instrumen. `Completed` adalah status penanganan, bukan skor K3L baru.
- Guard frontend hanya simulasi UX; otorisasi nyata wajib di backend nanti.
- Bahasa Indonesia yang ringkas dan konsisten; istilah memakai daftar baku di atas.
- Warna mengikuti `DESIGN_SYSTEM.md` (token V1, hex persis). Status tidak pernah dibedakan dengan warna saja — selalu label teks + ikon.
