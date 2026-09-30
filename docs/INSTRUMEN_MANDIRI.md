# Katalog Instrumen Penilaian Mandiri — 6 Dimensi / 59 Indikator (D-44)

**Status:** katalog resmi prototipe, 30 September 2026.
**Sumber kode:** `apps/web/mocks/seed/instrument-v2.ts` (`INS-v2.0`) → bank live `INS-LIVE`.
**Kategori/aspek:** [KATEGORI_K3.md](KATEGORI_K3.md).
**Aturan:** seluruh bobot/ambang adalah **data ilustrasi**; rumus ilmiah final menunggu D-04/D-13.

Kolom: **Tipe** = tipe jawaban D-24 (`ya-tidak`, `kualitas-1-5`, `frekuensi`, `keparahan`);
**Bukti** = wajib unggah bukti; **Lokasi** = wajib menandai area/denah. Bobot indikator
(pengali) default 1 dan bobot opsi mengikuti opsi bawaan tiap tipe. Angka = nomor titik
yang diminta pemilik.

## Dimensi 1 — `DIM-KES` · Keselamatan dan Keamanan Gedung & Asrama (`KAT-KESELAMATAN`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 1 | `IND-K3L-001` | Kelaikan bangunan | Nilai kelaikan struktur dan kondisi bangunan pesantren. | kualitas-1-5 | – | ✓ |
| 2 | `IND-K3L-002` | Kondisi tangga | Nilai kondisi tangga (kelayakan, pegangan, anti-slip). | kualitas-1-5 | – | ✓ |
| 3 | `IND-K3L-003` | Kondisi koridor & jalur sirkulasi | Nilai kondisi koridor dan jalur sirkulasi. | kualitas-1-5 | – | ✓ |
| 4 | `IND-K3L-004` | Pintu dan akses keluar | Apakah pintu dan akses keluar berfungsi serta tidak terhalang? | ya-tidak | – | ✓ |
| 5 | `IND-K3L-005` | Instalasi listrik | Nilai keamanan instalasi listrik. | kualitas-1-5 | ✓ | ✓ |
| 6 | `IND-K3L-006` | Pencegahan kebakaran | Apakah upaya pencegahan kebakaran tersedia dan layak? | ya-tidak | ✓ | ✓ |
| 7 | `IND-K3L-007` | Keamanan asrama | Nilai keamanan asrama (akses, pengawasan, kunci). | kualitas-1-5 | – | ✓ |
| 8 | `IND-K3L-008` | Keamanan area kampus | Nilai keamanan area kampus (pagar, pos, akses). | kualitas-1-5 | – | – |
| 9 | `IND-K3L-009` | Keselamatan fasilitas olahraga | Nilai keselamatan fasilitas olahraga. | kualitas-1-5 | – | ✓ |
| 10 | `IND-K3L-010` | Keselamatan laboratorium/workshop | Nilai keselamatan laboratorium/workshop. | kualitas-1-5 | ✓ | ✓ |

Aspek: `ASP-KES-001` (1–4), `ASP-KES-002` (5–6), `ASP-KES-003` (7–8), `ASP-KES-004` (9–10).

## Dimensi 2 — `DIM-DARURAT` · Sistem Tanggap Darurat & Antisipasi Kebencanaan (`KAT-DARURAT`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 11 | `IND-K3L-011` | Jalur evakuasi | Apakah jalur evakuasi jelas, bebas hambatan, dan menuju titik aman? | ya-tidak | – | ✓ |
| 12 | `IND-K3L-012` | Titik kumpul | Apakah titik kumpul tersedia dan mudah dijangkau? | ya-tidak | – | ✓ |
| 13 | `IND-K3L-013` | Rambu keselamatan | Apakah rambu keselamatan tersedia, jelas, dan sesuai? | kualitas-1-5 | – | ✓ |
| 14 | `IND-K3L-014` | Sistem alarm darurat | Apakah sistem alarm darurat berfungsi? | ya-tidak | ✓ | – |
| 15 | `IND-K3L-015` | APAR | Apakah APAR tersedia, layak, dan tidak kedaluwarsa? | ya-tidak | ✓ | ✓ |
| 16 | `IND-K3L-016` | Kotak P3K | Apakah kotak P3K tersedia dan lengkap? | ya-tidak | – | ✓ |
| 17 | `IND-K3L-017` | Emergency lighting | Apakah pencahayaan darurat berfungsi saat listrik padam? | ya-tidak | – | ✓ |
| 18 | `IND-K3L-018` | Sistem komunikasi darurat | Apakah sistem komunikasi darurat tersedia dan berfungsi? | ya-tidak | – | – |
| 19 | `IND-K3L-019` | Simulasi kebencanaan | Seberapa rutin simulasi kebencanaan dilakukan? | frekuensi | ✓ | – |
| 20 | `IND-K3L-020` | SOP/Rencana Tanggap Darurat | Apakah SOP/rencana tanggap darurat tersedia dan dipahami? | ya-tidak | ✓ | – |

