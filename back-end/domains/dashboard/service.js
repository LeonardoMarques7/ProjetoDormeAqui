import Booking from "../bookings/model.js";
import Place from "../places/model.js";
import "../users/model.js";
import Notification from "../../NotificationModel.js";

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

export const buildHostDashboardData = async (hostId) => {
  const now = new Date();
  const todayEnd = toEndOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = toEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const monthDays = eachDayBetween(monthStart, monthEnd);

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
        futureEarnings: 0,
        totalFees: 0,
        averagePerNight: 0,
        availableNightEarnings: 0,
        revPAR: 0,
      },
      metrics: {
        occupancyRate: 0,
        averageNightPrice: 0,
        totalBookings: 0,
        averageRating: null,
      },
      tasks: [],
      overview: {
        actionsToday: {
          checkins: 0,
          checkouts: 0,
          pendingBookings: 0,
          propertiesWithAlerts: 0,
        },
        financialSummary: {
          monthlyEarnings: 0,
          futureEarnings: 0,
          totalFees: 0,
          availableNightEarnings: 0,
        },
      },
      operationalProperties: [],
      upcomingMovements: [],
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
        totalRevenue: 0,
        bookedNights: 0,
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
  let totalNights = 0;
  let totalNightsPrice = 0;
  let occupancyBookedNights = 0;

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
      if (checkoutDate <= todayEnd && checkoutDate >= monthStart && !bookingIsCanceled) {
        monthlyEarnings += bookingTotal;
        if (propertyBucket) propertyBucket.monthlyRevenue += bookingTotal;
      }
      if (checkinDate > todayEnd && status === "confirmed") {
        futureEarnings += bookingTotal;
      }
      totalFees += bookingTotal * HOST_FEE_RATE;
      if (!bookingIsCanceled && propertyBucket) propertyBucket.totalRevenue += bookingTotal;
    }

    if (bookingNights > 0 && !bookingIsCanceled) {
      totalNights += bookingNights;
      totalNightsPrice += bookingTotal;
      if (propertyBucket) propertyBucket.bookedNights += bookingNights;
    }

    if (!bookingIsCanceled) {
      const overlapNights = overlapDays(checkinDate, checkoutDate, monthStart, monthEnd);
      occupancyBookedNights += overlapNights;
    }

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
        totalRevenue: bucket.totalRevenue,
        bookedNights: bucket.bookedNights,
        occupancyRate,
        averageDailyRate,
        nextEvent,
        alerts: propertyAlerts,
        status,
        statusLabel:
          status === "critical"
            ? "Crítico"
            : status === "warning"
              ? "Em atenção"
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
  const propertyPerformance = operationalProperties.slice(0, 6).map((property) => ({
    id: property.id,
    name: property.title?.slice(0, 16) || "Acomodação",
    revenue: property.monthlyRevenue,
    occupancyRate: property.occupancyRate,
    status: property.status,
  }));
  const availableNightEarnings =
    totalCapacityNights > 0 ? monthlyEarnings / totalCapacityNights : 0;

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
      futureEarnings,
      totalFees,
      averagePerNight: metrics.averageNightPrice,
      availableNightEarnings,
      revPAR: availableNightEarnings,
    },
    metrics,
    tasks: [],
    overview: {
      actionsToday: {
        checkins: checkinsToday,
        checkouts: checkoutsToday,
        pendingBookings,
        propertiesWithAlerts: operationalProperties.filter((property) =>
          ["critical", "warning"].includes(property.status)
        ).length,
      },
      financialSummary: {
        monthlyEarnings,
        futureEarnings,
        totalFees,
        availableNightEarnings,
      },
    },
    operationalProperties,
    upcomingMovements,
    charts: {
      revenueProjection: buildRevenueSeries(bookings),
      propertyPerformance,
    },
    alertGroups,
    priorityAlerts,
    alerts,
  };
};

