# ISHAS - AI Agent Project Context & Engineering Guardrails

**Purpose:** This file is the long-form operational context for any AI coding agent working on the ISHAS repository. Read it before planning or changing code.

## 0. Agent operating rules

1. Treat this file and the research proposal as the project context; do not invent scientific parameters.
2. Distinguish source classes: `[PROPOSAL]`, `[VISUAL]`, `[DISKUSI]`, `[REKOMENDASI]`, `[OPEN]`.
3. If a requested change depends on `[OPEN]` scientific data, implement a configurable placeholder/contract or ask for the missing data. Never make a silent scientific assumption.
4. Before editing code, inspect the repository to determine the actual stack, conventions, migrations, tests, and deployment model. The blueprint is stack-agnostic unless the repository makes a choice explicit.
5. Preserve backward compatibility of published instrument versions and historical assessment results.
6. Do not add AI/LLM features unless explicitly requested. The 2026 proposal does not require them.
7. Prefer deterministic, testable, auditable domain services for scoring/risk/recommendation logic.
8. Every schema change related to scientific configuration must include a migration strategy and tests.
9. Never use runtime `eval` or arbitrary expressions from Admin configuration. If formulas need configuration, use a safe declarative rule schema or vetted expression parser.
10. Any change that can alter a finalized score must be treated as high-risk and require explicit versioning/audit behavior.
11. Do not delete or rewrite historical assessment records just to simplify a migration. Use archival/version migration patterns.
12. Keep scientific names/terms as supplied until the team confirms canonical naming; do not silently normalize proposal inconsistencies in data migrations.

## 0.1 Source of truth hierarchy

When sources conflict, do not guess. Use this priority for software behavior:
1. Explicit latest instruction from project owner/team.
2. Approved scientific instrument/scoring specification supplied by research team.
3. Current repository specification/ADR that is explicitly approved.
4. Proposal text and figures.
5. This blueprint's recommendations.

When proposal text and proposal visual conflict, record the conflict and seek confirmation rather than choosing silently.

## 0.2 Core invariant

> A finalized assessment must be reproducible from its stored raw answers, the exact published instrument version, and the exact scoring configuration/version used at finalization.

If a proposed change breaks this invariant, redesign it.

# ISHAS Project Blueprint

**Proyek:** Integrated Safety & Health Assessment System (ISHAS) / Smart Safety Assessment  
**Basis utama:** Proposal Usulan Penelitian Tahun 2026, UNIDA Gontor + rekapan keputusan teknis dalam percakapan proyek.  
**Tanggal baseline:** 1 September 2026  
**Status:** Working Blueprint - parameter ilmiah final belum seluruhnya tersedia.

> Dokumen ini sengaja membedakan fakta proposal, informasi visual, keputusan diskusi, rekomendasi teknis, dan hal yang masih terbuka. Jangan memperlakukan rekomendasi teknis sebagai ketentuan ilmiah proposal.

## Legenda sumber

- **[PROPOSAL]** Informasi yang secara eksplisit tertulis pada proposal.
- **[VISUAL]** Informasi yang terbaca dari tabel, diagram, atau mockup visual pada proposal.
- **[DISKUSI]** Kesepakatan kerja yang muncul dalam percakapan proyek ini.
- **[REKOMENDASI]** Rancangan teknis yang disarankan untuk implementasi; bukan ketentuan eksplisit proposal.
- **[OPEN]** Belum diputuskan atau data sumber belum tersedia; harus dikonfirmasi sebelum dianggap final.

## Ringkasan eksekutif

ISHAS dirancang sebagai sistem digital untuk pengumpulan data, penilaian otomatis, penghitungan indeks K3L pesantren, visualisasi risiko, rekomendasi perbaikan, pelaporan, dan monitoring berkelanjutan. Basis ilmiahnya berasal dari integrasi **Safety Assessment Tool (SAT) 1.0** dan **Safety Assessment Model for Islamic Boarding School (SAM i-SAFE)**, kemudian divalidasi dan digunakan untuk menyusun **ISHAS Index / Safety Assessment Index**.

Secara software, pekerjaan **dapat dimulai sekarang** pada lapisan yang tidak bergantung pada formula final: fondasi aplikasi, autentikasi, role/permission, master pesantren, konfigurasi instrumen, versioning, audit trail, form engine, dan kerangka dashboard. Namun, **scoring final tidak boleh dikunci** sebelum tim penelitian memberikan indikator final, bobot, formula indeks, kategori risiko, aturan missing value, dan recommendation rule.

Keputusan teknis utama dari diskusi adalah membuat sistem **configurable** melalui dashboard Admin Sistem. Admin dapat mengelola instrumen dalam status Draft, tetapi instrumen yang sudah Published harus dikunci. Perubahan ilmiah dilakukan melalui versi baru agar hasil assessment lama tetap reproducible dan tidak berubah diam-diam.

Visual proposal memperkaya kebutuhan software secara signifikan: sumber data mencakup survei/kuesioner, observasi lapangan, dokumen/kebijakan, data insiden, dan sensor/IoT opsional; input dapat manual Web/Mobile, import Excel/CSV, atau API/integrasi; keluaran mencakup laporan evaluasi K3L, risk mapping interaktif, rekomendasi, ekspor PDF/Excel, dan notifikasi peringatan. Visual juga menampilkan pengguna seperti pengelola pesantren, Tim K3/Satgas, pimpinan yayasan, pemerintah/Kemenag, dan peneliti/auditor.

## 1. Konteks penelitian dan tujuan proyek

### 1.1 Masalah yang hendak diselesaikan [PROPOSAL]
Pesantren memiliki karakteristik asrama dengan aktivitas 24 jam dan menghadapi potensi risiko yang mencakup keselamatan bangunan, kebakaran, instalasi listrik, sanitasi, kualitas lingkungan, kesiapsiagaan bencana, serta kesehatan fisik dan psikososial. Proposal menilai monitoring yang ada belum menghasilkan informasi kuantitatif yang cukup untuk prioritas pembinaan.

SAT 1.0 telah menyediakan kerangka awal tetapi penerapannya masih manual dan belum terintegrasi pelaporan. SAM i-SAFE memperluas indikator keselamatan untuk konteks institusi berasrama. Penelitian 2026 menargetkan integrasi keduanya dan transformasi menjadi sistem digital ISHAS.

### 1.2 Tujuan produk software [PROPOSAL]
Sistem berbasis web ditujukan untuk:
- pengumpulan data assessment K3L;
- perhitungan skor otomatis;
- pembentukan indeks keselamatan/ISHAS Index;
- klasifikasi tingkat K3L/risiko;
- visualisasi dashboard dan risk mapping;
- rekomendasi perbaikan;
- laporan evaluasi;
- monitoring kondisi K3L dari waktu ke waktu.

### 1.3 Basis ilmiah yang bukan tanggung jawab software untuk diciptakan [PROPOSAL]
Penelitian menggunakan expert judgment, Content Validity Index (CVI), Exploratory Factor Analysis (EFA), Confirmatory Factor Analysis (CFA), dan Cronbach's Alpha. Hasil ilmiah inilah yang menentukan indikator valid dan dasar pembentukan indeks. Software bertugas mengimplementasikan parameter yang telah disahkan, bukan menggantikan proses validasi tersebut.

### 1.4 Peran mahasiswa pengembang [PROPOSAL]
Farrel Ghozy Affifudin dicantumkan sebagai mahasiswa yang membantu pengembangan dashboard digital Safety Assessment untuk pesantren, uji coba sistem, dan data pendukung penelitian. Karena itu blueprint ini berorientasi pada implementasi software yang traceable terhadap proposal.

