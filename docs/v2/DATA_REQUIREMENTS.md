# V2 — Detail Kebutuhan Data untuk Review

Dokumen ini melengkapi celah pada [DATA_MODEL](DATA_MODEL.md) dalam bentuk kebutuhan dan
contoh pemeriksaan, **bukan implementasi atau skema final**. Nama bidang di bawah adalah
calon nama agar diskusi konkret. Keputusan perilaku yang belum jelas mengacu [DECISIONS](DECISIONS.md).

## 1. Bedakan objek yang selama ini disebut “laporan”

| Objek | Arti | Hubungan yang perlu dapat ditelusuri |
|---|---|---|
| Kiriman / Report | Satu laporan cepat atau satu pengiriman instrumen penuh | Pesantren, pelapor, kanal, waktu, keputusan moderasi |
| Draft | Isian yang belum dikirim pada perangkat | Pemilik/konteks perangkat, pesantren, versi instrumen jika ada, waktu simpan |
| Penilaian terkirim | Seluruh jawaban yang menjadi dasar satu Report penilaian mandiri | Report, snapshot instrumen dan jawaban, periode observasi |
| Hasil penilaian | Nilai per dimensi/total dari penilaian yang diterima | Kiriman sumber, versi aturan ilustratif, periode, waktu proses, status data |
| Temuan | Satu masalah yang terkait laporan dan lokasi | Report; indikator opsional pada kanal cepat; area dan bukti jika tersedia |
| Rekomendasi dan tindak lanjut | Anjuran serta rencana/progres penanganan | Temuan/report induk, PIC, tenggat, catatan dan pemeriksa |
| Laporan ringkasan | Pratinjau/rangkuman untuk pimpinan atau publik | Filter, periode, hasil sumber, waktu buat, pembuat, tingkat keterbukaan |

Pada V1, `reports` sudah digunakan untuk daftar laporan ringkasan di store. Menggantinya dengan
`Report` kiriman tanpa pemetaan akan mencampur dua objek berbeda. Calon nama `reportSummaries`
atau nama lain perlu dipilih saat memfinalkan kontrak. Jangan menyatakan hasil penilaian, jumlah
kiriman, dan jumlah temuan sebagai angka yang sama.

## 2. Kiriman permanen dan jejak identitas

Kebutuhan ini berasal dari alur yang sudah meminta pengelola membaca jawaban setelah kirim,
penguncian isi laporan, serta ketertelusuran historis.

| Kekurangan sketsa awal | Detail yang perlu tersedia |
|---|---|
| Jawaban hanya di draft lokal | Snapshot kiriman permanen: ID report, seluruh jawaban per ID indikator, catatan, bukti dummy, lokasi, versi instrumen, dan waktu kirim. Menghapus draft tidak boleh menghilangkan bahan validasi. |
| Draft “terkunci” hanya berupa komentar | Keadaan belum/sudah dikirim serta tautan `submittedReportId`, atau pemisahan draft dari snapshot terkirim yang setara. Kebijakan menyimpan/menghapus draft selesai dibahas pada D-10. |
| Identitas pengirim memakai email | Calon `reporterUserId` untuk akun yang mengirim, terpisah dari `reporterName` yang boleh diedit. Email/nama bukan kunci relasi. Pelapor tanpa login tidak diberi identitas akun fiktif. |
| Validator berupa string tanpa arti | ID akun validator + salinan nama/peran saat keputusan + waktu + catatan/alasan. Nama akun yang berubah tidak boleh mengubah atribusi historis secara diam-diam. |
| Waktu bercampur nama/display | Bedakan `createdAt`, `submittedAt`, `observedAt`, `validatedAt`, `updatedAt`. `observedAt` adalah waktu, bukan nama pelapor. Tentukan representasi waktu konsisten sebelum kode. |
| Tidak ada hubungan koreksi | Jika koreksi lewat laporan baru tetap dipilih, perlu hubungan laporan asal–koreksi dan alasan; dampak pada hasil menunggu D-07. |

Pengiriman ganda harus mengacu identitas draft/percobaan kirim yang sama sehingga menghasilkan
satu report, satu kumpulan kandidat temuan, dan satu peristiwa kirim. Tombol disabled saja tidak
membuktikan aturan ini. Jika kirim gagal, jangan menghapus draft atau menampilkan nomor sukses.

