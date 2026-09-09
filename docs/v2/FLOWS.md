# V2 — Alur Operasional Rinci

Konvensi penulisan tiap langkah: **Aktor → aksi UI → hasil sistem → jejak (audit/notifikasi)**.
Jika suatu field disebut "wajib", form MENOLAK submit dan menampilkan pesan error inline bila kosong — bukan sekadar himbauan.
Status alur: rancangan untuk review, bukan instruksi kode. Keputusan terbuka ada di `DECISIONS.md`.
§1 bergantung D-08/D-09; §2–3 pada D-10/D-11 (D-02/D-03 telah dijawab 8 September 2026); §4–6 pada D-04–D-07.

## 1. Onboarding pesantren (Aktor: Super Admin)

**Prasyarat:** login sebagai Super Admin.

1. Buka `/admin/pesantren` → **Tambah pesantren** → isi: nama resmi (wajib, unik, maks 120 karakter), kota/kabupaten (wajib), alamat lengkap (wajib), nama pengelola utama (wajib — boleh nama calon sebelum akun dibuat).
   → Sistem membuat record status `Persiapan` + audit `Membuat data pesantren` + ID `PSN-XXXX` berurutan.
2. Verifikasi data → ubah status menjadi `Aktif` (aksi eksplisit per baris; tidak otomatis).
   → Audit `Memverifikasi pesantren`. Pesantren `Persiapan` tetap TIDAK muncul di pemilih publik.
3. Buka `/admin/pengguna` → **Tambah pengguna** → peran hanya tiga pilihan: `Super Admin`, `Peneliti`, `Pengelola Pesantren` (tidak ada Asesor) → untuk pengelola wajib pilih tepat satu pesantren `Aktif`.
   → Sistem membuat akun status `Menunggu`, audit `Membuat akun pengguna`, notifikasi ke admin. Email duplikat DITOLAK dengan pesan "Email sudah digunakan pada data demo."
   → **Belum lengkap (D-09):** pilihan peran bertentangan dengan ROLES yang hanya memberi hak membuat pengelola. Aktor, aksi, dan syarat mengaktifkan akun `Menunggu → Aktif` juga belum ditentukan.
4. Sejak akun pengelola aktif: nama pesantren muncul di **pemilih pesantren** publik dan dapat dilaporkan. Menghapus/menonaktifkan akun pengelola terakhir suatu pesantren → pesantren hilang dari pemilih (laporan lama yang sudah `Diterima` tetap tampil sebagai arsip dengan label scope-nya).
5. Menonaktifkan pesantren (`Aktif → Nonaktif`): butuh konfirmasi; pesantren hilang dari pemilih; form lapor ke pesantren itu DITOLAK dengan pesan "Pesantren tidak tersedia untuk pelaporan."

**Menunggu D-08:** pernyataan arsip lama tetap tampil pada langkah 4 belum konsisten dengan
agregat yang hanya mencakup pesantren terdaftar. Status laporan menunggu dan pekerjaan berjalan
setelah pesantren/akun nonaktif juga perlu keputusan; jangan menghapusnya otomatis.

## 2. Laporan cepat bahaya (Aktor: Publik, tanpa login)

**Prasyarat:** minimal satu pesantren terdaftar. Jika nol → tombol lapor nonaktif + penjelasan (lihat ROUTES §1).

1. Buka `/` → pastikan pesantren benar di pemilih (atau buka `/lapor?pesantren=PSN-0018`) → **Laporkan temuan**. Saat login sebagai Super Admin/Peneliti: halaman dapat dibaca tetapi kirim dinonaktifkan dengan pesan keluar dari akun (D-03).
2. Isi form (satu langkah, tanpa wizard):
   | Field | Aturan |
   |---|---|
   | Nama pelapor | Wajib, 2–100 karakter. Boleh nama asli atau nama kelompok ("Santri Blok A"). Bukan email, bukan username. Nama selalu tampil apa adanya secara internal; tidak ada opsi anonim (D-02). Publik tidak menampilkan nama pelapor. |
   | Pesantren | Wajib, dropdown HANYA pesantren terdaftar (`kode — nama`). Tidak ada opsi isi manual. |
   | Lokasi/area | Wajib, dropdown area milik pesantren terpilih (format "Gedung · Lantai · Area"). Jika area belum ada → pesan "Belum ada area terdaftar; hubungi pengelola pondok." |
   | Judul temuan | Wajib, 10–140 karakter. Contoh: "Kabel terbuka di koridor lantai 2". |
   | Deskripsi | Wajib, min 20 karakter: apa, di mana tepatnya, sejak kapan, siapa terdampak. |
   | Foto/bukti | Opsional (simpan nama file dummy). Bukan bukti nyata di prototipe. |
   | Kontak | Opsional, maks 100 karakter (untuk klarifikasi). |
