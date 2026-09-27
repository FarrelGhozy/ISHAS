# Alur Operasional Rinci

## Amendemen alur dashboard — 18 September 2026

Kontrak alur lintas kanal/validasi/publik/arsip dan unit metrik terkini ada di
[DASHBOARD_DATA_FLOW.md](DASHBOARD_DATA_FLOW.md). Periode URL masih pratinjau;
filter operasional utama adalah pesantren. Risiko tetap keputusan akun Pesantren,
empat kategori mengikuti D-15, snapshot lama memakai versi asal.



**Amendemen D-14 — 18 September 2026:** denah aktif untuk pelaporan adalah
denah gambaran besar per pesantren, bukan per lantai. Titik dan keterangan lantai
merujuk versi denah saat kirim; lokasi per jawaban penilaian mandiri diwariskan
ke temuan sumbernya. Hanya temuan Diterima belum diarsip yang dapat menjadi pin
publik setelah satu pesantren dipilih. Rancangan lengkap dan usulan kewajiban titik
di [RISK_MAP_DESIGN.md](RISK_MAP_DESIGN.md); belum implementasi.

Konvensi penulisan tiap langkah: **Aktor → aksi UI → hasil sistem → jejak (audit/notifikasi)**.
Jika suatu field disebut "wajib", form MENOLAK submit dan menampilkan pesan error inline bila kosong — bukan sekadar himbauan.
Status alur: rancangan untuk review, bukan instruksi kode. Keputusan terbuka ada di `DECISIONS.md`.
§1 bergantung D-08/D-09; §2–3 pada D-10/D-11 (D-02/D-03 telah dijawab 8 September 2026); §4–6 pada D-04–D-07.

## 1. Onboarding pesantren (Aktor: Super Admin)

**Prasyarat:** login sebagai Super Admin.

1. Buka `/admin/pesantren` → **Tambah pesantren** → isi: nama resmi (wajib, unik, maks 120 karakter), kota/kabupaten (wajib), alamat lengkap (wajib), nama penanggung jawab utama (wajib — boleh nama calon sebelum akun dibuat).
  → Sistem membuat record status `Persiapan` + audit `Membuat data pesantren` + ID `PSN-XXXX` berurutan.
2. Verifikasi data → ubah status menjadi `Aktif` (aksi eksplisit per baris; tidak otomatis).
  → Audit `Memverifikasi pesantren`. Pesantren `Persiapan` tetap TIDAK muncul di pemilih publik.
3. Buka `/admin/pengguna` → **Tambah pengguna** → peran hanya tiga pilihan: `Super Admin`, `Validator`, `Pesantren` (tidak ada Asesor) → untuk Pesantren wajib pilih tepat satu pesantren `Aktif`.
  → Sistem membuat akun status `Menunggu`, audit `Membuat akun pengguna`, notifikasi ke admin. Email duplikat DITOLAK dengan pesan "Email sudah digunakan pada data demo."
  → **Belum lengkap (D-09):** pilihan peran bertentangan dengan ROLES yang hanya memberi hak membuat Pesantren. Aktor, aksi, dan syarat mengaktifkan akun `Menunggu → Aktif` juga belum ditentukan.
4. Sejak akun Pesantren aktif: nama pesantren muncul di **pemilih pesantren** publik dan dapat dilaporkan. Menghapus/menonaktifkan akun Pesantren terakhir suatu pesantren → pesantren hilang dari pemilih (laporan lama yang sudah `Diterima` tetap tampil sebagai arsip dengan label scope-nya).
5. Menonaktifkan pesantren (`Aktif → Nonaktif`): butuh konfirmasi; pesantren hilang dari pemilih; form lapor ke pesantren itu DITOLAK dengan pesan "Pesantren tidak tersedia untuk pelaporan."

**Menunggu D-08:** pernyataan arsip lama tetap tampil pada langkah 4 belum konsisten dengan
agregat yang hanya mencakup pesantren terdaftar. Status laporan menunggu dan pekerjaan berjalan
setelah pesantren/akun nonaktif juga perlu keputusan; jangan menghapusnya otomatis.

## 2. Laporan cepat bahaya (Aktor: Publik, tanpa login)

**Prasyarat:** minimal satu pesantren terdaftar. Jika nol → tombol lapor nonaktif + penjelasan (lihat ROUTES §1).

