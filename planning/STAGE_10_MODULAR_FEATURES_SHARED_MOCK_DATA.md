# Stage 10 — Modularisasi Fitur dan Shared Mock Data

**Status:** IN PROGRESS

**Tujuan:** memecah komponen besar menjadi modul per fitur dan menjadikan seluruh data dummy sebagai satu sumber bersama agar perubahan antarhalaman dan antarrole dapat diuji sebagai alur prototipe yang utuh.

**Dependency:** Stage 09 sudah `DONE` dan route utama stabil.

## Latar Belakang

- Komponen workspace per role dan stylesheet utama sudah terlalu besar untuk dipelihara dengan aman.
- Data user, pesantren, instrumen, penugasan, assessment, lokasi, hasil, rekomendasi, serta tindak lanjut tersebar di dalam komponen.
- Kontrak `IshasApi` sudah tersedia, tetapi belum dipakai sebagai boundary data frontend.
- Mutation dummy umumnya hanya mengubah state satu halaman dan hilang ketika halaman dilepas.
- Beberapa ID dan atribut dummy tidak konsisten antarhalaman.
- Finalisasi assessment belum mengalir ke hasil, peta risiko, rekomendasi, audit, dan notifikasi.

## Keputusan Arsitektur

- Pertahankan route dan shared shell dari Stage 09.
- Struktur target mengikuti `app`, `features`, `shared`, dan `mocks` di dalam `apps/web`; tidak perlu memindahkan project ke folder `src`.
- Shared external store digunakan untuk sesi/autentikasi dummy. State domain bersama menggunakan external store berbasis `useSyncExternalStore` agar tidak menambah dependency baru pada prototipe.
- Seluruh akses data halaman melalui selector/action store atau mock adapter yang mengikuti kontrak `IshasApi`.
- Data seed, repository/mock API, fixture, dan processor dummy ditempatkan di `apps/web/mocks/`.
- Data domain tidak boleh didefinisikan sebagai array besar di komponen halaman.
- State lokal hanya untuk kebutuhan sementara seperti modal terbuka, input yang belum disimpan, tab, atau filter lokal.
- Data dummy yang sudah disimpan dipertahankan saat berpindah route dan refresh menggunakan penyimpanan browser berversi. Sediakan aksi reset ke seed awal.
- Jangan menyimpan kata sandi, token, atau data yang dianggap sensitif dalam persisted mock store.
- Perubahan harus mempertahankan desain, copy utama, dan cakupan fitur; refactor ini bukan redesign.
- Perhitungan hasil tetap simulasi yang diberi label jelas. Jangan menciptakan formula ilmiah final.

## Struktur Target

```text
apps/web/
├── app/
│   ├── (auth)/
│   └── (workspace)/
├── features/
│   ├── admin/
│   │   ├── pages/
│   │   ├── components/
│   │   └── selectors.ts
│   ├── peneliti/
│   ├── asesor/
│   └── pengelola/
├── shared/
│   ├── auth/
│   ├── components/
│   ├── layout/
│   ├── types/
│   └── utils/
└── mocks/
    ├── seed/
    ├── store/
    ├── adapters/
    ├── processors/
    └── fixtures/
```

Nama folder dapat disesuaikan selama pemisahan tanggung jawabnya tetap sama dan tidak menciptakan dua pola arsitektur sekaligus.

## Model Data Minimum

Satu seed/store bersama harus mencakup:

- session, user, role, permission, dan scope;
- institution dan status onboarding;
- instrument, instrument version, dimension, indicator, answer option, evidence requirement, scoring configuration dummy, dan recommendation rule;
- assessment assignment;
- assessment, answer, evidence, input source, serta status lifecycle;
- building, floor, area, floor plan, dan versi denah;
- assessment result dan dimension result;
- risk observation dan residual risk;
- recommendation, follow-up, evidence penyelesaian, dan verification;
- report, audit event, dan notification.

