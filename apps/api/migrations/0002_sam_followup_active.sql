-- 0002 — sam_follow_ups: satu tindak lanjut aktif per temuan (D-26.e).
-- Unique lama (assessment_id, question_id, status) ikut memblokir lebih dari satu
-- baris `Dibatalkan`; mock mengizinkan buat ulang setelah batal. Ganti dengan
-- kolom generated `active_key` (NULL saat Dibatalkan) agar hanya satu baris aktif
-- per soal, sementara baris `Dibatalkan` boleh menumpuk.
ALTER TABLE sam_follow_ups DROP INDEX uq_smf_active;
ALTER TABLE sam_follow_ups
  ADD COLUMN active_key VARCHAR(1)
  GENERATED ALWAYS AS (IF(status = 'Dibatalkan', NULL, 'A')) STORED;
CREATE UNIQUE INDEX uq_smf_active ON sam_follow_ups (assessment_id, question_id, active_key);
