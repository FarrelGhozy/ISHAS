# Backend ISHAS — Daftar Issue GitHub

Jalankan setelah `gh auth login` (token kini invalid):

```bash
bash scripts/create-backend-issues.sh
```

Skrip membuat 8 issue di bawah (idempoten manual: cek duplikat dulu bila
dijalankan ulang). Rujukan perilaku tiap issue: `BACKEND_API_CONTRACT.md`,
`BACKEND_DATA_MODEL.md`, `BACKEND_STORAGE.md`, `BACKEND_MIGRATION.md`.

| # | Judul | Fase | Rujukan utama |
|---|---|---|---|
| 1 | `[backend] Fase 0 — Fondasi Bun+TS+MySQL + DDL v15 + seed demo/kosong` | 0 | DATA_MODEL §1–§10 |
| 2 | `[backend] Fase 1 — Baca publik + lapor + penilaian-mandiri (D-27, D-29)` | 1 | API §2–§3, §8 |
| 3 | `[backend] Fase 2 — Validasi + lifecycle + lokasi/denah + tindak lanjut` | 2 | API §4–§7 |
| 4 | `[backend] Fase 3 — Bank live + dokumen PDF + dataset/impor (D-25)` | 3 | API §9–§10, §12–§13 |
| 5 | `[backend] Fase 4 — SAM-iSAFE + bank + fase 2` | 4 | API §11 |
| 6 | `[backend] Fase 5 — Admin + audit + notifikasi + storage lokal` | 5 | API §12, STORAGE |
| 7 | `[backend] Fase 6 — Auth server (terakhir): hash + sesi + RBAC` | 6 | MIGRATION §2, DATA_MODEL §1 |
| 8 | `[backend] Swap adapter frontend bertahap (flag VITE_USE_BACKEND)` | 0–5 | MIGRATION §1–§4 |

Kriteria hijau tiap issue: endpoint hidup + validasi 1:1 mock (pesan sama) +
test + adapter beralih + seed demo tampil sama + review pemilik.
Auth dummy (`X-Demo-Account`) hanya `development`; production menolak tanpa cookie.
