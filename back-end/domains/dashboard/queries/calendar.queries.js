import { Prisma } from "@prisma/client";
import { activeBookingStatusesSql, CANCELLEDBookingStatusesSql } from "./queryFragments.js";

export const getCalendarEventsQuery = ({ hostId, periodStart, periodEnd }) => Prisma.sql`
  WITH host_bookings AS (
    SELECT
      b.id,
      b.user_id,
      b.place_id,
      b.checkin,
      b.checkout,
      b.guests,
      b.nights,
      b.status,
      b.payment_status,
      b.price_total,
      p.title AS place_title,
      p.city AS place_city,
      p.checkin AS place_checkin,
      p.checkout AS place_checkout,
      p.photos AS place_photos,
      u.name AS guest_name,
      u.email AS guest_email,
      u.photo AS guest_photo
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    LEFT JOIN users u ON u.id = b.user_id
    WHERE p.owner_id = ${hostId}
      AND b.checkout >= ${periodStart}
      AND b.checkin <= ${periodEnd}
  ),
  movement_events AS (
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_checkin,
      place_checkout,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      'checkin'::text AS event_type,
      checkin::date AS event_date
    FROM host_bookings
    UNION ALL
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_checkin,
      place_checkout,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      'checkout'::text AS event_type,
      checkout::date AS event_date
    FROM host_bookings
  ),
  stay_events AS (
    SELECT
      hb.id,
      hb.user_id,
      hb.place_id,
      hb.checkin,
      hb.checkout,
      hb.guests,
      hb.nights,
      hb.status,
      hb.payment_status,
      hb.price_total,
      hb.place_title,
      hb.place_city,
      hb.place_checkin,
      hb.place_checkout,
      hb.place_photos,
      hb.guest_name,
      hb.guest_email,
      hb.guest_photo,
      'stay'::text AS event_type,
      stay.day::date AS event_date
    FROM host_bookings hb
    CROSS JOIN LATERAL generate_series(
      hb.checkin::date + interval '1 day',
      hb.checkout::date - interval '1 day',
      interval '1 day'
    ) AS stay(day)
  )
  SELECT
    id,
    user_id,
    place_id,
    checkin,
    checkout,
    guests,
    nights,
    status,
    payment_status,
    price_total,
    place_title,
    place_city,
    place_checkin,
    place_checkout,
    place_photos,
    guest_name,
    guest_email,
    guest_photo,
    event_type,
    event_date
  FROM (
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_checkin,
      place_checkout,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      event_type,
      event_date
    FROM movement_events
    UNION ALL
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_checkin,
      place_checkout,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      event_type,
      event_date
    FROM stay_events
  ) events
  WHERE event_date >= ${periodStart}::date
    AND event_date <= ${periodEnd}::date
  ORDER BY event_date, event_type;
`;

export const getUpcomingMovementsQuery = ({ hostId, now, limit = 12 }) => Prisma.sql`
  WITH host_bookings AS (
    SELECT
      b.id,
      b.user_id,
      b.place_id,
      b.checkin,
      b.checkout,
      b.guests,
      b.nights,
      b.status,
      b.payment_status,
      b.price_total,
      p.title AS place_title,
      p.city AS place_city,
      p.photos AS place_photos,
      u.name AS guest_name,
      u.email AS guest_email,
      u.photo AS guest_photo
    FROM bookings b
    INNER JOIN places p ON p.id = b.place_id
    LEFT JOIN users u ON u.id = b.user_id
    WHERE p.owner_id = ${hostId}
      AND b.status IN (${activeBookingStatusesSql})
      AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
  ),
  movements AS (
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      'checkin'::text AS event_type,
      checkin AS event_date
    FROM host_bookings
    WHERE checkin >= ${now}
    UNION ALL
    SELECT
      id,
      user_id,
      place_id,
      checkin,
      checkout,
      guests,
      nights,
      status,
      payment_status,
      price_total,
      place_title,
      place_city,
      place_photos,
      guest_name,
      guest_email,
      guest_photo,
      'checkout'::text AS event_type,
      checkout AS event_date
    FROM host_bookings
    WHERE checkout >= ${now}
  )
  SELECT
    id,
    user_id,
    place_id,
    checkin,
    checkout,
    guests,
    nights,
    status,
    payment_status,
    price_total,
    place_title,
    place_city,
    place_photos,
    guest_name,
    guest_email,
    guest_photo,
    event_type,
    event_date
  FROM movements
  ORDER BY event_date
  LIMIT ${limit};
`;
