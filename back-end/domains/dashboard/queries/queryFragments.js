import { Prisma } from "@prisma/client";

export const HOST_FEE_RATE = 0.1;

export const ACTIVE_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "evaluation",
  "review",
  "completed",
];

export const CANCELLED_BOOKING_STATUSES = ["CANCELLED", "rejected"];

export const ACTIONABLE_FINANCIAL_ENTRY_STATUSES = [
  "pending",
  "scheduled",
  "confirmed",
  "paid",
  "processing",
  "refunded",
];

export const activeBookingStatusesSql = Prisma.join(ACTIVE_BOOKING_STATUSES);
export const CANCELLEDBookingStatusesSql = Prisma.join(CANCELLED_BOOKING_STATUSES);
export const actionableFinancialEntryStatusesSql = Prisma.join(
  ACTIONABLE_FINANCIAL_ENTRY_STATUSES
);

