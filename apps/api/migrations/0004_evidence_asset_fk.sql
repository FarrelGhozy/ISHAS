-- 0004: FK bukti lapor & penyelesaian ke file_assets (RESTRICT).
-- BACKEND_DATA_MODEL §0.a mewajibkan semua kolom *_asset_id merujuk
-- file_assets(asset_id); 0001 melewatkan dua kolom ini. Nilai yatim
-- dinormalkan ke NULL dulu agar constraint dapat diterapkan pada DB lama.
UPDATE reports r
  LEFT JOIN file_assets f ON f.asset_id = r.evidence_asset_id
  SET r.evidence_asset_id = NULL
  WHERE r.evidence_asset_id IS NOT NULL AND f.asset_id IS NULL;
UPDATE recommendations r
  LEFT JOIN file_assets f ON f.asset_id = r.completion_evidence_asset_id
  SET r.completion_evidence_asset_id = NULL
  WHERE r.completion_evidence_asset_id IS NOT NULL AND f.asset_id IS NULL;
ALTER TABLE reports
  ADD CONSTRAINT fk_reports_evidence
  FOREIGN KEY (evidence_asset_id) REFERENCES file_assets (asset_id);
ALTER TABLE recommendations
  ADD CONSTRAINT fk_rec_completion_evidence
  FOREIGN KEY (completion_evidence_asset_id) REFERENCES file_assets (asset_id);
