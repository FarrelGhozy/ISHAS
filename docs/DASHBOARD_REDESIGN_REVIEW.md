# Review arah dashboard — referensi dosen 18 September 2026

**Status: bahan review dan persiapan; belum implementasi.**

Permintaan pemilik: analisis gambar, evaluasi dokumentasi, dan persiapkan pengerjaan
dashboard utama yang kurang lebih mengikuti gambar. Arahan ini mengizinkan persiapan
redesign, tetapi belum menentukan seluruh perubahan aturan di dalam gambar.

Referensi: `WhatsApp Image 2026-09-17 at 23.46.41.jpeg`, disampaikan pemilik pada
18 September 2026. Gambar adalah referensi visual; teks, angka, dan contoh input di
dalamnya bukan instruksi operasional maupun bukti rumus ilmiah final.

## 1. Pembacaan gambar

Layout desktop memakai sidebar kiri, area analitik utama sekitar dua pertiga lebar
konten, dan kolom informasi/peta/tindak lanjut sekitar sepertiga. Kartu putih,
border lembut, judul berikon, dan jarak rapat membentuk dashboard pemantauan.

| Blok referensi | Fungsi yang terlihat | Perbedaan terhadap rancangan saat ini |
|---|---|---|
| Sidebar | Dashboard, profil, pelaporan, penilaian risiko, rekapitulasi, peta, tindak lanjut, laporan, pengaturan | Shell publik sekarang header ringan; pengaturan dan pengelolaan tidak otomatis menjadi menu publik |
| Ringkasan kondisi | Safety Score 78/100, total indikator 43, sesuai 31, tidak sesuai 12; count risiko | Menggabungkan skor dan ringkasan jawaban; metrik harus dibedakan dari jumlah temuan |
| Tren | Grafik garis enam periode | Dapat memakai komponen tren yang tersedia; riwayat masih ilustratif |
| Tingkat risiko | Donat Rendah/Sedang/Tinggi/Ekstrem | Processor dan enum aktif baru mendukung tiga tingkat |
| Temuan per aspek | Bar Keselamatan, Kesehatan, Lingkungan, Psikososial | Berbeda dari panel skor dimensi; perlu pengaitan temuan ke aspek yang stabil |
| Kategori aspek | Empat kartu berikon dan deskripsi singkat | Seed Published saat ini dua dimensi, enam indikator; empat aspek perlu pemetaan atau versi baru |
| Form pelaporan | Lokasi, dimensi, aspek, indikator, kondisi, foto, bahaya, Likelihood, Severity, skor, rekomendasi | Form ini mencampur pengisian instrumen, pelaporan, dan penetapan risiko; alur sekarang memisahkan pelapor dari validator |
| Rekapitulasi | Tabel per dimensi dan per lokasi | Perlu selector bersama agar konsisten dengan grafik dan ringkasan |
| Peta risiko | Ilustrasi kompleks pesantren dengan marker | Denah rinci dan titik saat ini internal menurut D-02; agregat banyak pesantren tidak dapat memakai satu denah |
| Tindak lanjut | Temuan, tingkat risiko, PIC, target, status | PIC boleh publik; target/tenggat internal menurut matriks bidang yang berlaku; label status harus konsisten |

## 2. Angka contoh bukan kontrak data

- `31 + 12 = 43` cocok sebagai contoh klasifikasi indikator, tetapi donat juga
  menamai 43 sebagai total temuan. Indikator, jawaban, dan temuan bukan unit yang sama.
- Donat: `18 + 15 + 7 + 3 = 43`. Grafik aspek: `12 + 9 + 7 + 4 = 32`.
  Jika grafik menyatakan semua temuan, selisih ini harus dijelaskan atau dihilangkan.
- Tabel dimensi: risiko tinggi `2 + 1 + 0 + 3 = 6`, sedangkan kartu/donat menampilkan 7.
- Tabel lokasi hanya berjumlah `12 + 8 + 6 + 4 + 7 = 37`; jika hanya sebagian lokasi,
  judul dan jumlah baris harus menyatakan bahwa ini cuplikan.
- `78/100` tidak sama dengan persentase `31/43` (sekitar 72,1%). Jangan menyimpulkan
  bahwa Safety Score dihitung dari proporsi sesuai.
- Contoh Likelihood 3, Severity 3, skor 9 dan MODERATE menunjukkan kemungkinan
  perkalian, tetapi rentang skala, matriks ambang, dan kewenangannya belum ditetapkan.
- Form memilih `Sesuai` tetapi berisi temuan beban berlebih. Hubungan kondisi dan
  pembentukan temuan membutuhkan definisi, bukan inferensi dari contoh gambar.

