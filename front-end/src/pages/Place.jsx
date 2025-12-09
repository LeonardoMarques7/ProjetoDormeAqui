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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { toast } from "sonner";
import BookingAlert from "../components/BookingAlert";
import { useMoblieContext } from "../components/contexts/MoblieContext";
import MarkdownIt from "markdown-it";
import Perks from "../components/Perks";
import Banner from "../assets/banner.png";
import { Timeline } from "@mantine/core";

const Place = () => {
	const { moblie } = useMoblieContext();
	const { id } = useParams();
	const { user } = useUserContext();
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
				const { data } = await axios.get(`/places/${id}`);

				setPlace(data);
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

	const handleCheckin = (date) => {
		setCheckin(date);
		// Se já tinha checkout selecionado mas é antes do novo checkin → reseta checkout
		if (checkout && isBefore(checkout, date)) {
			setCheckout(null);
			showMessage("Insira uma data válida!", "error");
		} else {
		}
	};

	const handleCheckout = (date) => {
		if (checkin && isBefore(date, checkin)) {
			showMessage("Insira uma data válida!", "error");
			return;
		}
		setCheckout(date);
	};

	if (!place) return <></>;

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
				dynamicEl={place.photos.map((photo) => ({
					src: photo,
					thumb: photo,
				}))}
			/>

			<div className="container__infos mx-auto max-w-7xl flex flex-col gap-2">
				<div className="bg-primary-900 shadow-2xl max-h-full mt-25 py-5 max-w-full mx-auto w-full object-cover bg-center rounded-4xl h-full relative overflow-hidden">
					<div className=" bg-white p-2 relative mx-4 rounded-2xl  cursor-pointer">
						{/* Container do grid principal */}
						<div className="grid grid-cols-3 grid-rows-1 gap-2 aspect-[4/3] ">
							{/* Foto grande no topo esquerdo - ocupa 2 colunas e 1 linha */}
							<div className="col-span-2 row-span-1">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150  transition-all duration-300 not-hover:grayscale-30"
									src={place.photos[0]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</div>

							{/* Primeira foto vertical direita - ocupa 1 coluna e 1 linha */}
							<div className="col-span-1 row-span-1">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all not-hover:grayscale-30"
									src={place.photos[1]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</div>

							{/* Primeira foto retangular embaixo esquerda */}
							<div className="col-span-1 row-span-1 aspect-square	">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all not-hover:grayscale-30"
									src={place.photos[2]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</div>

							{/* Segunda foto retangular embaixo meio */}
							<div className="col-span-1 row-span-1 aspect-square">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all not-hover:grayscale-30"
									src={place.photos[3]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(3)}
								/>
							</div>

							{/* Segunda foto vertical direita */}
							<div className="col-span-1 row-span-1 aspect-square">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:saturate-150 transition-all not-hover:grayscale-30"
									src={place.photos[4]}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(4)}
								/>
							</div>
						</div>

						{/* Botão de mostrar mais fotos */}
						<span
							className="absolute bottom-4 right-4 flex items-center px-3 py-2 rounded-[10px] gap-2 bg-white/70 hover:scale-105 hover:-translate-x-1 ease-in-out duration-300 hover:bg-primary-300 cursor-pointer"
							onClick={handleShowMoreClick}
						>
							<Expand /> Expandir fotos
						</span>
					</div>
				</div>
				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-1 gap-20 md:grid-cols-2 mx-8">
					<div className="order-2 leading-relaxed px-0 md:order-none description ">
						<div className=" py-4 px-0  w-full">
							<div className="flex flex-col  gap-2">
								<div className="text-4xl font-bold text-gray-700 ">
									{place.title}
								</div>
								<div className="flex items-center text-gray-600 gap-2">
									<MapPin size={15} />
									<span>{place.city}</span>
								</div>
							</div>
							<div className="flex gap-4 items-center justify-start mt-4 max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Users2 size={15} />
										<div className="text-sm">{place.guests} Hóspedes</div>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<HomeIcon size={15} />
										{place.rooms || rooms > 1 ? (
											<p className="text-sm">
												<span className="">{place.rooms}</span> Quartos
											</p>
										) : (
											<p className="text-sm">
												<span className="">{place.rooms}</span> Quarto
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Bed size={15} />
										{place.beds || beds > 1 ? (
											<p className="text-sm">
												<span className="">{place.beds}</span> Camas
											</p>
										) : (
											<p className="text-sm">
												<span className="">{place.beds}</span> Cama
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<Bath size={15} />
										{place.bathrooms || bathrooms > 1 ? (
											<p className="text-sm ">
												<span className="mr-2">{place.bathrooms}</span>{" "}
												Banheiros
											</p>
										) : (
											<p className="text-sm">
												<span className="">{place.bathrooms}</span> Banheiro
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="flex gap-2 flex-col mb-5 ">
							<div className="flex items-center gap-2 w-full">
								<Link
									to={`/account/profile/${place.owner._id}`}
									className="flex items-center group hover:bg-primary-100 hover:px-5 py-5 transition-all w-full ransition-all rounded-2xl cursor-pointer gap-2.5 justify-between "
								>
									<div className="flex items-center  gap-2.5">
										<img
											src={place.owner.photo}
											className="w-12 h-12  aspect-square rounded-full object-cover"
											alt="Foto do Usuário"
										/>
										<div className="flex flex-col text-gray-700 ">
											<h4>{place.owner.name}</h4>
											<small>
												Anfitrião desde{" "}
												<strong className="text-primary-600">10/04/2025</strong>
											</small>
										</div>
									</div>
									<div className="opacity-0 flex bg-white/50 p-2 px-4 rounded-2xl items-center gap-2.5 group-hover:opacity-100">
										<ExternalLink size={15} className="  text-gray-500 " />
										<p>Acessar perfil</p>
									</div>
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
							<div className="my-2 flex items-center gap-5">
								<div className="flex bg-gray-50 w-fit items-center px-8 py-4 rounded-2xl gap-2.5">
									<Clock size={15} /> Check-in: {place.checkin}
								</div>
								<div className="flex bg-gray-50 w-fit items-center px-8 py-4 rounded-2xl gap-2.5">
									<Clock size={15} color="gray" />
									Check-out: {place.checkout}
								</div>
							</div>
						</div>
						<div className="mb-25">
							<p
								className="flex flex-col text-gray-700 gap-3 pt-2.5"
								dangerouslySetInnerHTML={{
									__html: md.render(place.extras),
								}}
							></p>
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
						<form className="form__place order-1 w-full md:order-none justify-self-end self-start sticky top-20 bottom-20 flex flex-col gap-4 rounded-2xl p-10">
							<div className="border-l-2 border-primary-400 p-4">
								<div className="max-sm:text-xl text-2xl sm:text-start text-gray-600">
									<p className="uppercase text-sm">preço</p>
									<span className="font-light text-5xl text-primary-500">
										R$ {place.price}
									</span>{" "}
									<p className="text-sm">por noite</p>
								</div>
							</div>
							{/* Checkin e Checkout */}
							<div className="column__check flex justify-start sm:justify-start">
								<div className="flex items-center gap-4 w-full">
									{/* Check-in */}
									<div className="">
										<p className="font-medium text-xl mb-2">Check-in</p>
										<Calendar
											mode="single"
											selected={checkin} // já começa selecionado
											onSelect={handleCheckin}
											initialFocus
										/>
									</div>

									{/* Check-out */}
									<div className="py-2">
										<p className="font-medium text-xl mb-2">Check-out</p>

										<Calendar
											mode="single"
											selected={checkout}
											onSelect={handleCheckout}
											initialFocus
										/>
									</div>
								</div>
							</div>

							{/* Hóspedes */}
							{/* Hóspedes */}
							<div className="py-2 flex flex-col gap-4 justify-center sm:mx-auto sm:w-full ">
								<div
									className="
								"
								>
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
									<div
										className="flex items-center grow text-center w-full
									"
									>
										<input
											className="outline-1 h-11 rounded-l-2xl w-10 px-4"
											type="number "
											id="quantity-input"
											placeholder="1"
											required
											value={guests}
											readOnly
										/>
									</div>
									<div className="flex items-center">
										<button
											className="border-l py-2.5 hover:bg-gray-100  px-2.5 h-full cursor-pointer disabled:opacity-25 disabled:cursor-auto"
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
											className={` border-l min-h-full py-2.5 hover:bg-gray-100 rounded-r-2xl px-2.5 h-full cursor-pointer disabled:opacity-25 disabled:cursor-auto`}
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
								<button
									onClick={handleBooking}
									className="text-center font-bold rounded-full text-xl cursor-pointer w-full py-2 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300"
								>
									Reservar
								</button>
							) : (
								<Link
									to={"/login"}
									className="text-center font-bold rounded-full text-xl cursor-pointer w-full py-2 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300"
								>
									Entre para continuar
								</Link>
							)}
						</form>
					)}
				</div>
			</div>
		</>
	);
};

export default Place;
