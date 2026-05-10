-- Reservas por status, anfitriao e mes.

CREATE OR REPLACE VIEW v_host_booking_status_monthly AS
SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  date_trunc('month', b.check_in)::date AS booking_month,
  b.status AS booking_status,
  COUNT(*) AS bookings_count,
  COALESCE(SUM(b.nights), 0) AS nights_count,
  COALESCE(SUM(b.total_price), 0) AS total_booking_value
FROM bookings b
JOIN places p ON p.id = b.place_id
JOIN users u ON u.id = p.owner_id
GROUP BY p.owner_id, u.name, date_trunc('month', b.check_in)::date, b.status;