## 3. Aturan yang masih berlaku sampai ada keputusan perubahan

- `/` publik tanpa login, isi dataset sama untuk semua sesi; akun aktif di kanan atas.
- Default agregat semua Pesantren terdaftar dengan pilihan satu pesantren (README).
- Hanya laporan `Diterima` yang memenuhi syarat publik; `Completed` diarsipkan dan
  tidak publik (D-07), pesantren tidak terdaftar tidak publik (D-08).
- Nama pelapor, kontak, bukti/foto, jawaban mentah, denah rinci/titik, tenggat internal,
  catatan dan audit tidak publik. Nama validator/PIC boleh publik (D-02 + matriks §6).
- Pengirim publik/Pengelola Pesantren masuk antrean validasi. Severity/priority
  ditentukan pengelola saat menerima, tanpa default; penolakan minimal 10 karakter.
- Super Admin dan Peneliti tidak mengirim saat login (D-03). Tidak ada pemilih peran.
- Identitas marun, status berlabel dan berikon, serta penanda `Data ilustrasi` tetap
  berlaku. Warna toska gambar belum menjadi pengganti token ISHAS.
- Instrumen Published tidak diubah langsung. Perubahan struktur/opsi/aturan harus
  lewat versi baru; snapshot hasil lama tetap memakai versi asal.
- D-04 mengizinkan aturan skor ilustratif, bukan rumus final. Label “Cukup Baik”,
  Ekstrem, serta ambang matriks belum disahkan oleh gambar.

## 4. Usulan susunan dashboard yang bisa ditinjau

Ini usulan untuk halaman utama publik berdasarkan kata “dashboard utama”; sasaran
route, warna, dan perubahan aturan masih ditanyakan kepada pemilik (D-13).

1. Header identitas + akun/Masuk; bar konteks pesantren, periode, versi, data ilustrasi.
2. Sidebar publik desktop untuk halaman baca dan kanal kirim yang sudah tersedia.
   Pengaturan tetap workspace. Di tablet/ponsel navigasi menjadi menu ringkas.
3. Area utama: ringkasan skor melingkar dan ringkasan indikator berdampingan dengan tren.
4. Baris kedua: donat risiko temuan dan grafik jumlah temuan per aspek.
5. Baris ketiga: rekap dimensi dan lokasi; tautan melihat hasil lebih lengkap.
6. Kolom samping: kategori aspek, ringkasan lokasi risiko, dan tindak lanjut ringkas.
7. Panel pelaporan ringkas dengan CTA ke `/lapor` dan `/penilaian-mandiri`.
   Form lengkap dalam dashboard baru ditentukan setelah kanal dan hak field jelas.

Jika batas D-02 dipertahankan, panel lokasi publik memakai daftar area/temuan yang
diizinkan, sedangkan denah bertitik hanya workspace. Pada scope semua pesantren,
tampilkan ringkasan per pesantren; jangan menggambar satu kompleks fiktif yang
mengaku mewakili semuanya. Area tanpa temuan memakai keadaan netral, bukan “aman”.

Desktop 1440×900: susunan utama + kolom samping; konten boleh scroll vertikal agar
teks tetap terbaca. Tablet 834×1112: dua kolom lalu kolom samping di bawah.
Ponsel 390×844: satu kolom, ringkasan → tren → risiko → aspek → rekap → lokasi →
tindak lanjut → pelaporan. Tabel scroll di panel; halaman tidak overflow.

## 5. Kontrak metrik yang perlu disiapkan

| Metrik | Sumber/rencana | Batas sebelum kode |
|---|---|---|
| Skor total dan tren | Processor D-04 + snapshot versi instrumen; riwayat seed berlabel ilustrasi | Tidak mengganti rumus/ambang dari gambar; periode belum sepenuhnya mengikat angka utama di kode saat ini |
| Total indikator | Instrumen dari snapshot yang dipilih | Bedakan katalog indikator dari total jawaban lintas pesantren/versi; tidak menjumlahkan katalog seolah unik |
| Sesuai/tidak sesuai | Jawaban snapshot penilaian `Diterima` | Opsi saat ini likert/boolean; pemetaan, sebagian sesuai, N/A, dan denominator belum diputuskan |
| Donat risiko | Temuan dari selector publik, satu hitung per ID temuan | Tiga tingkat saat ini; Ekstrem memerlukan keputusan dan perubahan lintas enum/processor/filter |
| Grafik aspek | Temuan dengan relasi aspek/indikator yang eksplisit | Lapor cepat belum tentu berindikator; perlu kategori `Belum dipetakan`, jangan klasifikasi berdasarkan teks judul |
| Rekap dimensi/lokasi | Dataset dan filter yang sama dengan ringkasan | Jelaskan unit, hasil tanpa lokasi, aspek belum dipetakan, dan baris cuplikan |
| Tindak lanjut | Rekomendasi yang terkait laporan publik | Jangan bocorkan field internal melalui tabel; label status sesuai objek, bukan menyamakan Completed/Terverifikasi |

