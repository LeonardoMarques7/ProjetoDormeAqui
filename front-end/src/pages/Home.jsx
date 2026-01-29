import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Item from "../components/Item";
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
import DatePickerAirbnb from "../components/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import { useMobileContext } from "../components/contexts/MobileContext";
import { useLocation } from "react-router";

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
		mode: "onSubmit", // Valida apenas no submit para não quebrar o layout
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

	useEffect(() => {
		if (location.state?.focusSearch) {
			searchInputRef.current?.focus();
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
		setCity(formData.city || ""); // Armazena o termo visualmente

		// 1. Normaliza o termo de busca digitado pelo usuário
		const searchTerm = normalize(formData.city);

		try {
			// Se você já tem todos os lugares carregados no estado `places` (do fetchPlaces inicial),
			// use-o como base. Se não, terá que buscar tudo de novo.

			// Vamos assumir que 'places' contém a lista completa original
			let filteredResults = places.filter((place) => {
				// Normaliza os dados do local (banco de dados)
				const normalizedCity = normalize(place.city);
				const normalizedState = normalize(place.state); // Supondo que exista place.state ou place.uf
				const normalizedUf = normalize(place.uf);

				// Lógica da Busca Abrangente:
				// Verifica se o termo está na cidade OU no estado OU na sigla
				const matchLocation =
					normalizedCity.includes(searchTerm) ||
					normalizedState.includes(searchTerm) ||
					normalizedUf.includes(searchTerm);

				// Se não digitou cidade, considera verdadeiro (para filtrar só por data/hóspedes depois)
				return formData.city ? matchLocation : true;
			});

			// 2. Aplica os outros filtros (Data e Hóspedes) na lista já filtrada por local
			if (formData.guests) {
				filteredResults = filteredResults.filter(
					(place) => place.guests >= formData.guests,
				);
			}

			setTimeout(() => {
				setPlacesSearch(filteredResults);
				setIsSearching(false);
				setSheetOpen(false); // Fecha o sheet após buscar
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

	const watchedValues = watch();
	const hasFilters =
		watchedValues.city || watchedValues.checkin || watchedValues.guests;

	return (
		<div>
			<div className="relative flex justify-center w-full mb-12 ">
				<div className="sm:banner__home max-sm:h-[25svh] max-w-7xl w-full xl:h-[30svh] h-[50svh] 2xl:max-w-full 2xl:px-20  max-sm:top-0   relative">
					<img
						src={Banner}
						alt=""
						className="object-cover pointer-events-none h-full w-full xl:rounded-b-2xl shadow-2xl"
					/>
					<div className="absolute inset-0 2xl:mx-20 lg:max-w-7xl mx-auto bg-gradient-to-b from-primary-500/50 via-primary-500/30 to-transparent"></div>
				</div>

				{mobile ? (
					/* Versão Mobile - Drawer */
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
											{hasFilters
												? "Pesquisa personalizada"
												: "Inicie sua busca"}
										</p>
										<p className="text-xs text-gray-500">
											{watchedValues.city || "Para onde? • Quando? • Quem?"}
										</p>
									</div>
									<Search className="mr-2" />
								</button>
							</DrawerTrigger>

							<DrawerContent className="   p-0">
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
													setDatePickerKey((prev) => prev + 1); // Adicione esta linha
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
				) : (
					/* Versão Desktop - Original */
					<div className="2xl:max-w-10/12 z-20 w-full max-w-5xl max-lg:max-w-4xl bg-white absolute flex flex-col justify-center -bottom-12 p-4 pl-8 px-4 shadow-xl rounded-2xl mt-4">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className=" flex items-center w-full justify-start">
								{/* Campo Cidade */}
								<div className="group__input relative pr-4 border-r flex w-full items-center ">
									<MapPin className="text-gray-400 size-5 flex-shrink-0" />
									<input
										ref={searchInputRef}
										id="city"
										type="text"
										placeholder="Para onde você vai?"
										className="ml-4 outline-none  w-full"
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
									<Users className="text-gray-400 size-5 flex-shrink-0" />
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
								<Button
									type="submit"
									variant="outline"
									disabled={isSearching}
									className="justify-center ml-4 !px-5 !py-5 font-normal border bg-primary-900 hover:bg-primary-800/90 cursor-pointer hover:text-white border-gray-200 h-full rounded-2xl text-white outline-primary-400 disabled:opacity-50"
								>
									{isSearching ? (
										<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
									) : (
										<Search className="h-5 w-5" />
									)}
								</Button>
							</div>
						</form>

						{/* Mensagem de erro - Aparece abaixo do formulário */}
						{Object.keys(errors).length > 0 && (
							<div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
								<div className="flex items-start gap-2">
									<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
									<div className="flex flex-col gap-1 text-sm text-red-600">
										{errors.city && <span>• {errors.city.message}</span>}
										{errors.checkin && <span>• {errors.checkin.message}</span>}
										{errors.checkout && (
											<span>• {errors.checkout.message}</span>
										)}
										{errors.guests && <span>• {errors.guests.message}</span>}
									</div>
								</div>
							</div>
						)}
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
						<div className="my-8 max-sm:my-4 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10 mx-auto  text-start w-full overflow-hidden">
							{/* Conteúdo */}
							<div className="text-center flex-col mx-8 max-sm:mx-3.5 flex gap-2 items-start max-sm:text-start justify-start transition-all">
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
						<div className="mx-auto mb-5 font-medium max-sm:flex-col max-sm:px-3.5 max-sm:gap-1 max-sm:text-lg! max-w-full text-gray-700 gap-2 w-full flex justify-start items-start px-8 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10 text-xl text-start ">
							<span>Mas não se preocupe!</span>{" "}
							<span className="max-sm:text-sm font-normal">
								Confira abaixo outras opções disponíveis.
							</span>
						</div>
					</>
				)
			) : (
				// Caso 1: sem pesquisa
				<span className="mx-auto text__section max-sm:text-lg max-sm:mb-2.5 max-sm:pt-0 font-medium max-w-full mb-5 w-full flex justify-start items-start px-8 max-sm:px-3.5 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10 text-2xl text-start pt-5">
					Acomodações disponíveis
				</span>
			)}
			{loading && (
				<div className="relative ">
					{mobile ? (
						<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-8 max-sm:px-3.5 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10">
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
						<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-8 max-sm:px-3.5 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10">
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
				<div className="grid mb-10 max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 mx-auto gap-8 px-8 max-sm:px-3.5 py-4 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10">
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
					<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-8 px-8 max-sm:px-3.5 2xl:max-w-full 2xl:px-20 xl:max-w-full xl:px-10">
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
