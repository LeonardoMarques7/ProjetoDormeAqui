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

import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import searchSchema from "@/components/schemas/searchSchema.jsx";
import { useMobileContext } from "../components/contexts/MobileContext";
import { useLocation } from "react-router";
import SearchBar from "../components/layout/SearchBar";
import Cards from "./Cards";
import IOSVideoPlayer from "./IOSVideoPlayer";

import imageTRansparent from "@/assets/iPhone-16.png";

const Home = () => {
	const location = useLocation();
	const { mobile } = useMobileContext();

	const [city, setCity] = useState("");
	const [placesSearch, setPlacesSearch] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [datePickerKey, setDatePickerKey] = useState(0);

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
			const { data: filteredResults } = await axios.get(
				`/places?${queryParams.toString()}`,
			);
			setPlacesSearch(filteredResults);
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

		reset({
			city: "",
			checkin: null,
			checkout: null,
			guests: null,
			rooms: null,
		});

		clearErrors();
		setDatePickerKey((prev) => prev + 1);

		// Recarregar todos os places
		fetchPlaces();
	};

	const handleSearch = (results, searchCity) => {
		setCity(searchCity);
		setPlacesSearch(results);
		setLoading(false);
	};

	return (
		<div>
			{" "}
			<motion.section
				ref={heroRef}
				className="relative h-screen max-sm:h-[70dvh] z-50 flex-col max-sm:rounded-b-4xl max-sm:px-2 flex rounded-bl-[50%] max-sm:rounded-bl-4xl justify-center items-center py-4 shadow-2xl"
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
						className="flex flex-col items-center max-sm:px-4  text-center justify-center gap-5 mb-10 max-sm:mb-0 mt-10 mx-auto"
					>
						<motion.img
							src={logoPrimary}
							style={{ scale: logoScale }}
							alt=""
							className="h-50 w-auto max-sm:object-contain"
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
					<motion.div className="mt-12 w-full max-w-4xl px-4 max-sm:mt-0 max-sm:mb-2">
						<SearchBar onSearch={handleSearch} />
					</motion.div>
				</div>

				<span className="inset-0 bg-black/20 rounded-bl-[50%] max-sm:rounded-b-4xl max-sm:rounded-bl-4xl h-full w-full absolute"></span>
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
					className="text-center mb-10 mt-10 flex items-center justify-center max-sm:px-4 gap-5  mx-auto"
				>
					<div className="flex flex-col items-center text-center justify-center">
						<span className="text-5xl  max-sm:text-2xl font-extrabold text-primary-900 mb-1">
							{city ? `Resultados para "${city}"` : "Todas as acomodações"}
						</span>
						<p className="text-gray-500">
							{city
								? `${placesSearch.length} acomodação${placesSearch.length !== 1 ? "ões" : ""} encontrada${placesSearch.length !== 1 ? "s" : ""}`
								: "Explore hospedagens únicas espalhadas pelo Brasil"}
						</p>
						{city && (
							<button
								onClick={limparPesquisa}
								className="mt-4 underline cursor-pointer inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
							>
								Limpar filtros
							</button>
						)}
					</div>
				</motion.div>

				{loading && (
					<div className="grid max-w-7xl mx-auto gap-8 grid-cols-[repeat(auto-fit,minmax(225px,1fr))]">
						{[...Array(12)].map((_, i) => (
							<Skeleton key={i} className="aspect-square rounded-2xl" />
						))}
					</div>
				)}

				{!loading && (
					<motion.div
						className="grid max-w-7xl mx-auto justify-center grid-cols-[repeat(auto-fit,minmax(225px,250px))] max-sm:grid-cols-2 max-sm:gap-2 gap-8 "
						variants={staggerContainer(0.06)}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						{(city ? placesSearch : placesSearch).map((place) => (
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
