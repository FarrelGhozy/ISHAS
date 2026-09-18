# Rancangan Risk Map ISHAS

Tanggal: 18 September 2026. Status: DRAFT UNTUK REVIEW.
Luaran sesi ini: rancangan dan ilustrasi contoh, bukan implementasi aplikasi.
Dasar keputusan pemilik: D-14 pada [DECISIONS.md](DECISIONS.md).

## 1. Keputusan dan batas

Sudah diputuskan pemilik:

- Pengelola Pesantren mengunggah satu denah gambaran besar pesantren.
- Denah digunakan untuk menentukan titik lokasi pada pelaporan dan menampilkan
  lokasi temuan di dashboard publik.
- Peta tidak ditampilkan pada scope semua pesantren; pengguna memilih satu pesantren dahulu.
- Tidak memakai denah per gedung/per lantai. Lantai cukup berupa keterangan lokasi.
- Untuk tahap rancangan ini, gambar adalah ilustrasi pesantren fiktif.
- Sebelum unggah, tampilkan peringatan agar denah sebisa mungkin tidak diubah;
  sebelum penggantian, wajib ada pemberitahuan dampak perubahan lokasi.

Rincian pada bagian berikut merupakan usulan desain untuk ditinjau, bukan
persetujuan implementasi maupun ketentuan ilmiah final. Data dan tingkat risiko
tetap ilustratif. Izin denah publik tidak membuka identitas pelapor, kontak,
bukti/foto laporan, jawaban mentah, catatan internal, atau audit.

## 2. Bentuk visual

Denah berisi massa bangunan, masjid, asrama, kelas, dapur, kantor, lapangan,
jalur utama, dan ruang terbuka secara sederhana; bukan gambar teknis bangunan.
Gunakan pandangan hampir dari atas agar klik titik mudah dipahami. Tidak ada
ruangan, ukuran teknis, atau detail keamanan sensitif. Denah bukan peta geografis.

Gambar dasar tidak mengandung pin, angka risiko, status, atau heatmap.
Label area dan pin dirender terpisah oleh aplikasi berdasarkan data. Dengan
demikian perubahan validasi, filter, dan tindak lanjut tidak perlu mengganti gambar.
Warna lanskap tidak menyatakan tingkat risiko. Identitas UI tetap marun;
risiko memakai Tinggi/Sedang/Rendah dengan label dan ikon. Tidak menambah Ekstrem.

Ilustrasi harus berlabel `Ilustrasi denah · bukan lokasi sebenarnya` saat dipakai
sebagai demo. Denah sungguhan kelak harus diunggah dan diperiksa pengelola.

## 3. Penempatan di dashboard

Panel `Peta Risiko` berada pada kolom samping, setelah panel aspek dan sebelum
tindak lanjut. Usulan lebar minimum 320px; pratinjau gambar rasio 3:2. Jika area
konten terlalu sempit, panel turun ke baris berikutnya, bukan memperkecil teks.

Scope semua pesantren:

- Pertahankan dashboard agregat dan pemilih pesantren yang sudah ada.
- Jangan tampilkan gambar denah atau pin lintas pesantren.
- Panel hanya berisi ikon netral, teks `Pilih pesantren untuk melihat peta risiko`,
  dan aksi `Pilih pesantren` yang mengarahkan fokus ke pemilih yang sudah tersedia.
- Jangan membuat pemilih lokal kedua atau otomatis memilih pesantren pertama.

Scope satu pesantren:

- Judul panel, nama pesantren, label `Data publik · ilustrasi`, versi denah.
- Denah aktif dan marker; ringkasan `Temuan bertitik` serta `Belum memiliki titik`.
- Legenda Tinggi/Sedang/Rendah, selalu label + ikon.
- Klik pin membuka ringkasan judul, area, keterangan lantai, tingkat risiko,
  status penanganan, nama validator/PIC bila tersedia.
- Nomor pin adalah nomor visual pada versi/filter itu, bukan nomor laporan internal.
- `Lihat peta lengkap` menuju `/peta-risiko?pesantren=...`, membawa konteks periode.
- Panel pratinjau bersifat hanya-baca; penentuan titik hanya pada form pelaporan.

