#!/usr/bin/env bash
# Membuat 8 issue backend ISHAS. Syarat: gh auth login terlebih dahulu.
# Jalankan dari root repo: bash scripts/create-backend-issues.sh
set -euo pipefail

gh label create backend --color 0E8A16 --description "Pekerjaan backend" 2>/dev/null || true

gh issue create --label backend \
  --title "[backend] Fase 0 — Fondasi Bun+TS+MySQL + DDL v15 + seed demo/kosong" \
  --body-file - <<'EOF'
Siapkan proyek backend Bun+TypeScript + MySQL 8 (utf8mb4) + migrasi schema v15.

Lingkup (docs/BACKEND_DATA_MODEL.md §1–§10):
- DDL semua tabel: institutions, users (+password_hash nullable, sessions fase 6),
  instrument_meta, bank_dimensions/indicators/options, instrument_versions (baca),
  reports, self_assessment_snapshots/drafts, findings, recommendations,
  buildings, areas, campus_plans, instrument_docs, sam_categories/questions/
  assessments/follow_ups, audit_events, notifications, file_assets.
- ID stabil dipertahankan (RPT-/REC-/RSK-/SAM-/SMF-/DOC-/CAMPUS-/IND-K3L-/asset-*-<uuid>).
- scripts/seed.ts --mode=demo (port 1:1 mocks/seed/seed.ts) dan --mode=empty
  (satu admin, bank minimal valid, counters report:1/institution:1).
- Health check + koneksi DB + README backend.

Hijau: migrate + seed demo/empty lolos + seed demo tampil sama seperti mock.
EOF

gh issue create --label backend \
  --title "[backend] Fase 1 — Baca publik + lapor + penilaian-mandiri (D-27, D-29)" \
  --body-file - <<'EOF'
Endpoint baca publik + kirim tanpa login (docs/BACKEND_API_CONTRACT.md §2–§3, §8).

Lingkup:
- GET public: dashboard (agregat ilustrasi D-04), results, risk-map (D-14),
  recommendations, follow-ups, reports/:id/pdf-data (D-28, tanpa jawaban mentah),
  docs (strip privat), institutions (terdaftar saja).
- POST /reports/lapor-cepat + validasi 1:1 mock (nama 2–100, judul 10–140,
  deskripsi ≥20, area/manual ≥3, kategori/aspek konsisten, usulan 10–500/D-29,
  bukti cocok institution+nama) + idempotensi X-Request-Id.
- Penilaian-mandiri: GET bank (tanpa bobot/flag ke publik), draft + checksum
  (basi = kunci + wajib ulang), submit → snapshot beku + skor + pdfGeneratedAt.
- Upload bukti jawaban 1 foto/soal khusus evidenceRequired (D-27); foto tampil
  di pdf-data publik, akses langsung tetap privat.

Hijau: pesan error Indonesia sama persis mock + test sah/tolak + flag frontend
untuk route publik.
EOF

gh issue create --label backend \
  --title "[backend] Fase 2 — Validasi + lifecycle + lokasi/denah + tindak lanjut" \
  --body-file - <<'EOF'
Workspace Pesantren scope-sendiri (docs/BACKEND_API_CONTRACT.md §4–§7).

Lingkup:
- Antrean + detail internal + accept (severity/priority wajib, rekomendasiFinal
  10–500 untuk lapor-cepat/D-29, turunan idempoten) + reject (alasan ≥10).
- Lifecycle: Pending→Proses (PIC+tenggat+catatan), →Completed (temuan
  Terverifikasi + progres 100 + bukti), mundur (alasan ≥10), arsip (alasan ≥5).
- setFindingLevel eksplisit Rendah/Sedang/Tinggi/Ekstrem (bukan rumus).
- Lokasi: gedung/lantai/area; denah: upload (sisi ≥800px) + publish (ack +
  optimistic lock, titik lama tetap di versi asal/D-14.a).
- Tindak lanjut: progres snap 25 (D-20), 100 wajib bukti, verify, cancel
  (alasan ≥10, tampil publik + alasan/D-21, blokir Completed).

Hijau: guard scope per lembaga + audit tiap mutasi + workspace Pesantren beralih.
EOF

gh issue create --label backend \
  --title "[backend] Fase 3 — Bank live + dokumen PDF + dataset/impor (D-25)" \
  --body-file - <<'EOF'
Workspace Validator minus SAM (docs/BACKEND_API_CONTRACT.md §9–§10, §12–§13).

Lingkup:
- CRUD bank INS-LIVE (dimensi/indikator/opsi+bobot/pengali, validasi 1:1 mock);
  tiap ubah → checksum baru + audit; hapus tak merusak snapshot beku.
