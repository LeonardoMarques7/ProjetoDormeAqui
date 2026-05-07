import { Prisma } from "@prisma/client";
import {
  ACTIONABLE_FINANCIAL_ENTRY_STATUSES,
  actionableFinancialEntryStatusesSql,
  CANCELLEDBookingStatusesSql,
} from "./queryFragments.js";

export const getFinancialSummaryQuery = ({ hostId, competenceMonth, periodStart, periodEnd }) => Prisma.sql`
  WITH host_places AS (
    SELECT id
    FROM places
    WHERE owner_id = ${hostId}
  ),
  booking_revenue AS (
    SELECT
      COALESCE(SUM(b.price_total) FILTER (
        WHERE b.payment_status = 'approved'
          AND b.status NOT IN (${CANCELLEDBookingStatusesSql})
      ), 0)::numeric AS gross_revenue
    FROM bookings b
    INNER JOIN host_places p ON p.id = b.place_id
    WHERE b.checkout >= ${periodStart}
      AND b.checkout <= ${periodEnd}
  ),
  entry_totals AS (
    SELECT
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type = 'manual_revenue'
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS manual_revenue,
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type = 'recurring_expense'
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS recurring_expenses,
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type = 'operational_expense'
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS operational_expenses,
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type = 'payment_fee'
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS payment_fees,
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type = 'refund'
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS refunds,
      COALESCE(SUM(amount) FILTER (
        WHERE entry_type <> 'manual_revenue'
          AND tax_deductible = false
          AND status IN (${actionableFinancialEntryStatusesSql})
      ), 0)::numeric AS non_deductible_expenses
    FROM financial_entries
    WHERE host_id = ${hostId}
      AND competence_month = ${competenceMonth}
  )
  SELECT
    br.gross_revenue,
    et.manual_revenue,
    et.recurring_expenses,
    et.operational_expenses,
    et.payment_fees,
    et.refunds,
    et.non_deductible_expenses,
    (et.recurring_expenses + et.operational_expenses + et.payment_fees + et.refunds)::numeric AS operating_deductions,
    (br.gross_revenue + et.manual_revenue)::numeric AS total_revenue,
    (et.recurring_expenses + et.operational_expenses + et.payment_fees + et.refunds)::numeric AS total_expenses,
    (br.gross_revenue + et.manual_revenue - et.recurring_expenses - et.operational_expenses - et.payment_fees - et.refunds)::numeric AS accounting_net_revenue,
    (
      br.gross_revenue + et.manual_revenue - et.recurring_expenses - et.operational_expenses - et.payment_fees - et.refunds - et.non_deductible_expenses
    )::numeric AS fiscal_net_revenue
  FROM booking_revenue br
  CROSS JOIN entry_totals et;
`;

export const getFinancialByCategoryQuery = ({ hostId, competenceMonth }) => Prisma.sql`
  SELECT
    entry_type,
    category,
    COUNT(*)::int AS entry_count,
    SUM(
      CASE
        WHEN entry_type = 'manual_revenue' THEN amount
        ELSE -amount
      END
    )::numeric AS signed_total,
    ABS(SUM(
      CASE
        WHEN entry_type = 'manual_revenue' THEN amount
        ELSE -amount
      END
    ))::numeric AS amount
  FROM financial_entries
  WHERE host_id = ${hostId}
    AND competence_month = ${competenceMonth}
    AND status IN (${Prisma.join(ACTIONABLE_FINANCIAL_ENTRY_STATUSES)})
  GROUP BY entry_type, category
  ORDER BY entry_type, category;
`;

export const getFinancialEntriesQuery = ({ hostId, competenceMonth, limit = 100 }) => Prisma.sql`
  SELECT
    fe.*,
    p.title AS place_title,
    p.city AS place_city
  FROM financial_entries fe
  INNER JOIN places p ON p.id = fe.place_id
  WHERE fe.host_id = ${hostId}
    AND fe.competence_month = ${competenceMonth}
  ORDER BY fe.entry_date DESC, fe.created_at DESC
  LIMIT ${limit};
`;

