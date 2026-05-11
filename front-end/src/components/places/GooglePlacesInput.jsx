import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import {
	hasGoogleMapsApi,
	loadGoogleMapsScript,
	parseAddressComponents,
} from "@/lib/googleMaps";

const SEARCH_TYPES = {
	address: ["address"],
	cities: ["(cities)"],
	establishments: ["establishment"],
};

const hasPlacesApi = () => hasGoogleMapsApi() && !!window.google?.maps?.places?.Autocomplete;

export const GooglePlacesInput = ({
	value = "",
	onChange,
	onSelect,
	onPlaceSelect,
	placeholder = "Digite um endereço",
	label,
	error,
	className = "",
	inputClassName = "",
	disabled = false,
	icon = true,
	searchType = "cities",
	inputRef,
	name,
	id,
}) => {
	const autoId = useId();
	const wrapperRef = useRef(null);
	const localInputRef = useRef(null);
	const autocompleteServiceRef = useRef(null);
	const placesServiceRef = useRef(null);
	const sessionTokenRef = useRef(null);
	const onSelectRef = useRef(onSelect);
	const onPlaceSelectRef = useRef(onPlaceSelect);
	const [isFocused, setIsFocused] = useState(false);
	const [googleAvailable, setGoogleAvailable] = useState(hasPlacesApi());
	const [suggestions, setSuggestions] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const emitSelection = (selection) => {
		onSelectRef.current?.(selection);
		onPlaceSelectRef.current?.(selection);
	};

	const handleValueChange = (nextValue) => {
		onChange?.({ target: { value: nextValue, name } });
	};

	useEffect(() => {
		if (!inputRef) return;

		if (typeof inputRef === "function") {
			inputRef(localInputRef.current);
			return;
		}

		inputRef.current = localInputRef.current;
	}, [inputRef]);

	useEffect(() => {
		onSelectRef.current = onSelect;
		onPlaceSelectRef.current = onPlaceSelect;
	}, [onSelect, onPlaceSelect]);

	const initializeGoogleServices = () => {
		if (
			!hasPlacesApi() ||
			autocompleteServiceRef.current ||
			placesServiceRef.current
		) {
			return;
		}

		autocompleteServiceRef.current =
			new window.google.maps.places.AutocompleteService();
		placesServiceRef.current = new window.google.maps.places.PlacesService(
			document.createElement("div"),
		);
		sessionTokenRef.current =
			new window.google.maps.places.AutocompleteSessionToken();
	};

	useEffect(() => {
		let isMounted = true;

		loadGoogleMapsScript({ libraries: ["places"] }).then((loaded) => {
			if (!isMounted) return;
			setGoogleAvailable(loaded);
			if (loaded) {
				initializeGoogleServices();
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const closeOnOutsideClick = (event) => {
			if (!wrapperRef.current?.contains(event.target)) {
				setIsOpen(false);
				setActiveIndex(-1);
			}
		};

		document.addEventListener("mousedown", closeOnOutsideClick);
		return () => document.removeEventListener("mousedown", closeOnOutsideClick);
	}, [isOpen]);

	const fetchSuggestions = (query) => {
		const service = autocompleteServiceRef.current;
		if (!service || !query?.trim()) {
			setSuggestions([]);
			setIsOpen(false);
			setActiveIndex(-1);
			return;
		}

		const normalizedType = SEARCH_TYPES[searchType] ? searchType : "cities";
		const request = {
			input: query,
			componentRestrictions: { country: "br" },
			types: SEARCH_TYPES[normalizedType],
			sessionToken: sessionTokenRef.current || undefined,
		};

		service.getPlacePredictions(request, (predictions, status) => {
			const isOk = status === window.google.maps.places.PlacesServiceStatus.OK;
			const nextSuggestions =
				isOk && Array.isArray(predictions) ? predictions : [];
			setSuggestions(nextSuggestions);
			setIsOpen(nextSuggestions.length > 0);
			setActiveIndex(-1);
		});
	};

	const selectPrediction = (prediction) => {
		const service = placesServiceRef.current;
		if (!service?.getDetails || !prediction?.place_id) return;

		const fallbackAddress = (prediction.description || "")
			.split(",")
			.map((part) => part.trim())
			.slice(0, 2)
			.join(", ");

		handleValueChange(fallbackAddress);
		emitSelection({
			address: fallbackAddress,
			fullAddress: prediction.description || fallbackAddress,
			name: prediction.structured_formatting?.main_text || fallbackAddress,
			city: fallbackAddress,
			state: "",
			street: "",
			streetNumber: "",
			complement: "",
			zipCode: "",
			country: "Brasil",
			neighborhood: "",
			latitude: undefined,
			longitude: undefined,
		});
		setSuggestions([]);
		setIsOpen(false);
		setActiveIndex(-1);

		service.getDetails(
			{
				placeId: prediction.place_id,
				fields: ["formatted_address", "geometry", "name", "address_components"],
				sessionToken: sessionTokenRef.current || undefined,
			},
			(place, status) => {
				const isOk =
					status === window.google.maps.places.PlacesServiceStatus.OK;
				const fullAddress =
					place?.formatted_address ||
					prediction.description ||
					fallbackAddress ||
					place?.name ||
					"";
				const locationDetails = parseAddressComponents(
					place?.address_components || [],
				);
				const address = locationDetails.cityLabel || fallbackAddress || place?.name || "";
				const latitude = isOk ? place?.geometry?.location?.lat?.() : undefined;
				const longitude = isOk ? place?.geometry?.location?.lng?.() : undefined;
				const selection = {
					address,
					fullAddress,
					name:
						place?.name ||
						prediction.structured_formatting?.main_text ||
						address,
					city: locationDetails.city || address,
					state: locationDetails.state,
					street: locationDetails.street,
					streetNumber: locationDetails.streetNumber,
					complement: locationDetails.complement,
					zipCode: locationDetails.zipCode,
					country: locationDetails.country,
					neighborhood: locationDetails.neighborhood,
					latitude,
					longitude,
				};

				handleValueChange(address);
				emitSelection(selection);

				if (hasPlacesApi()) {
					sessionTokenRef.current =
						new window.google.maps.places.AutocompleteSessionToken();
				}
			},
		);
	};

	const handleInputChange = (event) => {
		onChange?.(event);
		if (!googleAvailable) return;
		fetchSuggestions(event.target.value);
	};

	const handleInputKeyDown = (event) => {
		if (!isOpen || suggestions.length === 0) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
			return;
		}

		if (event.key === "Enter" && activeIndex >= 0) {
			event.preventDefault();
			selectPrediction(suggestions[activeIndex]);
			return;
		}

		if (event.key === "Escape") {
			setIsOpen(false);
			setActiveIndex(-1);
		}
	};

	return (
		<div ref={wrapperRef} className="relative grid w-full gap-3">
			{label && (
				<label
					htmlFor={id || autoId}
					className="text-sm font-medium tracking-wide text-gray-600"
				>
					{label}
				</label>
			)}

			<div className="relative">
				<div
					className={[
						"relative grid w-full items-center transition-all duration-200",
						icon
							? "grid-cols-[auto_minmax(0,1fr)] gap-4 px-4 py-3"
							: "grid-cols-1 px-4 py-3",
						disabled ? "cursor-not-allowed opacity-60" : "",
						className,
					]
						.filter(Boolean)
						.join(" ")}
				>
					{icon && (
						<MapPin className="h-6 w-6 flex-shrink-0 text-primary-900" />
					)}

					<input
						id={id || autoId}
						ref={localInputRef}
						name={name}
						type="text"
						placeholder={placeholder}
						value={value}
						onChange={handleInputChange}
						onFocus={(event) => {
							setIsFocused(true);
							if (googleAvailable && event.target.value?.trim()) {
								fetchSuggestions(event.target.value);
							}
						}}
						onBlur={() => setIsFocused(false)}
						onKeyDown={handleInputKeyDown}
						disabled={disabled}
						autoComplete="off"
						className={[
							"min-h-7 w-full bg-transparent text-sm text-gray-900 outline-none",
							"placeholder:text-gray-600",
							inputClassName,
						]
							.filter(Boolean)
							.join(" ")}
					/>
				</div>

				{isOpen && suggestions.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-50 mt-3 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
						<div className="grid gap-1.5">
							{suggestions.map((prediction, index) => {
								const mainText =
									prediction.structured_formatting?.main_text ||
									prediction.description;
								const secondaryText =
									prediction.structured_formatting?.secondary_text;
								const isActive = index === activeIndex;

								return (
									<button
										key={prediction.place_id}
										type="button"
										onMouseDown={(event) => {
											event.preventDefault();
											selectPrediction(prediction);
										}}
										className={[
											"grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
											isActive
												? "bg-gray-100 text-gray-900"
												: "text-gray-700 hover:bg-gray-50",
										]
											.filter(Boolean)
											.join(" ")}
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{mainText}</p>
											{secondaryText && (
												<p className="truncate text-xs text-gray-500">
													{secondaryText}
												</p>
											)}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{!googleAvailable && isFocused && (
				<p className="mt-2 text-xs text-amber-600">
					Google Places ainda não está disponível. Verifique a chave{" "}
					<code>VITE_GOOGLE_MAPS_API_KEY</code>.
				</p>
			)}

			{error && (
				<p className="mt-2 flex items-center gap-1 text-sm text-red-500">
					<span className="h-1.5 w-1.5 rounded-full bg-red-400" />
					{error}
				</p>
			)}
		</div>
	);
};

export default GooglePlacesInput;