Halaman `/peta-risiko` memakai dataset yang sama: denah lebih besar, filter
tingkat risiko/status/versi denah, daftar temuan, dan daftar tanpa titik.
Keterangan lantai dapat menjadi filter teks; bukan pergantian denah.
Pin dan baris daftar saling menyorot. Pada ponsel daftar/detail berada di bawah
denah; tidak bergantung pada hover dan tidak menyebabkan scroll horizontal halaman.

## 4. Alur ujung-ke-ujung

```text
Pengelola Pesantren (scope sendiri)
  → unggah denah besar → pratinjau → terbitkan versi aktif
                                     ↓
Publik / Pelapor memilih pesantren → area/keterangan lokasi → pilih titik
  → tinjau kiriman → kirim Menunggu validasi
                                     ↓
Pengelola memeriksa laporan + titik + versi denah
  → Ditolak: alasan wajib, tetap tidak publik
  → Diterima: severity/priority wajib, buat temuan berdasarkan sumber lokasi
                                     ↓
Selector publik → satu pesantren + laporan Diterima + belum diarsip
  → marker pada versi denah yang sesuai → detail ringkasan → tindak lanjut
                                     ↓
Semua temuan selesai → laporan Completed/arsip → tidak tampil publik
```

### A. Pengelolaan denah

1. `/pengelola/lokasi` menyediakan bagian `Denah Pesantren` di atas daftar area.
2. Pengelola hanya dapat mengunggah untuk pesantren dalam scope akunnya.
3. Usulan format PNG/JPEG/WebP, maksimum 5 MB, minimum sisi pendek 800px.
   Batas ini usulan UX, perlu diperiksa saat implementasi; SVG/PDF tidak termasuk tahap awal.
4. Validasi tipe berkas, ukuran dan kemampuan decode; nama berkas saja tidak cukup.
5. Pratinjau memastikan orientasi dan tidak mengandung informasi privat. Tampilkan
   pemberitahuan `Denah ini akan terlihat publik setelah pesantren dipilih`.
6. `Terbitkan denah` membuat versi baru immutable, menyimpan gambar, dimensi asli,
   pengunggah dan waktu; satu versi aktif untuk pelaporan baru per pesantren.
7. Versi sebelumnya tidak ditimpa/dihapus bila dirujuk laporan. Audit penerbitan
   tetap dicatat; tidak menambah akses baca audit bagi pengelola.
8. Crop/rotasi/penggantian gambar setelah terbit dianggap versi baru.
9. Nama area tetap memakai ID stabil. Label yang diganti tidak mengubah lokasi historis.

### A.1. Peringatan unggah dan konfirmasi penggantian

Arahan pemilik, 18 September 2026: peringatan ditampilkan sebelum unggah dan
sebelum penggantian. Penggantian tetap diperbolehkan bila diperlukan; bukan
larangan mutlak. Rincian copy/urutan berikut merupakan rancangan UX.

Sebelum tombol `Pilih gambar denah`, tampilkan pemberitahuan yang selalu terlihat:

> Gunakan denah yang akan dipakai secara tetap. Sebisa mungkin jangan mengganti
> denah setelah digunakan untuk pelaporan. Perubahan tata letak, orientasi, atau
> pemotongan gambar dapat membuat titik laporan lama tidak sesuai dengan denah baru.

Jika denah aktif sudah ada, aksi `Ganti denah` membuka dialog sebelum pemilih
berkas, bukan langsung menimpa gambar:

- Judul: `Ganti denah pesantren?`
- Isi: `Mengganti denah dapat membuat titik laporan lama tidak sesuai dengan
  posisi pada denah baru. Sebisa mungkin gunakan denah yang sama. Titik lama
  tetap tersimpan pada versi denah asal dan tidak dipindahkan otomatis.`
- Aksi awal/fokus: `Batal`; aksi lanjutan: `Lanjut pilih denah`.
- Batal, Esc, atau tutup dialog tidak mengubah gambar, titik, draft, atau versi aktif.