1. Buka `/` → pastikan pesantren benar di pemilih (atau buka `/lapor?pesantren=PSN-0018`) → **Laporkan temuan**. Saat login sebagai Super Admin/Validator: halaman dapat dibaca tetapi kirim dinonaktifkan dengan pesan keluar dari akun (D-03).
2. Isi form (satu langkah, tanpa wizard):
 | Field | Aturan |
 |---|---|
 | Nama pelapor | Wajib, 2–100 karakter. Boleh nama asli atau nama kelompok ("Santri Blok A"). Bukan email, bukan username. Nama selalu tampil apa adanya secara internal; tidak ada opsi anonim (D-02). Publik tidak menampilkan nama pelapor. |
  | Pesantren | Wajib, dropdown HANYA pesantren terdaftar (`kode — nama`). Tidak ada opsi isi manual. |
  | Kategori / Aspek | Opsional (D-15, D-19). Cascading: pilih Kategori (Keselamatan/Kesehatan/Lingkungan/Psikososial) → Aspek terfilter. Tanpa pilihan tetap sah. `aspectId` harus milik `categoryId`. Lapor-cepat baru tidak memakai `Indikator terkait` (data lama tetap dibaca). Field risiko final (Likelihood/Severity/Risk Score/Rekomendasi) TIDAK ada di form publik; diisi akun Pesantren saat validasi (§4). |
  | Usulan mandiri | Opsional (D-19). `Tingkat keparahan` + `Prioritas perbaikan` usulan pelapor (default `Belum ditentukan`). Disimpan sebagai usulan, bukan keputusan; Pesantren meninjau ulang saat validasi. |
 | Lokasi/area | Wajib, dropdown area milik pesantren terpilih (format "Gedung · Lantai · Area"). Jika area belum ada → pesan "Belum ada area terdaftar; hubungi akun Pesantren." |
 | Judul temuan | Wajib, 10–140 karakter. Contoh: "Kabel terbuka di koridor lantai 2". |
 | Deskripsi | Wajib, min 20 karakter: apa, di mana tepatnya, sejak kapan, siapa terdampak. |
 | Foto/bukti | Opsional, satu PNG/JPEG/WebP maksimum 5 MB/20 megapiksel. Periksa dekode → simpan blob lokal → pratinjau → ID lampiran pada draft/laporan. Bukti privat, hanya akun Pesantren pemilik scope. Backend belum tersedia. |
 | Kontak | Opsional, maks 100 karakter (untuk klarifikasi). |
3. Tekan **Kirim laporan** → validasi inline per field → sukses: tampilkan layar konfirmasi berisi **nomor laporan** (`RPT-XXXX`), status `Menunggu validasi`, dan penjelasan "Laporan Anda belum tampil di dashboard; menunggu validasi akun Pesantren." + tombol kembali.
 → Sistem: `validationStatus: Menunggu validasi`, `handlingStatus: Menunggu validasi`, `severity/priority: Belum ditentukan`; audit `Mengirim laporan publik`; notifikasi ke akun Pesantren terkait (`/pesantren/validasi-laporan`).
4. Laporan TIDAK tampil di dashboard/hasil/peta/rekomendasi/laporan pimpinan pada tahap ini — tanpa kecuali.

## 3. Penilaian mandiri / self-assessment (Aktor: Publik, tanpa login)

**Amendemen D-24 (28 September 2026):** versioning dihapus; prasyarat versi
`Published`, banner kunci versi, dan aturan D-10 historis di bawah diganti.
Berlaku: bank instrumen live `INS-LIVE` + registrasi penilai + draft checksum
+ snapshot beku + skor % + PDF per laporan (tampil publik setelah `Diterima`).

**Prasyarat:** sama seperti §2 + bank instrumen live mempunyai minimal satu
indikator. Jika kosong → halaman menampilkan pesan "Belum ada instrumen" dan
form terkunci (bukan form kosong).

1. Buka `/penilaian-mandiri` → registrasi penilai (nama penilai* 2–100,
kontak opsional) + pilih pesantren terdaftar (wajib, dropdown sama seperti §2);
aturan nama sama seperti §2, tanpa opsi anonim — D-02.
2. Sistem memakai **bank instrumen live** dan menampilkannya sebagai banner:
"Bank instrumen live · perubahan soal membuat draft harus mengulang". Draft
menyimpan `instrumentChecksum`; checksum beda = kirim dikunci + wajib mulai
baru. Pelapor TIDAK dapat memilih versi (tidak ada versi).
3. Isi per indikator (navigasi dimensi di kiri, pertanyaan di tengah, kelengkapan di kanan — mengikuti alur penilaian mandiri tanpa panel penugasan):
 - Jawaban (wajib semua indikator `required`).
 - Catatan observasi (bebas; **wajib** bila jawaban `N/A` — min 10 karakter alasan).
 - Bukti (wajib bila indikator `evidenceRequired`; simpan nama file dummy).
 - Lokasi observasi (wajib bila indikator `locationRequired`; pilih area + tandai titik denah `x/y` 0–100 bila denah tersedia; bila tanpa denah, area saja cukup).
