SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT id, name, email, badge_number, phone
FROM police_officers
ORDER BY id;

SELECT id, title, type, location_name, radius_km, image_file_name, officer_name, officer_badge_number, created_by_officer_id, status, created_at
FROM alerts
ORDER BY created_at DESC;

SELECT id, storage_key, original_file_name, content_type, file_size_bytes, created_at
FROM alert_images
ORDER BY created_at DESC;

SELECT storage_key, octet_length(image_data) AS image_bytes
FROM alert_images
ORDER BY created_at DESC;
