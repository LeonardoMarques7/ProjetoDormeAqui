import { buildCleaningInspectionData } from "../cleaningInspection/service.js";
import { buildPostgresHostDashboardData } from "./postgresAdapter.js";

export const buildHostDashboardData = async (hostId) => {
  const dashboardData = await buildPostgresHostDashboardData(hostId);

  try {
    dashboardData.cleaningInspection = await buildCleaningInspectionData(hostId);
  } catch (error) {
    console.warn(
      "Falha ao carregar limpeza/vistoria operacional sem afetar o dashboard principal.",
      error.message,
    );
    dashboardData.cleaningInspection = {
      summary: {
        pendingCleanings: 0,
        cleaningInProgress: 0,
        pendingInspections: 0,
        approvedForCheckin: 0,
        blockedProperties: 0,
        items: [],
      },
      filters: [],
      items: [],
    };
  }

  return dashboardData;
};