4. **Simpan draft** otomatis per perubahan tanpa menunggu nama (nama + pesantren
wajib baru saat kirim); pesantren terakhir diingat per perangkat sehingga reload
tanpa param tetap memuat draft yang benar; tulis hanya bila isi berubah (anti
loop save-render-save); lanjutkan dari indikator terakhir via `activeIndex`.
5. **Tinjau** → ringkasan 4 kelompok: jawaban wajib, bukti wajib, catatan N/A, lokasi → klik item bermasalah melompat ke indikatornya.
6. **Kirim untuk validasi** (aktif hanya bila 4 kelompok lengkap) → dialog konfirmasi "Setelah dikirim tidak dapat diubah; koreksi lewat laporan baru atau hubungi akun Pesantren." → Ya.
 → Sistem: simpan snapshot beku (copy soal + opsi + bobot + jawaban +
bukti + lokasi + `scorePercent` + `byDimension`), hubungkan ke satu `Report`
kanal `penilaian-mandiri` (`scorePercent` + `pdfGeneratedAt`), lalu kunci
kiriman. Kandidat temuan mengikuti flag `isFinding` per opsi (ilustratif;
bukan ambang ilmiah final). Status `Menunggu validasi`; audit; notifikasi akun
Pesantren. PDF laporan dibuat saat kirim dan baru tampil publik setelah
`Diterima`. Layar sukses sama seperti §2. Rincian snapshot ada di
`DATA_REQUIREMENTS.md` §2.

**Kasus yang belum diputuskan:** seluruh jawaban N/A dan arti periode
penilaian (D-04), serta penilaian lengkap tanpa temuan (D-05). Aturan draft
versi lama (D-10) diganti aturan checksum D-24: soal berubah = ulang dari awal.

## 4. Validasi oleh Pesantren (Aktor: Pesantren, login)

**Prasyarat:** login Pesantren; antrean hanya berisi laporan `institutionCode` miliknya, diurutkan terbaru dulu.

1. Buka `/pesantren/validasi-laporan` → filter status + kanal (`lapor-cepat/penilaian-mandiri`) + severity + pencarian (nomor/judul/pelapor/deskripsi); baris memuat chip kanal + lokasi + handling → pilih item `Menunggu validasi` → baca seluruh isi kiriman: pelapor (nama; label `Publik` bila tanpa login atau label akun bila login), kontak internal, pesantren, lokasi/area (+ titik denah bila ada), kategori/aspek (+ indikator lama bila ada), usulan keparahan/prioritas pelapor, judul, deskripsi, bukti gambar, waktu kirim, versi instrumen (untuk penilaian mandiri: seluruh jawaban per indikator, hanya-baca).
2. Keputusan A — **Terima**: tinjau usulan pelapor lalu wajib pilih `severity` (`Tinggi/Sedang/Rendah`, tanpa default, pre-fill dari usulan bila sah; UI memakai placeholder `Pilih…`, bukan opsi `Belum ditentukan`) + wajib pilih `priority` (aturan sama) + opsional catatan validasi → konfirmasi.
 → Sistem: `validationStatus: Diterima`, `handlingStatus: Pending`, simpan validator/waktu; data masuk sumber tervalidasi dengan bidang publik sesuai D-02 (ringkasan saja; nama validator publik). Untuk penilaian mandiri, hasil memakai snapshot dan konfigurasi ilustratif; lapor cepat tidak mempunyai skor instrumen. Audit `Memvalidasi laporan` + notifikasi internal. Notifikasi status ke pelapor login masih usulan `SUGGESTIONS.md` §5, bukan fitur yang otomatis disetujui.
3. Keputusan B — **Tolak**: wajib isi alasan min 10 karakter → konfirmasi.
 → Sistem: `validationStatus: Ditolak`, `handlingStatus: Ditolak` (terminal pada rancangan awal, tidak tampil publik); simpan validator, waktu, dan alasan; audit `Menolak laporan`. Arsip dapat dibuka akun Pesantren pemilik scope melalui filter "Ditolak".