Semua relasi memakai ID stabil. Nama tampilan tidak digunakan sebagai foreign key.

## Ruang Lingkup

### 1. Pemecahan komponen

- Pindahkan setiap halaman role ke file/page tersendiri.
- Pisahkan komponen domain yang dipakai lebih dari satu halaman.
- Pisahkan komponen layout bersama dari komponen fitur.
- Pindahkan tipe domain ke modul bersama atau gunakan langsung kontrak yang sudah tersedia.
- Pertahankan `app/globals.css` untuk token dan aturan global; pindahkan style khusus fitur ke modul/style fitur secara bertahap.
- Ganti modal custom yang rawan masalah fokus dengan primitive dialog yang sudah tersedia ketika perilakunya setara.

### 2. Shared mock repository/store

- Pindahkan seluruh data dummy keluar dari komponen.
- Buat seed data konsisten dan tervalidasi relasinya.
- Buat selector turunan untuk jumlah, progress, filter, status, dan ringkasan; jangan menyimpan angka turunan secara terpisah jika dapat dihitung.
- Implementasikan mutation dummy melalui action/repository bersama.
- Tambahkan schema version dan reset seed untuk mencegah data browser lama merusak demo setelah model berubah.
- Hubungkan loading, empty, success, conflict, locked, dan forbidden ke hasil mock adapter yang konsisten.

### 3. Alur lintas role

- User dan pesantren yang dibuat Admin muncul pada daftar yang relevan.
- Versi instrumen yang dibuat/dipublikasikan Peneliti menjadi sumber konfigurasi assessment baru.
- Lokasi yang dibuat Pengelola tersedia bagi Asesor sesuai institution assignment.
- Penugasan menjadi relasi eksplisit antara institution, assessor, period, schedule, dan published instrument version.
- Jawaban, bukti, lokasi, serta progress assessment berasal dari assessment yang sama.
- Finalisasi mengunci assessment dan membentuk hasil/risk/recommendation dummy yang dapat dibuka Pengelola.
- Rekomendasi yang dimulai muncul pada Tindak Lanjut dengan PIC, tenggat, dan catatan yang benar-benar dipilih pengguna.
- Mutation penting menambah audit event dan notifikasi dummy yang sesuai.

### 4. Konsistensi data dan flow

- Progress assessment dihitung dari seluruh field wajib: jawaban, bukti, lokasi, serta alasan N/A.
- Opsi N/A, evidence, dan location mengikuti konfigurasi indikator pada instrument version terkait.
- Filter periode pada hasil dan peta risiko benar-benar mengganti dataset.
- Filter tingkat risiko dan status pekerjaan digunakan konsisten pada daftar area, denah, daftar temuan, dan detail.
- Perbandingan dimensi antarversi memakai ID/mapping yang stabil dan menampilkan status tidak dapat dibandingkan bila struktur berubah.
- Published instrument dan Finalized assessment bersifat immutable pada store.
- Koreksi data final tidak disimulasikan sebelum role, alasan, dan workflow disetujui.

## Di Luar Ruang Lingkup

- Backend, database, object storage, email, dan autentikasi produksi.
- Formula ilmiah, bobot final, threshold, reverse scoring, missing-value rule, dan recommendation rule resmi.
- GIS, native mobile, sensor/IoT, atau integrasi eksternal.
- Redesign visual menyeluruh.
- Penetapan pemeriksa tindak lanjut, reviewer assessment, dan pemilik Manajemen Penugasan tanpa keputusan pemilik proyek/dosen.

## Urutan Implementasi

