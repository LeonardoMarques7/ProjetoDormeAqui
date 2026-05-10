import "dotenv/config";
import { getPrismaClient } from "../../config/prisma.js";

const EXPECTED_FUNCTIONS = [
  "fn_host_dashboard_summary_monthly",
  "fn_host_dashboard_places",
  "fn_host_dashboard_bookings",
  "fn_host_dashboard_operational_snapshot",
  "get_place_booked_dates",
  "get_host_calendar_events",
  "get_user_bookings",
  "get_booking_details",
  "get_host_places_summary",
  "get_host_dashboard_kpis",
  "get_host_revenue_series",
  "get_host_occupancy_series",
  "get_host_property_ranking",
  "get_host_booking_status_summary",
  "get_host_payment_status_summary",
  "get_host_financial_summary",
  "fn_host_cleaning_inspection_tasks",
  "fn_host_cleaning_inspection_metrics",
  "fn_host_cleaning_inspection_problem_places",
  "fn_host_cleaning_inspection_responsibles",
];

const EXPECTED_MATERIALIZED_VIEWS = ["mv_host_dashboard_summary_monthly"];

async function main() {
  const prisma = await getPrismaClient();
  await prisma.$connect();

  try {
    const functions = await prisma.$queryRaw`
      SELECT proname
      FROM pg_proc
      JOIN pg_namespace ns ON ns.oid = pg_proc.pronamespace
      WHERE ns.nspname = 'public'
        AND proname = ANY(${EXPECTED_FUNCTIONS})
    `;
    const materializedViews = await prisma.$queryRaw`
      SELECT matviewname
      FROM pg_matviews
      WHERE schemaname = 'public'
        AND matviewname = ANY(${EXPECTED_MATERIALIZED_VIEWS})
    `;

    const functionNames = new Set(functions.map((row) => row.proname));
    const materializedViewNames = new Set(materializedViews.map((row) => row.matviewname));
    const missingFunctions = EXPECTED_FUNCTIONS.filter((name) => !functionNames.has(name));
    const missingMaterializedViews = EXPECTED_MATERIALIZED_VIEWS.filter((name) => !materializedViewNames.has(name));

    const report = {
      status: missingFunctions.length === 0 && missingMaterializedViews.length === 0 ? "ok" : "failed",
      generatedAt: new Date().toISOString(),
      functions: EXPECTED_FUNCTIONS.map((name) => ({ name, exists: functionNames.has(name) })),
      materializedViews: EXPECTED_MATERIALIZED_VIEWS.map((name) => ({
        name,
        exists: materializedViewNames.has(name),
      })),
    };

    console.log(JSON.stringify(report, null, 2));

    if (report.status !== "ok") {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
