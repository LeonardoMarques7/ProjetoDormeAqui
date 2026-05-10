CREATE OR REPLACE FUNCTION get_place_booked_dates(p_place_id uuid)
RETURNS TABLE(booked_date date)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT gs::date AS booked_date
  FROM bookings b
  CROSS JOIN LATERAL generate_series(
    b.check_in::date,
    GREATEST(b.check_in::date, b.check_out::date - 1),
    interval '1 day'
  ) AS gs
  WHERE b.place_id = p_place_id
    AND b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')
  ORDER BY booked_date;
$$;

CREATE OR REPLACE FUNCTION get_host_calendar_events(
  p_host_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
RETURNS TABLE(
  booking_id uuid,
  place_id uuid,
  place_title text,
  guest_id uuid,
  guest_name text,
  check_in timestamptz,
  check_out timestamptz,
  status text,
  total_price numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    p.id,
    p.title,
    u.id,
    u.name,
    b.check_in,
    b.check_out,
    b.status::text,
    b.total_price
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  JOIN users u ON u.id = b.guest_id
  WHERE p.owner_id = p_host_id
    AND b.check_in < p_to
    AND b.check_out > p_from
    AND b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')
  ORDER BY b.check_in, p.title;
$$;

CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id uuid)
RETURNS TABLE(
  booking_id uuid,
  place_id uuid,
  place_title text,
  check_in timestamptz,
  check_out timestamptz,
  guests integer,
  nights integer,
  status text,
  payment_status text,
  total_price numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    p.id,
    p.title,
    b.check_in,
    b.check_out,
    b.guests,
    b.nights,
    b.status::text,
    COALESCE(latest_payment.status::text, b.legacy_payment_status, 'PENDING') AS payment_status,
    b.total_price
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  LEFT JOIN LATERAL (
    SELECT pay.status
    FROM payments pay
    WHERE pay.booking_id = b.id
    ORDER BY pay.created_at DESC
    LIMIT 1
  ) latest_payment ON true
  WHERE b.guest_id = p_user_id
  ORDER BY b.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION get_booking_details(p_booking_id uuid)
RETURNS TABLE(
  booking_id uuid,
  place_id uuid,
  place_title text,
  host_id uuid,
  host_name text,
  guest_id uuid,
  guest_name text,
  check_in timestamptz,
  check_out timestamptz,
  guests integer,
  nights integer,
  status text,
  payment_status text,
  total_price numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    p.id,
    p.title,
    host.id,
    host.name,
    guest.id,
    guest.name,
    b.check_in,
    b.check_out,
    b.guests,
    b.nights,
    b.status::text,
    COALESCE(latest_payment.status::text, b.legacy_payment_status, 'PENDING') AS payment_status,
    b.total_price
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  JOIN users host ON host.id = p.owner_id
  JOIN users guest ON guest.id = b.guest_id
  LEFT JOIN LATERAL (
    SELECT pay.status
    FROM payments pay
    WHERE pay.booking_id = b.id
    ORDER BY pay.created_at DESC
    LIMIT 1
  ) latest_payment ON true
  WHERE b.id = p_booking_id;
$$;

CREATE OR REPLACE FUNCTION get_host_places_summary(p_host_id uuid)
RETURNS TABLE(
  place_id uuid,
  title text,
  city text,
  status text,
  price_per_night numeric,
  booking_count bigint,
  gross_revenue numeric,
  average_rating numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.city,
    p.status::text,
    p.price_per_night,
    COUNT(b.id) AS booking_count,
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED', 'ARCHIVED')), 0) AS gross_revenue,
    COALESCE(AVG(r.rating), p.average_rating) AS average_rating
  FROM places p
  LEFT JOIN bookings b ON b.place_id = p.id
  LEFT JOIN reviews r ON r.place_id = p.id
  WHERE p.owner_id = p_host_id
  GROUP BY p.id, p.title, p.city, p.status, p.price_per_night, p.average_rating
  ORDER BY gross_revenue DESC, p.created_at DESC;
$$;

