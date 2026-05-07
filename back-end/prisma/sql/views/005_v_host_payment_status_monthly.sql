-- Pagamentos por status, anfitriao e mes.

CREATE OR REPLACE VIEW v_host_payment_status_monthly AS
SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  date_trunc('month', pay.created_at)::date AS payment_month,
  pay.provider,
  pay.method,
  pay.status AS payment_status,
  pay.currency,
  COUNT(*) AS payments_count,
  COALESCE(SUM(pay.amount), 0) AS gross_amount,
  COALESCE(SUM(pay.amount_refunded), 0) AS refunded_amount,
  COALESCE(SUM(pay.amount - pay.amount_refunded), 0) AS net_amount
FROM payments pay
JOIN bookings b ON b.id = pay.booking_id
JOIN places p ON p.id = b.place_id
JOIN users u ON u.id = p.owner_id
GROUP BY p.owner_id, u.name, date_trunc('month', pay.created_at)::date, pay.provider, pay.method, pay.status, pay.currency;
