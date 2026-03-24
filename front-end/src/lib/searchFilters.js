/**
 * Valida se uma data está disponível em uma acomodação
 * Uma acomodação está disponível se não há conflito com reservas existentes
 * 
 * Intervalo SEM conflito quando:
 * - checkOut <= bookingStart (termina antes do booking)
 * - checkIn >= bookingEnd (começa após o booking)
 */
export const isDateRangeAvailable = (checkIn, checkOut, bookings) => {
	if (!checkIn || !checkOut || !bookings || bookings.length === 0) {
		return true;
	}

	const requestStart = new Date(checkIn);
	const requestEnd = new Date(checkOut);

	// Normaliza horas para comparação correta
	requestStart.setHours(0, 0, 0, 0);
	requestEnd.setHours(0, 0, 0, 0);

	console.log(`    📅 Validando período: ${requestStart.toISOString().split('T')[0]} até ${requestEnd.toISOString().split('T')[0]}`);

	const hasConflict = bookings.some((booking) => {
		if (booking.paymentStatus === "canceled" || booking.paymentStatus === "rejected") {
			console.log(`      ✓ Booking ${booking._id} foi cancelado/rejeitado, ignorado`);
			return false;
		}

		const bookingStart = new Date(booking.checkin || booking.checkIn);
		const bookingEnd = new Date(booking.checkout || booking.checkOut);

		// Normaliza horas
		bookingStart.setHours(0, 0, 0, 0);
		bookingEnd.setHours(0, 0, 0, 0);

		const conflictExists =
			!(requestEnd <= bookingStart) && !(requestStart >= bookingEnd);

		if (conflictExists) {
			console.log(
				`      ✗ Conflito com booking: ${bookingStart.toISOString().split('T')[0]} até ${bookingEnd.toISOString().split('T')[0]}`
			);
		} else {
			console.log(
				`      ✓ Sem conflito com booking: ${bookingStart.toISOString().split('T')[0]} até ${bookingEnd.toISOString().split('T')[0]}`
			);
		}

		return conflictExists;
	});

	return !hasConflict;
};

/**
 * Busca bookings para múltiplas acomodações e enriquece os dados
 */
export const fetchBookingsForAccommodations = async (accommodations, axios) => {
	try {
		const enrichedAccommodations = await Promise.all(
			accommodations.map(async (accommodation) => {
				try {
					const { data: bookings } = await axios.get(
						`/bookings/place/${accommodation._id}`
					);
					return {
						...accommodation,
						bookings: bookings || [],
					};
				} catch (error) {
					console.warn(
						`Erro ao buscar bookings para ${accommodation._id}:`,
						error
					);
					return {
						...accommodation,
						bookings: [],
					};
				}
			})
		);
		return enrichedAccommodations;
	} catch (error) {
		console.error("Erro ao enriquecer acomodações com bookings:", error);
		return accommodations;
	}
};

/**
 * Filtra lista de acomodações com base em critérios combinados
 */
export const filterAccommodations = (accommodations, filters) => {
	if (!accommodations || accommodations.length === 0) {
		return [];
	}

	const {
		city = "",
		guests = null,
		rooms = null,
		checkIn = null,
		checkOut = null,
	} = filters;

	console.log("🔍 [filterAccommodations] Iniciando filtro:", {
		city,
		guests,
		rooms,
		checkIn: checkIn ? new Date(checkIn).toISOString().split('T')[0] : null,
		checkOut: checkOut ? new Date(checkOut).toISOString().split('T')[0] : null,
		totalAccommodations: accommodations.length,
	});

	const filtered = accommodations.filter((accommodation) => {
		// Filtro de cidade (case-insensitive, partial match)
		if (city && city.trim() !== "") {
			const accommodationCity = (accommodation.city || "").toLowerCase();
			const searchCity = city.toLowerCase();
			if (!accommodationCity.includes(searchCity)) {
				console.log(`  ❌ ${accommodation._id}: Cidade não corresponde (${accommodation.city} vs ${city})`);
				return false;
			}
		}

		// Filtro de hóspedes
		if (guests && guests > 0) {
			if (!accommodation.guests || accommodation.guests < guests) {
				console.log(
					`  ❌ ${accommodation._id}: Guests insuficientes (${accommodation.guests} < ${guests})`
				);
				return false;
			}
		}

		// Filtro de quartos
		if (rooms && rooms > 0) {
			if (!accommodation.rooms || accommodation.rooms < rooms) {
				console.log(`  ❌ ${accommodation._id}: Rooms insuficientes (${accommodation.rooms} < ${rooms})`);
				return false;
			}
		}

		// Filtro de datas (validar disponibilidade)
		if (checkIn && checkOut) {
			const bookings = accommodation.bookings || [];
			console.log(
				`  📅 ${accommodation._id}: Validando datas com ${bookings.length} reserva(s)`
			);

			if (!isDateRangeAvailable(checkIn, checkOut, bookings)) {
				console.log(`  ❌ ${accommodation._id}: Conflito de datas`);
				return false;
			}
		}

		console.log(`  ✅ ${accommodation._id}: Passou em todos os filtros`);
		return true;
	});

	console.log(`🎯 [filterAccommodations] Resultado: ${filtered.length} de ${accommodations.length}`);
	return filtered;
};
