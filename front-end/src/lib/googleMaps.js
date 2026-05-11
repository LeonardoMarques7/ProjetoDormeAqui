const GOOGLE_MAPS_API_KEY =
	import.meta.env.VITE_GOOGLE_PLACES_API_KEY ||
	import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";
let googleMapsScriptPromise = null;

export const hasGoogleMapsApi = () =>
	typeof window !== "undefined" && !!window.google?.maps;

export const getGoogleMapsApiKey = () => GOOGLE_MAPS_API_KEY;

export const parseAddressComponents = (components = []) => {
	const findComponent = (type) =>
		components.find((component) => component.types?.includes(type));

	const street =
		findComponent("route")?.long_name ||
		findComponent("premise")?.long_name ||
		"";
	const streetNumber = findComponent("street_number")?.long_name || "";
	const complement =
		findComponent("subpremise")?.long_name ||
		findComponent("premise")?.long_name ||
		"";
	const zipCode = findComponent("postal_code")?.long_name || "";
	const country = findComponent("country")?.long_name || "";
	const city =
		findComponent("administrative_area_level_2")?.long_name ||
		findComponent("locality")?.long_name ||
		findComponent("sublocality_level_1")?.long_name ||
		findComponent("administrative_area_level_1")?.long_name ||
		"";
	const state = findComponent("administrative_area_level_1")?.short_name || "";
	const neighborhood =
		findComponent("sublocality_level_1")?.long_name ||
		findComponent("administrative_area_level_3")?.long_name ||
		"";

	return {
		street,
		streetNumber,
		complement,
		zipCode,
		country,
		city,
		state,
		neighborhood,
		cityLabel: [city, state].filter(Boolean).join(", "),
		fullStreet: [street, streetNumber].filter(Boolean).join(", "),
	};
};

export const loadGoogleMapsScript = ({ libraries = ["places"] } = {}) => {
	if (hasGoogleMapsApi()) {
		return Promise.resolve(true);
	}

	if (!GOOGLE_MAPS_API_KEY) {
		return Promise.resolve(false);
	}

	if (googleMapsScriptPromise) {
		return googleMapsScriptPromise;
	}

	googleMapsScriptPromise = new Promise((resolve) => {
		const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
		if (existingScript) {
			existingScript.addEventListener("load", () => resolve(hasGoogleMapsApi()), {
				once: true,
			});
			existingScript.addEventListener("error", () => resolve(false), {
				once: true,
			});
			return;
		}

		const script = document.createElement("script");
		script.id = GOOGLE_MAPS_SCRIPT_ID;
		script.async = true;
		script.defer = true;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(",")}`;
		script.addEventListener("load", () => resolve(hasGoogleMapsApi()), {
			once: true,
		});
		script.addEventListener("error", () => resolve(false), { once: true });
		document.head.appendChild(script);
	});

	return googleMapsScriptPromise;
};
