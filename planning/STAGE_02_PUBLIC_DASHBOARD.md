# Stage Stage 02 — Shell Publik + Dashboard Agregat

**Status:** REVIEW
**Catatan review:** D-02 telah dijawab (8 September 2026): publik ringkasan saja + nama
validator/PIC; **count antrean tidak publik**. Bagian D-04 dijawab pemilik pada 8 September 2026
sebagai **aturan ilustrasi** (bukan rumus final): skor dari snapshot penilaian mandiri `Diterima`
terbaru per pesantren, normalisasi likert, rata-rata bobot sama per lembaga, tren memakai deret
ilustratif seed. Rincian di `../DECISIONS.md` (usulan D-04). Stage diaktifkan pemilik pada
sesi yang sama ("kerjakan stage 2" + "dashboardnya penuh dengan data").
**Dependensi:** Stage 01 `REVIEW` (fondasi tersedia; persetujuan formal menyusul sesuai aturan §3).
**Tujuan:** dashboard `/` final secara visual dan fungsional: shell publik ringan,
pemilih pesantren, agregat multi-lembaga, grafik, temuan prioritas, panel antrean netral.

## Ruang lingkup

### 1. Shell publik ringan

- [x] Header: logo + `ISHAS` + `Penilaian K3L Pesantren` | kanan: chip `Data publik · ilustrasi`
 (`status-blue`, ikon `Info`) + tombol **Masuk** (`secondary-button`; bila login: tombol **Ruang kerja** + nama akun).
 (Keluar dipindah ke shell workspace; sesi/`Masuk` tanpa ikon sesuai spesifikasi.)
- [x] Bar konteks: pemilih pesantren (opsi pertama `Semua pesantren terdaftar`, sisanya `kode — nama`
 HANYA terdaftar) + info periode + **Laporkan temuan** (`primary-button`, ikon `Plus`) +
 **Penilaian mandiri** (`secondary-button`, ikon `ClipboardCheck`).
- [x] Ponsel: CTA pindah ke baris kedua; tidak ada overflow horizontal.

### 2. Konten dashboard (semua dari `validationStatus: Diterima` saja)

- [x] Banner scope: ikon gedung + `Pesantren aktif: [Semua terdaftar | nama]` + `Periode hasil` +
 `DATA_MODEL` versi instrumen + chip `Data ilustrasi`.
- [x] 4 kartu `stats-grid`: Indeks K3L (nilai + delta + `ShieldCheck`), Risiko tinggi (`stat-red`,
 `AlertTriangle`, "Perlu tindakan segera"), Tindak lanjut (`stat-amber`, `Activity`, rata-rata + count),
 Terverifikasi (`stat-blue`, `CheckCircle2`, "Oleh pengelola pondok").
- [x] Panel `Perkembangan indeks` + `trend-up` + grafik area (`#be123c`, grid `#e2e8f0`, min 225px,
 render setelah terlihat) + panel `Hasil per dimensi`.
- [x] Panel `Temuan yang perlu ditindaklanjuti` + link `Buka peta bahaya →` + kartu temuan
 (chip severity + zona + lokasi + isu + `Kelola tindak lanjut →`); nama validator tampil, nama pelapor tidak (D-02).
- [x] Tidak ada panel count antrean di dashboard publik (D-02: count tidak publik).
- [x] Filter pesantren mengubah SELURUH angka/grafik/temuan (satu sumber selector, bukan state ganda).

### 3. Empty states

- [x] Nol pesantren: `Belum ada pesantren terdaftar. Pendaftaran dilakukan oleh Super Admin.` +
 grafik disembunyikan + CTA lapor nonaktif dengan penjelasan.
- [x] Pesantren tanpa data `Diterima`: `Belum ada hasil tervalidasi untuk [nama].` (bukan angka nol menyesatkan).

## Di luar ruang lingkup

- Form lapor/penilaian (Stage 03/08), validasi (Stage 05), halaman baca lain (Stage 04).

## Acceptance criteria

- [x] Agregat = gabungan `Diterima` lintas terdaftar; filter mempersempit ke satu kode; konsisten dengan halaman baca nanti.
- [x] Laporan `Menunggu validasi`/`Ditolak` tidak memengaruhi angka/grafik/temuan dalam kondisi apa pun.
- [x] Copy persis `WIREFRAMES.md` §1; status persis `DESIGN_SYSTEM.md` §2.
- [x] Visual 1440/834/390 tanpa overflow; keyboard mencapai pemilih → CTA → konten.
- [x] TEST_PLAN §1 baris 1–2 + §4; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

```
Tanggal: 8 September 2026
Route (12/#): #1–2 lulus — `/` tanpa login memuat dashboard + pemilih; isi `/` SAMA saat login
 tiap peran + tombol Ruang kerja; laporan `Menunggu validasi`/`Ditolak` (RPT-0001/0002/0006)
 tidak muncul di konten mana pun; `/pesantren/PSN-0018` filter terkunci; `/pesantren/PSN-9999`
 empty state tanpa crash. Baris 3–12: BELUM DIUJI — menunggu Stage 03/04/05/08/09.
Guard/sesi: lulus (sesi menunjuk ID akun, perbaikan shell publik; guard penuh tercakup Stage 01).
Skenario E2E (1-8): BELUM DIUJI — menunggu Stage 03/05 (form lapor + antrean validasi).
Visual 1440/834/390: lulus — delta overflow 0px di ketiganya; 4 kartu statistik; grafik 240px
 (>= 225) render setelah terlihat; CTA pindah ke baris kedua di ponsel.
Aksesibilitas keyboard: lulus — urutan Tab: Masuk → pemilih pesantren → CTA lapor →
 penilaian mandiri → panel; ring fokus `#e11d48`; status selalu label + ikon.
Lint/typecheck/test/build: lulus — oxlint 0 temuan; tsc --noEmit bersih; bun test 23 lulus
 (termasuk 14 test processor agregat); `bun run build` SPA sukses.
Catatan/regresi: skor indeks/tren/dimensi memakai ATURAN ILUSTRASI D-04 (usulan tercatat di
 `DECISIONS.md`; bukan rumus final) — saat D-04 dijawab final, processor + label wajib
 ditinjau ulang (U-09). Seed diperkaya: RPT-0007 penilaian mandiri `Diterima` PSN-0019 +
 temuan/rekomendasi turunannya + riwayat indeks ilustratif 6 periode (`indexHistory`).
 Perbaikan kecil lintas stage: chip `Data publik · ilustrasi` kini berikon `Info`,
 tombol Keluar dipindah ke shell workspace, kelas salah `text-secondary` →
 `text-secondary-text` pada `EmptyState`.
```

## Review ulang 8 September 2026

- [x] Perbaiki keterbacaan dashboard, filter invalid, CTA mengikuti konteks dan grafik sempit.

Perbaikan dashboard selesai: teks dan target sentuh diperbesar, grid aman sampai 320px,
SVG grafik responsif, label pemilih tidak terjepit, URL invalid menghasilkan empty state,
dan CTA membawa konteks pesantren ke alur berikutnya. Riwayat agregat kini hanya memasukkan
lembaga yang mempunyai snapshot penilaian mandiri `Diterima`. Uji browser lima viewport,
Back/Forward, filter dan konsistensi isi publik untuk semua sesi lulus; 45 test, lint,
typecheck, dan build lulus.
