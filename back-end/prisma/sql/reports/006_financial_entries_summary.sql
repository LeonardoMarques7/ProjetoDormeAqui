-- Resumo de lancamentos financeiros por mes, anfitriao, tipo e status.

SELECT
  COALESCE(fe.user_id, p.owner_id) AS host_or_user_id,
  COALESCE(u.name, owner_user.name) AS host_or_user_name,
  date_trunc('month', fe.created_at)::date AS entry_month,
  fe.type,
  fe.status,
  fe.currency,
  COUNT(*) AS entries_count,
  SUM(fe.amount) AS total_amount,
  MIN(fe.created_at) AS first_entry_at,
  MAX(fe.created_at) AS last_entry_at
FROM financial_entries fe
JOIN bookings b ON b.id = fe.booking_id
LEFT JOIN places p ON p.id = COALESCE(fe.place_id, b.place_id)
LEFT JOIN users owner_user ON owner_user.id = p.owner_id
LEFT JOIN users u ON u.id = fe.user_id
GROUP BY COALESCE(fe.user_id, p.owner_id), COALESCE(u.name, owner_user.name), date_trunc('month', fe.created_at)::date, fe.type, fe.status, fe.currency
ORDER BY entry_month DESC, host_or_user_name, fe.type, fe.status;
