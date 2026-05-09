ALTER TYPE "CleaningStatus" ADD VALUE IF NOT EXISTS 'OVERDUE';
ALTER TYPE "InspectionStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "OverallInspectionStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "OverallInspectionStatus" ADD VALUE IF NOT EXISTS 'OVERDUE';
ALTER TYPE "ChecklistItemStatus" ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE "InspectionPhotoType" ADD VALUE IF NOT EXISTS 'GENERAL';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CleaningArea') THEN
    CREATE TYPE "CleaningArea" AS ENUM (
      'BATHROOM',
      'KITCHEN',
      'BEDROOM',
      'COMMON_AREA',
      'CONTACT_SURFACES',
      'LINENS',
      'SUPPLIES',
      'BASIC_SAFETY',
      'OUTDOOR',
      'OTHER'
    );
  END IF;
END $$;

ALTER TABLE "cleaning_inspections"
  ADD COLUMN IF NOT EXISTS "cleaning_assignee_id" UUID,
  ADD COLUMN IF NOT EXISTS "inspection_assignee_id" UUID,
  ADD COLUMN IF NOT EXISTS "deadline_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cleaning_started_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cleaning_completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "inspection_completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "inspection_assignee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "inspection_assignee_contact" TEXT,
  ADD COLUMN IF NOT EXISTS "requires_photo_evidence" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "minimum_required_evidence_count" INTEGER NOT NULL DEFAULT 2;

UPDATE "cleaning_inspections"
SET "deadline_at" = COALESCE("deadline_at", "next_checkin")
WHERE "deadline_at" IS NULL
  AND "next_checkin" IS NOT NULL;

ALTER TABLE "cleaning_checklist_items"
  ADD COLUMN IF NOT EXISTS "area" "CleaningArea" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "is_required" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_by_user_id" UUID;

ALTER TABLE "inspection_checklist_items"
  ADD COLUMN IF NOT EXISTS "area" "CleaningArea" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "is_required" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_by_user_id" UUID;

ALTER TABLE "cleaning_inspection_photos"
  ADD COLUMN IF NOT EXISTS "cleaning_checklist_item_id" UUID,
  ADD COLUMN IF NOT EXISTS "inspection_checklist_item_id" UUID,
  ADD COLUMN IF NOT EXISTS "uploaded_by_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "area" "CleaningArea";

ALTER TABLE "cleaning_inspections"
  DROP CONSTRAINT IF EXISTS "cleaning_inspections_business_dates_check",
  ADD CONSTRAINT "cleaning_inspections_business_dates_check" CHECK (
    ("last_checkout" IS NULL OR "next_checkin" IS NULL OR "next_checkin" >= "last_checkout")
    AND ("last_checkout" IS NULL OR "deadline_at" IS NULL OR "deadline_at" >= "last_checkout")
    AND ("cleaning_started_at" IS NULL OR "cleaning_completed_at" IS NULL OR "cleaning_completed_at" >= "cleaning_started_at")
    AND ("cleaning_completed_at" IS NULL OR "inspection_completed_at" IS NULL OR "inspection_completed_at" >= "cleaning_completed_at")
    AND ("minimum_required_evidence_count" >= 0)
  );

ALTER TABLE "cleaning_inspection_photos"
  DROP CONSTRAINT IF EXISTS "cleaning_inspection_photos_single_checklist_link_check",
  ADD CONSTRAINT "cleaning_inspection_photos_single_checklist_link_check" CHECK (
    num_nonnulls("cleaning_checklist_item_id", "inspection_checklist_item_id") <= 1
  );

ALTER TABLE "cleaning_inspections"
  ADD CONSTRAINT "cleaning_inspections_cleaning_assignee_id_fkey"
    FOREIGN KEY ("cleaning_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "cleaning_inspections_inspection_assignee_id_fkey"
    FOREIGN KEY ("inspection_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cleaning_checklist_items"
  ADD CONSTRAINT "cleaning_checklist_items_completed_by_user_id_fkey"
    FOREIGN KEY ("completed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "inspection_checklist_items"
  ADD CONSTRAINT "inspection_checklist_items_completed_by_user_id_fkey"
    FOREIGN KEY ("completed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cleaning_inspection_photos"
  ADD CONSTRAINT "cleaning_inspection_photos_cleaning_checklist_item_id_fkey"
    FOREIGN KEY ("cleaning_checklist_item_id") REFERENCES "cleaning_checklist_items"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "cleaning_inspection_photos_inspection_checklist_item_id_fkey"
    FOREIGN KEY ("inspection_checklist_item_id") REFERENCES "inspection_checklist_items"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "cleaning_inspection_photos_uploaded_by_user_id_fkey"
    FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "cleaning_inspections_deadline_at_idx"
  ON "cleaning_inspections"("deadline_at");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_cleaning_assignee_id_idx"
  ON "cleaning_inspections"("cleaning_assignee_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_inspection_assignee_id_idx"
  ON "cleaning_inspections"("inspection_assignee_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_created_at_idx"
  ON "cleaning_inspections"("created_at");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_updated_at_idx"
  ON "cleaning_inspections"("updated_at");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_host_id_deadline_at_idx"
  ON "cleaning_inspections"("host_id", "deadline_at");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_host_id_next_checkin_idx"
  ON "cleaning_inspections"("host_id", "next_checkin");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_host_id_cleaning_assignee_id_idx"
  ON "cleaning_inspections"("host_id", "cleaning_assignee_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspections_host_id_inspection_assignee_id_idx"
  ON "cleaning_inspections"("host_id", "inspection_assignee_id");

CREATE INDEX IF NOT EXISTS "cleaning_checklist_items_completed_by_user_id_idx"
  ON "cleaning_checklist_items"("completed_by_user_id");

CREATE INDEX IF NOT EXISTS "inspection_checklist_items_completed_by_user_id_idx"
  ON "inspection_checklist_items"("completed_by_user_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspection_photos_uploaded_by_user_id_idx"
  ON "cleaning_inspection_photos"("uploaded_by_user_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspection_photos_cleaning_checklist_item_id_idx"
  ON "cleaning_inspection_photos"("cleaning_checklist_item_id");

CREATE INDEX IF NOT EXISTS "cleaning_inspection_photos_inspection_checklist_item_id_idx"
  ON "cleaning_inspection_photos"("inspection_checklist_item_id");
