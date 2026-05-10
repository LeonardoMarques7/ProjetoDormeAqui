import { getPrismaClient } from "../../config/prisma.js";
import { buildPostgresHostDashboardData } from "./postgresAdapter.js";

function findForbiddenJsonTypes(value, path = "$", findings = []) {
  const valueType = typeof value;

  if (
    valueType === "bigint" ||
    valueType === "function" ||
    valueType === "symbol" ||
    valueType === "undefined"
  ) {
    findings.push({ path, type: valueType });
    return findings;
  }

  if (value === null || value instanceof Date) {
    return findings;
  }

  if (valueType === "number" && !Number.isFinite(value)) {
    findings.push({ path, type: String(value) });
    return findings;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenJsonTypes(item, `${path}[${index}]`, findings));
    return findings;
  }

  if (valueType === "object") {
    Object.entries(value).forEach(([key, entryValue]) =>
      findForbiddenJsonTypes(entryValue, `${path}.${key}`, findings)
    );
  }

  return findings;
}

function assertDashboardContract(dashboard) {
  const serialized = JSON.stringify(dashboard);
  const forbiddenTypes = findForbiddenJsonTypes(dashboard);

  if (!serialized) {
    throw new Error("Dashboard PostgreSQL nao gerou JSON serializavel.");
  }

  if (forbiddenTypes.length > 0) {
    throw new Error(`Payload contem tipos proibidos: ${JSON.stringify(forbiddenTypes, null, 2)}`);
  }

  if (dashboard.source !== "postgres") {
    throw new Error(`Fonte inesperada do dashboard: ${dashboard.source}`);
  }

  if (!Array.isArray(dashboard.overview?.kpis) || dashboard.overview.kpis.length === 0) {
    throw new Error("Payload sem KPIs em overview.kpis.");
  }

  if (!Array.isArray(dashboard.operationalProperties)) {
    throw new Error("Payload sem operationalProperties em formato de array.");
  }

  if (!dashboard.charts || !Array.isArray(dashboard.charts.revenueProjection)) {
    throw new Error("Payload sem charts.revenueProjection em formato de array.");
  }

  if (!dashboard.reports || dashboard.reports.source !== "postgres") {
    throw new Error("Payload sem reports PostgreSQL.");
  }

  if (!Array.isArray(dashboard.charts.revenueOverTime)) {
    throw new Error("Payload sem charts.revenueOverTime em formato de array.");
  }

  if (!Array.isArray(dashboard.charts.occupancyOverTime)) {
    throw new Error("Payload sem charts.occupancyOverTime em formato de array.");
  }

  if (!dashboard.financial?.comparison?.currentMonth) {
    throw new Error("Payload sem financial.comparison.currentMonth.");
  }

  if (!Array.isArray(dashboard.financial?.paymentsRefunds)) {
    throw new Error("Payload sem financial.paymentsRefunds em formato de array.");
  }

  if (!Array.isArray(dashboard.reports?.charts?.revenueOverTime)) {
    throw new Error("Payload sem reports.charts.revenueOverTime em formato de array.");
  }

  if (!Array.isArray(dashboard.reports?.charts?.occupancyOverTime)) {
    throw new Error("Payload sem reports.charts.occupancyOverTime em formato de array.");
  }

  if (!Array.isArray(dashboard.reports?.bookings?.byStatus)) {
    throw new Error("Payload sem reports.bookings.byStatus em formato de array.");
  }
}

async function findHostWithPlace(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT u.legacy_mongo_id, u.id
    FROM users u
    JOIN places p ON p.owner_id = u.id
    ORDER BY u.created_at
    LIMIT 1
  `;

  return rows[0] || null;
}

async function main() {
  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    const host = await findHostWithPlace(prisma);

    if (!host) {
      console.log("Nenhum anfitriao com acomodacao encontrado para testar o adaptador.");
      return;
    }

    const hostId = host.legacy_mongo_id || host.id;
    const dashboard = await buildPostgresHostDashboardData(hostId);
    assertDashboardContract(dashboard);

    console.log(
      JSON.stringify(
        {
          status: "ok",
          source: dashboard.source,
          postgresHostId: dashboard.postgresHostId,
          kpis: dashboard.overview?.kpis?.length || 0,
          properties: dashboard.operationalProperties?.length || 0,
          revenuePoints: dashboard.charts?.revenueProjection?.length || 0,
          reportRevenuePoints: dashboard.reports?.charts?.revenueOverTime?.length || 0,
          financialMovements: dashboard.financial?.paymentsRefunds?.length || 0,
          reports: Boolean(dashboard.reports),
          jsonSafe: true,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
