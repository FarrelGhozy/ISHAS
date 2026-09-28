# Backend ISHAS — Model Data (MySQL 8)

Sumber: `apps/web/mocks/types.ts` + `docs/DATA_MODEL.md`. Schema mock aktif: **v15**.
ID stabil dipertahankan 1:1 agar frontend tidak berubah.

## 0. Konvensi

- Charset `utf8mb4`, collation `utf8mb4_unicode_ci`; waktu `DATETIME(3)` UTC.
- Enum status memakai `VARCHAR` + `CHECK` (mudah tambah nilai tanpa `ALTER ENUM`).
- Relasi nested kecil (`Floor` dalam `Building`, jawaban dalam snapshot) boleh
  `JSON` selama tidak di-filter SQL; yang di-filter/join dibuat tabel sendiri.
- `created_at/updated_at` di semua tabel domain; `updated_at` auto-update.
- Uang tidak ada; skor disimpan `TINYINT/INT`, persen `DECIMAL(5,2)`.

## 1. Identitas: `institutions`, `users`, `sessions` (sesi di fase 6)

```sql
CREATE TABLE institutions (
  code VARCHAR(16) PRIMARY KEY,          -- PSN-XXXX
  name VARCHAR(120) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  manager VARCHAR(100) NOT NULL,         -- teks tampilan; relasi resmi via users
  status VARCHAR(16) NOT NULL DEFAULT 'Persiapan', -- Persiapan|Aktif|Nonaktif
  active_campus_plan_id VARCHAR(32) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_institutions_status (status)
) ENGINE=InnoDB;

CREATE TABLE users (
  id VARCHAR(16) PRIMARY KEY,            -- USR-xxx
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  role VARCHAR(16) NOT NULL,             -- admin|validator|pesantren
  institution_code VARCHAR(16) NULL,     -- tepat 1 bila pesantren, NULL bila admin/validator
  status VARCHAR(16) NOT NULL DEFAULT 'Menunggu', -- Aktif|Menunggu|Nonaktif
  password_hash CHAR(60) NULL,           -- BARU fase 6 (bcrypt); frontend kini tanpa sandi
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_users_institution FOREIGN KEY (institution_code) REFERENCES institutions(code),
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB;

-- Fase 6 (menggantikan sessionStorage ishas-session-v2):
CREATE TABLE sessions (
  id BINARY(16) PRIMARY KEY,             -- token acak, disimpan sebagai cookie HttpOnly
  user_id VARCHAR(16) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,   -- SHA-256 token
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB;
```

Aturan `Pesantren terdaftar` (tetap dihitung di query, bukan kolom):
`institutions.status='Aktif'` DAN ada `users` dengan
`role='pesantren' AND status='Aktif' AND institution_code=code`.

## 2. Bank instrumen live (`INS-LIVE`, D-24)

