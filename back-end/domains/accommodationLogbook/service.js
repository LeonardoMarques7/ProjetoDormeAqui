import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();

const hasPrismaModel = (client, modelName) =>
  Boolean(client && typeof client[modelName]?.findMany === "function");

const STATUS_LABELS = {
  pending: "Reserva pendente",
  confirmed: "Reserva confirmada",
  in_progress: "Hospedagem iniciada",
  evaluation: "Avaliacao solicitada",
  review: "Em revisao",
  completed: "Reserva finalizada",
  CANCELLED: "Reserva cancelada",
  rejected: "Reserva rejeitada",
};

const PAYMENT_LABELS = {
  pending: "Pagamento pendente",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  CANCELLED: "Pagamento cancelado",
  refunded: "Pagamento reembolsado",
};

const NOTIFICATION_CONTEXT = {
  reservation: "Reserva",
  place: "Acomodacao",
  payment: "Pagamento",
  review: "Avaliacao",
  user: "Usuario",
  system: "Sistema",
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const serializeDate = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const compactId = (value) => String(value || "").slice(-6).toUpperCase();

const buildLog = ({
  id,
  date,
  place,
  actor = {},
  action,
  actionKey,
  context,
  contextKey,
  title,
  description,
  booking = null,
  metadata = {},
}) => ({
  id,
  date: serializeDate(date),
  placeId: place?.id ? String(place.id) : "",
  placeName: place?.title || "Acomodacao",
  placeCity: place?.city || "",
  actorName: actor.name || "Sistema",
  actorRole: actor.role || "Automacao",
  action,
  actionKey,
  context,
  contextKey,
  title,
  description,
  bookingId: booking?.id ? String(booking.id) : "",
  bookingCode: booking?.id ? compactId(booking.id) : "",
  status: booking?.status || "",
  paymentStatus: booking?.paymentStatus || "",
  metadata,
});

const matchesFilter = (value, filterValue) => {
  if (!filterValue || filterValue === "all") return true;
  return normalizeText(value) === normalizeText(filterValue);
};

const filterLogs = (logs, filters) => {
  const search = normalizeText(filters.search);
  const name = normalizeText(filters.name);
  const action = normalizeText(filters.action);
  const context = normalizeText(filters.context);
  const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
  const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : null;

  return logs.filter((log) => {
    const logDate = new Date(log.date);
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    if (name && ![log.placeName, log.actorName].some((value) => normalizeText(value).includes(name))) return false;
    if (action && !matchesFilter(log.actionKey, action) && !matchesFilter(log.action, action)) return false;
    if (context && !matchesFilter(log.contextKey, context) && !matchesFilter(log.context, context)) return false;
    if (!search) return true;

    const searchable = [
      log.placeName,
      log.placeCity,
      log.actorName,
      log.action,
      log.context,
      log.title,
      log.description,
      log.bookingCode,
      log.status,
      log.paymentStatus,
    ]
      .map(normalizeText)
      .join(" ");

    return searchable.includes(search);
  });
};

const buildOptions = (logs) => {
  const unique = (items) => [...new Map(items.filter(Boolean).map((item) => [item.value, item])).values()];

  return {
    names: unique(logs.map((log) => ({ value: log.placeName, label: log.placeName }))).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    actions: unique(logs.map((log) => ({ value: log.actionKey, label: log.action }))).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    contexts: unique(logs.map((log) => ({ value: log.contextKey, label: log.context }))).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
  };
};

const buildSummary = (logs) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const byContext = logs.reduce((acc, log) => {
    acc[log.contextKey] = (acc[log.contextKey] || 0) + 1;
    return acc;
  }, {});

  return {
    total: logs.length,
    lastSevenDays: logs.filter((log) => new Date(log.date) >= sevenDaysAgo).length,
    bookingUpdates: byContext.booking || 0,
    accommodationUpdates: byContext.accommodation || 0,
  };
};