Aspek: `ASP-DAR-001` (11–13), `ASP-DAR-002` (14–18), `ASP-DAR-003` (19–20).

## Dimensi 3 — `DIM-SEH` · Kesehatan (`KAT-KESEHATAN`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 21 | `IND-K3L-021` | Ruang/fasilitas kesehatan | Nilai kelayakan ruang/fasilitas kesehatan. | kualitas-1-5 | – | ✓ |
| 22 | `IND-K3L-022` | Pelayanan kesehatan | Nilai ketersediaan dan kualitas pelayanan kesehatan. | kualitas-1-5 | – | – |
| 23 | `IND-K3L-023` | Akses pertolongan medis | Nilai kecepatan akses ke pertolongan medis. | kualitas-1-5 | – | – |
| 24 | `IND-K3L-024` | P3K | Apakah layanan P3K tersedia dan mudah diakses? | ya-tidak | – | ✓ |
| 25 | `IND-K3L-025` | Ketersediaan air minum | Nilai ketersediaan dan kelayakan air minum. | kualitas-1-5 | ✓ | – |
| 26 | `IND-K3L-026` | Sanitasi personal | Nilai kebersihan dan ketersediaan sarana sanitasi personal. | kualitas-1-5 | – | – |
| 27 | `IND-K3L-027` | Ventilasi & kualitas udara | Nilai ventilasi dan kualitas udara ruangan. | kualitas-1-5 | – | – |
| 28 | `IND-K3L-028` | Pencahayaan | Nilai pencahayaan ruangan. | kualitas-1-5 | – | ✓ |
| 29 | `IND-K3L-029` | Pengendalian penyakit | Nilai upaya pengendalian penyakit menular. | kualitas-1-5 | – | – |
| 30 | `IND-K3L-030` | Fasilitas kebugaran/olahraga | Nilai ketersediaan fasilitas kebugaran/olahraga. | kualitas-1-5 | – | ✓ |

Aspek: `ASP-SEH-001` (21–24), `ASP-SEH-002` (25–26), `ASP-SEH-003` (27–30).

## Dimensi 4 — `DIM-LING` · Kesehatan Lingkungan (`KAT-LINGKUNGAN`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 31 | `IND-K3L-031` | Pengelolaan sampah | Nilai pengelolaan sampah. | kualitas-1-5 | – | ✓ |
| 32 | `IND-K3L-032` | Pengelolaan limbah | Nilai pengelolaan limbah. | kualitas-1-5 | ✓ | ✓ |
| 33 | `IND-K3L-033` | Drainase | Nilai kondisi drainase (tidak tersumbat/genangan). | kualitas-1-5 | – | ✓ |
| 34 | `IND-K3L-034` | Air bersih | Nilai ketersediaan dan kualitas air bersih. | kualitas-1-5 | ✓ | – |
| 35 | `IND-K3L-035` | Air limbah | Nilai pengelolaan air limbah. | kualitas-1-5 | – | – |
| 36 | `IND-K3L-036` | Toilet & kamar mandi | Nilai kebersihan dan kelayakan toilet & kamar mandi. | kualitas-1-5 | – | ✓ |
| 37 | `IND-K3L-037` | Pengendalian vektor | Nilai pengendalian vektor (nyamuk, tikus, lalat, kecoa). | kualitas-1-5 | – | – |
| 38 | `IND-K3L-038` | Kebersihan lingkungan | Nilai kebersihan lingkungan secara umum. | kualitas-1-5 | – | – |
| 39 | `IND-K3L-039` | Ruang terbuka hijau | Nilai ketersediaan dan kondisi ruang terbuka hijau. | kualitas-1-5 | – | ✓ |
| 40 | `IND-K3L-040` | Kualitas lingkungan | Nilai kualitas lingkungan secara keseluruhan. | kualitas-1-5 | – | – |

Aspek: `ASP-LING-001` (31, 32, 35), `ASP-LING-002` (33–34), `ASP-LING-003` (36–37), `ASP-LING-004` (38–40).

