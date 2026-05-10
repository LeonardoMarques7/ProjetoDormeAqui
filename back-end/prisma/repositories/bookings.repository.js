import { bookingShape, isUuid, prisma, toDate } from "./helpers.js";

const bookingInclude = {
  place: {
    include: {
      owner: { include: { profile: true } },
      photos: true,
      perks: { include: { perk: true } },
    },
  },
  guest: { include: { profile: true } },
  payments: { orderBy: { createdAt: "desc" }, take: 1 },
};

function bookingWhereById(id) {
  return isUuid(id) ? { id } : { legacyMongoId: String(id) };
}

async function resolveUserId(id) {
  const db = await prisma();
  const user = await db.user.findFirst({
    where: isUuid(id) ? { id } : { legacyMongoId: String(id) },
    select: { id: true },
  });
  return user?.id || null;
}

async function resolvePlaceId(id) {
  const db = await prisma();
  const place = await db.place.findFirst({
    where: isUuid(id) ? { id } : { legacyMongoId: String(id) },
    select: { id: true },
  });
  return place?.id || null;
}

function mapBookingStatus(status) {
  const normalized = String(status || "PENDING").toUpperCase();
  return {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    IN_PROGRESS: "IN_PROGRESS",
    EVALUATION: "EVALUATION",
    REVIEW: "REVIEW",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    REJECTED: "REJECTED",
    ARCHIVED: "ARCHIVED",
  }[normalized] || "PENDING";
}

export async function getUserBookings(userId) {
  const db = await prisma();
  const resolvedUserId = await resolveUserId(userId);
  if (!resolvedUserId) return [];
  const bookings = await db.booking.findMany({
    where: { guestId: resolvedUserId },
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(bookingShape);
}

export async function getHostBookings(hostId) {
  const db = await prisma();
  const resolvedHostId = await resolveUserId(hostId);
  if (!resolvedHostId) return [];
  const bookings = await db.booking.findMany({
    where: { place: { ownerId: resolvedHostId } },
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(bookingShape);
}

export async function getBookingById(id) {
  const db = await prisma();
  const booking = await db.booking.findFirst({
    where: bookingWhereById(id),
    include: bookingInclude,
  });
  return bookingShape(booking);
}

export async function getBookingByPaymentId(paymentId) {
  const db = await prisma();
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { legacyMercadoPagoPaymentId: String(paymentId) },
        { payments: { some: { providerPaymentId: String(paymentId) } } },
        { payments: { some: { providerPreferenceId: String(paymentId) } } },
      ],
    },
    include: bookingInclude,
  });
  return bookingShape(booking);
}

export async function getPlaceBookings(placeId) {
  const db = await prisma();
  const resolvedPlaceId = await resolvePlaceId(placeId);
  if (!resolvedPlaceId) return [];
  const bookings = await db.booking.findMany({
    where: { placeId: resolvedPlaceId },
    include: bookingInclude,
    orderBy: { checkIn: "asc" },
  });
  return bookings.map(bookingShape);
}

export async function getPlaceBookedDates(placeId) {
  const db = await prisma();
  const resolvedPlaceId = await resolvePlaceId(placeId);
  if (!resolvedPlaceId) return [];
  const rows = await db.$queryRaw`
    SELECT booked_date::text AS booked_date
    FROM get_place_booked_dates(${resolvedPlaceId}::uuid)
    ORDER BY booked_date
  `;
  return rows.map((row) => row.booked_date);
}

export async function createBooking({ place, user, checkin, checkout, guests }) {
  const db = await prisma();
  const [placeId, guestId] = await Promise.all([resolvePlaceId(place), resolveUserId(user)]);
  if (!placeId || !guestId) {
    const error = new Error("Usuario ou acomodacao nao encontrados.");
    error.statusCode = 404;
    throw error;
  }

  const checkInDate = toDate(checkin);
  const checkOutDate = toDate(checkout);
  const guestsNumber = Number(guests || 1);

  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    const error = new Error("Periodo de reserva invalido.");
    error.statusCode = 400;
    throw error;
  }

  return db.$transaction(async (tx) => {
    const placeRecord = await tx.place.findUnique({ where: { id: placeId } });
    const userRecord = await tx.user.findUnique({ where: { id: guestId } });

    if (!userRecord || userRecord.deactivated) {
      const error = new Error("Usuario indisponivel para novas reservas.");
      error.statusCode = userRecord ? 403 : 404;
      throw error;
    }

    if (!placeRecord || placeRecord.status !== "ACTIVE") {
      const error = new Error("Lugar nao esta disponivel.");
      error.statusCode = placeRecord ? 410 : 404;
      throw error;
    }

    if (!Number.isInteger(guestsNumber) || guestsNumber < 1 || guestsNumber > placeRecord.maxGuests) {
      const error = new Error("Numero de hospedes invalido.");
      error.statusCode = 400;
      throw error;
    }

    const conflicts = await tx.booking.count({
      where: {
        placeId,
        status: { notIn: ["CANCELLED", "REJECTED", "ARCHIVED"] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (conflicts > 0) {
      const error = new Error("Datas conflitantes com reservas existentes.");
      error.statusCode = 409;
      throw error;
    }

    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
    const pricePerNight = placeRecord.pricePerNight;
    const created = await tx.booking.create({
      data: {
        placeId,
        guestId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestsNumber,
        nights,
        pricePerNight,
        totalPrice: Number(pricePerNight) * nights,
        status: "PENDING",
        lastStatusChange: new Date(),
      },
      include: bookingInclude,
    });
    return bookingShape(created);
  });
}

export async function updateBookingStatus(id, toStatus, { reason = "", changedBy = null } = {}) {
  const db = await prisma();
  const existing = await db.booking.findFirst({ where: bookingWhereById(id) });
  if (!existing) return null;
  const changedById = changedBy ? await resolveUserId(changedBy) : null;
  const normalizedStatus = mapBookingStatus(toStatus);

  const updated = await db.$transaction(async (tx) => {
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: existing.id,
        fromStatus: existing.status,
        toStatus: normalizedStatus,
        reason,
        metadata: changedById ? { changedBy: changedById } : undefined,
      },
    });
    return tx.booking.update({
      where: { id: existing.id },
      data: {
        status: normalizedStatus,
        lastStatusChange: new Date(),
        archivedAt: normalizedStatus === "ARCHIVED" ? new Date() : existing.archivedAt,
      },
      include: bookingInclude,
    });
  });

  return bookingShape(updated);
}

