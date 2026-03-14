import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

/**
 * GooglePlacesInput Component
 * Componente wrapper para integrar Google Places Autocomplete em formulários
 * 
 * Props:
 * - value: string - Valor atual do campo
 * - onChange: function - Callback quando o valor muda
 * - onPlaceSelect: function - Callback quando um local é selecionado (retorna address_components)
 * - placeholder: string - Placeholder do input
 * - error: string - Mensagem de erro para validação
 * - className: string - Classes CSS adicionais
 * - disabled: boolean - Desabilitar input
 * - icon: boolean - Mostrar ícone de localização (default: true)
 */
export const GooglePlacesInput = ({
	value = "",
	onChange,
	onPlaceSelect,
	placeholder = "Digite sua cidade e estado",
	error,
	className = "",
	disabled = false,
	icon = true,
}) => {
	const [suggestions, setSuggestions] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	// Função para buscar sugestões usando Google Places Autocomplete API
	const fetchSuggestions = async (inputValue) => {
		if (!inputValue.trim()) {
			setSuggestions([]);
			return;
		}

		setLoading(true);
		try {
			// Usando Google Places Autocomplete Service
			const service = new (window.google.maps.places.AutocompleteService || (() => {
				// Fallback: Se não tiver a API, retorna array vazio
				return class {
					getPlacePredictions() {
						return Promise.resolve({ predictions: [] });
					}
				};
			}))();

			const response = await service.getPlacePredictions({
				input: inputValue,
				componentRestrictions: { country: "br" }, // Restringe a Brasil
				types: ["(cities)"],
			});

			setSuggestions(response.predictions || []);
			setIsOpen(true);
		} catch (error) {
			console.error("Erro ao buscar sugestões:", error);
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	};

	// Buscar detalhes do lugar selecionado
	const handleSelectPlace = async (placeId, description) => {
		try {
			const service = new (window.google.maps.places.PlacesService ||
				// Fallback para geolocalização se Google Places não estiver disponível
				(() => {
					return class {
						getDetails() {
							return Promise.resolve({
								address_components: extractAddressFromDescription(description),
							});
						}
					};
				}))();

			// Para PlacesService, precisamos de um DOM element
			const response = await service.getDetails({ placeId, fields: ["address_components"] });

			if (response) {
				updateFormWithPlaceDetails(response.address_components, description);
				onPlaceSelect?.(response.address_components, description);
			}

			setSuggestions([]);
			setIsOpen(false);
		} catch (error) {
			console.error("Erro ao buscar detalhes do local:", error);
			// Fallback: usar descrição diretamente
			onChange?.({ target: { value: description } });
			setSuggestions([]);
			setIsOpen(false);
		}
	};

	// Extrair componentes de endereço da descrição
	const extractAddressFromDescription = (description) => {
		const parts = description.split(",").map((p) => p.trim());
		const components = [];

		if (parts[0]) {
			components.push({
				long_name: parts[0],
				short_name: parts[0],
				types: ["locality", "political"],
			});
		}
		if (parts[1]) {
			components.push({
				long_name: parts[1],
				short_name: parts[1],
				types: ["administrative_area_level_1", "political"],
			});
		}

		return components;
	};

	// Atualizar formulário com detalhes do local
	const updateFormWithPlaceDetails = (addressComponents, description) => {
		let city = "";
		let state = "";

		addressComponents?.forEach((component) => {
			if (component.types.includes("locality")) {
				city = component.long_name;
			}
			if (component.types.includes("administrative_area_level_1")) {
				state = component.short_name;
			}
		});

		// Se não conseguiu extrair, usa a descrição inteira
		const formattedValue = city && state ? `${city}, ${state}` : description;
		onChange?.({ target: { value: formattedValue } });
	};

	return (
		<div className="relative w-full">
			{/* Input principal */}
			<div
				className={`
					relative flex items-center border rounded-2xl transition-all
					${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
					${disabled ? "opacity-50 cursor-not-allowed" : ""}
					${className}
				`}
			>
				{icon && <MapPin className="absolute left-4 text-gray-400 w-5 h-5" />}

				<input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(e) => {
						onChange?.(e);
						fetchSuggestions(e.target.value);
					}}
					onFocus={() => value && setSuggestions([])}
					onBlur={() => setTimeout(() => setIsOpen(false), 200)}
					disabled={disabled}
					className={`
						w-full px-4 py-3 outline-none bg-transparent text-sm
						${icon ? "pl-12" : ""}
						disabled:opacity-50 disabled:cursor-not-allowed
						focus:ring-2 focus:ring-primary-400
					`}
					autoComplete="off"
				/>

				{loading && (
					<div className="absolute right-4 w-4 h-4">
						<div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
					</div>
				)}
			</div>

			{/* Dropdown de sugestões */}
			{isOpen && suggestions.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto">
					{suggestions.map((suggestion) => (
						<button
							key={suggestion.place_id}
							type="button"
							onClick={() =>
								handleSelectPlace(suggestion.place_id, suggestion.description)
							}
							className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-start gap-3"
						>
							<MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900">
									{suggestion.main_text}
								</p>
								{suggestion.secondary_text && (
									<p className="text-xs text-gray-500">{suggestion.secondary_text}</p>
								)}
							</div>
						</button>
					))}
				</div>
			)}

			{/* Mensagem de erro */}
			{error && (
				<p className="flex items-center gap-1 text-sm text-red-500 mt-2">
					<span className="w-1.5 h-1.5 rounded-full bg-red-400" />
					{error}
				</p>
			)}
		</div>
	);
};

export default GooglePlacesInput;
