-- Resumo mensal consolidado por anfitriao.

CREATE OR REPLACE FUNCTION fn_host_dashboard_summary_monthly(
  p_host_id uuid,
  p_month_from date DEFAULT NULL,
  p_month_to date DEFAULT NULL,
  p_limit integer DEFAULT 24
)
RETURNS TABLE (
  host_id uuid,
  host_name text,
  summary_month date,
  places_count bigint,
  active_places_count bigint,
  bookings_count bigint,
  operational_bookings_count bigint,
  inactive_bookings_count bigint,
  booked_nights numeric,
  booking_gross_revenue numeric,
  payments_count bigint,
  approved_payments_count bigint,
  approved_payment_gross numeric,
  refunded_amount numeric,
  approved_payment_net numeric,
  reviews_count bigint,
  average_rating numeric,
  refreshed_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    mv.host_id,
    mv.host_name,
    mv.summary_month,
    mv.places_count,
    mv.active_places_count,
    mv.bookings_count,
    mv.operational_bookings_count,
    mv.inactive_bookings_count,
    mv.booked_nights,
    mv.booking_gross_revenue,
    mv.payments_count,
    mv.approved_payments_count,
    mv.approved_payment_gross,
    mv.refunded_amount,
    mv.approved_payment_net,
    mv.reviews_count,
    mv.average_rating,
    mv.refreshed_at
  FROM mv_host_dashboard_summary_monthly mv
  WHERE (p_host_id IS NULL OR mv.host_id = p_host_id)
    AND (p_month_from IS NULL OR mv.summary_month >= p_month_from)
    AND (p_month_to IS NULL OR mv.summary_month <= p_month_to)
  ORDER BY mv.summary_month DESC, mv.host_name
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 24), 1), 120);
$$;
