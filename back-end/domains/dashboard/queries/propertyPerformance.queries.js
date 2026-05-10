import { Prisma } from "@prisma/client";
import {
  HOST_FEE_RATE,
  activeBookingStatusesSql,
  CANCELLEDBookingStatusesSql,
} from "./queryFragments.js";

export const getPropertyPerformanceQuery = ({ hostId, monthStart, monthEnd, now }) => Prisma.sql`
  WITH property_bookings AS (
    SELECT
      p.id AS place_id,
      COUNT(b.id) FILTER (
        WHERE b.status IN (${activeBookingStatusesSql})
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      )::int AS active_bookings,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${monthStart}
          AND b.checkout <= ${monthEnd}
      ), 0)::numeric AS monthly_revenue,
      COALESCE(SUM(b.price_total * ${HOST_FEE_RATE}) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${monthStart}
          AND b.checkout <= ${monthEnd}
      ), 0)::numeric AS monthly_fees,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      ), 0)::numeric AS total_revenue,
      COALESCE(SUM(b.nights) FILTER (
        WHERE b.status NOT IN (${CANCELLEDBookingStatusesSql})
      ), 0)::numeric AS booked_nights,
      COALESCE(SUM(
        GREATEST(
          0,
          EXTRACT(
            DAY FROM LEAST(b.checkout, ${monthEnd}) - GREATEST(b.checkin, ${monthStart})
          )
        )
      ) FILTER (
        WHERE b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${monthStart}
          AND b.checkin <= ${monthEnd}
      ), 0)::numeric AS monthly_booked_nights,
      MIN(b.checkin) FILTER (
        WHERE b.status IN (${activeBookingStatusesSql})
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkin >= ${now}
      ) AS next_checkin,
      MIN(b.checkout) FILTER (
        WHERE b.status IN (${activeBookingStatusesSql})
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${now}
      ) AS next_checkout
    FROM places p
    LEFT JOIN bookings b ON b.place_id = p.id
    WHERE p.owner_id = ${hostId}
    GROUP BY p.id
  ),
  review_totals AS (
    SELECT
      r.place_id,
      COUNT(*)::int AS review_count,
      AVG(r.rating)::numeric AS average_review_rating
    FROM reviews r
    GROUP BY r.place_id
  )
  SELECT
    p.id,
    p.title,
    p.city,
    p.price,
    p.photos,
    p.perks,
    p.guests,
    p.rooms,
    p.beds,
    p.bathrooms,
    p.average_rating,
    COALESCE(rt.review_count, 0)::int AS review_count,
    p.is_active,
    pb.active_bookings,
    pb.monthly_revenue,
    pb.monthly_fees,
    (pb.monthly_revenue - pb.monthly_fees)::numeric AS monthly_net_revenue,
    pb.total_revenue,
    pb.booked_nights,
    pb.monthly_booked_nights,
    CASE
      WHEN (${monthEnd}::date - ${monthStart}::date + 1) = 0 THEN 0
      ELSE LEAST(100, ROUND((pb.monthly_booked_nights / (${monthEnd}::date - ${monthStart}::date + 1)) * 100))
    END::numeric AS occupancy_rate,
    CASE
      WHEN pb.booked_nights > 0 THEN ROUND(pb.total_revenue / pb.booked_nights)
      ELSE COALESCE(p.price, 0)
    END::numeric AS average_daily_rate,
    LEAST(pb.next_checkin, pb.next_checkout) AS next_event_date
  FROM places p
  INNER JOIN property_bookings pb ON pb.place_id = p.id
  LEFT JOIN review_totals rt ON rt.place_id = p.id
  WHERE p.owner_id = ${hostId}
  ORDER BY pb.monthly_revenue DESC, occupancy_rate DESC, p.title;
`;

