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

export const updatePlaceStatus = async (placeId, isActive) => {
  const { data } = await axios.patch(`/places/${placeId}/status`, { isActive });
  return data;
};

