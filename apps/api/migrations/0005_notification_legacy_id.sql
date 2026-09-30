-- 0005: legacy_id notifikasi agar ID stabil seed (NOT-001, …) selamat,
-- cermin kolom legacy_id pada audit_events.
ALTER TABLE notifications ADD COLUMN legacy_id VARCHAR(24) NULL AFTER id;
