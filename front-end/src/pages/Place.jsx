import axios from "axios";
import {
	Bath,
	Bed,
	ChevronRight,
	Clock,
	Expand,
	Home,
	HomeIcon,
	MapPin,
	Minus,
	Plus,
	Star,
	Users2,
} from "lucide-react";
import React, { useEffect, useState, useRef, useContext } from "react";
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

const Place = () => {
	const { mobile } = useMobileContext();
	const { id } = useParams();
	const { user } = useUserContext();
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);

	const lightGalleryRef = useRef(null);
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

	const numberOfDays = (date1, date2) => {
		const date1GMT = date1 + "GMT-03:00";
		const date2GMT = date2 + "GMT-03:00";

		const dateCheckin = new Date(date1GMT);
		const dateCheckout = new Date(date2GMT);

		return (
			(dateCheckout.getTime() - dateCheckin.getTime()) / (1000 * 60 * 60 * 24)
		);
	};

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

			{/* Place */}

			<div className=" mx-auto m-0 flex xl:max-w-7xl flex-col gap-2">
				<div className=" max-sm:p-0 max-sm:shadow-none max-h-full  max-sm:mt-15 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center  relative overflow-hidden">
					{/* Container do grid principal */}
					<div className="grid relative  grid-cols-4 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2  max-sm:h-[50svh]">
						{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
						<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
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
								<div className="col-span-1 row-span-1 max-sm:col-span-4">
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
				<div className="grid grid-cols-1 max-sm:gap-5 gap-20 md:grid-cols-2 mt-2 max-sm:mx-2 max-sm:mt-0 mx-4 ">
					<div className="leading-relaxed px-0 order-1 description ">
						<div className="max-sm:py-0  w-full">
							<div className="flex sm:hidden mt-1 max-sm:visible !flex-nowrap items-center !text-xs gap-2 w-full justify-start max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Users2 size={15} className="max-sm:hidden" />
										<div>{place.guests} hóspedes</div>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<HomeIcon size={15} className="max-sm:hidden" />
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
										<Bed size={15} className="max-sm:hidden" />
										{place.beds || beds > 1 ? (
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
										<Bath size={15} className="max-sm:hidden" />
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
								<div className="text-[2rem] max-sm:text-[1.5rem] font-medium text-gray-700 ">
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
											<Users2 size={15} className="max-sm:hidden" />
											<div>{place.guests} hóspedes</div>
										</div>
									</div>
									<div className="w-1 rounded-full h-1 bg-gray-500"></div>
									<div className="flex gap-2  rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											<HomeIcon size={15} className="max-sm:hidden" />
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
											<Bed size={15} className="max-sm:hidden" />
											{place.beds || beds > 1 ? (
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
											<Bath size={15} className="max-sm:hidden" />
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
						<div className="border border-t-0 border-r-0 py-5 mb-5 border-l-0">
							<p
								className=""
								dangerouslySetInnerHTML={{
									__html: md.render(place.description),
								}}
							></p>
						</div>
						<div className="my-4">
							<p className="sm:text-2xl text-large font-medium">
								O que esse lugar oferece
							</p>
							<div className="my-4">
								<div className="flex flex-wrap gap-3 mt-8 max-w-7xl mx-auto">
									{place.perks.map(
										(perk, index) =>
											perk && (
												<div
													key={index}
													className="flex border-gray-300 border w-fit items-center px-4 py-2 rounded-2xl gap-2.5"
												>
													<Perk perk={perk} />
												</div>
											),
									)}
								</div>
							</div>
						</div>
						<div className="my-4">
							<p className="sm:text-2xl text-large font-medium">
								Horário e Restrições
							</p>
							<div className="my-2 flex  max-sm:text-sm items-center gap-5 max-sm:gap-1">
								<div className="flex bg-gray-50 w-fit max-sm:p-3 items-center px-8 py-4 rounded-2xl gap-2.5">
									<Clock size={15} color="gray" /> Check-in: {place.checkin}
								</div>
								<div className="flex bg-gray-50 w-fit items-center max-sm:p-3  px-8 py-4  rounded-2xl gap-2.5">
									<Clock size={15} color="gray" />
									Check-out: {place.checkout}
								</div>
							</div>
						</div>
						<div className="my-4">
							<p className="sm:text-2xl text-large font-medium">Avaliações</p>
							<div className="my-2 flex flex-wrap gap-2 space-y-4">
								{reviews.length > 0 ? (
									reviews.map((review) => (
										<div
											key={review._id}
											className="flex w-full items-center gap-4"
										>
											<div className="flex flex-col w-full gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
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
														<Link
															to={`/account/profile/${review.user._id}`}
															className="font-semibold hover:underline text-gray-900"
														>
															{review.user.name}
														</Link>
														<p className="text-xs text-gray-500">
															Hóspede Verificado
														</p>
													</div>
												</Link>
											</div>
										</div>
									))
								) : (
									<p className="text-gray-500">Nenhuma avaliação disponível.</p>
								)}
							</div>
						</div>
					</div>

					{console.log("Este é log: ", booking)}
					<div className="order-1">
						{/* Booking */}
						{booking && (
							<div className="section__booking  h-fit order-2 w-full ml-auto max-sm:mb-5  lg:max-w-5xl">
								<div className=" relative shadow-gray-200 max-sm:rounded-2xl!  bg-gray-50 rounded-3xl overflow-hidden">
									{/* Boarding Pass Style Container */}
									<div className="flex flex-col md:flex-row ">
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
												<div className="absolute sm:-top-4 sm:-right-4 max-sm:-right-8 max-sm:-bottom-4 w-8 h-8 backdrop-blur-3xl bg-white border border-gray-200 rounded-full"></div>
												<div className="absolute -bottom-4 -right-4 max-sm:-left-8 max-sm:-right-auto w-8 h-8 backdrop-blur-3xl bg-white border border-gray-200 rounded-full"></div>
											</div>
										)}

										{/* Main Content */}
										<div className="flex-1 p-6 md:p-8">
											{/* Route Information */}
											<div className="flex items-center justify-between max-sm:my-4 mb-8">
												<div className="flex-1">
													<p className="text-2xl max-sm:text-sm font-bold text-primary-900">
														CHECK-IN
													</p>
													<p className="text-xs text-gray-600 mt-1">
														{new Date(booking.checkin).toLocaleDateString(
															"pt-br",
															{
																weekday: "short",
																day: "numeric",
																month: "short",
															},
														)}
													</p>
													<p className="text-sm font-medium text-gray-700">
														{place.checkin}
													</p>
												</div>

												<div className="flex flex-col items-center px-4">
													<div className="flex items-center gap-2">
														<div className="w-15 max-sm:w-5 border-t-2 border-dashed border-gray-300"></div>
														<Home className="text-primary-400" size={20} />
														<div className="w-15 max-sm:w-5 border-t-2 border-dashed border-gray-300"></div>
													</div>
												</div>

												<div className="flex-1 text-right">
													<p className="text-2xl  max-sm:text-sm font-bold text-primary-900">
														CHECK-OUT
													</p>
													<p className="text-xs text-gray-600 mt-1">
														{new Date(booking.checkout).toLocaleDateString(
															"pt-br",
															{
																weekday: "short",
																day: "numeric",
																month: "short",
															},
														)}
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
												<p className="text-xs font-medium -rotate-0 md:-rotate-90 whitespace-nowrap tracking-wider">
													RESERVA CONFIRMADA
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
						<form className="form__place max-sm:relative max-w-md max-sm:p-0 max-sm:w-full order-2   w-full  justify-self-end self-start sticky top-20 bottom-20 flex flex-col gap-4 rounded-2xl py-5">
							<div className="border-l-2 border-primary-400 p-4">
								<div className="max-sm:text-xl text-2xl sm:text-start text-gray-600">
									<p className="uppercase text-sm">preço</p>
									<span className="font-light text-5xl text-primary-500">
										R$ {place.price}
									</span>{" "}
									<p className="text-sm">por noite</p>
								</div>
							</div>

							{/* NOVO CALENDÁRIO AIRBNB STYLE */}
							<div className="w-full">
								<DatePickerAirbnb
									onDateSelect={handleDateSelect}
									initialCheckin={checkin}
									initialCheckout={checkout}
									price={place.price}
									placeId={id}
									bookings={bookingsPlace}
								/>
							</div>

							{/* Hóspedes */}
							<div className="py-2 flex flex-col gap-4 justify-center sm:mx-auto sm:w-full ">
								<div>
									<p className="font-bold px-3 sm:px-0">Hóspedes</p>
									{!limiteGuests ? (
										<p className="text-sm text-gray-500 px-3 sm:px-0">
											Hospedagem para até {place.guests} pessoas.
										</p>
									) : (
										<p className="text-sm text-red-500 px-3 sm:px-0">
											{limiteGuests}
										</p>
									)}
								</div>
								<div className="flex items-center text-center justify-center p-0 h-full w-fit border rounded-2xl">
									<div className="rounded-l-2xl px-5 flex items-center justify-center bg-white">
										<Counter value={guests} fontSize={25} />
									</div>
									<div className="flex items-center">
										<button
											className="border-l py-2.5 hover:bg-gray-100 px-2.5 h-full cursor-pointer disabled:opacity-25 disabled:cursor-auto"
											onClick={(e) => {
												e.preventDefault();
												if (guests < place.guests) {
													setGuests(guests + 1);
													setLimiteGuests("");
												} else {
													setLimiteGuests(
														"Atingiu o limite máximo de hóspedes!",
													);
												}
											}}
											disabled={guests >= place.guests}
										>
											<Plus />
										</button>
										<button
											className="border-l min-h-full py-2.5 hover:bg-gray-100 rounded-r-2xl px-2.5 h-full cursor-pointer disabled:opacity-25 disabled:cursor-auto"
											onClick={(e) => {
												e.preventDefault();
												if (guests > 1) {
													setGuests(guests - 1);
													setLimiteGuests("");
												} else {
													setLimiteGuests("Mínimo de 1 hóspede!");
												}
											}}
											disabled={guests <= 1}
										>
											<Minus />
										</button>
									</div>
								</div>
							</div>
							{user ? (
								<InteractiveHoverButton
									className="w-fit"
									onClick={handleBooking}
								>
									Reservar comodidade
								</InteractiveHoverButton>
							) : (
								<InteractiveHoverButton
									className=""
									onClick={(e) => {
										e.preventDefault();
										showAuthModal("login");
									}}
								>
									Entre para continuar
								</InteractiveHoverButton>
							)}
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default Place;