Setelah gambar dipilih, pratinjau menunjukkan denah lama dan calon denah baru,
versi terkait, serta jumlah temuan bertitik yang masih mengacu versi lama.
Angka berasal dari shared selector internal, bukan jumlah cluster publik.
Pemberitahuan dampak tetap terlihat pada tahap ini; tombol final bernama
`Terbitkan versi baru`, bukan `Timpa denah`.

Usulan konfirmasi final: checkbox tanpa centang default
`Saya memahami bahwa titik lama tidak otomatis sesuai dengan denah baru`.
Tombol penerbitan aktif setelah gambar valid dan checkbox dicentang. Konfirmasi
ini hanya persetujuan perubahan, bukan pengganti validasi berkas atau pemeriksaan scope.
Gambar yang baru dipilih belum mengubah denah aktif; versi aktif berpindah hanya
setelah penyimpanan aset dan metadata berhasil.

Peringatan tidak berarti sistem sengaja membiarkan lokasi berantakan. Pencegahan
datanya tetap wajib: titik lama terikat versi asal, tidak dihapus/diproyeksikan ke
gambar baru, dan dapat dibaca melalui pilihan versi sebelumnya. Draft lama perlu
penempatan ulang sebagaimana §4.B; pengguna tidak dijanjikan lokasi otomatis diperbaiki.

### B. Lapor cepat

1. Pilih pesantren terdaftar, kemudian area atau keterangan lokasi manual (D-11).
2. Tampilkan denah aktif untuk pesantren itu, bukan denah pesantren sebelumnya.
3. Klik/tap gambar menempatkan satu pin lokasi sementara; klik lain memindahkannya.
   Tersedia `Hapus titik`, konfirmasi lokasi dan kontrol keyboard alternatif.
4. Isi `Keterangan lokasi` dan `Lantai (opsional)`; misalnya
   `Asrama Putra · lantai 2 · dekat tangga`. Titik menunjukkan posisi pada kompleks,
   bukan posisi ruangan di lantai tertentu.
5. Usulan: titik opsional dengan alasan singkat bila denah tidak ada/gagal dimuat
   atau pelapor tidak yakin. Lokasi teks/area tetap wajib; tidak menghalangi laporan penting.
   Pilihan kewajiban titik belum diputuskan pemilik.
6. Tinjauan memperlihatkan titik, lokasi teks dan versi denah sebelum kirim.
7. Kiriman selalu Menunggu validasi, severity/priority Belum ditentukan.
8. Mengganti pesantren mereset area/titik/versi/keterangan lantai yang terkait
   setelah konfirmasi; judul/deskripsi laporan tetap dipertahankan.
9. Draft menyimpan titik dan ID versi denah. Jika versi aktif berubah, minta
   penempatan ulang pada versi baru sebelum kirim; jangan memindahkan titik otomatis.

### C. Penilaian mandiri

Gunakan komponen pemilih titik yang sama, tetapi lokasi disimpan per jawaban
indikator. Satu kiriman dapat menghasilkan beberapa temuan di beberapa titik.
Temuan turunan wajib merujuk jawaban sumbernya; jangan menyalin satu titik laporan
ke seluruh temuan. Kewajiban lokasi tetap mengikuti konfigurasi indikator.
Snapshot versi instrumen dan versi denah tidak berubah setelah pengiriman.

### D. Validasi dan tindak lanjut

Pengelola melihat pin pada versi denah saat pelaporan, bukan selalu versi terkini.
Periksa konsistensi pesantren, area, lantai, dan titik; titik pelapor tidak berarti
laporan sudah diterima. Tidak ada risiko default atau risiko yang dipilih pelapor.
Usulan awal: lokasi kiriman hanya-baca; bila salah gunakan penolakan beralasan dan
laporan koreksi sesuai lifecycle sekarang. Fitur koreksi titik oleh validator belum
termasuk; jika kelak dibutuhkan harus menyimpan titik asal, perubahan, alasan, dan audit.

