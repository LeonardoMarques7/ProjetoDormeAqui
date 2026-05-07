import { Prisma } from "@prisma/client";

export const createDashboardIndexesQueries = () => [
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_places_owner ON places (owner_id);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_bookings_place_period_status ON bookings (place_id, checkin, checkout, status);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_bookings_place_checkout_payment_status ON bookings (place_id, checkout, payment_status, status);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_bookings_place_created_at ON bookings (place_id, created_at DESC);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_reviews_place ON reviews (place_id);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_unread_messages ON notifications (user_id, type, read, dismissed);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_financial_entries_host_month_status ON financial_entries (host_id, competence_month, status);`,
  Prisma.sql`CREATE INDEX IF NOT EXISTS idx_dashboard_financial_entries_host_place_month_type ON financial_entries (host_id, place_id, competence_month, entry_type);`,
];

export const createDashboardPropertyMonthlyMetricsViewQuery = () => Prisma.sql`
  CREATE OR REPLACE VIEW dashboard_property_monthly_metrics AS
  SELECT
    p.owner_id AS host_id,
    p.id AS place_id,
    date_trunc('month', b.checkout)::date AS month_start,
    COUNT(b.id) FILTER (
      WHERE b.status NOT IN ('CANCELLED', 'rejected')
    )::int AS reservations,
    COALESCE(SUM(b.price_total) FILTER (
      WHERE b.payment_status = 'approved'
        AND b.status NOT IN ('CANCELLED', 'rejected')
    ), 0)::numeric AS gross_revenue,
    COALESCE(SUM(b.nights) FILTER (
      WHERE b.status NOT IN ('CANCELLED', 'rejected')
    ), 0)::numeric AS booked_nights
  FROM places p
  LEFT JOIN bookings b ON b.place_id = p.id
  GROUP BY p.owner_id, p.id, date_trunc('month', b.checkout)::date;
`;

export const createDashboardHostMonthlyMetricsMaterializedViewQuery = () => Prisma.sql`
  CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_host_monthly_metrics AS
  SELECT
    host_id,
    month_start,
    COUNT(DISTINCT place_id)::int AS properties_with_bookings,
    SUM(reservations)::int AS reservations,
    SUM(gross_revenue)::numeric AS gross_revenue,
    SUM(booked_nights)::numeric AS booked_nights
  FROM dashboard_property_monthly_metrics
  WHERE month_start IS NOT NULL
  GROUP BY host_id, month_start;
`;

export const refreshDashboardHostMonthlyMetricsQuery = () => Prisma.sql`
  REFRESH MATERIALIZED VIEW dashboard_host_monthly_metrics;
`;

