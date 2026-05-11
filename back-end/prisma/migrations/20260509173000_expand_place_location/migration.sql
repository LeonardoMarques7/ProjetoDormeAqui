ALTER TABLE "places"
  ADD COLUMN IF NOT EXISTS "address_street" TEXT,
  ADD COLUMN IF NOT EXISTS "address_number" TEXT,
  ADD COLUMN IF NOT EXISTS "address_complement" TEXT,
  ADD COLUMN IF NOT EXISTS "address_neighborhood" TEXT,
  ADD COLUMN IF NOT EXISTS "address_city" TEXT,
  ADD COLUMN IF NOT EXISTS "address_state" TEXT,
  ADD COLUMN IF NOT EXISTS "address_zip_code" TEXT,
  ADD COLUMN IF NOT EXISTS "address_country" TEXT,
  ADD COLUMN IF NOT EXISTS "location_reference" TEXT,
  ADD COLUMN IF NOT EXISTS "location_description" TEXT;

CREATE INDEX IF NOT EXISTS "places_address_city_idx"
  ON "places"("address_city");

CREATE INDEX IF NOT EXISTS "places_address_state_idx"
  ON "places"("address_state");
