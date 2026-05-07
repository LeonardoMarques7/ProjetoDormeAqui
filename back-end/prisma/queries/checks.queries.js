const expectedAnalyticViews = [
  "v_host_monthly_revenue",
  "v_place_monthly_revenue",
  "v_place_occupancy_monthly",
  "v_host_booking_status_monthly",
  "v_host_payment_status_monthly",
  "v_place_review_summary",
  "v_host_financial_summary_monthly",
  "v_host_dashboard_summary_monthly",
];

/**
 * Confirms whether all analytic views expected by the query layer exist.
 */
export async function getAnalyticViewsHealth(prisma) {
  return prisma.$queryRaw`
    SELECT
      expected.view_name,
      to_regclass(expected.view_name) IS NOT NULL AS exists
    FROM unnest(${expectedAnalyticViews}::text[]) AS expected(view_name)
    ORDER BY expected.view_name
  `;
}

/**
 * Returns row counts for all analytic views.
 */
export async function getAnalyticViewRowCounts(prisma) {
  const [
    hostMonthlyRevenue,
    placeMonthlyRevenue,
    placeOccupancyMonthly,
    hostBookingStatusMonthly,
    hostPaymentStatusMonthly,
    placeReviewSummary,
    hostFinancialSummaryMonthly,
    hostDashboardSummaryMonthly,
  ] = await Promise.all([
    prisma.$queryRaw`SELECT 'v_host_monthly_revenue' AS view_name, COUNT(*) AS row_count FROM v_host_monthly_revenue`,
    prisma.$queryRaw`SELECT 'v_place_monthly_revenue' AS view_name, COUNT(*) AS row_count FROM v_place_monthly_revenue`,
    prisma.$queryRaw`SELECT 'v_place_occupancy_monthly' AS view_name, COUNT(*) AS row_count FROM v_place_occupancy_monthly`,
    prisma.$queryRaw`SELECT 'v_host_booking_status_monthly' AS view_name, COUNT(*) AS row_count FROM v_host_booking_status_monthly`,
    prisma.$queryRaw`SELECT 'v_host_payment_status_monthly' AS view_name, COUNT(*) AS row_count FROM v_host_payment_status_monthly`,
    prisma.$queryRaw`SELECT 'v_place_review_summary' AS view_name, COUNT(*) AS row_count FROM v_place_review_summary`,
    prisma.$queryRaw`SELECT 'v_host_financial_summary_monthly' AS view_name, COUNT(*) AS row_count FROM v_host_financial_summary_monthly`,
    prisma.$queryRaw`SELECT 'v_host_dashboard_summary_monthly' AS view_name, COUNT(*) AS row_count FROM v_host_dashboard_summary_monthly`,
  ]);

  return [
    ...hostMonthlyRevenue,
    ...placeMonthlyRevenue,
    ...placeOccupancyMonthly,
    ...hostBookingStatusMonthly,
    ...hostPaymentStatusMonthly,
    ...placeReviewSummary,
    ...hostFinancialSummaryMonthly,
    ...hostDashboardSummaryMonthly,
  ];
}

/**
 * Finds missing or invalid dashboard rows that would break future read models.
 */
export async function getDashboardDataQualityIssues(prisma) {
  return prisma.$queryRaw`
    SELECT
      'dashboard_summary_without_host' AS issue,
      d.host_id::text AS entity_id,
      d.summary_month::text AS reference
    FROM v_host_dashboard_summary_monthly d
    LEFT JOIN users u ON u.id = d.host_id
    WHERE u.id IS NULL
    UNION ALL
    SELECT
      'negative_dashboard_revenue',
      d.host_id::text,
      d.summary_month::text
    FROM v_host_dashboard_summary_monthly d
    WHERE d.booking_gross_revenue < 0
       OR d.approved_payment_gross < 0
       OR d.approved_payment_net < 0
    UNION ALL
    SELECT
      'occupancy_rate_out_of_range',
      o.place_id::text,
      o.occupancy_month::text
    FROM v_place_occupancy_monthly o
    WHERE o.occupancy_rate_percent < 0
       OR o.occupancy_rate_percent > 100
    ORDER BY issue, entity_id, reference
  `;
}