```sql
CREATE TABLE instrument_meta (
  id VARCHAR(16) PRIMARY KEY,            -- 'INS-LIVE' satu baris
  label VARCHAR(120) NOT NULL,
  checksum VARCHAR(64) NOT NULL,         -- hitungChecksumInstrument; berubah tiap edit bank
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE bank_dimensions (
  id VARCHAR(16) PRIMARY KEY,            -- DIM-NN
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NULL,          -- KAT-* (KAT-...), lihat §8
  sort_order INT NOT NULL DEFAULT 0,
  INDEX idx_bankdim_cat (category_id)
) ENGINE=InnoDB;

CREATE TABLE bank_indicators (
  id VARCHAR(24) PRIMARY KEY,            -- IND-K3L-xxx stabil
  dimension_id VARCHAR(16) NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL,
  answer_type VARCHAR(24) NOT NULL,      -- ya-tidak|kualitas-1-5|frekuensi|keparahan
  is_required BOOL NOT NULL DEFAULT TRUE,
  evidence_required BOOL NOT NULL DEFAULT FALSE,
  location_required BOOL NOT NULL DEFAULT FALSE,
  weight DECIMAL(4,2) NOT NULL DEFAULT 1.00, -- pengali 0-10
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_bankind_dim FOREIGN KEY (dimension_id) REFERENCES bank_dimensions(id),
  INDEX idx_bankind_dim (dimension_id)
) ENGINE=InnoDB;

CREATE TABLE bank_options (
  indicator_id VARCHAR(24) NOT NULL,
  value VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  weight TINYINT UNSIGNED NOT NULL,      -- 0-100
  is_finding BOOL NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (indicator_id, value),
  CONSTRAINT fk_bankopt_ind FOREIGN KEY (indicator_id) REFERENCES bank_indicators(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

`instrument_versions` legacy (`INS-v1.x`, status Draft/Published/Archived)
dipertahankan sebagai **tabel baca** untuk snapshot lama; endpoint tulis baru
dilarang (kontrak: hanya bank).

## 3. Laporan + snapshot + draft

```sql
CREATE TABLE reports (
  id VARCHAR(16) PRIMARY KEY,            -- RPT-XXXX berurutan
  channel VARCHAR(24) NOT NULL,          -- lapor-cepat|penilaian-mandiri
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_contact VARCHAR(100) NULL,
  reporter_severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_recommendation VARCHAR(500) NULL,  -- D-29, usulan internal
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  evidence_asset_id VARCHAR(64) NULL,    -- lapor-cepat (privat)
  evidence_name VARCHAR(200) NULL,
  location_snapshot JSON NULL,           -- LocationSnapshot beku
  validation_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  handling_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  rejection_reason TEXT NULL,
  validation_note TEXT NULL,
  validated_by VARCHAR(16) NULL,
  validated_at DATETIME(3) NULL,
  instrument_checksum VARCHAR(64) NULL,
  score_percent DECIMAL(5,2) NULL,
  pdf_generated_at DATETIME(3) NULL,
  correction_of VARCHAR(16) NULL,
  archived_at DATETIME(3) NULL,
  archived_reason VARCHAR(255) NULL,
  client_request_id VARCHAR(64) NULL UNIQUE, -- idempotensi kirim
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_reports_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  INDEX idx_reports_inst_val (institution_code, validation_status, submitted_at DESC),
  INDEX idx_reports_public (validation_status, handling_status, archived_at)
) ENGINE=InnoDB;

