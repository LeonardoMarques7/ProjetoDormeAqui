import Booking from "../bookings/model.js";
import Place from "../places/model.js";
import "../users/model.js";
import Notification from "../../NotificationModel.js";
import { buildCleaningInspectionData } from "../cleaningInspection/service.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const HOST_FEE_RATE = 0.1;

const DAY_LABELS = {
  sunday: "Dom",
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
};

const ACTIVE_BOOKING_STATUSES = new Set([
  "pending",
  "confirmed",
  "in_progress",
  "evaluation",
  "review",
  "completed",
]);

const CANCELED_BOOKING_STATUSES = new Set(["canceled", "rejected"]);

const PAYMENT_STATUS_LABELS = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Cancelado",
  canceled: "Cancelado",
  refunded: "Reembolsado",
  in_review: "Em análise",
};

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

const overlapDays = (startA, endA, startB, endB) => {
  const start = Math.max(startA.getTime(), startB.getTime());
  const end = Math.min(endA.getTime(), endB.getTime());
  if (end <= start) return 0;
  return Math.ceil((end - start) / ONE_DAY_MS);
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

const getStatusMeta = (status) => {
  if (status === "confirmed") return { label: "Confirmada", color: "#16a34a" };
  if (status === "pending") return { label: "Pendente", color: "#f59e0b" };
  if (status === "canceled" || status === "rejected") {
    return { label: "Cancelada", color: "#dc2626" };
  }
  if (status === "in_progress") return { label: "Em andamento", color: "#2563eb" };
  if (status === "evaluation") return { label: "Avaliação", color: "#8b5cf6" };
  if (status === "review") return { label: "Revisão", color: "#ea580c" };
  if (status === "completed") return { label: "Finalizada", color: "#6b7280" };
  return { label: "Ativa", color: "#111827" };
};

const monthLabel = (date) =>
  ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
    date.getMonth()
  ];

const buildRevenueSeries = (bookings) => {
  const revenueBookings = bookings
    .filter((booking) => {
      const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
      const status = String(booking.status || "").toLowerCase();
      return (
        paymentStatus === "approved" &&
        !CANCELED_BOOKING_STATUSES.has(status) &&
        booking.checkout &&
        Number(booking.priceTotal || 0) > 0
      );
    })
    .sort((a, b) => new Date(a.checkout) - new Date(b.checkout));

  const anchorDate = revenueBookings.length
    ? new Date(revenueBookings[revenueBookings.length - 1].checkout)
    : new Date();
  const byMonth = new Map();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    byMonth.set(key, {
      key,
      mes: monthLabel(date),
      receita: 0,
      projecao: null,
      tipo: "real",
    });
  }

  for (const booking of revenueBookings) {
    const checkoutDate = new Date(booking.checkout);
    const key = `${checkoutDate.getFullYear()}-${checkoutDate.getMonth()}`;
    if (byMonth.has(key)) {
      byMonth.get(key).receita += Number(booking.priceTotal || 0);
    }
  }

  const series = Array.from(byMonth.values());
  const lastMonth = series[series.length - 1];
  const previousMonth = series[series.length - 2];
  const growth =
    previousMonth?.receita > 0
      ? (lastMonth.receita - previousMonth.receita) / previousMonth.receita
      : 0;
  const projectionDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
  lastMonth.projecao = lastMonth.receita;
  series.push({
    key: `${projectionDate.getFullYear()}-${projectionDate.getMonth()}`,
    mes: `${monthLabel(projectionDate)} (proj.)`,
    receita: null,
    projecao: Math.max(0, lastMonth.receita * (1 + growth)),
    tipo: "projecao",
  });

  return series;
};

const makeAlert = ({ id, severity, title, message, type = "operation" }) => ({
  id,
  type,
  severity,
  title,
  message,
});

const makeOverviewKpi = ({
  key,
  label,
  value = null,
  format = "number",
  helper = "",
  tone = "slate",
  status = "neutral",
  available = true,
}) => ({
  key,
  label,
  value,
  format,
  helper,
  tone,
  status,
  available,
});

const makeFinancialMetric = ({
  key,
  label,
  value = null,
  format = "currency",
  helper = "",
  tone = "slate",
  available = true,
}) => ({
  key,
  label,
  value,
  format,
  helper,
  tone,
  available,
});

const makeUnavailableFinancialMetric = (key, label, helper) =>
  makeFinancialMetric({
    key,
    label,
    value: null,
    helper,
    tone: "slate",
    available: false,
  });