Pin risiko mengikuti tingkat temuan tervalidasi, bukan warna lokasi atau status
tindak lanjut. `Completed` tidak otomatis menurunkan risiko menjadi Rendah;
laporan diarsip sesuai D-07 setelah semua temuannya selesai (D-05).

## 5. Kontrak data yang diusulkan

| Entitas | Field utama | Aturan |
|---|---|---|
| CampusPlanVersion | id, institutionCode, revision, assetId, width, height, uploadedBy, uploadedAt, publishedAt | Versi gambaran besar immutable; bukan anak Floor |
| Institution | activeCampusPlanVersionId (nullable) | Referensi versi aktif milik pesantren yang sama |
| LocationSnapshot | areaId nullable, areaNameSnapshot, locationText, floorNote, campusPlanVersionId nullable, point nullable, noPointReason nullable | Snapshot lokasi, point = x/y persentase 0–100 terhadap gambar asli |
| Report lapor-cepat | locationSnapshot | Satu sumber lokasi utama; bukan salinan state komponen peta |
| IndicatorAnswer | locationSnapshot | Sumber lokasi per jawaban; snapshot instrumen tetap terpisah |
| RiskFinding | reportId, sourceAnswerId nullable, locationSnapshot | Diturunkan dari sumber yang benar, ID stabil dan lineage dapat ditelusuri |
| PublicMapItem | public-safe key, lokasi ringkas, point, versionId, level, status, validator/PIC | Whitelist bidang publik; tidak menyebarkan objek Report/RiskFinding mentah |

ID pada kontrak internal bukan izin menampilkan nomor laporan kepada publik.
`point: null` berarti tidak ada titik, bukan x=50/y=50 dan bukan x=0/y=0.
Jika titik ada, versi denah wajib ada dan harus milik pesantren yang sama.
Koordinat harus finite; x=0 dan y=0 sah. Tolak payload di luar rentang, jangan
diam-diam memotong nilai invalid. Penyimpanan melalui shared repository/store;
gambar dan metadata mempunyai ID yang saling terhubung.

Klik dihitung terhadap kotak gambar asli yang benar-benar dirender:
`x = 100 × (pointerX − imageLeft) / renderedImageWidth`, sama untuk y.
Padding/letterbox dari object-fit bukan bagian gambar dan tidak boleh diklik.
Zoom/pan membalik transform sebelum menghitung titik; resize hanya mengubah
render, bukan koordinat tersimpan. Titik bukan latitude/longitude.

## 6. Konsistensi selector, versi, dan hitungan

Satu pipeline shared: pesantren terdaftar → laporan Diterima belum diarsip →
filter scope → filter periode bila benar-benar diimplementasikan → temuan turunan →
whitelist publik → kelompok versi denah dan ketersediaan titik.

- Dashboard dan halaman peta lengkap memakai selector serta definisi unit yang sama.
- Marker mewakili satu temuan, bukan satu laporan; satu laporan bisa mempunyai banyak temuan.
- Pin bertumpuk menjadi cluster netral dengan jumlah temuan dan label
  `Tingkat tertinggi: Tinggi/Sedang/Rendah`; klik membuka anggotanya.
  Ringkasan tetap menghitung anggota, bukan jumlah cluster.
- Untuk setiap scope/filter: total temuan = bertitik di versi yang tampil +
  bertitik di versi lain + tanpa titik. Jumlah cluster tidak digunakan pada persamaan.
- Default tampilkan denah aktif. Temuan pada versi lama tidak ditempelkan pada
  gambar baru; sediakan `Temuan pada versi sebelumnya` dan pilihan versi.
- Tidak ada reproyeksi otomatis walau ukuran/rasio gambar tampak sama.
- Pemilih versi denah terpisah dari versi instrumen dan periode; masing-masing
  punya makna sendiri dan disimpan dalam query URL pada halaman lengkap.
- Kode pesantren invalid/tidak terdaftar tidak boleh membuka denah cached.
  Tampilkan pemberitahuan dan state pilih pesantren sesuai guard route.
