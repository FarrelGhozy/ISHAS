# ISHAS — Dokumentasi Utama (Frontend-Only)

**Status saat ini: rencana tervalidasi sebagian — D-01–D-03 dijawab, D-04–D-12 masih terbuka.**

ISHAS direncanakan sebagai perubahan besar berdasarkan evaluasi dosen (September 2026).
Keputusan pemilik 8 September 2026: **ISHAS dibangun sebagai aplikasi**
(React Router, file dipecah per folder, dijalankan dengan bun 1.4; lihat D-01 di `DECISIONS.md`).
Seluruh prototipe memakai data dummy; backend dan rumus final belum termasuk.
Data publik mengikuti D-02 (ringkasan saja + nama validator/PIC) dan hak melapor mengikuti
D-03 (publik + pengelola; Super Admin/Peneliti harus keluar dahulu).
Backend, rumus ilmiah final, upload file nyata, dan PDF/Excel nyata belum termasuk.

## Cara membaca hasil validasi

1. Baca [hasil pemeriksaan](VALIDATION_REVIEW.md) untuk melihat kekurangan dan konflik yang ditemukan.
2. Keputusan D-01–D-03 telah dijawab pemilik (8 September 2026, lihat `DECISIONS.md`); pertanyaan lanjutan D-04–D-12 masih terbuka dan dibahas sebelum spesifikasi terkait dikatakan siap.
3. Tinjau [kebutuhan data tambahan](DATA_REQUIREMENTS.md) sebelum memfinalkan model data dan alur.
4. Stage aktif adalah [Stage 00 — Validasi rencana](../planning/STAGE_00_PLAN_REVIEW.md). Stage 01–Stage 09 tetap `BACKLOG`.

Keterangan status isi dokumen:

- **Arahan tercatat**: arah yang sudah tertulis pada keputusan evaluasi dosen September 2026; sumbernya dapat ditelusuri, bukan persetujuan baru pada sesi ini.
- **Koreksi konsistensi**: perbaikan istilah, rujukan, dan aturan yang saling bertentangan tanpa menambah kewenangan atau fitur baru.
- **Usulan / menunggu keputusan**: belum boleh dipakai sebagai ketentuan final. Jika memengaruhi pekerjaan, tanyakan dahulu dan tunggu jawaban.

Frasa “wajib”, “persis”, dan checklist teknis pada rancangan lama berlaku sebagai calon spesifikasi,
bukan izin mulai membuat kode. Konflik yang tercatat di `DECISIONS.md` tetap terbuka sampai dijawab.
Sumber ilmiah tetap `source/`; dokumen sumber merupakan acuan keilmuan.
Perubahan arah produk tidak mengesahkan rumus, skala, atau kategori ilmiah.

## Arah utama (arahan tercatat; rincian terbuka ditandai)

1. Aplikasi ISHAS **tidak mempunyai landing page**; `/` langsung menjadi dashboard pesantren publik. Keputusan halaman perkenalan masih menunggu.
2. Peran **Asesor dihapus dari kemampuan operasional produk**. Tidak ada akun, menu, hak akses, atau data penugasan untuk peran itu. Penggantinya adalah **penilaian mandiri (self-assessment)**: dapat diisi publik tanpa login dan pengelola (D-03); Super Admin/Peneliti tidak dapat mengirim saat login.
3. Dashboard pesantren bersifat **publik tanpa login**: menampilkan **agregat semua pesantren terdaftar** (bukan satu pesantren hard-code) plus **pemilih pesantren** untuk memfilter ke satu lembaga.
4. `/login` hanya untuk **tiga peran**: Super Admin, Peneliti, Pengelola Pesantren. Demo asesor tidak ada.
5. **Semua laporan — baik dari pelapor tanpa login maupun yang login — wajib validasi pengelola** sebelum tampil di dashboard. Tidak ada jalur pintas tampil langsung.
6. **Nama pelapor selalu dicatat** pada setiap laporan. Jika pelapor login sebagai pengelola, field nama terisi otomatis dari akun dan tetap dapat diubah manual per laporan. Opsi "tampil anonim" tidak dibangun (D-02). Hak melapor: hanya publik tanpa login dan pengelola (D-03); pengelola boleh melapor ke pesantren lain sebagai pelapor umum. Nama pelapor tidak tampil publik (D-02); nama validator/PIC boleh tampil (D-02).

## Istilah baku (wajib dipakai persis di UI dan dokumen)

- **Super Admin** — admin sistem; mengelola pesantren dan akun pengelola. (Bukan "Admin" saja agar tidak tertukar dengan pengelola pondok.)
- **Pengelola Pesantren (mitra)** — admin lokal pondok; validasi laporan, menentukan severity/priority, mengelola status penanganan, lokasi, dan tindak lanjut. Label singkat di UI: `Pengelola Pesantren`.
- **Peneliti** — pengelola instrumen dan konfigurasi penilaian.
- **Publik / Pelapor** — pengguna tanpa login; melihat dashboard dan melapor dengan mengisi nama. Bukan sebuah "role login".
- **Tanpa login** menjelaskan keadaan sesi. **Tampil anonim** tidak lagi relevan: opsi penyamaran tidak dibangun (D-02, 8 September 2026) — nama pelapor selalu tampil apa adanya secara internal, dan publik tidak menampilkan nama pelapor sama sekali.
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
| `DESIGN_SYSTEM.md` | Token warna (hex persis) + pemetaan status→warna/ikon/label + tombol + tipografi + aksesibilitas |
| `SUGGESTIONS.md` | Masukan tambahan di luar permintaan (opsional, ditandai jelas) |
| `BACKLOG.md` | Urutan pembangunan + dependensi + yang ditunda ke backend |
| `TODO.md` | Kontrol validasi rencana dan antrean pembangunan yang belum diaktifkan |
| `TEST_PLAN.md` | Matriks route/guard/E2E/visual/teknis + template hasil |
| `planning/` | Stage 00 untuk diskusi rencana, diikuti 9 calon stage pembangunan Stage 01…Stage 09 |

## Aturan prototipe (tidak boleh dilanggar)

- Semua angka, skor, kategori, severity, priority, dan rekomendasi adalah **data dummy** berlabel jelas (`Data ilustrasi` / `data dummy` / `Simulasi prototipe`). Dilarang menyajikannya sebagai ketentuan ilmiah final.
- Instrumen Published dikunci; perubahan lewat versi baru (clone snapshot).
- Laporan yang tampil di dashboard selalu tertelusur ke: versi instrumen (untuk penilaian mandiri), bukti, area/lokasi, pelapor, validator, dan audit event.
- Ketertelusuran internal berbeda dari keterbukaan publik. Batas bidang publik sudah diputuskan (D-02, 8 September 2026): ringkasan saja + nama validator/PIC; matriks bidang di `DATA_REQUIREMENTS.md` §6.
- `Diterima` berarti diterima pengelola melalui moderasi, bukan sertifikasi keselamatan atau validasi ilmiah instrumen. `Completed` adalah status penanganan, bukan skor K3L baru.
- Guard frontend hanya simulasi UX; otorisasi nyata wajib di backend nanti.
- Bahasa Indonesia yang ringkas dan konsisten; istilah memakai daftar baku di atas.
- Warna mengikuti `DESIGN_SYSTEM.md` (token hex persis). Status tidak pernah dibedakan dengan warna saja — selalu label teks + ikon.
