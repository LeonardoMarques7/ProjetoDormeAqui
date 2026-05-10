-- Etapa 6 - Integridade de reservas.
-- Objetivo: validar datas, noites, capacidade, precos e sobreposicoes operacionais.

SELECT
  'invalid_date_range' AS issue,
  b.id::text AS booking_id,
  b.place_id::text,
  b.status::text AS booking_status,
  b.check_in,
  b.check_out,
  b.nights,
  b.guests,
  b.price_per_night,
  b.total_price
FROM bookings b
WHERE b.check_in >= b.check_out
UNION ALL
SELECT
  'invalid_nights',
  b.id::text,
  b.place_id::text,
  b.status::text,
  b.check_in,
  b.check_out,
  b.nights,
  b.guests,
  b.price_per_night,
  b.total_price
FROM bookings b
WHERE b.nights <> GREATEST(1, (b.check_out::date - b.check_in::date))
UNION ALL
SELECT
  'invalid_total_price',
  b.id::text,
  b.place_id::text,
  b.status::text,
  b.check_in,
  b.check_out,
  b.nights,
  b.guests,
  b.price_per_night,
  b.total_price
FROM bookings b
WHERE ABS(b.total_price - (b.price_per_night * b.nights)) > 0.01
UNION ALL
SELECT
  'guests_exceed_place_capacity',
  b.id::text,
  b.place_id::text,
  b.status::text,
  b.check_in,
  b.check_out,
  b.nights,
  b.guests,
  b.price_per_night,
  b.total_price
FROM bookings b
JOIN places p ON p.id = b.place_id
WHERE b.guests > p.max_guests
ORDER BY issue, booking_id;

SELECT
  a.place_id,
  a.id AS booking_a_id,
  b.id AS booking_b_id,
  a.status AS booking_a_status,
  b.status AS booking_b_status,
  a.check_in AS booking_a_check_in,
  a.check_out AS booking_a_check_out,
  b.check_in AS booking_b_check_in,
  b.check_out AS booking_b_check_out
FROM bookings a
JOIN bookings b
  ON b.place_id = a.place_id
 AND b.id > a.id
 AND a.check_in < b.check_out
 AND b.check_in < a.check_out
WHERE a.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW')
  AND b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW')
ORDER BY a.place_id, a.check_in, b.check_in;
