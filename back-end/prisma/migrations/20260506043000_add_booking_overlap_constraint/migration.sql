-- Advanced availability constraint for bookings.
--
-- Apply this migration only after the legacy source data has been migrated
-- and booking overlap reports have been reviewed and resolved.
--
-- Historical source exports may contain overlapping bookings for the same place.
-- Keeping this exclusion constraint outside the initial schema migration allows
-- the historical data load to complete first, then lets the team clean or
-- intentionally archive conflicting records before enforcing availability.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_active_overlap"
  EXCLUDE USING gist (
    "place_id" WITH =,
    tsrange("check_in", "check_out", '[)') WITH &&
  )
  WHERE ("status" IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW'));
