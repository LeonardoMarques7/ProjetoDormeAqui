import axios from "axios";

export const getAccommodationLogbook = async (filters = {}) => {
	const params = Object.fromEntries(
		Object.entries(filters).filter(([, value]) => value && value !== "all"),
	);

	const { data } = await axios.get("/logbook/accommodations", { params });
	return data;
};
