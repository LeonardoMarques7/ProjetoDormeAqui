import { prisma } from "./helpers.js";

export async function getHostFinancialEntries(hostId, { from = null, to = null } = {}) {
  const db = await prisma();
  return db.financialEntry.findMany({
    where: {
      userId: hostId,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      place: true,
      booking: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHostFinancialSummary(hostId, from, to) {
  const db = await prisma();
  return db.$queryRaw`
    SELECT *
    FROM get_host_financial_summary(${hostId}::uuid, ${from}::date, ${to}::date)
  `;
}

