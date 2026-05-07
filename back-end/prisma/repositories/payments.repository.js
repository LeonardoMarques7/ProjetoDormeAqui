import { prisma } from "./helpers.js";

export async function getLatestPaymentForBooking(bookingId) {
  const db = await prisma();
  return db.payment.findFirst({
    where: { booking: { OR: [{ id: bookingId }, { legacyMongoId: String(bookingId) }] } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHostPaymentStatusSummary(hostId, from, to) {
  const db = await prisma();
  return db.$queryRaw`
    SELECT *
    FROM get_host_payment_status_summary(${hostId}::uuid, ${from}::date, ${to}::date)
  `;
}

