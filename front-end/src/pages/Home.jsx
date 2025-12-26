import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Item from "../components/Item";
import axios from "axios";
import { Eraser, MapPin, Search, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Banner from "../assets/banner2.jpg";

import "./Home.css";
import DatePickerAirbnb from "../components/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";

const Home = () => {
	const [city, setCity] = useState("");
	const [places, setPlaces] = useState([]);
	const [placesSearch, setPlacesSearch] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [loading, setLoading] = useState(true);

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
					(place) => place.guests >= formData.guests
				);
			}

			setTimeout(() => {
				setPlacesSearch(filteredResults);
				setIsSearching(false);
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
	};

	const handleDateSelect = ({ checkin: newCheckin, checkout: newCheckout }) => {
		setValue("checkin", newCheckin);
		setValue("checkout", newCheckout);
	};

	return (
		<>
			<div className="relative flex justify-center mb-12">
				<div className="banner__home  max-sm:hidden h-[50svh]   bg-primar-700  w-svw relative">
					<img
						src={Banner}
						alt=""
						className="object-cover pointer-events-none h-full w-full  shadow-2xl"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-primary-500/50 via-primary-500/30 to-transparent"></div>
				</div>
				<div className="container__bg__form z-20 w-full max-w-5xl bg-white absolute flex flex-col justify-center -bottom-12 p-4 pl-8 px-4 shadow-xl rounded-2xl mt-4">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className=" flex items-center w-full justify-start">
							{/* Campo Cidade */}
							<div className="group__input relative pr-4 border-r flex w-full items-center ">
								<MapPin className="text-gray-400 size-5 flex-shrink-0" />
								<input
									id="city"
									type="text"
									placeholder="Para onde você vai?"
									className="ml-4 outline-none !bg-white w-full"
									{...register("city")}
								/>
							</div>

							{/* Campo Datas */}
							<div className="w-90 h-fit text-nowrap border-r px-6">
								<Controller
									name="checkin"
									control={control}
									render={({ field }) => (
										<Controller
											name="checkout"
											control={control}
											render={({ field: checkoutField }) => (
												<DatePickerAirbnb
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
									<div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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
									{errors.checkout && <span>• {errors.checkout.message}</span>}
									{errors.guests && <span>• {errors.guests.message}</span>}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			{city ? (
				placesSearch.length > 0 ? (
					// Caso 3: pesquisou e encontrou
					<div className="mx-auto mb-5 text-primary-500  max-w-full gap-2 w-full flex justify-between items-center px-8 lg:max-w-7xl text-2xl text-start pt-5">
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
						<div className="my-8 max-w-7xl mx-auto text-start w-full overflow-hidden">
							{/* Conteúdo */}
							<div className="text-center flex-col mx-8 flex gap-2 items-start justify-start transition-all">
								<h1>
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
						<div className="mx-auto mb-5 font-medium max-w-full text-gray-700 gap-2 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start ">
							<strong>Mas não se preocupe!</strong> Confira abaixo outras opções
							disponíveis:
						</div>
					</>
				)
			) : (
				// Caso 1: sem pesquisa
				<span className="mx-auto text__section font-medium max-w-full mb-5 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start pt-5">
					Acomodações disponíveis
				</span>
			)}
			{loading && (
				<div className="relative ">
					<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8 px-8  lg:max-w-7xl">
						{[...Array(8)].map((_, index) => (
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
				</div>
			)}
			{/* GRID DE RESULTADOS */}
			{city && placesSearch.length > 0 && (
				<div className="grid mb-10 max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(225px,1fr))] mx-auto gap-8 px-8 py-4 lg:max-w-7xl">
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
					<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8 px-8  lg:max-w-7xl">
						{places.map((place) => (
							<Item {...{ place }} key={place._id} />
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default Home;
