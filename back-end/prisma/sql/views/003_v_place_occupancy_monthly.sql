-- Ocupacao mensal por acomodacao.

CREATE OR REPLACE VIEW v_place_occupancy_monthly AS
WITH bounds AS (
  SELECT
    COALESCE(date_trunc('month', MIN(check_in))::date, date_trunc('month', CURRENT_DATE)::date) AS first_month,
    COALESCE(date_trunc('month', MAX(check_out))::date, date_trunc('month', CURRENT_DATE)::date) AS last_month
  FROM bookings
),
months AS (
  SELECT generate_series(first_month, last_month, interval '1 month')::date AS month_start
  FROM bounds
),
place_months AS (
  SELECT
    p.id AS place_id,
    p.owner_id AS host_id,
    p.title AS place_title,
    p.city,
    m.month_start,
    (m.month_start + interval '1 month')::date AS next_month_start
  FROM places p
  CROSS JOIN months m
),
occupied AS (
  SELECT
    pm.place_id,
    pm.month_start,
    SUM(
      GREATEST(
        0,
        LEAST(b.check_out::date, pm.next_month_start) - GREATEST(b.check_in::date, pm.month_start)
      )
    ) AS occupied_nights
  FROM place_months pm
  LEFT JOIN bookings b
    ON b.place_id = pm.place_id
   AND b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')
   AND b.check_in::date < pm.next_month_start
   AND b.check_out::date > pm.month_start
  GROUP BY pm.place_id, pm.month_start
)
SELECT
  pm.host_id,
  u.name AS host_name,
  pm.place_id,
  pm.place_title,
  pm.city,
  pm.month_start AS occupancy_month,
  COALESCE(o.occupied_nights, 0) AS occupied_nights,
  (pm.next_month_start - pm.month_start) AS available_nights,
  ROUND(
    (COALESCE(o.occupied_nights, 0)::numeric / NULLIF((pm.next_month_start - pm.month_start), 0)) * 100,
    2
  ) AS occupancy_rate_percent
FROM place_months pm
JOIN users u ON u.id = pm.host_id
LEFT JOIN occupied o
  ON o.place_id = pm.place_id
 AND o.month_start = pm.month_start;
