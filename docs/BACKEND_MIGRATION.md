# Backend ISHAS — Rencana Migrasi (Mock → Server)

## 1. Strategi swap adapter (tanpa tulis ulang UI)

`mock-repository.ts` kini adalah facade tipis di atas `storeActions`.
Backend meniru pola ini di frontend:

1. Buat `apps/web/shared/api/http-client.ts` (fetch + cookie + `X-Request-Id`).
2. Buat `apps/web/shared/api/http-repository.ts` dengan **nama method dan
   bentuk return yang sama** dengan `mock-repository.ts`.
3. Satu flag env `VITE_USE_BACKEND` (default `false`): `false` = mock kini,
   `true` = HTTP. Halaman/komponen tidak berubah; hanya sumber repository.
4. IndexedDB/localStorage domain dihapus **bertahap per fase**, bukan sekaligus:
   baca tetap fallback mock sampai fase terkait hijau di staging.

## 2. Urutan fase (lihat `BACKEND_OVERVIEW.md` §5)

| Fase | Backend | Frontend |
|---|---|---|
| 0 | DDL §1–§9 + `scripts/seed.ts --mode=demo\|empty` + health check | Tetap mock |
| 1 | Baca publik + lapor + mandiri + upload bukti | Flag `true` untuk route publik dulu |
| 2 | Validasi + lifecycle + lokasi/denah + tindak lanjut | Workspace Pesantren beralih |
| 3 | Bank + snapshot + dokumen + dataset/impor | Workspace Validator (minus SAM) beralih |
| 4 | SAM-iSAFE penuh | Halaman SAM beralih |
| 5 | Admin + audit + notifikasi + storage §3–§5 | Hapus sisa IndexedDB; reset demo → endpoint |
| 6 | Auth: `password_hash` (bcrypt) + `sessions` + cookie HttpOnly + RBAC middleware + `/auth/demo-login` (dev) | Login tetap kartu (dev) → `/auth/demo-login`; `/auth/me` jadi klaim server; guard tetap |

## 3. Aturan porting per fase

- Satu aksi mock = satu endpoint (tabel di `BACKEND_API_CONTRACT.md`).
  Jangan menggabung dua aksi menjadi satu endpoint.
- Pesan error Indonesia dipertahankan persis agar test frontend tetap hijau.
- Processor murni (`dashboard-aggregate`, `campus-map`, `sam-isafe`,
  `instrument-bank`) di-port ke modul server 1:1; label `Data ilustrasi`
  tetap sampai rumus final (D-04).
- `pdfGeneratedAt` tetap penanda "siap cetak"; render PDF tetap browser
  sampai generator server diputuskan.
- Draft: lapor-cepat boleh tetap browser; draft mandiri (`SELF-*` +
  checksum) pindah ke `self_assessment_drafts` agar lintas perangkat.

## 4. Kriteria selesai per fase (definisi hijau)

- [ ] Endpoint hidup + validasi 1:1 mock (pesan error sama).
- [ ] Test backend per endpoint (kasus sah + tolak + scope salah).
- [ ] Adapter frontend beralih untuk scope fase; lint + typecheck + test
    frontend + build lulus; 3 viewport dicek untuk UI yang tersentuh.
- [ ] Seed demo tampil sama seperti mock; seed empty valid + bisa onboarding
    dari nol (tambah pesantren → akun → terdaftar).
- [ ] `TODO.md` + stage terkait dicatat; review pemilik sebelum fase berikut.

## 5. Risiko + mitigasi

| Risiko | Mitigasi |
|---|---|
| Checksum bank beda implementasi → draft/snapshot tak cocok | Satu vektor uji checksum dari `hitungChecksumInstrument` |
| ID berurutan (`RPT-`, `SAM-`) tabrakan saat konkuren | `counters` pindah ke tabel `sequences` + transaksi |
| Blob yatim saat upload gagal | Pola tmp → rename + job malam (`BACKEND_STORAGE.md` §5) |
| Auth dummy bocor ke production | Flag `X-Demo-Account` hanya aktif bila `NODE_ENV=development`; production menolak tanpa cookie |

### 5.a Vektor uji checksum (wajib sama mock ↔ server)

`hitungChecksumInstrument` (`apps/web/mocks/instrument-bank.ts:55`) menghitung
DJB2 dari `JSON.stringify` bentuk kanonik:

```jsonc
// untuk setiap dimensi: { id, indicators:[ { id, t (answerType), w (weight),
//   r/e/l (required/evidence/location → 0|1),
//   o: [ [value, weight, isFinding?1:0], ... ] } ] }
```

Keluaran `ck-<hex>` (32-bit unsigned, `hash >>> 0`). Backend **wajib** memakai
urutan kunci & normalisasi identik. Simpan minimal satu fixture (bank 10
indikator seed) dan bandingkan checksum mock vs server pada test; draft/snapshot
yang checksum-nya beda berarti "bank berubah".

### 5.b Urutan dependensi fase

Fase 0 memblokir semua fase. Fase 1–2 dapat paralel setelah 0; fase 3 bergantung
pada `instrument-bank` port; fase 4 pada 3 (bank SAM memakai pola checksum/snapshot);
fase 5 pada 2 (audit + notifikasi ditulis mulai fase 1 tetapi storage penuh di 5);
fase 6 terakhir setelah seluruh mutasi menegakkan RBAC. Bila skema berubah setelah
endpoint hidup, tambahkan migrasi DDL bernomor (bukan menyunting migrasi lama).
