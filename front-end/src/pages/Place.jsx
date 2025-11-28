import axios from "axios";
import {
	Bath,
	BathIcon,
	Bed,
	BedDouble,
	CalendarArrowDown,
	CalendarArrowUpIcon,
	ChevronRight,
	Clock,
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
			showMessage("Você possue uma reserva nesta acomodação!", "error");
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
			<div
				className="bg-cover bg-primar-700 max-w-7xl mx-auto w-full rounded-b-2xl bg-center h-[50svh] relative overflow-hidden"
				style={{
					backgroundImage: `url(${Banner})`,
					rotate: "10",
				}}
			>
				<div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-primary-500/70 via-primary-500/50 to-transparent"></div>
				{/* Conteúdo */}
				<div className="relative flex flex-col justify-center items-center h-full gap-4">
					<h1 className="font-bold text-5xl text-white drop-shadow-lg">
						{place.title}
					</h1>
					<div className=" px-0  text-center flex justify-center items-center flex-col w-full">
						<div className="flex gap-4 items-center justify-start text-white mt-4 max-w-auto">
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Users2 size={15} />
									<div className="text-sm">{place.guests} Hóspedes</div>
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-200"></div>
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
							<div className="w-1 rounded-full h-1 bg-gray-200"></div>
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
							<div className="w-1 rounded-full h-1 bg-gray-200"></div>
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<BathIcon size={15} />
									{place.bathrooms || bathrooms > 1 ? (
										<p className="text-sm ">
											<span className="mr-2">{place.bathrooms}</span> Banheiros
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
				</div>
			</div>
			<div className="container__infos lg:max-w-7xl mx-auto flex flex-col gap-2">
				<div
					className={`-mt-20 bg-white p-2 relative grid sm:grid-cols-[2fr_1fr] mx-4  aspect-square sm:grid-rows-2 sm:aspect-[3/2] gap-5 overflow-hidden rounded-2xl hover:opacity-95 cursor-pointer`}
				>
					{place.photos
						.filter((photo, index) => index < 3)
						.map((photo, index) => (
							<img
								key={index}
								className={`${
									index === 0 ? "row-span-2 h-full object-center " : ""
								} aspect-square w-full rounded-2xl  object-cover cursor-pointer hover:saturate-150 transition-opacity sm:object-cover`}
								src={photo}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(index)}
							/>
						))}
					<span
						className="absolute bottom-2 items-center right-2 flex px-2 py-2 rounded-[10px] gap-2 bg-white/70 hover:scale-105 hover:-translate-x-1 ease-in-out duration-300 hover:bg-primary-300 cursor-pointer"
						onClick={handleShowMoreClick}
					>
						<ImagePlus /> Mostrar mais fotos
					</span>
				</div>

				{/* LightGallery - invisível, usado apenas para controlar a galeria */}
				<LightGallery
					onInit={(detail) => {
						lightGalleryRef.current = detail.instance;
					}}
					speed={500}
					plugins={[lgThumbnail, lgZoom, lgFullscreen]}
					dynamic={true}
					dynamicEl={place.photos.map((photo) => ({
						src: photo,
						thumb: photo,
						subHtml: `<h4>${place.title}</h4>`,
					}))}
					closable={true}
					showCloseIcon={true}
					counter={true}
				/>
				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-1 gap-20 md:grid-cols-2 mx-8">
					<div className="order-2 leading-relaxed px-0 md:order-none description  	">
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
										<Bed size={15} />
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

					{console.log(booking)}

					{/* Booking */}
					{booking ? (
						<></>
					) : (
						<form className="form__place order-1 w-full md:order-none justify-self-end self-start sticky top-20 bottom-20 flex flex-col gap-4 rounded-2xl p-10">
							<div className="border-l-2 border-primary-400 p-4">
								<p className="max-sm:text-xl text-2xl sm:text-start text-gray-600">
									<p className="uppercase text-sm">preço</p>
									<span className="font-light text-5xl text-primary-500">
										R$ {place.price}
									</span>{" "}
									<p className="text-sm">por noite</p>
								</p>
							</div>
							{/* Checkin e Checkout */}
							<div className="column__check flex justify-center sm:justify-start">
								<div className="flex items-center gap-4 w-full">
									{/* Check-in */}
									<div className="">
										<p className="font-medium text-xl mb-2">Check-in</p>
										<Calendar
											mode="single"
											selected={checkin} // já começa selecionado
											onSelect={setCheckin}
											initialFocus
										/>
									</div>

									{/* Check-out */}
									<div className="py-2">
										<p className="font-medium text-xl mb-2">Check-out</p>

										<Calendar
											mode="single"
											selected={checkout}
											onSelect={setCheckout}
											initialFocus
										/>
									</div>
								</div>
							</div>

							{/* Hóspedes */}
							{/* Hóspedes */}
							<div className="py-2 flex flex-col gap-2 justify-center sm:mx-auto sm:w-full ">
								<p className="font-bold px-3 sm:px-0">Hóspedes</p>
								<div className="flex items-center text-center justify-center p-0 h-full w-fit border rounded-2xl">
									<div
										className="flex items-center pr-6 grow text-center w-full
									"
									>
										<input
											className="outline-1 h-11 rounded-l-2xl w-10 mr-4 px-4"
											type="number "
											id="quantity-input"
											placeholder="1"
											required
											value={guests}
											readOnly
										/>
										<p className="max-w-20 w-20">
											{guests > 1 ? <>Hóspedes</> : <>Hóspede</>}
										</p>
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