CREATE TABLE self_assessment_snapshots (
  report_id VARCHAR(16) PRIMARY KEY,     -- 1:1 dengan reports
  instrument_version_id VARCHAR(16) NOT NULL, -- 'INS-LIVE' untuk baru
  instrument_checksum VARCHAR(64) NOT NULL,
  answers JSON NOT NULL,                 -- Record<indicatorId, IndicatorAnswer> beku
  frozen_indicators JSON NOT NULL,       -- FrozenIndicator[] beku
  score_percent DECIMAL(5,2) NULL,
  by_dimension JSON NULL,
  CONSTRAINT fk_snap_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE self_assessment_drafts (
  id VARCHAR(24) PRIMARY KEY,            -- SELF-xxxx (+ kunci browser SELF-<kode> dipetakan ke sini)
  institution_code VARCHAR(16) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL DEFAULT '',
  payload JSON NOT NULL,                 -- answers + activeIndex
  instrument_checksum VARCHAR(64) NOT NULL, -- beda = basi, wajib ulang (D-24)
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_selfdraft_inst (institution_code, updated_at DESC)
) ENGINE=InnoDB;
```

Draft lapor-cepat (`ishas-draft-v2:lapor:<kode>`) boleh tetap di browser
(preferensi perangkat) ATAU dipindah ke `lapor_drafts` bila ingin lintas perangkat
(lihat `BACKEND_MIGRATION.md`).

## 4. Temuan + rekomendasi/tindak lanjut

```sql
CREATE TABLE findings (
  id VARCHAR(32) PRIMARY KEY,            -- RSK-<reportId>-<n>
  report_id VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  building_id VARCHAR(16) NULL,
  recommendation_id VARCHAR(32) NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  source_answer_id VARCHAR(24) NULL,     -- indicatorId sumber
  level VARCHAR(16) NOT NULL DEFAULT 'Sedang', -- Rendah|Sedang|Tinggi|Ekstrem
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  issue TEXT NOT NULL,
  location_snapshot JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_find_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  INDEX idx_find_report (report_id)
) ENGINE=InnoDB;

CREATE TABLE recommendations (
  id VARCHAR(32) PRIMARY KEY,            -- REC-<reportId>-<n>
  report_id VARCHAR(16) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'Sedang', -- Tinggi|Sedang|Rendah
  title VARCHAR(200) NOT NULL,
  action VARCHAR(500) NOT NULL,          -- final publik; D-29 wajib saat Terima lapor-cepat
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  owner VARCHAR(100) NULL,               -- PIC
  due_date DATE NULL,
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0, -- snap kelipatan 25 (D-20)
  last_note TEXT NULL,
  completion_evidence VARCHAR(200) NULL,
  completion_evidence_asset_id VARCHAR(64) NULL,
  canceled_reason TEXT NULL,
  canceled_by VARCHAR(16) NULL,
  canceled_at DATETIME(3) NULL,
  verified_by VARCHAR(16) NULL,
  verified_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_rec_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  INDEX idx_rec_report (report_id, status)
) ENGINE=InnoDB;
```

## 5. Lokasi + denah

```sql
CREATE TABLE buildings (
  id VARCHAR(16) PRIMARY KEY,            -- BLD-xxx
  institution_code VARCHAR(16) NOT NULL,
  code VARCHAR(40) NOT NULL,             -- unik per lembaga
  name VARCHAR(120) NOT NULL,
  floors JSON NOT NULL DEFAULT ('[]'),   -- [{id,name,planFile legacy}] cukup JSON
  UNIQUE KEY uq_building_code (institution_code, code),
  INDEX idx_build_inst (institution_code)
) ENGINE=InnoDB;

CREATE TABLE areas (
  id VARCHAR(16) PRIMARY KEY,            -- AREA-xxx
  institution_code VARCHAR(16) NOT NULL,
  building_id VARCHAR(16) NOT NULL,
  floor VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  zone VARCHAR(80) NOT NULL,
  x DECIMAL(5,2) NOT NULL DEFAULT 50.00, -- default turunan lama
  y DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  INDEX idx_area_inst (institution_code)
) ENGINE=InnoDB;

CREATE TABLE campus_plans (
  id VARCHAR(40) PRIMARY KEY,            -- CAMPUS-<kode>-v<revision>
  institution_code VARCHAR(16) NOT NULL,
  revision INT NOT NULL,
  asset_id VARCHAR(64) NOT NULL UNIQUE,  -- campus-asset-<uuid> → file_assets
  width INT NOT NULL,
  height INT NOT NULL,
  uploaded_by VARCHAR(16) NOT NULL,
  uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  illustration BOOL NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_campus_rev (institution_code, revision),
  INDEX idx_campus_inst (institution_code, revision DESC)
) ENGINE=InnoDB;
```

Titik laporan (`planPoint` + `campusPlanVersionId`) tetap tersimpan di
`location_snapshot` JSON laporan/jawaban — tidak dipindah otomatis saat denah
baru terbit (D-14.a).

## 6. Dokumen indikator (D-16)

```sql
CREATE TABLE instrument_docs (
  id VARCHAR(32) PRIMARY KEY,            -- DOC-<indicatorId> stabil
  indicator_id VARCHAR(24) NOT NULL UNIQUE, -- IND-K3L-* atau IND-DOC-* (manual)
  indicator_code VARCHAR(40) NULL,
  indicator_title VARCHAR(200) NULL,
  is_manual BOOL NOT NULL DEFAULT FALSE,
  file_name VARCHAR(200) NOT NULL,       -- .pdf
  file_size INT UNSIGNED NOT NULL,       -- ≤10MB
  mime VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
  asset_id VARCHAR(64) NOT NULL UNIQUE,  -- instrument-doc-<uuid>
  visibility VARCHAR(16) NOT NULL DEFAULT 'Privat', -- Public|Privat
  updated_by VARCHAR(16) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_doc_vis (visibility)
) ENGINE=InnoDB;
```

## 7. SAM-iSAFE (D-26, D-26.e, D-26.f)

```sql
CREATE TABLE sam_categories (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-KAT-xx
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(280) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE sam_questions (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-Q-xxx
  category_id VARCHAR(16) NOT NULL,
  text TEXT NOT NULL,
  panduan VARCHAR(500) NOT NULL DEFAULT '',
  contoh_bukti VARCHAR(280) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_samq_cat FOREIGN KEY (category_id) REFERENCES sam_categories(id),
  INDEX idx_samq_cat (category_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE sam_assessments (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-xxxx
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  observer_account_id VARCHAR(16) NULL,
  observer_name VARCHAR(100) NOT NULL,
  observed_at DATE NOT NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'Rutin',
  status VARCHAR(24) NOT NULL DEFAULT 'Berlangsung', -- Berlangsung|Selesai
  answers JSON NOT NULL DEFAULT ('{}'),  -- {questionId:{score 0|1|2,note?,evidence...}}
  total_score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,      -- dinamis: aktif × 2
  percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  risk_level VARCHAR(24) NOT NULL DEFAULT 'Risiko Tinggi', -- ambang 80/60 prototipe
  reviewed_by VARCHAR(16) NULL,
  reviewed_at DATETIME(3) NULL,
  review_note TEXT NULL,
  completed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_sam_inst (institution_code, status, observed_at DESC)
) ENGINE=InnoDB;

CREATE TABLE sam_follow_ups (
  id VARCHAR(16) PRIMARY KEY,            -- SMF-xxxx
  assessment_id VARCHAR(16) NOT NULL,
  question_id VARCHAR(16) NOT NULL,
  title TEXT NOT NULL,                   -- teks soal saat dibuat
  pic VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  note TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  done_at DATETIME(3) NULL,
  cancel_reason TEXT NULL,
  created_by VARCHAR(16) NULL,
  UNIQUE KEY uq_smf_active (assessment_id, question_id, status),
  INDEX idx_smf_ass (assessment_id)
) ENGINE=InnoDB;
```

Catatan: `UNIQUE(assessment,question,status)` tidak melarang duplikat historis
`Selesai`/`Dibatalkan`; batas "satu aktif" ditegakkan di aplikasi seperti mock.

## 8. Referensi kategori K3 (`kategori-k3.ts`)

Tabel kecil `k3_categories(id KAT-*, name)` + `k3_aspects(id, category_id, name)`,
di-seed dari `KATEGORI_K3.md` dan **tidak** diubah oleh bank SAM
(`SAM-KAT-*` terpisah — D-26.f).

## 9. Audit + notifikasi

```sql
CREATE TABLE audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- ganti AUD-DEMO berurutan
  legacy_id VARCHAR(24) NULL,           -- AUD-DEMO-xxx saat migrasi seed
  object_type VARCHAR(40) NOT NULL,
  object_id VARCHAR(40) NOT NULL,
  actor_account_id VARCHAR(16) NULL,
  actor_name VARCHAR(100) NOT NULL,
  actor_role VARCHAR(24) NOT NULL,
  institution_code VARCHAR(16) NULL,
  action VARCHAR(120) NOT NULL,
  note TEXT NULL,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_audit_obj (object_type, object_id, at DESC),
  INDEX idx_audit_actor (actor_account_id, at DESC)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_account_id VARCHAR(16) NOT NULL,
  institution_code VARCHAR(16) NULL,
  source_object_id VARCHAR(40) NULL,
  message VARCHAR(255) NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  is_read BOOL NOT NULL DEFAULT FALSE,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_notif_recipient (recipient_account_id, is_read, at DESC)
) ENGINE=InnoDB;
```

## 10. Seed: satu file, dua mode

Keputusan pemilik: **satu file seed**, bukan dipecah. `scripts/seed.ts` (Bun)
dengan flag:

```bash
bun scripts/seed.ts --mode=demo   # presentasi dosen: isi penuh seperti seed.ts kini
bun scripts/seed.ts --mode=empty  # production: struktur kosong tapi valid
```

- Mode `demo`: port 1:1 dari `apps/web/mocks/seed/seed.ts` (19 laporan,
  17 temuan/rekomendasi, bank live 10 indikator, 27 soal SAM, 4 SAM, 2 SAM
  follow-up, 18 audit, 4 notifikasi, denah ilustrasi, kasus batas PSN-0020/
  PSN-0021/PSN-0023). Kunci komposisi di `seed-composition.test.ts` tetap acuan.
- Mode `empty` (minimal valid): `institutions[]`, `users=[1 admin]`,
  `reports/findings/...=[]`, `drafts={}`, `indexHistory={}`,
  `instrument` valid (≥1 dimensi ≥1 indikator ≥1 opsi), `counters={report:1,
  institution:1}` (penomoran berikutnya; `>0` syarat validator lama),
  `samCategories/Questions` boleh kosong (maks dinamis = 0, UI terkunci).
- File biner seed (denah ilustrasi, PDF contoh) disertakan di `scripts/seed-assets/`
  dan diunggah lewat jalur `file_assets` yang sama seperti upload normal.
