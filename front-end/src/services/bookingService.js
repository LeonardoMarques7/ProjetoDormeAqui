import axios from "axios";

/**
 * Cancela uma reserva aprovada e solicita estorno ao Mercado Pago.
 * @param {string} bookingId - ID da reserva
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId) => {
	const response = await axios.post(`/bookings/${bookingId}/cancel`);
	return response.data;
};
