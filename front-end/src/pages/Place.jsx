import axios from "axios";
import {
	Bath,
	BathIcon,
	Bed,
	BedDouble,
	CalendarArrowDown,
	CalendarArrowUp,
	CalendarArrowUpIcon,
	ChevronRight,
	Clock,
	Edit2,
	Expand,
	ExternalLink,
	Home,
	HomeIcon,
	House,
	ImagePlus,
	LocateIcon,
	MapPin,
	Minus,
	Plus,
	User,
	Users,
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
import Perk from "../components/Perk";
import "./Place.css";
import imageQrCode from "../assets/qrcode_leonardomdev.png";
import imageDormeAqui from "../assets/logo__primary.png";
import { format, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { toast } from "sonner";
import BookingAlert from "../components/BookingAlert";
import { useMoblieContext } from "../components/contexts/MoblieContext";
import MarkdownIt from "markdown-it";
import Perks from "../components/Perks";
import Banner from "../assets/banner2.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import RotatingText from "@/components/RotatingText";
import { Timeline } from "@mantine/core";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import Counter from "@/components/Counter";
import photoDefault from "../assets/loadingGif2.gif";

// IMPORTE O NOVO COMPONENTE AQUI
import DatePickerAirbnb from "../components/DatePickerAirbnb";

const Place = () => {
	const { moblie } = useMoblieContext();
	const { id } = useParams();
	const { user } = useUserContext();
	const [login, setLogin] = useState(false);
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);
	const lightGalleryRef = useRef(null);
	const [redirect, setRedirect] = useState(false);
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
	const [loading, setLoading] = useState(false);

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
					})[0]
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
				} catch (error) {
					console.error("Erro ao buscar lugar:", error);
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
		if (id) {
			const axiosGetOwner = async () => {
				const { data } = await axios.get(`/places/owner/${place.owner}`);

				setOwner(data);
			};

			axiosGetOwner();
		}
	}, [id]);

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
				total: place.price * nights,
				checkin,
				checkout,
				guests,
				nights,
			};

			const { data } = await axios.post("/bookings", objBooking);

			setRedirect(true);
		} else {
			showMessage("Insira todas as informações!", "warning");
		}
	};

	if (redirect) return <Navigate to={`/account/bookings`} />;

	// Função para lidar com a seleção de datas do novo componente
	const handleDateSelect = ({ checkin: newCheckin, checkout: newCheckout }) => {
		setCheckin(newCheckin);
		setCheckout(newCheckout);
	};

	if (loading) {
		return (
			<div className="container__infos mx-auto max-w-7xl flex flex-col gap-2">
				<div className="bg-primary-900 shadow-none max-sm:p-0 max-sm:shadow-none max-h-full mt-25 max-sm:mt-15 py-5 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center rounded-4xl  relative overflow-hidden">
					<div className="bg-white max-sm:shadow-none p-2 max-sm:p-0 relative mx-4 max-sm:mx-0 max-sm:rounded-none rounded-2xl cursor-pointer">
						{/* Container do grid principal */}
						<div className="grid relative  grid-cols-4 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2  max-sm:h-[50svh]">
							{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
							<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover hover:saturate-150 transition-all"
									src={photoDefault}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</div>

							{/* Imagem superior direita */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover hover:saturate-150 transition-all"
									src={photoDefault}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</div>

							{/* Imagem superior direita extrema */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2">
								<img
									className="w-full h-full border aspect-video rounded-2xl object-cover hover:saturate-150 transition-all"
									src={photoDefault}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</div>
							{moblie ? null : (
								<>
									<div className="col-span-1 row-span-1 max-sm:col-span-4">
										<img
											className="w-full h-full border aspect-video rounded-2xl object-cover hover:saturate-150 transition-all"
											src={photoDefault}
											alt="Imagem da acomodação"
											onClick={() => handleImageClick(3)}
										/>
									</div>

									<div className="col-span-1 row-span-1">
										<img
											className="w-full h-full border aspect-video rounded-2xl object-cover hover:saturate-150 transition-all"
											src={photoDefault}
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
				<div className="grid grid-cols-1 max-sm:gap-5 gap-20 md:grid-cols-2 mt-2 max-sm:mx-2 mx-8 ">
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
											src={photoDefault}
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

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	let rooms = 1;
	let beds = 2;
	let bathrooms = 1;

	if (login) return <Navigate to={`/login`} />;

	return (
		<>
			<LightGallery
				onInit={(detail) => {
					lightGalleryRef.current = detail.instance;
				}}
				speed={500}
				plugins={[lgThumbnail, lgZoom, lgFullscreen]}
				dynamic
				dynamicEl={place.photos.map((photo) => ({
					src: photo,
					thumb: photo,
				}))}
			/>

			{/* Place */}

			<div className="container__infos mx-auto max-w-7xl flex flex-col gap-2">
				<div className="bg-primary-900 shadow-2xl max-sm:p-0 max-sm:shadow-none max-h-full mt-25 max-sm:mt-15 py-5 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center rounded-4xl  relative overflow-hidden">
					<div className="bg-white max-sm:shadow-none p-2 max-sm:p-0 relative mx-4 max-sm:mx-0 max-sm:rounded-none rounded-2xl cursor-pointer">
						{/* Container do grid principal */}
						<div className="grid relative  grid-cols-4 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2  max-sm:h-[50svh]">
							{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
							<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all"
									src={place.photos[0]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</div>

							{/* Imagem superior direita */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all"
									src={place.photos[1]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</div>

							{/* Imagem superior direita extrema */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all"
									src={place.photos[2]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</div>
							{moblie ? null : (
								<>
									<div className="col-span-1 row-span-1 max-sm:col-span-4">
										<img
											className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all"
											src={place.photos[3]}
											alt="Imagem da acomodação"
											onClick={() => handleImageClick(3)}
										/>
									</div>

									<div className="col-span-1 row-span-1">
										<img
											className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all"
											src={place.photos[4] || photoDefault}
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
				</div>
				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-1 max-sm:gap-5 gap-20 md:grid-cols-2 mt-2 max-sm:mx-2 mx-8 ">
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
							<div className="flex flex-col  gap-2">
								<div className="text-[2rem] max-sm:text-[1.5rem] font-bold text-gray-700 ">
									{place.title}
								</div>
								<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
									<MapPin size={13} />
									<span>{place.city}</span>
								</div>
							</div>
							<div className="flex gap-4  !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto">
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
						</div>
						<div className="flex gap-2 flex-col my-2.5 max-sm:mt-2  ">
							<div className="flex items-center gap-2 w-full">
								<Link
									to={`/account/profile/${place.owner._id}`}
									className="flex items-center group max-sm:w-full hover:bg-primary-100 hover:px-5 py-5 transition-all w-full ransition-all rounded-2xl cursor-pointer gap-2.5 justify-between "
								>
									<div className="flex items-center font-normal  gap-2.5">
										<img
											src={place.owner.photo}
											className="w-12 h-12  aspect-square rounded-full object-cover"
											alt="Foto do Usuário"
										/>
										<div className="flex flex-col text-gray-700 ">
											<p className="font-medium">{place.owner.name}</p>
											<small>
												Anfitrião desde{" "}
												<span className="text-primary-600 font-medium">
													10/04/2025
												</span>
											</small>
										</div>
									</div>
									<ChevronRight size={15} className="text-primary-300 mr-1" />
								</Link>
							</div>
						</div>
						<div className="border  border-r-0 py-5 mb-5 border-l-0">
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
										)
								)}
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
					</div>

					{console.log("Este é log: ", booking)}

					{/* Booking */}
					{booking ? (
						<div className="section__booking h-fit bg-white backdrop-blur-2xl ml-auto lg:max-w-5xl shadow-xl shadow-primary-200/50 rounded-2xl">
							<div className="ticket__booking h-fit bg-white/80 relative cursor-pointer flex rounded-2xl border  border-primary-100 gap-5 ">
								<div className="flex flex-col items-start gap-2 w-full  text-gray-500 p-5">
									<div className="flex flex-col gap-1 w-full text-start header__ticket">
										<div className="text-primary-600 flex justify-between items-center text-sm font-medium uppercase">
											Seu Ticket de Reserva
											<Link
												to={`../account/bookings/${booking._id}`}
												className="group cursor-pointer -fit hover:bg-primary-600 hover:text-white px-5 hover:px-6 justify-center flex items-center gap-0 hover:gap-3 ease-in-out duration-300 rounded-2xl text-center py-2 overflow-hidden"
											>
												<span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
													Acessar reserva
												</span>
												<ExternalLink
													size={18}
													className="transition-transform text-primary-500 group-hover:text-white duration-300 group-hover:scale-110"
												/>
											</Link>
										</div>
										<h2 className="text-2xl font-bold text-black">
											{booking.place.title}
										</h2>
										<p className="items-center location__ticket flex gap-2">
											<MapPin size={18} /> {booking.place.city}
										</p>
										<hr className="mb-0 mt-3 w-full border-gray-200" />
									</div>
									<div className="grow">
										<div className="flex gap-6 infos__ticket my-2">
											<span className="gap-5 items-start flex">
												<span className="item-2 flex gap-2  flex-col items-start">
													<p className=" ">Check-in</p>
													<p className="flex items-center gap-2 text-gray-700 font-medium">
														<CalendarArrowUp
															size={18}
															className="text-primary-500"
														/>
														{new Date(booking.checkin).toLocaleDateString(
															"pt-br"
														)}
													</p>
												</span>
												<span className="item-4 flex gap-2  flex-col items-start">
													<p className=" ">Check-out</p>
													<p className="flex items-center gap-2 text-gray-700 font-medium">
														<CalendarArrowDown
															size={20}
															className="text-primary-500"
														/>
														{new Date(booking.checkout).toLocaleDateString(
															"pt-br"
														)}
													</p>
												</span>
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<form className="form__place max-sm:relative max-sm:p-0  max-sm:w-full order-2   w-full  justify-self-end self-start sticky top-20 bottom-20 flex flex-col gap-4 rounded-2xl p-10">
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
														"Atingiu o limite máximo de hóspedes!"
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
									className="w-fit z-10"
									onClick={(e) => {
										e.preventDefault();
										setLogin(true);
									}}
								>
									Entre para continuar
								</InteractiveHoverButton>
							)}
						</form>
					)}
				</div>
			</div>
		</>
	);
};

export default Place;