## 3. Moderasi, penanganan, dan kondisi yang sah

Dua bidang status pada rancangan awal harus selalu konsisten. Tabel berikut merapikan kombinasi
yang **sudah tertulis**; tidak menetapkan aturan baru untuk kasus tanpa temuan atau arsip.

| Validasi | Penanganan yang sesuai rancangan awal | Metadata keputusan |
|---|---|---|
| `Menunggu validasi` | `Menunggu validasi` | Severity/prioritas `Belum ditentukan`; belum ada validator keputusan |
| `Ditolak` | `Ditolak` | Validator, waktu, dan alasan minimal 10 karakter; tidak masuk hasil publik |
| `Diterima` | `Pending`, `Proses`, atau `Completed` | Validator dan waktu; severity/prioritas dipilih menurut rancangan sekarang, dengan pengecualian yang belum diputuskan pada D-05 |

- `Diterima + Ditolak` dan `Menunggu validasi + Completed` adalah kombinasi tidak konsisten.
- Terima/tolak hanya dari keadaan menunggu. Dua pengelola yang membuka item yang sama tidak boleh
  menimpa keputusan terbaru tanpa mendeteksi perubahan; detail pembukaan ulang menunggu D-07.
- Rancangan mengizinkan kembali `Proses → Pending` dan `Completed → Proses` dengan alasan.
  Nilai progres, bukti, tanggal selesai, dan status rekomendasi setelah mundur harus dijelaskan;
  mengganti satu label saja belum cukup.
- `Completed` pada laporan dan `Terverifikasi` pada tindak lanjut berbeda bidang. Keduanya tidak
  otomatis merupakan sinonim; agregasi banyak temuan dan siapa pemeriksanya menunggu D-05/D-06.
- Usulan metadata penanganan: pelaku perubahan, alasan, waktu mulai/selesai, ID rencana tindakan,
  ID pemeriksa, serta riwayat perubahan. Jangan menyimpan PIC/tenggat hanya pada state halaman.
- Keputusan D-07 harus mencakup report, jawaban, temuan, rekomendasi, tindak lanjut, bukti, hasil,
  dan notifikasi. Jangan meninggalkan relasi yatim setelah penghapusan/arsip.

## 4. Hasil, periode, dan instrumen

Sketsa saat ini belum memuat `InstrumentVersion`, konfigurasi indikator, periode, atau hasil per dimensi.
Enam indikator seed adalah contoh demo, bukan jumlah indikator ilmiah final.

Kebutuhan sebelum kontrak dapat dianggap lengkap:

1. Struktur versi yang menyimpan dimensi, indikator, opsi jawaban, aturan wajib, N/A,
   bukti/lokasi, arah skor, referensi, dan konfigurasi ilustratif. Published bersifat tetap;
   hasil lama tidak dihitung ulang saat versi baru terbit.
2. Penanda versi aktif untuk memulai penilaian baru. Draft mengikat satu versi dan menampilkan versi
   itu setelah refresh; boleh/tidaknya mengirim draft dari versi yang sudah diarsipkan menunggu D-10.
3. Periode memakai identitas stabil, label, serta rentang waktu yang jelas. Waktu laporan dikirim
   belum tentu periode kondisi yang dinilai. Sumber dan pemilih periode menunggu D-04.
4. Hasil mempunyai ID, sumber report, versi instrumen/aturan ilustratif, dimensi yang dihitung,
   jumlah jawaban yang dapat dinilai, status kelengkapan, dan waktu proses.
5. Belum ada hasil, jawaban seluruhnya N/A, dan nilai nol adalah keadaan berbeda. Jangan
   menggunakan nol sebagai pengganti data yang belum ada atau menghasilkan pembagian dengan nol.
6. Lapor cepat dapat menjadi sumber temuan dan tindak lanjut; tanpa jawaban instrumen, laporan
   tersebut tidak mempunyai skor dimensi. Tampilkan versi sebagai “Tidak menggunakan instrumen”
   jika perlu konteks, bukan memasangkan versi Published terbaru secara fiktif.
