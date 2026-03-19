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

import logoPrimary from "@/assets/logo__primary.png";
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
	const [places, setPlaces] = useState([]);
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
		},
	});

	const fetchPlaces = async () => {
		try {
			const { data } = await axios.get("/places");
			setPlaces(data);
			setLoading(false);
		} catch (error) {
			console.error("Erro ao carregar acomodações:", error);
		}
	};

	useEffect(() => {
		fetchPlaces();
	}, []);

	useEffect(() => {
		if (location.state?.searchResults) {
			setCity(location.state.searchCity || "");
			setPlacesSearch(location.state.searchResults);
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

		setPlacesSearch(filteredResults);
		setIsSearching(false);
		setDrawerOpen(false);
	};

	const heroRef = useRef(null);
	const { scrollY } = useScroll();
	const heroY = useTransform(scrollY, [0, 500], [0, -80]);

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
		setDatePickerKey((prev) => prev + 1);
	};

	return (
		<div>
			{" "}
			<img
				src="https://framerusercontent.com/images/MdceQMLsNQ9bPL66TbIzc7gU8Q.png?scale-down-to=2048&width=3020&height=1609"
				alt=""
			/>
			{/* ─── GRID DE PLACES ─── */}
			<section className="relative mb-16 px-4">
				{/* Section header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-start mb-10 mt-5 flex  items-center justify-center gap-5  mx-auto"
				>
					<div className="flex flex-col items-start justify-start">
						<h2 className="text-4xl  max-sm:text-2xl font-extrabold text-primary-900 mb-1">
							{city ? `Resultados para "${city}"` : "Todas as acomodações"}
						</h2>
						<p className="text-gray-500 text-sm">
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
					<span className="w-1 h-10 bg-gray-100 rounded-2xl"></span>
					{!mobile && <SearchBar />}
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
						className="grid max-w-7xl mx-auto grid-cols-[repeat(auto-fit,minmax(225px,250px))] max-sm:grid-cols-[repeat(auto-fit,minmax(180px,0.5fr))] max-sm:gap-2 gap-8"
						variants={staggerContainer(0.06)}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						{(city ? placesSearch : places).map((place) => (
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
