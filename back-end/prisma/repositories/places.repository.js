import {
  isUuid,
  normalizeStatusFromIsActive,
  placeShape,
  prisma,
  publicUserShape,
  toNumber,
} from "./helpers.js";

const placeInclude = {
  owner: { include: { profile: true } },
  photos: true,
  perks: { include: { perk: true } },
};

const INACTIVE_BOOKING_STATUSES = ["CANCELLED", "REJECTED", "ARCHIVED"];

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function diffDays(start, end) {
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
}

function overlapNights(checkIn, checkOut, rangeStart, rangeEnd) {
  const start = new Date(Math.max(checkIn.getTime(), rangeStart.getTime()));
  const end = new Date(Math.min(checkOut.getTime(), rangeEnd.getTime()));
  return diffDays(start, end);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function buildReviewShape(review) {
  return {
    _id: review.legacyMongoId || review.id,
    id: review.id,
    legacyMongoId: review.legacyMongoId,
    place: review.place
      ? {
          _id: review.place.legacyMongoId || review.place.id,
          id: review.place.id,
          title: review.place.title,
        }
      : review.placeId,
    user: publicUserShape(review.user),
    rating: review.rating,
    comment: review.comment,
    badges: (review.badges || []).map((badge) => badge.slug),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function placeWhereById(id) {
  return isUuid(id) ? { id } : { legacyMongoId: String(id) };
}

async function resolveOwnerId(ownerId) {
  const db = await prisma();
  const user = await db.user.findFirst({
    where: isUuid(ownerId) ? { id: ownerId } : { legacyMongoId: String(ownerId) },
    select: { id: true },
  });
  return user?.id || null;
}

async function syncPhotos(tx, placeId, photos = []) {
  if (!Array.isArray(photos)) return;
  await tx.placePhoto.deleteMany({ where: { placeId } });
  if (photos.length === 0) return;
  await tx.placePhoto.createMany({
    data: photos
      .filter(Boolean)
      .map((url, index) => ({
        placeId,
        url: String(url),
        sortOrder: index,
      })),
  });
}

async function syncPerks(tx, placeId, perks = []) {
  if (!Array.isArray(perks)) return;
  await tx.placePerk.deleteMany({ where: { placeId } });
  for (const raw of perks.filter(Boolean)) {
    const slug = String(raw).trim().toLowerCase().replace(/\s+/g, "-");
    const perk = await tx.perk.upsert({
      where: { slug },
      update: {},
      create: { slug, name: String(raw).trim() },
    });
    await tx.placePerk.create({ data: { placeId, perkId: perk.id } });
  }
}

function placeData(input) {
  const data = {};
  const resolvedCity = input.addressCity ?? input.address_city ?? input.city;
  const resolvedState = input.addressState ?? input.address_state;
  const resolvedStreet = input.addressStreet ?? input.address_street;
  const resolvedNumber = input.addressNumber ?? input.address_number;
  const resolvedAddress =
    input.address !== undefined
      ? input.address
      : [resolvedStreet, resolvedNumber].filter(Boolean).join(", ");
  if (input.type !== undefined) data.type = input.type || null;
  if (input.title !== undefined) data.title = input.title;
  if (resolvedCity !== undefined) data.city = resolvedCity || "";
  if (resolvedAddress !== undefined) data.address = resolvedAddress || null;
  if (resolvedStreet !== undefined) data.addressStreet = resolvedStreet || null;
  if (resolvedNumber !== undefined) data.addressNumber = resolvedNumber || null;
  if (input.addressComplement !== undefined || input.address_complement !== undefined) {
    data.addressComplement =
      input.addressComplement || input.address_complement || null;
  }
  if (input.addressNeighborhood !== undefined || input.address_neighborhood !== undefined) {
    data.addressNeighborhood =
      input.addressNeighborhood || input.address_neighborhood || null;
  }
  if (resolvedCity !== undefined) data.addressCity = resolvedCity || null;
  if (resolvedState !== undefined) data.addressState = resolvedState || null;
  if (input.addressZipCode !== undefined || input.address_zip_code !== undefined) {
    data.addressZipCode = input.addressZipCode || input.address_zip_code || null;
  }
  if (input.addressCountry !== undefined || input.address_country !== undefined) {
    data.addressCountry = input.addressCountry || input.address_country || null;
  }
  if (input.latitude !== undefined) {
    data.latitude =
      input.latitude === null || input.latitude === ""
        ? null
        : Number(input.latitude);
  }
  if (input.longitude !== undefined) {
    data.longitude =
      input.longitude === null || input.longitude === ""
        ? null
        : Number(input.longitude);
  }
  if (input.locationReference !== undefined || input.location_reference !== undefined) {
    data.locationReference =
      input.locationReference || input.location_reference || null;
  }
  if (input.locationDescription !== undefined || input.location_description !== undefined) {
    data.locationDescription =
      input.locationDescription || input.location_description || null;
  }
  if (input.description !== undefined) data.description = input.description;
  if (input.extras !== undefined) data.extras = input.extras || null;
  if (input.price !== undefined || input.pricePerNight !== undefined) {
    data.pricePerNight = Number(input.price ?? input.pricePerNight ?? 0);
  }
  if (input.checkin !== undefined || input.checkInTime !== undefined) {
    data.checkInTime = input.checkin || input.checkInTime || "14:00";
  }
  if (input.checkout !== undefined || input.checkOutTime !== undefined) {
    data.checkOutTime = input.checkout || input.checkOutTime || "11:00";
  }
  if (input.guests !== undefined || input.maxGuests !== undefined) {
    data.maxGuests = Number(input.guests ?? input.maxGuests ?? 1);
  }
  if (input.rooms !== undefined) data.rooms = Number(input.rooms || 1);
  if (input.beds !== undefined) data.beds = Number(input.beds || 1);
  if (input.bathrooms !== undefined) data.bathrooms = Number(input.bathrooms || 1);
  if (input.isActive !== undefined) data.status = normalizeStatusFromIsActive(input.isActive);
  return data;
}

async function fetchReviewMetrics(db, placeIds) {
  if (!placeIds.length) return new Map();

  const reviewGroups = await db.review.groupBy({
    by: ["placeId"],
    where: { placeId: { in: placeIds } },
    _count: { _all: true },
    _avg: { rating: true },
  });

  return new Map(
    reviewGroups.map((row) => [
      String(row.placeId),
      {
        reviewsCount: toNumber(row._count?._all),
        averageRating: row._avg?.rating === null ? null : toNumber(row._avg?.rating),
      },
    ]),
  );
}

async function fetchAvailabilityConflicts(db, placeIds, checkin, checkout) {
  if (!placeIds.length || !checkin || !checkout) return new Set();

  const checkInDate = new Date(checkin);
  const checkOutDate = new Date(checkout);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return new Set();
  }

  const conflictingBookings = await db.booking.findMany({
    where: {
      placeId: { in: placeIds },
      status: { notIn: INACTIVE_BOOKING_STATUSES },
      checkIn: { lt: checkOutDate },
      checkOut: { gt: checkInDate },
    },
    select: { placeId: true },
  });

  return new Set(conflictingBookings.map((booking) => String(booking.placeId)));
}

async function fetchPlaceReviews(db, placeIds) {
  if (!placeIds.length) return [];

  const reviews = await db.review.findMany({
    where: { placeId: { in: placeIds } },
    include: {
      user: { include: { profile: true } },
      place: true,
      badges: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(buildReviewShape);
}

async function fetchHostPlaceMetrics(db, places, { includeReviews = false } = {}) {
  const placeIds = places.map((place) => place.id);
  if (!placeIds.length) {
    return {
      places: [],
      summary: {
        totalPlaces: 0,
        totalGuestsSatisfied: 0,
        averageRating: 0,
        totalReviews: 0,
      },
      reviews: [],
    };
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInCurrentMonth = diffDays(monthStart, new Date(monthEnd.getTime() + 1));

  const [reviewMetrics, activeBookings, reviews] = await Promise.all([
    fetchReviewMetrics(db, placeIds),
    db.booking.findMany({
      where: {
        placeId: { in: placeIds },
        status: { notIn: INACTIVE_BOOKING_STATUSES },
      },
      select: {
        placeId: true,
        checkIn: true,
        checkOut: true,
        guests: true,
        totalPrice: true,
        status: true,
      },
      orderBy: { checkIn: "asc" },
    }),
    includeReviews ? fetchPlaceReviews(db, placeIds) : Promise.resolve([]),
  ]);

  const bookingsByPlace = new Map();
  for (const booking of activeBookings) {
    const key = String(booking.placeId);
    if (!bookingsByPlace.has(key)) bookingsByPlace.set(key, []);
    bookingsByPlace.get(key).push(booking);
  }

  const shapedPlaces = places.map((place) => {
    const placeBookings = bookingsByPlace.get(String(place.id)) || [];
    const metrics = reviewMetrics.get(String(place.id)) || {
      reviewsCount: 0,
      averageRating: place.averageRating === null ? null : toNumber(place.averageRating),
    };

    const totalGuestsSatisfied = placeBookings.reduce(
      (sum, booking) => sum + toNumber(booking.guests),
      0,
    );

    const monthlyRevenue = placeBookings.reduce((sum, booking) => {
      const bookingMonth = new Date(booking.checkIn);
      if (
        bookingMonth.getFullYear() === now.getFullYear() &&
        bookingMonth.getMonth() === now.getMonth()
      ) {
        return sum + toNumber(booking.totalPrice);
      }
      return sum;
    }, 0);

    const occupiedNights = placeBookings.reduce(
      (sum, booking) =>
        sum +
        overlapNights(
          new Date(booking.checkIn),
          new Date(booking.checkOut),
          monthStart,
          monthEnd,
        ),
      0,
    );

    const occupancyRate =
      daysInCurrentMonth > 0 ? Number(((occupiedNights / daysInCurrentMonth) * 100).toFixed(1)) : 0;

    const nextBooking = placeBookings.find(
      (booking) => new Date(booking.checkOut).getTime() >= now.getTime(),
    );

    const nextEventLabel = nextBooking
      ? new Date(nextBooking.checkIn).getTime() >= now.getTime()
        ? `Check-in ${formatShortDate(new Date(nextBooking.checkIn))}`
        : `Check-out ${formatShortDate(new Date(nextBooking.checkOut))}`
      : null;

    return placeShape(place, {
      includeOwner: false,
      extra: {
        reviewsCount: metrics.reviewsCount,
        averageRating:
          metrics.averageRating === null ? place.averageRating : metrics.averageRating,
        totalGuestsSatisfied,
        monthlyRevenue,
        occupancyRate,
        nextEventLabel,
        activeBookingsCount: placeBookings.length,
        averageDailyRate: occupiedNights > 0 ? Number((monthlyRevenue / occupiedNights).toFixed(2)) : null,
      },
    });
  });

  const totalReviews = shapedPlaces.reduce(
    (sum, place) => sum + toNumber(place.reviewsCount),
    0,
  );
  const weightedRatingSum = shapedPlaces.reduce((sum, place) => {
    if (!place.averageRating || !place.reviewsCount) return sum;
    return sum + Number(place.averageRating) * Number(place.reviewsCount);
  }, 0);

  return {
    places: shapedPlaces,
    summary: {
      totalPlaces: shapedPlaces.length,
      totalGuestsSatisfied: shapedPlaces.reduce(
        (sum, place) => sum + toNumber(place.totalGuestsSatisfied),
        0,
      ),
      averageRating: totalReviews > 0 ? Number((weightedRatingSum / totalReviews).toFixed(1)) : 0,
      totalReviews,
    },
    reviews,
  };
}

export async function listPlaces(filters = {}) {
  const db = await prisma();
  const where = { status: "ACTIVE" };
  if (filters.city) where.city = { contains: String(filters.city).slice(0, 80), mode: "insensitive" };
  if (filters.guests) where.maxGuests = { gte: Number(filters.guests) };
  if (filters.rooms) where.rooms = { gte: Number(filters.rooms) };
  if (filters.minRating) where.averageRating = { gte: Number(filters.minRating) };
  const take = filters.limit ? Math.min(Number(filters.limit) || 0, 100) : undefined;

  const places = await db.place.findMany({
    where,
    include: placeInclude,
    orderBy: { createdAt: "desc" },
    ...(take ? { take } : {}),
  });

  const placeIds = places.map((place) => place.id);
  const [reviewMetrics, conflictingPlaceIds] = await Promise.all([
    fetchReviewMetrics(db, placeIds),
    fetchAvailabilityConflicts(db, placeIds, filters.checkin, filters.checkout),
  ]);

  return places
    .filter((place) => !conflictingPlaceIds.has(String(place.id)))
    .map((place) => {
      const metrics = reviewMetrics.get(String(place.id)) || {
        reviewsCount: 0,
        averageRating: place.averageRating === null ? null : toNumber(place.averageRating),
      };

      return placeShape(place, {
        includeOwner: false,
        extra: {
          reviewsCount: metrics.reviewsCount,
          averageRating:
            metrics.averageRating === null ? place.averageRating : metrics.averageRating,
          primaryPhoto: place.photos?.[0]?.url || null,
          isAvailable:
            filters.checkin && filters.checkout ? !conflictingPlaceIds.has(String(place.id)) : true,
        },
      });
    });
}

export async function getPlaceById(id, { onlyActive = true, includeOwner = true } = {}) {
  const db = await prisma();
  const place = await db.place.findFirst({
    where: {
      ...placeWhereById(id),
      ...(onlyActive ? { status: "ACTIVE" } : {}),
    },
    include: placeInclude,
  });
  if (!place) return null;

  const [reviewMetrics, reviews, ownerPlacesCount] = await Promise.all([
    fetchReviewMetrics(db, [place.id]),
    fetchPlaceReviews(db, [place.id]),
    db.place.count({
      where: { ownerId: place.ownerId, status: "ACTIVE" },
    }),
  ]);

  const metrics = reviewMetrics.get(String(place.id)) || {
    reviewsCount: 0,
    averageRating: place.averageRating === null ? null : toNumber(place.averageRating),
  };

  return placeShape(place, {
    includeOwner,
    extra: {
      reviews,
      reviewsCount: metrics.reviewsCount,
      reviewSummary: {
        total: metrics.reviewsCount,
        averageRating:
          metrics.averageRating === null ? place.averageRating : metrics.averageRating,
      },
      ownerPlacesCount,
      primaryPhoto: place.photos?.[0]?.url || null,
    },
  });
}

export async function getHostPlaces(ownerId, { onlyActive = true, view = "default" } = {}) {
  const db = await prisma();
  const resolvedOwnerId = await resolveOwnerId(ownerId);
  if (!resolvedOwnerId) {
    return view === "profile"
      ? {
          places: [],
          summary: {
            totalPlaces: 0,
            totalGuestsSatisfied: 0,
            averageRating: 0,
            totalReviews: 0,
          },
          reviews: [],
        }
      : [];
  }
  const places = await db.place.findMany({
    where: {
      ownerId: resolvedOwnerId,
      ...(onlyActive ? { status: "ACTIVE" } : {}),
    },
    include: placeInclude,
    orderBy: { createdAt: "desc" },
  });

  const payload = await fetchHostPlaceMetrics(db, places, {
    includeReviews: view === "profile",
  });

  if (view === "profile") {
    return payload;
  }

  return payload.places;
}

export async function createPlace(ownerId, input) {
  const db = await prisma();
  const resolvedOwnerId = await resolveOwnerId(ownerId);
  if (!resolvedOwnerId) return null;
  const normalized = placeData(input);

  const created = await db.$transaction(async (tx) => {
    const place = await tx.place.create({
      data: {
        ownerId: resolvedOwnerId,
        title: normalized.title || input.title,
        city: normalized.city || input.city || "",
        address: normalized.address,
        addressStreet: normalized.addressStreet || null,
        addressNumber: normalized.addressNumber || null,
        addressComplement: normalized.addressComplement || null,
        addressNeighborhood: normalized.addressNeighborhood || null,
        addressCity: normalized.addressCity || normalized.city || null,
        addressState: normalized.addressState || null,
        addressZipCode: normalized.addressZipCode || null,
        addressCountry: normalized.addressCountry || "Brasil",
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        locationReference: normalized.locationReference || null,
        locationDescription: normalized.locationDescription || null,
        description: normalized.description || input.description,
        pricePerNight: Number(input.price || 0),
        checkInTime: input.checkin || "14:00",
        checkOutTime: input.checkout || "11:00",
        maxGuests: Number(input.guests || 1),
        rooms: Number(input.rooms || 1),
        beds: Number(input.beds || 1),
        bathrooms: Number(input.bathrooms || 1),
        type: input.type || null,
        extras: input.extras || null,
        status: "ACTIVE",
      },
    });
    await syncPhotos(tx, place.id, input.photos);
    await syncPerks(tx, place.id, input.perks);
    return tx.place.findUnique({ where: { id: place.id }, include: placeInclude });
  });

  return placeShape(created, { includeOwner: false });
}

export async function updatePlace(id, ownerId, input) {
  const db = await prisma();
  const resolvedOwnerId = await resolveOwnerId(ownerId);
  if (!resolvedOwnerId) return null;
  const existing = await db.place.findFirst({ where: { ...placeWhereById(id), ownerId: resolvedOwnerId } });
  if (!existing) return null;

  const updated = await db.$transaction(async (tx) => {
    await tx.place.update({ where: { id: existing.id }, data: placeData(input) });
    await syncPhotos(tx, existing.id, input.photos);
    await syncPerks(tx, existing.id, input.perks);
    return tx.place.findUnique({ where: { id: existing.id }, include: placeInclude });
  });

  return placeShape(updated, { includeOwner: false });
}

export async function setPlaceActive(id, ownerId, isActive) {
  return updatePlace(id, ownerId, { isActive });
}

export async function softDeletePlace(id, ownerId) {
  return setPlaceActive(id, ownerId, false);
}
