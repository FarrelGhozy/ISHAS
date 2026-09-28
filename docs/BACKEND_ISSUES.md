# Backend ISHAS — Daftar Issue GitHub

Status: **Fase 0 (#3), Fase 1 (#4), Fase 2 (#5), Fase 3 (#6) selesai; adapter
#10 mencakup publik + Pesantren + Validator (non-SAM)** — lihat D-30.b/D-30.c/
D-30.d. Issue lain (`#7`–`#9`) masih terbuka.
Status awal: **sudah dibuat & disinkronkan** (8 issue, `#3`–`#10`), milestone
**Backend MVP**, label `backend` + `fase-0`…`fase-6`/`adapter`, relasi native
`blocked-by`. Skrip bersifat **idempoten**: issue dicocokkan lewat judul persis,
yang sudah ada di-update (body + label), bukan digandakan.

```bash
# Sekali saja bila GITHUB_TOKEN environment invalid (menutupi akun keyring):
env -u GITHUB_TOKEN bash scripts/create-backend-issues.sh
# Normal:
bash scripts/create-backend-issues.sh
```

Bila `gh` mengeluh `HTTP 401: Bad credentials`, jalankan `gh auth status`; akun
keyring yang valid mungkin tertutup `GITHUB_TOKEN` environment → pakai
`env -u GITHUB_TOKEN gh ...` (atau `gh auth switch`).

Rujukan perilaku tiap issue: `BACKEND_API_CONTRACT.md`, `BACKEND_DATA_MODEL.md`,
`BACKEND_STORAGE.md`, `BACKEND_MIGRATION.md`. `Depends on` di dalam body
ditegakkan juga sebagai relasi `blocked-by` GitHub.

| # | Judul | Fase | Label | Depends on | Rujukan utama |
|---|---|---|---|---|---|
| [#3](https://github.com/FarrelGhozy/ISHAS/issues/3) | `[backend] Fase 0 — Fondasi Bun+TS+MySQL + DDL v15 + seed demo/kosong` | 0 | `fase-0` | — | DATA_MODEL §1–§11 |
| [#4](https://github.com/FarrelGhozy/ISHAS/issues/4) | `[backend] Fase 1 — Baca publik + lapor + penilaian-mandiri (D-27, D-29)` | 1 | `fase-1` | #3 | API §2–§3, §8 |
| [#5](https://github.com/FarrelGhozy/ISHAS/issues/5) | `[backend] Fase 2 — Validasi + lifecycle + lokasi/denah + tindak lanjut` | 2 | `fase-2` | #3 | API §4–§7 |
| [#6](https://github.com/FarrelGhozy/ISHAS/issues/6) | `[backend] Fase 3 — Bank live + dokumen PDF + dataset/impor (D-25)` | 3 | `fase-3` | #3 | API §9–§10, §12–§13 |
| [#7](https://github.com/FarrelGhozy/ISHAS/issues/7) | `[backend] Fase 4 — SAM-iSAFE + bank + fase 2` | 4 | `fase-4` | #6 | API §11 |
| [#8](https://github.com/FarrelGhozy/ISHAS/issues/8) | `[backend] Fase 5 — Admin + audit + notifikasi + storage lokal` | 5 | `fase-5` | #3, #5 | API §12, STORAGE |
| [#9](https://github.com/FarrelGhozy/ISHAS/issues/9) | `[backend] Fase 6 — Auth server (terakhir): hash + sesi + RBAC` | 6 | `fase-6` | #5, #6, #8 | MIGRATION §2, DATA_MODEL §1, API §16 |
| [#10](https://github.com/FarrelGhozy/ISHAS/issues/10) | `[backend] Swap adapter frontend bertahap (flag VITE_USE_BACKEND)` | 0–5 | `adapter` | #3 | MIGRATION §1–§5 |

Kriteria hijau tiap issue (ada sebagai checklist di body): endpoint hidup +
validasi 1:1 mock (pesan sama) + test + adapter beralih + seed demo tampil sama +
review pemilik. Auth dummy (`X-Demo-Account`) hanya `development`; production
menolak tanpa cookie.
