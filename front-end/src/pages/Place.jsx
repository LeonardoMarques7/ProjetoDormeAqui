import axios from "axios";
import {
	Bath,
	Bed,
	CalendarX,
	ChevronRight,
	Clock,
	Expand,
	Filter,
	Home,
	HomeIcon,
	MapPin,
	Minus,
	Plus,
	ScrollText,
	ShieldHalf,
	Star,
	Users2,
} from "lucide-react";
import { Select } from "@mantine/core";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";
import { useUserContext } from "../components/contexts/UserContext";
import { useMessage } from "../components/contexts/MessageContext";
import Perk from "@/components/common/Perk";
import "./Place.css";
import { addDays } from "date-fns";
import { useMobileContext } from "../components/contexts/MobileContext";
import MarkdownIt from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import Counter from "@/components/common/Counter";
import photoDefaultLoading from "../assets/loadingGif2.gif";
import photoDefault from "../assets/photoDefault.jpg";

import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import NotFound from "./NotFound";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Place = () => {
	const { mobile } = useMobileContext();
	const { id } = useParams();
	const { user } = useUserContext();
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);

	const lightGalleryRef = useRef(null);
	const datePickerRef = useRef(null);
	const [redirect, setRedirect] = useState(false);
	const [experienceTime, setExperienceTime] = useState("");
	const today = new Date();
	const fiveDaysAfter = addDays(today, 5);
	const [checkin, setCheckin] = useState(today);
	const [checkout, setCheckout] = useState(fiveDaysAfter);
	const [guests, setGuests] = useState(1);
	const [owner, setOwner] = useState("");
	const [placeHeader, setPlaceHeader] = useState("");
	const [limiteGuests, setLimiteGuests] = useState("");
	const [date, setDate] = useState({
		from: new Date(),
		to: addDays(new Date(), 7),
	});
	const [booking, setBooking] = useState(null);
	const [bookingsPlace, setBookingsPlace] = useState(null);
	const [loading, setLoading] = useState(false);
	const { showAuthModal } = useAuthModalContext();
	const [resetDates, setResetDates] = useState(false);
	const [reviews, setReviews] = useState([]);
	const [placeNotFound, setPlaceNotFound] = useState(false);
	const [refundPolicy, setRefundPolicy] = useState(null);
	const [sortBy, setSortBy] = useState("recent");
	const [ratingFilter, setRatingFilter] = useState("all");
	const [commentFilter, setCommentFilter] = useState("all");
	const [sheetRating, setSheetRating] = useState(0);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [sortByTemp, setSortByTemp] = useState("recent");
	const [tempRating, setTempRating] = useState(0);
	const [tempHoverRating, setTempHoverRating] = useState(0);
	const [tempCommentFilter, setTempCommentFilter] = useState("all");
	const [showFixedBar, setShowFixedBar] = useState(false);
	const formRef = useRef(null);

	const filteredReviews = useMemo(() => {
		let filtered = [...reviews];

		// Filter by rating
		if (ratingFilter !== "all") {
			filtered = filtered.filter(
				(review) => review.rating === parseInt(ratingFilter),
			);
		}

		// Filter by comment presence
		if (commentFilter === "with") {
			filtered = filtered.filter(
				(review) => review.comment && review.comment.trim() !== "",
			);
		} else if (commentFilter === "without") {
			filtered = filtered.filter(
				(review) => !review.comment || review.comment.trim() === "",
			);
		}

		// Sort by date
		filtered.sort((a, b) => {
			const dateA = new Date(a.createdAt || 0);
			const dateB = new Date(b.createdAt || 0);
			return sortBy === "recent" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [reviews, sortBy, ratingFilter, commentFilter]);

	const formatDate = (date, format = "dd/MM/yyyy") => {
		// Validação: converte string para Date ou retorna vazio se inválido
		if (!date) return "";

		const dateObj = date instanceof Date ? date : new Date(date);

		// Verifica se a data é válida
		if (isNaN(dateObj.getTime())) return "";

		const day = String(dateObj.getDate()).padStart(2, "0");
		const month = String(dateObj.getMonth() + 1).padStart(2, "0");
		const year = dateObj.getFullYear();
		const monthNames = [
			"Jan",
			"Fev",
			"Mar",
			"Abr",
			"Mai",
			"Jun",
			"Jul",
			"Ago",
			"Set",
			"Out",
			"Nov",
			"Dez",
		];

		if (format === "dd de MMM")
			return `${day} de ${monthNames[dateObj.getMonth()]}`;
		return `${day}/${month}/${year}`;
	};

	const numberOfDays = (date1, date2) => {
		const date1GMT = date1 + "GMT-03:00";
		const date2GMT = date2 + "GMT-03:00";

		const dateCheckin = new Date(date1GMT);
		const dateCheckout = new Date(date2GMT);

		return (
			(dateCheckout.getTime() - dateCheckin.getTime()) / (1000 * 60 * 60 * 24)
		);
	};

	const nights = useMemo(() => {
		if (checkin && checkout) {
			return numberOfDays(checkin, checkout);
		}
		return 0;
	}, [checkin, checkout]);

	const totalPrice = useMemo(() => {
		return place ? place.price * nights : 0;
	}, [place, nights]);

	const dataAtual = new Date();

	const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	useEffect(() => {
		if (place) {
			const axiosGet = async () => {
				const { data } = await axios.get("/bookings/owner");
				setBooking(
					data.filter((booking) => {
						console.log(booking.place._id, place._id);
						return booking.place._id === place._id;
					})[0],
				);
			};

			axiosGet();
		}
	}, [place]);

	useEffect(() => {
		if (booking) {
			showMessage("Você possue uma reserva nesta acomodação!", "info");
		}
	}, [booking]);

	useEffect(() => {
		if (id) {
			const axiosGet = async () => {
				setLoading(true);
				try {
					const { data } = await axios.get(`/places/${id}`);
					setPlace(data);
					setPlaceNotFound(false);
				} catch (error) {
					console.error("Erro ao buscar lugar:", error);
					setPlaceNotFound(true);
				} finally {
					setTimeout(() => {
						setLoading(false);
					}, 50);
				}
			};

			axiosGet();
		}
	}, [id]);

	useEffect(() => {
		if (id && place && place.owner) {
			const axiosGetOwner = async () => {
				try {
					const { data } = await axios.get(`/places/owner/${place.owner._id}`);
					setOwner(data);
					console.log("Owner data received:", data);
					console.log("Owner createdAt:", data?.createdAt);
				} catch (error) {
					console.error("Erro ao buscar dono da acomodação:", error);
					setOwner(null);
				}
			};

			axiosGetOwner();
		}
	}, [id, place]);

	useEffect(() => {
		if (owner) {
			calculateExperienceTime();
		}
	}, [owner]);

	useEffect(() => {
		if (id) {
			const axiosGetBookings = async () => {
				const { data } = await axios.get(`/bookings/place/${id}`);

				setBookingsPlace(data);
			};

			axiosGetBookings();
		}
	}, [id]);

	useEffect(() => {
		if (id) {
			const axiosGetReviews = async () => {
				try {
					const { data } = await axios.get(`/reviews/place/${id}`);
					setReviews(data);
				} catch (error) {
					console.error("Erro ao buscar avaliações:", error);
				}
			};

			axiosGetReviews();
		}
	}, [id]);

	useEffect(() => {
		if (place && formRef.current) {
			const observer = new IntersectionObserver(
				(entries) => {
					const entry = entries[0];
					setShowFixedBar(!entry.isIntersecting);
				},
				{
					root: null,
					rootMargin: "0px",
					threshold: 0,
				},
			);

			observer.observe(formRef.current);

			return () => observer.disconnect();
		}
	}, [place]);

	const calculateExperienceTime = () => {
		const createdAt = owner?.createdAt || place?.owner?.createdAt;
		if (!createdAt) return;

		const createdDate = new Date(createdAt);
		const now = new Date();
		const diffTime = Math.abs(now - createdDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 30) {
			setExperienceTime(`${diffDays} dia${diffDays !== 1 ? "s" : ""}`);
		} else if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			setExperienceTime(`${months} ${months !== 1 ? "meses" : "mês"}`);
		} else {
			const years = Math.floor(diffDays / 365);
			setExperienceTime(`${years} ano${years !== 1 ? "s" : ""}`);
		}
	};

	const handleImageClick = (index) => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(index);
		}
	};

	const handleShowMoreClick = () => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(0);
		}
	};

	const handleBooking = async (e) => {
		e.preventDefault();

		if (checkin && checkout && guests) {
			const nights = numberOfDays(checkin, checkout);

			const objBooking = {
				place: id,
				user: user._id,
				price: place.price,
				priceTotal: place.price * nights,
				checkin,
				checkout,
				guests,
				nights,
			};

			try {
				const { data } = await axios.post("/bookings", objBooking);
				setRedirect(true);
			} catch (error) {
				if (error.response?.status === 409) {
					// Datas conflitantes - mostrar mensagem e resetar datas
					showMessage(
						"Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis.",
						"error",
					);
					// Resetar as datas selecionadas
					setCheckin(today);
					setCheckout(fiveDaysAfter);
					// Também resetar o estado do DatePicker se necessário
					setDate({
						from: today,
						to: fiveDaysAfter,
					});
				} else {
					// Outros erros
					showMessage("Erro ao criar reserva. Tente novamente.", "error");
				}
			}
		} else {
			showMessage("Insira todas as informações!", "warning");
		}
	};

	const [imageErrors, setImageErrors] = useState({});

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (index) => {
		return imageErrors[index]
			? photoDefault
			: place.photos[index] || photoDefault;
	};

	if (redirect) return <Navigate to={`/account/bookings`} />;

	if (placeNotFound) return <NotFound />;

	// Função para lidar com a seleção de datas do novo componente
	const handleDateSelect = ({ checkin: newCheckin, checkout: newCheckout }) => {
		setCheckin(newCheckin);
		setCheckout(newCheckout);
		if (newCheckin) {
			const daysBefore = Math.ceil(
				(newCheckin - new Date()) / (1000 * 60 * 60 * 24),
			);
			if (daysBefore >= 7) {
				setRefundPolicy(
					"Cancelamento gratuito até 7 dias antes da data de check-in. Após esse período, a reserva não é reembolsável. Consulte a política completa deste anfitrião para saber mais.",
				);
			} else if (daysBefore >= 3) {
				setRefundPolicy(
					"Cancelamento gratuito até 3 dias antes da data de check-in, com 50% de reembolso entre 3 e 6 dias. Após esse período, a reserva não é reembolsável. Consulte a política completa deste anfitrião para saber mais.",
				);
			} else {
				setRefundPolicy(
					"Cancelamento não é possível com menos de 3 dias de antecedência. A reserva não é reembolsável. Consulte a política completa deste anfitrião para saber mais.",
				);
			}
		}
	};

	if (loading) {
		return (
			<div className="container__infos mx-auto max-w-7xl flex flex-col gap-2">
				<div className="shadow-none max-sm:p-0 max-sm:shadow-none max-h-full max-sm:mt-15 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center rounded-4xl  relative overflow-hidden">
					<div className="bg-white max-sm:shadow-none p-2 max-sm:p-0 relative mx-4 max-sm:mx-0 max-sm:rounded-none rounded-2xl cursor-pointer">
						{/* Container do grid principal */}
						<div className="grid relative  grid-cols-4 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2  max-sm:h-[50svh]">
							{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
							<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover  transition-all"
									src={photoDefaultLoading}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</div>

							{/* Imagem superior direita */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover  transition-all"
									src={photoDefaultLoading}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</div>

							{/* Imagem superior direita extrema */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover  transition-all"
									src={photoDefaultLoading}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</div>
							{mobile ? null : (
								<>
									<div className="col-span-1 row-span-1 max-sm:col-span-4">
										<img
											className="w-full h-full border aspect-video rounded-2xl object-cover  transition-all"
											src={photoDefaultLoading}
											alt="Imagem da acomodação"
											onClick={() => handleImageClick(3)}
										/>
									</div>

									<div className="col-span-1 row-span-1">
										<img
											className="w-full h-full border aspect-video rounded-2xl object-cover  transition-all"
											src={photoDefaultLoading}
											alt="Imagem da acomodação"
											onClick={() => handleImageClick(4)}
										/>
									</div>
								</>
							)}

							<button
								className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white hover:bg-gray-50 transition-all  font-medium"
								onClick={handleShowMoreClick}
							>
								<Expand size={18} className="opacity-20" />
								<span className="max-sm:hidden opacity-20">
									Mostrar todas as fotos
								</span>
							</button>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 max-sm:gap-5 justify-between md:grid-cols-2 mt-2 max-sm:mx-2 mx-8 ">
					<div className="leading-relaxed px-0 order-1 description ">
						<div className="max-sm:py-0  w-full">
							<div className="flex gap-4 mb-5 max-sm:visible sm:hidden max-sm:text-xs! max-sm:gap-2! max-sm:w-fit justify-start max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-15 h-5"></Skeleton>
									</div>
								</div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-15 h-5"></Skeleton>
									</div>
								</div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-15 h-5"></Skeleton>
									</div>
								</div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-15 h-5"></Skeleton>
									</div>
								</div>
							</div>
							<div className="flex flex-col sm:hidden mt-1 max-sm:visible !flex-nowrap  !text-xs gap-2 w-full justify-start max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5 " />
										<Skeleton className="w-60 h-5"></Skeleton>
									</div>
								</div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-30 h-5"></Skeleton>
									</div>
								</div>
							</div>

							<div className="flex gap-4 max-sm:hidden  !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-30 h-5"></Skeleton>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-30 h-5"></Skeleton>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-30 h-5"></Skeleton>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Skeleton className="max-sm:hidden w-5 h-5" />
										<Skeleton className="w-30 h-5"></Skeleton>
									</div>
								</div>
							</div>
						</div>
						<div className="flex gap-2 flex-col my-2.5 max-sm:mt-2  ">
							<div className="flex items-center gap-2 w-full">
								<div className="flex items-center group max-sm:w-full transition-all w-full ransition-all rounded-2xl py-5 gap-2.5 justify-between ">
									<div className="flex items-center font-normal  gap-2.5">
										<img
											src={photoDefaultLoading}
											className="w-12 h-12 border  aspect-square rounded-full object-cover"
											alt="Foto do Usuário"
										/>
										<div className="flex flex-col gap-2 text-gray-700 ">
											<Skeleton className="w-25 h-4"></Skeleton>
											<small>
												<Skeleton className="w-7 h-4"></Skeleton>
											</small>
										</div>
									</div>
									<Skeleton className="w-5 h-5"></Skeleton>
								</div>
							</div>
						</div>
						<div className="border  border-r-0 py-5 mb-5 border-l-0">
							<div className="space-y-2">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-5 w-2/4" />
								<Skeleton className="h-5 w-3/5" />
								<Skeleton className="h-5 w-2/4" />
							</div>
						</div>
						<div className="my-4">
							<div className="sm:text-2xl text-large font-medium">
								<Skeleton className="h-5 w-3/4" />
							</div>
							<div className="flex flex-wrap gap-3 mt-8 max-w-7xl mx-auto">
								{[...Array(8)].map((_, index) => (
									<div
										key={index}
										className="flex  border border-primary-100 w-fit items-center px-4 py-2 rounded-2xl gap-2.5"
									>
										<Skeleton className="h-5 w-5" />
										<Skeleton className="h-5 w-20" />
									</div>
								))}
							</div>
						</div>
						<div className="mt-8">
							<div className="sm:text-2xl text-large font-medium">
								<Skeleton className="h-5 w-3/5" />
							</div>
							<div className="mt-8 flex  max-sm:text-sm items-center gap-5 max-sm:gap-1">
								<div className="flex bg-gray-50 w-fit max-sm:p-3 items-center px-8 py-4 rounded-2xl gap-2.5">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-5 w-25" />
								</div>
								<div className="flex bg-gray-50 w-fit items-center max-sm:p-3  px-8 py-4  rounded-2xl gap-2.5">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-5 w-25" />
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Conteúdo da acomodação */}
			</div>
		);
	}

	if (!place) return <></>;

	console.log("Console bookings:", bookingsPlace);

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	let rooms = 1;
	let beds = 2;
	let bathrooms = 1;

	return (
		<>
			<LightGallery
				onInit={(detail) => {
					lightGalleryRef.current = detail.instance;
				}}
				speed={500}
				plugins={[lgThumbnail, lgZoom, lgFullscreen]}
				dynamic
				dynamicEl={place.photos.map((photo, id) => ({
					src: getImageSrc(id),
					thumb: getImageSrc(id),
				}))}
			/>

			{/* Fixed Bar */}

			{showFixedBar && (
				<div className="fixed top-0 hidden left-0 right-0 z-50">
					<div className="w-fit mx-auto px-4 py-3">
						<button
							onClick={() => {
								formRef.current?.scrollIntoView({ behavior: "smooth" });
							}}
							className="w-full flex items-center justify-between bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors"
						>
							<div className="flex items-center gap-4">
								<div className="text-lg font-semibold">Reservar</div>
								{place.averageRating > 0 && (
									<div className="flex items-center gap-1">
										<Star size={16} className="text-yellow-400 fill-current" />
										<span className="text-sm font-medium">
											{place.averageRating.toFixed(1)}
										</span>
									</div>
								)}
							</div>
							<div className="text-lg font-semibold">
								R$ {place?.price}{" "}
								<span className="text-sm font-normal">por noite</span>
							</div>
						</button>
					</div>
				</div>
			)}

			{/* Place */}

			<div className=" mb-2.5 flex w-full max-w-full flex-col gap-2">
				<div className=" max-sm:p-0 max-sm:shadow-none max-h-full  max-sm:mt-15 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center  relative overflow-hidden">
					{/* <div className="grid relative  grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2 2xl:h-130 max-sm:h-[50svh]">
						<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(0)}
								onError={() => handleImageError(0)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(0)}
							/>
						</div>

						<div className="col-span-1 row-span-2 max-sm:col-span-2 ">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(1)}
								onError={() => handleImageError(1)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(1)}
							/>
						</div>

						<div className="col-span-1 row-span-1 max-sm:col-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(2)}
								onError={() => handleImageError(2)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(2)}
							/>
						</div>

						{mobile ? null : (
							<>
								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
										src={getImageSrc(3)}
										onError={() => handleImageError(3)}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(3)}
									/>
								</div>

								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
										src={getImageSrc(4)}
										onError={() => handleImageError(4)}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</div>
								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
										src={getImageSrc(1)}
										onError={() => handleImageError(4)}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</div>
							</>
						)}

						<button
							className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white border border-gray-800 hover:bg-gray-50 transition-all cursor-pointer font-medium"
							onClick={handleShowMoreClick}
						>
							<Expand size={18} />
							<span className="max-sm:hidden">Mostrar todas as fotos</span>
						</button>
					</div> */}
					<div className="grid relative  grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2 2xl:h-150 max-sm:h-[50svh]">
						{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
						<div className="col-span-3 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(0)}
								onError={() => handleImageError(0)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(0)}
							/>
						</div>

						{/* Imagem superior direita */}
						<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(1)}
								onError={() => handleImageError(1)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(1)}
							/>
						</div>

						{/* Imagem superior direita extrema */}
						<div className="col-span-1 row-span-1 max-sm:col-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
								src={getImageSrc(2)}
								onError={() => handleImageError(2)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(2)}
							/>
						</div>

						{mobile ? null : (
							<>
								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
										src={getImageSrc(3)}
										onError={() => handleImageError(3)}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(3)}
									/>
								</div>

								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
										src={getImageSrc(4)}
										onError={() => handleImageError(4)}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</div>
							</>
						)}

						<button
							className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white border border-gray-800 hover:bg-gray-50 transition-all cursor-pointer font-medium"
							onClick={handleShowMoreClick}
						>
							<Expand size={18} />
							<span className="max-sm:hidden">Mostrar todas as fotos</span>
						</button>
					</div>
				</div>
				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-5 max-sm:gap-5 mt-2 gap-5 max-sm:mx-2 max-sm:mt-0 mx-4 ">
					<div className="leading-relaxed col-span-3  order-1 description ">
						<div className="max-sm:py-0  w-full">
							<div className="flex sm:hidden mt-1 max-sm:visible !flex-nowrap items-center !text-xs gap-2 w-full justify-start max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<div>{place.guests} hóspedes</div>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.rooms || rooms > 1 ? (
											<p>
												<span>{place.rooms}</span> quartos
											</p>
										) : (
											<p>
												<span>{place.rooms}</span> quarto
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.beds && place.beds > 1 ? (
											<p>
												<span className="">{place.beds}</span> camas
											</p>
										) : (
											<p>
												<span className="">{place.beds}</span> cama
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.bathrooms || bathrooms > 1 ? (
											<p>
												<span>{place.bathrooms}</span> banheiros
											</p>
										) : (
											<p className="text-sm">
												<span>{place.bathrooms}</span> banheiro
											</p>
										)}
									</div>
								</div>
							</div>
							<div className="flex flex-col flex-1 gap-2">
								<div className="text-3xl font-bold max-sm:text-[1.5rem] text-gray-700 ">
									{place.title}
								</div>
								{place.averageRating > 0 && (
									<>
										<div className="flex gap-2 rounded-2xl items-center ">
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1">
													{[...Array(5)].map((_, i) => (
														<Star
															key={i}
															size={15}
															className={`${
																i < Math.floor(place.averageRating)
																	? "text-yellow-500 fill-current"
																	: i < place.averageRating
																		? "text-yellow-500 fill-current opacity-50"
																		: "text-gray-300"
															}`}
														/>
													))}
												</div>
												<div>{place.averageRating.toFixed(1)} estrelas</div>
											</div>
										</div>
									</>
								)}
								<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
									<MapPin size={13} />
									<span>{place.city}</span>
								</div>
							</div>
							{!mobile && (
								<div className="flex gap-4 w-full !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto">
									<div className="flex gap-2 rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											<div>{place.guests} hóspedes</div>
										</div>
									</div>
									<div className="w-1 rounded-full h-1 bg-gray-500"></div>
									<div className="flex gap-2  rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											{place.rooms || rooms > 1 ? (
												<p>
													<span>{place.rooms}</span> quartos
												</p>
											) : (
												<p>
													<span>{place.rooms}</span> quarto
												</p>
											)}
										</div>
									</div>
									<div className="w-1 rounded-full h-1 bg-gray-500"></div>
									<div className="flex gap-2 rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											{place.beds && place.beds > 1 ? (
												<p>
													<span className="">{place.beds}</span> camas
												</p>
											) : (
												<p>
													<span className="">{place.beds}</span> cama
												</p>
											)}
										</div>
									</div>
									<div className="w-1 rounded-full h-1 bg-gray-500"></div>
									<div className="flex gap-2 rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											{place.bathrooms || bathrooms > 1 ? (
												<p>
													<span>{place.bathrooms}</span> banheiros
												</p>
											) : (
												<p className="text-sm">
													<span>{place.bathrooms}</span> banheiro
												</p>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
						<div className="flex gap-2 flex-col mt-2.5 max-sm:mt-2  ">
							<div className="flex items-center gap-2 w-full">
								<div className="flex items-center group max-sm:w-full  py-5 max-sm:hover:bg-transparent max-sm:rounded-none max-sm:hover:px-0 transition-all w-full ransition-all rounded-2xl gap-2.5 justify-between ">
									<Link
										to={`/account/profile/${place.owner._id}`}
										className="flex group rounded-2xl items-center font-normal  gap-2.5"
									>
										<img
											src={place.owner.photo}
											className="w-12 h-12 group-hover:size-15 transition-all duration-500 aspect-square rounded-full object-cover"
											alt="Foto do Usuário"
										/>
										<div className="flex flex-col text-gray-700 ">
											<div className="font-medium w-fit cursor-pointer ">
												{place.owner.name}
											</div>
											<small className="flex items-center gap-1">
												Anfitrião há{" "}
												<span className="text-primary-600 font-medium">
													{experienceTime}
												</span>
											</small>
										</div>
									</Link>
								</div>
							</div>
						</div>
						<div className="border  border-r-0 py-7 border-l-0">
							<p
								className=""
								dangerouslySetInnerHTML={{
									__html: md.render(place.description),
								}}
							></p>
						</div>
						<div className="py-7 border-b">
							<p className="text-primary-500 uppercase font-light">
								Comodidades
							</p>
							<p className="text-3xl font-bold">O que esse lugar oferece</p>
							<div className="mt-2">
								<div className="grid grid-cols-2 gap-3 mt-5 max-w-7xl mx-auto">
									{place.perks.map(
										(perk, index) =>
											perk && (
												<div
													key={index}
													className="flex w-fit items-center  rounded-2xl gap-2.5"
												>
													<Perk place={true} perk={perk} />
												</div>
											),
									)}
								</div>
							</div>
						</div>
						<div className="py-7 border-b">
							<p className="text-primary-500 uppercase font-light">
								Localização
							</p>
							<p className="text-3xl font-bold">Onde você vai ficar</p>
							<div className="mt-5">
								{place.city &&
								googleMapsApiKey &&
								typeof googleMapsApiKey === "string" &&
								googleMapsApiKey.trim() !== "" ? (
									<iframe
										src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(place.city)}&zoom=12`}
										className="w-full h-64 rounded-2xl border-0 shadow-sm"
										allowFullScreen
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										title={`Mapa de ${place.city}`}
									></iframe>
								) : (
									<div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
										<MapPin size={48} className="mb-2" />
										<p>Mapa não disponível</p>
									</div>
								)}
							</div>
						</div>
						<div className="py-7 border-b">
							<p className="text-primary-500 uppercase font-light">
								Políticas e Regras
							</p>
							<p className="text-3xl font-bold">O que você deve saber</p>
							<div className="my-4 space-y-6">
								<div>
									<CalendarX size={18} />
									<p className="font-semibold mt-2">Política de cancelamento</p>
									<p className="text-gray-600 mb-3">
										{refundPolicy
											? refundPolicy
											: "Adicione as datas de viagem para obter as informações de cancelamento dessa reserva."}
									</p>
								</div>
								<div>
									<ScrollText size={18} />
									<p className="font-semibold mt-2">Regras da casa</p>
									<div className="flex flex-col text-gray-700">
										<span>Check-in após {place.checkin}</span>
										<span>Checkout antes das {place.checkout}</span>
										<span>
											Máximo de {place.guests > 1 ? "hóspedes" : "hóspede"}{" "}
										</span>
									</div>
								</div>
								<div>
									<ShieldHalf size={18} />
									<p className="font-semibold mt-2">Segurança e propriedade</p>
									<div className="flex flex-col text-gray-700">
										<span>Alarme de monóxido de carbono não informado</span>
										<span>Detector de fumaça não informado</span>
										<span>
											Câmeras de segurança na parte externa da propriedade
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="my-4 mt-7">
							<div
								id="avaliacoes"
								className="flex scroll-m-25 flex-col w-full relative "
							>
								<p className="text-primary-500 uppercase font-light">
									Avaliações
								</p>
								<div className="flex items-center justify-between">
									<div className="">
										<p className="text-3xl font-bold">O que Dizem</p>
									</div>
									{/* Mobile Filter Button */}
									{mobile && (
										<Drawer
											open={sheetOpen}
											onOpenChange={setSheetOpen}
											modal={true}
										>
											<DrawerContent className="rounded-tl-3xl h-auto p-5 py-6 max-h-[80vh]">
												<p className="text-xl font-medium text-gray-900 mb-2">
													Filtros de Avaliações
												</p>
												<div className="flex flex-col gap-6 mt-6">
													<div className="flex flex-col gap-2">
														<label className="text-sm font-medium text-gray-700">
															Ordenar por:
														</label>
														<div className="flex flex-col gap-4">
															<label
																htmlFor="recent"
																className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																	sortByTemp === "recent"
																		? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																		: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																}`}
															>
																<input
																	type="checkbox"
																	id="recent"
																	name="sortBy"
																	value="recent"
																	checked={sortByTemp === "recent"}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setSortByTemp("recent");
																		}
																	}}
																	className="hidden"
																/>
																Mais recente
																<span
																	className={`w-2 h-2 ml-auto rounded-full bg-transparent ${sortByTemp === "recent" && "!bg-primary-900"}`}
																></span>
															</label>
															<label
																htmlFor="oldest"
																className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																	sortByTemp === "oldest"
																		? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																		: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																}`}
															>
																<input
																	type="checkbox"
																	id="oldest"
																	name="sortBy"
																	value="oldest"
																	checked={sortByTemp === "oldest"}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setSortByTemp("oldest");
																		}
																	}}
																	className="hidden"
																/>
																Mais antigo
																<span
																	className={`w-2 h-2 ml-auto rounded-full bg-transparent ${sortByTemp === "oldest" && "!bg-primary-900"}`}
																></span>
															</label>
														</div>
													</div>
													<div className="flex flex-col gap-2">
														<label className="text-sm font-medium text-gray-700">
															Estrelas:
														</label>
														<div className="flex gap-1">
															{[1, 2, 3, 4, 5].map((star) => (
																<button
																	key={star}
																	type="button"
																	className={`p-3 hover:scale-110 rounded-2xl bg-primary-100/50 transition-all ${
																		star <= (tempHoverRating || tempRating) &&
																		"bg-primary-900"
																	}`}
																	onMouseEnter={() => setTempHoverRating(star)}
																	onMouseLeave={() => setTempHoverRating(0)}
																	onClick={() => {
																		setTempRating(star);
																	}}
																>
																	<Star
																		size={24}
																		className={`${
																			star <= (tempHoverRating || tempRating)
																				? "fill-white cursor-pointer text-white"
																				: "text-gray-300"
																		} transition-colors`}
																	/>
																</button>
															))}
														</div>
													</div>
													<div className="flex flex-col gap-2">
														<label className="text-sm font-medium text-gray-700">
															Comentários:
														</label>
														<div className="flex flex-col gap-4">
															<label
																htmlFor="all_comments"
																className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																	tempCommentFilter === "all"
																		? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																		: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																}`}
															>
																<input
																	type="checkbox"
																	id="all_comments"
																	name="commentFilter"
																	value="all"
																	checked={tempCommentFilter === "all"}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setTempCommentFilter("all");
																		}
																	}}
																	className="hidden"
																/>
																Todos
																<span
																	className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "all" && "!bg-primary-900"}`}
																></span>
															</label>
															<label
																htmlFor="with_comments"
																className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																	tempCommentFilter === "with"
																		? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																		: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																}`}
															>
																<input
																	type="checkbox"
																	id="with_comments"
																	name="commentFilter"
																	value="with"
																	checked={tempCommentFilter === "with"}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setTempCommentFilter("with");
																		}
																	}}
																	className="hidden"
																/>
																Com comentário
																<span
																	className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "with" && "!bg-primary-900"}`}
																></span>
															</label>
															<label
																htmlFor="without_comments"
																className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																	tempCommentFilter === "without"
																		? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																		: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																}`}
															>
																<input
																	type="checkbox"
																	id="without_comments"
																	name="commentFilter"
																	value="without"
																	checked={tempCommentFilter === "without"}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setTempCommentFilter("without");
																		}
																	}}
																	className="hidden"
																/>
																Sem comentário
																<span
																	className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "without" && "!bg-primary-900"}`}
																></span>
															</label>
														</div>
													</div>
												</div>
												<div className="flex justify-end gap-4 mt-6">
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															// Clear filters
															setSortBy("recent");
															setRatingFilter("all");
															setCommentFilter("all");
															setSheetRating(0);
															setSortByTemp("recent");
															setTempRating(0);
															setTempCommentFilter("all");
														}}
														className="px-4 py-2 cursor-pointer hover:bg-primary-100 rounded-lg border hover:text-primary-900 transition-colors font-medium"
													>
														Limpar
													</button>
													<button
														type="button"
														onClick={() => {
															// Apply filters and close sheet
															setSortBy(sortByTemp);
															setRatingFilter(
																tempRating > 0 ? tempRating.toString() : "all",
															);
															setCommentFilter(tempCommentFilter);
															setSheetOpen(false);
															// Scroll to "Avaliações" section
															document
																.getElementById("avaliacoes")
																?.scrollIntoView({ behavior: "smooth" });
														}}
														className="px-6 py-2 bg-primary-900 cursor-pointer text-white rounded-lg hover:bg-primary-800 transition-colors font-medium"
													>
														Aplicar Filtros
													</button>
												</div>
											</DrawerContent>
										</Drawer>
									)}
								</div>
								{/* External Filter Button */}

								{/* Desktop Filter Controls */}
								{!mobile && (
									<div className="flex flex-wrap gap-4 mt-5 mb-5">
										<div className="flex flex-col gap-2">
											<label className="text-sm font-medium text-gray-700">
												Ordenar por:
											</label>
											<Select
												value={sortBy}
												onChange={setSortBy}
												data={[
													{ value: "recent", label: "Mais recente" },
													{ value: "oldest", label: "Mais antigo" },
												]}
												placeholder="Ordenar por"
												className="w-[180px]"
												styles={{
													input: {
														borderRadius: "12px",
													},
													dropdown: {
														borderRadius: "12px",
													},
												}}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<label className="text-sm font-medium text-gray-700">
												Estrelas:
											</label>
											<Select
												value={ratingFilter}
												onChange={setRatingFilter}
												data={[
													{ value: "all", label: "Todas" },
													{ value: "5", label: "5 estrelas" },
													{ value: "4", label: "4 estrelas" },
													{ value: "3", label: "3 estrelas" },
													{ value: "2", label: "2 estrelas" },
													{ value: "1", label: "1 estrela" },
												]}
												placeholder="Estrelas"
												className="w-[180px]"
												styles={{
													input: {
														borderRadius: "12px",
													},
													dropdown: {
														borderRadius: "12px",
													},
												}}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<label className="text-sm font-medium text-gray-700">
												Comentários:
											</label>
											<Select
												value={commentFilter}
												onChange={setCommentFilter}
												data={[
													{ value: "all", label: "Todos" },
													{ value: "with", label: "Com comentário" },
													{ value: "without", label: "Sem comentário" },
												]}
												placeholder="Comentários"
												className="w-[180px]"
												styles={{
													input: {
														borderRadius: "12px",
													},
													dropdown: {
														borderRadius: "12px",
													},
												}}
											/>
										</div>
									</div>
								)}
								<div className="grid grid-cols-1 gap-4 mt-5 mb-15 max-sm:mb-0">
									{filteredReviews.length > 0 ? (
										filteredReviews.map((review) => (
											<div
												key={review._id}
												className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
											>
												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														{[...Array(5)].map((_, index) => (
															<Star
																key={index}
																fill={
																	index < Math.floor(review.rating)
																		? "black"
																		: "none"
																}
																stroke="black"
																size={20}
															/>
														))}
													</div>
												</div>
												{review.comment ? (
													<p className="text-gray-700 max-w-md leading-relaxed line-clamp-4">
														"{review.comment}"
													</p>
												) : (
													<p className=" max-w-md mt-auto items-center text-primary-500 leading-relaxed line-clamp-4">
														Sem comentário
													</p>
												)}
												<Link
													to={`/account/profile/${review.user._id}`}
													className="flex items-center mt-auto gap-2"
												>
													<img
														src={review.user.photo || photoDefault}
														alt={review.user.name}
														className="w-12 h-12 rounded-full object-cover"
													/>
													<div className="flex flex-col text-sm">
														<p className="font-semibold text-gray-900">
															{review.user.name}
														</p>
														<p className="text-xs text-gray-500">
															Hóspede Verificado
														</p>
													</div>
												</Link>
											</div>
										))
									) : (
										<p className="text-gray-500 text-center py-0">
											Ainda não há avaliações para este filtro.
										</p>
									)}
								</div>
								{mobile && (
									<button
										onClick={() => setSheetOpen(true)}
										className="sticky bottom-2.5 ml-auto text-center -mt-7.5 cursor-pointer justify-center text-xl p-4 w-fit shadow-sm flex flex-1 items-center gap-2 bg-primary-900 hover:bg-primary-black transition-colors rounded-full text-white font-medium"
									>
										<Filter size={18} />
									</button>
								)}
							</div>
						</div>
					</div>

					{console.log("Este é log: ", booking)}
					<div className="order-1 col-span-2 flex-1  ">
						{/* Booking */}
						{booking && (
							<div className="section__booking mb-5  h-fit order-2 w-full ml-auto max-sm:mb-5  lg:max-w-5xl">
								<div className=" relative shadow-gray-200 max-sm:rounded-2xl!  bg-gray-50 rounded-3xl overflow-hidden">
									{/* Boarding Pass Style Container */}
									<div className="flex flex-col ">
										{/* QR Code Section */}

										{mobile ? (
											<div className="bg-gray-900 text-white h-15 flex items-center justify-center border-b-2 md:border-b-0  border-r-0 md:border-r-2 border-dashed border-gray-200 relative">
												<p className="text-xs font-medium -rotate-0 md:-rotate-90 whitespace-nowrap tracking-wider">
													RESERVA CONFIRMADA
												</p>
												{/* Semi-circle cutouts */}
												<div className="absolute -left-4 -bottom-4 w-8 h-8 backdrop-blur-3xl bg-white  rounded-full"></div>
												<div className="absolute -right-4 -bottom-4 w-8 h-8 backdrop-blur-3xl bg-white  rounded-full"></div>
											</div>
										) : (
											<div className="bg-gray-100 p-4 max-sm:h-10 md:p-8 flex items-center justify-center border-b-2 md:border-b-0 max-sm:rounded-2xl border-r-0 md:border-r-2 border-dashed border-gray-200 relative">
												{/* Semi-circle cutouts */}
												<div className="absolute -bottom-4 -left-4 w-8 h-8 backdrop-blur-3xl bg-white border border-gray-200 rounded-full"></div>
												<div className="absolute -bottom-4 -right-4 max-sm:-left-8 max-sm:-right-auto w-8 h-8 backdrop-blur-3xl bg-white border border-gray-200 rounded-full"></div>
											</div>
										)}

										{/* Main Content */}
										<div className="flex-1 p-8">
											{/* Route Information */}
											<div className="flex items-center justify-between max-sm:my-4 mb-8">
												<div className="flex-1">
													<p className="text-primary-500 uppercase font-light">
														Check-in
													</p>
													<p className="text-xl font-bold">
														{formatDate(booking.checkin)}
													</p>
													<p className="text-sm font-medium text-gray-700">
														{place.checkin}
													</p>
												</div>

												<div className="flex flex-col items-center px-4">
													<div className="flex items-center pt-2 gap-2">
														<div className="w-10 max-sm:w-5 border-t-2 border-dashed border-gray-300"></div>
														<div className="w-10 max-sm:w-5 border-t-2 border-dashed border-gray-300"></div>
													</div>
												</div>

												<div className="flex-1 text-right">
													<p className="text-primary-500 uppercase font-light">
														Check-out
													</p>
													<p className="text-xl font-bold">
														{formatDate(booking.checkout)}
													</p>
													<p className="text-sm font-medium text-gray-700">
														{place.checkout}
													</p>
												</div>
											</div>

											{/* Booking Details */}
											<div className="grid grid-cols-2 md:grid-cols-4 max-sm:gap-2 gap-6 pt-6 border-t max-sm:border-none border-gray-200">
												<div>
													<p className="text-xs text-gray-500 mb-1">Código</p>
													<p className="text-sm font-semibold text-primary-600">
														#{booking._id.slice(-6).toUpperCase()}
													</p>
												</div>

												<div>
													<p className="text-xs text-gray-500 mb-1">Ações</p>
													<Tooltip>
														<TooltipTrigger asChild>
															<Link
																to={`../account/bookings/${booking._id}`}
																className="inline-flex text-nowrap text-gray-900 items-center gap-1 text-sm font-semibold  hover:text-gray-700"
															>
																Acessar reserva
															</Link>
														</TooltipTrigger>
														<TooltipContent className="bg-primary-600">
															<p>Acessar reserva completa</p>
														</TooltipContent>
													</Tooltip>
												</div>
											</div>
										</div>

										{/* Sidebar */}
										{!mobile && (
											<div className="bg-primary-900 text-white p-4 flex max-sm:absolute max-sm:bottom-0 max-sm:w-full max-sm:left-0 max-sm:h-10 md:flex-col items-center justify-center gap-3 min-w-[60px] max-sm:min-w-[50px] relative">
												<p className="text-xs font-medium whitespace-nowrap tracking-wider">
													RESERVA CONFIRMADA
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
						<form
							ref={formRef}
							className="w-full max-w-md bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm"
						>
							{/* Preço */}
							<div className="mb-6">
								<div className="flex items-baseline gap-1">
									<span className="text-4xl font-bold text-gray-900">
										R$ {place?.price}
									</span>
									<span className="text-gray-600">por noite</span>
								</div>
							</div>

							{/* NOVO CALENDÁRIO AIRBNB STYLE */}
							<div className="w-full mb-6" ref={datePickerRef}>
								<DatePickerAirbnb
									onDateSelect={handleDateSelect}
									initialCheckin={checkin}
									initialCheckout={checkout}
									price={place?.price}
									placeId={id}
									bookings={bookingsPlace}
								/>
							</div>

							{/* Hóspedes */}
							<div className="mb-6">
								<div className="text-sm font-semibold text-gray-900 mb-3">
									Hóspedes
								</div>
								<div className="text-sm text-gray-600 mb-3">
									Hospedagem para até 2 pessoas.
								</div>
								<div className="flex items-center justify-between border rounded-xl p-3">
									<button
										onClick={() => setGuests(Math.max(1, guests - 1))}
										className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
										disabled={guests <= 1}
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="text-lg font-medium">{guests}</span>
									<button
										onClick={() => setGuests(Math.min(10, guests + 1))}
										className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Botão */}
							<button
								className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
								onClick={
									user
										? handleBooking
										: (e) => {
												e.preventDefault();
												showAuthModal("login");
											}
								}
							>
								{user ? "Reservar Agora" : "Faça login para reservar"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default Place;