## 2. Analisis visual proposal

### 2.1 Roadmap penelitian sampai 2030 [VISUAL]
Gambar roadmap pada PDF page 7 memperlihatkan:
- **2023-2025:** identifikasi masalah, pengembangan kerangka konsep, dan penentuan dimensi instrumen; luaran antara lain model konseptual dan dimensi instrumen ISHAS versi awal.
- **2026:** validasi dan digitalisasi; pengembangan indikator/pembentukan indeks dan pengembangan sistem ISHAS berbasis dashboard digital; visual menandai **Target TKT 6**.
- **2027:** implementasi lebih luas, validitas eksternal, sensitivitas indeks, evaluasi penerimaan pengguna, penyempurnaan sistem; **Target TKT 7**.
- **2028-2029:** integrasi analitik lanjut dan smart monitoring, termasuk prediksi risiko real-time dan sistem rekomendasi; target pada visual tetap TKT 7.
- **2030:** transformasi sistemik dan replikasi nasional, termasuk integrasi ISHAS dengan kebijakan internal pesantren, model adopsi, dan rekomendasi kebijakan; **Target TKT 8**.

**Implikasi software:** versi 2026 harus dipandang sebagai purwarupa teruji/tervalidasi, bukan produk nasional final. Desain data perlu memungkinkan evolusi instrumen dan analitik tanpa merusak data lama.

### 2.2 Diagram alir metode penelitian [VISUAL + PROPOSAL]
Gambar alir pada PDF page 8 membagi penelitian menjadi lima tahap:
1. Integrasi model dan penyusunan draft pedoman K3L.
2. Validasi pedoman pengukuran melalui expert judgment dan uji validitas/reliabilitas.
3. Penyusunan ISHAS Index: bobot, skor komposit, klasifikasi K3L.
4. Pengembangan dashboard/sistem ISHAS: pengumpulan data, skor otomatis, risk mapping, rekomendasi, laporan real-time.
5. Implementasi dan validasi purwarupa: functional testing, UAT, validasi lapangan, evaluasi sensitivitas indeks, lalu penyempurnaan.

