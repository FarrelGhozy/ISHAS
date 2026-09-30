# Kategori & Aspek K3 — Patokan Tunggal (D-15, D-44)

**Status:** kontrak prototipe frontend-only, diperbarui 30 September 2026.
**Keputusan:** D-15 (struktur), D-24 (bank live), **D-44 (6 kategori / 59 indikator)**.
**Struktur:** **Kategori → Aspek → Indikator**.
**Aturan prototipe tetap berlaku:** semua angka/ambang berlabel `Data ilustrasi`; rumus final menunggu tim penelitian (AGENTS.md, README).

Dokumen ini adalah **single source of truth konseptual**. Kode memakai satu sumber turunan:
`apps/web/mocks/kategori-k3.ts` (`K3_CATEGORIES`). Soal bank live diturunkan dari
`apps/web/mocks/seed/instrument-v2.ts` (`INS-v2.0`). Dilarang mendefinisikan ulang
daftar kategori di komponen, processor, atau seed lain. Katalog 59 indikator
(judul, prompt, tipe, bobot, flag bukti/lokasi) ada di
[INSTRUMEN_MANDIRI.md](INSTRUMEN_MANDIRI.md).

## 1. Enam kategori utama (ID stabil, case-sensitive)

| ID | Nama | Deskripsi | Ikon Lucide (existing) |
|---|---|---|---|
| `KAT-KESELAMATAN` | Keselamatan dan Keamanan Gedung & Asrama | Keselamatan fisik gedung/asrama, keamanan lingkungan, fasilitas khusus kegiatan. | `ShieldCheck` |
| `KAT-DARURAT` | Sistem Tanggap Darurat & Antisipasi Kebencanaan | Kesiapan evakuasi, sistem peringatan, perlengkapan darurat, prosedur & simulasi. | `Siren` |
| `KAT-KESEHATAN` | Kesehatan | Layanan kesehatan, sanitasi personal, kualitas lingkungan sehat. | `HeartPulse` |
| `KAT-LINGKUNGAN` | Kesehatan Lingkungan | Sampah/limbah, air & drainase, sanitasi, pengendalian vektor, kebersihan lingkungan. | `Leaf` |
| `KAT-PSIKOSOSIAL` | Psikososial: Bullying & Kesehatan Mental | Kebijakan/penanganan bullying, layanan kesehatan mental, perlindungan kelompok rentan. | `Brain` |
| `KAT-AKSESIBILITAS` | Fasilitas Disabilitas & Aksesibilitas | Jalur, ruang, fasilitas, dan informasi yang aksesibel. | `Accessibility` |

Aksesibilitas (DESIGN_SYSTEM §4): kategori selalu dibedakan dengan **nama + ikon**,
tidak pernah warna saja. Dua ikon baru (`Siren`, `Accessibility`) sudah tersedia di
lucide-react; tidak ada kelas status baru (DESIGN_SYSTEM §5).

## 2. Aspek per kategori (ID stabil)

Aspek adalah pengelompokan indikator di dalam satu kategori. Validator dapat
menambah aspek lewat bank live (FLOWS §7).

| Aspek ID | Kategori | Nama aspek | Indikator |
|---|---|---|---|
| `ASP-KES-001` | Keselamatan | Struktur & bangunan | 1–4 |
| `ASP-KES-002` | Keselamatan | Kelistrikan & kebakaran | 5–6 |
| `ASP-KES-003` | Keselamatan | Keamanan lingkungan | 7–8 |
| `ASP-KES-004` | Keselamatan | Fasilitas khusus | 9–10 |
| `ASP-DAR-001` | Tanggap Darurat | Jalur & titik evakuasi | 11–13 |
| `ASP-DAR-002` | Tanggap Darurat | Sistem peringatan & perlengkapan | 14–18 |
| `ASP-DAR-003` | Tanggap Darurat | Kesiapan & prosedur | 19–20 |
| `ASP-SEH-001` | Kesehatan | Layanan & fasilitas kesehatan | 21–24 |
| `ASP-SEH-002` | Kesehatan | Air & sanitasi personal | 25–26 |
| `ASP-SEH-003` | Kesehatan | Kualitas lingkungan & aktivitas | 27–30 |
| `ASP-LING-001` | Lingkungan | Sampah & limbah | 31, 32, 35 |
| `ASP-LING-002` | Lingkungan | Air & drainase | 33–34 |
| `ASP-LING-003` | Lingkungan | Sanitasi & vektor | 36–37 |
| `ASP-LING-004` | Lingkungan | Kebersihan & kualitas lingkungan | 38–40 |
| `ASP-PSI-001` | Psikososial | Kebijakan & penanganan bullying | 41–43 |
| `ASP-PSI-002` | Psikososial | Layanan kesehatan mental | 44–46 |
| `ASP-PSI-003` | Psikososial | Kondisi psikososial & perlindungan | 47–48 |
| `ASP-AKS-001` | Aksesibilitas | Jalur & sirkulasi | 49, 51, 52, 55 |
| `ASP-AKS-002` | Aksesibilitas | Ruang & fasilitas | 50, 53, 54 |
| `ASP-AKS-003` | Aksesibilitas | Informasi & akses ruang | 56–59 |

