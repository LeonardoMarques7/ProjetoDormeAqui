import { Prisma } from "@prisma/client";
import { CANCELLEDBookingStatusesSql } from "./queryFragments.js";

export const getRevenueSeriesQuery = ({ hostId, startMonth, endMonth }) => Prisma.sql`
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', ${startMonth}::timestamp),
      date_trunc('month', ${endMonth}::timestamp),
      interval '1 month'
    )::date AS month_start
  ),
  revenue AS (
    SELECT
      date_trunc('month', b.checkout)::date AS month_start,
      SUM(b.price_total)::numeric AS revenue
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    WHERE p.owner_id = ${hostId}
      AND b.payment_status = 'approved'
      AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      AND b.checkout >= date_trunc('month', ${startMonth}::timestamp)
      AND b.checkout < date_trunc('month', ${endMonth}::timestamp) + interval '1 month'
    GROUP BY 1
  )
  SELECT
    to_char(m.month_start, 'YYYY-MM') AS month_key,
    m.month_start,
    COALESCE(r.revenue, 0)::numeric AS revenue
  FROM months m
  LEFT JOIN revenue r ON r.month_start = m.month_start
  ORDER BY m.month_start;
`;

export const getRevenueProjectionQuery = ({ hostId, startMonth, endMonth }) => Prisma.sql`
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', ${startMonth}::timestamp),
      date_trunc('month', ${endMonth}::timestamp),
      interval '1 month'
    )::date AS month_start
  ),
  revenue AS (
    SELECT
      date_trunc('month', b.checkout)::date AS month_start,
      SUM(b.price_total)::numeric AS revenue
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    WHERE p.owner_id = ${hostId}
      AND b.payment_status = 'approved'
      AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      AND b.checkout >= date_trunc('month', ${startMonth}::timestamp)
      AND b.checkout < date_trunc('month', ${endMonth}::timestamp) + interval '1 month'
    GROUP BY 1
  ),
  monthly AS (
    SELECT
      to_char(m.month_start, 'YYYY-MM') AS month_key,
      m.month_start,
      COALESCE(r.revenue, 0)::numeric AS revenue
    FROM months m
    LEFT JOIN revenue r ON r.month_start = m.month_start
  ),
  with_previous AS (
    SELECT
      monthly.*,
      LAG(revenue) OVER (ORDER BY month_start) AS previous_revenue
    FROM monthly
  )
  SELECT
    *,
    CASE
      WHEN previous_revenue > 0 THEN revenue + ((revenue - previous_revenue) / previous_revenue) * revenue
      ELSE revenue
    END AS projected_next_month_revenue
  FROM with_previous
  ORDER BY month_start;
`;
