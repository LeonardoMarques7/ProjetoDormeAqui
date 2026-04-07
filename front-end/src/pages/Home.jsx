import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { clipRevealY, staggerContainer, staggerItem } from "@/lib/animations";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Item from "@/components/places/Item";
import ScrollCarousel from "@/components/common/ScrollCarousel";
import FeaturedSection from "@/components/common/FeaturedSection";
import Grainient from "@/components/Grainient";
import axios from "axios";
import {
	filterAccommodations,
	fetchBookingsForAccommodations,
} from "@/lib/searchFilters";

import logoPrimary from "@/assets/logo__secondary.png";
import { Link } from "react-router-dom";
import {
	Eraser,
	MapPin,
	Search,
	Users,
	AlertCircle,
	X,
	Trash,
	ScrollIcon,
	SearchX,
	DoorOpen,
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

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import { useMobileContext } from "../components/contexts/MobileContext";
import { useLocation } from "react-router";
import SearchBar from "../components/layout/SearchBar";
import Cards from "./Cards";
import IOSVideoPlayer from "./IOSVideoPlayer";

import imageTRansparent from "@/assets/iPhone-16.png";
import {
	CalendarDateRangeIcon,
	MapIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
	const location = useLocation();
	const { mobile } = useMobileContext();

	const [city, setCity] = useState("");
	const [placesSearch, setPlacesSearch] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [datePickerKey, setDatePickerKey] = useState(0);
	const [currentFilters, setCurrentFilters] = useState(null);
	const [alternativeAccommodations, setAlternativeAccommodations] = useState(
		[],
	);

	const {
		register,
		handleSubmit,
		control,
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
			rooms: null,
			minRating: null,
		},
	});

	const fetchPlaces = async () => {
		try {
			const { data } = await axios.get("/places");
			setPlacesSearch(data);
			setLoading(false);
		} catch (error) {
			console.error("Erro ao carregar acomodações:", error);
			setLoading(false);
		}
	};

	const getAlternativeAccommodations = async () => {
		try {
			const { data } = await axios.get("/places?limit=8");
			return data.slice(0, 8);
		} catch (error) {
			console.error("Erro ao carregar acomodações alternativas:", error);
			return [];
		}
	};

	useEffect(() => {
		fetchPlaces();
	}, []);

	useEffect(() => {
		if (location.state?.searchResults) {
			setCity(location.state.searchCity || "");
			setPlacesSearch(location.state.searchResults);
			setLoading(false);
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	const onSubmit = async (formData) => {
		setIsSearching(true);
		setCity(formData.city || "");

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
			const { data: apiResults } = await axios.get(
				`/places?${queryParams.toString()}`,
			);

			console.log(
				"🔎 [Home] Resultados do backend:",
				apiResults.length,
				"acomodações",
			);

			// Enriquecer com dados de bookings apenas se tiver datas
			let enrichedResults = apiResults;
			if (formData.checkin && formData.checkout) {
				console.log("📦 [Home] Enriquecendo com bookings...");
				enrichedResults = await fetchBookingsForAccommodations(
					apiResults,
					axios,
				);
				console.log("✅ [Home] Enriquecimento concluído");
			} else {
				console.log("ℹ️ [Home] Sem datas, pulando enriquecimento");
			}

			// Aplicar filtros adicionais localmente (validação de datas)
			console.log("🔧 [Home] Aplicando filtros locais...");
			const filteredResults = filterAccommodations(enrichedResults, {
				city: formData.city || "",
				guests: formData.guests,
				rooms: formData.rooms,
				checkIn: formData.checkin,
				checkOut: formData.checkout,
			});

			console.log(
				"📊 [Home] Resultado final:",
				filteredResults.length,
				"acomodações",
			);

			// Se não encontrou resultados, carregar alternativas
			if (filteredResults.length === 0 && formData.city) {
				const alternatives = await getAlternativeAccommodations();
				setAlternativeAccommodations(alternatives);
			} else {
				setAlternativeAccommodations([]);
			}

			setPlacesSearch(filteredResults);
			setCurrentFilters({
				city: formData.city,
				guests: formData.guests,
				rooms: formData.rooms,
				checkIn: formData.checkin,
				checkOut: formData.checkout,
				minRating: formData.minRating,
			});

			setLoading(false);
		} catch (error) {
			console.error("Erro na busca:", error);
			setLoading(false);
		} finally {
			setIsSearching(false);
			setDrawerOpen(false);
		}
	};

	const heroRef = useRef(null);
	const { scrollY } = useScroll();

	// Parallax transforms para diferentes elementos
	const logoY = useTransform(scrollY, [0, 400], [0, 120]);
	const logoScale = useTransform(scrollY, [0, 200], [1, 0.5]); // 100% → 50%
	const textY = useTransform(scrollY, [0, 400], [0, 80]);
	const searchBarY = useTransform(scrollY, [0, 300], [0, -100]);
	const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
	const textScale = useTransform(scrollY, [0, 300], [1, 0.9]);

	const limparPesquisa = (e) => {
		e.preventDefault();
		setCity("");
		setPlacesSearch([]);
		setCurrentFilters(null);
		setAlternativeAccommodations([]);

		reset({
			city: "",
			checkin: null,
			checkout: null,
			guests: null,
			rooms: null,
			minRating: null,
		});

		clearErrors();
		setDatePickerKey((prev) => prev + 1);

		// Resetar inputs do SearchBar
		if (searchBarRef.current?.resetForm) {
			searchBarRef.current.resetForm();
		}

		// Recarregar todos os places
		fetchPlaces();
	};

	const hasActiveSearch = () => {
		return (
			currentFilters &&
			(currentFilters?.city ||
				currentFilters?.guests ||
				currentFilters?.rooms ||
				currentFilters?.minRating ||
				currentFilters?.checkIn ||
				currentFilters?.checkOut)
		);
	};

	const removerFiltro = async (filterKey) => {
		// Criar novo objeto de filtros sem o filtro removido
		const novosFiltros = { ...currentFilters };

		if (filterKey === "dates") {
			novosFiltros.checkIn = null;
			novosFiltros.checkOut = null;
		} else {
			novosFiltros[filterKey] = null;
		}

		// Atualizar estado IMEDIATAMENTE (para UI dos badges)
		setCurrentFilters(novosFiltros);

		// Sincronizar SearchBar
		if (filterKey === "dates") {
			searchBarRef.current?.clearField("checkin");
		} else {
			searchBarRef.current?.clearField(filterKey);
		}

		// Verificar se ainda tem filtros ativos
		const temFiltros = Object.values(novosFiltros).some((v) => v !== null);

		// Se removeu o último filtro, limpar tudo
		if (!temFiltros) {
			limparPesquisa({ preventDefault: () => {} });
			return;
		}

		// Reexecutar busca com filtros atualizados
		// Converter para formato esperado por onSubmit
		const formDataAtualizado = {
			city: novosFiltros.city || "",
			checkin: novosFiltros.checkIn, // O onSubmit espera "checkin" em minúsculas
			checkout: novosFiltros.checkOut, // O onSubmit espera "checkout" em minúsculas
			guests: novosFiltros.guests,
			rooms: novosFiltros.rooms,
			minRating: novosFiltros.minRating,
		};

		await onSubmit(formDataAtualizado);
	};

	const formatarData = (data) => {
		if (!data) return "";
		return new Date(data).toLocaleDateString("pt-BR", {
			month: "2-digit",
			day: "2-digit",
		});
	};

	const getBadges = () => {
		const badges = [];

		if (currentFilters?.city) {
			badges.push({
				id: "city",
				type: "city",
				label: currentFilters.city,
				icon: <MapPin className="w-5 h-5" />,
				bgColor: "bg-blue-50",
				borderColor: "border-blue-200",
				textColor: "text-blue-700",
				hoverBg: "hover:bg-blue-100",
			});
		}

		if (currentFilters?.checkIn || currentFilters?.checkOut) {
			badges.push({
				id: "dates",
				type: "dates",
				label: `${formatarData(currentFilters.checkIn)} - ${formatarData(
					currentFilters.checkOut,
				)}`,
				icon: <CalendarDateRangeIcon className="w-5 h-5" />,
				bgColor: "bg-purple-50",
				borderColor: "border-purple-200",
				textColor: "text-purple-700",
				hoverBg: "hover:bg-purple-100",
				onRemove: () => {
					removerFiltro("dates");
				},
			});
		}

		if (currentFilters?.guests) {
			badges.push({
				id: "guests",
				type: "guests",
				label: `${currentFilters.guests} ${
					currentFilters.guests === 1 ? "Hóspede" : "Hóspedes"
				}`,
				icon: <UsersIcon className="w-5 h-5" />,
				bgColor: "bg-orange-50",
				borderColor: "border-orange-200",
				textColor: "text-orange-700",
				hoverBg: "hover:bg-orange-100",
				isGuests: true,
			});
		}

		if (currentFilters?.rooms) {
			badges.push({
				id: "rooms",
				type: "rooms",
				label: `${currentFilters.rooms} ${
					currentFilters.rooms === 1 ? "quarto" : "quartos"
				}`,
				icon: "🏠",
				bgColor: "bg-green-50",
				borderColor: "border-green-200",
				textColor: "text-green-700",
				hoverBg: "hover:bg-green-100",
			});
		}

		if (currentFilters?.minRating) {
			badges.push({
				id: "rating",
				type: "rating",
				label: `Mínimo ${currentFilters.minRating}`,
				icon: "⭐",
				bgColor: "bg-yellow-50",
				borderColor: "border-yellow-200",
				textColor: "text-yellow-700",
				hoverBg: "hover:bg-yellow-100",
			});
		}

		return badges;
	};

	const badges = getBadges();

	const searchBarRef = useRef(null);

	const handleSearch = ({
		results,
		city,
		guests,
		rooms,
		checkIn,
		checkOut,
		minRating,
	}) => {
		setCity(city);
		setPlacesSearch(results);
		setCurrentFilters({
			city,
			guests,
			rooms,
			checkIn,
			checkOut,
			minRating,
		});
		setLoading(false);
	};

	return (
		<div>
			{" "}
			<motion.section
				ref={heroRef}
				className="relative h-screen max-sm:h-[70dvh] z-50 flex-col max-sm:rounded-b-none max-sm:px-2 flex  min-lg:rounded-bl-[50%] min-md:rounded-b-4xl justify-center items-center py-4 shadow-2xl"
				style={{
					perspective: 1000,
					backgroundImage: `url("https://framerusercontent.com/images/MdceQMLsNQ9bPL66TbIzc7gU8Q.png?scale-down-to=2048&width=3020&height=1609")`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				{/* Conteúdo com parallax */}
				<div className="relative z-20 w-full  h-full flex flex-col justify-center items-center">
					{/* Logo com parallax */}
					<motion.div
						style={{ y: logoY }}
						className="flex flex-col items-center max-sm:px-4 md:px-8 text-center justify-center gap-5 mb-10 max-sm:mb-0 mt-10 mx-auto"
					>
						<motion.img
							src={logoPrimary}
							style={{ scale: logoScale }}
							alt=""
							className="h-50 w-auto object-contain"
						/>
					</motion.div>

					{/* Texto principal com parallax e fade */}
					<motion.span
						style={{
							y: textY,
							opacity: textOpacity,
							scale: textScale,
						}}
						className="text-xl max-w-xl max-sm:hidden max-sm:px-4  max-sm:text-xl text-white mb-1 text-center font-light"
					>
						Encontre acomodações únicas em Sorocaba e em todo o Brasil. Reserve
						com segurança e descubra novos lugares.
					</motion.span>

					{/* SearchBar com parallax subindo */}
					<motion.div className="mt-12 w-full lg:max-w-4xl md:max-w-fit md:mx-auto px-4 max-sm:mt-0 max-sm:mb-2">
						<SearchBar ref={searchBarRef} onSearch={handleSearch} />
					</motion.div>
				</div>

				<span className="inset-0 bg-black/20 lg:rounded-bl-[50%] max-sm:rounded-b-none min-md:rounded-b-4xl max-sm:rounded-bl-4xl h-full w-full absolute"></span>
				{/* Overlay de sombra */}
			</motion.section>
			{/* ─── GRID DE PLACES ─── */}
			<section className="relative mx-auto mb-16 px-4">
				{/* Section header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-7xl  mb-10 mt-10 max-md:mt-5 flex flex-col items-center justify-center max-md:justify-start max-sm:px-0 gap-4  mx-auto"
				>
					<div className="flex items-center text-center w-full max-md:justify-start justify-center">
						<span className="text-5xl  max-sm:text-2xl max-md:font-medium  font-extrabold text-primary-900">
							{hasActiveSearch() ? (
								<>
									Resultados da pesquisa <small>({placesSearch.length})</small>
								</>
							) : (
								"Todas as acomodações"
							)}
						</span>
					</div>

					{/* Badges de filtros aplicados - APENAS DESKTOP */}
					{hasActiveSearch() && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-nowrap gap-2 w-fit max-md:w-full max-md:flex-wrap max-md:grid-cols-2  max-md:justify-start justify-center items-center"
						>
							{badges.map((badge) => (
								<div
									key={badge.id}
									className={`inline-flex items-center gap-2  pl-4 pr-3 py-2 justify-start	rounded-full text-sm ${mobile && "!text-primary-900 !bg-primary-100 !border-primary-300"}`}
								>
									{badge.isGuests ? (
										<div className="flex items-center gap-2">
											{!mobile && badge.icon}
											{badge.label}
										</div>
									) : (
										<>
											{!mobile &&
												(typeof badge.icon === "string" ? (
													<span>{badge.icon}</span>
												) : (
													badge.icon
												))}
											{badge.label}
										</>
									)}

									<button
										className={`hover:bg-red-500 hover:text-red-100 rounded-full ml-2 p-1 cursor-pointer transition-all`}
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											if (badge.onRemove) {
												badge.onRemove();
											} else {
												removerFiltro(badge.type);
											}
										}}
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}

							{!mobile && (
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											onClick={limparPesquisa}
											title="Limpar todos os Filtros"
											className="inline-flex items-center gap-2 p-2 justify-start border-red-400 border text-red-500  bg-red-100 hover:bg-red-200 transition-all cursor-pointer rounded-full"
										>
											<X className="w-4 h-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent className="bg-red-500" align="center">
										<p>Limpar todos os Filtros</p>
									</TooltipContent>
								</Tooltip>
							)}
						</motion.div>
					)}

					{/* Info de resultados */}
					{hasActiveSearch() &&
						!loading &&
						placesSearch.length > 0 &&
						!mobile && (
							<p className="text-gray-500 text-sm flex items-center border border-green-200 rounded-full w-fit px-3 py-1">
								<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block mr-2"></div>
								{placesSearch.length} acomodaç
								{placesSearch.length !== 1 ? "ões" : "ão"} encontrada
								{placesSearch.length !== 1 ? "s" : ""}
							</p>
						)}

					{!hasActiveSearch() && !mobile && (
						<p className="text-gray-500 text-sm flex items-center border border-green-200 rounded-full w-fit px-3 py-1 mt-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block mr-2"></div>
							Explore hospedagens únicas espalhadas pelo Brasil
						</p>
					)}
				</motion.div>

				{loading && (
					<div className="grid max-w-7xl mx-auto gap-8 grid-cols-[repeat(auto-fit,minmax(225px,1fr))]">
						{[...Array(12)].map((_, i) => (
							<Skeleton key={i} className="aspect-square rounded-2xl" />
						))}
					</div>
				)}

				{!loading && placesSearch.length === 0 && hasActiveSearch() && (
					<div className="max-w-7xl mx-auto">
						{/* Mensagem de nenhum resultado */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="text-center mb-16 py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200"
						>
							<div className="flex justify-center mb-4">
								<SearchX className="w-12 h-12 text-gray-400" />
							</div>
							<h3 className="text-xl font-semibold text-gray-700 mb-2">
								Nenhuma acomodação encontrada
							</h3>
							<p className="text-gray-500 text-sm max-w-md mx-auto">
								Infelizmente não encontramos acomodações que correspondem aos
								seus critérios. Confira algumas outras opções abaixo ou tente
								ajustar seus filtros.
							</p>
						</motion.div>

						{/* Acomodações alternativas */}
						{alternativeAccommodations.length > 0 && (
							<div className="mt-12">
								<h3 className="text-2xl font-bold text-primary-900 mb-6 text-center">
									Outras opções que você pode gostar
								</h3>
								<motion.div
									className="grid max-w-7xl mx-auto justify-center grid-cols-[repeat(auto-fit,minmax(225px,250px))]  max-sm:grid-cols-2 max-sm:gap-2 gap-8"
									variants={staggerContainer(0.06)}
									initial="hidden"
									whileInView="visible"
									viewport={{ once: true }}
								>
									{alternativeAccommodations.map((place) => (
										<motion.div key={place._id} variants={staggerItem}>
											<Item place={place} />
										</motion.div>
									))}
								</motion.div>
							</div>
						)}
					</div>
				)}

				{!loading && placesSearch.length > 0 && (
					<motion.div
						className="grid max-w-7xl mx-auto justify-center grid-cols-[repeat(auto-fit,minmax(225px,250px))] min-md:grid-cols-[repeat(auto-fit,minmax(225px,225px))] max-sm:grid-cols-2 max-sm:gap-2 gap-8 "
						variants={staggerContainer(0.06)}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						{placesSearch.map((place) => (
							<motion.div key={place._id} variants={staggerItem}>
								<Item place={place} />
							</motion.div>
						))}
					</motion.div>
				)}
			</section>
		</div>
	);
};

export default Home;
