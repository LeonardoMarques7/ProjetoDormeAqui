import { getPrismaClient } from "../../config/prisma.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function prisma() {
  return getPrismaClient();
}

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

export function legacyId(record) {
  if (!record) return null;
  return record.legacyMongoId || record.id;
}

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeStatusFromIsActive(isActive) {
  return isActive === false ? "INACTIVE" : "ACTIVE";
}

export function isActiveFromStatus(status) {
  return !["INACTIVE", "ARCHIVED"].includes(String(status || "").toUpperCase());
}

export function publicUserShape(user) {
  if (!user) return null;
  const profile = user.profile || {};
  return {
    _id: legacyId(user),
    id: user.id,
    legacyMongoId: user.legacyMongoId,
    name: user.name,
    email: user.email,
    photo: profile.photoUrl || null,
    avatar: profile.photoUrl || null,
    banner: profile.bannerUrl || null,
    bio: profile.bio || null,
    phone: profile.phone || null,
    city: profile.city || null,
    pronouns: profile.pronouns || null,
    occupation: profile.occupation || null,
    role: "user",
    deactivated: user.deactivated,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function placeShape(place, options = {}) {
  if (!place) return null;
  const photos = [...(place.photos || [])]
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((photo) => photo.url);
  const perks = (place.perks || []).map((entry) => entry.perk?.slug || entry.perk?.name).filter(Boolean);
  const owner = options.includeOwner ? publicUserShape(place.owner) : legacyId(place.owner) || place.ownerId;

  const shape = {
    _id: legacyId(place),
    id: place.id,
    legacyMongoId: place.legacyMongoId,
    owner,
    type: place.type,
    title: place.title,
    city: place.city,
    address: place.address || null,
    addressStreet: place.addressStreet || null,
    address_street: place.addressStreet || null,
    addressNumber: place.addressNumber || null,
    address_number: place.addressNumber || null,
    addressComplement: place.addressComplement || null,
    address_complement: place.addressComplement || null,
    addressNeighborhood: place.addressNeighborhood || null,
    address_neighborhood: place.addressNeighborhood || null,
    addressCity: place.addressCity || place.city || null,
    address_city: place.addressCity || place.city || null,
    addressState: place.addressState || null,
    address_state: place.addressState || null,
    addressZipCode: place.addressZipCode || null,
    address_zip_code: place.addressZipCode || null,
    addressCountry: place.addressCountry || null,
    address_country: place.addressCountry || null,
    latitude: place.latitude === null ? null : toNumber(place.latitude, null),
    longitude: place.longitude === null ? null : toNumber(place.longitude, null),
    locationReference: place.locationReference || null,
    location_reference: place.locationReference || null,
    locationDescription: place.locationDescription || null,
    location_description: place.locationDescription || null,
    description: place.description,
    extras: place.extras,
    photos,
    perks,
    price: toNumber(place.pricePerNight),
    pricePerNight: toNumber(place.pricePerNight),
    checkin: place.checkInTime,
    checkout: place.checkOutTime,
    guests: place.maxGuests,
    maxGuests: place.maxGuests,
    rooms: place.rooms,
    beds: place.beds,
    bathrooms: place.bathrooms,
    isActive: isActiveFromStatus(place.status),
    status: String(place.status || "ACTIVE").toLowerCase(),
    averageRating: place.averageRating === null ? null : toNumber(place.averageRating),
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };

  if (options.extra && typeof options.extra === "object") {
    Object.assign(shape, options.extra);
  }

  return shape;
}

export function bookingShape(booking) {
  if (!booking) return null;
  const payment = booking.payments?.[0] || null;
  return {
    _id: legacyId(booking),
    id: booking.id,
    legacyMongoId: booking.legacyMongoId,
    place: placeShape(booking.place, { includeOwner: true }),
    user: publicUserShape(booking.guest),
    guest: publicUserShape(booking.guest),
    checkin: booking.checkIn,
    checkout: booking.checkOut,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    nights: booking.nights,
    pricePerNight: toNumber(booking.pricePerNight),
    priceTotal: toNumber(booking.totalPrice),
    totalPrice: toNumber(booking.totalPrice),
    status: String(booking.status || "PENDING").toLowerCase(),
    paymentStatus: payment?.status
      ? String(payment.status).toLowerCase()
      : String(booking.legacyPaymentStatus || "pending").toLowerCase(),
    mercadopagoPaymentId: booking.legacyMercadoPagoPaymentId || payment?.providerPaymentId || null,
    paymentProvider: payment?.provider || null,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}
