import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
	MapPin,
	Calendar,
	Users,
	Search,
	AlertCircle,
	DoorOpen,
	Star,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select } from "@mantine/core";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMobileContext } from "../contexts/MobileContext";
import DatePickerSearch from "@/components/places/DatePickerSearch";
import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import {
	UsersIcon,
	AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import GooglePlacesInput from "@/components/places/GooglePlacesInput";

const SearchBar = ({ compact = false, onSearch }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { mobile } = useMobileContext();
	const searchInputRef = useRef(null);
	const [isSearching, setIsSearching] = useState(false);
	const [datePickerKey, setDatePickerKey] = useState(0);

	// Estados para drawer mobile
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [tempGuests, setTempGuests] = useState(null);
	const [tempRooms, setTempRooms] = useState(null);

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
			rooms: null,
			minRating: null,
		},
		mode: "onSubmit",
	});

	const onSubmit = async (formData) => {
		setIsSearching(true);

		try {
			// Construir query params
			const queryParams = new URLSearchParams();
			if (formData.city && formData.city.trim() !== "") {
				queryParams.append("city", formData.city);
			}
			if (formData.guests) {
				queryParams.append("guests", formData.guests);
			}
			if (formData.rooms) {
				queryParams.append("rooms", formData.rooms);
			}
			if (formData.minRating) {
				queryParams.append("minRating", formData.minRating);
			}

			// Fazer requisição ao backend com filtros
			const { data: searchResults } = await axios.get(
				`/places?${queryParams.toString()}`,
			);

			// Se estiver na Home e houver callback, usar callback local
			if (location.pathname === "/" && onSearch) {
				onSearch(searchResults, formData.city || "");
			} else {
				// Caso contrário, navega para a home com os resultados
				navigate("/", {
					state: {
						searchResults: searchResults,
						searchCity: formData.city || "",
					},
				});
			}

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

	const handleApplyFilters = () => {
		setValue("guests", tempGuests);
		setValue("rooms", tempRooms);
		setDrawerOpen(false);
	};

	const handleClearFilters = (e) => {
		e.preventDefault();
		setTempGuests(null);
		setTempRooms(null);
		setValue("guests", null);
		setValue("rooms", null);
	};

	if (compact) {
		// Versão compacta para o header
		return (
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="w-full max-w-xl mx-auto"
			>
				<div className="flex items-center gap-5 bg-white rounded-3xl shadow-2xl text-primary-900 px-3 py-2  transition-shadow">
					{/* Input de cidade com Google Places */}
					<div className="flex-1">
						<GooglePlacesInput
							value={watchedValues.city}
							onChange={(e) => setValue("city", e.target.value)}
							placeholder="Para onde você vai?"
							error={errors.city?.message}
							className="border-0 rounded-full px-0"
							icon={false}
						/>
					</div>

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
		<form onSubmit={handleSubmit(onSubmit)} className="flex-1 w-full mx-auto">
			<div className="flex items-center gap-5 bg-white rounded-3xl shadow-2xl text-primary-900 px-3 py-2 hover:shadow-lg transition-shadow">
				{/* Input de cidade com Google Places */}
				<div className="flex-1">
					<GooglePlacesInput
						value={watchedValues.city}
						onChange={(e) => setValue("city", e.target.value)}
						placeholder="Para onde você vai?"
						error={errors.city?.message}
						className="border-0 rounded-full px-0"
						icon={true}
					/>
				</div>

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
									<DatePickerSearch
										datePickerKey={datePickerKey}
										onDateSelect={({ checkin, checkout }) => {
											field.onChange(checkin);
											checkoutField.onChange(checkout);
										}}
										initialCheckin={field.value}
										initialCheckout={checkoutField.value}
									/>
								)}
							/>
						)}
					/>
				</div>

				{/* Separador */}
				<div className="w-px h-6 bg-gray-200" />

				{/* Mobile filter button */}
				{mobile && (
					<button
						type="button"
						onClick={() => {
							setTempGuests(watchedValues.guests || null);
							setTempRooms(watchedValues.rooms || null);
							setDrawerOpen(true);
						}}
						className="text-center cursor-pointer justify-center text-xl w-10 h-10 p-1 shadow-sm flex items-center gap-2 bg-primary-900 hover:bg-primary-black transition-colors rounded-full text-white font-medium flex-shrink-0"
					>
						<AdjustmentsHorizontalIcon className="text-white w-6 h-6" />
					</button>
				)}

				{/* Mobile filter drawer */}
				{mobile && (
					<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal={true}>
						<DrawerContent className="rounded-tl-3xl h-auto p-5 py-6 max-h-[80vh]">
							<p className="text-xl font-medium text-gray-900 mb-6">
								Hóspedes e Quartos
							</p>

							<div className="flex flex-col gap-6">
								{/* Hóspedes */}
								<div className="flex flex-col gap-4">
									<label className="text-sm font-medium text-gray-700">
										Hóspedes:
									</label>
									<div className="flex gap-2 flex-wrap">
										{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((guest) => (
											<button
												key={guest}
												type="button"
												onClick={() => setTempGuests(guest)}
												className={`px-4 py-2 rounded-lg transition-all font-medium ${
													tempGuests === guest
														? "bg-primary-900 text-white"
														: "bg-primary-100 text-primary-900 hover:bg-primary-200"
												}`}
											>
												{guest}
											</button>
										))}
									</div>
								</div>

								{/* Quartos */}
								<div className="flex flex-col gap-4">
									<label className="text-sm font-medium text-gray-700">
										Quartos:
									</label>
									<div className="flex gap-2 flex-wrap">
										{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((room) => (
											<button
												key={room}
												type="button"
												onClick={() => setTempRooms(room)}
												className={`px-4 py-2 rounded-lg transition-all font-medium ${
													tempRooms === room
														? "bg-primary-900 text-white"
														: "bg-primary-100 text-primary-900 hover:bg-primary-200"
												}`}
											>
												{room}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-4 mt-8">
								<button
									type="button"
									onClick={handleClearFilters}
									className="px-4 py-2 cursor-pointer hover:bg-primary-100 rounded-lg border hover:text-primary-900 transition-colors font-medium"
								>
									Limpar
								</button>
								<button
									type="button"
									onClick={handleApplyFilters}
									className="px-6 py-2 bg-primary-900 cursor-pointer text-white rounded-lg hover:bg-primary-800 transition-colors font-medium"
								>
									Aplicar
								</button>
							</div>
						</DrawerContent>
					</Drawer>
				)}

				{/* Desktop filters */}
				{!mobile && (
					<>
						<div className="flex gap-2 items-center">
							<UsersIcon className="w-6 h-6 text-primary-900 flex-shrink-0" />
							<Select
								value={
									watchedValues.guests ? watchedValues.guests.toString() : ""
								}
								onChange={(value) =>
									setValue("guests", value ? parseInt(value) : null)
								}
								data={[
									{ value: "1", label: "1 hóspede" },
									{ value: "2", label: "2 hóspedes" },
									{ value: "3", label: "3 hóspedes" },
									{ value: "4", label: "4 hóspedes" },
									{ value: "5", label: "5 hóspedes" },
									{ value: "6", label: "6 hóspedes" },
									{ value: "7", label: "7 hóspedes" },
									{ value: "8", label: "8 hóspedes" },
									{ value: "9", label: "9 hóspedes" },
									{ value: "10", label: "10 hóspedes" },
								]}
								placeholder="Quem?"
								clearable
								className="w-[140px]"
								styles={{
									input: {
										border: "transparent",
									},
									dropdown: {
										borderRadius: "12px",
									},
								}}
							/>
						</div>

						{/* Separador */}
						<div className="w-px h-6 bg-gray-200" />

						<div className="flex gap-2 items-center">
							<DoorOpen className="w-6 h-6 text-primary-900 flex-shrink-0" />
							<Select
								value={
									watchedValues.rooms ? watchedValues.rooms.toString() : ""
								}
								onChange={(value) =>
									setValue("rooms", value ? parseInt(value) : null)
								}
								data={[
									{ value: "1", label: "1 quarto" },
									{ value: "2", label: "2 quartos" },
									{ value: "3", label: "3 quartos" },
									{ value: "4", label: "4 quartos" },
									{ value: "5", label: "5 quartos" },
									{ value: "6", label: "6 quartos" },
									{ value: "7", label: "7 quartos" },
									{ value: "8", label: "8 quartos" },
									{ value: "9", label: "9 quartos" },
									{ value: "10", label: "10 quartos" },
								]}
								placeholder="Salas?"
								clearable
								className="w-[140px]"
								styles={{
									input: {
										border: "transparent",
									},
									dropdown: {
										borderRadius: "12px",
									},
								}}
							/>
						</div>
					</>
				)}

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
};

export default SearchBar;
