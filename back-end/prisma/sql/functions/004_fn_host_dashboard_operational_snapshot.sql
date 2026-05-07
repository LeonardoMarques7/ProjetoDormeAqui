-- Snapshot operacional parametrizado para cards do dashboard.

CREATE OR REPLACE FUNCTION fn_host_dashboard_operational_snapshot(
  p_host_id uuid,
  p_today_start timestamp,
  p_today_end timestamp,
  p_month_start timestamp,
  p_month_end timestamp
)
RETURNS TABLE (
  total_bookings integer,
  pending_bookings integer,
  checkins_today integer,
  checkouts_today integer,
  future_revenue numeric,
  approved_payments_total numeric,
  pending_payments_total numeric,
  month_booking_revenue numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(DISTINCT b.id)::int AS total_bookings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'PENDING')::int AS pending_bookings,
    COUNT(DISTINCT b.id) FILTER (
      WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
        AND b.check_in >= p_today_start
        AND b.check_in <= p_today_end
    )::int AS checkins_today,
    COUNT(DISTINCT b.id) FILTER (
      WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
        AND b.check_out >= p_today_start
        AND b.check_out <= p_today_end
    )::int AS checkouts_today,
    COALESCE(SUM(b.total_price) FILTER (
      WHERE b.status = 'CONFIRMED'
        AND b.check_in > p_today_end
    ), 0)::numeric AS future_revenue,
    COALESCE(SUM(pay.amount - pay.amount_refunded) FILTER (
      WHERE pay.status = 'APPROVED'
    ), 0)::numeric AS approved_payments_total,
    COALESCE(SUM(pay.amount - pay.amount_refunded) FILTER (
      WHERE pay.status = 'PENDING'
    ), 0)::numeric AS pending_payments_total,
    COALESCE(SUM(b.total_price) FILTER (
      WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
        AND b.check_out >= p_month_start
        AND b.check_out <= p_month_end
    ), 0)::numeric AS month_booking_revenue
  FROM places p
  LEFT JOIN bookings b ON b.place_id = p.id
  LEFT JOIN payments pay ON pay.booking_id = b.id
  WHERE (p_host_id IS NULL OR p.owner_id = p_host_id);
$$;
