-- Etapa 6 - Integridade financeira.
-- Objetivo: apontar inconsistencias entre reservas, pagamentos e lancamentos financeiros.

SELECT
  'payment_amount_invalid' AS issue,
  p.id::text AS payment_id,
  p.booking_id::text,
  p.status::text AS status,
  p.amount,
  p.amount_refunded,
  NULL::numeric AS booking_total_price
FROM payments p
WHERE p.amount < 0
   OR p.amount_refunded < 0
   OR p.amount_refunded > p.amount
UNION ALL
SELECT
  'approved_payment_without_approved_at',
  p.id::text,
  p.booking_id::text,
  p.status::text,
  p.amount,
  p.amount_refunded,
  NULL::numeric
FROM payments p
WHERE p.status = 'APPROVED'
  AND p.approved_at IS NULL
UNION ALL
SELECT
  'payment_amount_differs_from_booking_total',
  p.id::text,
  p.booking_id::text,
  p.status::text,
  p.amount,
  p.amount_refunded,
  b.total_price
FROM payments p
JOIN bookings b ON b.id = p.booking_id
WHERE p.status IN ('APPROVED', 'REFUNDED', 'PARTIALLY_REFUNDED')
  AND ABS(p.amount - b.total_price) > 0.01
ORDER BY issue, payment_id;

SELECT
  fe.booking_id,
  b.total_price AS booking_total_price,
  SUM(fe.amount) FILTER (WHERE fe.type = 'CHARGE') AS charge_total,
  SUM(fe.amount) FILTER (WHERE fe.type = 'HOST_PAYOUT') AS host_payout_total,
  SUM(fe.amount) FILTER (WHERE fe.type = 'PLATFORM_FEE') AS platform_fee_total,
  SUM(fe.amount) FILTER (WHERE fe.type = 'REFUND') AS refund_total,
  SUM(fe.amount) FILTER (WHERE fe.type = 'PENALTY') AS penalty_total,
  SUM(fe.amount) FILTER (WHERE fe.type = 'ADJUSTMENT') AS adjustment_total
FROM financial_entries fe
JOIN bookings b ON b.id = fe.booking_id
GROUP BY fe.booking_id, b.total_price
ORDER BY fe.booking_id;

SELECT
  'approved_booking_without_approved_payment' AS issue,
  b.id::text AS booking_id,
  b.status::text AS booking_status,
  b.total_price,
  COALESCE(SUM(p.amount - p.amount_refunded) FILTER (WHERE p.status = 'APPROVED'), 0) AS approved_net_payments
FROM bookings b
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
GROUP BY b.id, b.status, b.total_price
HAVING COALESCE(SUM(p.amount - p.amount_refunded) FILTER (WHERE p.status = 'APPROVED'), 0) = 0
ORDER BY b.id;
