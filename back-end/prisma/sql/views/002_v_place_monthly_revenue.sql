-- Receita mensal por acomodacao.

CREATE OR REPLACE VIEW v_place_monthly_revenue AS
SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  p.id AS place_id,
  p.title AS place_title,
  p.city,
  date_trunc('month', b.check_in)::date AS revenue_month,
  COUNT(DISTINCT b.id) AS bookings_count,
  COALESCE(SUM(b.nights), 0) AS booked_nights,
  COALESCE(SUM(b.total_price), 0) AS booking_gross_revenue,
  COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'APPROVED'), 0) AS approved_payment_gross,
  COALESCE(SUM(pay.amount_refunded) FILTER (WHERE pay.status IN ('APPROVED', 'REFUNDED', 'PARTIALLY_REFUNDED')), 0) AS refunded_amount,
  COALESCE(SUM(pay.amount - pay.amount_refunded) FILTER (WHERE pay.status = 'APPROVED'), 0) AS approved_payment_net
FROM bookings b
JOIN places p ON p.id = b.place_id
JOIN users u ON u.id = p.owner_id
LEFT JOIN payments pay ON pay.booking_id = b.id
WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
GROUP BY p.owner_id, u.name, p.id, p.title, p.city, date_trunc('month', b.check_in)::date;
