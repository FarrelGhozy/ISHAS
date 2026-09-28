# Stage SAM-iSAFE Validator (D-26) — `REVIEW`

Revisi atas arahan langsung pemilik (28 September 2026): modul penilaian
keselamatan khusus Validator, satu entri navbar, bank kategori + pertanyaan
dinamis, skor maksimum dinamis (`aktif x 2`), 27 soal awal persis panduan
dosen, ambang prototipe 80/60. Fase 1 tanpa foto/tindak lanjut/grafik/PDF;
tidak tampil publik/Pesantren. Status stage lain tidak berubah sepihak.

## Cakupan

- Docs: DECISIONS D-26, ROUTES §2, ROLES §4, TODO, stage ini.
- Kode: `mocks/sam-isafe.ts` (bank + seed 27 soal + skor dinamis),
  `mocks/types.ts` + `IshasState` (schema v12), migrasi v11→v12,
  store actions Validator-only, 4 route + 1 nav, halaman
  riwayat/baru/detail/bank + komponen kecil.
- Test: skor dinamis (26/27/28 soal), tambah kategori, guard peran.

## Checklist

- [x] Catat D-26 + stage IN PROGRESS sebelum mengubah kode.
- [x] Sinkron docs + kode + migrasi + seed + test.
- [x] Verifikasi teknis: lint + typecheck + 185 test + build lulus (28 Sep 2026).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser: belum dijalankan di lingkungan ini.
- [ ] Review pemilik; DONE hanya setelah disetujui.

## Revisi D-26.f — pematangan bank data — `REVIEW` (28 September 2026)

Arahan langsung pemilik (`ok kerjakan`); status stage di atas tidak berubah sepihak.

- [x] Catat D-26.f + revisi IN PROGRESS sebelum mengubah kode.
- [x] Kode (CRUD lengkap + panduan per soal + accordion mobile) + migrasi v13→v14 + seed + test.
- [x] Verifikasi teknis: lint + typecheck + 208 test + build lulus (28 Sep 2026; +10 test bank D-26.f).
- [ ] Cek visual 3 viewport + keyboard + alur klik browser bank: belum dijalankan di lingkungan ini.
- [ ] Review pemilik; DONE hanya setelah disetujui.
