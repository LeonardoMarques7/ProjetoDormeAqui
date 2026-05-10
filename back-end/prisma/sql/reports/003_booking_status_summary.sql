-- Resumo de reservas por status, anfitriao e mes de check-in.

SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  date_trunc('month', b.check_in)::date AS booking_month,
  b.status,
  COUNT(*) AS bookings_count,
  SUM(b.nights) AS nights_count,
  SUM(b.total_price) AS total_booking_value,
  MIN(b.check_in) AS first_check_in,
  MAX(b.check_out) AS last_check_out
FROM bookings b
JOIN places p ON p.id = b.place_id
JOIN users u ON u.id = p.owner_id
GROUP BY p.owner_id, u.name, date_trunc('month', b.check_in)::date, b.status
ORDER BY booking_month DESC, host_name, b.status;
