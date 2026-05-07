import "dotenv/config";
import { connectPrisma } from "../config/prisma.js";
import { getPrismaClient } from "../config/prisma.js";
import { listPlaces } from "../prisma/repositories/places.repository.js";
import { getHostBookings, getUserBookings } from "../prisma/repositories/bookings.repository.js";
import { getPlaceReviews } from "../prisma/repositories/reviews.repository.js";

async function main() {
  await connectPrisma();
  const prisma = await getPrismaClient();
  const [dbHealth] = await prisma.$queryRaw`SELECT current_database() AS database_name, now() AS checked_at`;
  const places = await listPlaces({});
  const [host] = await prisma.$queryRaw`
    SELECT u.legacy_mongo_id, u.id
    FROM users u
    JOIN places p ON p.owner_id = u.id
    ORDER BY u.created_at
    LIMIT 1
  `;
  const [guest] = await prisma.$queryRaw`
    SELECT u.legacy_mongo_id, u.id
    FROM users u
    JOIN bookings b ON b.guest_id = u.id
    ORDER BY u.created_at
    LIMIT 1
  `;
  const hostBookings = host ? await getHostBookings(host.legacy_mongo_id || host.id) : [];
  const userBookings = guest ? await getUserBookings(guest.legacy_mongo_id || guest.id) : [];
  const placeReviews = places[0] ? await getPlaceReviews(places[0]._id) : [];

  console.log(
    JSON.stringify(
      {
        status: "ok",
        postgres: true,
        database: dbHealth.database_name,
        placeSampleCount: places.length,
        hostBookingSampleCount: hostBookings.length,
        userBookingSampleCount: userBookings.length,
        reviewSampleCount: placeReviews.length,
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
