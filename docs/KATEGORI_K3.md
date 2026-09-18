# Kategori & Aspek K3 — Patokan Tunggal (D-15)

**Status:** kontrak prototipe frontend-only, 19 September 2026.
**Keputusan:** D-15 (DECISIONS.md). Struktur **Kategori → Aspek → Indikator**.
**Aturan prototipe tetap berlaku:** semua angka/ambang berlabel `Data ilustrasi`; rumus final menunggu tim penelitian (AGENTS.md, README).

Dokumen ini adalah **single source of truth konseptual**. Kode memakai satu sumber turunan:
`apps/web/mocks/kategori-k3.ts` (`K3_CATEGORIES`). Dilarang mendefinisikan ulang daftar
kategori di komponen, processor, atau seed lain.

## 1. Empat kategori utama (ID stabil, case-sensitive)

| ID | Nama | Deskripsi | Ikon Lucide (existing) | Contoh cakupan |
|---|---|---|---|---|
| `KAT-KESELAMATAN` | Keselamatan | Keselamatan fisik, fasilitas, dan kondisi lingkungan kerja/tempat kegiatan. | `ShieldCheck` | Bangunan, instalasi listrik, kebakaran, jalur evakuasi, APAR, tangga, lantai, pintu darurat, peralatan keselamatan |
| `KAT-KESEHATAN` | Kesehatan | Kesehatan penghuni/pengguna lingkungan pesantren. | `HeartPulse` | Kebersihan, sanitasi, air bersih, toilet, makanan/dapur, ventilasi, sirkulasi udara |
| `KAT-LINGKUNGAN` | Lingkungan | Kondisi dan pengelolaan lingkungan pesantren. | `Leaf` | Sampah, drainase, kualitas air/udara, limbah, penghijauan, kebersihan lingkungan |
| `KAT-PSIKOSOSIAL` | Psikososial | Kondisi psikologis, sosial, beban aktivitas, dan interaksi antar individu. | `Brain` | Beban kerja/aktivitas, dukungan sosial, stres, konflik, kepuasan, tekanan, hubungan antar individu |

Aksesibilitas (DESIGN_SYSTEM §4): kategori selalu dibedakan dengan **nama + ikon**,
tidak pernah warna saja. Warna aksen grafik boleh berbeda tetapi bukan satu-satunya pembeda.

## 2. Aspek / sub-aspek awal (ID stabil)

Aspek adalah pengelompokan indikator di dalam satu kategori. Daftar awal berasal dari
contoh cakupan brief; Peneliti dapat menambah aspek lewat Draft instrumen (FLOWS §7).

| Aspek ID | Kategori | Nama aspek |
|---|---|---|
| `ASP-KES-001` | Keselamatan | Instalasi listrik |
| `ASP-KES-002` | Keselamatan | Proteksi kebakaran & APAR |
| `ASP-KES-003` | Keselamatan | Jalur evakuasi & pintu darurat |
| `ASP-KES-004` | Keselamatan | Bangunan, tangga & lantai |
| `ASP-KES-005` | Keselamatan | Peralatan keselamatan |
| `ASP-SEH-001` | Kesehatan | Air bersih & sanitasi |
| `ASP-SEH-002` | Kesehatan | Kebersihan dapur & makanan |
| `ASP-SEH-003` | Kesehatan | Ventilasi & sirkulasi udara |
| `ASP-LING-001` | Lingkungan | Pengelolaan sampah |
| `ASP-LING-002` | Lingkungan | Drainase, limbah & kualitas air |
| `ASP-LING-003` | Lingkungan | Kualitas udara & penghijauan |
| `ASP-PSI-001` | Psikososial | Beban kerja & aktivitas |
| `ASP-PSI-002` | Psikososial | Dukungan sosial & hubungan |

## 3. Relasi data (kontrak)

```
Kategori K3 (KAT-*)
  ↓ 1..n
Aspek (ASP-*)
  ↓ 1..n
Indikator (IND-K3L-*) — punya categoryId + aspectId
  ↓ jawaban snapshot penilaian-mandiri
Hasil Pelaporan / Assessment (Report + SelfAssessmentSnapshot)
  ↓ kandidat temuan ilustratif per jawaban (D-14.b)
Risk Level / Temuan (RiskFinding.level: Rendah/Sedang/Tinggi/Ekstrem)
  ↓ rekomendasi
Tindak Lanjut (Recommendation)
```

Contoh (asumsi prototipe, bukan ketentuan ilmiah):

- Kategori: Psikososial (`KAT-PSIKOSOSIAL`)
- Aspek: Beban Kerja (`ASP-PSI-001`)
- Indikator: "Apakah beban kerja sesuai kapasitas dan standar?" (`IND-K3L-009`)
- Hasil: Tidak Sesuai → Temuan: "Beban berlebih bagian administrasi."
- Likelihood 3 × Severity 3 = Skor 9 → **Moderate/Sedang** (ilustrasi; skala & ambang final menunggu D-04/D-13).

Aturan turunan temuan (ilustratif, sama seperti D-14.b, diperluas ke indikator baru):

- `likert-1-5` bernilai `1/2` → temuan.
- `likert-1-2-tidak` bernilai `1/Tidak` → temuan (nilai `2` = Sesuai, bukan temuan).
- `boolean-ya-tidak` bernilai `Tidak` → temuan.
- `severity/priority` tetap **hanya pengelola saat Terima** (FLOWS §4, D-15.c).
  Form publik tidak berisi Likelihood/Severity/Risk Score/Rekomendasi.

## 4. Mapping dimensi lama → struktur baru

`INS-v1.0` (2 dimensi) dipertahankan sebagai arsip agar snapshot lama (`RPT-0002/0004/0007`)
tetap dapat direproduksi. Tidak ada penulisan ulang histori.

