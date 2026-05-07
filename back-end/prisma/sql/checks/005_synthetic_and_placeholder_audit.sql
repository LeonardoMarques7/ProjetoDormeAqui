-- Etapa 6 - Auditoria de dados sinteticos e placeholders.
-- Objetivo: encontrar lacunas de migracao que merecem revisao manual.

SELECT
  'user_without_legacy_id' AS finding,
  u.id::text AS entity_id,
  u.email AS reference,
  u.created_at
FROM users u
WHERE u.legacy_mongo_id IS NULL
UNION ALL
SELECT
  'place_without_legacy_id',
  p.id::text,
  p.title,
  p.created_at
FROM places p
WHERE p.legacy_mongo_id IS NULL
UNION ALL
SELECT
  'booking_without_legacy_id',
  b.id::text,
  b.status::text,
  b.created_at
FROM bookings b
WHERE b.legacy_mongo_id IS NULL
UNION ALL
SELECT
  'review_without_legacy_id',
  r.id::text,
  r.rating::text,
  r.created_at
FROM reviews r
WHERE r.legacy_mongo_id IS NULL
UNION ALL
SELECT
  'payment_without_legacy_id',
  p.id::text,
  p.status::text,
  p.created_at
FROM payments p
WHERE p.legacy_mongo_id IS NULL
ORDER BY finding, created_at, entity_id;

SELECT
  'placeholder_user_email' AS finding,
  u.id::text AS entity_id,
  u.email AS value
FROM users u
WHERE u.email ILIKE '%placeholder%'
   OR u.email ILIKE '%synthetic%'
   OR u.email ILIKE '%example.%'
UNION ALL
SELECT
  'placeholder_place_title',
  p.id::text,
  p.title
FROM places p
WHERE p.title ILIKE '%placeholder%'
   OR p.title ILIKE '%synthetic%'
   OR p.title ILIKE '%sem titulo%'
UNION ALL
SELECT
  'placeholder_place_description',
  p.id::text,
  LEFT(p.description, 200)
FROM places p
WHERE p.description ILIKE '%placeholder%'
   OR p.description ILIKE '%synthetic%'
   OR p.description ILIKE '%sem descricao%'
ORDER BY finding, entity_id;
