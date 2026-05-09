export const isDateRangeAvailable = () => true;

/**
 * Disponibilidade agora eh calculada no back-end/PostgreSQL.
 * Mantemos a assinatura para preservar compatibilidade com os consumidores atuais.
 */
export const fetchBookingsForAccommodations = async (accommodations) => accommodations;

/**
 * Os filtros principais tambem passam a ser resolvidos pelo back-end.
 * O cliente apenas consome a lista pronta para exibicao.
 */
export const filterAccommodations = (accommodations) => {
	if (!Array.isArray(accommodations)) {
		return [];
	}

	return accommodations;
};