1. Bekukan baseline visual dan skenario demo setiap route.
2. Bentuk folder `features`, `shared`, dan `mocks` serta aturan import.
3. Pindahkan kontrak/tipe yang menjadi sumber bersama tanpa mengubah behavior.
4. Buat seed dan store dasar untuk session, user, institution, instrument, assignment, dan location.
5. Migrasikan halaman Admin ke store bersama.
6. Migrasikan halaman Peneliti dan sambungkan versioning/publish dummy.
7. Migrasikan halaman Asesor dan perbaiki persiapan, progress, bukti, serta finalisasi.
8. Migrasikan halaman Pengelola dan sambungkan hasil, risk, recommendation, follow-up, serta report.
9. Tambahkan audit event, notifikasi, persistence berversi, dan reset data demo.
10. Hapus data/tipe/komponen lama yang sudah tidak memiliki pemakai setelah verifikasi parity.
11. Sinkronkan status requirement, NFR, open question, dan development plan pada checklist proyek.
12. Jalankan skenario demo lintas role, pemeriksaan visual, lint, TypeScript, test, dan production build.

## Acceptance Criteria

- [x] Setiap halaman utama berada pada modul fitur yang jelas dan tidak lagi bergantung pada satu workspace monolitik.
- [x] Shared shell dan autentikasi tidak diduplikasi di folder role.
- [x] Seluruh seed/data domain dummy berada di `apps/web/mocks/`.
- [x] Tidak ada array data domain besar yang tersisa di komponen halaman.
- [x] `IshasApi` atau interface penggantinya benar-benar digunakan sebagai boundary akses data.
- [x] Semua relasi lintas fitur memakai ID stabil dan lolos pemeriksaan referensial seed.
- [x] Perubahan data bertahan saat berpindah route dan setelah refresh.
- [x] Tersedia aksi reset data dummy ke kondisi awal demo.
- [x] Lokasi baru dari Pengelola dapat dipilih Asesor pada institution yang sama.
- [x] Instrument version Published menjadi sumber indikator, N/A, bukti, dan kebutuhan lokasi pada assessment.
- [x] Progress assessment menghitung seluruh kelengkapan wajib.
- [x] Finalisasi mengunci assessment dan memperbarui hasil, risiko, serta rekomendasi dummy Pengelola.
- [x] Rekomendasi yang dimulai muncul di Tindak Lanjut dengan input pengguna yang benar.
- [x] Filter periode/risk/status menghasilkan data yang konsisten pada seluruh tampilan terkait.
- [x] Mutation penting memperbarui audit log dan notifikasi dummy.
- [x] Published dan Finalized tidak dapat diubah melalui mutation biasa.
- [ ] Tampilan desktop, tablet, dan ponsel tetap setara dengan baseline.
- [x] Test store, selector, guard, dan flow kritis berhasil.
- [x] Checklist requirement dan keputusan proyek diperbarui sesuai hasil implementasi serta item yang tetap terbuka.
- [x] Lint, TypeScript, dan production build berhasil.

## Progres Implementasi — 6 September 2026

- Lima file monolitik lama di `apps/web/components/` sudah dihapus setelah tidak memiliki pemakai.
- Dashboard dan halaman utama dipisahkan menjadi 24 modul halaman berdasarkan role di `features/<role>/pages/`.
- Komponen judul, status, statistik, dan alur assessment yang digunakan bersama dipindahkan ke folder `components` milik fitur atau `shared/components`.
- Pemilih konten workspace diperkecil menjadi router lazy-load di `features/routing/workspace-content.tsx`.
- Seed Admin, Peneliti, Asesor, dan Pengelola dipindahkan ke `mocks/seed/`; facade `features/<role>/model.ts` dipertahankan sementara agar perubahan struktur tidak mengubah perilaku halaman.
- Seluruh 26 route publik/workspace merespons HTTP 200. Lint, TypeScript, formatter, dan production build lulus.

### Hasil shared data dan flow

