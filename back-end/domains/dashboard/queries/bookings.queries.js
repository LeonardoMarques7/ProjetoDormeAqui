import { Prisma } from "@prisma/client";
import { CANCELLEDBookingStatusesSql } from "./queryFragments.js";

export const getBookingStatusReportQuery = ({ hostId, periodStart, periodEnd, now }) => Prisma.sql`
  WITH host_bookings AS (
    SELECT b.*
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    WHERE p.owner_id = ${hostId}
      AND b.checkout >= ${periodStart}
      AND b.checkin <= ${periodEnd}
  )
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
    COUNT(*) FILTER (WHERE status = 'confirmed')::int AS approved,
    COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
    COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
    COUNT(*) FILTER (WHERE status IN (${CANCELLEDBookingStatusesSql}))::int AS CANCELLED,
    COUNT(*) FILTER (
      WHERE checkin >= ${periodStart}
        AND checkin <= ${periodEnd}
        AND checkin <= ${now}
    )::int AS checkins_done,
    COUNT(*) FILTER (
      WHERE checkout >= ${periodStart}
        AND checkout <= ${periodEnd}
        AND checkout <= ${now}
    )::int AS checkouts_done,
    COALESCE(SUM(nights) FILTER (
      WHERE status NOT IN (${CANCELLEDBookingStatusesSql})
    ), 0)::numeric AS nights_reserved
  FROM host_bookings;
`;

export const getBookingsByStatusQuery = ({ hostId, periodStart, periodEnd }) => Prisma.sql`
  SELECT
    b.status,
    COUNT(*)::int AS total
  FROM bookings b
  INNER JOIN places p ON p.id = b.place_id
  WHERE p.owner_id = ${hostId}
    AND b.checkout >= ${periodStart}
    AND b.checkin <= ${periodEnd}
  GROUP BY b.status
  ORDER BY b.status;
`;

export const getRecentPaymentsQuery = ({ hostId, limit = 30 }) => Prisma.sql`
  SELECT
    b.id,
    b.id AS booking_id,
    b.payment_status,
    b.price_total,
    COALESCE(b.updated_at, b.created_at, b.checkin) AS event_date,
    p.title AS place_title,
    u.name AS guest_name
  FROM bookings b
  INNER JOIN places p ON p.id = b.place_id
  LEFT JOIN users u ON u.id = b.user_id
  WHERE p.owner_id = ${hostId}
  ORDER BY COALESCE(b.updated_at, b.created_at, b.checkin) DESC
  LIMIT ${limit};
`;

