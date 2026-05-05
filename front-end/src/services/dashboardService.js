import axios from "axios";

export const getHostDashboard = async () => {
  const { data } = await axios.get("/dashboard/host");
  return data;
};

export const getHostDashboardOverview = async () => {
  const { data } = await axios.get("/dashboard/host/overview");
  return data;
};

export const getHostCleaningInspection = async () => {
  const { data } = await axios.get("/dashboard/host/cleaning-inspection");
  return data;
};

export const getHostDashboardReports = async () => {
  const { data } = await axios.get("/dashboard/host/reports");
  return data;
};

export const getHostFinancialEntries = async (params = {}) => {
  const { data } = await axios.get("/finance", { params });
  return data;
};

export const getHostFinancialSummary = async (params = {}) => {
  const { data } = await axios.get("/finance/summary", { params });
  return data;
};

export const createHostFinancialEntry = async (payload) => {
  const { data } = await axios.post("/finance", payload);
  return data;
};

export const updateHostFinancialEntry = async (entryId, payload) => {
  const { data } = await axios.patch(`/finance/${entryId}`, payload);
  return data;
};

export const deleteHostFinancialEntry = async (entryId) => {
  const { data } = await axios.delete(`/finance/${entryId}`);
  return data;
};

export const updatePlaceStatus = async (placeId, isActive) => {
  const { data } = await axios.patch(`/places/${placeId}/status`, { isActive });
  return data;
};

