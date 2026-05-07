CREATE OR REPLACE FUNCTION get_host_dashboard_kpis(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(
  gross_revenue numeric,
  net_revenue numeric,
  booking_count bigint,
  future_booking_count bigint,
  average_occupancy_rate numeric,
  average_daily_rate numeric,
  average_rating numeric,
  active_place_count bigint,
  approved_payment_amount numeric,
  pending_payment_amount numeric,
  expense_amount numeric,
  refund_amount numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH host_places AS (
    SELECT id, price_per_night
    FROM places
    WHERE owner_id = p_host_id
  ),
  period_bookings AS (
    SELECT b.*
    FROM bookings b
    JOIN host_places hp ON hp.id = b.place_id
    WHERE b.created_at::date BETWEEN p_from AND p_to
  ),
  period_payments AS (
    SELECT pay.*
    FROM payments pay
    JOIN period_bookings b ON b.id = pay.booking_id
  ),
  period_entries AS (
    SELECT fe.*
    FROM financial_entries fe
    WHERE fe.user_id = p_host_id
      AND fe.created_at::date BETWEEN p_from AND p_to
  ),
  review_summary AS (
    SELECT AVG(r.rating)::numeric AS average_rating
    FROM reviews r
    JOIN host_places hp ON hp.id = r.place_id
  )
  SELECT
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')), 0) AS gross_revenue,
    COALESCE(SUM(fe.amount) FILTER (WHERE fe.type IN ('HOST_PAYOUT', 'CHARGE')), 0)
      - COALESCE(SUM(fe.amount) FILTER (WHERE fe.type IN ('PLATFORM_FEE', 'REFUND', 'PENALTY')), 0) AS net_revenue,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')) AS booking_count,
    COUNT(DISTINCT future_b.id) AS future_booking_count,
    0::numeric AS average_occupancy_rate,
    COALESCE(AVG(b.price_per_night), AVG(hp.price_per_night), 0) AS average_daily_rate,
    COALESCE(MAX(rs.average_rating), 0) AS average_rating,
    COUNT(DISTINCT hp.id) FILTER (WHERE p.status = 'ACTIVE') AS active_place_count,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'APPROVED'), 0) AS approved_payment_amount,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status IN ('PENDING', 'PROCESSING')), 0) AS pending_payment_amount,
    COALESCE(SUM(fe.amount) FILTER (WHERE fe.type IN ('PLATFORM_FEE', 'PENALTY', 'ADJUSTMENT')), 0) AS expense_amount,
    COALESCE(SUM(pay.amount_refunded), 0) AS refund_amount
  FROM host_places hp
  JOIN places p ON p.id = hp.id
  LEFT JOIN period_bookings b ON b.place_id = hp.id
  LEFT JOIN period_payments pay ON pay.booking_id = b.id
  LEFT JOIN period_entries fe ON fe.place_id = hp.id OR fe.user_id = p_host_id
  LEFT JOIN bookings future_b ON future_b.place_id = hp.id
    AND future_b.check_in::date > CURRENT_DATE
    AND future_b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')
  CROSS JOIN review_summary rs
  GROUP BY rs.average_rating;
$$;

