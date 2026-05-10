function normalizeLimit(limit, fallback = 24, max = 120) {
  const parsed = Number(limit ?? fallback);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

/**
 * Places owned by a host, with the first photo for dashboard cards.
 */
export async function getHostDashboardPlaces(prisma, filters = {}) {
  const { hostId = null, limit = 250 } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_dashboard_places(${hostId}::uuid, ${normalizeLimit(limit, 250, 1000)}::int)
  `;
}

/**
 * Operational counters for the current host dashboard period.
 */
export async function getHostDashboardOperationalSnapshot(prisma, filters = {}) {
  const {
    hostId = null,
    todayStart = null,
    todayEnd = null,
    monthStart = null,
    monthEnd = null,
  } = filters;

  return prisma.$queryRaw`
    SELECT
      *
    FROM fn_host_dashboard_operational_snapshot(
      ${hostId}::uuid,
      ${todayStart}::timestamp,
      ${todayEnd}::timestamp,
      ${monthStart}::timestamp,
      ${monthEnd}::timestamp
    )
  `;
}

/**
 * Booking rows for dashboard calendar, movement lists and compatibility payloads.
 */
export async function getHostDashboardBookings(prisma, filters = {}) {
  const {
    hostId = null,
    dateFrom = null,
    dateTo = null,
    limit = 500,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_dashboard_bookings(
      ${hostId}::uuid,
      ${dateFrom}::timestamp,
      ${dateTo}::timestamp,
      ${normalizeLimit(limit, 500, 2000)}::int
    )
  `;
}

/**
 * Monthly consolidated dashboard metrics by host.
 */
export async function getHostDashboardSummaryMonthly(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    limit = 24,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_dashboard_summary_monthly(
      ${hostId}::uuid,
      ${monthFrom}::date,
      ${monthTo}::date,
      ${normalizeLimit(limit)}::int
    )
  `;
}

/**
 * Monthly revenue by host, based on approved payments and operational bookings.
 */
export async function getHostMonthlyRevenue(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    limit = 24,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_monthly_revenue
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR revenue_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR revenue_month <= ${monthTo}::date)
    ORDER BY revenue_month DESC, approved_payment_net DESC, host_name
    LIMIT ${normalizeLimit(limit)}
  `;
}

/**
 * Monthly booking status counters by host.
 */
export async function getHostBookingStatusMonthly(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    limit = 120,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_booking_status_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR booking_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR booking_month <= ${monthTo}::date)
    ORDER BY booking_month DESC, host_name, booking_status
    LIMIT ${normalizeLimit(limit, 120, 500)}
  `;
}

/**
 * Monthly payment status counters by host.
 */
export async function getHostPaymentStatusMonthly(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    limit = 120,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_payment_status_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR payment_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR payment_month <= ${monthTo}::date)
    ORDER BY payment_month DESC, host_name, provider, payment_status
    LIMIT ${normalizeLimit(limit, 120, 500)}
  `;
}

/**
 * Monthly occupancy by place for host dashboard drill-downs.
 */
export async function getPlaceOccupancyMonthly(prisma, filters = {}) {
  const {
    hostId = null,
    placeId = null,
    monthFrom = null,
    monthTo = null,
    limit = 120,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_place_occupancy_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${placeId}::uuid IS NULL OR place_id = ${placeId}::uuid)
      AND (${monthFrom}::date IS NULL OR occupancy_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR occupancy_month <= ${monthTo}::date)
    ORDER BY occupancy_month DESC, host_name, place_title
    LIMIT ${normalizeLimit(limit, 120, 500)}
  `;
}

/**
 * Review summary by place for dashboard quality signals.
 */
export async function getPlaceReviewSummary(prisma, filters = {}) {
  const {
    hostId = null,
    placeId = null,
    limit = 50,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_place_review_summary
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${placeId}::uuid IS NULL OR place_id = ${placeId}::uuid)
    ORDER BY average_rating DESC NULLS LAST, reviews_count DESC, place_title
    LIMIT ${normalizeLimit(limit, 50, 250)}
  `;
}

/**
 * Cleaning and inspection operational tasks ready for host dashboard consumption.
 */
export async function getHostCleaningInspectionTasks(prisma, filters = {}) {
  const {
    hostId = null,
    effectiveStatus = null,
    onlyAtRisk = null,
    limit = 200,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_cleaning_inspection_tasks(
      ${hostId}::uuid,
      ${effectiveStatus},
      ${onlyAtRisk}::boolean,
      ${normalizeLimit(limit, 200, 500)}::int
    )
  `;
}

/**
 * Single cleaning/inspection task by id, still backed by the SQL function payload.
 */
export async function getHostCleaningInspectionTaskById(prisma, filters = {}) {
  const {
    hostId = null,
    taskId = null,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_cleaning_inspection_tasks(
      ${hostId}::uuid,
      NULL,
      NULL,
      500
    )
    WHERE task_id = ${taskId}::uuid
    LIMIT 1
  `;
}

/**
 * Host-level operational metrics for cleaning and inspection.
 */
export async function getHostCleaningInspectionMetrics(prisma, filters = {}) {
  const { hostId = null } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_cleaning_inspection_metrics(${hostId}::uuid)
  `;
}

/**
 * Recurring operational problems grouped by property.
 */
export async function getHostCleaningInspectionProblemPlaces(prisma, filters = {}) {
  const {
    hostId = null,
    limit = 10,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_cleaning_inspection_problem_places(
      ${hostId}::uuid,
      ${normalizeLimit(limit, 10, 100)}::int
    )
  `;
}

/**
 * Task distribution and risk grouped by current responsible assignee.
 */
export async function getHostCleaningInspectionResponsibles(prisma, filters = {}) {
  const {
    hostId = null,
    limit = 50,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM fn_host_cleaning_inspection_responsibles(
      ${hostId}::uuid,
      ${normalizeLimit(limit, 50, 200)}::int
    )
  `;
}