- Dokumen indikator: upload PDF (%PDF-, ≤10MB), upsert 1 berkas/indikator,
  entri manual D-16.g, visibility Public/Privat (default Privat), blob Privat
  hanya Validator.
- Scoring/audit publikasi: checklist 5 kriteria (lengkap + Diterima + skor +
  PDF + checksum cocok).
- Dataset: filter terdaftar + toggle non-terdaftar, ekspor CSV/JSON whitelist
  D-02, impor ≤200 baris → pratinjau → Menunggu validasi.

Hijau: checksum cocok dengan hitungChecksumInstrument (satu vektor uji) +
ekspor tanpa bocor privat.
EOF

gh issue create --label backend \
  --title "[backend] Fase 4 — SAM-iSAFE + bank + fase 2" \
  --body-file - <<'EOF'
Modul SAM-iSAFE Validator-only (docs/BACKEND_API_CONTRACT.md §11, D-26/D-26.e/D-26.f).

Lingkup:
- Bank: CRUD kategori/soal + pindah + urutan + aktif; tolak hapus kategori
  berisi soal / soal dipakai pengamatan; panduan ≤500 + contohBukti ≤280;
  penanda duplikat.
- Pengamatan: buat (pesantren Aktif, area/manual, observer ≥2), jawab
  (0|1|2, bukti opsional berpasangan), complete (semua aktif terjawab),
  review (hanya Selesai), hapus (non-Selesai).
- Tindak lanjut temuan skor 0/1 (unik aktif/soal, PIC + tenggat, batal ≥10).
- Skor dinamis maks=aktif×2, persen, ambang prototipe 80/60.

Hijau: riwayat jawaban lama utuh setelah bank berubah + halaman SAM beralih.
EOF

gh issue create --label backend \
  --title "[backend] Fase 5 — Admin + audit + notifikasi + storage lokal" \
  --body-file - <<'EOF'
Admin + file lokal penuh (docs/BACKEND_API_CONTRACT.md §12, BACKEND_STORAGE.md).

Lingkup:
- Pesantren (tambah, Persiapan→Aktif), user (tambah Menunggu + aktivasi,
  peran tak diubah, proteksi admin terakhir + akun sendiri, reset sandi),
  audit global + filter pelaku, reset demo --mode=demo.
- Notifikasi ke pemilik scope + baca/tandai.
- file_assets + /srv/ishas-storage (7 subdir + tmp), validasi magic bytes +
  sharp, serving GET /api/files/:assetId sesuai visibility/scope, transaksi
  tmp→rename, job yatim malam.
- Migrasi satu kali IndexedDB → server (endpoint terkunci + flag).

Hijau: sisa IndexedDB terhapus + reset demo via endpoint + tak ada path
storage terekspos langsung.
EOF

gh issue create --label backend \
  --title "[backend] Fase 6 — Auth server (terakhir): hash + sesi + RBAC" \
  --body-file - <<'EOF'
Dikerjakan TERAKHIR setelah fase 0–5 matang (D-30). Sampai saat itu login
kartu dummy tetap dipakai.

Lingkup (docs/BACKEND_DATA_MODEL.md §1, BACKEND_MIGRATION.md §2):
- password_hash (bcrypt/argon2) + sessions (token acak, cookie HttpOnly
  Secure SameSite=Lax, expiry) + middleware RBAC peran+scope per endpoint
  (matriks BACKEND_API_CONTRACT.md §1).
- Login form email+sandi menggantikan kartu; guard frontend tetap + klaim server.
- X-Demo-Account hanya development; production menolak tanpa cookie.
- Rate-limit login + audit login.

Hijau: seluruh endpoint menolak peran/scope salah (403) + test auth +
kartu demo mati di production.
EOF

gh issue create --label backend \
  --title "[backend] Swap adapter frontend bertahap (flag VITE_USE_BACKEND)" \
  --body-file - <<'EOF'
Menukar mock → HTTP tanpa tulis ulang UI (docs/BACKEND_MIGRATION.md §1–§4).

Lingkup:
- shared/api/http-client.ts (fetch + cookie + X-Request-Id) +
  shared/api/http-repository.ts (nama method + return SAMA dengan
  mock-repository.ts) + flag VITE_USE_BACKEND (default false).
- Beralih per fase (publik → Pesantren → Validator → SAM → admin);
  fallback mock sampai fase hijau di staging.
- Draft mandiri pindah ke self_assessment_drafts (lintas perangkat);
  draft lapor boleh tetap browser.

Hijau per fase: lint + typecheck + test + build + 3 viewport untuk UI
tersentuh + seed demo tampil sama.
EOF

echo "8 issue backend dibuat."