- Shared mock state, action, selector, processor, dan adapter tersedia di `apps/web/mocks/`; schema browser dinaikkan ke versi 3 dan data lama otomatis kembali ke seed yang kompatibel.
- Halaman Admin, Peneliti, Asesor, dan Pengelola membaca entity yang sama. Mutation tersimpan lintas route dan tersedia tombol reset data demo pada Pengaturan Admin.
- Publikasi instrumen membuat snapshot indikator per versi dan mengarahkannya ke penugasan Terjadwal. Form Asesor membaca jawaban, opsi N/A, kebutuhan bukti, serta kebutuhan lokasi dari versi tersebut.
- Progress assessment menghitung jawaban, alasan N/A, bukti, dan lokasi. Finalisasi menolak data belum lengkap, mengunci assessment, lalu membentuk hasil, risiko, rekomendasi, audit, dan notifikasi dummy.
- Filter periode, gedung, lantai, risiko, dan status memakai selector yang sama untuk Daftar Area, denah, daftar temuan, dan detail. Perbandingan dimensi memakai ID stabil dan menampilkan kondisi tidak dapat dibandingkan bila struktur versi berbeda.
- PIC, tenggat, catatan perkembangan, dan nama bukti tindak lanjut disimpan pada entity rekomendasi yang sama.
- Sebelas test otomatis untuk store, selector, guard, relasi seed, publikasi, finalisasi, filter risiko, dan tindak lanjut lulus. Lint, TypeScript, formatter, build produksi, serta respons 27 route juga lulus.

Pekerjaan Stage 10 tetap `IN PROGRESS` sampai parity visual desktop, tablet, dan ponsel diperiksa secara manual. Backend, upload file nyata, rumus ilmiah, serta kewenangan Manajemen Penugasan/verifikasi tetap di luar ruang lingkup stage.

## Skenario Uji Lintas Role Minimum

1. Admin membuat pesantren dan akun Pengelola/Asesor; data baru tetap ada setelah pindah route dan refresh.
2. Peneliti membuat versi dari Published, mengubah Draft, memvalidasi, dan memublikasikannya tanpa mengubah versi lama.
3. Pengelola menambahkan gedung/lantai/area; Asesor melihat area itu hanya pada penugasan institution terkait.
4. Asesor memverifikasi penugasan, mengisi jawaban/bukti/lokasi, menyimpan draft, refresh, lalu melanjutkan dari posisi yang sama.
5. Asesor finalisasi; assessment menjadi terkunci dan Pengelola dapat membuka hasil, temuan, serta rekomendasi yang berasal dari ID assessment tersebut.
6. Pengelola membuat tindak lanjut dengan PIC/tenggat, memperbarui progress, mengunggah bukti, dan melihat audit/notifikasi dummy terkait.
7. Reset data demo mengembalikan seluruh role ke seed awal yang konsisten.

## Risiko dan Mitigasi

- **Refactor besar menyebabkan regresi tampilan.** Migrasikan satu route pada satu waktu dan bandingkan dengan baseline sebelum menghapus komponen lama.
- **Persisted data menjadi tidak kompatibel.** Gunakan schema version, migrasi ringan, atau reset otomatis untuk data dummy lama.
- **Store berubah menjadi tempat seluruh logika tanpa batas.** Pisahkan action dan selector berdasarkan domain/fitur.
- **Data turunan tidak sinkron.** Hitung progress, count, status ringkasan, dan filter dari entity sumber.
- **Mock processor dianggap formula ilmiah.** Gunakan nama `illustrative`, metadata asumsi, dan label data dummy pada setiap hasil.
- **Terlalu banyak perubahan dalam satu commit.** Pisahkan commit berdasarkan fondasi store, role, dan flow; jangan mencampur perubahan visual yang tidak diperlukan.

## Definition of Done

Stage dipindahkan ke `REVIEW` setelah seluruh acceptance criteria dan skenario lintas role lulus, data dummy konsisten setelah refresh, serta tidak ada lagi sumber data domain ganda pada komponen halaman. Stage dinyatakan `DONE` hanya setelah review pemilik proyek/dosen.
