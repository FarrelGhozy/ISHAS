# Cakupan Fitur Frontend ISHAS

Dokumen ini mencocokkan proposal/blueprint dengan halaman prototipe, aksi dummy, dan kontrak backend. Tujuannya adalah mencegah halaman penting terlewat saat data lokal diganti API.

## Alur lintas peran

| Kebutuhan | Gambaran frontend | Kontrak backend |
| --- | --- | --- |
| Autentikasi | Login dummy, pilihan empat akun, tampil/sembunyikan sandi, logout | Sesi, sign-in, sign-out, user, role, permission, dan scope lembaga/wilayah |
| Otorisasi | Menu dan ruang kerja berbeda untuk setiap akun; fallback akses terlarang | Pemeriksaan role dan scope pada setiap query/mutation |
| Notifikasi | Dua notifikasi kontekstual per peran yang membuka halaman terkait | Daftar notifikasi dan tandai dibaca |
| State data | Loading, empty, error, forbidden, success, locked, dan conflict sudah dipetakan | Envelope sukses/gagal, kode error, field error, dan request ID |
| Responsivitas | Sidebar mobile, form, tabel/kartu, builder, assessment, hasil, dan peta bahaya adaptif | Tidak mengubah kontrak data |

## Admin — mengelola sistem

| Halaman | Detail dan aksi dummy yang tersedia | Data/API minimum |
| --- | --- | --- |
| Dashboard Sistem | Statistik akun/lembaga/assessment, aktivitas terbaru, ringkasan cakupan akses | Agregasi sistem dan audit event |
| Pengguna | Cari, filter role/status, tambah akun, lihat detail user | List/detail/create/update user dan scope |
| Pesantren | Cari/filter, tambah lembaga, lihat pengelola, user, assessment, dan onboarding | List/detail/create/update institution |
| Hak Akses | Matriks empat peran dan kewenangan per modul | Permission, role-permission, audit perubahan |
| Audit Log | Cari/filter kategori, detail siapa/kapan/perubahan, ekspor dummy | List dan export audit event |
| Pengaturan | Nama aplikasi, zona waktu, sesi, notifikasi, maintenance, konfirmasi aksi berisiko | Get/update system settings dan audit event |

Instrumen ilmiah ditempatkan pada ruang Peneliti sesuai keputusan pembagian peran proyek, bukan pada Admin. Backend tetap harus menolak perubahan instrumen Published dari peran apa pun.

## Peneliti — mengelola ilmu dan instrumen

| Halaman | Detail dan aksi dummy yang tersedia | Data/API minimum |
| --- | --- | --- |
| Dashboard Penelitian | Ringkasan versi aktif/draft, dimensi, item validasi, dan alur publikasi | Agregasi instrument version dan validation issue |
| Instrumen | Daftar/struktur instrumen, kelengkapan, pilih dimensi/indikator, buat instrumen | Instrument dan instrument version |
| Instrument Builder | Tambah dimensi/indikator; pertanyaan, jenis jawaban, opsi, bobot, N/A, reverse scoring, bukti, sumber, rubric, dan recommendation rule | Draft version beserta nested dimensions/indicators/rules |
| Versioning | Snapshot Draft/Published/Archived, parent version, change note, clone versi | List/create/archive version dan relasi parent |
| Konfigurasi Scoring | Bobot dimensi/indikator, rubric, threshold, bukti wajib, dan rekomendasi dummy | Konfigurasi nullable sampai keputusan ilmiah disahkan |
| Validasi & Publikasi | Checklist kelengkapan, masalah yang perlu diperbaiki, konfirmasi publish dan lock | Validate/publish transaction, hash konfigurasi, audit |
| Data Penelitian | Cari/filter/detail/verifikasi, import Excel/CSV tervalidasi, ekspor dengan metadata versi dan anonimisasi | Dataset, import job, verifikasi, export job |

## Asesor — menghasilkan data assessment

| Halaman | Detail dan aksi dummy yang tersedia | Data/API minimum |
| --- | --- | --- |
| Dashboard Asesor | Prioritas penugasan, progress, bukti kurang, dan akses cepat assessment | Assignment milik asesor aktif |
| Penugasan Saya | Cari/filter, detail jadwal/kontak/versi/status, lanjutkan draft | List assignment berdasarkan user scope |
| Assessment Baru | Pilih penugasan, verifikasi pesantren/kontak/periode/versi, mulai assessment | Start assignment dan create assessment |
| Form Assessment | Navigasi dimensi/indikator, jawaban, catatan observasi, N/A, unggah/hapus bukti, save draft | Version-driven form, answers, evidence, progress server |
| Review & Finalisasi | Daftar kelengkapan, lompat ke item bermasalah, disabled state, konfirmasi immutable | Validate, submit/finalize transaction, audit dan scoring snapshot |
| Bukti Lapangan | Filter bukti, unggah file, sumber kuesioner/observasi/dokumen/insiden, form catatan insiden | Evidence dan assessment input source |
| Riwayat | Cari dan lihat assessment final beserta versi dan bukti secara hanya-baca | List/detail assessment berdasarkan asesor |

Pada indikator yang membutuhkan lokasi, Asesor memilih gedung/lantai/area dari master pondok. Titik koordinat hanya ditambahkan bila denah tersedia; assessment tidak diblokir ketika pondok belum mengunggah denah.

Sensor/IoT tercatat pada kontrak sebagai sumber opsional tahap lanjut. Ia sengaja tidak dibuat sebagai alur utama prototipe 2026.

## Pengelola Pesantren — menggunakan hasil assessment

| Halaman | Detail dan aksi dummy yang tersedia | Data/API minimum |
| --- | --- | --- |
| Ringkasan K3L | Indeks ilustratif, tren, temuan prioritas, progress tindak lanjut, scope pesantren/periode | Dashboard agregat lembaga dan periode |
| Hasil Assessment | Skor total/dimensi, kategori, perbandingan periode, metadata versi dan status final | Assessment result, dimension result, history |
| Gedung & Denah | Master gedung/lantai/area, sumber denah, status ketersediaan, tambah gedung, unggah versi denah | Building, floor, area, versioned floor plan |
| Peta Bahaya & Risiko | Daftar Area utama, denah opsional, daftar temuan, filter, keterlacakan, pemisahan risiko/status pekerjaan | Assessment, indicator, area, floor-plan version, risk observation |
| Rekomendasi | Prioritas, penyebab, saran, status, penanggung jawab, konversi ke tindak lanjut | Recommendation hasil rule dan create follow-up |
| Tindak Lanjut | Board status, PIC, tenggat, progress, catatan, bukti, submit/verifikasi | Follow-up lifecycle, evidence, verification |
| Laporan | Ringkasan pimpinan, isi laporan, versi instrumen, PDF/Excel, status generate | Create/get report dan signed download URL |

## Keputusan yang tidak boleh ditebak frontend

- Dimensi/indikator final, jenis jawaban, bobot, rubric, dan sumber resmi.
- Formula indeks, normalisasi, reverse scoring, missing value/N/A, serta threshold risiko.
- Apakah Submit langsung Final atau melalui reviewer.
- Peran yang berhak memverifikasi tindak lanjut.
- Kebijakan file, retensi, denah, laporan final, hosting, dan integrasi produksi.

Nilai dan klasifikasi pada prototipe adalah data ilustrasi. Struktur frontend dibuat configurable agar keputusan ilmiah tersebut masuk sebagai data backend, bukan perubahan hard-coded pada tampilan.
