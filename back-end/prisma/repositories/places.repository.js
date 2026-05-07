import { isUuid, normalizeStatusFromIsActive, placeShape, prisma } from "./helpers.js";

const placeInclude = {
  owner: { include: { profile: true } },
  photos: true,
  perks: { include: { perk: true } },
};

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
  if (input.type !== undefined) data.type = input.type || null;
  if (input.title !== undefined) data.title = input.title;
  if (input.city !== undefined) data.city = input.city;
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

export async function listPlaces(filters = {}) {
  const db = await prisma();
  const where = { status: "ACTIVE" };
  if (filters.city) where.city = { contains: String(filters.city).slice(0, 80), mode: "insensitive" };
  if (filters.guests) where.maxGuests = { gte: Number(filters.guests) };
  if (filters.rooms) where.rooms = { gte: Number(filters.rooms) };
  if (filters.minRating) where.averageRating = { gte: Number(filters.minRating) };

  const places = await db.place.findMany({
    where,
    include: placeInclude,
    orderBy: { createdAt: "desc" },
  });
  return places.map((place) => placeShape(place, { includeOwner: false }));
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
  return placeShape(place, { includeOwner });
}

export async function getHostPlaces(ownerId, { onlyActive = true } = {}) {
  const db = await prisma();
  const resolvedOwnerId = await resolveOwnerId(ownerId);
  if (!resolvedOwnerId) return [];
  const places = await db.place.findMany({
    where: {
      ownerId: resolvedOwnerId,
      ...(onlyActive ? { status: "ACTIVE" } : {}),
    },
    include: placeInclude,
    orderBy: { createdAt: "desc" },
  });
  return places.map((place) => placeShape(place, { includeOwner: false }));
}

export async function createPlace(ownerId, input) {
  const db = await prisma();
  const resolvedOwnerId = await resolveOwnerId(ownerId);
  if (!resolvedOwnerId) return null;

  const created = await db.$transaction(async (tx) => {
    const place = await tx.place.create({
      data: {
        ownerId: resolvedOwnerId,
        title: input.title,
        city: input.city,
        description: input.description,
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

