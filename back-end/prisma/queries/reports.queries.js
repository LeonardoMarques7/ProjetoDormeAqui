function normalizeLimit(limit, fallback = 100, max = 1000) {
  const parsed = Number(limit ?? fallback);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

/**
 * Revenue by place and month.
 */
export async function getPlaceMonthlyRevenue(prisma, filters = {}) {
  const {
    hostId = null,
    placeId = null,
    monthFrom = null,
    monthTo = null,
    limit = 100,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_place_monthly_revenue
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${placeId}::uuid IS NULL OR place_id = ${placeId}::uuid)
      AND (${monthFrom}::date IS NULL OR revenue_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR revenue_month <= ${monthTo}::date)
    ORDER BY revenue_month DESC, approved_payment_net DESC, place_title
    LIMIT ${normalizeLimit(limit)}
  `;
}

/**
 * Financial summary by host, month and currency.
 */
export async function getHostFinancialSummaryMonthly(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    currency = null,
    limit = 100,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_financial_summary_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR financial_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR financial_month <= ${monthTo}::date)
      AND (${currency}::text IS NULL OR currency = ${currency}::char(3))
    ORDER BY financial_month DESC, host_name, currency
    LIMIT ${normalizeLimit(limit)}
  `;
}

/**
 * Payment status report by host, month, provider and method.
 */
export async function getPaymentStatusReport(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    provider = null,
    paymentStatus = null,
    limit = 100,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_payment_status_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR payment_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR payment_month <= ${monthTo}::date)
      AND (${provider}::text IS NULL OR provider::text = ${provider}::text)
      AND (${paymentStatus}::text IS NULL OR payment_status::text = ${paymentStatus}::text)
    ORDER BY payment_month DESC, host_name, provider, payment_status
    LIMIT ${normalizeLimit(limit)}
  `;
}

/**
 * Booking status report by host and month.
 */
export async function getBookingStatusReport(prisma, filters = {}) {
  const {
    hostId = null,
    monthFrom = null,
    monthTo = null,
    bookingStatus = null,
    limit = 100,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_host_booking_status_monthly
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${monthFrom}::date IS NULL OR booking_month >= ${monthFrom}::date)
      AND (${monthTo}::date IS NULL OR booking_month <= ${monthTo}::date)
      AND (${bookingStatus}::text IS NULL OR booking_status::text = ${bookingStatus}::text)
    ORDER BY booking_month DESC, host_name, booking_status
    LIMIT ${normalizeLimit(limit)}
  `;
}

/**
 * Review report by host or place.
 */
export async function getReviewSummaryReport(prisma, filters = {}) {
  const {
    hostId = null,
    placeId = null,
    minReviews = null,
    limit = 100,
  } = filters;

  return prisma.$queryRaw`
    SELECT *
    FROM v_place_review_summary
    WHERE (${hostId}::uuid IS NULL OR host_id = ${hostId}::uuid)
      AND (${placeId}::uuid IS NULL OR place_id = ${placeId}::uuid)
      AND (${minReviews}::int IS NULL OR reviews_count >= ${minReviews}::int)
    ORDER BY average_rating DESC NULLS LAST, reviews_count DESC, place_title
    LIMIT ${normalizeLimit(limit)}
  `;
}
