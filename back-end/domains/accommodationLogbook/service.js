import Booking from "../bookings/model.js";
import Place from "../places/model.js";
import Review from "../reviews/model.js";
import "../users/model.js";
import Notification from "../../NotificationModel.js";

const STATUS_LABELS = {
  pending: "Reserva pendente",
  confirmed: "Reserva confirmada",
  in_progress: "Hospedagem iniciada",
  evaluation: "Avaliação solicitada",
  review: "Em revisão",
  completed: "Reserva finalizada",
  canceled: "Reserva cancelada",
  rejected: "Reserva rejeitada",
};

const PAYMENT_LABELS = {
  pending: "Pagamento pendente",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  canceled: "Pagamento cancelado",
};

const NOTIFICATION_CONTEXT = {
  reservation: "Reserva",
  place: "Acomodação",
  payment: "Pagamento",
  review: "Avaliação",
  user: "Usuário",
  system: "Sistema",
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getObjectDate = (document) => {
  if (document?.createdAt) return new Date(document.createdAt);
  if (document?._id?.getTimestamp) return document._id.getTimestamp();
  return new Date();
};

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
  placeId: place?._id ? String(place._id) : "",
  placeName: place?.title || "Acomodação",
  placeCity: place?.city || "",
  actorName: actor.name || "Sistema",
  actorRole: actor.role || "Automação",
  action,
  actionKey,
  context,
  contextKey,
  title,
  description,
  bookingId: booking?._id ? String(booking._id) : "",
  bookingCode: booking?._id ? compactId(booking._id) : "",
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

    if (name && ![log.placeName, log.actorName].some((value) => normalizeText(value).includes(name))) {
      return false;
    }

    if (action && !matchesFilter(log.actionKey, action) && !matchesFilter(log.action, action)) {
      return false;
    }

    if (context && !matchesFilter(log.contextKey, context) && !matchesFilter(log.context, context)) {
      return false;
    }

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
  const unique = (items) =>
    [...new Map(items.filter(Boolean).map((item) => [item.value, item])).values()];

  return {
    names: unique(
      logs.map((log) => ({
        value: log.placeName,
        label: log.placeName,
      }))
    ).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    actions: unique(
      logs.map((log) => ({
        value: log.actionKey,
        label: log.action,
      }))
    ).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    contexts: unique(
      logs.map((log) => ({
        value: log.contextKey,
        label: log.context,
      }))
    ).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
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
  const places = await Place.find({ owner: hostId })
    .select("title city price averageRating isActive checkin checkout photos")
    .lean();

  const placeIds = places.map((place) => place._id);
  const placeById = new Map(places.map((place) => [String(place._id), place]));

  if (placeIds.length === 0) {
    return {
      logs: [],
      summary: buildSummary([]),
      options: { names: [], actions: [], contexts: [] },
      total: 0,
    };
  }

  const bookings = await Booking.find({ place: { $in: placeIds } })
    .populate("user", "name email photo")
    .populate("place", "title city price averageRating isActive checkin checkout photos owner")
    .populate("statusHistory.changedBy", "name email")
    .lean();

  const bookingIds = bookings.map((booking) => String(booking._id));

  const [reviews, notifications] = await Promise.all([
    Review.find({ place: { $in: placeIds } })
      .populate("user", "name email photo")
      .populate("place", "title city")
      .lean(),
    Notification.find({
      userId: hostId,
      $or: [
        { entityType: "place", entityId: { $in: placeIds.map(String) } },
        { entityType: "reservation", entityId: { $in: bookingIds } },
        { entityType: "review" },
      ],
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const logs = [];

  for (const place of places) {
    logs.push(
      buildLog({
        id: `place-${place._id}-snapshot`,
        date: getObjectDate(place),
        place,
        action: "Acomodação registrada",
        actionKey: "place_registered",
        context: "Acomodação",
        contextKey: "accommodation",
        title: place.title || "Acomodação sem título",
        description: `${place.city || "Cidade não informada"} · diária ${Number(place.price || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        })} · ${place.isActive === false ? "inativa" : "ativa"}.`,
        metadata: {
          price: place.price || 0,
          averageRating: place.averageRating || 0,
          isActive: place.isActive !== false,
        },
      })
    );
  }

  for (const booking of bookings) {
    const place = booking.place || placeById.get(String(booking.place));
    const guest = {
      name: booking.user?.name || "Hóspede",
      role: "Hóspede",
    };

    logs.push(
      buildLog({
        id: `booking-${booking._id}-created`,
        date: booking.createdAt || getObjectDate(booking),
        place,
        actor: guest,
        action: "Reserva criada",
        actionKey: "booking_created",
        context: "Reserva",
        contextKey: "booking",
        title: `Reserva #${compactId(booking._id)} criada`,
        description: `${booking.guests || 1} hóspede(s), ${booking.nights || 0} noite(s), total ${Number(booking.priceTotal || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        })}.`,
        booking,
        metadata: {
          checkin: booking.checkin,
          checkout: booking.checkout,
          guests: booking.guests,
          nights: booking.nights,
          priceTotal: booking.priceTotal,
        },
      })
    );

    if (booking.paymentStatus) {
      logs.push(
        buildLog({
          id: `booking-${booking._id}-payment-${booking.paymentStatus}`,
          date: booking.updatedAt || booking.createdAt || getObjectDate(booking),
          place,
          actor: { name: "Pagamento", role: "Sistema" },
          action: PAYMENT_LABELS[booking.paymentStatus] || "Pagamento atualizado",
          actionKey: `payment_${booking.paymentStatus}`,
          context: "Pagamento",
          contextKey: "payment",
          title: `Pagamento da reserva #${compactId(booking._id)}`,
          description: `Status atual do pagamento: ${PAYMENT_LABELS[booking.paymentStatus] || booking.paymentStatus}.`,
          booking,
        })
      );
    }

    for (const history of booking.statusHistory || []) {
      logs.push(
        buildLog({
          id: `booking-${booking._id}-status-${history.status}-${new Date(history.changedAt).getTime()}`,
          date: history.changedAt || booking.lastStatusChange || booking.updatedAt,
          place,
          actor: {
            name: history.changedBy?.name || "Sistema",
            role: history.changedBy ? "Usuário" : "Automação",
          },
          action: STATUS_LABELS[history.status] || "Status atualizado",
          actionKey: `status_${history.status || "updated"}`,
          context: "Atualização",
          contextKey: "status",
          title: `Status da reserva #${compactId(booking._id)}`,
          description: history.reason || `Reserva marcada como ${STATUS_LABELS[history.status] || history.status}.`,
          booking,
        })
      );
    }

    logs.push(
      buildLog({
        id: `booking-${booking._id}-checkin`,
        date: booking.checkin,
        place,
        actor: guest,
        action: "Check-in previsto",
        actionKey: "checkin_scheduled",
        context: "Agenda",
        contextKey: "calendar",
        title: `Entrada em ${place?.title || "acomodação"}`,
        description: `Check-in da reserva #${compactId(booking._id)}.`,
        booking,
      })
    );

    logs.push(
      buildLog({
        id: `booking-${booking._id}-checkout`,
        date: booking.checkout,
        place,
        actor: guest,
        action: "Check-out previsto",
        actionKey: "checkout_scheduled",
        context: "Agenda",
        contextKey: "calendar",
        title: `Saída em ${place?.title || "acomodação"}`,
        description: `Check-out da reserva #${compactId(booking._id)}.`,
        booking,
      })
    );
  }

  for (const review of reviews) {
    const place = review.place || placeById.get(String(review.place));
    logs.push(
      buildLog({
        id: `review-${review._id}`,
        date: review.createdAt || getObjectDate(review),
        place,
        actor: {
          name: review.user?.name || "Hóspede",
          role: "Hóspede",
        },
        action: "Avaliação recebida",
        actionKey: "review_received",
        context: "Avaliação",
        contextKey: "review",
        title: `${review.rating}/5 estrelas recebidas`,
        description: review.comment || "Avaliação registrada sem comentário.",
        metadata: {
          rating: review.rating,
        },
      })
    );
  }

  for (const notification of notifications) {
    const booking = bookings.find((item) => String(item._id) === String(notification.entityId));
    const place =
      notification.entityType === "place"
        ? placeById.get(String(notification.entityId))
        : booking?.place || placeById.get(String(booking?.place));

    if (!place && notification.entityType !== "review") continue;

    logs.push(
      buildLog({
        id: `notification-${notification._id}`,
        date: notification.createdAt || getObjectDate(notification),
        place,
        actor: { name: "Sistema", role: "Notificação" },
        action: notification.title || "Notificação registrada",
        actionKey: notification.type,
        context: NOTIFICATION_CONTEXT[notification.entityType] || "Atualização",
        contextKey: notification.entityType || "notification",
        title: notification.title,
        description: notification.message,
        booking,
        metadata: notification.metadata || {},
      })
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
