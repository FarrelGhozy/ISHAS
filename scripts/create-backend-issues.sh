#!/usr/bin/env bash
# Membuat / memperbarui 8 issue backend ISHAS secara idempoten.
# Syarat: gh terautentikasi. Bila GITHUB_TOKEN environment invalid, jalankan:
#   env -u GITHUB_TOKEN bash scripts/create-backend-issues.sh
# Jalankan dari root repo. Issue dicocokkan lewat judul persis; yang sudah ada
# di-update (body + label), bukan digandakan.
set -euo pipefail

REPO_MILESTONE="Backend MVP"

# --- Label fase (idempoten) -------------------------------------------------
declare -A LABELS=(
  ["backend"]="Pekerjaan backend|0E8A16"
  ["fase-0"]="Fase 0 — fondasi backend|1D76DB"
  ["fase-1"]="Fase 1 — baca publik + lapor|1D76DB"
  ["fase-2"]="Fase 2 — validasi + lifecycle + lokasi|1D76DB"
  ["fase-3"]="Fase 3 — bank + dokumen + dataset|1D76DB"
  ["fase-4"]="Fase 4 — SAM-iSAFE|1D76DB"
  ["fase-5"]="Fase 5 — admin + audit + storage|1D76DB"
  ["fase-6"]="Fase 6 — auth server|1D76DB"
  ["adapter"]="Swap adapter frontend|FBCA04"
)
for name in "${!LABELS[@]}"; do
  IFS='|' read -r desc color <<<"${LABELS[$name]}"
  gh label create "$name" --description "$desc" --color "$color" 2>/dev/null || true
done

# --- Milestone (idempoten) --------------------------------------------------
if ! gh api "repos/{owner}/{repo}/milestones?state=all" --jq '.[].title' 2>/dev/null | grep -Fxq "$REPO_MILESTONE"; then
  gh api -X POST "repos/{owner}/{repo}/milestones" -f title="$REPO_MILESTONE" \
    -f description="Seluruh fase backend D-30 (0-6) + swap adapter" >/dev/null 2>&1 || true
fi

# --- Peta judul → nomor issue yang sudah ada --------------------------------
declare -A ISSUE_NUM=()
while IFS=$'\t' read -r num title; do
  [[ -n "$num" ]] && ISSUE_NUM["$title"]="$num"
done < <(gh issue list --state all --limit 1000 --json number,title --jq '.[] | "\(.number)\t\(.title)"')

label_flags() {
  local mode="$1" labels="$2" flag=()
  IFS=',' read -ra parts <<<"$labels"
  for p in "${parts[@]}"; do flag+=("$mode" "$p"); done
  printf '%s\n' "${flag[@]}"
}

upsert() {
  local title="$1" labels="$2" body="$3"
  mapfile -t add_flags < <(label_flags "--add-label" "$labels")
  mapfile -t new_flags < <(label_flags "--label" "$labels")
  local num="${ISSUE_NUM[$title]:-}"
  if [[ -n "$num" ]]; then
    gh issue edit "$num" --body "$body" "${add_flags[@]}" --milestone "$REPO_MILESTONE" >/dev/null
    echo "update  #$num  $title"
  else
    gh issue create --title "$title" --body "$body" "${new_flags[@]}" --milestone "$REPO_MILESTONE" >/dev/null
    echo "create        $title"
  fi
}

# --- Bodies -----------------------------------------------------------------
B0="$(cat <<'EOF'
Siapkan proyek backend Bun+TypeScript + MySQL 8.0.13+ (utf8mb4) + migrasi schema v15.

**Depends on:** — (fondasi)

Lingkup (docs/BACKEND_DATA_MODEL.md §1–§11):
- DDL semua tabel: institutions, users (+password_hash nullable, sessions fase 6),
  instrument_meta, bank_dimensions/indicators/options, instrument_versions
  (+_dimensions/_indicators, baca), reports, self_assessment_snapshots/drafts,
  lapor_drafts, findings, recommendations, buildings, areas, campus_plans,
  instrument_docs, k3_categories/aspects, sam_categories/questions/assessments/
  follow_ups, audit_events, notifications, sequences, index_history, file_assets.
