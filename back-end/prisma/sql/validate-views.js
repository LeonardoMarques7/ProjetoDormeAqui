import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPrismaClient } from "../migration/helpers/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, "reports");

const expectedViews = [
  "v_host_monthly_revenue",
  "v_place_monthly_revenue",
  "v_place_occupancy_monthly",
  "v_host_booking_status_monthly",
  "v_host_payment_status_monthly",
  "v_place_review_summary",
  "v_host_financial_summary_monthly",
  "v_host_dashboard_summary_monthly",
];

function assertSafeViewName(viewName) {
  if (!/^v_[a-z0-9_]+$/.test(viewName)) {
    throw new Error(`Nome de view invalido: ${viewName}`);
  }
}

function timestampForFileName(date = new Date()) {
  return date.toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "");
}

async function validateView(prisma, viewName) {
  assertSafeViewName(viewName);

  try {
    const existsResult = await prisma.$queryRawUnsafe(
      "SELECT to_regclass($1) IS NOT NULL AS exists",
      viewName,
    );
    const exists = Boolean(existsResult[0]?.exists);

    if (!exists) {
      return {
        viewName,
        status: "missing",
        sampleCount: 0,
        error: "View nao encontrada no banco.",
      };
    }

    const sampleRows = await prisma.$queryRawUnsafe(`SELECT * FROM ${viewName} LIMIT 5`);

    return {
      viewName,
      status: "ok",
      sampleCount: sampleRows.length,
    };
  } catch (error) {
    return {
      viewName,
      status: "error",
      sampleCount: 0,
      error: error.message,
    };
  }
}

async function validateViews() {
  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    console.log(`Validando ${expectedViews.length} views esperadas...`);

    const results = [];

    for (const viewName of expectedViews) {
      console.log(`Validando ${viewName}...`);
      const result = await validateView(prisma, viewName);
      results.push(result);

      if (result.status === "ok") {
        console.log(`OK: ${viewName} (${result.sampleCount} linhas amostradas)`);
      } else {
        console.log(`${result.status.toUpperCase()}: ${viewName} - ${result.error}`);
      }
    }

    await mkdir(reportsDir, { recursive: true });

    const reportPath = path.join(
      reportsDir,
      `view-validation-${timestampForFileName()}.json`,
    );
    const report = {
      generatedAt: new Date().toISOString(),
      views: results,
    };

    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Relatorio salvo em ${reportPath}`);

    if (results.some((result) => result.status !== "ok")) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

validateViews().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
