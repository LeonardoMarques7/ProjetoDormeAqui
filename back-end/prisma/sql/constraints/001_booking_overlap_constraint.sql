-- Prevent overlapping active bookings for the same place.
--
-- Prisma does not currently model PostgreSQL exclusion constraints directly.
-- Apply this SQL in a future structural migration after the bookings table exists.
--
-- Covered statuses:
-- - CONFIRMED
-- - IN_PROGRESS
-- - EVALUATION
-- - REVIEW
--
-- PENDING is intentionally excluded because a pending checkout/payment flow
-- may expire or be rejected without blocking inventory permanently.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_active_overlap
  EXCLUDE USING gist (
    place_id WITH =,
    tstzrange(check_in, check_out, '[)') WITH &&
  )
  WHERE (status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW'));

ALTER TABLE bookings
  ADD CONSTRAINT bookings_valid_date_range
  CHECK (check_in < check_out);