| ID lama | Lokasi lama | Lokasi baru (`INS-v1.1`) | Keterangan |
|---|---|---|---|
| `IND-K3L-001` Instalasi listrik aman | DIM-001 | Keselamatan / Instalasi listrik | Tetap, tambah `categoryId`+`aspectId` |
| `IND-K3L-002` Kabel tertata | DIM-001 | Keselamatan / Instalasi listrik | Tetap |
| `IND-K3L-003` APAR | DIM-001 | Keselamatan / Proteksi kebakaran | Tetap |
| `IND-K3L-005` Jalur evakuasi | DIM-002 (salah kamar) | Keselamatan / Evakuasi | **Pindah kategori** (koreksi DASHBOARD_REDESIGN_REVIEW §5) |
| `IND-K3L-004` Air bersih | DIM-002 | Kesehatan / Air & sanitasi | Tetap, pindah dimensi |
| `IND-K3L-006` Sampah harian | DIM-002 | Lingkungan / Sampah | Tetap, pindah dimensi (brief menaruh sampah di Lingkungan) |
| `IND-K3L-007` Ventilasi (baru) | — | Kesehatan / Ventilasi | Baru di `INS-v1.1` |
| `IND-K3L-008` Drainase & limbah (baru) | — | Lingkungan / Drainase | Baru di `INS-v1.1` |
| `IND-K3L-009` Beban kerja (baru) | — | Psikososial / Beban kerja | Baru di `INS-v1.1` |
| `IND-K3L-010` Dukungan sosial (baru) | — | Psikososial / Dukungan sosial | Baru di `INS-v1.1` |

`INS-v1.0` diberi `categoryId` fallback pada processor agar dashboard lama tetap jalan:
DIM-001 → Keselamatan; DIM-002 → campuran (dipetakan per indikator, bukan per dimensi).

## 5. Level risiko Ekstrem (D-15.b, asumsi prototipe)

- Enum baru: `RiskLevel = Rendah | Sedang | Tinggi | Ekstrem` (urutan naik).
- `RiskFinding.level`, `residualRisk`, donat risiko, filter, dan `StatusChip` mendukung keempatnya.
- Pemetaan tampilan memakai kelas existing (tanpa kelas `.status` baru):
  `Ekstrem → status-red + ikon Flame + label "Ekstrem"`.
  Pembedaan memakai label + ikon, bukan warna saja.
- Matriks Likelihood(1–3) × Severity(1–3) pada brief dicatat sebagai **ilustrasi visual**,
  bukan ambang resmi. Ambang resmi + rumus indeks menunggu D-04/D-13 final.
- Seed pengguna kini memuat satu temuan Ekstrem ilustratif (APAR musala), bukan
  bukti ambang ilmiah; empat tingkat diuji bersama.

## 6. Kontrak metrik dashboard per kategori

Untuk setiap kategori (ditambah baris `Belum dipetakan` untuk lapor-cepat tanpa indikator):

- jumlah indikator (katalog instrumen Published (`INS-v1.1` pada seed), bukan jumlah jawaban)
- jumlah temuan (temuan `Diterima` + belum arsip + scope filter)
- jumlah sesuai / tidak sesuai (dari snapshot `Diterima`; sesuai = jawaban tidak memicu temuan)
- jumlah risiko Rendah / Sedang / Tinggi / Ekstrem (satu hitung per ID temuan)

Sumber dataset selalu sama dengan ringkasan utama: `selectPublicReports` (Diterima,
belum arsip, pesantren terdaftar, bukan Completed). Filter pesantren mempersempit metrik operasional bersama. Katalog Published tetap
global. Periode URL masih pratinjau, bukan filter seluruh angka; kontrak lengkap
di [DASHBOARD_DATA_FLOW.md](DASHBOARD_DATA_FLOW.md).

## 7. Kontrak form (D-15.c)

Alur lapor-cepat (opsional, tidak wajib — laporan tanpa kategori tetap sah):

```
Lokasi → Kategori → Aspek → Indikator terkait (opsional)
  → Kondisi/Judul → Temuan/Deskripsi → Potensi bahaya (deskripsi)
  → Foto → Kirim (risiko diisi pengelola saat validasi)
```

- Memilih kategori memfilter aspek; memilih aspek memfilter indikator (cascading).
- Penilaian-mandiri: navigasi dikelompokkan Kategori → Aspek → Indikator;
  versi Published terkunci; draft lama terkunci kirim (D-10).
- Validasi: `aspectId` harus milik `categoryId`; `indicatorId` harus milik `aspectId`.
  Pelanggaran ditolak dengan pesan "Kategori/aspek/indikator tidak konsisten."

## 8. Migrasi & seed

- Schema `5 → 6` (`ishas-mock-v5 → ishas-mock-v6`); `migrateV5` mempertahankan seluruh
  record/ID, hanya menambah field (`categoryId/aspectId` fallback, `level` tetap valid).
- `INS-v1.0` → `Archived`; `INS-v1.1` (4 kategori, 10 indikator) → `Published` + aktif.
  Snapshot lama tetap merujuk `INS-v1.0` dan tidak dihitung ulang.
- `resetMockData` kembali ke seed `INS-v1.1` + histori `INS-v1.0`.

## 9. Responsif & non-tujuan

- Grid existing dipertahankan: 1 kolom ponsel, 2 kolom tablet, kolom samping menumpuk;
  tabel rekap `overflow-x-auto`, nama kategori boleh wrap tanpa merusak layout.
- Non-tujuan tahap ini: redesign besar, ganti framework, rumus ilmiah final, backend,
  PDF/Excel nyata, mock permanen di luar seed.