3. Tekan **Kirim laporan** → validasi inline per field → sukses: tampilkan layar konfirmasi berisi **nomor laporan** (`RPT-XXXX`), status `Menunggu validasi`, dan penjelasan "Laporan Anda belum tampil di dashboard; menunggu validasi pengelola pondok." + tombol kembali.
   → Sistem: `validationStatus: Menunggu validasi`, `handlingStatus: Menunggu validasi`, `severity/priority: Belum ditentukan`; audit `Mengirim laporan publik`; notifikasi ke pengelola pesantren terkait (`/pengelola/validasi-laporan`).
4. Laporan TIDAK tampil di dashboard/hasil/peta/rekomendasi/laporan pimpinan pada tahap ini — tanpa kecuali.

## 3. Penilaian mandiri / self-assessment (Aktor: Publik, tanpa login)

**Prasyarat:** sama seperti §2 + ada versi instrumen `Published` aktif. Jika tidak ada Published → halaman menampilkan pesan "Belum ada instrumen yang dipublikasikan" dan form terkunci (bukan form kosong).

1. Buka `/penilaian-mandiri` → pilih pesantren terdaftar (wajib, dropdown sama seperti §2) → isi nama pelapor (aturan sama seperti §2, tanpa opsi anonim — D-02).
2. Sistem mengikat sesi pengisian ke **versi Published aktif** dan menampilkannya sebagai banner terkunci: "Menggunakan ISHAS vX.Y · terkunci selama pengisian". Pelapor TIDAK dapat memilih versi lain.
3. Isi per indikator (navigasi dimensi di kiri, pertanyaan di tengah, kelengkapan di kanan — meniru AssessmentFlow V1 tanpa panel penugasan):
   - Jawaban (wajib semua indikator `required`).
   - Catatan observasi (bebas; **wajib** bila jawaban `N/A` — min 10 karakter alasan).
   - Bukti (wajib bila indikator `evidenceRequired`; simpan nama file dummy).
   - Lokasi observasi (wajib bila indikator `locationRequired`; pilih area + tandai titik denah `x/y` 0–100 bila denah tersedia; bila tanpa denah, area saja cukup).
4. **Simpan draft** kapan saja (tombol eksplisit + tersimpan otomatis per perubahan ke localStorage; bertahan saat refresh; lanjutkan dari indikator terakhir via `activeIndex`).
5. **Tinjau** → ringkasan 4 kelompok: jawaban wajib, bukti wajib, catatan N/A, lokasi → klik item bermasalah melompat ke indikatornya.
6. **Kirim untuk validasi** (aktif hanya bila 4 kelompok lengkap) → dialog konfirmasi "Setelah dikirim tidak dapat diubah; koreksi lewat laporan baru atau hubungi pengelola." → Ya.
   → Sistem: simpan snapshot seluruh jawaban/bukti/lokasi yang terkirim, hubungkan ke satu `Report` kanal `penilaian-mandiri`, lalu kunci kiriman. Kandidat temuan mengikuti konfigurasi ilustratif versi; `1/2/Tidak` hanya contoh seed, bukan aturan universal. Status `Menunggu validasi`; audit; notifikasi pengelola. Layar sukses sama seperti §2. Rincian snapshot ada di `DATA_REQUIREMENTS.md` §2.

**Kasus yang belum diputuskan:** versi Published berubah ketika draft masih berjalan (D-10),
seluruh jawaban N/A dan arti periode penilaian (D-04), serta penilaian lengkap tanpa temuan (D-05).

## 4. Validasi oleh Pengelola Pesantren (Aktor: Pengelola, login)

**Prasyarat:** login pengelola; antrean hanya berisi laporan `institutionCode` miliknya, diurutkan terbaru dulu.

1. Buka `/pengelola/validasi-laporan` → pilih item `Menunggu validasi` → baca: pelapor (nama; label `Publik` bila tanpa login atau label akun bila login), pesantren, lokasi/area (+ titik denah bila ada), judul, deskripsi, bukti, waktu kirim, versi instrumen (untuk penilaian mandiri: seluruh jawaban per indikator, hanya-baca).
2. Keputusan A — **Terima**: wajib pilih `severity` (`Tinggi/Sedang/Rendah`, tanpa default) + wajib pilih `priority` (`Tinggi/Sedang/Rendah`, tanpa default) + opsional catatan validasi → konfirmasi.
   → Sistem: `validationStatus: Diterima`, `handlingStatus: Pending`, simpan validator/waktu; data masuk sumber tervalidasi dengan bidang publik sesuai D-02 (ringkasan saja; nama validator publik). Untuk penilaian mandiri, hasil memakai snapshot dan konfigurasi ilustratif; lapor cepat tidak mempunyai skor instrumen. Audit `Memvalidasi laporan` + notifikasi internal. Notifikasi status ke pelapor login masih usulan `SUGGESTIONS.md` §5, bukan fitur yang otomatis disetujui.