## 3. Relasi data (kontrak)

```
Kategori K3 (KAT-*)
  ↓ 1..n
Aspek (ASP-*)
  ↓ 1..n
Indikator (IND-K3L-001…059, punya categoryId + aspectId) — 59 total (D-44)
  ↓ jawaban snapshot penilaian-mandiri
Hasil Penilaian / Assessment (Report + SelfAssessmentSnapshot) — skor saja, tanpa temuan (D-32)
  ↓ (hanya lapor-cepat) kandidat temuan ilustratif per laporan divalidasi
Risk Level / Temuan (RiskFinding.level: Rendah/Sedang/Tinggi/Ekstrem)
  ↓ rekomendasi
Tindak Lanjut (Recommendation)
```

Contoh (asumsi prototipe, bukan ketentuan ilmiah):

- Kategori: Psikososial (`KAT-PSIKOSOSIAL`)
- Aspek: Kebijakan & penanganan bullying (`ASP-PSI-001`)
- Indikator: "Kebijakan/peraturan anti-bullying" (`IND-K3L-041`)
- Hasil: Tidak Sesuai → skor dimensi turun (penilaian mandiri tidak membentuk temuan — D-32).

Aturan turunan temuan (ilustratif) hanya berlaku untuk **lapor-cepat** yang
diterima Pesantren; penilaian mandiri tidak memicu temuan (D-32).

- `severity/priority` tetap **hanya akun Pesantren saat Terima** lapor-cepat (FLOWS §4, D-15.c).
  Form publik tidak berisi Likelihood/Severity/Risk Score/Rekomendasi.

## 4. Pemetaan dari instrumen lama (arsip)

`INS-v1.0` (2 dimensi/6 indikator) tetap sebagai arsip agar snapshot lama dapat
direproduksi. `INS-v1.1` (4 kategori/10 indikator) **digantikan** `INS-v2.0`.
Tidak ada penulisan ulang histori versi lama; snapshot baru memakai `INS-v2.0`.

| ID lama | Asal | Lokasi baru (`INS-v2.0`) |
|---|---|---|
| `IND-K3L-001` Instalasi listrik | Keselamatan | `IND-K3L-005` Instalasi listrik (`ASP-KES-002`) |
| `IND-K3L-002` Kabel tertata | Keselamatan | menjadi bagian penilaian `IND-K3L-005` |
| `IND-K3L-003` APAR | Keselamatan | `IND-K3L-015` APAR (`ASP-DAR-002`, Tanggap Darurat) |
| `IND-K3L-004` Air bersih | Kesehatan | `IND-K3L-034` Air bersih (`ASP-LING-002`) / air minum `IND-K3L-025` |
| `IND-K3L-005` Jalur evakuasi | Keselamatan | `IND-K3L-011` Jalur evakuasi (`ASP-DAR-001`) |
| `IND-K3L-006` Sampah harian | Lingkungan | `IND-K3L-031` Pengelolaan sampah (`ASP-LING-001`) |
| `IND-K3L-007` Ventilasi | Kesehatan | `IND-K3L-027` Ventilasi & kualitas udara (`ASP-SEH-003`) |
| `IND-K3L-008` Drainase & limbah | Lingkungan | `IND-K3L-033` Drainase / `IND-K3L-032` Limbah |
| `IND-K3L-009` Beban kerja | Psikososial | tercakup kondisi psikososial `IND-K3L-047` |
| `IND-K3L-010` Dukungan sosial | Psikososial | tercakup kondisi psikososial `IND-K3L-047` |

## 5. Level risiko Ekstrem (D-15.b, asumsi prototipe)

