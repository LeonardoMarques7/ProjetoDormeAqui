ALTER TABLE "places"
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10, 7);

CREATE INDEX IF NOT EXISTS "places_latitude_idx"
  ON "places"("latitude");

CREATE INDEX IF NOT EXISTS "places_longitude_idx"
  ON "places"("longitude");
