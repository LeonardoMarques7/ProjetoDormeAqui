import { Prisma } from "@prisma/client";
import { CANCELLEDBookingStatusesSql } from "./queryFragments.js";

export const getMonthlyOccupancySeriesQuery = ({ hostId, startMonth, endMonth }) => Prisma.sql`
  WITH months AS (
    SELECT
      generate_series(
        date_trunc('month', ${startMonth}::timestamp),
        date_trunc('month', ${endMonth}::timestamp),
        interval '1 month'
      )::date AS month_start
  ),
  month_bounds AS (
    SELECT
      month_start,
      (month_start + interval '1 month')::date AS next_month_start
    FROM months
  ),
  place_count AS (
    SELECT COUNT(*)::int AS total_places
    FROM places
    WHERE owner_id = ${hostId}
  ),
  booked AS (
    SELECT
      mb.month_start,
      SUM(
        GREATEST(
          0,
          EXTRACT(
            DAY FROM LEAST(b.checkout, mb.next_month_start) - GREATEST(b.checkin, mb.month_start)
          )
        )
      )::numeric AS booked_nights,
      COUNT(DISTINCT b.id)::int AS reservations
    FROM month_bounds mb
    INNER JOIN bookings b
      ON b.checkout > mb.month_start
      AND b.checkin < mb.next_month_start
    INNER JOIN places p ON p.id = b.place_id
    WHERE p.owner_id = ${hostId}
      AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
    GROUP BY mb.month_start
  )
  SELECT
    to_char(mb.month_start, 'YYYY-MM') AS month_key,
    mb.month_start,
    COALESCE(b.booked_nights, 0)::numeric AS booked_nights,
    COALESCE(b.reservations, 0)::int AS reservations,
    (pc.total_places * (mb.next_month_start - mb.month_start))::int AS capacity_nights,
    CASE
      WHEN pc.total_places = 0 THEN 0
      ELSE ROUND(
        (COALESCE(b.booked_nights, 0) / NULLIF(pc.total_places * (mb.next_month_start - mb.month_start), 0)) * 100
      )
    END::numeric AS occupancy_rate
  FROM month_bounds mb
  CROSS JOIN place_count pc
  LEFT JOIN booked b ON b.month_start = mb.month_start
  ORDER BY mb.month_start;
`;

export const getEmptyDaysQuery = ({ hostId, monthStart, monthEnd }) => Prisma.sql`
  WITH month_days AS (
    SELECT generate_series(${monthStart}::date, ${monthEnd}::date, interval '1 day')::date AS day
  ),
  occupied_days AS (
    SELECT DISTINCT occupied.day::date
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    CROSS JOIN LATERAL generate_series(
      b.checkin::date,
      (b.checkout::date - interval '1 day')::date,
      interval '1 day'
    ) AS occupied(day)
    WHERE p.owner_id = ${hostId}
      AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      AND occupied.day >= ${monthStart}::date
      AND occupied.day <= ${monthEnd}::date
  )
  SELECT
    md.day,
    to_char(md.day, 'YYYY-MM-DD') AS iso_day,
    trim(to_char(md.day, 'day')) AS weekday
  FROM month_days md
  LEFT JOIN occupied_days od ON od.day = md.day
  WHERE od.day IS NULL
  ORDER BY md.day;
`;

