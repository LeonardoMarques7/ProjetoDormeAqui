import { getPrismaClient } from "../../config/prisma.js";
import {
  getBookingStatusReport,
  getHostDashboardBookings,
  getHostDashboardOperationalSnapshot,
  getHostDashboardPlaces,
  getHostDashboardSummaryMonthly,
  getHostFinancialSummaryMonthly,
  getHostMonthlyRevenue,
  getPaymentStatusReport,
  getPlaceMonthlyRevenue,
  getPlaceOccupancyMonthly,
  getPlaceReviewSummary,
  getReviewSummaryReport,
} from "../../prisma/queries/index.js";

const HOST_FEE_RATE = 0.1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const DAY_LABELS = {
  sunday: "Dom",
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sab",
};

const ACTIVE_BOOKING_STATUSES = new Set([
  "CONFIRMED",
  "IN_PROGRESS",
  "EVALUATION",
  "REVIEW",
  "COMPLETED",
]);

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
};

function isDecimalLike(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.toString === "function" &&
    (value.constructor?.name === "Decimal" ||
      value.constructor?.name === "Decimalish" ||
      value.constructor?.name === "Decimal.js" ||
      typeof value.toNumber === "function")
  );
}

export function normalizeDashboardPayloadForJson(value) {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : value.toString();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value === undefined) {
    return null;
  }

  if (value instanceof Date || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDashboardPayloadForJson(item));
  }

  if (typeof value === "object") {
    if (isDecimalLike(value)) {
      const decimalNumber = typeof value.toNumber === "function" ? value.toNumber() : Number(value.toString());
      return Number.isFinite(decimalNumber) ? decimalNumber : value.toString();
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeDashboardPayloadForJson(entryValue),
      ])
    );
  }

  return value;
}

const toDateOnlyMonth = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

const previousMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() - 1, 1);

const toStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toEndOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const toIsoDay = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const eachDayBetween = (startDate, endDate) => {
  const start = toStartOfDay(startDate);
  const end = toStartOfDay(endDate);
  const days = [];

  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + ONE_DAY_MS)) {
    days.push(new Date(d));
  }

  return days;
};

const getDatesBetweenExclusive = (startDate, endDate) => {
  const start = toStartOfDay(new Date(startDate));
  const end = toStartOfDay(new Date(endDate));
  const days = [];

  for (
    let d = new Date(start.getTime() + ONE_DAY_MS);
    d < end;
    d = new Date(d.getTime() + ONE_DAY_MS)
  ) {
    days.push(new Date(d));
  }

  return days;
};

const monthLabel = (date) =>
  ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
    date.getMonth()
  ];

function isUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

export function shouldUsePostgresDashboard() {
  if (process.env.DASHBOARD_DATA_SOURCE === "mongo") return false;
  if (process.env.DASHBOARD_USE_POSTGRES === "false") return false;
  return true;
}

async function resolvePostgresHostId(prisma, hostId) {
  const rows = await prisma.$queryRaw`
    SELECT id
    FROM users
    WHERE (${isUuidLike(hostId)}::boolean = true AND id::text = ${String(hostId)})
       OR legacy_mongo_id = ${String(hostId)}
    LIMIT 1
  `;

  return rows[0]?.id ?? null;
}

function buildRevenueProjection(monthlyRevenueRows) {
  const rows = [...monthlyRevenueRows].reverse();

  return rows.map((row) => {
    const date = new Date(row.revenue_month);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      mes: monthLabel(date),
      receita: toNumber(row.approved_payment_net || row.booking_gross_revenue),
      projecao: null,
      tipo: "real",
    };
  });
}

function buildRevenueOverTime(monthlyRevenueRows) {
  return [...monthlyRevenueRows].reverse().map((row) => {
    const date = new Date(row.revenue_month);
    const label = monthLabel(date);
    const value = toNumber(row.approved_payment_net || row.booking_gross_revenue);

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label,
      value,
      revenue: value,
      receita: value,
    };
  });
}

function buildOccupancyOverTime(occupancyRows) {
  const byMonth = new Map();

  for (const row of occupancyRows) {
    const date = new Date(row.occupancy_month);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = byMonth.get(key) || {
      key,
      label: monthLabel(date),
      occupiedNights: 0,
      availableNights: 0,
    };

    current.occupiedNights += toNumber(row.occupied_nights);
    current.availableNights += toNumber(row.available_nights);
    byMonth.set(key, current);
  }

  return Array.from(byMonth.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => {
      const value =
        item.availableNights > 0 ? (item.occupiedNights / item.availableNights) * 100 : 0;

      return {
        ...item,
        value,
        occupancyRate: value,
      };
    });
}

function buildPaymentMovementItems(paymentStatusRows) {
  return paymentStatusRows.map((row, index) => ({
    id: `${row.host_id || "host"}-${row.payment_month || "month"}-${row.provider || "provider"}-${row.payment_status || "status"}-${index}`,
    type: "payment_summary",
    label: `${row.provider || "Pagamento"} - ${row.payment_status || "status"}`,
    value: toNumber(row.net_amount ?? row.gross_amount),
    date: row.payment_month,
    reservation: "Resumo",
    bookingId: "Resumo",
    placeTitle: "Todas as acomodacoes",
    guestName: "",
    status: String(row.payment_status || "").toLowerCase(),
    statusLabel: String(row.payment_status || "Indisponivel"),
    available: true,
  }));
}

