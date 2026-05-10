-- CreateEnum
CREATE TYPE "CleaningStatus" AS ENUM ('AWAITING_CLEANING', 'CLEANING_IN_PROGRESS', 'DONE', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('AWAITING_INSPECTION', 'APPROVED', 'BLOCKED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "OverallInspectionStatus" AS ENUM ('AWAITING_CLEANING', 'CLEANING_IN_PROGRESS', 'AWAITING_INSPECTION', 'APPROVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('PENDING', 'DONE', 'ISSUE', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "InspectionPhotoType" AS ENUM ('BEFORE', 'AFTER', 'INSPECTION', 'ISSUE');

-- CreateTable
CREATE TABLE "cleaning_inspections" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "host_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "previous_booking_id" UUID,
    "next_booking_id" UUID,
    "last_checkout" TIMESTAMP(3),
    "next_checkin" TIMESTAMP(3),
    "cleaning_status" "CleaningStatus" NOT NULL DEFAULT 'AWAITING_CLEANING',
    "inspection_status" "InspectionStatus" NOT NULL DEFAULT 'AWAITING_INSPECTION',
    "overall_status" "OverallInspectionStatus" NOT NULL DEFAULT 'AWAITING_CLEANING',
    "assignee_name" TEXT,
    "assignee_contact" TEXT,
    "deadline_label" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_checklist_items" (
    "id" UUID NOT NULL,
    "cleaning_inspection_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cleaning_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_checklist_items" (
    "id" UUID NOT NULL,
    "cleaning_inspection_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inspection_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_inspection_photos" (
    "id" UUID NOT NULL,
    "cleaning_inspection_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "type" "InspectionPhotoType" NOT NULL DEFAULT 'INSPECTION',
    "uploaded_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cleaning_inspection_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_inspections_legacy_mongo_id_key" ON "cleaning_inspections"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_inspections_previous_booking_id_key" ON "cleaning_inspections"("previous_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_inspections_next_booking_id_key" ON "cleaning_inspections"("next_booking_id");

-- CreateIndex
CREATE INDEX "cleaning_inspections_host_id_idx" ON "cleaning_inspections"("host_id");

-- CreateIndex
CREATE INDEX "cleaning_inspections_place_id_idx" ON "cleaning_inspections"("place_id");

-- CreateIndex
CREATE INDEX "cleaning_inspections_next_checkin_idx" ON "cleaning_inspections"("next_checkin");

-- CreateIndex
CREATE INDEX "cleaning_inspections_cleaning_status_idx" ON "cleaning_inspections"("cleaning_status");

-- CreateIndex
CREATE INDEX "cleaning_inspections_inspection_status_idx" ON "cleaning_inspections"("inspection_status");

-- CreateIndex
CREATE INDEX "cleaning_inspections_overall_status_idx" ON "cleaning_inspections"("overall_status");

-- CreateIndex
CREATE INDEX "cleaning_inspections_host_id_overall_status_next_checkin_idx" ON "cleaning_inspections"("host_id", "overall_status", "next_checkin");

-- CreateIndex
CREATE INDEX "cleaning_inspections_host_id_place_id_next_checkin_idx" ON "cleaning_inspections"("host_id", "place_id", "next_checkin");

-- CreateIndex
CREATE INDEX "cleaning_checklist_items_cleaning_inspection_id_sort_order_idx" ON "cleaning_checklist_items"("cleaning_inspection_id", "sort_order");

-- CreateIndex
CREATE INDEX "inspection_checklist_items_cleaning_inspection_id_sort_orde_idx" ON "inspection_checklist_items"("cleaning_inspection_id", "sort_order");

-- CreateIndex
CREATE INDEX "cleaning_inspection_photos_cleaning_inspection_id_sort_orde_idx" ON "cleaning_inspection_photos"("cleaning_inspection_id", "sort_order");

-- AddForeignKey
ALTER TABLE "cleaning_inspections" ADD CONSTRAINT "cleaning_inspections_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_inspections" ADD CONSTRAINT "cleaning_inspections_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_inspections" ADD CONSTRAINT "cleaning_inspections_previous_booking_id_fkey" FOREIGN KEY ("previous_booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_inspections" ADD CONSTRAINT "cleaning_inspections_next_booking_id_fkey" FOREIGN KEY ("next_booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_checklist_items" ADD CONSTRAINT "cleaning_checklist_items_cleaning_inspection_id_fkey" FOREIGN KEY ("cleaning_inspection_id") REFERENCES "cleaning_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_cleaning_inspection_id_fkey" FOREIGN KEY ("cleaning_inspection_id") REFERENCES "cleaning_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_inspection_photos" ADD CONSTRAINT "cleaning_inspection_photos_cleaning_inspection_id_fkey" FOREIGN KEY ("cleaning_inspection_id") REFERENCES "cleaning_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
