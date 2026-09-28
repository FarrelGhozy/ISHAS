# Backend ISHAS — Model Data (MySQL 8)

Sumber: `apps/web/mocks/types.ts` + `docs/DATA_MODEL.md`. Schema mock aktif: **v15**
(`MOCK_SCHEMA_VERSION` di `apps/web/mocks/store/state.ts`). ID stabil dipertahankan
1:1 agar frontend tidak berubah.

## 0. Konvensi

- Mesin **InnoDB**; charset `utf8mb4`, collation `utf8mb4_unicode_ci`; waktu
  `DATETIME(3)` UTC. Setiap `CREATE TABLE` menutup dengan
  `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.
- Versi minimum **MySQL 8.0.13** karena default ekspresi JSON
  (`DEFAULT (JSON_ARRAY())` / `DEFAULT (JSON_OBJECT())`). MySQL 5.7/8.0.12
  tidak menerima default JSON → naikkan versi atau pindahkan default ke aplikasi.
- Enum status memakai `VARCHAR` + `CHECK` (mudah tambah nilai tanpa `ALTER ENUM`).
- Relasi nested kecil (`Floor` dalam `Building`, jawaban dalam snapshot) boleh
  `JSON` selama tidak di-filter SQL; yang di-filter/join dibuat tabel sendiri.
- `created_at/updated_at` DEFAULT/ON UPDATE ada di **semua tabel domain ber-ID**.
  Pengecualian yang disengaja (tidak punya salah satunya): `bank_options`,
  `instrument_version_indicators`, `sam_follow_ups` (hanya `created_at`),
  `audit_events`/`notifications` (memakai `at` sebagai waktu domain),
  `sequences` (metrik sederhana). Jangan menambah timestamp yang tidak dipakai UI.
- Uang tidak ada; skor disimpan `TINYINT/INT`, persen `DECIMAL(5,2)`,
  koordinat denah `DECIMAL(5,2)` (0–100).
- ID stabil: `PSN-`, `USR-`, `RPT-`, `REC-`, `RSK-`, `SAM-`, `SMF-`, `SELF-`,
  `DOC-`, `CAMPUS-`, `IND-K3L-`, `SAM-KAT-`, `SAM-Q-`, `BLD-`, `FLR-`, `AREA-`,
  `INS-v`, `AUD-DEMO-`, `NOT-`, aset `campus-/evidence-/instrument-doc-<uuid>`.
- Semua kolom `*_asset_id` merujuk `file_assets.asset_id` (DDL di
  `BACKEND_STORAGE.md` §1). Tentukan ON DELETE seperti tabel di bawah; blob tidak
  pernah masuk kolom DB.

### 0.a Aturan relasi & ON DELETE

| Kolom anak | Induk | ON DELETE |
|---|---|---|
| `*_code` (institution_code) | `institutions(code)` | RESTRICT |
| `users.institution_code` | `institutions(code)` | RESTRICT |
| `reports.area_id` | `areas(id)` | SET NULL |
| `reports.reporter_user_id`, `validated_by` | `users(id)` | SET NULL |
| `reports.correction_of` | `reports(id)` | SET NULL |
| `self_assessment_snapshots.report_id`, `findings.report_id`, `recommendations.report_id` | `reports(id)` | CASCADE |
| `findings.area_id`, `findings.building_id`, `sam_assessments.area_id` | `areas`/`buildings` | SET NULL |
| `areas.building_id` | `buildings(id)` | CASCADE |
| `bank_indicators.dimension_id` | `bank_dimensions(id)` | CASCADE |
| `bank_options.indicator_id` | `bank_indicators(id)` | CASCADE |
| `sam_questions.category_id` | `sam_categories(id)` | RESTRICT |
| `sam_follow_ups.assessment_id` | `sam_assessments(id)` | CASCADE |
| `sam_follow_ups.question_id` | `sam_questions(id)` | RESTRICT |
| `*_asset_id` | `file_assets(asset_id)` | RESTRICT |
| `notifications.recipient_account_id` | `users(id)` | CASCADE |
| `sessions.user_id` | `users(id)` | CASCADE |

Atau: hapus lembaga/user dengan data historis **tidak diizinkan** (RESTRICT);
arsip (`archived_at`) dipakai sebagai pengganti hapus.

## 1. Identitas: `institutions`, `users`, `sessions` (sesi fase 6)

```sql
CREATE TABLE institutions (
  code VARCHAR(16) PRIMARY KEY,          -- PSN-XXXX
  name VARCHAR(120) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,            -- Institution.location (kota/kabupaten, publik)
  address VARCHAR(255) NOT NULL,         -- alamat lengkap (internal, D-02)
  manager VARCHAR(100) NOT NULL,         -- teks tampilan; relasi resmi via users
  status VARCHAR(16) NOT NULL DEFAULT 'Persiapan', -- Persiapan|Aktif|Nonaktif
  active_campus_plan_id VARCHAR(40) NULL, -- CAMPUS-<kode>-v<revision>
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_institutions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id VARCHAR(16) PRIMARY KEY,            -- USR-xxx
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  role VARCHAR(16) NOT NULL,             -- admin|validator|pesantren
  institution_code VARCHAR(16) NULL,     -- tepat 1 bila pesantren, NULL bila admin/validator
  status VARCHAR(16) NOT NULL DEFAULT 'Menunggu', -- Aktif|Menunggu|Nonaktif
  password_hash CHAR(60) NULL,           -- BARU fase 6 (bcrypt); frontend kini tanpa sandi
  last_active_at DATETIME(3) NULL,       -- User.lastActive
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_users_institution FOREIGN KEY (institution_code) REFERENCES institutions(code),
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fase 6 (menggantikan sessionStorage ishas-session-v2):
CREATE TABLE sessions (
  id BINARY(16) PRIMARY KEY,             -- PK internal (mis. UUIDv7 byte)
  user_id VARCHAR(16) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,   -- SHA-256 dari token acak di cookie (id tidak rahasia)
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- `sessions.id` hanya identifier baris (boleh UUID); **token** yang dikirim ke
  browser disimpan sebagai `token_hash` (SHA-256) dan tidak pernah plaintext.
  Cookie fase 6: `ishas_session`, `HttpOnly`, `Secure`, `SameSite=Lax`.
- `User.initials` tidak disimpan (diturunkan dari `name`).
- `Institution.assessment` (warisan V1) **tidak disimpan**; status resmi =
  `institutions.status`.
- `User.institutionCodes` frontend berupa array, tetapi aturan peran menetapkan
  Pesantren tepat **satu** kode → dinormalisasi ke `users.institution_code`.
  Admin/Validator `NULL`.
- Aturan `Pesantren terdaftar` (tetap dihitung di query, bukan kolom):
  `institutions.status='Aktif'` DAN ada `users` dengan
  `role='pesantren' AND status='Aktif' AND institution_code=code`.

## 2. Bank instrumen live (`INS-LIVE`, D-24)

```sql
CREATE TABLE instrument_meta (
  id VARCHAR(16) PRIMARY KEY,            -- 'INS-LIVE' satu baris
  label VARCHAR(120) NOT NULL,
  checksum VARCHAR(64) NOT NULL,         -- hitungChecksumInstrument; berubah tiap edit bank
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bank_dimensions (
  id VARCHAR(16) PRIMARY KEY,            -- DIM-NN
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NULL,          -- KAT-*, lihat §8
  aspects JSON NULL,                     -- [{id,name}] pilihan aspek cascading (tidak difilter SQL)
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_bankdim_cat FOREIGN KEY (category_id) REFERENCES k3_categories(id),
  INDEX idx_bankdim_cat (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_bankind_dim FOREIGN KEY (dimension_id) REFERENCES bank_dimensions(id) ON DELETE CASCADE,
  CONSTRAINT fk_bankind_cat FOREIGN KEY (category_id) REFERENCES k3_categories(id),
  CONSTRAINT fk_bankind_asp FOREIGN KEY (aspect_id) REFERENCES k3_aspects(id),
  INDEX idx_bankind_dim (dimension_id),
  INDEX idx_bankind_cat (category_id, aspect_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bank_options (
  indicator_id VARCHAR(24) NOT NULL,
  value VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  weight TINYINT UNSIGNED NOT NULL,      -- 0-100
  is_finding BOOL NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (indicator_id, value),
  CONSTRAINT fk_bankopt_ind FOREIGN KEY (indicator_id) REFERENCES bank_indicators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- Tipe warisan (`likert-1-5`, `boolean-ya-tidak`, `likert-1-2-tidak`) hanya
  dibaca dari snapshot lama (`frozen_indicators`); indikator bank baru memakai 4
  tipe D-24. Ganti tipe = opsi kembali ke bawaan.
- Checksum 1:1 `hitungChecksumInstrument(dimensions)` (`instrument-bank.ts:55`):
  hash DJB2 dari JSON kanonik `{id, indicators:[{id,t,o:[[value,weight,isFinding]],
  w,r,e,l}]}` → `ck-<hex>`. Backend wajib memakai urutan kunci & normalisasi sama;
  satu vektor uji (`BACKEND_MIGRATION.md` §5) mengunci perilaku ini.

### 2.a Warisan versioning (baca saja, D-24)

Dibutuhkan agar snapshot `INS-v1.0/v1.1` lama tetap dapat dirender. Endpoint tulis
**dilarang**; hanya diisi saat migrasi/seed.

```sql
CREATE TABLE instrument_versions (
  id VARCHAR(16) PRIMARY KEY,            -- INS-v1.0 / INS-v1.1
  label VARCHAR(120) NOT NULL,
  status VARCHAR(16) NOT NULL,           -- Draft|Published|Archived
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE instrument_version_dimensions (
  version_id VARCHAR(16) NOT NULL,
  id VARCHAR(24) NOT NULL,               -- DIM-* (boleh sama antar versi)
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NULL,
  description VARCHAR(280) NULL,
  aspects JSON NULL,                     -- [{id,name}] (warisan versioning)
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (version_id, id),          -- versi lama berbagi id indikator/dimensi
  CONSTRAINT fk_insvd_ver FOREIGN KEY (version_id) REFERENCES instrument_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE instrument_version_indicators (
  version_id VARCHAR(16) NOT NULL,
  dimension_id VARCHAR(24) NOT NULL,
  id VARCHAR(24) NOT NULL,               -- IND-K3L-* stabil (boleh sama antar versi)
  code VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  answer_type VARCHAR(24) NOT NULL,
  is_required BOOL NOT NULL DEFAULT TRUE,
  evidence_required BOOL NOT NULL DEFAULT FALSE,
  location_required BOOL NOT NULL DEFAULT FALSE,
  finding_trigger VARCHAR(40) NULL,      -- contoh seed ilustratif, bukan aturan final
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (version_id, id),
  CONSTRAINT fk_insvi_dim FOREIGN KEY (version_id, dimension_id)
    REFERENCES instrument_version_dimensions(version_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 3. Laporan + snapshot + draft

```sql
CREATE TABLE reports (
  id VARCHAR(16) PRIMARY KEY,            -- RPT-XXXX berurutan
  channel VARCHAR(24) NOT NULL,          -- lapor-cepat|penilaian-mandiri
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  manual_location VARCHAR(200) NULL,     -- lokasi manual (D-11)
  reporter_name VARCHAR(100) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_account_email VARCHAR(190) NULL,
  reporter_contact VARCHAR(100) NULL,    -- Report.contact
  reporter_severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_recommendation VARCHAR(500) NULL,  -- D-29, usulan internal
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  indicator_id VARCHAR(24) NULL,         -- warisan lapor-cepat lama
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  evidence_asset_id VARCHAR(64) NULL,    -- lapor-cepat (privat)
  evidence_name VARCHAR(200) NULL,
  location_snapshot JSON NULL,           -- LocationSnapshot beku (areaId/locationText/floorNote/campusPlanVersionId/point)
  validation_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  handling_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  rejection_reason TEXT NULL,
  validation_note TEXT NULL,
  validated_by VARCHAR(16) NULL,
  validated_by_name VARCHAR(100) NULL,   -- snapshot anti-rewrite histori
  validated_by_role VARCHAR(24) NULL,
  validated_at DATETIME(3) NULL,
  instrument_version_id VARCHAR(16) NULL,
  instrument_checksum VARCHAR(64) NULL,
  score_percent DECIMAL(5,2) NULL,
  pdf_generated_at DATETIME(3) NULL,
  observed_at DATETIME(3) NULL,
  correction_of VARCHAR(16) NULL,
  archived_at DATETIME(3) NULL,
  archived_reason VARCHAR(255) NULL,
  client_request_id VARCHAR(64) NULL UNIQUE, -- idempotensi kirim
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_reports_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_reports_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_validator FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_correction FOREIGN KEY (correction_of) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_reports_inst_val (institution_code, validation_status, submitted_at DESC),
  INDEX idx_reports_public (validation_status, handling_status, archived_at),
  INDEX idx_reports_area (area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE self_assessment_snapshots (
  report_id VARCHAR(16) PRIMARY KEY,     -- 1:1 dengan reports
  instrument_version_id VARCHAR(16) NOT NULL, -- 'INS-LIVE' untuk baru
  instrument_checksum VARCHAR(64) NOT NULL,
  answers JSON NOT NULL,                 -- Record<indicatorId, IndicatorAnswer> beku
  frozen_indicators JSON NOT NULL,       -- FrozenIndicator[] beku
  score_percent DECIMAL(5,2) NULL,
  by_dimension JSON NULL,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_snap_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE self_assessment_drafts (
  id VARCHAR(24) PRIMARY KEY,            -- SELF-xxxx (+ kunci browser SELF-<kode> dipetakan ke sini)
  institution_code VARCHAR(16) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL DEFAULT '',
  contact VARCHAR(100) NULL,
  instrument_version_id VARCHAR(16) NOT NULL, -- 'INS-LIVE' untuk baru
  payload JSON NOT NULL,                 -- answers + activeIndex
  instrument_checksum VARCHAR(64) NOT NULL, -- beda = basi, wajib ulang (D-24)
  submitted_report_id VARCHAR(16) NULL,  -- tautan kiriman setelah sukses (anti kirim ganda)
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_selfdraft_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_selfdraft_user FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_selfdraft_inst (institution_code, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lapor_drafts (
  id VARCHAR(24) PRIMARY KEY,            -- LAPOR-xxxx (opsional; frontend boleh tetap localStorage)
  institution_code VARCHAR(16) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL DEFAULT '',
  payload JSON NOT NULL,                 -- field form lapor-cepat
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_lapordraft_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_lapordraft_user FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_lapordraft_inst (institution_code, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Draft lapor-cepat (`ishas-draft-v2:lapor:<kode>`) boleh tetap di browser
(preferensi perangkat) ATAU dipindah ke `lapor_drafts` bila ingin lintas
perangkat (lihat `BACKEND_MIGRATION.md`). Draft mandiri **wajib** pindah ke
`self_assessment_drafts` agar lintas perangkat + checksum tervalidasi server.

## 4. Temuan + rekomendasi/tindak lanjut

Nilai tampilan temuan berasal dari turunan mock (`ensureDerivedWork`,
`mock-store.ts:3010`). Backend **menyimpan kolom snapshot** agar output peta/
rekomendasi identik dengan mock; kolom bertanda *(derived)* boleh dihitung ulang
saat baca, tetapi nilai tersimpan tetap sumber PDF/audit.

```sql
CREATE TABLE findings (
  id VARCHAR(32) PRIMARY KEY,            -- RSK-<reportId>-<n>
  report_id VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  building_id VARCHAR(16) NULL,
  recommendation_id VARCHAR(32) NULL,
  source_answer_id VARCHAR(24) NULL,     -- indicatorId sumber
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  level VARCHAR(16) NOT NULL DEFAULT 'Sedang', -- Rendah|Sedang|Tinggi|Ekstrem
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  issue TEXT NOT NULL,
  instrument_version VARCHAR(40) NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',   -- label gabungan lokasi
  building VARCHAR(120) NOT NULL DEFAULT '—',
  zone VARCHAR(80) NOT NULL DEFAULT '—',
  floor VARCHAR(80) NOT NULL DEFAULT '—',
  x DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- *derived* dari location_snapshot.point
  y DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  indicator VARCHAR(200) NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT '',
  hazard VARCHAR(255) NOT NULL DEFAULT 'Menunggu kajian Pesantren',
  impact VARCHAR(255) NOT NULL DEFAULT 'Menunggu kajian Pesantren',
  likelihood VARCHAR(80) NOT NULL DEFAULT 'Belum dinilai',
  severity_text VARCHAR(24) NOT NULL DEFAULT 'Sedang',
  exposed_people VARCHAR(255) NOT NULL DEFAULT 'Menunggu kajian Pesantren',
  existing_control VARCHAR(255) NOT NULL DEFAULT '—',
  evidence VARCHAR(200) NOT NULL DEFAULT '',
  location_snapshot JSON NULL,
  observed_at DATETIME(3) NULL,
  plan_version VARCHAR(40) NOT NULL DEFAULT '—',
  residual_risk VARCHAR(24) NOT NULL DEFAULT 'Belum dinilai',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_find_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_find_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
  CONSTRAINT fk_find_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  INDEX idx_find_report (report_id),
  INDEX idx_find_cat (category_id, aspect_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recommendations (
  id VARCHAR(32) PRIMARY KEY,            -- REC-<reportId>-<n>
  report_id VARCHAR(16) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'Sedang', -- Tinggi|Sedang|Rendah
  title VARCHAR(200) NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  source VARCHAR(120) NOT NULL DEFAULT '', -- 'IND-K3L-001 · RPT-0001'
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
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_rec_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_rec_canceled FOREIGN KEY (canceled_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_rec_verified FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_rec_report (report_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 5. Lokasi + denah

```sql
CREATE TABLE buildings (
  id VARCHAR(16) PRIMARY KEY,            -- BLD-xxx
  institution_code VARCHAR(16) NOT NULL,
  code VARCHAR(40) NOT NULL,             -- unik per lembaga
  name VARCHAR(120) NOT NULL,
  floors JSON NOT NULL DEFAULT (JSON_ARRAY()), -- [{id,name,planFile legacy,planVersion,planHistory}]
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_build_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  UNIQUE KEY uq_building_code (institution_code, code),
  INDEX idx_build_inst (institution_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE areas (
  id VARCHAR(16) PRIMARY KEY,            -- AREA-xxx
  institution_code VARCHAR(16) NOT NULL,
  building_id VARCHAR(16) NOT NULL,
  floor VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  zone VARCHAR(80) NOT NULL,
  x DECIMAL(5,2) NOT NULL DEFAULT 50.00, -- default turunan lama
  y DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  width DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- Area.width (0 = tak dipakai)
  height DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Area.height
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_area_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_area_build FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  INDEX idx_area_inst (institution_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_campus_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  UNIQUE KEY uq_campus_rev (institution_code, revision),
  INDEX idx_campus_inst (institution_code, revision DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  category_id VARCHAR(32) NULL,          -- denormalisasi filter (KAT-*); wajib entri manual D-16.g
  aspect_id VARCHAR(48) NULL,
  is_manual BOOL NOT NULL DEFAULT FALSE,
  file_name VARCHAR(200) NOT NULL,       -- .pdf
  file_size INT UNSIGNED NOT NULL,       -- ≤10MB
  mime VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
  asset_id VARCHAR(64) NOT NULL UNIQUE,  -- instrument-doc-<uuid>
  visibility VARCHAR(16) NOT NULL DEFAULT 'Privat', -- Public|Privat
  updated_by VARCHAR(16) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_doc_asset FOREIGN KEY (asset_id) REFERENCES file_assets(asset_id),
  INDEX idx_doc_vis (visibility),
  INDEX idx_doc_cat (category_id, aspect_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

`category_id`/`aspect_id` diperlukan agar filter `?category=` pada
`GET /public/docs` dan `selectIndicatorDocRows` (`processors/instrument-docs.ts:107`)
berjalan untuk entri manual; baris katalog menurunkannya dari indikator.

## 7. SAM-iSAFE (D-26, D-26.e, D-26.f)

```sql
CREATE TABLE sam_categories (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-KAT-xx
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(280) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sam_questions (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-Q-xxx
  category_id VARCHAR(16) NOT NULL,
  text TEXT NOT NULL,
  panduan VARCHAR(500) NOT NULL DEFAULT '',
  contoh_bukti VARCHAR(280) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_samq_cat FOREIGN KEY (category_id) REFERENCES sam_categories(id),
  INDEX idx_samq_cat (category_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sam_assessments (
  id VARCHAR(16) PRIMARY KEY,            -- SAM-xxxx
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  manual_location VARCHAR(200) NULL,
  observer_account_id VARCHAR(16) NULL,
  observer_name VARCHAR(100) NOT NULL,
  observed_at DATE NOT NULL,
  observed_time VARCHAR(5) NULL,         -- 'HH:MM'
  kind VARCHAR(40) NOT NULL DEFAULT 'Rutin',
  note TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'Berlangsung', -- Draft|Berlangsung|Selesai
  answers JSON NOT NULL DEFAULT (JSON_OBJECT()), -- {questionId:{score 0|1|2,note?,evidence...}}
  total_score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,      -- dinamis: aktif × 2
  percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  risk_level VARCHAR(24) NOT NULL DEFAULT 'Risiko Tinggi', -- ambang 80/60 prototipe
  reviewed_by VARCHAR(100) NULL,         -- nama Validator pereview (snapshot)
  reviewed_by_id VARCHAR(16) NULL,       -- FK User.id
  reviewed_at DATETIME(3) NULL,
  review_note TEXT NULL,
  completed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_sam_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_sam_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
  CONSTRAINT fk_sam_observer FOREIGN KEY (observer_account_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_sam_reviewer FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sam_inst (institution_code, status, observed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sam_follow_ups (
  id VARCHAR(24) PRIMARY KEY,            -- SMF-xxxx
  assessment_id VARCHAR(16) NOT NULL,
  question_id VARCHAR(16) NOT NULL,
  title TEXT NOT NULL,                   -- teks soal saat dibuat
  note TEXT NULL,
  pic VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  created_by VARCHAR(16) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  done_at DATETIME(3) NULL,
  cancel_reason TEXT NULL,
  CONSTRAINT fk_smf_ass FOREIGN KEY (assessment_id) REFERENCES sam_assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_smf_q FOREIGN KEY (question_id) REFERENCES sam_questions(id),
  CONSTRAINT fk_smf_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_smf_active (assessment_id, question_id, status),
  INDEX idx_smf_ass (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Catatan: `UNIQUE(assessment,question,status)` tidak melarang duplikat historis
`Selesai`/`Dibatalkan`; batas "satu aktif" ditegakkan di aplikasi seperti mock.

## 8. Referensi kategori K3 (`kategori-k3.ts`)

Di-seed dari `KATEGORI_K3.md` dan **tidak** diubah oleh bank SAM
(`SAM-KAT-*` terpisah — D-26.f).

```sql
CREATE TABLE k3_categories (
  id VARCHAR(32) PRIMARY KEY,            -- KAT-KESELAMATAN|KAT-KESEHATAN|KAT-LINGKUNGAN|KAT-PSIKOSOSIAL
  name VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE k3_aspects (
  id VARCHAR(48) PRIMARY KEY,            -- ASP-*
  category_id VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_asp_cat FOREIGN KEY (category_id) REFERENCES k3_categories(id) ON DELETE CASCADE,
  INDEX idx_asp_cat (category_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 9. Audit + notifikasi + sequence + indeks

```sql
CREATE TABLE audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- ganti AUD-DEMO berurutan
  legacy_id VARCHAR(24) NULL,           -- AUD-DEMO-xxx saat migrasi seed
  object_type VARCHAR(40) NOT NULL,
  object_id VARCHAR(40) NOT NULL,
  actor_account_id VARCHAR(16) NULL,    -- FK longgar (audit tetap bila user dihapus)
  actor_name VARCHAR(100) NOT NULL,
  actor_role VARCHAR(24) NOT NULL,      -- 'Super Admin'|'Validator'|'Pesantren'|'Publik'
  institution_code VARCHAR(16) NULL,
  action VARCHAR(120) NOT NULL,
  note TEXT NULL,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_audit_obj (object_type, object_id, at DESC),
  INDEX idx_audit_actor (actor_account_id, at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_account_id VARCHAR(16) NULL, -- NULL = siaran scope (institution_code)
  institution_code VARCHAR(16) NULL,
  source_object_id VARCHAR(40) NULL,
  message VARCHAR(255) NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  is_read BOOL NOT NULL DEFAULT FALSE,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_notif_user FOREIGN KEY (recipient_account_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_recipient (recipient_account_id, is_read, at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengganti `counters` browser (report/institution) agar penomoran aman saat konkuren.
CREATE TABLE sequences (
  seq_name VARCHAR(32) PRIMARY KEY,      -- report|institution|assessment|follow_up
  value BIGINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Riwayat indeks ilustratif per pesantren (periode lampau). Titik periode
-- berjalan TIDAK disimpan: selalu dihitung dari snapshot Diterima (D-04).
CREATE TABLE index_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  period VARCHAR(16) NOT NULL,           -- 'Agu 2026'
  index_value DECIMAL(5,2) NOT NULL,     -- 0-100, ilustrasi
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_index_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  UNIQUE KEY uq_index_period (institution_code, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 10. Seed: satu file, dua mode

Keputusan pemilik: **satu file seed**, bukan dipecah. `scripts/seed.ts` (Bun)
dengan flag:

```bash
bun scripts/seed.ts --mode=demo   # presentasi dosen: isi penuh seperti seed.ts kini
bun scripts/seed.ts --mode=empty  # production: struktur kosong tapi valid
```

- Mode `demo`: port 1:1 dari `apps/web/mocks/seed/seed.ts`. Komposisi terverifikasi
  (dikunci `seed-composition.test.ts`): **5 pesantren** (2 terdaftar: PSN-0018,
  PSN-0019), **6 user**, **19 laporan** (14 lapor-cepat + 5 penilaian-mandiri:
  3 Menunggu, 2 Ditolak, 14 Diterima), **17 temuan + 17 rekomendasi**, **5
  kategori + 27 soal SAM + 4 pengamatan SAM + 2 follow-up**, **18 audit + 4
  notifikasi**, denah ilustrasi, bank live 10 indikator (dari `INS-v1.1`).
  Counter awal `report=20`, `institution=23`.
- Mode `empty` (minimal valid): `institutions[]`, `users=[1 admin]`,
  `reports/findings/...=[]`, `drafts={}`, `index_history={}`, bank instrumen
  valid (≥1 dimensi ≥1 indikator ≥1 opsi), `sequences={report:1, institution:1}`
  (penomoran berikutnya; `>0` syarat validator lama),
  `sam_categories/questions` boleh kosong (maks dinamis = 0, UI terkunci).
- File biner seed (denah ilustrasi, PDF contoh) disertakan di `scripts/seed-assets/`
  dan diunggah lewat jalur `file_assets` yang sama seperti upload normal. Pola aset
  seed yang sudah dipakai frontend: `seed-instrument-doc-<KODE>`.

## 11. Peta tipe frontend → tabel/kolom (audit implementasi)

| Tipe frontend | Tabel | Catatan pemetaan |
|---|---|---|
| `Institution` | `institutions` | `location`→`city`; `address`; `users` dihitung; `assessment` legacy tidak disimpan |
| `User` | `users` | `institutionCodes[]`→`institution_code` (Pesantren = 1); `initials` diturunkan |
| `Instrument` | `instrument_meta` + `bank_*` | `checksum` = `hitungChecksumInstrument` |
| `InstrumentVersion` | `instrument_versions` (+`_dimensions`/`_indicators`) | baca legacy, tanpa opsi |
| `Report` | `reports` | `locationSnapshot`/`manualLocation`→`location_snapshot`+`manual_location`; `contact`→`reporter_contact`; `reporterAccountEmail` |
| `SelfAssessmentSnapshot` | `self_assessment_snapshots` | `answers`/`frozenIndicators`/`byDimension` = JSON |
| `SelfAssessmentDraft` | `self_assessment_drafts` | `answers`+`activeIndex`→`payload` JSON |
| `RiskFinding` | `findings` | field tampilan disimpan sebagai kolom; `x/y` derived |
| `Recommendation` | `recommendations` | `source`/`location`/`action` disimpan |
| `Building`/`Floor` | `buildings` | `floors` JSON (termasuk `planHistory`) |
| `Area` | `areas` | `width`/`height` disimpan |
| `CampusPlanVersion` | `campus_plans` | `assetId`→`file_assets` |
| `InstrumentDoc` | `instrument_docs` | `categoryId`/`aspectId` disimpan |
| `SamCategory`/`SamQuestion`/`SamAssessment`/`SamFollowUp` | `sam_*` | `answers` JSON; `reviewedById` FK |
| `AuditEvent` | `audit_events` | `id` BIGINT + `legacy_id` |
| `Notification` | `notifications` | `read`→`is_read` |
| `IndexPoint` | `index_history` | periode lampau; periode berjalan dihitung |
| `counters` | `sequences` | transaksi + `SELECT ... FOR UPDATE` |
| Blob/aset | `file_assets` | lihat `BACKEND_STORAGE.md` §1 |
