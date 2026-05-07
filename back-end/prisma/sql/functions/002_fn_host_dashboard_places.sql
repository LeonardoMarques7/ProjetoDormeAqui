-- Acomodacoes do anfitriao com foto principal e metadados de dashboard.

CREATE OR REPLACE FUNCTION fn_host_dashboard_places(
  p_host_id uuid,
  p_limit integer DEFAULT 250
)
RETURNS TABLE (
  id uuid,
  legacy_mongo_id text,
  host_id uuid,
  title text,
  city text,
  type text,
  price_per_night numeric,
  check_in_time text,
  check_out_time text,
  max_guests integer,
  rooms integer,
  beds integer,
  bathrooms integer,
  status text,
  average_rating numeric,
  photo_url text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.legacy_mongo_id,
    p.owner_id AS host_id,
    p.title,
    p.city,
    p.type,
    p.price_per_night,
    p.check_in_time,
    p.check_out_time,
    p.max_guests,
    p.rooms,
    p.beds,
    p.bathrooms,
    p.status::text,
    p.average_rating,
    first_photo.url AS photo_url
  FROM places p
  LEFT JOIN LATERAL (
    SELECT pp.url
    FROM place_photos pp
    WHERE pp.place_id = p.id
    ORDER BY pp.kind DESC, pp.sort_order ASC, pp.created_at ASC
    LIMIT 1
  ) first_photo ON true
  WHERE (p_host_id IS NULL OR p.owner_id = p_host_id)
  ORDER BY p.status, p.title
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 250), 1), 1000);
$$;
