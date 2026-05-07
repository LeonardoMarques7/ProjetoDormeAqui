-- Etapa 6 - Contagens gerais pos-migracao.
-- Objetivo: conferir volume por entidade e rastreabilidade de documentos legados.

SELECT
  'users' AS entity,
  COUNT(*) AS total_rows,
  COUNT(legacy_mongo_id) AS rows_with_legacy_mongo_id,
  COUNT(*) FILTER (WHERE legacy_mongo_id IS NULL) AS rows_without_legacy_mongo_id
FROM users
UNION ALL
SELECT
  'places',
  COUNT(*),
  COUNT(legacy_mongo_id),
  COUNT(*) FILTER (WHERE legacy_mongo_id IS NULL)
FROM places
UNION ALL
SELECT
  'bookings',
  COUNT(*),
  COUNT(legacy_mongo_id),
  COUNT(*) FILTER (WHERE legacy_mongo_id IS NULL)
FROM bookings
UNION ALL
SELECT
  'reviews',
  COUNT(*),
  COUNT(legacy_mongo_id),
  COUNT(*) FILTER (WHERE legacy_mongo_id IS NULL)
FROM reviews
UNION ALL
SELECT
  'payments',
  COUNT(*),
  COUNT(legacy_mongo_id),
  COUNT(*) FILTER (WHERE legacy_mongo_id IS NULL)
FROM payments
UNION ALL
SELECT
  'financial_entries',
  COUNT(*),
  NULL::bigint,
  NULL::bigint
FROM financial_entries
ORDER BY entity;

SELECT
  'auth_identities' AS entity,
  COUNT(*) AS total_rows
FROM auth_identities
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'place_photos', COUNT(*) FROM place_photos
UNION ALL
SELECT 'perks', COUNT(*) FROM perks
UNION ALL
SELECT 'place_perks', COUNT(*) FROM place_perks
UNION ALL
SELECT 'booking_status_history', COUNT(*) FROM booking_status_history
UNION ALL
SELECT 'payment_events', COUNT(*) FROM payment_events
UNION ALL
SELECT 'review_badges', COUNT(*) FROM review_badges
ORDER BY entity;