function buildFinancialComposition(financialSummary) {
  return [
    {
      key: "grossRevenue",
      label: "Receita bruta",
      value: financialSummary.monthlyGrossRevenue,
      tone: "green",
    },
    {
      key: "operatingExpenses",
      label: "Custos conhecidos",
      value: financialSummary.operatingExpenses,
      tone: financialSummary.operatingExpenses > 0 ? "amber" : "slate",
    },
    {
      key: "estimatedProfit",
      label: "Lucro estimado",
      value: financialSummary.estimatedProfit,
      tone: financialSummary.estimatedProfit >= 0 ? "green" : "red",
    },
  ];
}

function buildLedgerSummary(financialSummary) {
  return {
    period: {
      key: "current_month",
    },
    totals: {
      manualRevenue: 0,
      totalExpenses: financialSummary.operatingExpenses,
      paymentFees: 0,
      accountingNetRevenue: financialSummary.estimatedProfit,
      fiscalNetRevenue: financialSummary.estimatedProfit,
      contributionMargin: financialSummary.profitMargin,
    },
    entries: [],
    byProperty: [],
    byCategory: [],
    bySubcategory: [],
    summaryCards: [],
  };
}

function makeKpi({
  key,
  label,
  value = null,
  format = "number",
  helper = "",
  tone = "slate",
  status = "neutral",
  available = true,
}) {
  return { key, label, value, format, helper, tone, status, available };
}

function makeFinancialMetric({
  key,
  label,
  value = null,
  format = "currency",
  helper = "",
  tone = "slate",
  available = true,
}) {
  return { key, label, value, format, helper, tone, available };
}

function makeUnavailableFinancialMetric(key, label, helper) {
  return makeFinancialMetric({
    key,
    label,
    value: null,
    helper,
    tone: "slate",
    available: false,
  });
}

function statusMeta(status) {
  if (status === "CONFIRMED") return { label: "Confirmada", color: "#16a34a" };
  if (status === "PENDING") return { label: "Pendente", color: "#f59e0b" };
  if (status === "CANCELLED" || status === "REJECTED") {
    return { label: "Cancelada", color: "#dc2626" };
  }
  if (status === "IN_PROGRESS") return { label: "Em andamento", color: "#2563eb" };
  if (status === "EVALUATION") return { label: "Avaliacao", color: "#8b5cf6" };
  if (status === "REVIEW") return { label: "Revisao", color: "#ea580c" };
  if (status === "COMPLETED") return { label: "Finalizada", color: "#6b7280" };
  return { label: "Ativa", color: "#111827" };
}

function mapPlace(row, reviewRow = null) {
  return {
    id: String(row.id),
    _id: row.legacy_mongo_id || String(row.id),
    title: row.title,
    city: row.city,
    type: row.type,
    price: toNumber(row.price_per_night),
    photos: row.photo_url ? [row.photo_url] : [],
    perks: [],
    guests: toNumber(row.max_guests),
    rooms: toNumber(row.rooms),
    beds: toNumber(row.beds),
    bathrooms: toNumber(row.bathrooms),
    averageRating:
      reviewRow?.average_rating !== null && reviewRow?.average_rating !== undefined
        ? toNumber(reviewRow.average_rating)
        : toNumber(row.average_rating),
    isActive: row.status === "ACTIVE",
    checkin: row.check_in_time,
    checkout: row.check_out_time,
  };
}

