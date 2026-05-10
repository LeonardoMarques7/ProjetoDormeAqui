-- Lancamentos financeiros por anfitriao e mes.

CREATE OR REPLACE VIEW v_host_financial_summary_monthly AS
SELECT
  COALESCE(fe.user_id, p.owner_id) AS host_id,
  COALESCE(u.name, owner_user.name) AS host_name,
  date_trunc('month', fe.created_at)::date AS financial_month,
  fe.currency,
  COUNT(*) AS entries_count,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'CHARGE'), 0) AS charge_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'HOST_PAYOUT'), 0) AS host_payout_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'PLATFORM_FEE'), 0) AS platform_fee_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'REFUND'), 0) AS refund_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'PENALTY'), 0) AS penalty_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.type = 'ADJUSTMENT'), 0) AS adjustment_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.status = 'PENDING'), 0) AS pending_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.status = 'AVAILABLE'), 0) AS available_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.status = 'SETTLED'), 0) AS settled_total,
  COALESCE(SUM(fe.amount) FILTER (WHERE fe.status = 'CANCELLED'), 0) AS cancelled_total
FROM financial_entries fe
JOIN bookings b ON b.id = fe.booking_id
LEFT JOIN places p ON p.id = COALESCE(fe.place_id, b.place_id)
LEFT JOIN users owner_user ON owner_user.id = p.owner_id
LEFT JOIN users u ON u.id = fe.user_id
GROUP BY COALESCE(fe.user_id, p.owner_id), COALESCE(u.name, owner_user.name), date_trunc('month', fe.created_at)::date, fe.currency;
