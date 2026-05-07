-- Reservas do anfitriao para calendario, movimentos e payload de compatibilidade.

CREATE OR REPLACE FUNCTION fn_host_dashboard_bookings(
  p_host_id uuid,
  p_date_from timestamp DEFAULT NULL,
  p_date_to timestamp DEFAULT NULL,
  p_limit integer DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  legacy_mongo_id text,
  place_id uuid,
  guest_id uuid,
  check_in timestamp,
  check_out timestamp,
  guests integer,
  nights integer,
  price_per_night numeric,
  total_price numeric,
  status text,
  created_at timestamp,
  updated_at timestamp,
  place_title text,
  place_city text,
  place_check_in_time text,
  place_check_out_time text,
  place_status text,
  place_photo_url text,
  guest_name text,
  guest_email text,
  guest_photo_url text,
  payment_status text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    b.legacy_mongo_id,
    b.place_id,
    b.guest_id,
    b.check_in,
    b.check_out,
    b.guests,
    b.nights,
    b.price_per_night,
    b.total_price,
    b.status::text,
    b.created_at,
    b.updated_at,
    p.title AS place_title,
    p.city AS place_city,
    p.check_in_time AS place_check_in_time,
    p.check_out_time AS place_check_out_time,
    p.status::text AS place_status,
    first_photo.url AS place_photo_url,
    u.name AS guest_name,
    u.email AS guest_email,
    up.photo_url AS guest_photo_url,
    COALESCE(latest_payment.status::text, b.legacy_payment_status, 'PENDING') AS payment_status
  FROM bookings b
  JOIN places p ON p.id = b.place_id
  JOIN users u ON u.id = b.guest_id
  LEFT JOIN user_profiles up ON up.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT pay.status
    FROM payments pay
    WHERE pay.booking_id = b.id
    ORDER BY pay.created_at DESC
    LIMIT 1
  ) latest_payment ON true
  LEFT JOIN LATERAL (
    SELECT pp.url
    FROM place_photos pp
    WHERE pp.place_id = p.id
    ORDER BY pp.kind DESC, pp.sort_order ASC, pp.created_at ASC
    LIMIT 1
  ) first_photo ON true
  WHERE (p_host_id IS NULL OR p.owner_id = p_host_id)
    AND (p_date_from IS NULL OR b.check_out >= p_date_from)
    AND (p_date_to IS NULL OR b.check_in <= p_date_to)
  ORDER BY b.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 500), 1), 2000);
$$;
