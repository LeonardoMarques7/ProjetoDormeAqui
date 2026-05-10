-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlacePhotoKind" AS ENUM ('PHOTO', 'BANNER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED', 'CANCELLED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MERCADO_PAGO', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'ACCOUNT_BALANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewBadgeSentiment" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('CHARGE', 'PLATFORM_FEE', 'HOST_PAYOUT', 'REFUND', 'PENALTY', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "FinancialEntryStatus" AS ENUM ('PENDING', 'AVAILABLE', 'SETTLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "deactivated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "photo_url" TEXT,
    "banner_url" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "pronouns" TEXT,
    "occupation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "provider_account_id" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "auth_identity_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "owner_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "extras" TEXT,
    "price_per_night" DECIMAL(12,2) NOT NULL,
    "check_in_time" VARCHAR(5) NOT NULL,
    "check_out_time" VARCHAR(5) NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "status" "PlaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "average_rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_photos" (
    "id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "PlacePhotoKind" NOT NULL DEFAULT 'PHOTO',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perks" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_perks" (
    "id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "perk_id" UUID NOT NULL,

    CONSTRAINT "place_perks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "place_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "nights" INTEGER NOT NULL,
    "price_per_night" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "archived_at" TIMESTAMP(3),
    "archive_reason" TEXT,
    "review_requested_at" TIMESTAMP(3),
    "last_status_change" TIMESTAMP(3),
    "legacy_payment_status" TEXT,
    "legacy_payment_method" TEXT,
    "legacy_idempotency_key" TEXT,
    "legacy_transaction_amount" DECIMAL(12,2),
    "legacy_transaction_details" JSONB,
    "legacy_qr_code_base64" TEXT,
    "legacy_boleto_url" TEXT,
    "legacy_mercado_pago_payment_id" TEXT,
    "legacy_mercado_pago_preference_id" TEXT,
    "payment_approved_at" TIMESTAMP(3),
    "cancellation_penalty_amount" DECIMAL(12,2),
    "cancellation_refund_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "from_status" "BookingStatus",
    "to_status" "BookingStatus" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "booking_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_badges" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "sentiment" "ReviewBadgeSentiment" NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "review_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT,
    "booking_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "provider_payment_id" TEXT,
    "provider_preference_id" TEXT,
    "idempotency_key" TEXT,
    "method" "PaymentMethod",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" CHAR(3) NOT NULL DEFAULT 'BRL',
    "amount" DECIMAL(12,2) NOT NULL,
    "amount_refunded" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transaction_details" JSONB,
    "boleto_url" TEXT,
    "qr_code_base64" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "provider_event_id" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "payment_id" UUID,
    "user_id" UUID,
    "place_id" UUID,
    "type" "FinancialEntryType" NOT NULL,
    "status" "FinancialEntryStatus" NOT NULL DEFAULT 'PENDING',
    "currency" CHAR(3) NOT NULL DEFAULT 'BRL',
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "available_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_legacy_mongo_id_key" ON "users"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "auth_identities_provider_idx" ON "auth_identities"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_account_id_key" ON "auth_identities"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_user_id_provider_key" ON "auth_identities"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_auth_identity_id_expires_at_idx" ON "password_reset_tokens"("auth_identity_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "places_legacy_mongo_id_key" ON "places"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "places_owner_id_idx" ON "places"("owner_id");

-- CreateIndex
CREATE INDEX "places_city_idx" ON "places"("city");

-- CreateIndex
CREATE INDEX "places_status_idx" ON "places"("status");

-- CreateIndex
CREATE INDEX "places_price_per_night_idx" ON "places"("price_per_night");

-- CreateIndex
CREATE INDEX "place_photos_place_id_sort_order_idx" ON "place_photos"("place_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "perks_slug_key" ON "perks"("slug");

-- CreateIndex
CREATE INDEX "place_perks_perk_id_idx" ON "place_perks"("perk_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_perks_place_id_perk_id_key" ON "place_perks"("place_id", "perk_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_legacy_mongo_id_key" ON "bookings"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_legacy_idempotency_key_key" ON "bookings"("legacy_idempotency_key");

-- CreateIndex
CREATE INDEX "bookings_guest_id_idx" ON "bookings"("guest_id");

-- CreateIndex
CREATE INDEX "bookings_place_id_idx" ON "bookings"("place_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_check_in_check_out_idx" ON "bookings"("check_in", "check_out");

-- CreateIndex
CREATE INDEX "bookings_place_id_check_in_check_out_idx" ON "bookings"("place_id", "check_in", "check_out");

-- CreateIndex
CREATE INDEX "booking_status_history_booking_id_changed_at_idx" ON "booking_status_history"("booking_id", "changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_legacy_mongo_id_key" ON "reviews"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_place_id_created_at_idx" ON "reviews"("place_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "review_badges_slug_idx" ON "review_badges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "review_badges_review_id_sentiment_slug_key" ON "review_badges"("review_id", "sentiment", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "payments_legacy_mongo_id_key" ON "payments"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_provider_status_idx" ON "payments"("provider", "status");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_provider_payment_id_key" ON "payments"("provider", "provider_payment_id");

-- CreateIndex
CREATE INDEX "payment_events_payment_id_received_at_idx" ON "payment_events"("payment_id", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_provider_provider_event_id_key" ON "payment_events"("provider", "provider_event_id");

-- CreateIndex
CREATE INDEX "financial_entries_booking_id_idx" ON "financial_entries"("booking_id");

-- CreateIndex
CREATE INDEX "financial_entries_payment_id_idx" ON "financial_entries"("payment_id");

-- CreateIndex
CREATE INDEX "financial_entries_user_id_idx" ON "financial_entries"("user_id");

-- CreateIndex
CREATE INDEX "financial_entries_place_id_idx" ON "financial_entries"("place_id");

-- CreateIndex
CREATE INDEX "financial_entries_type_status_idx" ON "financial_entries"("type", "status");

-- CreateIndex
CREATE INDEX "financial_entries_created_at_idx" ON "financial_entries"("created_at");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_auth_identity_id_fkey" FOREIGN KEY ("auth_identity_id") REFERENCES "auth_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_perks" ADD CONSTRAINT "place_perks_perk_id_fkey" FOREIGN KEY ("perk_id") REFERENCES "perks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_perks" ADD CONSTRAINT "place_perks_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_badges" ADD CONSTRAINT "review_badges_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Basic data integrity constraint kept in the initial schema migration.
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_valid_date_range"
  CHECK ("check_in" < "check_out");
