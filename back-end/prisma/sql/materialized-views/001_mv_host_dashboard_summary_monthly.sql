-- Snapshot mensal consolidado para Dashboard/Central do Anfitriao.
-- Nao altera dados transacionais.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_host_dashboard_summary_monthly AS
SELECT
  host_id,
  host_name,
  summary_month,
  places_count,
  active_places_count,
  bookings_count,
  operational_bookings_count,
  inactive_bookings_count,
  booked_nights,
  booking_gross_revenue,
  payments_count,
  approved_payments_count,
  approved_payment_gross,
  refunded_amount,
  approved_payment_net,
  reviews_count,
  average_rating,
  now() AS refreshed_at
FROM v_host_dashboard_summary_monthly;
