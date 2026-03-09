import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { MapPin, Calendar, Users, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import { UsersIcon } from "@heroicons/react/24/outline";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const SearchBar = ({ compact = false }) => {
	const navigate = useNavigate();
	const searchInputRef = useRef(null);
	const [isSearching, setIsSearching] = useState(false);
	const [datePickerKey, setDatePickerKey] = useState(0);
	const [places, setPlaces] = useState([]);

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(searchSchema),
		defaultValues: {
			city: "",
			checkin: null,
			checkout: null,
			guests: null,
		},
		mode: "onSubmit",
	});

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const { data } = await axios.get("/places");
				setPlaces(data);
			} catch (error) {
				console.error("Erro ao carregar acomodações:", error);
			}
		};
		fetchPlaces();
	}, []);

	const normalize = (str) =>
		str
			? str
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase()
			: "";

	const onSubmit = async (formData) => {
		setIsSearching(true);
		const searchTerm = normalize(formData.city);

		try {
			let filteredResults = places.filter((place) => {
				const normalizedCity = normalize(place.city);
				const normalizedState = normalize(place.state);
				const normalizedUf = normalize(place.uf);

				const matchLocation =
					normalizedCity.includes(searchTerm) ||
					normalizedState.includes(searchTerm) ||
					normalizedUf.includes(searchTerm);

				return formData.city ? matchLocation : true;
			});

			if (formData.guests) {
				filteredResults = filteredResults.filter(
					(place) => place.guests >= formData.guests,
				);
			}

			// Navega para a home com os resultados
			navigate("/", {
				state: {
					searchResults: filteredResults,
					searchCity: formData.city,
				},
			});

			reset();
			setDatePickerKey((prev) => prev + 1);

			// Aguarda 300ms adicional para finalizar animação do spinner
			await new Promise((resolve) => setTimeout(resolve, 1500));
		} catch (err) {
			console.error("Erro na busca:", err);
		} finally {
			setIsSearching(false);
		}
	};

	const watchedValues = watch();

	if (compact) {
		// Versão compacta para o header
		return (
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="w-full max-w-4xl mx-auto"
			>
				<div className="flex items-center gap-5 bg-white rounded-3xl shadow-2xl text-primary-900 px-10 py-5 hover:shadow-lg transition-shadow">
					{/* Ícone de localização */}
					<MapPin className="w-5 h-5 text-primary-900 flex-shrink-0" />

					{/* Input de cidade */}
					<input
						ref={searchInputRef}
						type="text"
						placeholder="Para onde você vai? "
						className="outline-none flex-1 text-sm bg-transparent placeholder:text-primary-900"
						{...register("city")}
					/>

					{/* Separador */}
					<span className="w-px h-6 bg-gray-200" />

					{/* DatePicker */}
					<div className="flex-1 ">
						<Controller
							name="checkin"
							control={control}
							render={({ field }) => (
								<Controller
									name="checkout"
									control={control}
									render={({ field: checkoutField }) => (
										<DatePickerAirbnb
											key={datePickerKey}
											onDateSelect={({ checkin, checkout }) => {
												field.onChange(checkin);
												checkoutField.onChange(checkout);
											}}
											initialCheckin={field.value}
											initialCheckout={checkoutField.value}
											search={true}
											compact={true}
										/>
									)}
								/>
							)}
						/>
					</div>

					{/* Separador */}
					<div className="w-px h-6 bg-gray-200" />

					{/* Ícone de pessoas */}
					<UsersIcon className="w-6 h-6 text-primary-900 flex-shrink-0" />

					{/* Input de hóspedes */}
					<input
						type="number"
						placeholder="Quem?"
						className="outline-none w-30 text-sm bg-transparent placeholder:text-primary-900"
						{...register("guests", {
							valueAsNumber: true,
							setValueAs: (v) => (v === "" ? null : parseInt(v)),
						})}
						min="1"
						max="20"
					/>

					{/* Botão de busca */}
					<ShimmerButton
						type="submit"
						disabled={isSearching}
						background="rgba(17, 24, 39, 1)"
						shimmerColor="#ffffff"
						shimmerDuration="2s"
						className="px-3 py-3 flex items-center justify-center gap-2"
					>
						{isSearching ? (
							<div className="relative w-5 h-5">
								<div className="absolute inset-0 rounded-full border-2 border-white/20" />
								<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin-smooth" />
							</div>
						) : (
							<Search className="w-5 h-5 transition-transform duration-300" />
						)}
					</ShimmerButton>
				</div>

				{/* Erros */}
				{Object.keys(errors).length > 0 && (
					<div className="mt-2 text-xs text-red-500 flex items-center gap-1">
						<AlertCircle className="w-4 h-4" />
						<span>Verifique seus critérios de busca</span>
					</div>
				)}
			</form>
		);
	}

	// Versão padrão (como estava antes)
	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full">
			<div className="2xl:max-w-10/12 z-20 w-full max-w-5xl max-lg:max-w-4xl bg-white flex flex-col justify-center p-4 pl-8 px-4 shadow-xl rounded-2xl">
				<div className="flex items-center w-full justify-start">
					{/* Campo Cidade */}
					<div className="group__input relative pr-4 border-r flex w-full items-center">
						<MapPin className="text-primary-900 size-5 flex-shrink-0" />
						<input
							ref={searchInputRef}
							id="city"
							type="text"
							placeholder="Para onde você vai?"
							className="ml-4 outline-none w-full"
							{...register("city")}
						/>
					</div>

					{/* Campo Datas */}
					<div className="w-90 2xl:w-120 h-fit text-nowrap border-r px-6">
						<Controller
							name="checkin"
							control={control}
							render={({ field }) => (
								<Controller
									name="checkout"
									control={control}
									render={({ field: checkoutField }) => (
										<DatePickerAirbnb
											key={datePickerKey}
											onDateSelect={({ checkin, checkout }) => {
												field.onChange(checkin);
												checkoutField.onChange(checkout);
											}}
											initialCheckin={field.value}
											initialCheckout={checkoutField.value}
											search={true}
										/>
									)}
								/>
							)}
						/>
					</div>

					{/* Campo Hóspedes */}
					<div className="group__input relative pl-6 pr-4 flex items-center w-90">
						<Users className="text-primary-900 size-5 flex-shrink-0" />
						<input
							id="guests"
							type="number"
							className="ml-4 outline-none w-full"
							placeholder="Hóspedes"
							{...register("guests", {
								valueAsNumber: true,
								setValueAs: (v) => (v === "" ? null : parseInt(v)),
							})}
							min="1"
							max="20"
						/>
					</div>

					{/* Botão de Busca */}
					<ShimmerButton
						type="submit"
						disabled={isSearching}
						background="rgba(17, 24, 39, 1)"
						shimmerColor="#ffffff"
						shimmerDuration="2s"
						className="ml-4 px-6 py-3 h-full flex items-center justify-center gap-2"
					>
						{isSearching ? (
							<div className="flex items-center gap-2">
								<div className="relative w-5 h-5">
									<div className="absolute inset-0 rounded-full border-2 border-white/20" />
									<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin-smooth" />
								</div>
								<span className="text-sm font-medium">Buscando...</span>
							</div>
						) : (
							<>
								<Search className="w-5 h-5 transition-transform duration-900" />
								<span className="text-sm font-medium">Buscar</span>
							</>
						)}
					</ShimmerButton>
				</div>

				{/* Mensagem de erro */}
				{Object.keys(errors).length > 0 && (
					<div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-start gap-2">
							<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
							<div className="flex flex-col gap-1 text-sm text-red-600">
								{errors.city && <span>• {errors.city.message}</span>}
								{errors.checkin && <span>• {errors.checkin.message}</span>}
								{errors.checkout && <span>• {errors.checkout.message}</span>}
								{errors.guests && <span>• {errors.guests.message}</span>}
							</div>
						</div>
					</div>
				)}
			</div>
		</form>
	);
};

export default SearchBar;
