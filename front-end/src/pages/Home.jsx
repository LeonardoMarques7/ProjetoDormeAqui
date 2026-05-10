import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Item from "@/components/places/Item";
import axios from "axios";

import logoPrimary from "@/assets/logo__secondary.png";
import { MapPin, X, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMobileContext } from "../components/contexts/MobileContext";
import { useLocation } from "react-router";
import SearchBar from "../components/layout/SearchBar";
import { CalendarDateRangeIcon, UsersIcon } from "@heroicons/react/24/outline";

const Home = () => {
	const location = useLocation();
	const { mobile } = useMobileContext();
	const searchBarRef = useRef(null);
	const heroRef = useRef(null);
	const resultsRef = useRef(null);
	const { scrollY } = useScroll();

	const [city, setCity] = useState("");
	const [placesSearch, setPlacesSearch] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentFilters, setCurrentFilters] = useState(null);
	const [alternativeAccommodations, setAlternativeAccommodations] = useState([]);

	const scrollToResults = () => {
		window.requestAnimationFrame(() => {
			resultsRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	};

	const fetchPlaces = async (filters = null) => {
		try {
			const queryParams = new URLSearchParams();
			if (filters?.city) queryParams.append("city", filters.city);
			if (filters?.guests) queryParams.append("guests", filters.guests);
			if (filters?.rooms) queryParams.append("rooms", filters.rooms);
			if (filters?.minRating) queryParams.append("minRating", filters.minRating);
			if (filters?.checkIn) queryParams.append("checkin", filters.checkIn);
			if (filters?.checkOut) queryParams.append("checkout", filters.checkOut);

			const query = queryParams.toString();
			const { data } = await axios.get(query ? `/places?${query}` : "/places");
			setPlacesSearch(data);
			return data;
		} catch (error) {
			console.error("Erro ao carregar acomodações:", error);
			return [];
		} finally {
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
			setCurrentFilters(location.state.searchFilters || null);
			setLoading(false);
			window.history.replaceState({}, document.title);
			scrollToResults();
		}
	}, [location.state]);

	const logoY = useTransform(scrollY, [0, 400], [0, 120]);
	const logoScale = useTransform(scrollY, [0, 200], [1, 0.5]);
	const textY = useTransform(scrollY, [0, 400], [0, 80]);
	const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
	const textScale = useTransform(scrollY, [0, 300], [1, 0.9]);

	const limparPesquisa = async (e) => {
		e.preventDefault();
		setCity("");
		setCurrentFilters(null);
		setAlternativeAccommodations([]);
		searchBarRef.current?.resetForm();
		setLoading(true);
		await fetchPlaces();
		scrollToResults();
	};

	const hasActiveSearch = () =>
		Boolean(
			currentFilters &&
				(currentFilters.city ||
					currentFilters.guests ||
					currentFilters.rooms ||
					currentFilters.minRating ||
					currentFilters.checkIn ||
					currentFilters.checkOut),
		);

	const removerFiltro = async (filterKey) => {
		const novosFiltros = { ...(currentFilters || {}) };

		if (filterKey === "dates") {
			novosFiltros.checkIn = null;
			novosFiltros.checkOut = null;
			searchBarRef.current?.clearField("checkin");
		} else {
			novosFiltros[filterKey] = null;
			searchBarRef.current?.clearField(filterKey);
		}

		setCurrentFilters(novosFiltros);

		const temFiltros = Object.values(novosFiltros).some(Boolean);
		if (!temFiltros) {
			await limparPesquisa({ preventDefault: () => {} });
			return;
		}

		setLoading(true);
		const results = await fetchPlaces(novosFiltros);
		setCity(novosFiltros.city || "");

		if (results.length === 0 && novosFiltros.city) {
			const alternatives = await getAlternativeAccommodations();
			setAlternativeAccommodations(alternatives);
		} else {
			setAlternativeAccommodations([]);
		}

		scrollToResults();
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
				onRemove: () => removerFiltro("dates"),
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
			});
		}

		if (currentFilters?.minRating) {
			badges.push({
				id: "minRating",
				type: "minRating",
				label: `Mínimo ${currentFilters.minRating}`,
				icon: "⭐",
			});
		}

		return badges;
	};

	const badges = getBadges();

	const handleSearch = async ({
		results,
		city: nextCity,
		guests,
		rooms,
		checkIn,
		checkOut,
		minRating,
	}) => {
		setCity(nextCity);
		setPlacesSearch(results);
		setCurrentFilters({
			city: nextCity,
			guests,
			rooms,
			checkIn,
			checkOut,
			minRating,
		});
		setLoading(false);

		if (results.length === 0 && nextCity) {
			const alternatives = await getAlternativeAccommodations();
			setAlternativeAccommodations(alternatives);
		} else {
			setAlternativeAccommodations([]);
		}

		scrollToResults();
	};

	return (
		<div>
			<motion.section
				ref={heroRef}
				className="relative h-screen max-sm:h-[70dvh] z-50 flex-col max-sm:rounded-b-none max-sm:px-2 flex min-lg:rounded-bl-[50%] min-md:rounded-b-4xl justify-center items-center py-4 shadow-2xl"
				style={{
					perspective: 1000,
					backgroundImage:
						'url("https://framerusercontent.com/images/MdceQMLsNQ9bPL66TbIzc7gU8Q.png?scale-down-to=2048&width=3020&height=1609")',
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="relative z-20 w-full h-full flex flex-col justify-center items-center">
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

					<motion.span
						style={{ y: textY, opacity: textOpacity, scale: textScale }}
						className="text-xl max-w-xl max-sm:hidden max-sm:px-4 max-sm:text-xl text-white mb-1 text-center font-light"
					>
						Encontre acomodações únicas em Sorocaba e em todo o Brasil. Reserve
						com segurança e descubra novos lugares.
					</motion.span>

					<motion.div className="mt-12 w-full lg:max-w-4xl md:max-w-fit md:mx-auto px-4 max-sm:mt-0 max-sm:mb-2">
						<SearchBar ref={searchBarRef} onSearch={handleSearch} />
					</motion.div>
				</div>

				<span className="inset-0 bg-black/20 lg:rounded-bl-[50%] max-sm:rounded-b-none min-md:rounded-b-4xl max-sm:rounded-bl-4xl h-full w-full absolute"></span>
			</motion.section>

			<section ref={resultsRef} className="relative mx-auto mb-16 px-4">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className={`text-center max-w-7xl mb-10 mt-10 max-md:mt-5 flex flex-col items-center justify-center max-md:justify-start max-sm:px-0 gap-4 mx-auto ${
						hasActiveSearch()
							? "rounded-[2rem] border border-slate-200/80 bg-white/85 px-6 py-8 shadow-[0_20px_60px_rgba(15,23,43,0.06)] backdrop-blur-sm"
							: ""
					}`}
				>
					<div className="flex items-center text-center w-full max-md:justify-start justify-center">
						<span className="text-5xl max-sm:text-2xl max-md:font-medium font-extrabold text-primary-900">
							{hasActiveSearch() ? (
								<>
									Resultados da pesquisa <small>({placesSearch.length})</small>
								</>
							) : (
								"Todas as acomodações"
							)}
						</span>
					</div>

					{hasActiveSearch() && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-nowrap gap-2 w-fit max-md:w-full max-md:flex-wrap max-md:grid-cols-2 max-md:justify-start justify-center items-center"
						>
							{badges.map((badge) => (
								<div
									key={badge.id}
									className={`inline-flex items-center gap-2 pl-4 pr-3 py-2 justify-start rounded-full text-sm ${mobile && "!text-primary-900 !bg-primary-100 !border-primary-300"}`}
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
										className="hover:bg-red-500 hover:text-red-100 rounded-full ml-2 p-1 cursor-pointer transition-all"
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

						</motion.div>
					)}

					{hasActiveSearch() && !loading && placesSearch.length > 0 && !mobile && (
						<p className="text-gray-500 text-sm flex items-center border border-green-200 rounded-full w-fit px-3 py-1">
							<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block mr-2"></span>
							{placesSearch.length === 1
								? "1 acomodação encontrada"
								: `${placesSearch.length} acomodações encontradas`}
						</p>
					)}

					{!hasActiveSearch() && !mobile && (
						<p className="text-gray-500 text-sm flex items-center border border-green-200 rounded-full w-fit px-3 py-1 mt-2">
							<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block mr-2"></span>
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
					<div className="max-w-6xl mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="text-center mb-10 py-14 px-6 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] rounded-[2rem] border border-slate-200 shadow-[0_24px_60px_rgba(15,23,43,0.08)]"
						>
							<div className="flex justify-center mb-5">
								<div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-8 ring-white shadow-sm">
									<SearchX className="w-10 h-10 text-slate-400" />
								</div>
							</div>
							<h3 className="text-2xl font-semibold text-slate-800 mb-3">
								Nenhuma acomodação encontrada
							</h3>
							<p className="text-slate-500 text-sm max-w-lg mx-auto leading-7">
								Infelizmente não encontramos acomodações que correspondem aos
								seus critérios. Confira algumas outras opções abaixo ou tente
								ajustar seus filtros.
							</p>
							<div className="mt-6 flex justify-center">
								<button
									type="button"
									onClick={limparPesquisa}
									className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_32px_rgba(15,23,43,0.18)] transition-all hover:-translate-y-0.5 hover:bg-primary-800"
								>
									<X className="h-4 w-4" />
									Limpar filtros e recomeçar
								</button>
							</div>
						</motion.div>

						{alternativeAccommodations.length > 0 && (
							<div className="mt-12">
								<h3 className="text-2xl font-bold text-primary-900 mb-6 text-center">
									Outras opções que você pode gostar
								</h3>
								<motion.div
									className="grid max-w-7xl mx-auto justify-center grid-cols-[repeat(auto-fit,minmax(225px,250px))] max-sm:grid-cols-2 max-sm:gap-2 gap-8"
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
					<div className="max-w-6xl mx-auto rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 sm:p-6 shadow-[0_24px_60px_rgba(15,23,43,0.08)]">
						<div className="mb-6 flex flex-col gap-2 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
							<div className="text-left">
								<p className="text-sm font-medium uppercase tracking-[0.22em] text-primary-500">
									Lista de acomodações
								</p>
								<p className="text-slate-500">
									{placesSearch.length === 1
										? "Encontramos uma opção compatível com sua busca."
										: `Encontramos ${placesSearch.length} opções compatíveis com sua busca.`}
								</p>
							</div>
							<p className="text-sm text-slate-400 text-left sm:text-right">
								Refine os filtros para ajustar destino, datas e capacidade.
							</p>
						</div>

						<motion.div
							className="grid justify-start gap-6 grid-cols-[repeat(auto-fit,minmax(225px,250px))] max-sm:grid-cols-2 max-sm:gap-3"
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
					</div>
				)}
			</section>
		</div>
	);
};

export default Home;