## Dimensi 5 — `DIM-PSI` · Psikososial: Bullying & Kesehatan Mental (`KAT-PSIKOSOSIAL`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 41 | `IND-K3L-041` | Kebijakan/peraturan anti-bullying | Apakah kebijakan anti-bullying tersedia dan tersosialisasi? | ya-tidak | ✓ | – |
| 42 | `IND-K3L-042` | Mekanisme pelaporan | Apakah mekanisme pelaporan bullying mudah diakses? | ya-tidak | – | – |
| 43 | `IND-K3L-043` | Penanganan kasus bullying | Nilai penanganan kasus bullying sesuai prosedur. | kualitas-1-5 | – | – |
| 44 | `IND-K3L-044` | Fasilitas konseling | Nilai ketersediaan fasilitas konseling. | kualitas-1-5 | – | ✓ |
| 45 | `IND-K3L-045` | Layanan kesehatan mental | Nilai ketersediaan layanan kesehatan mental. | kualitas-1-5 | – | – |
| 46 | `IND-K3L-046` | Program promotif kesehatan mental | Seberapa rutin program promotif kesehatan mental dilakukan? | frekuensi | – | – |
| 47 | `IND-K3L-047` | Kondisi psikososial | Nilai kondisi psikososial penghuni. | kualitas-1-5 | – | – |
| 48 | `IND-K3L-048` | Perlindungan kelompok rentan | Nilai perlindungan kelompok rentan. | kualitas-1-5 | – | – |

Aspek: `ASP-PSI-001` (41–43), `ASP-PSI-002` (44–46), `ASP-PSI-003` (47–48).

## Dimensi 6 — `DIM-AKSES` · Fasilitas Disabilitas & Aksesibilitas (`KAT-AKSESIBILITAS`)

| No | ID | Judul | Prompt | Tipe | Bukti | Lokasi |
|---|---|---|---|---|---|---|
| 49 | `IND-K3L-049` | Jalur aksesibilitas | Apakah jalur aksesibilitas tersedia dan bebas hambatan? | ya-tidak | – | ✓ |
| 50 | `IND-K3L-050` | Toilet aksesibel | Apakah toilet aksesibel tersedia dan layak? | ya-tidak | – | ✓ |
| 51 | `IND-K3L-051` | Tangga & handrail | Apakah tangga & handrail memadai untuk aksesibilitas? | ya-tidak | – | ✓ |
| 52 | `IND-K3L-052` | Lift/platform lift | Apakah lift/platform lift tersedia dan berfungsi? | ya-tidak | – | – |
| 53 | `IND-K3L-053` | Pintu aksesibel | Apakah pintu aksesibel (lebar dan mudah dibuka) tersedia? | ya-tidak | – | ✓ |
| 54 | `IND-K3L-054` | Parkir disabilitas | Apakah parkir disabilitas tersedia? | ya-tidak | – | ✓ |
| 55 | `IND-K3L-055` | Guiding block | Apakah guiding block tersedia dan terpasang benar? | ya-tidak | – | ✓ |
| 56 | `IND-K3L-056` | Signage aksesibilitas | Apakah signage aksesibilitas tersedia dan jelas? | ya-tidak | – | – |
| 57 | `IND-K3L-057` | Aksesibilitas asrama | Nilai aksesibilitas asrama bagi penyandang disabilitas. | kualitas-1-5 | – | – |
| 58 | `IND-K3L-058` | Aksesibilitas ruang akademik | Nilai aksesibilitas ruang akademik. | kualitas-1-5 | – | – |
| 59 | `IND-K3L-059` | Aksesibilitas informasi | Nilai aksesibilitas informasi (teks alternatif, bahasa isyarat, dsb.). | kualitas-1-5 | – | – |

Aspek: `ASP-AKS-001` (49, 51, 52, 55), `ASP-AKS-002` (50, 53, 54), `ASP-AKS-003` (56–59).

## Opsi & bobot bawaan per tipe (ilustrasi)

- `ya-tidak`: Ya (100), Tidak (20, temuan).
- `kualitas-1-5`: 1 (20, temuan), 2 (40, temuan), 3 (60), 4 (80), 5 (100), N/A (0).
- `frekuensi`: Tidak pernah (100), Jarang (80), Kadang-kadang (60), Sering (40, temuan), Selalu (20, temuan).
- `keparahan`: Ringan (80), Sedang (60), Berat (40, temuan), Kritis (20, temuan).

Bobot/ambang dapat diubah Validator lewat bank live (FLOWS §7) dan tetap dummy
sampai keputusan ilmiah final (D-04/D-13).