Di sisi kanan diagram, analisis data dipisahkan menjadi validitas isi (CVI), validitas konstruk (EFA/CFA), reliabilitas (Cronbach's Alpha), analisis indeks komposit, dan analisis implementasi.

**Implikasi software:** jangan mencampur perhitungan statistik penelitian untuk pembentukan instrumen dengan runtime scoring aplikasi. Aplikasi harus menerima hasil final dari proses ilmiah tersebut sebagai konfigurasi terkontrol.

### 2.3 Gambar konsep dashboard ISHAS [VISUAL]
Gambar konsep pada PDF page 10 memberi rincian paling konkret tentang sistem.

**Sumber data yang divisualkan:**
- Survei & Kuesioner
- Observasi Lapangan
- Dokumen & Kebijakan
- Data Insiden
- Sensor/IoT (**optional**)

**Cara input yang divisualkan:**
- Input manual Web/Mobile
- Import Excel/CSV
- API/Integrasi Sistem

**Panel dashboard yang divisualkan:**
- Indeks K3L terintegrasi (contoh mockup 78,5; kategori BAIK; skala 0-100)
- Skor per dimensi (4 dimensi SAT)
- Risk Map dengan legenda risiko tinggi/sedang/rendah
- Tren indeks
- Skor per aspek
- Distribusi risiko
- Rekomendasi prioritas

**Fitur utama yang divisualkan:**
- Penilaian Otomatis
- Monitoring Real-time
- Notifikasi & Peringatan
- Laporan & Unduh
- Manajemen Tindak Lanjut
- Manajemen Pengguna

**Output yang divisualkan:**
- Laporan Evaluasi K3L
- Risk Mapping Interaktif
- Rekomendasi Perbaikan
- Ekspor Data (PDF/Excel)
- Notifikasi Peringatan

**Kelompok pengguna yang divisualkan:**
- Pengelola Pesantren
- Tim K3 / Satgas
- Pimpinan Yayasan
- Pemerintah / Kemenag
- Peneliti / Auditor

**Mesin pengolahan data yang divisualkan:**
Validasi Data -> Scoring Indikator -> Pembobotan -> Perhitungan Indeks Terintegrasi -> Klasifikasi Risiko -> Generasi Rekomendasi.

**Arsitektur yang divisualkan:**
Client (Web/Mobile) -> Application Server (Backend) -> Database Server (Data Relasional) -> File Storage (Dokumen & Gambar) -> Analytical Engine (Algoritma Scoring & Risiko).

**Keamanan yang divisualkan:**
Autentikasi & Autorisasi, Enkripsi Data, Audit Trail, Backup & Recovery.

**Standar/rujukan yang divisualkan:**
Gambar mencantumkan PerGub Jatim No. 43/2023, Permenag No. 13/2014, SNI terkait K3, model integrasi SAT 1.0 + indikator SAM i-SAFE, dan metodologi PDCA. Detail legal/standar tersebut harus dikonfirmasi sebelum dijadikan rule aplikasi.

**Catatan penting:** contoh angka 78,5, kategori BAIK, dan skala 0-100 adalah bagian dari mockup visual. Proposal tekstual tidak menetapkannya sebagai formula final. Karena itu angka tersebut tidak boleh dijadikan aturan scoring tanpa konfirmasi.

### 2.4 Risk mapping: apa yang dapat disimpulkan dari gambar [VISUAL + OPEN]
Visual Risk Map menggunakan ilustrasi denah/area dengan marker dan legenda risiko tinggi/sedang/rendah. Ini memberi indikasi kuat bahwa yang diinginkan bukan sekadar heatmap daftar indikator, tetapi suatu pemetaan area/fasilitas. Namun proposal tidak menjelaskan apakah implementasi final menggunakan denah statis, koordinat area internal, GIS, atau jenis representasi lain. Desain database sebaiknya tidak memaksa satu opsi sebelum dikonfirmasi.

### 2.5 Jadwal penelitian [VISUAL]
Tabel jadwal pada PDF page 11 menempatkan aktivitas sebagai berikut:
- Bulan 1: koordinasi tim.
- Bulan 2: penurunan indikator dari standar/pedoman SAT 1.0.
- Bulan 2-3: FGD dan validasi pakar indikator.
- Bulan 3-4: penyusunan instrumen/kuesioner SAT 2.0.
- Bulan 4-5: uji validitas isi (CVI).
- Bulan 5-6: uji validitas konstruk & reliabilitas.
- Bulan 6-8: penyusunan indeks keselamatan.
- Bulan 7-9: pengembangan sistem digital Smart SAT.
- Bulan 9-10: analisis data & interpretasi.
- Bulan 10-12: penyusunan laporan & publikasi.

**Implikasi:** jadwal formal menempatkan pengembangan sistem pada bulan 7-9, tetapi secara engineering kita dapat mengerjakan scaffolding lebih awal selama parameter ilmiah belum dibekukan dan tidak diperlakukan sebagai hasil penelitian final.

## 3. Batas antara kebutuhan ilmiah dan kebutuhan software

### 3.1 Parameter ilmiah yang harus datang dari tim penelitian [OPEN]
Software tidak boleh mengarang:
- daftar dimensi final;
- daftar indikator final;
- jenis dan skala jawaban;
- bobot indikator/dimensi;
- formula normalisasi;
- rumus indeks komposit;
- reverse scoring;
- aturan data kosong/N/A;
- threshold kategori K3L/risiko;
- recommendation rule;
- definisi final risk mapping.

### 3.2 Bagian software yang dapat dibangun sekarang [DISKUSI/REKOMENDASI]
- repository dan struktur project;
- autentikasi;
- role/permission model;
- master data pesantren;
- admin dashboard shell;
- instrument builder configurable;
- instrument versioning dan locking;
- audit trail;
- generic assessment form engine;
- file/evidence storage foundation;
- generic scoring interface/contract tanpa formula final;
- dashboard layout berbasis placeholder/dummy data yang jelas diberi label;
- history/report framework;
- automated tests untuk behavior generik.

### 3.3 Prinsip admin configurability [DISKUSI]
Admin Sistem boleh memiliki akses luas untuk konfigurasi, tetapi **akses luas tidak sama dengan hak mengubah data penelitian tanpa jejak**.

Aturan kerja yang disepakati:
1. **Draft instrument**: dapat diedit.
2. **Published instrument**: dikunci.
3. Perubahan ilmiah setelah publish: buat **versi baru**.
4. Assessment menyimpan versi instrumen.
5. Hasil assessment historis tidak dihitung ulang diam-diam ketika konfigurasi baru terbit.
6. Koreksi data final harus melalui mekanisme terkontrol dan audit trail.

Contoh lifecycle:

```text
Draft -> Published (locked) -> Archived
              |
              +-- butuh perubahan -> clone/new version -> Draft -> Published
```

## 4. Scope sistem target

### 4.1 Modul inti
1. Authentication & Authorization
2. User/Role Management
3. Pesantren Management
4. Instrument & Version Management
5. Assessment Form & Data Collection
6. Scoring & ISHAS Index Engine
7. Risk Classification & Risk Mapping
8. Dashboard & Analytics
9. Recommendation Engine
10. Follow-up Management
11. Monitoring & History
12. Notification & Warning
13. Reporting & Export
14. Audit Trail
15. Backup/Recovery & operational administration

### 4.2 Out of scope sementara / future-oriented
- AI/LLM generatif sebagai komponen wajib: **tidak diwajibkan proposal 2026**.
- Prediksi risiko real-time berbasis model cerdas: roadmap menempatkannya pada 2028-2029.
- Sensor/IoT: visual menandainya **optional**.
- Integrasi API ke sistem eksternal: konsep tersedia, target sistem eksternal belum ditetapkan.
- Native mobile app: visual menyebut Web/Mobile, tetapi bentuk implementasi final belum ditetapkan. Responsive web/PWA dapat dievaluasi sebelum native app.

## 5. Role dan hak akses

Role berikut dipisahkan antara yang benar-benar terlihat di proposal dan role teknis yang kita tambahkan.

| Role | Basis | Fungsi awal |
|---|---|---|
| Admin Sistem | REKOMENDASI | Mengelola konfigurasi teknis, akun, master data, instrumen draft, versi, audit, dan operasional sistem. Role ini tidak disebut eksplisit di proposal dan perlu disepakati tim. |
| Asesor | PROPOSAL | Mengisi formulir digital penilaian K3L. |
| Pengelola Pesantren | PROPOSAL/VISUAL | Mengisi data penilaian dan memonitor hasil/perkembangan K3L pesantren. |
| Tim K3 / Satgas | VISUAL | Pengguna keluaran dashboard; terlibat dalam tindak lanjut keselamatan. |
| Pimpinan Yayasan | VISUAL | Pengguna keluaran/monitoring tingkat manajemen. |
| Pemerintah / Kemenag | VISUAL | Pemangku kepentingan eksternal yang dapat memanfaatkan keluaran sesuai hak akses. |
| Peneliti / Auditor | VISUAL | Pengguna untuk analisis, audit, validasi, dan penelitian. |


### 5.1 Catatan Admin Sistem
Proposal tidak secara eksplisit menyebut role bernama **Admin**. Role ini adalah rekomendasi teknis agar konfigurasi dan operasional sistem dapat dikelola. Karena itu hak Admin harus disepakati bersama tim penelitian sebelum dianggap requirement final.

Admin sebaiknya **boleh**:
- mengelola akun/role;
- mengelola master pesantren;
- membuat versi instrumen baru;
- mengubah instrumen Draft;
- mengelola konfigurasi non-ilmiah;
- melihat audit log dan status sistem.

Admin sebaiknya **tidak boleh tanpa mekanisme khusus**:
- mengubah instrumen Published secara langsung;
- mengubah skor hasil assessment manual;
- menghapus jejak historis penelitian;
- mengganti formula/bobot yang sudah digunakan tanpa membuat versi baru;
- mengedit assessment final tanpa alasan dan audit trail.

## 6. Functional Requirements Baseline

Daftar lengkap requirement juga tersedia pada `03_ISHAS_Development_Checklist.xlsx`.

| ID | Module | Requirement | Basis | Priority |
|---|---|---|---|---|
| FR-AUTH-001 | Authentication | Sistem menyediakan autentikasi pengguna. | VISUAL | Must |
| FR-AUTH-002 | Authorization | Sistem menerapkan otorisasi berbasis role/permission. | VISUAL | Must |
| FR-USR-001 | User Management | Sistem menyediakan manajemen pengguna. | VISUAL | Must |
| FR-USR-002 | User Management | Admin Sistem dapat membuat, mengubah, menonaktifkan akun dan menetapkan role. | REKOMENDASI | Should |
| FR-USR-003 | Role Model | Model hak akses harus mampu mengakomodasi asesor, pengelola pesantren, Tim K3/Satgas, pimpinan yayasan, pemerintah/Kemenag, dan peneliti/auditor. | VISUAL | Must |
| FR-ORG-001 | Pesantren | Sistem menyimpan master data pesantren sebagai objek yang dinilai. | PROPOSAL | Must |
| FR-ORG-002 | Pesantren | Admin dapat menambah dan memperbarui profil pesantren tanpa mengubah hasil assessment historis. | REKOMENDASI | Should |
| FR-INS-001 | Instrument | Sistem menyimpan dimensi, indikator, dan struktur instrumen penilaian. | PROPOSAL | Must |
| FR-INS-002 | Instrument | Struktur instrumen dibuat configurable dari data/database, bukan hard-coded. | DISKUSI/REKOMENDASI | Must |
| FR-INS-003 | Instrument | Admin dapat mengelola instrumen selama statusnya Draft. | DISKUSI/REKOMENDASI | Must |
| FR-INS-004 | Instrument | Instrumen Published dikunci dari perubahan langsung. | DISKUSI/REKOMENDASI | Must |
| FR-INS-005 | Instrument | Perubahan terhadap instrumen Published dilakukan melalui versi baru. | DISKUSI/REKOMENDASI | Must |
| FR-INS-006 | Instrument | Assessment menyimpan referensi versi instrumen yang digunakan. | REKOMENDASI | Must |
| FR-INS-007 | Instrument | Sistem mendukung konfigurasi jenis jawaban dan opsi jawaban per indikator. | REKOMENDASI | Must |
| FR-INS-008 | Instrument | Sistem mendukung konfigurasi bobot indikator/dimensi setelah parameter ilmiah ditetapkan. | PROPOSAL/REKOMENDASI | Must |
| FR-INS-009 | Instrument | Sistem mendukung konfigurasi kategori/threshold risiko setelah ditetapkan peneliti. | PROPOSAL/REKOMENDASI | Must |
| FR-INS-010 | Instrument | Sistem mendukung recommendation rule yang dapat dikonfigurasi. | PROPOSAL/REKOMENDASI | Must |
| FR-INP-001 | Data Input | Form digital terstandarisasi tersedia untuk input data penilaian. | PROPOSAL | Must |
| FR-INP-002 | Data Input | Sistem mampu mencatat data survei/kuesioner. | VISUAL | Must |
| FR-INP-003 | Data Input | Sistem mampu mencatat observasi lapangan. | VISUAL | Must |
| FR-INP-004 | Data Input | Sistem mampu menyimpan dokumen/kebijakan sebagai data pendukung. | VISUAL | Should |
| FR-INP-005 | Data Input | Sistem mampu mencatat data insiden. | VISUAL | Should |
| FR-INP-006 | Data Input | Dukungan sensor/IoT diperlakukan sebagai fitur opsional, bukan syarat MVP. | VISUAL | Could |
| FR-INP-007 | Data Input | Input manual tersedia melalui Web/Mobile. | VISUAL | Must |
| FR-INP-008 | Data Input | Sistem dapat dirancang untuk import Excel/CSV. | VISUAL | Should |
| FR-INP-009 | Data Input | Sistem menyediakan jalur API/integrasi untuk kebutuhan pengembangan berikutnya. | VISUAL | Could |
| FR-ASMT-001 | Assessment | Pengguna berwenang dapat membuat assessment baru untuk pesantren dan periode tertentu. | REKOMENDASI | Must |
| FR-ASMT-002 | Assessment | Assessment Draft dapat disimpan sebelum selesai. | REKOMENDASI | Should |
| FR-ASMT-003 | Assessment | Assessment yang sudah difinalisasi tidak boleh mengubah hasil historis tanpa mekanisme koreksi yang terlacak. | DISKUSI/REKOMENDASI | Must |
| FR-ASMT-004 | Assessment | Sistem mendukung unggahan bukti seperti dokumen/gambar jika instrumen final membutuhkannya. | VISUAL/OPEN | Should |
| FR-SCR-001 | Scoring | Mesin pengolahan melakukan validasi data sebelum scoring. | VISUAL | Must |
| FR-SCR-002 | Scoring | Sistem melakukan scoring indikator secara otomatis. | VISUAL | Must |
| FR-SCR-003 | Scoring | Sistem menerapkan pembobotan sesuai konfigurasi ilmiah. | PROPOSAL/VISUAL | Must |
| FR-SCR-004 | Scoring | Sistem menghitung skor setiap dimensi/aspek. | PROPOSAL/VISUAL | Must |
| FR-SCR-005 | Scoring | Sistem menghitung indeks K3L terintegrasi/komposit. | PROPOSAL/VISUAL | Must |
| FR-SCR-006 | Scoring | Sistem mengklasifikasikan risiko/tingkat K3L berdasarkan kategori yang ditetapkan. | PROPOSAL/VISUAL | Must |
| FR-SCR-007 | Scoring | Rumus, skala, bobot, reverse scoring, perlakuan missing value, dan threshold tidak boleh di-hard-code sebelum disahkan tim penelitian. | DISKUSI/OPEN | Must |
| FR-SCR-008 | Scoring | Contoh nilai 78,5 dan skala 0-100 pada mockup hanya diperlakukan sebagai ilustrasi sampai dikonfirmasi. | VISUAL/OPEN | Must |
| FR-DSH-001 | Dashboard | Dashboard menampilkan indeks K3L terintegrasi. | VISUAL | Must |
| FR-DSH-002 | Dashboard | Dashboard menampilkan skor per dimensi/aspek. | PROPOSAL/VISUAL | Must |
| FR-DSH-003 | Dashboard | Dashboard menampilkan tren hasil evaluasi dari waktu ke waktu. | PROPOSAL/VISUAL | Must |
| FR-DSH-004 | Dashboard | Dashboard menampilkan distribusi risiko. | VISUAL | Should |
| FR-DSH-005 | Dashboard | Dashboard menampilkan rekomendasi prioritas. | VISUAL | Must |
| FR-RISK-001 | Risk Mapping | Sistem menyediakan visualisasi risk mapping. | PROPOSAL | Must |
| FR-RISK-002 | Risk Mapping | Visual proposal mengarah pada pemetaan area/fasilitas dengan level risiko tinggi/sedang/rendah; mekanisme lokasi/floorplan/GIS harus dikonfirmasi. | VISUAL/OPEN | Must |
| FR-MON-001 | Monitoring | Sistem menyimpan riwayat assessment untuk monitoring berkelanjutan. | PROPOSAL | Must |
| FR-MON-002 | Monitoring | Sistem menyediakan monitoring real-time sesuai kemampuan data yang tersedia. | VISUAL/OPEN | Should |
| FR-NOT-001 | Notification | Sistem mendukung notifikasi/peringatan. | VISUAL | Should |
| FR-REC-001 | Recommendation | Sistem menghasilkan rekomendasi otomatis berdasarkan hasil penilaian indikator. | PROPOSAL | Must |
| FR-REC-002 | Recommendation | Sistem memprioritaskan rekomendasi sesuai tingkat risiko. | PROPOSAL | Must |
| FR-FUP-001 | Follow-up | Sistem mendukung manajemen tindak lanjut atas rekomendasi. | VISUAL | Should |
| FR-RPT-001 | Reporting | Sistem menghasilkan laporan evaluasi K3L. | PROPOSAL/VISUAL | Must |
| FR-RPT-002 | Reporting | Sistem menyediakan unduh/ekspor laporan. | VISUAL | Must |
| FR-RPT-003 | Reporting | Sistem mendukung ekspor data ke PDF/Excel sesuai konsep visual. | VISUAL | Should |
| FR-AUD-001 | Audit | Sistem mencatat audit trail untuk perubahan penting. | VISUAL | Must |
| FR-AUD-002 | Audit | Perubahan instrumen, konfigurasi scoring, role, dan koreksi assessment menyimpan siapa/kapan/alasan/perubahan lama-baru. | DISKUSI/REKOMENDASI | Must |
| FR-SEC-001 | Security | Data sensitif dilindungi dengan enkripsi yang sesuai. | VISUAL | Must |
| FR-SEC-002 | Security | Sistem memiliki mekanisme backup dan recovery. | VISUAL | Must |
| FR-ARC-001 | Architecture | Arsitektur mengakomodasi client Web/Mobile, application server/backend, relational database, file storage, dan analytical engine. | VISUAL | Must |

## 7. Non-Functional Requirements Baseline

| ID | Category | Requirement | Basis | Priority |
|---|---|---|---|---|
| NFR-001 | Traceability | Setiap hasil assessment harus dapat ditelusuri ke versi instrumen dan konfigurasi scoring yang digunakan. | REKOMENDASI | Must |
| NFR-002 | Integrity | Perubahan pada konfigurasi ilmiah yang sudah published tidak boleh mengubah hasil historis secara diam-diam. | REKOMENDASI | Must |
| NFR-003 | Security | Prinsip least privilege diterapkan pada role dan permission. | REKOMENDASI | Must |
| NFR-004 | Auditability | Aktivitas sensitif harus tercatat dan dapat ditinjau. | VISUAL/REKOMENDASI | Must |
| NFR-005 | Reliability | Operasi scoring dan penyimpanan hasil harus deterministik untuk input dan versi konfigurasi yang sama. | REKOMENDASI | Must |
| NFR-006 | Recoverability | Backup diuji dengan prosedur restore berkala. | VISUAL/REKOMENDASI | Should |
| NFR-007 | Usability | Form assessment harus usable di perangkat web/mobile dan mendukung penyimpanan draft. | VISUAL/REKOMENDASI | Should |
| NFR-008 | Performance | Dashboard dan hasil assessment harus responsif untuk penggunaan penelitian/pesantren; target numerik ditentukan setelah skala deployment diketahui. | OPEN | Should |
| NFR-009 | Maintainability | Konfigurasi indikator, bobot, kategori, dan rekomendasi dipisahkan dari source code. | DISKUSI/REKOMENDASI | Must |
| NFR-010 | Portability | Sistem sebaiknya dapat dideploy secara reproducible pada server penelitian; stack dan target hosting belum diputuskan. | REKOMENDASI/OPEN | Should |
| NFR-011 | Data Export | Ekspor harus konsisten dengan data yang tampil dan menyertakan metadata versi instrumen. | REKOMENDASI | Should |
| NFR-012 | Observability | Error penting, kegagalan import, dan kegagalan scoring perlu tercatat untuk troubleshooting. | REKOMENDASI | Should |

## 8. Rancangan data model awal [REKOMENDASI]

> Ini adalah desain awal agar project bisa dimulai. Nama tabel/field dapat berubah setelah stack dan instrumen final dipilih.

### 8.1 Entitas utama

```text
users
roles
permissions
user_roles / role_permissions

pesantren
pesantren_memberships

instruments
instrument_versions
  -> dimensions
      -> indicators
          -> answer_options
          -> indicator_rules
          -> recommendation_rules
risk_categories

assessments
  -> assessment_answers
      -> evidence_files
  -> dimension_scores
  -> assessment_score
  -> generated_recommendations
  -> follow_up_actions

incidents
notifications
imports
reports
audit_logs
```

### 8.2 Relasi penting
- Satu `instrument` dapat memiliki banyak `instrument_versions`.
- Satu versi memiliki banyak dimensi; dimensi memiliki banyak indikator.
- Satu assessment harus terikat ke **tepat satu versi instrumen**.
- Jawaban assessment harus menyimpan nilai mentah dan, bila perlu, nilai ter-normalisasi/score yang dihasilkan engine.
- Hasil agregat sebaiknya menyimpan metadata konfigurasi atau snapshot yang cukup untuk audit/reproducibility.
- Evidence file harus mengacu ke assessment/answer dan disimpan melalui file storage, sementara metadata berada di relational database.

### 8.3 Field yang sangat disarankan untuk versioning
`instrument_versions`:
- id
- instrument_id
- version_code
- status: draft/published/archived
- effective_at
- published_at
- published_by
- source_note
- change_note
- created_at / updated_at

`assessments`:
- id
- pesantren_id
- instrument_version_id
- assessor_user_id
- period / assessment_date
- status
- started_at
- submitted_at
- finalized_at
- overall_score (jika sudah dihitung)
- risk_category_id
- scoring_engine_version / config_hash

### 8.4 Config hash / reproducibility
Untuk hasil penelitian yang sensitif terhadap formula, pertimbangkan menyimpan `config_hash` atau snapshot konfigurasi scoring saat assessment difinalisasi. Dengan demikian perubahan konfigurasi di masa depan dapat dideteksi dan hasil lama dapat direproduksi.

## 9. Workflow utama

### 9.1 Instrument lifecycle [REKOMENDASI]
```text
Create Draft
   -> configure dimensions/indicators/answers/weights/rules
   -> internal review
   -> Publish
   -> Locked for direct editing
   -> Archived when replaced
```

`internal review` di atas adalah rekomendasi teknis; proposal tidak menetapkan workflow approval software.

### 9.2 Assessment lifecycle [REKOMENDASI + OPEN]
Minimum yang aman:
```text
Draft -> Submitted -> Finalized
```

Jika tim penelitian memerlukan verifikasi:
```text
Draft -> Submitted -> Under Review -> Finalized
                         |-> Returned for Correction
```

Workflow final harus dikonfirmasi karena proposal hanya menyebut input, evaluasi, UAT, dan validasi; tidak mendefinisikan approval per assessment.

### 9.3 Runtime scoring flow [PROPOSAL/VISUAL]
```text
Input data
 -> Validate
 -> Score indicators
 -> Apply weights
 -> Aggregate dimension/aspect scores
 -> Calculate integrated ISHAS Index
 -> Classify risk/K3L
 -> Generate recommendations
 -> Persist result + version metadata
 -> Show dashboard/report
```

## 10. Scoring engine: kontrak teknis tanpa mengarang rumus

Scoring engine harus config-driven. Interface konseptual:

```text
score(assessment, instrument_version)
  1. validate required responses
  2. normalize answers according to indicator rule
  3. calculate indicator score
  4. apply indicator/dimension weights
  5. aggregate composite index
  6. classify risk category
  7. evaluate recommendation rules
  8. return deterministic result + audit metadata
```

Sebelum tim ilmiah menyerahkan formula final, implementasikan hanya **engine contract** dan test dengan fixture/dummy configuration. Dummy configuration tidak boleh diberi label sebagai formula ISHAS final.

## 11. Risk mapping design

### 11.1 Yang diketahui
- Risk mapping diwajibkan proposal.
- Mockup menampilkan peta/denah area dan tiga level risiko.
- Output visual menyebut `Risk Mapping Interaktif`.

### 11.2 Yang belum diketahui
- apakah pesantren perlu upload denah;
- apakah setiap indikator terikat ke lokasi/area/fasilitas;
- apakah menggunakan koordinat internal, GIS latitude/longitude, atau polygon;
- apakah satu assessment bisa memiliki beberapa lokasi risiko;
- apakah warna/level risikonya fixed atau configurable.

### 11.3 Rekomendasi schema fleksibel
Tambahkan konsep `locations/areas` dan `risk_observations` secara opsional, sehingga risk map dapat dikembangkan tanpa mengubah model assessment inti.

## 12. Rancangan halaman/UI awal [REKOMENDASI]

### 12.1 Admin Sistem
- Login
- Dashboard Admin
- User & Role Management
- Pesantren Management
- Instruments
  - Instrument List
  - Version List
  - Version Editor
  - Dimensions
  - Indicators
  - Answer Types/Options
  - Scoring Configuration
  - Risk Categories
  - Recommendation Rules
  - Publish / Archive
- Assessments Overview
- Reports
- Audit Log
- System Settings

### 12.2 Asesor / Pengelola Pesantren
- Dashboard
- New Assessment
- Assessment Drafts
- Assessment History
- Assessment Result
- Recommendations / Follow-up
- Reports/Export sesuai hak akses

### 12.3 Dashboard result
Mengikuti elemen visual proposal:
- Integrated K3L Index
- Dimension/Aspect Scores
- Risk Map
- Index Trend
- Risk Distribution
- Priority Recommendations
- Alerts/Warnings
- Recent Assessments / Follow-up status

## 13. API/domain service draft [REKOMENDASI]

Tidak mengikat framework tertentu; endpoint dapat berupa REST, RPC, atau pola lain.

```text
/auth/*
/users/*
/roles/*
/pesantren/*
/instruments/*
/instruments/{id}/versions/*
/instrument-versions/{id}/dimensions/*
/indicators/*
/risk-categories/*
/recommendation-rules/*

/assessments/*
/assessments/{id}/answers/*
/assessments/{id}/evidence/*
/assessments/{id}/submit
/assessments/{id}/finalize
/assessments/{id}/score
/assessments/{id}/result
/assessments/{id}/recommendations
/assessments/{id}/follow-ups

/dashboard/*
/reports/*
/exports/*
/notifications/*
/audit-logs/*
/imports/*
```

### 13.1 Service boundary yang disarankan
- `InstrumentService`
- `AssessmentService`
- `ScoringService`
- `RiskService`
- `RecommendationService`
- `ReportingService`
- `NotificationService`
- `AuditService`

Pisahkan `ScoringService` dari UI/controller agar rumus dapat diuji secara deterministik dan diaudit.

## 14. Security, integrity, dan audit

### 14.1 Minimum sesuai visual proposal [VISUAL]
- Authentication & Authorization
- Encryption
- Audit Trail
- Backup & Recovery

### 14.2 Rekomendasi implementasi
- password tidak disimpan plaintext;
- least privilege;
- object-level authorization untuk data pesantren;
- file upload validation;
- audit event untuk publish instrument, perubahan scoring config, role changes, finalization/koreksi assessment;
- backup database + file storage;
- uji restore, bukan hanya membuat backup;
- jangan mengekspos formula/config sensitif ke user yang tidak berwenang;
- gunakan transaksi untuk finalization assessment dan penyimpanan hasil.

## 15. Testing strategy

### 15.1 Wajib dari proposal [PROPOSAL]
- Functional Testing
- User Acceptance Testing (UAT)
- Validasi lapangan
- Evaluasi sensitivitas indeks

### 15.2 Tambahan engineering yang disarankan [REKOMENDASI]
- unit test untuk scoring rules;
- integration test database dan permission;
- regression test untuk versi instrumen;
- test bahwa publish lock bekerja;
- test bahwa assessment lama tidak berubah setelah versi baru terbit;
- test export/report;
- test audit trail;
- backup/restore test;
- security checks pada file upload dan access control.

### 15.3 Golden fixture scoring
Setelah formula ilmiah final tersedia, buat sekumpulan kasus contoh yang dihitung manual oleh tim penelitian dan simpan sebagai **golden fixtures**. CI harus gagal jika perubahan code menghasilkan nilai berbeda tanpa perubahan versi formula yang disengaja.

## 16. Data/keputusan yang masih dibutuhkan

| ID | Area | Pertanyaan | Dampak |
|---|---|---|---|
| Q-001 | Instrumen | Minta file SAT 1.0 lengkap: 4 dimensi, 43 indikator, pertanyaan, jawaban, dan aturan penilaian. | Blocker scoring |
| Q-002 | Instrumen | Minta file/model SAM i-SAFE lengkap yang menjadi bahan integrasi. | Blocker scoring |
| Q-003 | Terminologi | Nama final instrumen/sistem: SAT 2.0, Smart SAT, ISHAS, atau nomenklatur lain? | High |
| Q-004 | Dimensi | Apa dimensi final setelah integrasi dan validasi? Apakah tetap 4 dimensi atau struktur lain? | Blocker form/scoring |
| Q-005 | Jawaban | Jenis jawaban tiap indikator: Ya/Tidak, Likert, numerik, pilihan, bukti foto/dokumen, N/A? | Blocker form |
| Q-006 | Scoring | Bobot indikator dan bobot dimensi final? | Blocker scoring |
| Q-007 | Scoring | Formula normalisasi dan skor komposit/ISHAS Index final? | Blocker scoring |
| Q-008 | Scoring | Bagaimana perlakuan indikator N/A, data kosong, reverse scoring, atau nilai tidak valid? | Blocker scoring |
| Q-009 | Risk | Kategori risiko dan threshold final? Apakah skala 0-100 pada mockup benar atau hanya ilustrasi? | Blocker classification |
| Q-010 | Recommendation | Daftar recommendation rule dan prioritas tindakan resmi dari tim K3? | Blocker recommendation |
| Q-011 | Risk Mapping | Apakah risk mapping menggunakan denah/floorplan bangunan, lokasi area, GIS, atau heatmap indikator? | High |
| Q-012 | Workflow | Apakah assessment langsung final setelah submit atau perlu verifikasi/approval peneliti/Tim K3? | High |
| Q-013 | Roles | Hak akses final untuk semua pengguna pada mockup; apakah Admin Sistem disetujui sebagai role terpisah? | High |
| Q-014 | Pesantren Data | Field profil pesantren apa saja yang wajib disimpan? | Medium |
| Q-015 | Evidence | Apakah setiap indikator memerlukan evidence foto/dokumen atau hanya indikator tertentu? | Medium |
| Q-016 | Import | Format Excel/CSV yang harus didukung dan siapa yang boleh melakukan import? | Medium |
| Q-017 | Integration | API/integrasi sistem ditujukan ke sistem apa? | Low / future |
| Q-018 | IoT | Sensor/IoT apa yang mungkin digunakan? Visual menandainya opsional. | Low / future |
| Q-019 | Realtime | Apa definisi monitoring real-time pada konteks penelitian ini? | Medium |
| Q-020 | Notifications | Trigger dan kanal notifikasi/peringatan apa yang diperlukan? | Medium |
| Q-021 | Standards | Konfirmasi standar/regulasi pada Gambar konsep, termasuk Permenag No. 13/2014 dan SNI K3 yang dimaksud. | Medium |
| Q-022 | TKT | Konfirmasi target 2026: identitas proposal menyebut target TKT 7, sedangkan roadmap/metode menempatkan TKT 6 untuk 2026 dan TKT 7 untuk 2027. | High |

## 17. Inkonsistensi/ambiguity yang ditemukan pada proposal

Bagian ini tidak 'memperbaiki' proposal; hanya mencatat hal yang harus dikonfirmasi agar software tidak dibangun di atas asumsi salah.

| Topik | Temuan | Tindakan |
|---|---|---|
| Jumlah mahasiswa | Daftar tim pada halaman awal menampilkan Farrel Ghozy Affifudin dan Alvi Dhiyau Qabil sebagai mahasiswa, sedangkan identitas proposal menyebut Mahasiswa/i: 1 / Sarjana: 1. | Konfirmasi administrasi; tidak mengubah desain software secara langsung. |
| Target TKT | Identitas proposal menulis target TKT 7 (pengujian lingkungan nyata). Roadmap visual dan metode menyebut purwarupa tervalidasi TKT 6 untuk 2026 dan TKT 7 pada 2027. | Gunakan TKT 6 sebagai target teknis 2026 hanya setelah dikonfirmasi ketua penelitian. |
| Nama sistem | Dokumen menggunakan Smart Safety Assessment Tool, Smart SAT, ISHAS, dan pada ringkasan terdapat IHSAS. | Tentukan canonical product name untuk repository, database, domain, UI, dan publikasi. |
| Nama model tahap integrasi | Teks metode menyebut SAT 1.0 + SAM i-SAFE, sedangkan diagram visual tahap 1 menulis “Integrasi Model ISHAS 1.0 dan i-SAFE”. | Kemungkinan inkonsistensi label pada diagram; jangan mengubah sumber, tetapi konfirmasi istilah yang benar. |
| Dimensi/aspek | SAT 1.0 dijelaskan mempunyai 4 dimensi, sementara deskripsi modul input menyebut keselamatan lingkungan & bangunan, kesehatan lingkungan, perilaku keselamatan, budaya keselamatan, kesiapsiagaan darurat, dan indikator pendukung. Mockup skor per dimensi kembali menampilkan 4 dimensi SAT. | Jangan mengunci schema menjadi tepat 4 dimensi; buat struktur configurable. |
| Skala indeks | Mockup visual menampilkan nilai 78,5, kategori BAIK, skala 0-100. Teks proposal tidak menetapkan skala final. | Perlakukan sebagai mockup, bukan formula final. |
| Jurnal target | Ringkasan menyebut Malaysian Journal of Public Health Medicine, sedangkan tabel luaran menautkan situs MJMHS UPM. | Konfirmasi administrasi publikasi; tidak mempengaruhi implementasi inti. |
| Kata kunci | Petunjuk meminta 5 kata kunci tetapi isi yang terlihat hanya 3. | Masalah proposal, bukan software. |

## 18. Rencana development yang dapat dimulai sekarang

| Phase | Nama | Timing | Deliverables | Dependency |
|---|---|---|---|---|
| P0 | Foundation / Scaffolding | Sekarang | Repo, env, database migration, autentikasi dasar, role/permission model, audit foundation, admin shell, convention project. | Tidak memerlukan parameter ilmiah final. |
| P1 | Configurable Instrument Builder | Setelah P0 | Instrument/version/dimension/indicator/answer option/recommendation configuration; Draft-Published-Archived lifecycle. | Dapat dibangun dengan dummy data; jangan publish model ilmiah palsu. |
| P2 | Assessment Workflow | Setelah struktur instrumen stabil | Form generator, save draft, submit/finalize, evidence, history. | Butuh konfirmasi jenis jawaban dan workflow approval. |
| P3 | Scoring & Classification Engine | Setelah parameter penelitian tersedia | Validasi data, scoring, weighting, index, risk classification. | Blocker: formula, bobot, threshold, missing-data rules. |
| P4 | Dashboard & Risk Mapping | Setelah scoring minimal | Index, dimensi, tren, distribusi risiko, risk map, rekomendasi prioritas. | Risk mapping detail masih open. |
| P5 | Recommendation, Follow-up, Notification | Setelah rules tersedia | Recommendation engine, action follow-up, warning/notification. | Butuh rule resmi dan trigger. |
| P6 | Reporting & Export | Setelah hasil stabil | Laporan evaluasi, PDF/Excel export, metadata versi instrumen. | Sesuai output visual proposal. |
| P7 | Validation & Release | Menjelang uji lapangan | Functional testing, UAT, validasi lapangan, sensitivity evaluation support, hardening, backup/restore test. | Sejalan dengan metode proposal. |

## 19. MVP / Definition of Done awal

MVP 2026 dinilai layak secara engineering apabila minimal:
1. pengguna dapat login sesuai role;
2. master pesantren dapat dikelola;
3. instrumen dapat dibuat/configure melalui Draft;
4. versi instrumen dapat Published dan terkunci;
5. form assessment dibangkitkan dari instrumen, bukan hard-coded;
6. assessment dapat disimpan dan difinalisasi;
7. scoring engine menggunakan konfigurasi ilmiah yang disahkan;
8. hasil menampilkan skor indeks/dimensi dan kategori risiko;
9. rekomendasi dibuat dari rule yang disahkan;
10. dashboard menampilkan minimal indeks, skor dimensi/aspek, trend/history, dan risk representation yang disetujui;
11. report/export tersedia sesuai scope;
12. aktivitas sensitif tercatat di audit trail;
13. data historis tidak berubah ketika instrumen versi baru diterbitkan;
14. functional testing dan UAT dapat dijalankan;
15. backup dan restore dasar teruji.

## 20. Keputusan yang harus dipertahankan selama development

- **Jangan hard-code instrumen ilmiah** jika dapat menjadi data konfigurasi.
- **Jangan mengarang formula** berdasarkan mockup.
- **Jangan menganggap contoh 78,5/0-100 sebagai standar final.**
- **Jangan membuat Admin mampu mengubah published science data tanpa versioning/audit.**
- **Jangan menghitung ulang assessment historis secara otomatis dengan versi instrumen baru.**
- **Jangan memasukkan AI/LLM hanya karena nama sistem mengandung kata “Smart”.** Current proposal dapat dipenuhi dengan scoring/rule/analytics engine.
- **Semua requirement baru harus diberi basis:** Proposal, Visual, Diskusi, Rekomendasi, atau Open.

## 21. Urutan kerja paling praktis berikutnya

1. Buat repository dan baseline arsitektur.
2. Tentukan stack teknis bersama tim development.
3. Implementasikan auth + role/permission + audit foundation.
4. Buat schema `pesantren`, `instrument`, `instrument_version`, `dimension`, `indicator`.
5. Buat admin instrument builder dengan lifecycle Draft/Published/Archived.
6. Buat generic assessment form dari data instrumen.
7. Sambil development berjalan, minta SAT 1.0 dan SAM i-SAFE lengkap.
8. Setelah struktur jawaban final tersedia, sesuaikan form engine.
9. Setelah formula/bobot/threshold final tersedia, implement scoring engine final + golden fixtures.
10. Lanjutkan dashboard, risk mapping, rekomendasi, report, UAT.

## 22. Sumber dokumen

Basis utama blueprint ini adalah file pengguna **“01. FORMAT PROPOSAL USULAN PENELITIAN 2026 - HIBAH INTERNAL GIRDC.pdf”** (15 halaman). Analisis dilakukan terhadap teks proposal sekaligus render visual halaman, dengan perhatian khusus pada:
- PDF page 1: daftar tim dan peran;
- PDF page 2: identitas proposal, TKT/TII, mitra dan pendanaan;
- PDF pages 3-6: ringkasan, latar belakang, state of the art;
- PDF page 7: Roadmap dan Target TKT;
- PDF page 8: Diagram Alir Penelitian;
- PDF pages 9-10: metode detail dan Gambar Konsep Sistem Dashboard ISHAS;
- PDF page 11: target luaran dan Jadwal Penelitian;
- PDF pages 12-13: anggaran dan daftar pustaka;
- PDF pages 14-15: lampiran kolaborasi.

Blueprint juga merekap percakapan proyek mengenai admin configurability, versioning, published lock, audit trail, dan keputusan bahwa scaffolding software dapat dimulai sebelum parameter ilmiah final tersedia.


## A. Domain model mental model

Think of the system as two layers:

```text
SCIENTIFIC CONFIGURATION LAYER
  Instrument -> Version -> Dimensions -> Indicators -> Answer Rules
  -> Weights -> Risk Categories -> Recommendation Rules

RUNTIME ASSESSMENT LAYER
  Pesantren -> Assessment -> Answers/Evidence
  -> Scoring Result -> Risk Result -> Recommendations -> Follow-up -> Reports
```

The two layers must be connected by immutable version references.

### A.1 Never conflate these concepts
- `indicator raw answer` is not the same as `indicator score`.
- `dimension score` is not the same as `overall index`.
- `risk category` is derived classification, not a manually editable label for finalized data.
- `recommendation rule` is configuration; `generated recommendation` is an assessment output snapshot.
- `instrument version` is a scientific/configuration snapshot; `app version` is software release version.
- `risk map location` is not yet fully specified; do not force GIS if floorplan/local-area mapping is enough.

### A.2 Recommended immutability boundaries
After instrument version is Published, treat these as immutable for that version:
- dimension ordering/identity;
- indicator definitions;
- answer options and scoring semantics;
- weight configuration;
- risk threshold/category configuration;
- recommendation rules that influence generated output.

If editorial text must be corrected without scientific impact, decide whether the project wants an amendment mechanism; do not assume it is safe.

### A.3 Historical output snapshots
For finalized assessments, consider persisting:
- raw answers;
- normalized indicator values;
- indicator scores;
- applied weights;
- dimension scores;
- overall index;
- risk category;
- generated recommendations;
- instrument_version_id;
- scoring config hash/version;
- finalization timestamp.

This allows audit and avoids re-running new logic over old data unintentionally.

## B. Suggested safe configuration schema

The exact schema depends on the repository stack. Conceptually support:

```yaml
instrument_version:
  code: "..."
  status: draft|published|archived
  dimensions:
    - code: "..."
      label: "..."
      weight: null   # pending until approved
      indicators:
        - code: "..."
          prompt: "..."
          answer_type: "..."
          required: true
          allow_na: false
          scoring_rule: null
          weight: null
          location_binding: null
          recommendation_rules: []
  risk_categories: []
```

Do not populate null scientific fields with guessed values. Validation may allow incomplete Draft versions but must block Publish if required scientific fields are missing.

## C. Publish validation rules

Recommended `publishInstrumentVersion()` checks:
1. version is Draft;
2. unique version code;
3. at least one dimension and indicator;
4. no orphan indicators;
5. every required indicator has a valid answer configuration;
6. scoring config is structurally complete if scoring is required;
7. weight rules pass approved constraints (e.g. totals) **only when those constraints are confirmed**;
8. risk categories are complete and non-overlapping if required;
9. recommendation rules reference existing indicator/category IDs;
10. no unsafe/executable expressions;
11. publish event is audited;
12. version becomes immutable.

## D. Assessment state behavior

Recommended rules:
- Draft: answers editable by authorized user.
- Submitted: edits restricted; exact policy pending.
- Finalized: raw answers and derived output locked except controlled correction flow.
- Correction: create revision/audit record; do not silently mutate history.

If approval/review is not required by research team, keep the state model minimal. Do not over-engineer workflow before confirmation.

## E. Authorization considerations

Do not assume all users see all pesantren.
Recommended scoping:
- Admin System: global operational scope, but scientific locks still apply.
- Assessor: assigned assessment/pesantren scope.
- Pengelola Pesantren: own pesantren scope.
- Tim K3/Satgas: assigned organization scope.
- Pimpinan Yayasan: aggregate/organization scope.
- Pemerintah/Kemenag: read/report scope only if explicitly enabled.
- Peneliti/Auditor: read/export/audit scope depending on approval.

Implement permissions as capabilities rather than large `if role == ...` blocks where practical.

Example capability names:
```text
users.read
users.manage
pesantren.read
pesantren.manage
instrument.read
instrument.create
instrument.edit_draft
instrument.publish
instrument.archive
assessment.create
assessment.edit_draft
assessment.submit
assessment.finalize
assessment.read_all
assessment.read_own_org
assessment.correct_final
report.export
riskmap.read
audit.read
```

## F. Risk mapping implementation guardrail

Current evidence from the visual proposal:
- there is an interactive risk map output;
- mockup resembles area/floorplan mapping;
- levels are shown as high/medium/low in the mockup.

Unknown:
- coordinate system;
- need for actual geographic map;
- whether uploadable floorplans are required;
- mapping granularity;
- category names/colors.

Therefore build a domain abstraction such as:
```text
RiskLocation { id, pesantren_id, parent_id?, name, type?, metadata }
RiskObservation { assessment_id, location_id, indicator_id?, risk_category_id?, score?, note? }
```
Do not make latitude/longitude mandatory unless confirmed.

## G. Reporting/export guardrail

The proposal visual explicitly shows PDF/Excel export. Reports should include:
- pesantren identity;
- assessment date/period;
- instrument version;
- overall/dimension results;
- risk classification;
- recommendations;
- generated timestamp;
- optionally assessor/finalizer identity subject to privacy rules.

Do not export hidden admin-only data or secret configuration by default.

## H. Imports/integration

Visual proposal includes Excel/CSV and API integration. Treat import as controlled ingestion:
1. validate schema/version;
2. preview errors;
3. never partially finalize invalid batches without explicit behavior;
4. record import source and actor;
5. deduplicate or idempotency strategy if later needed;
6. audit bulk changes.

API integration is future-capable but target external systems are unknown. Keep internal service boundaries clean so adapters can be added later.

## I. Notifications

Notification exists in the visual concept, but triggers/channels are open.
Do not hard-code WhatsApp/email/push until selected. Use notification events + channel adapters if/when implemented.

Potential event names (not final business rules):
```text
assessment.submitted
assessment.finalized
risk.high_detected
followup.overdue
instrument.published
```

## J. File storage

Visual architecture explicitly includes document & image storage. Recommended practice:
- DB stores file metadata and ownership;
- object/file storage stores bytes;
- validate MIME/size;
- enforce authorization on download;
- avoid public permanent URLs for sensitive evidence;
- checksum files when useful;
- backup file storage together with DB references.

## K. Testing requirements for agents

For every change affecting scoring/versioning:
- add unit tests;
- add at least one regression case for previous version behavior;
- verify finalized historical assessment remains unchanged;
- verify audit record emitted when expected.

For permissions:
- include positive and negative access tests.

For import/export:
- test malformed input;
- test large enough sample to catch batching issues;
- verify exported metadata includes instrument version.

## L. Commit/change planning checklist for AI agents

Before implementation, answer internally:
1. Which source class supports this change?
2. Does it alter scientific configuration or only software mechanics?
3. Does it affect published versions?
4. Does it change finalized assessment results?
5. Is there a migration?
6. Is backward compatibility required?
7. What tests prove invariants remain true?
8. Is any `[OPEN]` question being silently assumed?

If #8 is yes, stop and make the assumption explicit or ask.

## M. Anti-patterns to avoid

- hard-coded list of 4 dimensions in application code;
- hard-coded 43 indicators in frontend components;
- direct manual `overall_score` editing;
- one mutable global scoring configuration;
- recalculating every historical assessment after a config edit;
- deleting old instrument versions;
- embedding recommendation text in source code if it is research-configurable;
- role checks scattered across UI only without backend authorization;
- using mockup values as formula truth;
- assuming risk map requires Google Maps/GIS;
- building AI recommendation generation before rule-based requirements are final;
- storing evidence files only on local ephemeral filesystem without backup strategy.

## N. Definition of a safe first coding milestone

A good first milestone can be completed even with no final SAT/SAM dataset:
- migrations/entities for users, roles, pesantren, instruments, versions, dimensions, indicators;
- auth/authorization skeleton;
- admin draft instrument CRUD;
- publish lock and clone-new-version flow;
- audit log for instrument changes;
- generic form rendering from dummy Draft instrument;
- tests verifying version immutability.

Do **not** call this scientific ISHAS scoring complete until validated parameters are imported and tested.

## O. When the research team provides SAT 1.0 / SAM i-SAFE

Agent workflow:
1. preserve the original files as source artifacts;
2. extract dimensions/indicators without paraphrasing labels unless asked;
3. map them to importable configuration;
4. mark mapping conflicts for human review;
5. do not decide merged indicators automatically unless the research team approves;
6. create a Draft instrument version;
7. produce a diff/report before Publish;
8. after final scoring config arrives, create golden scoring fixtures with human-verified expected results.

## P. Terminology glossary

- **SAT 1.0:** prior Safety Assessment Tool, described as 4 dimensions and 43 indicators in the proposal.
- **SAM i-SAFE:** model from collaboration with FIST UMPSA; used as integration input.
- **ISHAS:** Integrated Safety & Health Assessment System; digital system/dashboard and related index terminology in the proposal.
- **ISHAS Index / Safety Assessment Index:** composite quantitative assessment built after indicator validation.
- **K3L:** Keselamatan, Kesehatan, dan Lingkungan.
- **CVI:** Content Validity Index.
- **EFA:** Exploratory Factor Analysis.
- **CFA:** Confirmatory Factor Analysis.
- **Cronbach's Alpha:** reliability analysis used for instrument reliability.
- **UAT:** User Acceptance Testing.
- **TKT:** Tingkat Kesiapterapan Teknologi.

## Q. Context refresh protocol

If this repository changes over time, update this file when any of these become final:
- canonical system name;
- final role matrix;
- SAT/SAM integrated instrument;
- answer types;
- scoring formula;
- thresholds;
- recommendation rules;
- risk mapping implementation;
- selected stack;
- deployment environment;
- UAT workflow.

Do not leave obsolete guesses in this file after a decision is approved; move them to a decision log/ADR if historical context is needed.