const buildOverviewPayload = ({
  checkinsToday,
  checkoutsToday,
  pendingBookings,
  monthlyGrossRevenue,
  futureRevenue,
  operatingExpenses,
  estimatedProfit,
  availableNightEarnings,
  metrics,
  places,
  operationalProperties,
  alertGroups,
}) => {
  const propertiesWithAlerts = operationalProperties.filter((property) =>
    ["critical", "warning"].includes(property.status)
  ).length;
  const criticalAlerts = alertGroups.critical.length;
  const activeProperties = places.filter((place) => place.isActive).length;
  const pendingPreCheckins = null;
  const pendingCleanings = null;
  const pendingInspections = null;
  const openIncidents = null;

  return {
    actionsToday: {
      checkins: checkinsToday,
      checkouts: checkoutsToday,
      pendingBookings,
      pendingPreCheckins,
      pendingCleanings,
      items: [
        makeOverviewKpi({
          key: "checkinsToday",
          label: "Entradas hoje",
          value: checkinsToday,
          helper: "Check-ins previstos para hoje",
          tone: "green",
          status: checkinsToday > 0 ? "action" : "neutral",
        }),
        makeOverviewKpi({
          key: "checkoutsToday",
          label: "Saídas hoje",
          value: checkoutsToday,
          helper: "Check-outs previstos para hoje",
          tone: "amber",
          status: checkoutsToday > 0 ? "action" : "neutral",
        }),
        makeOverviewKpi({
          key: "pendingBookings",
          label: "Reservas pendentes",
          value: pendingBookings,
          helper: "Aguardando confirmação",
          tone: "blue",
          status: pendingBookings > 0 ? "attention" : "neutral",
        }),
        makeOverviewKpi({
          key: "pendingPreCheckins",
          label: "Pré-check-ins pendentes",
          value: pendingPreCheckins,
          helper: "Dados indisponíveis no back-end atual",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeOverviewKpi({
          key: "pendingCleanings",
          label: "Limpezas pendentes",
          value: pendingCleanings,
          helper: "Dados indisponíveis no back-end atual",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
      ],
    },
    operationalRisks: {
      propertiesWithAlerts,
      pendingInspections,
      openIncidents,
      criticalAlerts,
      items: [
        makeOverviewKpi({
          key: "propertiesWithAlerts",
          label: "Imóveis com alerta",
          value: propertiesWithAlerts,
          helper: "Imóveis com status crítico ou de atenção",
          tone: propertiesWithAlerts > 0 ? "amber" : "green",
          status: propertiesWithAlerts > 0 ? "attention" : "healthy",
        }),
        makeOverviewKpi({
          key: "pendingInspections",
          label: "Vistorias pendentes",
          value: pendingInspections,
          helper: "Dados indisponíveis no back-end atual",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeOverviewKpi({
          key: "openIncidents",
          label: "Ocorrências abertas",
          value: openIncidents,
          helper: "Dados indisponíveis no back-end atual",
          tone: "slate",
          status: "unavailable",
          available: false,
        }),
        makeOverviewKpi({
          key: "criticalAlerts",
          label: "Alertas críticos",
          value: criticalAlerts,
          helper: "Itens que exigem ação imediata",
          tone: criticalAlerts > 0 ? "red" : "green",
          status: criticalAlerts > 0 ? "critical" : "healthy",
        }),
      ],
    },
    financialSummary: {
      revenueType: "gross",
      monthlyGrossRevenue,
      operatingExpenses,
      estimatedProfit,
      futureRevenue,
      availableNightEarnings,
      items: [
        makeOverviewKpi({
          key: "monthlyGrossRevenue",
          label: "Receita bruta do mês",
          value: monthlyGrossRevenue,
          format: "currency",
          helper: "Reservas aprovadas com check-out no mês",
          tone: "green",
          status: "neutral",
        }),
        makeOverviewKpi({
          key: "operatingExpenses",
          label: "Despesas operacionais",
          value: operatingExpenses,
          format: "currency",
          helper: "Custos estimados da operação",
          tone: operatingExpenses > 0 ? "amber" : "slate",
          status: operatingExpenses > 0 ? "attention" : "neutral",
        }),
        makeOverviewKpi({
          key: "estimatedProfit",
          label: "Lucro estimado",
          value: estimatedProfit,
          format: "currency",
          helper: "Receita bruta menos despesas operacionais conhecidas",
          tone: estimatedProfit >= 0 ? "green" : "red",
          status: estimatedProfit >= 0 ? "healthy" : "critical",
        }),
        makeOverviewKpi({
          key: "futureRevenue",
          label: "Receita futura",
          value: futureRevenue,
          format: "currency",
          helper: "Reservas futuras confirmadas e aprovadas",
          tone: "blue",
          status: "neutral",
        }),
        makeOverviewKpi({
          key: "availableNightEarnings",
          label: "Ganho por noite disponível",
          value: availableNightEarnings,
          format: "currency",
          helper: "Receita bruta mensal dividida pelas noites disponíveis",
          tone: "violet",
          status: "neutral",
        }),
      ],
    },
    performanceSummary: {
      activeProperties,
      occupancyRate: metrics.occupancyRate,
      averageRating: metrics.averageRating,
      averageDailyRate: metrics.averageNightPrice,
      items: [
        makeOverviewKpi({
          key: "activeProperties",
          label: "Imóveis ativos",
          value: activeProperties,
          helper: `${places.length} imóveis cadastrados`,
          tone: "blue",
          status: "neutral",
        }),
        makeOverviewKpi({
          key: "occupancyRate",
          label: "Ocupação média",
          value: metrics.occupancyRate,
          format: "percent",
          helper: "Média do mês atual",
          tone: "green",
          status: metrics.occupancyRate < 35 ? "attention" : "healthy",
        }),
        makeOverviewKpi({
          key: "averageRating",
          label: "Avaliação média",
          value: metrics.averageRating,
          format: "rating",
          helper: metrics.averageRating ? "Média dos imóveis avaliados" : "Sem avaliações suficientes",
          tone: "violet",
          status: metrics.averageRating && metrics.averageRating < 4.5 ? "attention" : "neutral",
          available: metrics.averageRating !== null,
        }),
        makeOverviewKpi({
          key: "averageDailyRate",
          label: "Diária média",
          value: metrics.averageNightPrice,
          format: "currency",
          helper: "Média por noite reservada",
          tone: "slate",
          status: "neutral",
        }),
      ],
    },
    unavailableData: [
      {
        key: "pendingPreCheckins",
        label: "Pré-check-ins pendentes",
        requiredBackend: "Criar domínio ou campo de pré-check-in vinculado à reserva.",
      },
      {
        key: "pendingCleanings",
        label: "Limpezas pendentes",
        requiredBackend: "Criar domínio de tarefas de limpeza entre check-out e próximo check-in.",
      },
      {
        key: "pendingInspections",
        label: "Vistorias pendentes",
        requiredBackend: "Criar domínio de vistorias com status e prazo.",
      },
      {
        key: "openIncidents",
        label: "Ocorrências abertas",
        requiredBackend: "Criar domínio de ocorrências/manutenção/danos com severidade.",
      },
    ],
  };
};

export const buildHostDashboardData = async (hostId) => {
  const now = new Date();
  const todayEnd = toEndOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = toEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = toEndOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
  const monthDays = eachDayBetween(monthStart, monthEnd);
  const cleaningInspection = await buildCleaningInspectionData(hostId);

  const places = await Place.find({ owner: hostId })
    .select("title city price averageRating isActive checkin checkout photos guests rooms beds bathrooms perks")
    .lean();

  const placeIds = places.map((place) => place._id);

  if (placeIds.length === 0) {
    return {
      bookings: [],
      places: [],
      calendar: {
        events: [],
        emptyDays: monthDays.map((day) => ({
          date: toIsoDay(day),
          label: DAY_LABELS[
            day
              .toLocaleString("en-US", { weekday: "long" })
              .toLowerCase()
          ],
        })),
        month: {
          start: monthStart,
          end: monthEnd,
        },
      },
      today: {
        checkins: 0,
        checkouts: 0,
        pendingBookings: 0,
        pendingTasks: 0,
      },
      finance: {
        monthlyEarnings: 0,
        monthlyGrossRevenue: 0,
        monthlyNetRevenue: 0,
        futureEarnings: 0,
        futureRevenue: 0,
        totalFees: 0,
        operatingExpenses: 0,
        estimatedProfit: 0,
        profitMargin: null,
        averagePerNight: 0,
        availableNightEarnings: 0,
        revPAR: 0,
      },
      financial: {
        period: {
          key: "current_month",
          label: "Mês atual",
          start: monthStart,
          end: monthEnd,
        },
        filters: [
          { key: "current_month", label: "Mês atual", available: true },
          { key: "previous_month", label: "Mês anterior", available: true },
          { key: "upcoming_receivables", label: "Próximos recebimentos", available: true },
          { key: "by_property", label: "Por acomodação", available: true },
          { key: "by_payment_status", label: "Por status do pagamento", available: true },
        ],
        summaryCards: [],
        revenue: { items: [] },
        expenses: { items: [] },
        profitability: { items: [] },
        properties: [],
        paymentsRefunds: [],
        comparison: {
          currentMonth: null,
          previousMonth: null,
          unavailableReason: "Sem acomodações cadastradas.",
        },
        unavailableData: [
          "Receita líquida real depende de taxas, impostos e repasses persistidos.",
          "Despesas detalhadas por categoria dependem de um domínio financeiro de despesas.",
          "Reembolsos dependem de registros persistidos de estorno.",
        ],
      },
      metrics: {
        occupancyRate: 0,
        averageNightPrice: 0,
        totalBookings: 0,
        averageRating: null,
      },
      tasks: [],
      overview: buildOverviewPayload({
        checkinsToday: 0,
        checkoutsToday: 0,
        pendingBookings: 0,
        monthlyGrossRevenue: 0,
        futureRevenue: 0,
        operatingExpenses: 0,
        estimatedProfit: 0,
        availableNightEarnings: 0,
        metrics: {
          occupancyRate: 0,
          averageNightPrice: 0,
          averageRating: null,
        },
        places: [],
        operationalProperties: [],
        alertGroups: {
          critical: [],
          warning: [],
          info: [],
        },
      }),
      operationalProperties: [],
      cleaningInspection,
      upcomingMovements: [],
      upcomingMovementGroups: {
        checkins: [],
        checkouts: [],
      },
      charts: {
        revenueProjection: [],
        propertyPerformance: [],
      },
      alertGroups: {
        critical: [],
        warning: [],
        info: [
          {
            id: "no-places-alert",
            type: "place",
            severity: "info",
            title: "Sem anúncios cadastrados",
            message: "Cadastre uma acomodação para começar a receber reservas.",
          },
        ],
      },
      priorityAlerts: [
        {
          id: "no-places-alert",
          type: "place",
          severity: "info",
          title: "Sem anúncios cadastrados",
          message: "Cadastre uma acomodação para começar a receber reservas.",
        },
      ],
      alerts: [
        {
          id: "no-places-alert",
          type: "place",
          severity: "info",
          title: "Sem anúncios cadastrados",
          message: "Cadastre uma acomodação para começar a receber reservas.",
        },
      ],
    };
  }

  const bookings = await Booking.find({ place: { $in: placeIds } })
    .sort({ createdAt: -1 })
    .populate("user", "name email photo")
    .populate("place", "title city price averageRating isActive checkin checkout photos owner")
    .lean();

  const placeById = new Map(places.map((place) => [String(place._id), place]));
  const propertyBuckets = new Map(
    places.map((place) => [
      String(place._id),
      {
        place,
        activeBookings: 0,
        monthlyRevenue: 0,
        monthlyFees: 0,
        monthlyNetRevenue: 0,
        totalRevenue: 0,
        bookedNights: 0,
        monthlyBookedNights: 0,
        futureEvents: [],
      },
    ])
  );
  const occupiedDaySet = new Set();
  const calendarEvents = [];

  let checkinsToday = 0;
  let checkoutsToday = 0;
  let pendingBookings = 0;
  let monthlyEarnings = 0;
  let futureEarnings = 0;
  let totalFees = 0;
  let previousMonthEarnings = 0;
  let previousMonthFees = 0;
  let approvedPaymentsTotal = 0;
  let pendingPaymentsTotal = 0;
  let approvedFutureBookingsTotal = 0;
  let totalNights = 0;
  let totalNightsPrice = 0;
  let occupancyBookedNights = 0;
  const paymentsRefunds = [];

  for (const booking of bookings) {
    const checkinDate = new Date(booking.checkin);
    const checkoutDate = new Date(booking.checkout);
    const status = booking.status || "pending";
    const paymentStatus = booking.paymentStatus || "pending";
    const bookingIsCanceled = CANCELED_BOOKING_STATUSES.has(status);
    const bookingIsActive = ACTIVE_BOOKING_STATUSES.has(status) && !bookingIsCanceled;
    const bookingTotal = Number(booking.priceTotal || 0);
    const bookingNights = Number(booking.nights || 0);
    const place = booking.place || placeById.get(String(booking.place));
    const placeId = String(place?._id || booking.place || "");
    const propertyBucket = propertyBuckets.get(placeId);
    const statusMeta = getStatusMeta(status);

    if (toIsoDay(checkinDate) === toIsoDay(now) && bookingIsActive) checkinsToday += 1;
    if (toIsoDay(checkoutDate) === toIsoDay(now) && bookingIsActive) checkoutsToday += 1;

    if (status === "pending") {
      pendingBookings += 1;
    }

    if (paymentStatus === "approved") {
      approvedPaymentsTotal += bookingTotal;
      if (checkoutDate <= todayEnd && checkoutDate >= monthStart && !bookingIsCanceled) {
        monthlyEarnings += bookingTotal;
        if (propertyBucket) {
          propertyBucket.monthlyRevenue += bookingTotal;
          propertyBucket.monthlyFees += bookingTotal * HOST_FEE_RATE;
        }
      }
      if (checkoutDate >= previousMonthStart && checkoutDate <= previousMonthEnd && !bookingIsCanceled) {
        previousMonthEarnings += bookingTotal;
        previousMonthFees += bookingTotal * HOST_FEE_RATE;
      }
      if (checkinDate > todayEnd && status === "confirmed") {
        futureEarnings += bookingTotal;
        approvedFutureBookingsTotal += bookingTotal;
      }
      totalFees += bookingTotal * HOST_FEE_RATE;
      if (!bookingIsCanceled && propertyBucket) propertyBucket.totalRevenue += bookingTotal;
    } else if (paymentStatus === "pending") {
      pendingPaymentsTotal += bookingTotal;
    }

    if (bookingNights > 0 && !bookingIsCanceled) {
      totalNights += bookingNights;
      totalNightsPrice += bookingTotal;
      if (propertyBucket) propertyBucket.bookedNights += bookingNights;
    }

    if (!bookingIsCanceled) {
      const overlapNights = overlapDays(checkinDate, checkoutDate, monthStart, monthEnd);
      occupancyBookedNights += overlapNights;
      if (propertyBucket) propertyBucket.monthlyBookedNights += overlapNights;
    }

    paymentsRefunds.push({
      id: String(booking._id),
      bookingId: String(booking._id),
      type: paymentStatus === "approved" ? "payment" : "payment_pending",
      label: paymentStatus === "approved" ? "Pagamento aprovado" : "Pagamento pendente",
      value: bookingTotal,
      date: booking.updatedAt || booking.createdAt || booking.checkin,
      reservation: String(booking._id).slice(-6).toUpperCase(),
      placeTitle: place?.title || "Acomodação",
      guestName: booking.user?.name || "Hóspede",
      status: paymentStatus,
      statusLabel: PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus || "Indisponível",
      available: true,
    });

    if (bookingIsActive) {
        if (propertyBucket) {
          propertyBucket.activeBookings += 1;
          if (checkinDate >= now) {
            propertyBucket.futureEvents.push({
              type: "Entrada",
              date: checkinDate,
              bookingId: String(booking._id),
              guest: booking.user?.name || "Hóspede",
              guestEmail: booking.user?.email || "",
              guestCount: booking?.guests || 1,
            });
          }
          if (checkoutDate >= now) {
            propertyBucket.futureEvents.push({
              type: "Saída",
              date: checkoutDate,
              bookingId: String(booking._id),
              guest: booking.user?.name || "Hóspede",
              guestEmail: booking.user?.email || "",
              guestCount: booking?.guests || 1,
            });
          }
        }

      const occupiedDays = eachDayBetween(checkinDate, checkoutDate);
      for (const day of occupiedDays) {
        if (day >= monthStart && day <= monthEnd) {
          occupiedDaySet.add(toIsoDay(day));
        }
      }
    }

      calendarEvents.push({
      id: `${booking._id}`,
      bookingId: String(booking._id),
      type: "checkin",
      title: `Check-in • ${place?.title || "Acomodação"}`,
      startDate: checkinDate,
      endDate: checkinDate,
      color: statusMeta.color,
      status: statusMeta.label,
      rawStatus: status,
      guest: booking.user?.name || "Hóspede",
      guestEmail: booking.user?.email || "",
      guestCount: booking?.guests || 1,
      guestId: booking.user?._id || "Não identificado",
      guestPhoto: booking.user?.photo || null,
      placeTitle: place?.title || "Acomodação",
      placeCity: place?.city || "",
      placeCheckin: place?.checkin || "",
      placeCheckout: place?.checkout || "",
      placePhoto: place?.photos?.[0] || null,
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: bookingNights,
      paymentStatus,
      total: bookingTotal,
    });

    calendarEvents.push({
      id: `${booking._id}`,
      bookingId: String(booking._id),
      type: "checkout",
      title: `Check-out • ${place?.title || "Acomodação"}`,
      startDate: checkoutDate,
      endDate: checkoutDate,
      color: statusMeta.color,
      status: statusMeta.label,
      rawStatus: status,
      guest: booking.user?.name || "Hóspede",
      guestEmail: booking.user?.email || "",
      guestCount: booking?.guests || 1,
      guestId: booking.user?._id || "Não identificado",
      guestPhoto: booking.user?.photo || null,
      placeTitle: place?.title || "Acomodação",
      placeCity: place?.city || "",
      placeCheckin: place?.checkin || "",
      placeCheckout: place?.checkout || "",
      placePhoto: place?.photos?.[0] || null,
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: bookingNights,
      paymentStatus,
      total: bookingTotal,
    });

    const stayDays = getDatesBetweenExclusive(checkinDate, checkoutDate);
    for (const day of stayDays) {
      calendarEvents.push({
        id: `${booking._id}-stay-${toIsoDay(day)}`,
        bookingId: String(booking._id),
        type: "stay",
        title: `Hospedagem • ${place?.title || "Acomodação"}`,
        startDate: day,
        endDate: day,
        color: statusMeta.color,
        status: statusMeta.label,
        rawStatus: status,
        guest: booking.user?.name || "Hóspede",
        guestEmail: booking.user?.email || "",
        guestCount: booking?.guests || 1,
        guestId: booking.user?._id || "Não identificado",
        guestPhoto: booking.user?.photo || null,
        placeTitle: place?.title || "Acomodação",
        placeCity: place?.city || "",
        placeCheckin: place?.checkin || "",
        placeCheckout: place?.checkout || "",
        placePhoto: place?.photos?.[0] || null,
        checkin: booking.checkin,
        checkout: booking.checkout,
        nights: bookingNights,
        paymentStatus,
        total: bookingTotal,
      });
    }

  }

  const emptyDays = monthDays
    .filter((day) => !occupiedDaySet.has(toIsoDay(day)))
    .map((day) => ({
      date: toIsoDay(day),
      label: DAY_LABELS[
        day
          .toLocaleString("en-US", { weekday: "long" })
          .toLowerCase()
      ],
    }));

  const unreadMessageCount = await Notification.countDocuments({
    userId: hostId,
    type: "message_received",
    read: false,
    dismissed: false,
  });

  const totalCapacityNights = places.length * monthDays.length;

  const metrics = {
    occupancyRate: totalCapacityNights > 0 ? (occupancyBookedNights / totalCapacityNights) * 100 : 0,
    averageNightPrice: totalNights > 0 ? totalNightsPrice / totalNights : 0,
    totalBookings: bookings.length,
    averageRating:
      places.filter((place) => Number(place.averageRating || 0) > 0).length > 0
        ? places
            .filter((place) => Number(place.averageRating || 0) > 0)
            .reduce((acc, place) => acc + Number(place.averageRating || 0), 0) /
          places.filter((place) => Number(place.averageRating || 0) > 0).length
        : null,
  };

  const alerts = [];

  if (unreadMessageCount > 0) {
    alerts.push({
      id: "alert-unread-messages",
      type: "messages",
      severity: "info",
      title: "Mensagens não respondidas",
      message: `Você tem ${unreadMessageCount} mensagem(ns) sem resposta.`,
    });
  }

  const operationalProperties = Array.from(propertyBuckets.values())
    .map((bucket) => {
      const { place } = bucket;
      const rating = Number(place.averageRating || 0);
      const occupancyRate =
        monthDays.length > 0 ? Math.min(100, Math.round((bucket.bookedNights / monthDays.length) * 100)) : 0;
      const averageDailyRate =
        bucket.bookedNights > 0
          ? Math.round(bucket.totalRevenue / bucket.bookedNights)
          : Number(place.price || 0);
      const propertyAlerts = [];

      if (!place.isActive) {
        propertyAlerts.push(makeAlert({
          id: `property-${place._id}-inactive`,
          severity: "critical",
          type: "place",
          title: "Anúncio inativo",
          message: `${place.title || "Acomodação"} está fora do ar.`,
        }));
      }
      if (bucket.activeBookings === 0) {
        propertyAlerts.push(makeAlert({
          id: `property-${place._id}-no-bookings`,
          severity: "warning",
          type: "place",
          title: "Sem reservas ativas",
          message: `${place.title || "Acomodação"} não possui reservas ativas no período.`,
        }));
      }
      if (occupancyRate > 0 && occupancyRate < 35) {
        propertyAlerts.push(makeAlert({
          id: `property-${place._id}-low-occupancy`,
          severity: "warning",
          type: "performance",
          title: "Baixa ocupação",
          message: `${place.title || "Acomodação"} está com ocupação abaixo do esperado.`,
        }));
      }
      if (rating > 0 && rating < 4.5) {
        propertyAlerts.push(makeAlert({
          id: `property-${place._id}-rating`,
          severity: "warning",
          type: "review",
          title: "Avaliação em atenção",
          message: `${place.title || "Acomodação"} tem nota abaixo de 4.5.`,
        }));
      }
      if (!place.photos || place.photos.length < 3) {
        propertyAlerts.push(makeAlert({
          id: `property-${place._id}-photos`,
          severity: "info",
          type: "place",
          title: "Poucas fotos",
          message: `${place.title || "Acomodação"} pode ganhar mais fotos.`,
        }));
      }

      const nextEvent = bucket.futureEvents.sort((a, b) => a.date - b.date)[0] || null;
      const status =
        propertyAlerts.some((alert) => alert.severity === "critical")
          ? "critical"
          : propertyAlerts.some((alert) => alert.severity === "warning")
            ? "warning"
            : "healthy";
      const priorityScore =
        (status === "critical" ? 100 : status === "warning" ? 45 : 0) +
        (nextEvent && toIsoDay(nextEvent.date) === toIsoDay(now) ? 25 : 0);

      return {
        id: String(place._id),
        _id: place._id,
        title: place.title,
        city: place.city,
        price: place.price,
        photos: place.photos || [],
        perks: place.perks || [],
        guests: place.guests,
        rooms: place.rooms,
        beds: place.beds,
        bathrooms: place.bathrooms,
        averageRating: rating,
        isActive: place.isActive,
        monthlyRevenue: bucket.monthlyRevenue,
        monthlyFees: bucket.monthlyFees,
        monthlyNetRevenue: bucket.monthlyRevenue - bucket.monthlyFees,
        totalRevenue: bucket.totalRevenue,
        bookedNights: bucket.bookedNights,
        monthlyBookedNights: bucket.monthlyBookedNights,
        occupancyRate,
        averageDailyRate,
        nextEvent,
        alerts: propertyAlerts,
        status,
        statusLabel:
          status === "critical"
            ? "Crítico"
            : status === "warning"
              ? "Imóveis com alerta"
              : "Operação saudável",
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const propertyAlerts = operationalProperties.flatMap((property) => property.alerts);
  const allAlerts = [...alerts, ...propertyAlerts];
  const alertGroups = {
    critical: allAlerts.filter((alert) => alert.severity === "critical"),
    warning: allAlerts.filter((alert) => alert.severity === "warning"),
    info: allAlerts.filter((alert) => alert.severity === "info"),
  };
  const severityWeight = { critical: 3, warning: 2, info: 1 };
  const priorityAlerts = [...allAlerts].sort(
    (a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0)
  );
  const upcomingMovements = calendarEvents
    .filter((event) => (event.type === "checkin" || event.type === "checkout") && new Date(event.startDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 12);
  const upcomingMovementGroups = {
    checkins: upcomingMovements.filter((event) => event.type === "checkin"),
    checkouts: upcomingMovements.filter((event) => event.type === "checkout"),
  };
  const propertyPerformance = operationalProperties.slice(0, 6).map((property) => ({
    id: property.id,
    name: property.title?.slice(0, 16) || "Acomodação",
    revenue: property.monthlyRevenue,
    occupancyRate: property.occupancyRate,
    status: property.status,
  }));
  const availableNightEarnings =
    totalCapacityNights > 0 ? monthlyEarnings / totalCapacityNights : 0;
  const operatingExpenses = totalFees;
  const estimatedProfit = monthlyEarnings - operatingExpenses;
  const monthlyNetRevenue = monthlyEarnings - totalFees;
  const profitMargin = monthlyEarnings > 0 ? (estimatedProfit / monthlyEarnings) * 100 : null;
  const previousMonthOperatingExpenses = previousMonthFees;
  const previousMonthEstimatedProfit = previousMonthEarnings - previousMonthOperatingExpenses;
  const previousMonthNetRevenue = previousMonthEarnings - previousMonthFees;
  const financialProperties = operationalProperties.map((property) => ({
    id: property.id,
    title: property.title,
    city: property.city,
    photo: property.photos?.[0] || null,
    grossRevenue: property.monthlyRevenue,
    expenses: property.monthlyFees,
    estimatedProfit: property.monthlyRevenue - property.monthlyFees,
    occupancyRate: property.occupancyRate,
    availableNightEarnings:
      monthDays.length > 0 ? property.monthlyRevenue / monthDays.length : 0,
    status: property.status,
    statusLabel: property.statusLabel,
    available: true,
  }));
  const financial = {
    period: {
      key: "current_month",
      label: "Mês atual",
      start: monthStart,
      end: monthEnd,
    },
    filters: [
      { key: "current_month", label: "Mês atual", available: true },
      { key: "previous_month", label: "Mês anterior", available: true },
      { key: "upcoming_receivables", label: "Próximos recebimentos", available: true },
      { key: "by_property", label: "Por acomodação", available: true },
      { key: "by_payment_status", label: "Por status do pagamento", available: true },
    ],
    summaryCards: [
      makeFinancialMetric({
        key: "monthlyGrossRevenue",
        label: "Receita bruta do mês",
        value: monthlyEarnings,
        helper: "Reservas aprovadas com check-out no mês",
        tone: "green",
      }),
      makeFinancialMetric({
        key: "monthlyNetRevenue",
        label: "Receita líquida do mês",
        value: monthlyNetRevenue,
        helper: "Receita bruta menos taxas conhecidas",
        tone: "green",
      }),
      makeFinancialMetric({
        key: "operatingExpenses",
        label: "Despesas operacionais",
        value: operatingExpenses,
        helper: "Taxas conhecidas pelo back-end atual",
        tone: operatingExpenses > 0 ? "amber" : "slate",
      }),
      makeFinancialMetric({
        key: "estimatedProfit",
        label: "Lucro estimado",
        value: estimatedProfit,
        helper: "Receita bruta menos despesas conhecidas",
        tone: estimatedProfit >= 0 ? "green" : "red",
      }),
      makeFinancialMetric({
        key: "futureRevenue",
        label: "Receita futura",
        value: futureEarnings,
        helper: "Reservas futuras confirmadas e aprovadas",
        tone: "blue",
      }),
      makeFinancialMetric({
        key: "availableNightEarnings",
        label: "Ganho por noite disponível",
        value: availableNightEarnings,
        helper: "Receita bruta mensal por noite disponível",
        tone: "violet",
      }),
    ],
    revenue: {
      items: [
        makeFinancialMetric({ key: "grossRevenue", label: "Receita bruta", value: monthlyEarnings, tone: "green" }),
        makeFinancialMetric({ key: "netRevenue", label: "Receita líquida", value: monthlyNetRevenue, tone: "green" }),
        makeFinancialMetric({ key: "futureRevenue", label: "Receita futura", value: futureEarnings, tone: "blue" }),
        makeFinancialMetric({ key: "approvedPayments", label: "Pagamentos aprovados", value: approvedPaymentsTotal, tone: "green" }),
        makeFinancialMetric({ key: "pendingPayments", label: "Pagamentos pendentes", value: pendingPaymentsTotal, tone: "amber" }),
        makeFinancialMetric({ key: "approvedFutureBookings", label: "Reservas futuras aprovadas", value: approvedFutureBookingsTotal, tone: "blue" }),
      ],
    },
    expenses: {
      items: [
        makeFinancialMetric({
          key: "platformFees",
          label: "Taxas da plataforma",
          value: totalFees,
          helper: "Calculado a partir da taxa de anfitrião configurada",
          tone: totalFees > 0 ? "amber" : "slate",
        }),
        makeUnavailableFinancialMetric("paymentFees", "Taxas de pagamento", "Depende de repasses detalhados do provedor de pagamento."),
        makeUnavailableFinancialMetric("cleaning", "Limpeza", "Depende de despesas operacionais de limpeza persistidas."),
        makeUnavailableFinancialMetric("maintenance", "Manutenção", "Depende do domínio de manutenção e danos."),
        makeUnavailableFinancialMetric("itemReplacement", "Reposição de itens", "Depende de lançamentos de reposição por acomodação."),
        makeUnavailableFinancialMetric("condominium", "Condomínio", "Depende de despesas fixas por acomodação."),
        makeUnavailableFinancialMetric("propertyTax", "IPTU", "Depende de despesas fixas por acomodação."),
        makeUnavailableFinancialMetric("water", "Água", "Depende de despesas fixas ou variáveis por acomodação."),
        makeUnavailableFinancialMetric("electricity", "Luz", "Depende de despesas fixas ou variáveis por acomodação."),
        makeUnavailableFinancialMetric("internet", "Internet", "Depende de despesas fixas por acomodação."),
        makeUnavailableFinancialMetric("otherExpenses", "Outras despesas", "Depende de lançamentos financeiros categorizados."),
      ],
    },
    profitability: {
      items: [
        makeFinancialMetric({ key: "estimatedProfit", label: "Lucro estimado", value: estimatedProfit, tone: estimatedProfit >= 0 ? "green" : "red" }),
        makeFinancialMetric({ key: "profitMargin", label: "Margem de lucro", value: profitMargin, format: "percent", tone: profitMargin === null ? "slate" : profitMargin >= 0 ? "green" : "red", available: profitMargin !== null }),
        makeFinancialMetric({ key: "availableNightEarnings", label: "Ganho por noite disponível", value: availableNightEarnings, tone: "violet" }),
        makeFinancialMetric({ key: "averageDailyRate", label: "Diária média", value: metrics.averageNightPrice, tone: "blue" }),
        makeFinancialMetric({ key: "monthComparison", label: "Comparativo com mês anterior", value: estimatedProfit - previousMonthEstimatedProfit, helper: "Diferença entre lucros estimados", tone: estimatedProfit >= previousMonthEstimatedProfit ? "green" : "amber" }),
      ],
    },
    properties: financialProperties,
    paymentsRefunds: paymentsRefunds
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30),
    comparison: {
      currentMonth: {
        grossRevenue: monthlyEarnings,
        netRevenue: monthlyNetRevenue,
        operatingExpenses,
        estimatedProfit,
      },
      previousMonth: {
        grossRevenue: previousMonthEarnings,
        netRevenue: previousMonthNetRevenue,
        operatingExpenses: previousMonthOperatingExpenses,
        estimatedProfit: previousMonthEstimatedProfit,
      },
    },
    unavailableData: [
      "Taxas de pagamento reais por transação.",
      "Despesas de limpeza, manutenção, reposição, condomínio, IPTU, água, luz, internet e outras despesas.",
      "Reembolsos persistidos com valor, data, reserva e status.",
      "Regras de receita líquida fiscal/contábil além das taxas conhecidas.",
    ],
  };
  const overview = buildOverviewPayload({
    checkinsToday,
    checkoutsToday,
    pendingBookings,
    monthlyGrossRevenue: monthlyEarnings,
    futureRevenue: futureEarnings,
    operatingExpenses,
    estimatedProfit,
    availableNightEarnings,
    metrics,
    places,
    operationalProperties,
    alertGroups,
  });

  return {
    bookings,
    places,
    calendar: {
      events: calendarEvents,
      emptyDays,
      month: {
        start: monthStart,
        end: monthEnd,
      },
    },
    today: {
      checkins: checkinsToday,
      checkouts: checkoutsToday,
      pendingBookings,
      pendingTasks: 0,
    },
    finance: {
      monthlyEarnings,
      monthlyGrossRevenue: monthlyEarnings,
      monthlyNetRevenue,
      futureEarnings,
      futureRevenue: futureEarnings,
      totalFees,
      operatingExpenses,
      estimatedProfit,
      profitMargin,
      averagePerNight: metrics.averageNightPrice,
      availableNightEarnings,
      revPAR: availableNightEarnings,
    },
    financial,
    metrics,
    tasks: [],
    overview,
    operationalProperties,
    cleaningInspection,
    upcomingMovements,
    upcomingMovementGroups,
    charts: {
      revenueProjection: buildRevenueSeries(bookings),
      propertyPerformance,
    },
    alertGroups,
    priorityAlerts,
    alerts,
  };
};