7. Aturan “1/2/Tidak = temuan” hanya contoh konfigurasi seed. Pertanyaan dengan arah jawaban
   terbalik membutuhkan konfigurasi; jangan menetapkan semua jawaban “Tidak” sebagai bahaya.
8. Statistik dashboard perlu definisi pembilang, penyebut, filter, waktu acuan, data yang dikecualikan,
   dan unit: laporan, temuan, tindakan, hasil penilaian, atau pesantren. Kebijakan agregat tetap D-04.
9. Tren lintas versi/periode baru bermakna setelah aturan keterbandingan ditentukan. Label versi dan
   periode saja belum membuktikan bahwa dua skor sebanding.

## 5. Pesantren, akun, lokasi, dan denah

- `Institution` memerlukan alamat lengkap yang diminta onboarding, selain kota/kabupaten.
  Nama pengelola utama dapat menjadi data kontak calon saat `Persiapan`; setelah ada akun,
  relasi pengelola harus melalui ID. Kebijakan nama pesantren duplikat perlu mempertimbangkan
  nama yang sama di lokasi berbeda; keunikan nama nasional belum terbukti sebagai kebutuhan.
- Sesi login dummy harus menunjuk akun yang dapat dibedakan, bukan hanya `roleId`. Dua pengelola
  memiliki role sama tetapi scope berbeda. Status aktif dan lingkup dibaca dari sumber akun bersama.
- Pemeriksaan role/scope dilakukan pada pemilihan data **dan tindakan simpan**, termasuk direct URL,
  ID report, ID area, rencana, serta target notifikasi. Ini tetap simulasi frontend, bukan keamanan produksi.
- Lokasi perlu hubungan `institutionCode → buildingId → floorId → areaId`. Nama lantai/zona adalah
  label tampilan. Memilih gedung/area pesantren lain harus terdeteksi sebagai hubungan tidak sah.
- Versi denah perlu identitas tersendiri, lantai induk, versi, nama sumber dummy, pelaku dan waktu.
  Jawaban/temuan mengacu versi denah saat observasi. Unggah versi baru tidak memindahkan titik historis.
- Titik denah opsional jika tidak ada denah; jangan menaruh marker tengah sebagai lokasi observasi
  yang seolah-olah dipilih pelapor. Area tanpa temuan berarti belum ada temuan tercatat, bukan otomatis aman.
- Lokasi wajib bila denah tidak ada masih dapat dipenuhi lewat area. Jika area juga tidak ada,
  kebijakan kirim mengikuti D-11. Membedakan dua keadaan ini perlu ada di form dan seed.

## 6. Data publik, audit, dan notifikasi

Setelah D-02 dijawab, tulis matriks bidang berikut untuk publik, pengelola pemilik, pengelola lain,
Super Admin, dan Peneliti: nomor/judul laporan, uraian, nama/kontak pelapor, identitas akun,
nama validator/PIC, foto/bukti, lokasi/denah, jawaban mentah, skor, alasan penolakan, serta audit.
Atur juga isi pratinjau dan ekspor; jangan hanya menyembunyikan kolom pada satu halaman.

Calon kontrak audit: ID peristiwa, ID objek dan jenisnya, ID pelaku jika ada, snapshot peran/nama,
institutionCode, aksi, waktu, alasan, dan perubahan sebelum/sesudah yang relevan.
Audit dummy di browser bukan rekaman yang kebal manipulasi. “Audit tetap ada setelah hapus laporan”
berarti tidak ikut penghapusan laporan biasa; reset seluruh demo memang mengembalikan seed.

Calon kontrak notifikasi: ID, ID penerima, scope pesantren, objek sumber, pesan, target URL,
waktu, dan status dibaca. Menargetkan role `pengelola` saja tidak cukup untuk isolasi pesantren.
Target harus tetap mempunyai perilaku yang jelas setelah laporan ditolak, diarsipkan, atau dihapus.

Notifikasi status ke pelapor login dan pelacakan publik masih usulan di SUGGESTIONS.
Nomor berurutan merupakan pengenal, bukan bukti kepemilikan laporan; nomor saja belum memberi
dasar menampilkan alasan penolakan atau detail privat kepada orang yang memasukkannya.

## 7. Penyimpanan dan reset demo

