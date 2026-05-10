import { isUuid, prisma, publicUserShape } from "./helpers.js";

function reviewShape(review) {
  if (!review) return null;
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

function idWhere(id) {
  return isUuid(id) ? { id } : { legacyMongoId: String(id) };
}

async function resolvePlaceId(id) {
  const db = await prisma();
  const place = await db.place.findFirst({ where: idWhere(id), select: { id: true } });
  return place?.id || null;
}

async function resolveUserId(id) {
  const db = await prisma();
  const user = await db.user.findFirst({ where: idWhere(id), select: { id: true } });
  return user?.id || null;
}

const include = {
  user: { include: { profile: true } },
  place: true,
  badges: true,
};

export async function getPlaceReviews(placeId) {
  const db = await prisma();
  const resolvedPlaceId = await resolvePlaceId(placeId);
  if (!resolvedPlaceId) return [];
  const reviews = await db.review.findMany({
    where: { placeId: resolvedPlaceId },
    include,
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(reviewShape);
}

export async function getUserReviews(userId) {
  const db = await prisma();
  const resolvedUserId = await resolveUserId(userId);
  if (!resolvedUserId) return [];
  const reviews = await db.review.findMany({
    where: { userId: resolvedUserId },
    include,
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(reviewShape);
}

export async function createReview({ place, user, booking, rating, comment, badges = [] }) {
  const db = await prisma();
  const [placeId, userId] = await Promise.all([resolvePlaceId(place), resolveUserId(user)]);
  if (!placeId || !userId) {
    const error = new Error("Usuario ou acomodacao nao encontrados.");
    error.statusCode = 404;
    throw error;
  }

  const bookingRecord = booking
    ? await db.booking.findFirst({ where: isUuid(booking) ? { id: booking } : { legacyMongoId: String(booking) } })
    : await db.booking.findFirst({
        where: {
          placeId,
          guestId: userId,
          status: { in: ["COMPLETED", "EVALUATION", "REVIEW"] },
        },
        orderBy: { checkOut: "desc" },
      });

  if (!bookingRecord) {
    const error = new Error("Reserva elegivel para avaliacao nao encontrada.");
    error.statusCode = 400;
    throw error;
  }

  const created = await db.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: bookingRecord.id,
        placeId,
        userId,
        rating: Number(rating),
        comment: comment || null,
        badges: {
          create: badges.map((slug) => ({
            slug: String(slug),
            sentiment: "POSITIVE",
          })),
        },
      },
      include,
    });
    const avg = await tx.review.aggregate({
      where: { placeId },
      _avg: { rating: true },
    });
    await tx.place.update({
      where: { id: placeId },
      data: { averageRating: avg._avg.rating || null },
    });
    return review;
  });

  return reviewShape(created);
}

