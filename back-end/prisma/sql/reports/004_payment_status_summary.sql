-- Resumo de pagamentos por status, provedor, metodo e mes.

SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  date_trunc('month', pay.created_at)::date AS payment_month,
  pay.provider,
  pay.method,
  pay.status,
  pay.currency,
  COUNT(*) AS payments_count,
  SUM(pay.amount) AS gross_amount,
  SUM(pay.amount_refunded) AS refunded_amount,
  SUM(pay.amount - pay.amount_refunded) AS net_amount
FROM payments pay
JOIN bookings b ON b.id = pay.booking_id
JOIN places p ON p.id = b.place_id
JOIN users u ON u.id = p.owner_id
GROUP BY p.owner_id, u.name, date_trunc('month', pay.created_at)::date, pay.provider, pay.method, pay.status, pay.currency
ORDER BY payment_month DESC, host_name, pay.provider, pay.status;
