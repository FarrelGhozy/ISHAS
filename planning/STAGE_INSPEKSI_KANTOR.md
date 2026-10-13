# Stage Inspeksi K3L Perkantoran Validator (D-49) — `IN PROGRESS`

Revisi atas arahan langsung pemilik (`ok kerjakan`, 13 Oktober 2026): modul
inspeksi perkantoran khusus Validator, satu entri navbar di bawah SAM-iSAFE,
bank kategori + pertanyaan dinamis (`KTR-*`), 20 soal awal persis formulir
UNIDA (5 bagian A–E), skor biner (`Ya=1/Tidak=0`, maks dinamis
`COUNT(aktif) × 1`, ambang prototipe 80/60), langsung lengkap (foto bukti,
tindak lanjut, tren, cetak, review, audit, draft lanjut reload). Tidak tampil
publik/Pesantren. Frontend-only dulu; backend menyusul. Status stage lain
tidak berubah sepihak.

## Cakupan

- Docs: DECISIONS D-49, ROUTES §2, ROLES §4, FLOWS §9, DATA_MODEL schema v18,
  WIREFRAMES §validator, TODO, stage ini.
- Kode: `mocks/office-inspection.ts` (bank + seed 20 soal + skor biner),
  `mocks/types.ts` + `IshasState` (schema v18), migrasi v17→v18,
  store actions Validator-only, draft pointer per Validator, repository
  facade (mock-only), 4 route + 1 nav, halaman riwayat/baru/detail/bank +
  komponen (checklist Ya/Tidak, dashboard, tren, tindak lanjut, review,
  audit, bank).
- Test: skor biner (19/20 soal), tambah kategori, guard peran, alur
  buat → isi → selesai → tindak lanjut → review, render guard.

## Checklist

- [x] Catat D-49 + stage IN PROGRESS sebelum mengubah kode.
- [ ] Sinkron docs + kode + migrasi + seed + test.
- [ ] Verifikasi teknis: lint + typecheck + test + build.
- [ ] Cek visual 3 viewport + keyboard + alur klik browser
      (riwayat → baru → detail → bank).
- [ ] Review pemilik; DONE hanya setelah disetujui.