function mapBooking(row) {
  const status = String(row.status || "PENDING");
  const paymentStatus = String(row.payment_status || "PENDING").toLowerCase();

  return {
    _id: row.legacy_mongo_id || String(row.id),
    id: String(row.id),
    place: {
      _id: String(row.place_id),
      title: row.place_title,
      city: row.place_city,
      photos: row.place_photo_url ? [row.place_photo_url] : [],
      checkin: row.place_check_in_time,
      checkout: row.place_check_out_time,
      isActive: row.place_status === "ACTIVE",
    },
    user: {
      _id: String(row.guest_id),
      name: row.guest_name,
      email: row.guest_email,
      photo: row.guest_photo_url,
    },
    checkin: row.check_in,
    checkout: row.check_out,
    guests: toNumber(row.guests),
    nights: toNumber(row.nights),
    pricePerNight: toNumber(row.price_per_night),
    priceTotal: toNumber(row.total_price),
    status,
    paymentStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildCalendar({ bookings, places, monthStart, monthEnd }) {
  const occupiedDaySet = new Set();
  const events = [];
  const placeById = new Map(places.map((place) => [String(place.id), place]));

  for (const booking of bookings) {
    const checkinDate = new Date(booking.checkin);
    const checkoutDate = new Date(booking.checkout);
    const status = String(booking.status || "PENDING");
    const meta = statusMeta(status);
    const isActive = ACTIVE_BOOKING_STATUSES.has(status);
    const place = booking.place || placeById.get(String(booking.place));
    const common = {
      bookingId: String(booking.id || booking._id),
      color: meta.color,
      status: meta.label,
      rawStatus: status,
      guest: booking.user?.name || "Hospede",
      guestEmail: booking.user?.email || "",
      guestCount: booking.guests || 1,
      guestId: booking.user?._id || "Nao identificado",
      guestPhoto: booking.user?.photo || null,
      placeTitle: place?.title || "Acomodacao",
      placeCity: place?.city || "",
      placeCheckin: place?.checkin || "",
      placeCheckout: place?.checkout || "",
      placePhoto: place?.photos?.[0] || null,
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: booking.nights,
      paymentStatus: booking.paymentStatus,
      total: booking.priceTotal,
    };

    if (isActive) {
      for (const day of eachDayBetween(checkinDate, checkoutDate)) {
        if (day >= monthStart && day <= monthEnd) {
          occupiedDaySet.add(toIsoDay(day));
        }
      }
    }

    events.push({
      ...common,
      id: `${common.bookingId}-checkin`,
      type: "checkin",
      title: `Check-in - ${common.placeTitle}`,
      startDate: checkinDate,
      endDate: checkinDate,
    });
    events.push({
      ...common,
      id: `${common.bookingId}-checkout`,
      type: "checkout",
      title: `Check-out - ${common.placeTitle}`,
      startDate: checkoutDate,
      endDate: checkoutDate,
    });

    for (const day of getDatesBetweenExclusive(checkinDate, checkoutDate)) {
      events.push({
        ...common,
        id: `${common.bookingId}-stay-${toIsoDay(day)}`,
        type: "stay",
        title: `Hospedagem - ${common.placeTitle}`,
        startDate: day,
        endDate: day,
      });
    }
  }

  const monthDays = eachDayBetween(monthStart, monthEnd);
  const emptyDays = monthDays
    .filter((day) => !occupiedDaySet.has(toIsoDay(day)))
    .map((day) => ({
      date: toIsoDay(day),
      label: DAY_LABELS[day.toLocaleString("en-US", { weekday: "long" }).toLowerCase()],
    }));

  return { events, emptyDays };
}

function buildFinancialSummary({ dashboardRows, financialRows, placeRevenueRows, operationalSnapshot }) {
  const current = dashboardRows[0] || {};
  const monthlyGrossRevenue = toNumber(current.booking_gross_revenue);
  const monthlyNetRevenue = toNumber(current.approved_payment_net);
  const totalFees = toNumber(financialRows[0]?.platform_fee_total) || monthlyGrossRevenue * HOST_FEE_RATE;
  const estimatedProfit = monthlyNetRevenue - totalFees;
  const profitMargin = monthlyNetRevenue > 0 ? (estimatedProfit / monthlyNetRevenue) * 100 : null;
  const futureRevenue = toNumber(operationalSnapshot.future_revenue);
  const approvedPaymentsTotal = toNumber(operationalSnapshot.approved_payments_total);
  const pendingPaymentsTotal = toNumber(operationalSnapshot.pending_payments_total);

  const properties = placeRevenueRows.map((row) => ({
    id: String(row.place_id),
    title: row.place_title,
    city: row.city,
    photo: null,
    grossRevenue: toNumber(row.booking_gross_revenue),
    expenses: toNumber(row.booking_gross_revenue) * HOST_FEE_RATE,
    estimatedProfit: toNumber(row.approved_payment_net) - toNumber(row.booking_gross_revenue) * HOST_FEE_RATE,
    occupancyRate: null,
    availableNightEarnings: null,
    status: "stable",
    statusLabel: "Dados PostgreSQL",
    available: true,
  }));

  return {
    monthlyGrossRevenue,
    monthlyNetRevenue,
    futureRevenue,
    approvedPaymentsTotal,
    pendingPaymentsTotal,
    totalFees,
    operatingExpenses: totalFees,
    estimatedProfit,
    profitMargin,
    properties,
  };
}

function buildOverview({
  dashboardRows,
  reviewRows,
  financialSummary,
  metrics,
  places,
  operationalProperties,
  operationalSnapshot,
  alertGroups,
}) {
  const current = dashboardRows[0] || {};
  const checkinsToday = toNumber(operationalSnapshot.checkins_today);
  const checkoutsToday = toNumber(operationalSnapshot.checkouts_today);
  const pendingBookings = toNumber(operationalSnapshot.pending_bookings);
  const activeProperties = toNumber(current.active_places_count) || places.filter((place) => place.isActive).length;
  const propertiesWithAlerts = operationalProperties.filter((property) =>
    ["critical", "warning"].includes(property.status)
  ).length;

  return {
    source: "postgres",
    kpis: [
      makeKpi({
        key: "monthlyGrossRevenue",
        label: "Receita bruta do mes",
        value: financialSummary.monthlyGrossRevenue,
        format: "currency",
        helper: "View PostgreSQL v_host_dashboard_summary_monthly",
        tone: "green",
      }),
      makeKpi({
        key: "activeProperties",
        label: "Imoveis ativos",
        value: activeProperties,
        helper: `${places.length} imoveis cadastrados`,
        tone: "blue",
      }),
      makeKpi({
        key: "occupancyRate",
        label: "Ocupacao media",
        value: metrics.occupancyRate,
        format: "percent",
        helper: "Media do periodo via PostgreSQL",
        tone: "green",
        status: metrics.occupancyRate < 35 ? "attention" : "healthy",
      }),
      makeKpi({
        key: "averageRating",
        label: "Avaliacao media",
        value: metrics.averageRating,
        format: "rating",
        helper: metrics.averageRating ? "Media dos imoveis avaliados" : "Sem avaliacoes suficientes",
        tone: "violet",
        available: metrics.averageRating !== null,
      }),
    ],
    actionsToday: {
      checkins: checkinsToday,
      checkouts: checkoutsToday,
      pendingBookings,
      pendingPreCheckins: null,
      pendingCleanings: null,
      items: [
        makeKpi({
          key: "checkinsToday",
          label: "Entradas hoje",
          value: checkinsToday,
          helper: "Check-ins previstos para hoje via PostgreSQL",
          tone: "green",
          status: checkinsToday > 0 ? "action" : "neutral",
        }),
        makeKpi({
          key: "checkoutsToday",
          label: "Saidas hoje",
          value: checkoutsToday,
          helper: "Check-outs previstos para hoje via PostgreSQL",
          tone: "amber",
          status: checkoutsToday > 0 ? "action" : "neutral",
        }),
        makeKpi({
          key: "pendingBookings",
          label: "Reservas pendentes",
          value: pendingBookings,
          helper: "Aguardando confirmacao",
          tone: "blue",
          status: pendingBookings > 0 ? "attention" : "neutral",
        }),
        makeKpi({
          key: "pendingPreCheckins",
          label: "Pre-check-ins pendentes",
          value: null,
          helper: "Dominio operacional ainda nao migrado para PostgreSQL",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeKpi({
          key: "pendingCleanings",
          label: "Limpezas pendentes",
          value: null,
          helper: "Dominio operacional ainda nao migrado para PostgreSQL",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
      ],
    },
    operationalRisks: {
      propertiesWithAlerts,
      pendingInspections: null,
      openIncidents: null,
      criticalAlerts: alertGroups.critical.length,
      items: [
        makeKpi({
          key: "propertiesWithAlerts",
          label: "Imoveis com alerta",
          value: propertiesWithAlerts,
          helper: "Alertas calculados sobre views PostgreSQL",
          tone: propertiesWithAlerts > 0 ? "amber" : "green",
          status: propertiesWithAlerts > 0 ? "attention" : "healthy",
        }),
        makeKpi({
          key: "pendingInspections",
          label: "Vistorias pendentes",
          value: null,
          helper: "Dominio operacional ainda nao migrado para PostgreSQL",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeKpi({
          key: "openIncidents",
          label: "Ocorrencias abertas",
          value: null,
          helper: "Dominio de ocorrencias ainda nao migrado para PostgreSQL",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeKpi({
          key: "criticalAlerts",
          label: "Alertas criticos",
          value: alertGroups.critical.length,
          helper: "Itens que exigem acao imediata",
          tone: alertGroups.critical.length > 0 ? "red" : "green",
          status: alertGroups.critical.length > 0 ? "critical" : "healthy",
        }),
      ],
    },
    financialSummary: {
      revenueType: "gross",
      monthlyGrossRevenue: financialSummary.monthlyGrossRevenue,
      operatingExpenses: financialSummary.operatingExpenses,
      estimatedProfit: financialSummary.estimatedProfit,
      futureRevenue: financialSummary.futureRevenue,
      availableNightEarnings: metrics.availableNightEarnings,
      items: [
        makeKpi({
          key: "monthlyGrossRevenue",
          label: "Receita bruta do mes",
          value: financialSummary.monthlyGrossRevenue,
          format: "currency",
          helper: "View PostgreSQL v_host_dashboard_summary_monthly",
          tone: "green",
        }),
        makeKpi({
          key: "operatingExpenses",
          label: "Despesas operacionais",
          value: financialSummary.operatingExpenses,
          format: "currency",
          helper: "Taxas conhecidas em PostgreSQL",
          tone: financialSummary.operatingExpenses > 0 ? "amber" : "slate",
          status: financialSummary.operatingExpenses > 0 ? "attention" : "neutral",
        }),
        makeKpi({
          key: "estimatedProfit",
          label: "Lucro estimado",
          value: financialSummary.estimatedProfit,
          format: "currency",
          helper: "Receita liquida menos despesas conhecidas",
          tone: financialSummary.estimatedProfit >= 0 ? "green" : "red",
          status: financialSummary.estimatedProfit >= 0 ? "healthy" : "critical",
        }),
        makeKpi({
          key: "futureRevenue",
          label: "Receita futura",
          value: financialSummary.futureRevenue,
          format: "currency",
          helper: "Reservas futuras confirmadas",
          tone: "blue",
        }),
        makeKpi({
          key: "availableNightEarnings",
          label: "Ganho por noite disponivel",
          value: metrics.availableNightEarnings,
          format: "currency",
          helper: "Receita bruta por noite disponivel",
          tone: "violet",
        }),
      ],
    },
    performanceSummary: {
      activeProperties,
      occupancyRate: metrics.occupancyRate,
      averageRating: metrics.averageRating,
      averageDailyRate: metrics.averageNightPrice,
      items: [
        makeKpi({
          key: "activeProperties",
          label: "Imoveis ativos",
          value: activeProperties,
          helper: `${places.length} imoveis cadastrados`,
          tone: "blue",
        }),
        makeKpi({
          key: "occupancyRate",
          label: "Ocupacao media",
          value: metrics.occupancyRate,
          format: "percent",
          helper: "Media do periodo via PostgreSQL",
          tone: "green",
          status: metrics.occupancyRate < 35 ? "attention" : "healthy",
        }),
        makeKpi({
          key: "averageRating",
          label: "Avaliacao media",
          value: metrics.averageRating,
          format: "rating",
          helper: metrics.averageRating ? "Media dos imoveis avaliados" : "Sem avaliacoes suficientes",
          tone: "violet",
          available: metrics.averageRating !== null,
        }),
        makeKpi({
          key: "averageDailyRate",
          label: "Diaria media",
          value: metrics.averageNightPrice,
          format: "currency",
          helper: "Media por noite reservada",
          tone: "slate",
        }),
      ],
    },
    unavailableData: [
      {
        key: "operationalDomains",
        label: "Dominios operacionais detalhados",
        requiredBackend: "Migrar pre-check-in, incidentes e tarefas operacionais para PostgreSQL.",
      },
    ],
  };
}

export async function buildPostgresHostDashboardData(hostId) {
  const prisma = await getPrismaClient();
  await prisma.$connect();

  const postgresHostId = await resolvePostgresHostId(prisma, hostId);

  if (!postgresHostId) {
    throw new Error(`Host ${hostId} nao encontrado no PostgreSQL.`);
  }

  const now = new Date();
  const todayStart = toStartOfDay(now);
  const todayEnd = toEndOfDay(now);
  const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEndDate = toEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const monthFrom = toDateOnlyMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  const monthTo = toDateOnlyMonth(now);
  const currentMonth = toDateOnlyMonth(now);
  const previousMonthStart = toDateOnlyMonth(previousMonth(now));
  const bookingDateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const bookingDateTo = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const [
    placeRows,
    bookingRows,
    operationalSnapshotRows,
    dashboardRows,
    monthlyRevenueRows,
    occupancyRows,
    reviewRows,
    placeRevenueRows,
    financialRows,
    paymentStatusRows,
    bookingStatusRows,
    reviewReportRows,
  ] = await Promise.all([
    getHostDashboardPlaces(prisma, { hostId: postgresHostId }),
    getHostDashboardBookings(prisma, {
      hostId: postgresHostId,
      dateFrom: bookingDateFrom,
      dateTo: bookingDateTo,
      limit: 750,
    }),
    getHostDashboardOperationalSnapshot(prisma, {
      hostId: postgresHostId,
      todayStart,
      todayEnd,
      monthStart: monthStartDate,
      monthEnd: monthEndDate,
    }),
    getHostDashboardSummaryMonthly(prisma, { hostId: postgresHostId, monthFrom, monthTo, limit: 6 }),
    getHostMonthlyRevenue(prisma, { hostId: postgresHostId, monthFrom, monthTo, limit: 6 }),
    getPlaceOccupancyMonthly(prisma, { hostId: postgresHostId, monthFrom, monthTo, limit: 100 }),
    getPlaceReviewSummary(prisma, { hostId: postgresHostId, limit: 100 }),
    getPlaceMonthlyRevenue(prisma, { hostId: postgresHostId, monthFrom: currentMonth, monthTo: currentMonth, limit: 100 }),
    getHostFinancialSummaryMonthly(prisma, { hostId: postgresHostId, monthFrom: previousMonthStart, monthTo: currentMonth, limit: 12 }),
    getPaymentStatusReport(prisma, { hostId: postgresHostId, monthFrom, monthTo, limit: 100 }),
    getBookingStatusReport(prisma, { hostId: postgresHostId, monthFrom, monthTo, limit: 100 }),
    getReviewSummaryReport(prisma, { hostId: postgresHostId, limit: 100 }),
  ]);

  const operationalSnapshot = operationalSnapshotRows[0] || {};
  const financialSummary = buildFinancialSummary({
    dashboardRows,
    financialRows,
    placeRevenueRows,
    operationalSnapshot,
  });
  const current = dashboardRows[0] || {};
  const places = placeRows.map((row) => {
    const reviewRow = reviewRows.find((item) => String(item.place_id) === String(row.id));
    return mapPlace(row, reviewRow);
  });
  const bookings = bookingRows.map(mapBooking);
  const calendar = buildCalendar({
    bookings,
    places,
    monthStart: monthStartDate,
    monthEnd: monthEndDate,
  });
  const occupancyRate =
    occupancyRows.length > 0
      ? occupancyRows.reduce((sum, row) => sum + toNumber(row.occupancy_rate_percent), 0) /
        occupancyRows.length
      : 0;

  const operationalProperties = places.map((place) => {
    const occupancy = occupancyRows.find((item) => String(item.place_id) === String(place.id));
    const revenue = placeRevenueRows.find((item) => String(item.place_id) === String(place.id));
    const review = reviewRows.find((item) => String(item.place_id) === String(place.id));
    const propertyAlerts = [];
    const propertyOccupancy = occupancy ? toNumber(occupancy.occupancy_rate_percent) : 0;
    const rating = review?.average_rating === null || review?.average_rating === undefined
      ? place.averageRating
      : toNumber(review.average_rating);

    if (!place.isActive) {
      propertyAlerts.push({
        id: `property-${place.id}-inactive`,
        type: "place",
        severity: "critical",
        title: "Anuncio inativo",
        message: `${place.title || "Acomodacao"} esta fora do ar.`,
      });
    }
    if (propertyOccupancy > 0 && propertyOccupancy < 35) {
      propertyAlerts.push({
        id: `property-${place.id}-low-occupancy`,
        type: "performance",
        severity: "warning",
        title: "Baixa ocupacao",
        message: `${place.title || "Acomodacao"} esta com ocupacao abaixo do esperado.`,
      });
    }
    if (rating && rating < 4.5) {
      propertyAlerts.push({
        id: `property-${place.id}-rating`,
        type: "review",
        severity: "warning",
        title: "Avaliacao em atencao",
        message: `${place.title || "Acomodacao"} tem nota abaixo de 4.5.`,
      });
    }

    const status =
      propertyAlerts.some((alert) => alert.severity === "critical")
        ? "critical"
        : propertyAlerts.some((alert) => alert.severity === "warning")
          ? "warning"
          : "healthy";

    return {
      ...place,
      photo: null,
      averageRating: rating || null,
      reviewCount: toNumber(review?.reviews_count),
      monthlyRevenue: toNumber(revenue?.booking_gross_revenue),
      monthlyNetRevenue: toNumber(revenue?.approved_payment_net),
      monthlyFees: toNumber(revenue?.booking_gross_revenue) * HOST_FEE_RATE,
      occupancyRate: propertyOccupancy,
      activeBookings: toNumber(revenue?.bookings_count),
      alerts: propertyAlerts,
      status,
      statusLabel:
        status === "critical"
          ? "Critico"
          : status === "warning"
            ? "Imoveis com alerta"
            : "Operacao saudavel",
      source: "postgres",
    };
  });
  const allAlerts = operationalProperties.flatMap((property) => property.alerts || []);
  const alertGroups = {
    critical: allAlerts.filter((alert) => alert.severity === "critical"),
    warning: allAlerts.filter((alert) => alert.severity === "warning"),
    info: allAlerts.filter((alert) => alert.severity === "info"),
  };
  const priorityAlerts = [...allAlerts].sort((a, b) => {
    const weight = { critical: 3, warning: 2, info: 1 };
    return (weight[b.severity] || 0) - (weight[a.severity] || 0);
  });
  const upcomingMovements = calendar.events
    .filter((event) => (event.type === "checkin" || event.type === "checkout") && new Date(event.startDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 12);
  const upcomingMovementGroups = {
    checkins: upcomingMovements.filter((event) => event.type === "checkin"),
    checkouts: upcomingMovements.filter((event) => event.type === "checkout"),
  };
  const totalAvailableNights = occupancyRows.reduce((sum, row) => sum + toNumber(row.available_nights), 0);

  const metrics = {
    occupancyRate,
    averageNightPrice:
      toNumber(current.booked_nights) > 0
        ? toNumber(current.booking_gross_revenue) / toNumber(current.booked_nights)
        : 0,
    totalBookings: toNumber(current.bookings_count),
    averageRating:
      reviewRows.filter((row) => row.average_rating !== null).length > 0
        ? reviewRows.reduce((sum, row) => sum + toNumber(row.average_rating), 0) /
          reviewRows.filter((row) => row.average_rating !== null).length
        : null,
    availableNightEarnings:
      totalAvailableNights > 0 ? financialSummary.monthlyGrossRevenue / totalAvailableNights : 0,
  };

  const overview = buildOverview({
    dashboardRows,
    reviewRows,
    financialSummary,
    metrics,
    places,
    operationalProperties,
    operationalSnapshot,
    alertGroups,
  });
  const financialSummaryCards = [
    makeFinancialMetric({
      key: "monthlyGrossRevenue",
      label: "Receita bruta do mes",
      value: financialSummary.monthlyGrossRevenue,
      helper: "View PostgreSQL v_host_dashboard_summary_monthly",
      tone: "green",
    }),
    makeFinancialMetric({
      key: "monthlyNetRevenue",
      label: "Receita liquida do mes",
      value: financialSummary.monthlyNetRevenue,
      helper: "Pagamentos aprovados menos reembolsos",
      tone: "green",
    }),
    makeFinancialMetric({
      key: "operatingExpenses",
      label: "Despesas operacionais",
      value: financialSummary.operatingExpenses,
      helper: "Taxas conhecidas no PostgreSQL",
      tone: financialSummary.operatingExpenses > 0 ? "amber" : "slate",
    }),
    makeFinancialMetric({
      key: "estimatedProfit",
      label: "Lucro estimado",
      value: financialSummary.estimatedProfit,
      helper: "Receita liquida menos despesas conhecidas",
      tone: financialSummary.estimatedProfit >= 0 ? "green" : "red",
    }),
    makeFinancialMetric({
      key: "futureRevenue",
      label: "Receita futura",
      value: financialSummary.futureRevenue,
      helper: "Reservas futuras confirmadas",
      tone: "blue",
    }),
    makeFinancialMetric({
      key: "availableNightEarnings",
      label: "Ganho por noite disponivel",
      value: metrics.availableNightEarnings,
      helper: "Receita bruta mensal por noite disponivel",
      tone: "violet",
    }),
  ];
  const revenueOverTime = buildRevenueOverTime(monthlyRevenueRows);
  const occupancyOverTime = buildOccupancyOverTime(occupancyRows);
  const lowOccupancyPeriods = occupancyOverTime
    .filter((item) => item.occupancyRate < 35)
    .map((item) => ({
      key: item.key,
      label: item.label,
      occupancyRate: Math.round(item.occupancyRate),
      status: "attention",
    }));
  const financialComposition = buildFinancialComposition(financialSummary);
  const ledger = buildLedgerSummary(financialSummary);
  const paymentMovementItems = buildPaymentMovementItems(paymentStatusRows);
  const bookingStatusMap = new Map(
    bookingStatusRows.map((row) => [String(row.booking_status), toNumber(row.bookings_count)])
  );
  const reports = {
    source: "postgres",
    period: {
      key: "current_month",
      label: "Mes atual",
      start: monthStartDate,
      end: monthEndDate,
    },
    filters: {
      periods: [
        { key: "current_month", label: "Mes atual", available: true },
        { key: "previous_month", label: "Mes anterior", available: true },
        { key: "last_3_months", label: "Ultimos 3 meses", available: true },
        { key: "last_6_months", label: "Ultimos 6 meses", available: true },
      ],
      accommodations: [
        { key: "all", label: "Todas as acomodacoes", available: true },
        ...operationalProperties.map((property) => ({
          key: property.id,
          label: property.title,
          available: true,
        })),
      ],
      reservationStatuses: [
        { key: "all", label: "Todos os status", available: true },
        ...bookingStatusRows.map((row) => ({
          key: String(row.booking_status),
          label: statusMeta(String(row.booking_status)).label,
          available: true,
        })),
      ],
      reportTypes: [
        { key: "financial", label: "Financeiro", available: true },
        { key: "bookings", label: "Reservas", available: true },
        { key: "occupancy", label: "Ocupacao", available: true },
        { key: "properties", label: "Por acomodacao", available: true },
        { key: "operational", label: "Operacional", available: true },
      ],
    },
    summaryCards: financialSummaryCards,
    financial: {
      grossRevenue: financialSummary.monthlyGrossRevenue,
      netRevenue: financialSummary.monthlyNetRevenue,
      manualRevenue: 0,
      recurringExpenses: 0,
      operationalExpenses: financialSummary.operatingExpenses,
      paymentFees: 0,
      refunds: toNumber(current.refunded_amount),
      accountingNetRevenue: financialSummary.estimatedProfit,
      fiscalNetRevenue: financialSummary.estimatedProfit,
      operatingExpenses: financialSummary.operatingExpenses,
      estimatedProfit: financialSummary.estimatedProfit,
      contributionMargin: financialSummary.profitMargin,
      composition: financialComposition,
      ledger,
      items: financialSummaryCards,
    },
    bookings: {
      total: toNumber(operationalSnapshot.total_bookings),
      pending: bookingStatusMap.get("PENDING") || 0,
      approved: bookingStatusMap.get("CONFIRMED") || 0,
      inProgress: bookingStatusMap.get("IN_PROGRESS") || 0,
      completed: bookingStatusMap.get("COMPLETED") || 0,
      CANCELLED: (bookingStatusMap.get("CANCELLED") || 0) + (bookingStatusMap.get("REJECTED") || 0),
      byStatus: bookingStatusRows.map((row) => ({
        key: String(row.booking_status),
        label: statusMeta(String(row.booking_status)).label,
        value: toNumber(row.bookings_count),
      })),
      raw: bookingStatusRows,
    },
    occupancy: {
      average: occupancyRate,
      reservedDays: occupancyRows.reduce((sum, row) => sum + toNumber(row.occupied_nights), 0),
      availableDays: totalAvailableNights,
      emptyDays: Math.max(
        0,
        totalAvailableNights - occupancyRows.reduce((sum, row) => sum + toNumber(row.occupied_nights), 0)
      ),
      bookingLeadTime: null,
      lowOccupancyPeriods,
      items: occupancyRows,
    },
    paymentStatus: paymentStatusRows,
    reviews: reviewReportRows,
    revenue: monthlyRevenueRows,
    properties: operationalProperties,
    operational: {
      items: overview.operationalRisks.items,
      unavailableData: [
        "Pre-check-in, incidentes e manutencoes ainda dependem de dominios operacionais fora das views analiticas.",
      ],
    },
    charts: {
      revenueProjection: buildRevenueProjection(monthlyRevenueRows),
      propertyPerformance: operationalProperties.slice(0, 6),
      revenueOverTime,
      occupancyOverTime,
      performanceByProperty: operationalProperties.slice(0, 6).map((property) => ({
        id: property.id,
        title: property.title,
        revenue: property.monthlyRevenue,
        occupancyRate: property.occupancyRate,
        status: property.status,
      })),
    },
  };

  const dashboardPayload = {
    source: "postgres",
    postgresHostId,
    bookings,
    places,
    calendar: {
      events: calendar.events,
      emptyDays: calendar.emptyDays,
      month: {
        start: monthStartDate,
        end: monthEndDate,
      },
    },
    today: {
      checkins: toNumber(operationalSnapshot.checkins_today),
      checkouts: toNumber(operationalSnapshot.checkouts_today),
      pendingBookings: toNumber(operationalSnapshot.pending_bookings),
      pendingTasks: 0,
    },
    finance: {
      monthlyEarnings: financialSummary.monthlyGrossRevenue,
      monthlyGrossRevenue: financialSummary.monthlyGrossRevenue,
      monthlyNetRevenue: financialSummary.monthlyNetRevenue,
      futureEarnings: financialSummary.futureRevenue,
      futureRevenue: financialSummary.futureRevenue,
      totalFees: financialSummary.totalFees,
      operatingExpenses: financialSummary.operatingExpenses,
      estimatedProfit: financialSummary.estimatedProfit,
      profitMargin: financialSummary.profitMargin,
      averagePerNight: metrics.averageNightPrice,
      availableNightEarnings: metrics.availableNightEarnings,
      revPAR: metrics.availableNightEarnings,
    },
    financial: {
      period: {
        key: "current_month",
        label: "Mes atual",
        start: monthStartDate,
        end: monthEndDate,
      },
      filters: [
        { key: "current_month", label: "Mes atual", available: true },
        { key: "previous_month", label: "Mes anterior", available: true },
        { key: "upcoming_receivables", label: "Proximos recebimentos", available: true },
        { key: "by_property", label: "Por acomodacao", available: true },
        { key: "by_payment_status", label: "Por status do pagamento", available: true },
      ],
      summaryCards: financialSummaryCards,
      revenue: {
        items: [
          makeFinancialMetric({ key: "grossRevenue", label: "Receita bruta", value: financialSummary.monthlyGrossRevenue, tone: "green" }),
          makeFinancialMetric({ key: "netRevenue", label: "Receita liquida", value: financialSummary.monthlyNetRevenue, tone: "green" }),
          makeFinancialMetric({ key: "futureRevenue", label: "Receita futura", value: financialSummary.futureRevenue, tone: "blue" }),
          makeFinancialMetric({ key: "approvedPayments", label: "Pagamentos aprovados", value: financialSummary.approvedPaymentsTotal, tone: "green" }),
          makeFinancialMetric({ key: "pendingPayments", label: "Pagamentos pendentes", value: financialSummary.pendingPaymentsTotal, tone: "amber" }),
        ],
        raw: monthlyRevenueRows,
      },
      expenses: {
        items: [
          makeFinancialMetric({
            key: "platformFees",
            label: "Taxas da plataforma",
            value: financialSummary.totalFees,
            helper: "Taxas conhecidas pelo motor analitico PostgreSQL",
            tone: financialSummary.totalFees > 0 ? "amber" : "slate",
          }),
          makeUnavailableFinancialMetric(
            "paymentFees",
            "Taxas de pagamento",
            "Depende de repasses detalhados do provedor de pagamento."
          ),
          makeUnavailableFinancialMetric(
            "cleaning",
            "Limpeza",
            "Depende de despesas operacionais de limpeza persistidas."
          ),
          makeUnavailableFinancialMetric(
            "maintenance",
            "Manutencao",
            "Depende do dominio de manutencao e danos."
          ),
        ],
        raw: financialRows,
      },
      profitability: {
        items: [
          makeFinancialMetric({ key: "estimatedProfit", label: "Lucro estimado", value: financialSummary.estimatedProfit, tone: financialSummary.estimatedProfit >= 0 ? "green" : "red" }),
          makeFinancialMetric({ key: "profitMargin", label: "Margem de lucro", value: financialSummary.profitMargin, format: "percent", tone: "green", available: financialSummary.profitMargin !== null }),
          makeFinancialMetric({ key: "availableNightEarnings", label: "Ganho por noite disponivel", value: metrics.availableNightEarnings, tone: "violet" }),
          makeFinancialMetric({ key: "averageDailyRate", label: "Diaria media", value: metrics.averageNightPrice, tone: "blue" }),
        ],
      },
      properties: financialSummary.properties,
      paymentsRefunds: paymentMovementItems,
      comparison: {
        currentMonth: {
          grossRevenue: financialSummary.monthlyGrossRevenue,
          netRevenue: financialSummary.monthlyNetRevenue,
          operatingExpenses: financialSummary.operatingExpenses,
          estimatedProfit: financialSummary.estimatedProfit,
        },
        previousMonth: (() => {
          const previous =
            dashboardRows.find((row) =>
              String(row.summary_month).startsWith(previousMonthStart.slice(0, 7))
            ) || null;

          if (!previous) return null;

          const grossRevenue = toNumber(previous.booking_gross_revenue);
          const netRevenue = toNumber(previous.approved_payment_net);
          const operatingExpenses = grossRevenue * HOST_FEE_RATE;

          return {
            grossRevenue,
            netRevenue,
            operatingExpenses,
            estimatedProfit: netRevenue - operatingExpenses,
          };
        })(),
      },
      composition: financialComposition,
      ledger,
      unavailableData: [
        "Pre-check-in, incidentes, manutencoes e despesas operacionais detalhadas ainda nao possuem views PostgreSQL equivalentes.",
      ],
    },
    metrics,
    tasks: [],
    overview,
    operationalProperties,
    cleaningInspection: null,
    upcomingMovements,
    upcomingMovementGroups,
    charts: {
      revenueProjection: buildRevenueProjection(monthlyRevenueRows),
      propertyPerformance: operationalProperties.slice(0, 6).map((property) => ({
        id: property.id,
        name: property.title?.slice(0, 16) || "Acomodacao",
        revenue: property.monthlyRevenue,
        occupancyRate: property.occupancyRate,
        status: property.status,
      })),
      revenueOverTime,
      occupancyOverTime,
      performanceByProperty: operationalProperties.slice(0, 6).map((property) => ({
        id: property.id,
        title: property.title,
        revenue: property.monthlyRevenue,
        occupancyRate: property.occupancyRate,
        status: property.status,
      })),
    },
    reports,
    alertGroups,
    priorityAlerts,
    alerts: allAlerts,
  };

  return normalizeDashboardPayloadForJson(dashboardPayload);
}