- Periodisasi detail sekarang belum lengkap di kode dashboard. Jangan mengklaim
  semua pin terfilter periode hanya karena URL memiliki `periode`; implementasi
  harus menetapkan kontrak tanggal yang sama atau memberi notice keterbatasan.

## 7. State dan aksesibilitas

| Keadaan | Tampilan/perilaku |
|---|---|
| Semua pesantren | Ajakan pilih pesantren; tanpa gambar/pin |
| Pesantren dipilih, tanpa denah | `Denah pesantren belum tersedia`; daftar temuan tetap dapat dibaca |
| Denah tersedia, nol temuan | Denah netral + `Belum ada temuan tervalidasi`; bukan klaim aman |
| Temuan tanpa titik | Daftar `Belum memiliki titik`; tidak menaruh pin di tengah |
| Denah aktif tanpa pin, versi lama punya pin | Denah aktif netral + notice dan akses versi lama |
| Filter tanpa hasil | `Tidak ada temuan pada filter ini`; aksi reset filter |
| Gambar gagal dimuat | Pesan error + Coba lagi + daftar lokasi; tidak menyembunyikan laporan |
| Memuat/ganti pesantren | Skeleton dan label pesantren tujuan; segera kosongkan pin pesantren lama |
| Pin bertumpuk | Cluster jumlah; buka daftar, termasuk lokasi sama tetapi lantai berbeda |

Usulan target sentuh minimum 44px, fokus marun terlihat, label pin dapat dibaca
screen reader. Semua detail dapat diakses dari daftar tanpa klik gambar. Penentuan
titik dapat melalui keyboard (gerakkan penunjuk, konfirmasi, hapus) dan tersedia
opsi tanpa titik. Pada ponsel ketuk lokasi lalu konfirmasi; jangan mengandalkan drag.
Tidak ada popover yang terpotong sisi panel. Halaman peta penuh boleh zoom/pan
di dalam canvas; scroll halaman tetap bekerja di luar canvas.

## 8. Gap implementasi yang ditemukan (belum diperbaiki)

- Dashboard `dashboard-page.tsx` belum mempunyai panel denah.
- `public-read-pages.tsx` RiskMap saat ini hanya daftar area/temuan.
- `Floor.planFile` sekarang menyimpan nama file per lantai, bukan aset denah kampus.
- `Report.planPoint` belum mempunyai FK versi denah kampus; jawaban indikator
  juga belum menyimpan referensi versi denah lengkap.
- `RiskFinding.x/y` wajib angka dan processor turunan mengambil `area.x/y`
  atau fallback 50/50. Ini tidak boleh dipakai sebagai bukti titik yang dipilih pelapor.
- Pembuatan area juga memberi titik 50/50. Titik area/centroid, bila dipertahankan,
  harus dibedakan dari titik observasi dan tidak menjadi fallback publik.
- Form lapor cepat belum menyediakan pemilih titik.
- Pengelolaan unggah sekarang hanya menyimpan nama file dummy; pratinjau gambar
  memerlukan penyimpanan aset nyata untuk prototipe, bukan nama berkas semata.

Usulan prototipe: metadata schema baru di shared mock store, aset unggahan di
IndexedDB dengan assetId; jangan menyimpan base64 besar di localStorage.
Seed ilustrasi dapat menunjuk aset statis lokal. Penulisan metadata baru dilakukan
setelah aset berhasil disimpan; kegagalan unggah/kirim tidak boleh menghasilkan
referensi rusak. Reset demo membersihkan metadata dan aset demo secara konsisten.
Backend kelak memakai object storage dan otorisasi server; belum bagian tahap ini.

Migrasi: jangan menganggap x/y lama sebagai titik observasi. Data tanpa provenance
dipindahkan sebagai tanpa titik; denah per lantai lama tetap historis/internal,
tidak otomatis dijadikan denah besar. Tambah schema version, migration dan reset
seed teruji sebelum mengaktifkan tampilan publik baru.

## 9. Urutan implementasi setelah persetujuan

