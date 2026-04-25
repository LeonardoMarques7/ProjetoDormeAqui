import axios from "axios";

/**
 * Busca todas as acomodações do proprietário logado
 * @returns {Promise<Array>} Array de acomodações
 */
export const fetchOwnerPlaces = async () => {
	const { data } = await axios.get("/places/owner");
	return data;
};

/**
 * Busca uma acomodação específica pelo ID
 * @param {string} placeId - ID da acomodação
 * @returns {Promise<Object>} Dados da acomodação
 */
export const fetchPlaceById = async (placeId) => {
	const { data } = await axios.get(`/places/${placeId}`);
	return data;
};

/**
 * Busca múltiplas acomodações pelos IDs
 * @param {Array<string>} placeIds - Array de IDs de acomodações
 * @returns {Promise<Array>} Array de acomodações
 */
export const fetchPlacesByIds = async (placeIds) => {
	if (!placeIds || placeIds.length === 0) return [];
	
	try {
		const placesData = await Promise.all(
			placeIds.map(id => fetchPlaceById(id))
		);
		return placesData;
	} catch (error) {
		console.error("Erro ao buscar múltiplas acomodações:", error);
		return [];
	}
};

/**
 * Deleta uma acomodação
 * @param {string} placeId - ID da acomodação
 * @returns {Promise<Object>} Resposta da API
 */
export const deletePlace = async (placeId) => {
	const { data } = await axios.delete(`/places/${placeId}`);
	return data;
};

/**
 * Busca uma acomodação validando que pertence ao proprietário
 * @param {string} placeId - ID da acomodação
 * @param {Array} ownerPlaces - Array de acomodações do proprietário
 * @returns {Object|null} Acomodação encontrada ou null
 */
export const validatePlaceOwnership = (placeId, ownerPlaces) => {
	if (!placeId || !ownerPlaces || ownerPlaces.length === 0) {
		return null;
	}
	return ownerPlaces.find(place => String(place._id) === String(placeId)) || null;
};
