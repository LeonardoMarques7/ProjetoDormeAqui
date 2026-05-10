-- Etapa 6 - Saude de relacionamentos principais.
-- Objetivo: detectar orfaos logicos. Com FKs ativas, esta query deve retornar zero linhas.

SELECT
  'places.owner_id -> users.id' AS check_name,
  p.id::text AS source_id,
  p.owner_id::text AS missing_reference
FROM places p
LEFT JOIN users u ON u.id = p.owner_id
WHERE u.id IS NULL
UNION ALL
SELECT
  'bookings.place_id -> places.id',
  b.id::text,
  b.place_id::text
FROM bookings b
LEFT JOIN places p ON p.id = b.place_id
WHERE p.id IS NULL
UNION ALL
SELECT
  'bookings.guest_id -> users.id',
  b.id::text,
  b.guest_id::text
FROM bookings b
LEFT JOIN users u ON u.id = b.guest_id
WHERE u.id IS NULL
UNION ALL
SELECT
  'payments.booking_id -> bookings.id',
  pay.id::text,
  pay.booking_id::text
FROM payments pay
LEFT JOIN bookings b ON b.id = pay.booking_id
WHERE b.id IS NULL
UNION ALL
SELECT
  'payments.user_id -> users.id',
  pay.id::text,
  pay.user_id::text
FROM payments pay
LEFT JOIN users u ON u.id = pay.user_id
WHERE u.id IS NULL
UNION ALL
SELECT
  'reviews.booking_id -> bookings.id',
  r.id::text,
  r.booking_id::text
FROM reviews r
LEFT JOIN bookings b ON b.id = r.booking_id
WHERE b.id IS NULL
UNION ALL
SELECT
  'reviews.place_id -> places.id',
  r.id::text,
  r.place_id::text
FROM reviews r
LEFT JOIN places p ON p.id = r.place_id
WHERE p.id IS NULL
UNION ALL
SELECT
  'reviews.user_id -> users.id',
  r.id::text,
  r.user_id::text
FROM reviews r
LEFT JOIN users u ON u.id = r.user_id
WHERE u.id IS NULL
UNION ALL
SELECT
  'financial_entries.booking_id -> bookings.id',
  fe.id::text,
  fe.booking_id::text
FROM financial_entries fe
LEFT JOIN bookings b ON b.id = fe.booking_id
WHERE b.id IS NULL
UNION ALL
SELECT
  'financial_entries.payment_id -> payments.id',
  fe.id::text,
  fe.payment_id::text
FROM financial_entries fe
LEFT JOIN payments pay ON pay.id = fe.payment_id
WHERE fe.payment_id IS NOT NULL
  AND pay.id IS NULL
ORDER BY check_name, source_id;