CREATE OR REPLACE FUNCTION get_host_revenue_series(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(period_start date, gross_revenue numeric, net_revenue numeric, booking_count bigint)
LANGUAGE sql
STABLE
AS $$
  WITH months AS (
    SELECT generate_series(date_trunc('month', p_from)::date, date_trunc('month', p_to)::date, interval '1 month')::date AS period_start
  ),
  booking_revenue AS (
    SELECT
      date_trunc('month', b.created_at)::date AS period_start,
      SUM(b.total_price) AS gross_revenue,
      COUNT(*) AS booking_count
    FROM bookings b
    JOIN places p ON p.id = b.place_id
    WHERE p.owner_id = p_host_id
      AND b.created_at::date BETWEEN p_from AND p_to
      AND b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')
    GROUP BY 1
  ),
  financial AS (
    SELECT
      date_trunc('month', fe.created_at)::date AS period_start,
      COALESCE(SUM(fe.amount) FILTER (WHERE fe.type IN ('HOST_PAYOUT', 'CHARGE')), 0)
        - COALESCE(SUM(fe.amount) FILTER (WHERE fe.type IN ('PLATFORM_FEE', 'REFUND', 'PENALTY')), 0) AS net_revenue
    FROM financial_entries fe
    WHERE fe.user_id = p_host_id
      AND fe.created_at::date BETWEEN p_from AND p_to
    GROUP BY 1
  )
  SELECT
    m.period_start,
    COALESCE(br.gross_revenue, 0),
    COALESCE(financial.net_revenue, COALESCE(br.gross_revenue, 0)),
    COALESCE(br.booking_count, 0)
  FROM months m
  LEFT JOIN booking_revenue br ON br.period_start = m.period_start
  LEFT JOIN financial ON financial.period_start = m.period_start
  ORDER BY m.period_start;
$$;

CREATE OR REPLACE FUNCTION get_host_occupancy_series(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(period_start date, reserved_nights bigint, available_nights bigint, occupancy_rate numeric)
LANGUAGE sql
STABLE
AS $$
  WITH months AS (
    SELECT generate_series(date_trunc('month', p_from)::date, date_trunc('month', p_to)::date, interval '1 month')::date AS period_start
  ),
  active_places AS (
    SELECT id
    FROM places
    WHERE owner_id = p_host_id
      AND status = 'ACTIVE'
  ),
  reserved AS (
    SELECT
      date_trunc('month', gs)::date AS period_start,
      COUNT(*) AS reserved_nights
    FROM bookings b
    JOIN active_places ap ON ap.id = b.place_id
    CROSS JOIN LATERAL generate_series(
      GREATEST(b.check_in::date, p_from),
      LEAST(b.check_out::date - 1, p_to),
      interval '1 day'
    ) AS gs
    WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')
      AND b.check_in::date <= p_to
      AND b.check_out::date >= p_from
    GROUP BY 1
  ),
  capacity AS (
    SELECT
      m.period_start,
      (COUNT(ap.id) * EXTRACT(day FROM (m.period_start + interval '1 month - 1 day'))::int)::bigint AS available_nights
    FROM months m
    CROSS JOIN active_places ap
    GROUP BY m.period_start
  )
  SELECT
    m.period_start,
    COALESCE(r.reserved_nights, 0),
    COALESCE(c.available_nights, 0),
    CASE WHEN COALESCE(c.available_nights, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(r.reserved_nights, 0)::numeric / c.available_nights::numeric) * 100, 2)
    END
  FROM months m
  LEFT JOIN reserved r ON r.period_start = m.period_start
  LEFT JOIN capacity c ON c.period_start = m.period_start
  ORDER BY m.period_start;
$$;

CREATE OR REPLACE FUNCTION get_host_property_ranking(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(place_id uuid, title text, city text, gross_revenue numeric, booking_count bigint, average_rating numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.city,
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')), 0) AS gross_revenue,
    COUNT(b.id) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')) AS booking_count,
    COALESCE(AVG(r.rating), p.average_rating, 0) AS average_rating
  FROM places p
  LEFT JOIN bookings b ON b.place_id = p.id
    AND b.created_at::date BETWEEN p_from AND p_to
  LEFT JOIN reviews r ON r.place_id = p.id
  WHERE p.owner_id = p_host_id
  GROUP BY p.id, p.title, p.city, p.average_rating
  ORDER BY gross_revenue DESC, booking_count DESC, p.title;
$$;

CREATE OR REPLACE FUNCTION get_host_booking_status_summary(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(status text, booking_count bigint, gross_revenue numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.status::text,
    COUNT(*) AS booking_count,
    COALESCE(SUM(b.total_price), 0) AS gross_revenue
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  WHERE p.owner_id = p_host_id
    AND b.created_at::date BETWEEN p_from AND p_to
  GROUP BY b.status
  ORDER BY booking_count DESC;
$$;

CREATE OR REPLACE FUNCTION get_host_payment_status_summary(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(status text, payment_count bigint, amount numeric, amount_refunded numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pay.status::text,
    COUNT(*) AS payment_count,
    COALESCE(SUM(pay.amount), 0) AS amount,
    COALESCE(SUM(pay.amount_refunded), 0) AS amount_refunded
  FROM payments pay
  JOIN bookings b ON b.id = pay.booking_id
  JOIN places p ON p.id = b.place_id
  WHERE p.owner_id = p_host_id
    AND pay.created_at::date BETWEEN p_from AND p_to
  GROUP BY pay.status
  ORDER BY payment_count DESC;
$$;

CREATE OR REPLACE FUNCTION get_host_financial_summary(
  p_host_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(type text, status text, amount numeric, entry_count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    fe.type::text,
    fe.status::text,
    COALESCE(SUM(fe.amount), 0) AS amount,
    COUNT(*) AS entry_count
  FROM financial_entries fe
  WHERE fe.user_id = p_host_id
    AND fe.created_at::date BETWEEN p_from AND p_to
  GROUP BY fe.type, fe.status
  ORDER BY fe.type, fe.status;
$$;
