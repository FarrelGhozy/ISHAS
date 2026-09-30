-- ISHAS backend schema v15 (docs/BACKEND_DATA_MODEL.md, MySQL 8.0.13+).
-- Charset utf8mb4 / utf8mb4_unicode_ci, waktu DATETIME(3) UTC.
-- Urutan tabel mengikuti dependensi FOREIGN KEY.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id VARCHAR(64) PRIMARY KEY,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institutions (
  code VARCHAR(16) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  manager VARCHAR(100) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'Persiapan',
  active_campus_plan_id VARCHAR(40) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_institutions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  role VARCHAR(16) NOT NULL,
  institution_code VARCHAR(16) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'Menunggu',
  password_hash CHAR(60) NULL,
  last_active_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_users_institution FOREIGN KEY (institution_code) REFERENCES institutions(code),
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id BINARY(16) PRIMARY KEY,
  user_id VARCHAR(16) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS k3_categories (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS k3_aspects (
  id VARCHAR(48) PRIMARY KEY,
  category_id VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_asp_cat FOREIGN KEY (category_id) REFERENCES k3_categories(id) ON DELETE CASCADE,
  INDEX idx_asp_cat (category_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_assets (
  asset_id VARCHAR(64) PRIMARY KEY,
  kind VARCHAR(32) NOT NULL,
  institution_code VARCHAR(16) NULL,
  owner_ref VARCHAR(64) NULL,
  original_name VARCHAR(200) NOT NULL,
  stored_path VARCHAR(512) NOT NULL UNIQUE,
  mime VARCHAR(64) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  width INT NULL,
  height INT NULL,
  sha256 CHAR(64) NOT NULL,
  visibility VARCHAR(16) NOT NULL DEFAULT 'Privat',
  uploaded_by VARCHAR(16) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_file_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  INDEX idx_file_inst (institution_code),
  INDEX idx_file_owner (owner_ref),
  INDEX idx_file_kind (kind, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instrument_meta (
  id VARCHAR(16) PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_dimensions (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NULL,
  aspects JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_bankdim_cat FOREIGN KEY (category_id) REFERENCES k3_categories(id),
  INDEX idx_bankdim_cat (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_indicators (
  id VARCHAR(24) PRIMARY KEY,
  dimension_id VARCHAR(16) NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL,
  answer_type VARCHAR(24) NOT NULL,
  is_required BOOL NOT NULL DEFAULT TRUE,
  evidence_required BOOL NOT NULL DEFAULT FALSE,
  location_required BOOL NOT NULL DEFAULT FALSE,
  weight DECIMAL(4,2) NOT NULL DEFAULT 1.00,
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

CREATE TABLE IF NOT EXISTS bank_options (
  indicator_id VARCHAR(24) NOT NULL,
  value VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  weight TINYINT UNSIGNED NOT NULL,
  is_finding BOOL NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (indicator_id, value),
  CONSTRAINT fk_bankopt_ind FOREIGN KEY (indicator_id) REFERENCES bank_indicators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instrument_versions (
  id VARCHAR(16) PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  status VARCHAR(16) NOT NULL,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instrument_version_dimensions (
  version_id VARCHAR(16) NOT NULL,
  id VARCHAR(24) NOT NULL,
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NULL,
  description VARCHAR(280) NULL,
  aspects JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (version_id, id),
  CONSTRAINT fk_insvd_ver FOREIGN KEY (version_id) REFERENCES instrument_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instrument_version_indicators (
  version_id VARCHAR(16) NOT NULL,
  dimension_id VARCHAR(24) NOT NULL,
  id VARCHAR(24) NOT NULL,
  code VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  answer_type VARCHAR(24) NOT NULL,
  is_required BOOL NOT NULL DEFAULT TRUE,
  evidence_required BOOL NOT NULL DEFAULT FALSE,
  location_required BOOL NOT NULL DEFAULT FALSE,
  finding_trigger VARCHAR(40) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (version_id, id),
  CONSTRAINT fk_insvi_dim FOREIGN KEY (version_id, dimension_id)
    REFERENCES instrument_version_dimensions(version_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS buildings (
  id VARCHAR(16) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  floors JSON NOT NULL DEFAULT (JSON_ARRAY()),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_build_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  UNIQUE KEY uq_building_code (institution_code, code),
  INDEX idx_build_inst (institution_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS areas (
  id VARCHAR(16) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  building_id VARCHAR(16) NOT NULL,
  floor VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  zone VARCHAR(80) NOT NULL,
  x DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  y DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  width DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  height DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_area_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_area_build FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  INDEX idx_area_inst (institution_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campus_plans (
  id VARCHAR(40) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  revision INT NOT NULL,
  asset_id VARCHAR(64) NOT NULL UNIQUE,
  width INT NOT NULL,
  height INT NOT NULL,
  uploaded_by VARCHAR(16) NOT NULL,
  uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  illustration BOOL NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_campus_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_campus_asset FOREIGN KEY (asset_id) REFERENCES file_assets(asset_id),
  UNIQUE KEY uq_campus_rev (institution_code, revision),
  INDEX idx_campus_inst (institution_code, revision DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(16) PRIMARY KEY,
  channel VARCHAR(24) NOT NULL,
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  manual_location VARCHAR(200) NULL,
  reporter_name VARCHAR(100) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_account_email VARCHAR(190) NULL,
  reporter_contact VARCHAR(100) NULL,
  reporter_severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  reporter_recommendation VARCHAR(500) NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  indicator_id VARCHAR(24) NULL,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  evidence_asset_id VARCHAR(64) NULL,
  evidence_name VARCHAR(200) NULL,
  location_snapshot JSON NULL,
  validation_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  severity VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  priority VARCHAR(24) NOT NULL DEFAULT 'Belum ditentukan',
  handling_status VARCHAR(24) NOT NULL DEFAULT 'Menunggu validasi',
  rejection_reason TEXT NULL,
  validation_note TEXT NULL,
  validated_by VARCHAR(16) NULL,
  validated_by_name VARCHAR(100) NULL,
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
  client_request_id VARCHAR(64) NULL UNIQUE,
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

CREATE TABLE IF NOT EXISTS self_assessment_snapshots (
  report_id VARCHAR(16) PRIMARY KEY,
  instrument_version_id VARCHAR(16) NOT NULL,
  instrument_checksum VARCHAR(64) NOT NULL,
  answers JSON NOT NULL,
  frozen_indicators JSON NOT NULL,
  score_percent DECIMAL(5,2) NULL,
  by_dimension JSON NULL,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_snap_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS self_assessment_drafts (
  id VARCHAR(24) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL DEFAULT '',
  contact VARCHAR(100) NULL,
  instrument_version_id VARCHAR(16) NOT NULL,
  payload JSON NOT NULL,
  instrument_checksum VARCHAR(64) NOT NULL,
  submitted_report_id VARCHAR(16) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_selfdraft_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_selfdraft_user FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_selfdraft_inst (institution_code, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lapor_drafts (
  id VARCHAR(24) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  reporter_user_id VARCHAR(16) NULL,
  reporter_name VARCHAR(100) NOT NULL DEFAULT '',
  payload JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_lapordraft_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  CONSTRAINT fk_lapordraft_user FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_lapordraft_inst (institution_code, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS findings (
  id VARCHAR(32) PRIMARY KEY,
  report_id VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  building_id VARCHAR(16) NULL,
  recommendation_id VARCHAR(32) NULL,
  source_answer_id VARCHAR(24) NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  level VARCHAR(16) NOT NULL DEFAULT 'Sedang',
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  issue TEXT NOT NULL,
  instrument_version VARCHAR(40) NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  building VARCHAR(120) NOT NULL DEFAULT '—',
  zone VARCHAR(80) NOT NULL DEFAULT '—',
  floor VARCHAR(80) NOT NULL DEFAULT '—',
  x DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  y DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  indicator VARCHAR(200) NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS recommendations (
  id VARCHAR(32) PRIMARY KEY,
  report_id VARCHAR(16) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'Sedang',
  title VARCHAR(200) NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  source VARCHAR(120) NOT NULL DEFAULT '',
  action VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Belum ditindaklanjuti',
  owner VARCHAR(100) NULL,
  due_date DATE NULL,
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS instrument_docs (
  id VARCHAR(32) PRIMARY KEY,
  indicator_id VARCHAR(24) NOT NULL UNIQUE,
  indicator_code VARCHAR(40) NULL,
  indicator_title VARCHAR(200) NULL,
  category_id VARCHAR(32) NULL,
  aspect_id VARCHAR(48) NULL,
  is_manual BOOL NOT NULL DEFAULT FALSE,
  file_name VARCHAR(200) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  mime VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
  asset_id VARCHAR(64) NOT NULL UNIQUE,
  visibility VARCHAR(16) NOT NULL DEFAULT 'Privat',
  updated_by VARCHAR(16) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_doc_asset FOREIGN KEY (asset_id) REFERENCES file_assets(asset_id),
  INDEX idx_doc_vis (visibility),
  INDEX idx_doc_cat (category_id, aspect_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sam_categories (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(280) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sam_questions (
  id VARCHAR(16) PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS sam_assessments (
  id VARCHAR(16) PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  area_id VARCHAR(16) NULL,
  manual_location VARCHAR(200) NULL,
  observer_account_id VARCHAR(16) NULL,
  observer_name VARCHAR(100) NOT NULL,
  observed_at DATE NOT NULL,
  observed_time VARCHAR(5) NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'Rutin',
  note TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'Berlangsung',
  answers JSON NOT NULL DEFAULT (JSON_OBJECT()),
  total_score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  risk_level VARCHAR(24) NOT NULL DEFAULT 'Risiko Tinggi',
  reviewed_by VARCHAR(100) NULL,
  reviewed_by_id VARCHAR(16) NULL,
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

CREATE TABLE IF NOT EXISTS sam_follow_ups (
  id VARCHAR(24) PRIMARY KEY,
  assessment_id VARCHAR(16) NOT NULL,
  question_id VARCHAR(16) NOT NULL,
  title TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  legacy_id VARCHAR(24) NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_account_id VARCHAR(16) NULL,
  institution_code VARCHAR(16) NULL,
  source_object_id VARCHAR(40) NULL,
  message VARCHAR(255) NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  is_read BOOL NOT NULL DEFAULT FALSE,
  at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_notif_user FOREIGN KEY (recipient_account_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_recipient (recipient_account_id, is_read, at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sequences (
  seq_name VARCHAR(32) PRIMARY KEY,
  value BIGINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS index_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_code VARCHAR(16) NOT NULL,
  period VARCHAR(16) NOT NULL,
  index_value DECIMAL(5,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_index_inst FOREIGN KEY (institution_code) REFERENCES institutions(code),
  UNIQUE KEY uq_index_period (institution_code, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
