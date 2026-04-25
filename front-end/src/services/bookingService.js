import axios from "axios";

/**
 * Cancela uma reserva aprovada e solicita estorno ao provedor de pagamento (Stripe ou Mercado Pago).
 * @param {string} bookingId - ID da reserva
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId) => {
	const response = await axios.post(`/bookings/${bookingId}/cancel`);
	return response.data;
};

/**
 * Busca todas as reservas do proprietário (host)
 * @returns {Promise<Array>} Array de reservas
 */
export const fetchHostBookings = async () => {
	try {
		const { data } = await axios.get("/bookings/host");
		return data;
	} catch (error) {
		console.error("Erro ao buscar reservas do host:", error);
		return [];
	}
};

/**
 * Busca todas as reservas do hóspede (guest)
 * @returns {Promise<Array>} Array de reservas
 */
export const fetchGuestBookings = async () => {
	try {
		const { data } = await axios.get("/bookings/guest");
		return data;
	} catch (error) {
		console.error("Erro ao buscar reservas do hóspede:", error);
		return [];
	}
};

/**
 * Busca uma reserva específica pelo ID
 * @param {string} bookingId - ID da reserva
 * @returns {Promise<Object>} Dados da reserva
 */
export const fetchBookingById = async (bookingId) => {
	try {
		const { data } = await axios.get(`/bookings/${bookingId}`);
		return data;
	} catch (error) {
		console.error(`Erro ao buscar reserva ${bookingId}:`, error);
		return null;
	}
};

/**
 * Valida que uma reserva pertence a um place específico
 * @param {Object} booking - Objeto de reserva
 * @param {string} placeId - ID esperado do place
 * @returns {boolean} True se a reserva pertence ao place
 */
export const validateBookingPlace = (booking, placeId) => {
	if (!booking || !placeId) return false;
	return String(booking.place?._id || booking.placeId) === String(placeId);
};

/**
 * Filtra reservas de um place específico
 * @param {Array} bookings - Array de reservas
 * @param {string} placeId - ID do place
 * @returns {Array} Reservas filtradas do place
 */
export const filterBookingsByPlace = (bookings, placeId) => {
	if (!bookings || !placeId) return [];
	return bookings.filter(booking => validateBookingPlace(booking, placeId));
};