4. Larangan: akun Pesantren DILARANG mengubah isi deskripsi/bukti/jawaban pelapor. Yang boleh diisi hanya: severity, priority, catatan validasi, alasan tolak, dan status penanganan. Koreksi faktual dilakukan lewat laporan baru.

## 5. Status penanganan (Aktor: Pesantren — D-23)

**Diagram status (satu-satunya yang sah):**

```
Menunggu validasi → Ditolak (terminal)
Menunggu validasi → Pending → Proses → Completed → Diarsipkan (terminal, teraudit — D-07)
Proses → Pending (mundur dengan alasan)
Completed → Proses (dibuka kembali dengan alasan)
Rekomendasi: Belum ditindaklanjuti → Berjalan → Menunggu verifikasi → Terverifikasi
Rekomendasi: Belum ditindaklanjuti/Berjalan/Menunggu verifikasi → Dibatalkan (terminal per rekomendasi, wajib alasan — D-21)
Temuan: level Rendah/Sedang/Tinggi/Ekstrem diubah eksplisit per temuan oleh Pesantren (D-23.b)
```

**Aturan transisi:**

| Dari → Ke | Syarat |
|---|---|
| `Menunggu validasi → Pending` | Hanya lewat aksi Terima (§4.2) + severity & priority terisi |
| `Menunggu validasi → Ditolak` | Hanya lewat aksi Tolak + alasan |
| `Pending → Proses` | Jalur utama lewat kartu tindak lanjut: PIC + tenggat (tanggal, tidak masa lalu) + catatan rencana; `updateHandlingStatus` manual tetap sah untuk laporan tanpa rekomendasi + arsip/mundur |
| `Proses → Completed` | Jalur utama otomatis bila seluruh rekomendasi non-`Dibatalkan` sudah `Terverifikasi` (progres 100% + bukti upload + verifikasi); manual hanya untuk laporan tanpa rekomendasi |
| `Completed → Diarsipkan` | Hanya `Completed` yang belum diarsip; alasan arsip min 5; audit `Mengarsipkan laporan selesai`; arsip hilang dari kelola Validasi + publik, tetap dibaca di `/pesantren/laporan` |
| Mundur (`Proses → Pending`, `Completed → Proses`) | Hanya dengan catatan alasan wajib min 10; teraudit sebagai `Mengembalikan status`; tombol mundur diberi gaya sekunder + peringatan |

**Belum final:** D-05 menentukan penggabungan status bila satu report mempunyai beberapa
temuan atau tidak mempunyai temuan. D-06 menentukan pemeriksa penyelesaian. D-07 menentukan
arti hapus serta riwayatnya. `Completed` milik laporan dan `Terverifikasi` milik tindak lanjut
tidak boleh disamakan tanpa aturan penghubung tersebut.

**Tampilan status (selalu label + ikon, tidak pernah warna saja):**

- `Menunggu validasi` → `status-neutral`, ikon jam.
- `Pending` → `status-amber`, ikon jam.
- `Proses` → `status-blue`, ikon progres.
- `Completed`/`Terverifikasi` → `status-green`, ikon centang.
- `Ditolak` → `status-neutral`, ikon silang (hanya terlihat di antrean Pesantren, tidak publik).
- `Dibatalkan` → `status-neutral`, ikon silang (tampil publik beserta alasan, tanpa bukti/tenggat/catatan internal — D-21).
- Severity/priority `Tinggi` → `status-red`; `Sedang` → `status-amber`; `Rendah` → `status-green`; `Belum ditentukan` → `status-neutral`.

