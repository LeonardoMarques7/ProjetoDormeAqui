import { getPrismaClient } from "../migration/helpers/prisma.js";
import {
  getAnalyticViewRowCounts,
  getAnalyticViewsHealth,
  getBookingStatusReport,
  getDashboardDataQualityIssues,
  getHostDashboardSummaryMonthly,
  getHostFinancialSummaryMonthly,
  getHostMonthlyRevenue,
  getPaymentStatusReport,
  getPlaceMonthlyRevenue,
  getPlaceOccupancyMonthly,
  getPlaceReviewSummary,
  getReviewSummaryReport,
} from "./index.js";

function jsonReplacer(_key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

function summarizeRows(rows) {
  return {
    status: "ok",
    rowCount: rows.length,
  };
}

async function runQueryChecks(prisma) {
  const checks = [
    ["getAnalyticViewsHealth", () => getAnalyticViewsHealth(prisma)],
    ["getAnalyticViewRowCounts", () => getAnalyticViewRowCounts(prisma)],
    ["getDashboardDataQualityIssues", () => getDashboardDataQualityIssues(prisma)],
    ["getHostDashboardSummaryMonthly", () => getHostDashboardSummaryMonthly(prisma, { limit: 5 })],
    ["getHostMonthlyRevenue", () => getHostMonthlyRevenue(prisma, { limit: 5 })],
    ["getPlaceOccupancyMonthly", () => getPlaceOccupancyMonthly(prisma, { limit: 5 })],
    ["getPlaceReviewSummary", () => getPlaceReviewSummary(prisma, { limit: 5 })],
    ["getPlaceMonthlyRevenue", () => getPlaceMonthlyRevenue(prisma, { limit: 5 })],
    ["getHostFinancialSummaryMonthly", () => getHostFinancialSummaryMonthly(prisma, { limit: 5 })],
    ["getPaymentStatusReport", () => getPaymentStatusReport(prisma, { limit: 5 })],
    ["getBookingStatusReport", () => getBookingStatusReport(prisma, { limit: 5 })],
    ["getReviewSummaryReport", () => getReviewSummaryReport(prisma, { limit: 5 })],
  ];

  const results = [];

  for (const [name, query] of checks) {
    try {
      const rows = await query();
      const summary = summarizeRows(rows);
      results.push({ name, ...summary });
      console.log(`OK: ${name} (${summary.rowCount} linhas)`);
    } catch (error) {
      results.push({ name, status: "error", error: error.message });
      console.error(`ERRO: ${name}`);
      console.error(error.message);
      process.exitCode = 1;
    }
  }

  return results;
}

async function main() {
  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    const results = await runQueryChecks(prisma);
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, jsonReplacer, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
