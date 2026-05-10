import { Prisma } from "@prisma/client";
import {
  HOST_FEE_RATE,
  activeBookingStatusesSql,
  CANCELLEDBookingStatusesSql,
} from "./queryFragments.js";

export const getHostDashboardSummaryQuery = ({
  hostId,
  now,
  todayStart,
  todayEnd,
  monthStart,
  monthEnd,
  previousMonthStart,
  previousMonthEnd,
}) => Prisma.sql`
  WITH host_places AS (
    SELECT
      p.id,
      p.average_rating,
      p.is_active
    FROM places p
    WHERE p.owner_id = ${hostId}
  ),
  host_bookings AS (
    SELECT
      b.*
    FROM bookings b
    INNER JOIN host_places p ON p.id = b.place_id
  ),
  booking_totals AS (
    SELECT
      COUNT(*)::int AS total_bookings,
      COUNT(*) FILTER (
        WHERE b.status = 'pending'
      )::int AS pending_bookings,
      COUNT(*) FILTER (
        WHERE b.status IN (${activeBookingStatusesSql})
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkin >= ${todayStart}
          AND b.checkin <= ${todayEnd}
      )::int AS checkins_today,
      COUNT(*) FILTER (
        WHERE b.status IN (${activeBookingStatusesSql})
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${todayStart}
          AND b.checkout <= ${todayEnd}
      )::int AS checkouts_today,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
      ), 0)::numeric AS approved_payments_total,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'pending'
      ), 0)::numeric AS pending_payments_total,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${monthStart}
          AND b.checkout <= LEAST(${todayEnd}, ${monthEnd})
      ), 0)::numeric AS monthly_gross_revenue,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${previousMonthStart}
          AND b.checkout <= ${previousMonthEnd}
      ), 0)::numeric AS previous_month_gross_revenue,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status = 'confirmed'
          AND b.checkin > ${todayEnd}
      ), 0)::numeric AS future_revenue,
      COALESCE(SUM(b.price_total * ${HOST_FEE_RATE}) FILTER (
        WHERE b.payment_status = 'approved'
      ), 0)::numeric AS total_platform_fees,
      COALESCE(SUM(b.price_total * ${HOST_FEE_RATE}) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.checkout >= ${previousMonthStart}
          AND b.checkout <= ${previousMonthEnd}
      ), 0)::numeric AS previous_month_platform_fees,
      COALESCE(SUM(b.nights) FILTER (
        WHERE b.status NOT IN (${CANCELLEDBookingStatusesSql})
      ), 0)::numeric AS total_nights,
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.status NOT IN (${CANCELLEDBookingStatusesSql})
          AND b.nights > 0
      ), 0)::numeric AS total_nights_price
    FROM host_bookings b
  ),
  occupancy AS (
    SELECT
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
      ), 0)::numeric AS occupied_nights
    FROM host_bookings b
  ),
  place_totals AS (
    SELECT
      COUNT(*)::int AS total_places,
      COUNT(*) FILTER (WHERE is_active = true)::int AS active_places,
      AVG(average_rating) FILTER (WHERE average_rating > 0)::numeric AS average_rating
    FROM host_places
  )
  SELECT
    pt.total_places,
    pt.active_places,
    pt.average_rating,
    bt.total_bookings,
    bt.pending_bookings,
    bt.checkins_today,
    bt.checkouts_today,
    bt.approved_payments_total,
    bt.pending_payments_total,
    bt.monthly_gross_revenue,
    bt.previous_month_gross_revenue,
    bt.future_revenue,
    bt.total_platform_fees,
    bt.previous_month_platform_fees,
    bt.total_nights,
    bt.total_nights_price,
    o.occupied_nights,
    (pt.total_places * (${monthEnd}::date - ${monthStart}::date + 1))::int AS capacity_nights
  FROM place_totals pt
  CROSS JOIN booking_totals bt
  CROSS JOIN occupancy o;
`;
