-- Resumo mensal consolidado para dashboard futuro do anfitriao.

CREATE OR REPLACE VIEW v_host_dashboard_summary_monthly AS
WITH booking_summary AS (
  SELECT
    p.owner_id AS host_id,
    date_trunc('month', b.check_in)::date AS summary_month,
    COUNT(*) AS bookings_count,
    COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')) AS operational_bookings_count,
    COUNT(*) FILTER (WHERE b.status IN ('CANCELLED', 'REJECTED', 'ARCHIVED')) AS inactive_bookings_count,
    COALESCE(SUM(b.nights) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')), 0) AS booked_nights,
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')), 0) AS booking_gross_revenue
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  GROUP BY p.owner_id, date_trunc('month', b.check_in)::date
),
payment_summary AS (
  SELECT
    p.owner_id AS host_id,
    date_trunc('month', pay.created_at)::date AS summary_month,
    COUNT(*) AS payments_count,
    COUNT(*) FILTER (WHERE pay.status = 'APPROVED') AS approved_payments_count,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'APPROVED'), 0) AS approved_payment_gross,
    COALESCE(SUM(pay.amount_refunded) FILTER (WHERE pay.status IN ('APPROVED', 'REFUNDED', 'PARTIALLY_REFUNDED')), 0) AS refunded_amount,
    COALESCE(SUM(pay.amount - pay.amount_refunded) FILTER (WHERE pay.status = 'APPROVED'), 0) AS approved_payment_net
  FROM payments pay
  JOIN bookings b ON b.id = pay.booking_id
  JOIN places p ON p.id = b.place_id
  GROUP BY p.owner_id, date_trunc('month', pay.created_at)::date
),
review_summary AS (
  SELECT
    p.owner_id AS host_id,
    date_trunc('month', r.created_at)::date AS summary_month,
    COUNT(*) AS reviews_count,
    ROUND(AVG(r.rating)::numeric, 2) AS average_rating
  FROM reviews r
  JOIN places p ON p.id = r.place_id
  GROUP BY p.owner_id, date_trunc('month', r.created_at)::date
),
host_months AS (
  SELECT host_id, summary_month FROM booking_summary
  UNION
  SELECT host_id, summary_month FROM payment_summary
  UNION
  SELECT host_id, summary_month FROM review_summary
)
SELECT
  hm.host_id,
  u.name AS host_name,
  hm.summary_month,
  COUNT(DISTINCT p.id) AS places_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE') AS active_places_count,
  COALESCE(bs.bookings_count, 0) AS bookings_count,
  COALESCE(bs.operational_bookings_count, 0) AS operational_bookings_count,
  COALESCE(bs.inactive_bookings_count, 0) AS inactive_bookings_count,
  COALESCE(bs.booked_nights, 0) AS booked_nights,
  COALESCE(bs.booking_gross_revenue, 0) AS booking_gross_revenue,
  COALESCE(ps.payments_count, 0) AS payments_count,
  COALESCE(ps.approved_payments_count, 0) AS approved_payments_count,
  COALESCE(ps.approved_payment_gross, 0) AS approved_payment_gross,
  COALESCE(ps.refunded_amount, 0) AS refunded_amount,
  COALESCE(ps.approved_payment_net, 0) AS approved_payment_net,
  COALESCE(rs.reviews_count, 0) AS reviews_count,
  rs.average_rating
FROM host_months hm
JOIN users u ON u.id = hm.host_id
LEFT JOIN places p ON p.owner_id = hm.host_id
LEFT JOIN booking_summary bs
  ON bs.host_id = hm.host_id
 AND bs.summary_month = hm.summary_month
LEFT JOIN payment_summary ps
  ON ps.host_id = hm.host_id
 AND ps.summary_month = hm.summary_month
LEFT JOIN review_summary rs
  ON rs.host_id = hm.host_id
 AND rs.summary_month = hm.summary_month
GROUP BY
  hm.host_id,
  u.name,
  hm.summary_month,
  bs.bookings_count,
  bs.operational_bookings_count,
  bs.inactive_bookings_count,
  bs.booked_nights,
  bs.booking_gross_revenue,
  ps.payments_count,
  ps.approved_payments_count,
  ps.approved_payment_gross,
  ps.refunded_amount,
  ps.approved_payment_net,
  rs.reviews_count,
  rs.average_rating;
