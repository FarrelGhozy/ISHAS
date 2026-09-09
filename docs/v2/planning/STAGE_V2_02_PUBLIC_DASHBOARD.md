# Stage V2-02 — Shell Publik + Dashboard Agregat

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-02 dan D-04
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01 `DONE` (butuh selector + seed + `/` publik dasar).
**Tujuan:** dashboard `/` final secara visual dan fungsional: shell publik ringan,
pemilih pesantren, agregat multi-lembaga, grafik, temuan prioritas, panel antrean netral.

## Ruang lingkup

### 1. Shell publik ringan

- [ ] Header: logo + `ISHAS` + `Penilaian K3L Pesantren` | kanan: chip `Data publik · ilustrasi`
  (`status-blue`, ikon `Info`) + tombol **Masuk** (`secondary-button`; bila login: tombol **Ruang kerja** + nama akun).
- [ ] Bar konteks: pemilih pesantren (opsi pertama `Semua pesantren terdaftar`, sisanya `kode — nama`
  HANYA terdaftar) + info periode + **Laporkan temuan** (`primary-button`, ikon `Plus`) +
  **Penilaian mandiri** (`secondary-button`, ikon `ClipboardCheck`).
- [ ] Ponsel: CTA pindah ke baris kedua; tidak ada overflow horizontal.

### 2. Konten dashboard (semua dari `validationStatus: Diterima` saja)

- [ ] Banner scope: ikon gedung + `Pesantren aktif: [Semua terdaftar | nama]` + `Periode hasil` +
  `DATA_MODEL` versi instrumen + chip `Data ilustrasi`.
- [ ] 4 kartu `stats-grid`: Indeks K3L (nilai + delta + `ShieldCheck`), Risiko tinggi (`stat-red`,
  `AlertTriangle`, "Perlu tindakan segera"), Tindak lanjut (`stat-amber`, `Activity`, rata-rata + count),
  Terverifikasi (`stat-blue`, `CheckCircle2`, "Oleh pengelola pondok").
- [ ] Panel `Perkembangan indeks` + `trend-up` + grafik area (`#be123c`, grid `#e2e8f0`, min 225px,
  render setelah terlihat) + panel `Hasil per dimensi`.
- [ ] Panel `Temuan yang perlu ditindaklanjuti` + link `Buka peta bahaya →` + kartu temuan
  (chip severity + zona + lokasi + isu + `Kelola tindak lanjut →`).
- [ ] Panel moderasi netral: `N laporan menunggu validasi pengelola pondok — belum tampil di dashboard.`
  (tanpa nama/isi; count dari antrean lintas terdaftar).
- [ ] Filter pesantren mengubah SELURUH angka/grafik/temuan (satu sumber selector, bukan state ganda).

### 3. Empty states

- [ ] Nol pesantren: `Belum ada pesantren terdaftar. Pendaftaran dilakukan oleh Super Admin.` +
  grafik disembunyikan + CTA lapor nonaktif dengan penjelasan.
- [ ] Pesantren tanpa data `Diterima`: `Belum ada hasil tervalidasi untuk [nama].` (bukan angka nol menyesatkan).

## Di luar ruang lingkup

- Form lapor/penilaian (V2-03/08), validasi (V2-05), halaman baca lain (V2-04).

## Acceptance criteria

- [ ] Agregat = gabungan `Diterima` lintas terdaftar; filter mempersempit ke satu kode; konsisten dengan halaman baca nanti.
- [ ] Laporan `Menunggu validasi`/`Ditolak` tidak memengaruhi angka/grafik/temuan dalam kondisi apa pun.
- [ ] Copy persis `WIREFRAMES.md` §1; status persis `DESIGN_SYSTEM.md` §2.
- [ ] Visual 1440/834/390 tanpa overflow; keyboard mencapai pemilih → CTA → konten.
- [ ] TEST_PLAN §1 baris 1–2 + §4; lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