Empat aspek pada referensi merupakan calon struktur. Seed saat ini menempatkan
jalur evakuasi dalam Sanitasi & Kebersihan; pemetaan ulang perlu review isi, bukan
hanya mengganti nama dua dimensi menjadi empat. Jumlah 43 indikator bukan jumlah
instrumen final. Telaah ilmiah proposal tidak diulang dalam review ini.

## 6. Evaluasi dokumentasi dan dependensi

| Temuan dokumentasi | Persiapan yang dibutuhkan |
|---|---|
| README/TODO masih memuat klaim historis semua kode BACKLOG, sementara bagian akhir mencatat implementasi | Bedakan catatan audit 8 September dari status kini; daftar keputusan 9 September lebih baru daripada daftar pertanyaan awal |
| planning/README dan TODO menulis Stage 04 IN PROGRESS, file stage menulis REVIEW | Rekonsiliasi setelah memeriksa hasil dan persetujuan pemilik; jangan memilih status berdasarkan dugaan |
| Beberapa stage masih menyebut D-05–D-11 terbuka walau sebagian dijawab 9 September | Sinkronkan per subpertanyaan; keputusan satu bagian tidak menutup seluruh isu ilmiah |
| Banyak stage IN PROGRESS bersamaan | Pilih satu stage implementasi utama saat mulai redesign; status lama tidak diubah sepihak dalam review ini |
| D-01 menyebut aplikasi lain, kode dashboard tersedia di `apps/web/` repository ini | Pastikan target aplikasi sebelum kode; review ini hanya membaca implementasi lokal |
| Stage 02 menyebut panel antrean dalam tujuan tetapi checklist melarangnya | Checklist D-02 yang disetujui menjadi acuan; bersihkan kalimat historis saat sinkronisasi |
| D-04 tercantum dua kali; wireframe/desain menunggu D-12 | D-13 menjadi catatan perubahan terbaru; rapikan duplikasi saat sinkronisasi keputusan |

## 7. Urutan pengerjaan yang disiapkan

- [x] Analisis blok gambar dan konflik dengan aturan/dataset sekarang.
- [x] Periksa dokumen inti, keputusan, planning/TODO, dashboard/shell, seed dan tipe mock lokal.
- [x] Siapkan susunan responsif, kontrak metrik, dependensi, dan pertanyaan keputusan.
- [ ] Terima keputusan D-13: route/scope, warna, serta apakah aturan gambar wajib.
- [ ] Jika ada aturan baru, detailkan izin denah publik, skala/ambang/pelaku penilaian,
  kanal form, pemetaan empat aspek, kategori jawaban, dan istilah status.
- [ ] Sinkronkan ROLES, ROUTES, FLOWS, DATA_MODEL/DATA_REQUIREMENTS, WIREFRAMES,
  DESIGN_SYSTEM, TEST_PLAN, dan stage terkait sesuai jawaban; tentukan target aplikasi.
- [ ] Aktifkan satu stage redesign setelah arahan mulai implementasi; Stage 02 tetap REVIEW
  untuk hasil sebelumnya, revisi baru dicatat terpisah agar bukti uji lama tidak dipakai ulang.
- [ ] Implementasikan shell/layout, lalu panel berbasis selector/processor shared.
- [ ] Jika struktur instrumen berubah, buat versi baru dan rencana migrasi schema/reset;
  pertahankan snapshot historis, ID stabil, serta isolasi data tiap pesantren.
- [ ] Uji desktop/tablet/ponsel, keyboard, menu mobile, filter URL dan Back/Forward,
  direct URL/role, empty state, konsistensi jumlah grafik/tabel, dan kebocoran bidang publik.
- [ ] Uji alur kirim → antrean → terima/tolak → publik → tindak lanjut → arsip;
  jalankan lint, typecheck, test yang relevan, dan build. Catat hasil baru lalu REVIEW.

## 8. Batas hasil review ini

Tidak ada kode, seed, token, route, atau hak akses yang diubah. Tidak ada commit/push.
Uji browser dan pemeriksaan aplikasi tidak dijalankan; ini persiapan dokumentasi,
bukan klaim bahwa dashboard baru telah dibangun atau disetujui.
