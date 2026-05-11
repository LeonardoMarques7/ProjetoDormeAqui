export function resolveLocationLabel(data = {}) {
	const city = data.addressCity || data.city || "";
	const state = data.addressState || "";
	return [city, state].filter(Boolean).join(", ");
}

export function normalizeAccommodationPayload(data = {}) {
	const city = data.addressCity?.trim() || data.city?.trim() || "";
	const state = data.addressState?.trim() || "";
	const street = data.addressStreet?.trim() || "";
	const number = data.addressNumber?.trim() || "";
	const fullAddress = [street, number].filter(Boolean).join(", ");

	return {
		type: data.type,
		title: data.title?.trim() || "",
		city,
		address: fullAddress || data.address?.trim() || null,
		addressStreet: street || null,
		addressNumber: number || null,
		addressComplement: data.addressComplement?.trim() || null,
		addressNeighborhood: data.addressNeighborhood?.trim() || null,
		addressCity: city || null,
		addressState: state || null,
		addressZipCode: data.addressZipCode?.trim() || null,
		addressCountry: data.addressCountry?.trim() || "Brasil",
		latitude:
			data.latitude === "" || data.latitude === null || data.latitude === undefined
				? null
				: Number(data.latitude),
		longitude:
			data.longitude === "" || data.longitude === null || data.longitude === undefined
				? null
				: Number(data.longitude),
		locationReference: data.locationReference?.trim() || null,
		locationDescription: data.locationDescription?.trim() || null,
		rooms: Number(data.rooms),
		bathrooms: Number(data.bathrooms),
		beds: Number(data.beds),
		guests: Number(data.guests),
		photos: data.photos,
		description: data.description?.trim() || "",
		extras: data.extras?.trim() || "",
		perks: data.perks,
		price: Number(data.price),
		checkin: data.checkin,
		checkout: data.checkout,
	};
}