## 6. Tindak lanjut dan laporan pimpinan (Aktor: Pesantren)

 1. Dari rekomendasi `Belum ditindaklanjuti` → **Buat rencana tindakan** (PIC + tenggat + catatan) → status rekomendasi `Berjalan`, laporan induk `Proses`.
 2. Perbarui progres (slider titik `0/25/50/75/100` + label tahap; nilai lama dibulatkan ke titik terdekat — D-20) + catatan + bukti penyelesaian upload gambar (PNG/JPEG/WebP 5 MB/20 MP, pratinjau + lepas/ganti, pola sama `/lapor` — D-21) → ajukan selesai → akun Pesantren memverifikasi → `Completed`/`Terverifikasi`.
 2a. **Batalkan perbaikan** (D-21, D-23.d): dari `Belum ditindaklanjuti/Berjalan/Menunggu verifikasi` → `Dibatalkan` (terminal per rekomendasi, baris tidak dihapus) → wajib alasan min 10 karakter + `canceledBy/canceledAt` + audit `Membatalkan tindak lanjut`; temuan tertaut ikut `Dibatalkan`; laporan induk tetap pada status berjalan (`Pending/Proses` apa adanya); `Dibatalkan` menghalangi `Completed` otomatis + UI memberi hint (buat rencana pengganti via laporan baru atau lanjutkan rekomendasi tersisa). Status + alasan tampil publik; bukti/tenggat/catatan internal tetap privat.
 2b. **Tingkat risiko temuan** (D-23.b): `severity/priority` laporan tetap `Tinggi/Sedang/Rendah`; level tiap temuan (`Rendah/Sedang/Tinggi/Ekstrem`) diubah eksplisit per baris oleh Pesantren + teraudit `Mengubah tingkat risiko temuan`. Tanpa rumus turunan otomatis.
3. `/pesantren/laporan`: pratinjau ringkasan pimpinan dalam scope Pesantren (tanpa arsip) + dimensi katalog aktif (ilustrasi) + status tindak lanjut + progres rata-rata non-`Dibatalkan` + metadata (periode berjalan, versi instrumen per laporan pada riwayat, waktu data terbaru, pembuat) + tautan silang ke Validasi/Tindak lanjut + simulasi unduh PDF/Excel berlabel dummy. `/laporan` adalah versi baca publik dengan bidang sesuai D-02 (ringkasan + nama validator/PIC; tanpa nama pelapor, bukti, jawaban mentah) dan tidak otomatis sama dengan versi internal.

## 7. Siklus instrumen (Aktor: Validator — tujuan peran dipertahankan, D-17; amendemen D-24)

Bank live → tambah/edit/hapus dimensi/indikator (pertanyaan, tipe jawaban
`ya-tidak/kualitas-1-5/frekuensi/keparahan`, opsi + bobot 0–100 per opsi,
flag temuan, bobot pengali indikator, bukti, lokasi) → simpan langsung →
otomatis menjadi sumber `/penilaian-mandiri`. Tanpa Draft/Published/Archived;
perubahan langsung aktif + peringatan draft berjalan harus mengulang. Skor
lama dibekukan pada snapshot (tidak dihitung ulang). Bobot/ambang/rumus tetap
dummy ilustratif sampai keputusan ilmiah final.

 Keterhubungan dataset, status hasil , impor dummy, serta akses jawaban mentah perlu dipetakan
 sebelum dianggap sama dengan lama; lihat `DATA_REQUIREMENTS.md` §9. Moderasi laporan oleh akun Pesantren
 berbeda dari validasi ilmiah instrumen oleh tim penelitian.

## 8. Pustaka detail indikator — PDF Public/Privat (Aktor: Validator, D-16—D-17)

**Prasyarat:** login sebagai Validator. Independen dari versioning instrumen
(tidak dikunci `Published`) dan tidak memengaruhi `penilaian-mandiri`.

1. Buka `/validator/dokumen-instrumen` (menu `Dokumen instrumen`) → pilih
   indikator (`INS-v1.1`) → **Unggah PDF** (hanya `.pdf`/`application/pdf` +
   header `%PDF`, maks 10 MB; default `Privat`) → simpan blob lokal + metadata
   + audit `Mengunggah berkas indikator`.
   → D-16.g: tombol **Tambah dokumen** untuk entri baru (kode, judul, kategori
   wajib, aspek opsional, PDF) → baris pustaka baru tanpa mengubah
   `InstrumentVersion`; audit `Menambahkan dokumen indikator`.
   → Sistem: satu indikator = satu berkas; unggah baru mengganti dengan
   konfirmasi; `Public/Privat` dapat diubah tanpa unggah ulang; hapus memakai
   konfirmasi + audit dan menghapus blob.
2. Publik membuka `/dokumen` atau panel dashboard `/` → search + filter
   kategori/status → untuk `Public`: **Lihat** (tab baru) + **Unduh**; untuk
   `Privat`: hanya nama + status terkunci, tanpa kedua tombol.
   → Sistem: adapter memeriksa `visibility` sebelum menyajikan blob; blob
   privat tidak pernah disajikan ke publik (D-02). Filter pesantren tidak
   memfilter dokumen (global).
