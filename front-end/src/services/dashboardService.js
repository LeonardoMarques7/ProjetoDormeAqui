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

export const getHostCleaningInspectionTask = async (taskId) => {
  const { data } = await axios.get(`/dashboard/host/cleaning-inspection/${taskId}`);
  return data;
};

export const updateHostCleaningInspectionStatus = async (taskId, payload) => {
  const { data } = await axios.patch(
    `/dashboard/host/cleaning-inspection/${taskId}/status`,
    payload,
  );
  return data;
};

export const updateHostCleaningInspectionChecklist = async (taskId, payload) => {
  const { data } = await axios.patch(
    `/dashboard/host/cleaning-inspection/${taskId}/checklist`,
    payload,
  );
  return data;
};

export const addHostCleaningInspectionEvidence = async (taskId, payload) => {
  const { data } = await axios.post(
    `/dashboard/host/cleaning-inspection/${taskId}/evidence`,
    payload,
  );
  return data;
};

export const updateHostCleaningInspectionAssignee = async (taskId, payload) => {
  const { data } = await axios.patch(
    `/dashboard/host/cleaning-inspection/${taskId}/assignee`,
    payload,
  );
  return data;
};

export const updateHostCleaningInspectionNotes = async (taskId, payload) => {
  const { data } = await axios.patch(
    `/dashboard/host/cleaning-inspection/${taskId}/notes`,
    payload,
  );
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

