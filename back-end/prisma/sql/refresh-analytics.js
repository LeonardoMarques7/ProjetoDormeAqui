import { getPrismaClient } from "../migration/helpers/prisma.js";

async function refreshAnalytics() {
  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    console.log("Atualizando materialized views analiticas...");
    await prisma.$executeRawUnsafe("REFRESH MATERIALIZED VIEW mv_host_dashboard_summary_monthly");
    console.log("OK: mv_host_dashboard_summary_monthly");
  } finally {
    await prisma.$disconnect();
  }
}

refreshAnalytics().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