- Enum: `RiskLevel = Rendah | Sedang | Tinggi | Ekstrem` (urutan naik).
- `RiskFinding.level`, `residualRisk`, donat risiko, filter, dan `StatusChip` mendukung keempatnya.
- Pemetaan tampilan: `Ekstrem → status-red + ikon Flame + label "Ekstrem"`.
  Pembedaan memakai label + ikon, bukan warna saja.
- Matriks Likelihood(1–3) × Severity(1–3) pada brief adalah **ilustrasi visual**,
  bukan ambang resmi. Ambang resmi + rumus indeks menunggu D-04/D-13 final.

## 6. Kontrak metrik dashboard per kategori

Untuk setiap kategori (ditambah baris `Belum dipetakan` untuk lapor-cepat tanpa indikator):

- jumlah indikator (katalog bank live D-24/D-44: 10/10/10/10/8/11)
- jumlah temuan (temuan `lapor-cepat` `Diterima` + belum arsip + scope filter; penilaian mandiri tidak menyumbang temuan — D-32)
- jumlah sesuai / tidak sesuai (dari snapshot `Diterima`/`Terbit`; sesuai = jawaban tidak memicu temuan)
- jumlah risiko Rendah / Sedang / Tinggi / Ekstrem (satu hitung per ID temuan)

Sumber dataset selalu sama dengan ringkasan utama: `selectPublicReports` (`Diterima`/`Terbit`,
belum arsip, pesantren terdaftar, bukan Completed). Filter pesantren mempersempit metrik operasional bersama. Katalog bank live tetap
global. Periode URL masih pratinjau, bukan filter seluruh angka; kontrak lengkap
di [DASHBOARD_DATA_FLOW.md](DASHBOARD_DATA_FLOW.md).

## 7. Kontrak form (D-15.c)

Alur lapor-cepat (opsional, tidak wajib — laporan tanpa kategori tetap sah; D-19):

```
Lokasi → Kategori → Aspek (tanpa Indikator)
  → Usulan mandiri (Tingkat keparahan + Prioritas, opsional)
  → Kondisi/Judul → Temuan/Deskripsi → Potensi bahaya (deskripsi)
  → Foto → Kirim (keputusan risiko final oleh akun Pesantren saat validasi)
```

- Memilih kategori memfilter aspek. `Indikator terkait` tidak tampil pada
  lapor-cepat baru; data lama yang masih menyimpan `indicatorId` tetap dibaca.
- Penilaian-mandiri: navigasi dikelompokkan Kategori → Aspek → Indikator
  (6 dimensi/59 indikator, `INS-v2.0` → bank live `INS-LIVE`); checksum bank
  mengunci draft basi (D-24).
- Validasi: `aspectId` harus milik `categoryId`. Usulan pelapor
  (`reporterSeverity/reporterPriority`) ditinjau ulang; `severity/priority`
  final tetap **hanya akun Pesantren saat Terima** (FLOWS §4, D-15.c, D-19).
  Pelanggaran konsistensi ditolak dengan pesan "Kategori/aspek tidak konsisten."
  Form publik tidak berisi Likelihood/Risk Score/Rekomendasi final.

## 8. Migrasi & seed

- Schema seed tetap **v15**; tidak ada DDL baru. Kategori/aspek baru masuk lewat
  seed (`k3_categories`/`k3_aspects`) yang dibaca dari `K3_CATEGORIES`.
- **D-24:** bank live `INS-LIVE` diturunkan dari `INS-v2.0` (tipe baru
  `ya-tidak`/`kualitas-1-5`/`frekuensi`/`keparahan`); snapshot baru membeku
  (soal + opsi + bobot + `scorePercent`); `resetMockData` kembali ke seed.
- **D-44:** seed demo dan seed inisiasi (`empty`) memuat 6 dimensi/59 indikator.
  `instrumentVersions`: `INS-v1.0` arsip + `INS-v2.0` Published aktif;
  `activeInstrumentVersionId = "INS-v2.0"`.

## 9. Responsif & non-tujuan

- Grid existing dipertahankan: 1 kolom ponsel, 2 kolom tablet, kolom samping menumpuk;
  tabel rekap `overflow-x-auto`, nama kategori boleh wrap tanpa merusak layout.
- Non-tujuan tahap ini: redesign besar, ganti framework, rumus ilmiah final, backend baru,
  PDF/Excel nyata, mock permanen di luar seed.