- Konvensi: `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  FK + ON DELETE sesuai tabel §0.a; checksum 1:1 `hitungChecksumInstrument`.
- ID stabil dipertahankan (RPT-/REC-/RSK-/SAM-/SMF-/DOC-/CAMPUS-/IND-K3L-/asset-*-<uuid>).
- scripts/seed.ts --mode=demo (port 1:1 mocks/seed/seed.ts) dan --mode=empty
  (satu admin, bank minimal valid, sequences report:1/institution:1).
- Health check `GET /health` + koneksi DB + README backend.

Kriteria hijau:
- [ ] migrate + seed demo/empty lolos, seed demo tampil sama seperti mock.
- [ ] checksum bank seed sama dengan `hitungChecksumInstrument` (vektor uji).
EOF
)"

B1="$(cat <<'EOF'
Endpoint baca publik + kirim tanpa login (docs/BACKEND_API_CONTRACT.md §2–§3, §8).

**Depends on:** #3 (Fase 0)

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

Kriteria hijau:
- [ ] pesan error Indonesia sama persis mock + test sah/tolak.
- [ ] flag frontend untuk route publik beralih (lihat #10).
EOF
)"

B2="$(cat <<'EOF'
Workspace Pesantren scope-sendiri (docs/BACKEND_API_CONTRACT.md §4–§7).

**Depends on:** #3 (Fase 0)

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

Kriteria hijau:
- [ ] guard scope per lembaga + audit tiap mutasi.
- [ ] workspace Pesantren beralih (lihat #10).
EOF
)"

B3="$(cat <<'EOF'
Workspace Validator minus SAM (docs/BACKEND_API_CONTRACT.md §9–§10, §12–§13).

**Depends on:** #3 (Fase 0)

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

Kriteria hijau:
- [ ] checksum cocok dengan hitungChecksumInstrument (satu vektor uji).
- [ ] ekspor tanpa bocor bidang privat (D-02).
EOF
)"

B4="$(cat <<'EOF'
Modul SAM-iSAFE Validator-only (docs/BACKEND_API_CONTRACT.md §11, D-26/D-26.e/D-26.f).

**Depends on:** #6 (Fase 3)

Lingkup:
- Bank: CRUD kategori/soal + pindah + urutan + aktif; tolak hapus kategori
  berisi soal / soal dipakai pengamatan; panduan ≤500 + contohBukti ≤280;
  penanda duplikat.
- Pengamatan: buat (pesantren Aktif, area/manual, observer ≥2), jawab
  (0|1|2, bukti opsional berpasangan), complete (semua aktif terjawab),
  review (hanya Selesai), hapus (non-Selesai).
- Tindak lanjut temuan skor 0/1 (unik aktif/soal, PIC + tenggat, batal ≥10).
- Skor dinamis maks=aktif×2, persen, ambang prototipe 80/60.

Kriteria hijau:
- [ ] riwayat jawaban lama utuh setelah bank berubah.
- [ ] halaman SAM beralih (lihat #10).
EOF
)"

B5="$(cat <<'EOF'
Admin + file lokal penuh (docs/BACKEND_API_CONTRACT.md §12, BACKEND_STORAGE.md).

**Depends on:** #3 (Fase 0), #5 (Fase 2)

Lingkup:
- Pesantren (tambah, Persiapan→Aktif), user (tambah Menunggu + aktivasi,
  peran tak diubah, proteksi admin terakhir + akun sendiri, reset sandi),
  audit global + filter pelaku, reset demo --mode=demo.
- Notifikasi ke pemilik scope + baca/tandai.
- file_assets + /srv/ishas-storage (7 subdir + tmp), validasi magic bytes +
  sharp, serving kanonik GET /api/files/:assetId sesuai visibility/scope,
  transaksi tmp→rename, job yatim malam.
- Migrasi satu kali IndexedDB → server (endpoint terkunci + flag).

Kriteria hijau:
- [ ] sisa IndexedDB terhapus + reset demo via endpoint.
- [ ] tidak ada path storage terekspos langsung.
EOF
)"

B6="$(cat <<'EOF'
Dikerjakan TERAKHIR setelah fase 0–5 matang (D-30). Sampai saat itu login
kartu dummy tetap dipakai.

**Depends on:** #5 (Fase 2), #6 (Fase 3), #8 (Fase 5)

Lingkup (docs/BACKEND_DATA_MODEL.md §1, BACKEND_API_CONTRACT.md §16):
- password_hash (bcrypt/argon2) + sessions (token acak, cookie HttpOnly
  Secure SameSite=Lax, expiry, rotasi) + middleware RBAC peran+scope per endpoint
  (matriks BACKEND_API_CONTRACT.md §1).
- Endpoint /auth/login, /auth/logout, /auth/me, /auth/password.
- Login form email+sandi menggantikan kartu; guard frontend tetap + klaim server.
- X-Demo-Account hanya development; production menolak tanpa cookie.
- Rate-limit login + audit login + CSRF (X-CSRF-Token).

Kriteria hijau:
- [ ] seluruh endpoint menolak peran/scope salah (403) + test auth.
- [ ] kartu demo mati di production.
EOF
)"

B7="$(cat <<'EOF'
Menukar mock → HTTP tanpa tulis ulang UI (docs/BACKEND_MIGRATION.md §1–§5).

**Depends on:** #3 (Fase 0); beralih bertahap mengikuti Fase 1–5.

Lingkup:
- shared/api/http-client.ts (fetch + cookie + X-Request-Id) +
  shared/api/http-repository.ts (nama method + return SAMA dengan
  mock-repository.ts) + flag VITE_USE_BACKEND (default false).
- Beralih per fase (publik → Pesantren → Validator → SAM → admin);
  fallback mock sampai fase hijau di staging.
- Draft mandiri pindah ke self_assessment_drafts (lintas perangkat);
  draft lapor boleh tetap browser atau ke lapor_drafts.

Kriteria hijau per fase:
- [ ] lint + typecheck + test + build + 3 viewport untuk UI tersentuh.
- [ ] seed demo tampil sama.
EOF
)"

T0="[backend] Fase 0 — Fondasi Bun+TS+MySQL + DDL v15 + seed demo/kosong"
T1="[backend] Fase 1 — Baca publik + lapor + penilaian-mandiri (D-27, D-29)"
T2="[backend] Fase 2 — Validasi + lifecycle + lokasi/denah + tindak lanjut"
T3="[backend] Fase 3 — Bank live + dokumen PDF + dataset/impor (D-25)"
T4="[backend] Fase 4 — SAM-iSAFE + bank + fase 2"
T5="[backend] Fase 5 — Admin + audit + notifikasi + storage lokal"
T6="[backend] Fase 6 — Auth server (terakhir): hash + sesi + RBAC"
T7="[backend] Swap adapter frontend bertahap (flag VITE_USE_BACKEND)"

upsert "$T0" "backend,fase-0" "$B0"
upsert "$T1" "backend,fase-1" "$B1"
upsert "$T2" "backend,fase-2" "$B2"
upsert "$T3" "backend,fase-3" "$B3"
upsert "$T4" "backend,fase-4" "$B4"
upsert "$T5" "backend,fase-5" "$B5"
upsert "$T6" "backend,fase-6" "$B6"
upsert "$T7" "backend,adapter" "$B7"

# --- Refresh peta nomor (issue baru ikut terdaftar) -------------------------
declare -A ISSUE_NUM=()
while IFS=$'\t' read -r num title; do
  [[ -n "$num" ]] && ISSUE_NUM["$title"]="$num"
done < <(gh issue list --state all --limit 1000 --json number,title --jq '.[] | "\(.number)\t\(.title)"')

# --- Relasi native "blocked by" (idempoten: gagal bila sudah ada) ------------
blocked_by() {
  local target_title="$1" dep_title="$2"
  local target="${ISSUE_NUM[$target_title]:-}" dep="${ISSUE_NUM[$dep_title]:-}"
  [[ -z "$target" || -z "$dep" ]] && return 0
  gh issue edit "$target" --add-blocked-by "$dep" >/dev/null 2>&1 || true
}
blocked_by "$T1" "$T0"
blocked_by "$T2" "$T0"
blocked_by "$T3" "$T0"
blocked_by "$T4" "$T3"
blocked_by "$T5" "$T0"
blocked_by "$T5" "$T2"
blocked_by "$T6" "$T2"
blocked_by "$T6" "$T3"
blocked_by "$T6" "$T5"
blocked_by "$T7" "$T0"

echo "Selesai: 8 issue backend disinkronkan (idempoten)."