export const buildAccommodationLogbook = async (hostId, filters = {}) => {
  if (!hasPrismaModel(prisma, "place") || !hasPrismaModel(prisma, "booking")) {
    return {
      logs: [],
      summary: buildSummary([]),
      options: { names: [], actions: [], contexts: [] },
      total: 0,
    };
  }

  const places = await prisma.place.findMany({
    where: { ownerId: hostId },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (places.length === 0) {
    return {
      logs: [],
      summary: buildSummary([]),
      options: { names: [], actions: [], contexts: [] },
      total: 0,
    };
  }

  const placeIds = places.map((place) => place.id);
  const placeById = new Map(places.map((place) => [place.id, place]));

  const bookings = await prisma.booking.findMany({
    where: { placeId: { in: placeIds } },
    include: {
      guest: { select: { id: true, name: true, email: true } },
      place: { select: { id: true, title: true, city: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  const bookingIds = bookings.map((booking) => booking.id);

  const reviewQuery = hasPrismaModel(prisma, "review")
    ? prisma.review.findMany({
        where: { placeId: { in: placeIds } },
        include: {
          user: { select: { id: true, name: true } },
          place: { select: { id: true, title: true, city: true } },
        },
      })
    : Promise.resolve([]);

  const notificationQuery = hasPrismaModel(prisma, "notification")
    ? prisma.notification.findMany({
        where: {
          userId: hostId,
          OR: [
            { entityType: "place", entityId: { in: placeIds } },
            { entityType: "reservation", entityId: { in: bookingIds } },
            { entityType: "review" },
            { entityType: "payment" },
          ],
        },
        orderBy: { createdAt: "desc" },
      })
    : Promise.resolve([]);

  const [reviews, notifications] = await Promise.all([
    reviewQuery,
    notificationQuery,
  ]);

  const logs = [];

  for (const place of places) {
    logs.push(
      buildLog({
        id: `place-${place.id}-snapshot`,
        date: place.createdAt,
        place,
        action: "Acomodacao registrada",
        actionKey: "place_registered",
        context: "Acomodacao",
        contextKey: "accommodation",
        title: place.title || "Acomodacao sem titulo",
        description: `${place.city || "Cidade nao informada"} · diaria ${Number(place.pricePerNight || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        })} · ${place.status === "ACTIVE" ? "ativa" : "inativa"}.`,
        metadata: {
          price: Number(place.pricePerNight || 0),
          averageRating: Number(place.averageRating || 0),
          isActive: place.status === "ACTIVE",
        },
      }),
    );
  }

  for (const booking of bookings) {
    const payment = booking.payments?.[0] || null;
    const paymentStatus = payment?.status ? String(payment.status).toLowerCase() : String(booking.legacyPaymentStatus || "").toLowerCase();
    const bookingView = {
      id: booking.id,
      status: String(booking.status || "").toLowerCase(),
      paymentStatus,
      checkin: booking.checkIn,
      checkout: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      priceTotal: Number(booking.totalPrice || 0),
    };
    const place = booking.place || placeById.get(booking.placeId);

    logs.push(
      buildLog({
        id: `booking-${booking.id}-created`,
        date: booking.createdAt,
        place,
        actor: { name: booking.guest?.name || "Hospede", role: "Hospede" },
        action: "Reserva criada",
        actionKey: "booking_created",
        context: "Reserva",
        contextKey: "booking",
        title: `Reserva #${compactId(booking.id)} criada`,
        description: `${booking.guests || 1} hospede(s), ${booking.nights || 0} noite(s), total ${Number(booking.totalPrice || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        })}.`,
        booking: bookingView,
        metadata: {
          checkin: booking.checkIn,
          checkout: booking.checkOut,
          guests: booking.guests,
          nights: booking.nights,
          priceTotal: Number(booking.totalPrice || 0),
        },
      }),
    );

    if (paymentStatus) {
      logs.push(
        buildLog({
          id: `booking-${booking.id}-payment-${paymentStatus}`,
          date: payment?.updatedAt || payment?.createdAt || booking.updatedAt || booking.createdAt,
          place,
          actor: { name: "Pagamento", role: "Sistema" },
          action: PAYMENT_LABELS[paymentStatus] || "Pagamento atualizado",
          actionKey: `payment_${paymentStatus}`,
          context: "Pagamento",
          contextKey: "payment",
          title: `Pagamento da reserva #${compactId(booking.id)}`,
          description: `Status atual do pagamento: ${PAYMENT_LABELS[paymentStatus] || paymentStatus}.`,
          booking: bookingView,
        }),
      );
    }

    for (const history of booking.statusHistory || []) {
      const historyStatus = String(history.toStatus || "").toLowerCase();
      logs.push(
        buildLog({
          id: `booking-${booking.id}-status-${history.id}`,
          date: history.changedAt || booking.updatedAt,
          place,
          actor: { name: "Sistema", role: "Automacao" },
          action: STATUS_LABELS[historyStatus] || "Status atualizado",
          actionKey: `status_${historyStatus || "updated"}`,
          context: "Atualizacao",
          contextKey: "status",
          title: `Status da reserva #${compactId(booking.id)}`,
          description: history.reason || `Reserva marcada como ${STATUS_LABELS[historyStatus] || historyStatus}.`,
          booking: bookingView,
          metadata: history.metadata || {},
        }),
      );
    }

    logs.push(
      buildLog({
        id: `booking-${booking.id}-checkin`,
        date: booking.checkIn,
        place,
        actor: { name: booking.guest?.name || "Hospede", role: "Hospede" },
        action: "Check-in previsto",
        actionKey: "checkin_scheduled",
        context: "Agenda",
        contextKey: "calendar",
        title: `Entrada em ${place?.title || "acomodacao"}`,
        description: `Check-in da reserva #${compactId(booking.id)}.`,
        booking: bookingView,
      }),
    );

    logs.push(
      buildLog({
        id: `booking-${booking.id}-checkout`,
        date: booking.checkOut,
        place,
        actor: { name: booking.guest?.name || "Hospede", role: "Hospede" },
        action: "Check-out previsto",
        actionKey: "checkout_scheduled",
        context: "Agenda",
        contextKey: "calendar",
        title: `Saida em ${place?.title || "acomodacao"}`,
        description: `Check-out da reserva #${compactId(booking.id)}.`,
        booking: bookingView,
      }),
    );
  }

  for (const review of reviews) {
    logs.push(
      buildLog({
        id: `review-${review.id}`,
        date: review.createdAt,
        place: review.place || placeById.get(review.placeId),
        actor: { name: review.user?.name || "Hospede", role: "Hospede" },
        action: "Avaliacao recebida",
        actionKey: "review_received",
        context: "Avaliacao",
        contextKey: "review",
        title: `${review.rating}/5 estrelas recebidas`,
        description: review.comment || "Avaliacao registrada sem comentario.",
        metadata: { rating: review.rating },
      }),
    );
  }

  for (const notification of notifications) {
    const booking = bookings.find((item) => String(item.id) === String(notification.entityId));
    const place =
      notification.entityType === "place"
        ? placeById.get(String(notification.entityId))
        : booking?.place || placeById.get(String(booking?.placeId));

    if (!place && notification.entityType !== "review" && notification.entityType !== "system") continue;

    logs.push(
      buildLog({
        id: `notification-${notification.id}`,
        date: notification.createdAt,
        place,
        actor: { name: "Sistema", role: "Notificacao" },
        action: notification.title || "Notificacao registrada",
        actionKey: notification.type,
        context: NOTIFICATION_CONTEXT[notification.entityType] || "Atualizacao",
        contextKey: notification.entityType || "notification",
        title: notification.title,
        description: notification.message,
        booking: booking
          ? {
              id: booking.id,
              status: String(booking.status || "").toLowerCase(),
              paymentStatus: String(booking.payments?.[0]?.status || booking.legacyPaymentStatus || "").toLowerCase(),
            }
          : null,
      }),
    );
  }

  const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredLogs = filterLogs(sortedLogs, filters);
  const limit = Math.min(Number(filters.limit || 80), 200);

  return {
    logs: filteredLogs.slice(0, limit),
    summary: buildSummary(filteredLogs),
    options: buildOptions(sortedLogs),
    total: filteredLogs.length,
  };
};
