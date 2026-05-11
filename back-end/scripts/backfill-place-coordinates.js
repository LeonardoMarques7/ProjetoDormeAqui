import { getPrismaClient } from "../config/prisma.js";

const GOOGLE_GEOCODING_API_KEY =
	process.env.GOOGLE_GEOCODING_API_KEY ||
	process.env.VITE_GOOGLE_MAPS_API_KEY ||
	process.env.VITE_GOOGLE_PLACES_API_KEY;

async function geocodeAddress(address) {
	if (!GOOGLE_GEOCODING_API_KEY || !address) return null;

	const params = new URLSearchParams({
		address,
		key: GOOGLE_GEOCODING_API_KEY,
		region: "br",
	});

	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
	);
	if (!response.ok) {
		throw new Error(`Geocoding HTTP ${response.status}`);
	}

	const payload = await response.json();
	if (payload.status !== "OK" || !payload.results?.length) {
		return null;
	}

	const location = payload.results[0]?.geometry?.location;
	if (!location) return null;

	return {
		latitude: location.lat,
		longitude: location.lng,
		formattedAddress: payload.results[0]?.formatted_address || address,
	};
}

async function main() {
	if (!GOOGLE_GEOCODING_API_KEY) {
		throw new Error(
			"Defina GOOGLE_GEOCODING_API_KEY ou VITE_GOOGLE_MAPS_API_KEY antes de executar o backfill.",
		);
	}

	const prisma = getPrismaClient();
	const places = await prisma.place.findMany({
		where: {
			OR: [{ latitude: null }, { longitude: null }],
		},
		select: {
			id: true,
			title: true,
			address: true,
			city: true,
		},
		orderBy: { createdAt: "desc" },
	});

	console.log(`Backfill iniciado para ${places.length} acomodações.`);

	for (const place of places) {
		const searchAddress = place.address || place.city;
		if (!searchAddress) {
			console.log(`Ignorado ${place.title}: sem endereço/cidade.`);
			continue;
		}

		try {
			const result = await geocodeAddress(searchAddress);
			if (!result) {
				console.log(`Sem geocoding para ${place.title}: ${searchAddress}`);
				continue;
			}

			await prisma.place.update({
				where: { id: place.id },
				data: {
					address: place.address || result.formattedAddress,
					latitude: result.latitude,
					longitude: result.longitude,
				},
			});

			console.log(
				`Atualizado ${place.title}: ${result.latitude}, ${result.longitude}`,
			);
		} catch (error) {
			console.error(`Falha no geocoding de ${place.title}:`, error.message);
		}
	}

	await prisma.$disconnect();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