1. Setujui rancangan/ilustrasi dan kewajiban titik; aktifkan satu stage revisi utama.
2. Schema, repository aset, migration/reset dan selector map yang teruji.
3. Pengelolaan denah kampus oleh pengelola dan versi aktif/historis.
4. Shared viewer/picker; integrasikan lapor cepat dan penilaian mandiri/draft.
5. Validasi lokasi dan turunan temuan dengan lineage jawaban yang benar.
6. Panel dashboard + halaman peta lengkap; URL scope/versi/filter konsisten.
7. Uji lint/typecheck/test/build serta visual/alur; ajukan REVIEW, bukan DONE.

Tidak merombak skor, instrumen Published, seluruh dashboard, atau hak role lain.
Perubahan lintas Stage 02/03/04/07/08/09 dicatat sebagai satu revisi Risk Map;
hasil uji stage lama tidak membuktikan fitur baru sudah lulus.

## 10. Pemeriksaan penerimaan

- [ ] Peringatan menjaga denah tetap tampil sebelum memilih berkas, termasuk unggah pertama.
- [ ] Ganti denah membuka pemberitahuan sebelum memilih berkas; Batal/Esc tidak mengubah data.
- [ ] Pratinjau ulang menampilkan dampak dan konfirmasi final tanpa centang default.
- [ ] Upload oleh pengelola scope sendiri berhasil; lintas pesantren ditolak.
- [ ] Denah baru tidak menimpa versi lama; gagal simpan tidak mengubah versi aktif.
- [ ] Scope semua pesantren tidak menampilkan peta; selected invalid tidak bocor.
- [ ] Titik lapor cepat tersimpan persis; tanpa titik tidak mendapat 50/50.
- [ ] Multi-temuan penilaian mandiri memakai titik jawaban sumber masing-masing.
- [ ] Menunggu validasi/Ditolak tidak muncul atau memengaruhi cluster/count publik.
- [ ] Severity/priority saat Diterima wajib dipilih pengelola, tanpa default.
- [ ] Publik hanya melihat whitelist; berkas denah juga bebas identitas sensitif.
- [ ] Versi lama hanya dirender pada gambar versinya; draft usang meminta titik ulang.
- [ ] Ganti pesantren membersihkan pilihan lama; refresh/Back/Forward konsisten.
- [ ] Pin tepi 0/100, resize, letterbox, zoom, keyboard dan ponsel diuji.
- [ ] Cluster/count, daftar tanpa titik dan distribusi risiko memakai unit identik.
- [ ] Completed seluruh temuan mengarsip laporan dan menghilangkan pin publik.
- [ ] Pesantren Nonaktif/kehilangan pengelola tidak dapat dilaporkan/ditampilkan publik.
- [ ] Denah tidak ada/gagal muat tetap menyediakan alur lokasi teks yang jelas.
- [ ] Desktop 1440px, tablet 834px, ponsel 390px tanpa overflow; label tetap terbaca.

Pemeriksaan sesi rancangan: pembacaan dokumen dan kode, bukan uji aplikasi.
Checklist implementasi di atas belum dijalankan. Tidak ada commit/push.

## 11. Ilustrasi dan proses generasi

Gambar dibuat menggunakan fitur generasi gambar bawaan melalui skill imagegen.
Prompt final disimpan di [RISK_MAP_IMAGE_PROMPT.md](RISK_MAP_IMAGE_PROMPT.md).
Ilustrasi hanya base map fiktif tanpa pin yang dibakar ke gambar; bukan hasil
Risk Map yang sudah berfungsi. Luaran: [ilustrasi denah v1](assets/risk-map-campus-illustration-v1.png)
(1536 × 1024). Pemeriksaan visual: gambaran kompleks dan massa bangunan terbaca;
tidak ada denah ruangan/per lantai, teks, pin, atau lokasi nyata. Detail fasad hanya
ilustratif, bukan data gedung. Skill imagegen memengaruhi pemisahan bitmap dasar
dan marker dinamis; kode aplikasi tidak diubah.

![Ilustrasi denah pesantren fiktif](assets/risk-map-campus-illustration-v1.png)