- Fakta V1: domain memakai `ishas-domain-v3`, sesi memakai `ishas-demo-session-v1`.
  Rancangan `ishas-mock-v4` adalah key baru. Pindah key tidak otomatis memeriksa atau membuang isi key lama.
- D-01 menentukan apakah V1 dan V2 harus hidup berdampingan. Jangan menghapus namespace V1
  sebelum batas migrasi disepakati; reset V2 harus menyebut persis data V2 yang direset.
- Draft memerlukan versi skema tersendiri, pesantren, kanal, versi instrumen jika berlaku,
  konteks pemilik, waktu simpan, dan hubungan kiriman. Kebijakan jumlah draft serta logout menunggu D-10.
- Simulasi bukti hanya menyimpan nama/metadata; sesudah refresh tidak boleh mengklaim isi berkas
  telah tersimpan atau terunggah ke server. Draft lokal tidak dapat dilanjutkan otomatis di perangkat lain.
- Penyimpanan rusak, kuota penuh, atau penyimpanan browser tidak tersedia perlu pesan kegagalan
  simpan dan pemulihan yang dapat dipahami. Jangan menampilkan “tersimpan” jika operasi gagal.
- Reset menghasilkan hubungan ID konsisten, membersihkan data V2 yang ditetapkan, serta tidak
  menyimpan kata sandi/token. Audit setelah reset berasal dari seed, bukan riwayat demo sebelumnya.

## 8. Seed dan alur demonstrasi yang dapat diperiksa

Seed awal menyebut tiga pesantren Aktif, tetapi hanya dua mempunyai pengelola.
Dua rancangan yang konsisten bisa dipilih: (a) hanya dua terdaftar, yang ketiga menjadi kasus
“Aktif tanpa pengelola”; atau (b) tambahkan pengelola untuk pesantren ketiga sehingga ketiganya terdaftar.
Pemilihan belum diputuskan. Status `Aktif` dan count “terdaftar” jangan disamakan dalam acceptance criteria.

Untuk setiap pesantren yang akan dipakai demo kirim, perlu akun pengelola yang dapat dipilih saat login
serta area yang sesuai kebijakan D-11. Tiga kartu **peran** login tidak otomatis membatasi total akun
seed menjadi tiga; cara memilih akun pengelola kedua menunggu D-09.

Rencana fixture tambahan untuk review, bukan data yang sudah dibuat:

| Kasus | Yang harus dapat dibuktikan |
|---|---|
| Dua pesantren dengan laporan masing-masing | Pengelola A tidak membaca/mengubah antrean B, termasuk notifikasi dan ID langsung |
| Pesantren Persiapan / Aktif tanpa pengelola / Nonaktif | Pemilih, kirim, dan arsip mengikuti definisi serta keputusan D-08 |
| Laporan menunggu, ditolak, diterima | Status moderasi dan hasil publik tidak tertukar |
| Penilaian satu/banyak/tanpa temuan | Penanganan report dan rekomendasi mengikuti D-05 |
| Published baru + draft/hasil versi lama | Snapshot dan kebijakan D-10 terjaga |
| Area tanpa denah + versi denah baru | Tidak ada koordinat palsu atau perpindahan titik historis |
| Tanpa hasil + seluruh jawaban N/A | Tidak ada skor/kategori atau tren palsu |
| Kirim ulang / keputusan dari dua jendela | Tidak ada report ganda atau keputusan saling menimpa tanpa deteksi |

## 9. Fungsi Peneliti perlu tetap terhubung

Tujuan perannya dapat dipertahankan, tetapi sumber data V2 perlu dipetakan: instrumen Published
ke form mandiri; snapshot kiriman diterima ke hasil; hasil ke dataset; serta dataset ke ekspor dummy.
Status Final dan relasi penugasan dari V1 tidak boleh diwarisi sebagai syarat tersembunyi.

Hak melihat jawaban mentah/identitas dan pemilihan kiriman untuk penelitian menunggu D-02/D-04.
Simulasi import tidak boleh menjadi jalur yang membuat laporan publik tampil tanpa moderasi.
Jika import hanya pratinjau dummy tanpa mutasi, sebutkan demikian dalam spesifikasi akhir.
