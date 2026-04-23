import Booking from "../bookings/model.js";
import Place from "../places/model.js";
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
  return { label: "Ativa", color: "#0f766e" };
};

export const buildHostDashboardData = async (hostId) => {
  const now = new Date();
  const todayEnd = toEndOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = toEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const monthDays = eachDayBetween(monthStart, monthEnd);

  const places = await Place.find({ owner: hostId })
    .select("title city price averageRating isActive checkin checkout photos")
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
      },
      metrics: {
        occupancyRate: 0,
        averageNightPrice: 0,
        totalBookings: 0,
        averageRating: null,
      },
      tasks: [],
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
    .sort({ checkin: 1 })
    .populate("user", "name email photo")
    .populate("place", "title city price averageRating isActive checkin checkout photos owner")
    .lean();

  const placeById = new Map(places.map((place) => [String(place._id), place]));
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
    const statusMeta = getStatusMeta(status);

    if (toIsoDay(checkinDate) === toIsoDay(now) && bookingIsActive) checkinsToday += 1;
    if (toIsoDay(checkoutDate) === toIsoDay(now) && bookingIsActive) checkoutsToday += 1;

    if (status === "pending") {
      pendingBookings += 1;
    }

    if (paymentStatus === "approved") {
      if (checkoutDate <= todayEnd && checkoutDate >= monthStart && !bookingIsCanceled) {
        monthlyEarnings += bookingTotal;
      }
      if (checkinDate > todayEnd && status === "confirmed") {
        futureEarnings += bookingTotal;
      }
      totalFees += bookingTotal * HOST_FEE_RATE;
    }

    if (bookingNights > 0 && !bookingIsCanceled) {
      totalNights += bookingNights;
      totalNightsPrice += bookingTotal;
    }

    if (!bookingIsCanceled) {
      const overlapNights = overlapDays(checkinDate, checkoutDate, monthStart, monthEnd);
      occupancyBookedNights += overlapNights;
    }

    if (bookingIsActive) {
      const occupiedDays = eachDayBetween(checkinDate, checkoutDate);
      for (const day of occupiedDays) {
        if (day >= monthStart && day <= monthEnd) {
          occupiedDaySet.add(toIsoDay(day));
        }
      }
    }

    calendarEvents.push({
      id: `${booking._id}-checkin`,
      bookingId: String(booking._id),
      type: "checkin",
      title: `Check-in • ${place?.title || "Acomodação"}`,
      startDate: checkinDate,
      endDate: checkinDate,
      color: statusMeta.color,
      status: statusMeta.label,
      rawStatus: status,
      guest: booking.user?.name || "Hóspede",
      guestPhoto: booking.user?.photo || "",
      placeTitle: place?.title || "Acomodação",
      placeCity: place?.city || "",
      placeCheckin: place?.checkin || "",
      placeCheckout: place?.checkout || "",
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: bookingNights,
      paymentStatus,
      total: bookingTotal,
    });

    calendarEvents.push({
      id: `${booking._id}-checkout`,
      bookingId: String(booking._id),
      type: "checkout",
      title: `Check-out • ${place?.title || "Acomodação"}`,
      startDate: checkoutDate,
      endDate: checkoutDate,
      color: statusMeta.color,
      status: statusMeta.label,
      rawStatus: status,
      guest: booking.user?.name || "Hóspede",
      guestPhoto: booking.user?.photo || "",
      placeTitle: place?.title || "Acomodação",
      placeCity: place?.city || "",
      placeCheckin: place?.checkin || "",
      placeCheckout: place?.checkout || "",
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
        guestPhoto: booking.user?.photo || "",
        placeTitle: place?.title || "Acomodação",
        placeCity: place?.city || "",
        placeCheckin: place?.checkin || "",
        placeCheckout: place?.checkout || "",
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
    },
    metrics,
    tasks: [],
    alerts,
  };
};

