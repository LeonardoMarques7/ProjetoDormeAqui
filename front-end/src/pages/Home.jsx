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
		<div className="">
			{/* ─── HERO: Grainient + texto centralizado ─── */}
			<div ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden">
				{/* Centered hero content */}
				<motion.div
					style={{ y: heroY }}
					className="relative z-10 h-full 2xl:mt-45 text-center px-6 my-auto mx-auto"
				>
					<div className="overflow-hidden">
						<motion.h1
							variants={clipRevealY}
							initial="hidden"
							animate="visible"
							custom={0}
							className="text-7xl max-md:text-5xl max-sm:text-4xl font-extrabold text-primary-900 leading-tight mb-6"
						>
							<img src={logoPrimary} className="max-w-2xl" alt="" />
						</motion.h1>
					</div>

					<div className="overflow-hidden">
						<motion.p
							variants={clipRevealY}
							initial="hidden"
							animate="visible"
							custom={1}
							className="text-gray-900 mb-10 text-xl max-sm:text-base leading-relaxed"
						>
							Encontre acomodações únicas em Sorocaba e em todo o Brasil.
							<br className="max-sm:hidden" />
							Reserve com segurança e descubra novos lugares.
						</motion.p>
					</div>

					{/* <motion.div
						initial={{ opacity: 0, y: 60 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="flex flex-col sm:flex-row gap-4 justify-center"
					>
						<Link
							to="/account/places"
							className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-primary-800 transition-all hover:scale-105"
						>
							Explorar acomodações
						</Link>
						<Link
							to="/account/places/new"
							className="border border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white/60 transition-all hover:scale-105 backdrop-blur-sm"
						>
							Anunciar acomodação
						</Link>
					</motion.div> */}
				</motion.div>

				{/* SEARCH MOBILE */}
				{mobile && (
					<div className="relative z-10 w-full px-3.5 mt-8">
						<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
							<DrawerTrigger asChild>
								<button
									className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl px-4 py-4 
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
									<Search />
								</button>
							</DrawerTrigger>

							<DrawerContent>
								<DrawerHeader>
									<DrawerTitle>Buscar acomodações</DrawerTitle>
								</DrawerHeader>

								<div className="p-6 space-y-6">
									<input
										type="text"
										placeholder="Cidade"
										className="w-full border p-3 rounded-xl"
										{...register("city")}
									/>

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
													/>
												)}
											/>
										)}
									/>

									<input
										type="number"
										placeholder="Hóspedes"
										className="w-full border p-3 rounded-xl"
										{...register("guests", { valueAsNumber: true })}
									/>

									<Button
										onClick={handleSubmit(onSubmit)}
										className="w-full bg-primary-800 text-white"
									>
										{isSearching ? "Buscando..." : "Buscar"}
									</Button>

									<button
										onClick={limparPesquisa}
										className="w-full bg-red-500 text-white rounded-xl p-3"
									>
										Limpar filtros
									</button>
								</div>
							</DrawerContent>
						</Drawer>
					</div>
				)}
			</div>

			{/* ─── FEATURED SECTION ─── */}
			<FeaturedSection />

			{/* ─── GRID DE PLACES ─── */}
			<section className="relative mb-16 px-4">
				{/* Section header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-10 max-w-2xl mx-auto"
				>
					<h2 className="text-4xl max-sm:text-2xl font-extrabold text-primary-900 mb-3">
						{city ? `Resultados para "${city}"` : "Todas as acomodações"}
					</h2>
					<p className="text-gray-500 text-lg">
						{city
							? `${placesSearch.length} acomodação${placesSearch.length !== 1 ? "ões" : ""} encontrada${placesSearch.length !== 1 ? "s" : ""}`
							: "Explore hospedagens únicas espalhadas pelo Brasil"}
					</p>
					{city && (
						<button
							onClick={limparPesquisa}
							className="mt-4 inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
						>
							<X size={14} />
							Limpar filtros
						</button>
					)}
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
						className="grid max-w-7xl mx-auto grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8"
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
