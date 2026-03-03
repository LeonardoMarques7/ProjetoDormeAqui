import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Item from "@/components/places/Item";
import axios from "axios";
import {
	Eraser,
	MapPin,
	Search,
	Users,
	AlertCircle,
	X,
	ChevronRight,
	Calendar,
	Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import Banner from "../assets/banner2.jpg";

import "./Home.css";
import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import { useMobileContext } from "../components/contexts/MobileContext";
import { useLocation } from "react-router";
import SearchBar from "@/components/layout/SearchBar";

const Home = () => {
	const location = useLocation();
	const searchInputRef = useRef(null);
	const [city, setCity] = useState("");
	const { mobile } = useMobileContext();
	const [places, setPlaces] = useState([]);
	const [placesSearch, setPlacesSearch] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [datePickerKey, setDatePickerKey] = useState(0);

	// Configuração do React Hook Form com Zod
	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors },
		reset,
		clearErrors,
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

	const fetchPlaces = async () => {
		try {
			const { data } = await axios.get("/places");
			setTimeout(() => {
				setPlaces(data);
				setLoading(false);
			}, 50);
		} catch (error) {
			console.error("Erro ao carregar acomodações:", error);
		}
	};

	useEffect(() => {
		fetchPlaces();
	}, []);

	// Processa resultados da busca vindo do SearchBar no Header
	useEffect(() => {
		if (location.state?.searchResults) {
			setCity(location.state.searchCity || "");
			setPlacesSearch(location.state.searchResults);
			// Limpa o state após usar
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	const normalize = (str) =>
		str
			? str
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase()
			: "";

	const onSubmit = async (formData) => {
		setIsSearching(true);
		setCity(formData.city || "");

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

			setTimeout(() => {
				setPlacesSearch(filteredResults);
				setIsSearching(false);
				setDrawerOpen(false);
			}, 300);
		} catch (err) {
			console.error("Erro na busca local:", err);
			setIsSearching(false);
		}
	};

	const limparPesquisa = (e) => {
		e.preventDefault();
		setCity("");
		setPlacesSearch([]);
		reset({
			city: "",
			checkin: null,
			checkout: null,
			guests: null,
		});
		clearErrors();
		setDatePickerKey((prev) => prev + 1); // Força re-render do DatePicker
	};

	const handleDateSelect = ({ checkin: newCheckin, checkout: newCheckout }) => {
		setValue("checkin", newCheckin);
		setValue("checkout", newCheckout);
	};

	return (
		<div>
			{/* Banner com SearchBar Mobile */}
			<div className="relative flex justify-center w-full mb-12 ">
				{mobile && (
					/* Versão Mobile - SearchBar no Drawer */
					<div className="absolute z-20 -bottom-8 left-0 right-0 px-3.5">
						<Drawer
							open={drawerOpen}
							className="rounded-3xl"
							onOpenChange={setDrawerOpen}
						>
							<DrawerTrigger asChild>
								<button
									className="w-full bg-white shadow-lg rounded-2xl px-4 py-4 
								flex items-center gap-3 hover:shadow-xl transition-shadow"
								>
									<div className="flex-1 text-left">
										<p className="text-sm font-semibold text-gray-900">
											{city ? "Pesquisa personalizada" : "Inicie sua busca"}
										</p>
										<p className="text-xs text-gray-500">
											{city || "Para onde? • Quando? • Quem?"}
										</p>
									</div>
									<Search className="mr-2" />
								</button>
							</DrawerTrigger>

							<DrawerContent className="p-0">
								<DrawerHeader className="p-6 pb-4 border-b sticky top-0 bg-white z-10">
									<div className="flex items-center justify-between">
										<DrawerTitle className="text-xl !font-medium">
											Buscar acomodações
										</DrawerTitle>
										<button
											onClick={() => setDrawerOpen(false)}
											className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
										>
											<X className="w-5 h-5" />
										</button>
									</div>
								</DrawerHeader>

								<div className="flex flex-col h-full">
									<div className="flex-1 overflow-y-auto p-6 space-y-6">
										{/* Campo Cidade */}
										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">
												Para onde você vai?
											</label>
											<div className="relative">
												<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
												<input
													type="text"
													placeholder="Pesquisar destinos"
													className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-colors"
													{...register("city")}
												/>
											</div>
											{errors.city && (
												<p className="text-sm text-red-500 flex items-center gap-1">
													<AlertCircle className="w-4 h-4" />
													{errors.city.message}
												</p>
											)}
										</div>

										{/* Campo Datas */}
										<div className="space-y-2 w-full">
											<label className="text-sm font-semibold text-gray-700">
												Quando?
											</label>
											<div className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-500 transition-colors">
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
											{errors.checkin && (
												<p className="text-sm text-red-500 flex items-center gap-1">
													<AlertCircle className="w-4 h-4" />
													{errors.checkin.message}
												</p>
											)}
										</div>

										{/* Campo Hóspedes */}
										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">
												Quem?
											</label>
											<div className="relative">
												<Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
												<input
													type="number"
													placeholder="Número de hóspedes"
													className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-colors"
													{...register("guests", {
														valueAsNumber: true,
														setValueAs: (v) => (v === "" ? null : parseInt(v)),
													})}
													min="1"
													max="20"
												/>
											</div>
											{errors.guests && (
												<p className="text-sm text-red-500 flex items-center gap-1">
													<AlertCircle className="w-4 h-4" />
													{errors.guests.message}
												</p>
											)}
										</div>
									</div>

									{/* Footer fixo com botões */}
									<div className="sticky bottom-0 bg-white border-t p-6 space-y-3">
										<div className="flex items-center gap-4">
											<Button
												onClick={handleSubmit(onSubmit)}
												disabled={isSearching}
												className="justify-center font-normal flex-1 h-15 border bg-primary-800 hover:bg-primary-900 cursor-pointer hover:text-white border-gray-200 rounded-2xl text-white outline-primary-400 disabled:opacity-50"
											>
												{isSearching ? (
													<div className="flex items-center gap-2">
														<div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
														Buscando...
													</div>
												) : (
													<div className="flex items-center gap-2">Buscar</div>
												)}
											</Button>
											<button
												onClick={(e) => {
													limparPesquisa(e);
													setDatePickerKey((prev) => prev + 1);
												}}
												className="bg-red-500 cursor-pointer text-white h-15 w-15 justify-center rounded-xl text-sm font-bold hover:bg-red-700/90 transition-all disabled:bg-red-100 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg disabled:shadow-none"
											>
												<Trash />
											</button>
										</div>
									</div>
								</div>
							</DrawerContent>
						</Drawer>
					</div>
				)}
			</div>

			{city ? (
				placesSearch.length > 0 ? (
					// Caso 3: pesquisou e encontrou
					<div className="mx-auto mb-5 text-primary-500  max-w-full gap-2 w-full flex justify-between items-center px-8  2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10 text-2xl text-start pt-5">
						<span>
							Buscando por{" "}
							<span className="font-medium text-primary-900">{city}</span> e foi
							encontrado{" "}
							{placesSearch.length > 1
								? `${placesSearch.length} resultados`
								: `${placesSearch.length} resultado`}
							.
						</span>
						<button
							onClick={limparPesquisa}
							className=" ml-auto flex items-center cursor-pointer border border-transparent  hover:bg-red-50 transition-all gap-2 !text-lg  text-red-500  p-2.5 px-5 rounded-2xl"
						>
							<Eraser /> Limpar pesquisa
						</button>
					</div>
				) : (
					// Caso 2: pesquisou mas não encontrou
					<>
						<div className="max-sm:text-lg max-sm:mb-2.5 max-sm:pt-0 font-medium max-w-full mb-5 w-full flex justify-start items-start px-4 max-sm:px-3.5 text-start pt-5">
							{/* Conteúdo */}
							<div className="text-center flex-col max-sm:mx-3.5 flex gap-2 items-start max-sm:text-start justify-start transition-all">
								<h1 className="max-sm:text-xl!">
									<strong className="text-red-500">Ops!</strong> Não encontramos
									acomodações que correspondam à sua busca.
								</h1>
								<p className="text-primary-700 mb-5">
									Não encontramos acomodações que correspondam aos seus
									critérios de busca.
								</p>
								<button
									onClick={limparPesquisa}
									className="edit__btn outline-none  cursor-pointer  flex items-center justify-center transition-all duration-300 ease-in-out hover:px-2 hover:bg-red-700 gap-2 bg-red-500 text-white px-2 rounded-md text-center py-2.5"
								>
									<p className="!text-sm  transition-all duration-300 ease-in-out whitespace-nowrap">
										Limpar Todos os Filtros
									</p>
								</button>
							</div>
						</div>
						<div className="max-sm:text-lg text-lg max-sm:mb-2.5 max-sm:pt-0 font-medium max-w-full mb-5 w-full flex justify-start items-start px-4 max-sm:px-3.5 text-start pt-5">
							<span className="max-sm:text-sm font-normal">
								Confira abaixo outras opções disponíveis:
							</span>
						</div>
					</>
				)
			) : (
				// Caso 1: sem pesquisa
				<></>
			)}
			{loading && (
				<div className="relative ">
					{mobile ? (
						<div className="grid transition-transform mx-auto max-w-7xl relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-8 max-sm:px-3.5 ">
							{[...Array(16)].map((_, index) => (
								<div
									key={index}
									className="flex flex-col gap-2 w-full max-w-[350px]"
								>
									<Skeleton className="aspect-square w-full rounded-none rounded-t-2xl" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-1/4" />
										<Skeleton className="h-7 w-2/4" />
										<Skeleton className="h-4 w-3/8" />
										<Skeleton className="h-4 w-4/6" />
									</div>
									<Skeleton className="h-5 w-50 mt-1" />
								</div>
							))}
						</div>
					) : (
						<div className="grid max-w-7xl transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-8 max-sm:px-3.5">
							{[...Array(16)].map((_, index) => (
								<div
									key={index}
									className="flex flex-col gap-2 w-full max-w-[350px]"
								>
									<Skeleton className="aspect-square w-full rounded-none rounded-t-2xl" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-1/4" />
										<Skeleton className="h-7 w-2/4" />
										<Skeleton className="h-4 w-3/8" />
										<Skeleton className="h-4 w-4/6" />
									</div>
									<Skeleton className="h-5 w-50 mt-1" />
								</div>
							))}
						</div>
					)}
				</div>
			)}
			{/* GRID DE RESULTADOS */}
			{city && placesSearch.length > 0 && (
				<div className="grid mb-10 max-w-7xl relative transition-transform grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 mx-auto gap-8 px-4 max-sm:px-3.5 py-4 ">
					<>
						{placesSearch.map((place) => (
							<Item {...{ place }} key={place._id} />
						))}
						<div className="min-w-full col-span-full columns-auto"></div>
					</>
				</div>
			)}
			{(!city || placesSearch.length === 0) && (
				<div className="relative mb-10">
					<div className="grid max-w-7xl transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-4 max-sm:px-3.5">
						{places.map((place) => (
							<Item {...{ place }} key={place._id} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Home;