3. Keputusan B — **Tolak**: wajib isi alasan min 10 karakter → konfirmasi.
   → Sistem: `validationStatus: Ditolak`, `handlingStatus: Ditolak` (terminal pada rancangan awal, tidak tampil publik); simpan validator, waktu, dan alasan; audit `Menolak laporan`. Arsip dapat dibuka pengelola pemilik scope melalui filter "Ditolak".
4. Larangan: pengelola DILARANG mengubah isi deskripsi/bukti/jawaban pelapor. Yang boleh diisi hanya: severity, priority, catatan validasi, alasan tolak, dan status penanganan. Koreksi faktual dilakukan lewat laporan baru.

## 5. Status penanganan (Aktor: Pengelola)

**Diagram status (satu-satunya yang sah):**

```
Menunggu validasi → Ditolak (terminal)
Menunggu validasi → Pending → Proses → Completed → Dihapus (terminal, teraudit)
Proses → Pending (mundur dengan alasan)
Completed → Proses (dibuka kembali dengan alasan)
```

**Aturan transisi:**

| Dari → Ke | Syarat |
|---|---|
| `Menunggu validasi → Pending` | Hanya lewat aksi Terima (§4.2) + severity & priority terisi |
| `Menunggu validasi → Ditolak` | Hanya lewat aksi Tolak + alasan |
| `Pending → Proses` | Wajib isi PIC + tenggat (tanggal) + catatan rencana |
| `Proses → Completed` | Wajib progres 100% + bukti penyelesaian (nama file dummy) + catatan; menjadi `Terverifikasi` di tampilan |
| `Completed → Dihapus` | Hanya `Completed`; dialog konfirmasi + alasan hapus; audit `Menghapus laporan selesai`; record audit TIDAK ikut terhapus |
| Mundur (`Proses → Pending`, `Completed → Proses`) | Hanya dengan catatan alasan wajib; teraudit sebagai `Mengembalikan status`; tombol mundur diberi gaya sekunder + peringatan |

**Belum final:** D-05 menentukan penggabungan status bila satu report mempunyai beberapa
temuan atau tidak mempunyai temuan. D-06 menentukan pemeriksa penyelesaian. D-07 menentukan
arti hapus serta riwayatnya. `Completed` milik laporan dan `Terverifikasi` milik tindak lanjut
tidak boleh disamakan tanpa aturan penghubung tersebut.

**Tampilan status (selalu label + ikon, tidak pernah warna saja):**

- `Menunggu validasi` → `status-neutral`, ikon jam.
- `Pending` → `status-amber`, ikon jam.
- `Proses` → `status-blue`, ikon progres.
- `Completed`/`Terverifikasi` → `status-green`, ikon centang.
- `Ditolak` → `status-neutral`, ikon silang (hanya terlihat di antrean pengelola, tidak publik).
- Severity/priority `Tinggi` → `status-red`; `Sedang` → `status-amber`; `Rendah` → `status-green`; `Belum ditentukan` → `status-neutral`.

## 6. Tindak lanjut dan laporan pimpinan (Aktor: Pengelola)

1. Dari rekomendasi `Belum ditindaklanjuti` → **Buat rencana tindakan** (PIC + tenggat + catatan) → status rekomendasi `Berjalan`, laporan induk `Proses`.
2. Perbarui progres + catatan + bukti penyelesaian dummy → ajukan selesai → pengelola memverifikasi → `Completed`/`Terverifikasi`.
3. `/pengelola/laporan`: pratinjau ringkasan pimpinan dalam scope pengelola + dimensi + status tindak lanjut + metadata (periode, versi instrumen, waktu buat, pembuat) + simulasi unduh PDF/Excel berlabel dummy. `/laporan` adalah versi baca publik dengan bidang sesuai D-02 (ringkasan + nama validator/PIC; tanpa nama pelapor, bukti, jawaban mentah) dan tidak otomatis sama dengan versi internal.

## 7. Siklus instrumen (Aktor: Peneliti — tujuan peran dipertahankan)

Draft → tambah dimensi/indikator (pertanyaan, jenis jawaban, bobot dummy, bukti, lokasi, referensi, rubric, rekomendasi) → simpan → validasi checklist → Published (kunci; arsipkan yang lama) → otomatis menjadi sumber `/penilaian-mandiri`. Perubahan setelah publish hanya lewat versi baru (clone snapshot). Bobot/ambang/rumus tetap dummy sampai keputusan ilmiah final.

Keterhubungan dataset, status hasil V2, impor dummy, serta akses jawaban mentah perlu dipetakan
sebelum dianggap sama dengan V1; lihat `DATA_REQUIREMENTS.md` §9. Moderasi laporan oleh pengelola
berbeda dari validasi ilmiah instrumen oleh tim penelitian.
