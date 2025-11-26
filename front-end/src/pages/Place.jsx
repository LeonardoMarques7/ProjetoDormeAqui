import axios from "axios";
import {
	Bath,
	Bed,
	BedDouble,
	CalendarArrowUpIcon,
	Expand,
	Home,
	ImagePlus,
	LocateIcon,
	MapPin,
	Users,
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

const Place = () => {
	const { moblie } = useMoblieContext();
	const { id } = useParams();
	const { user } = useUserContext();
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);
	const lightGalleryRef = useRef(null);
	const [redirect, setRedirect] = useState(false);
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [guests, setGuests] = useState(1);
	const [placeHeader, setPlaceHeader] = useState("");
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

	if (guests > place.guests) {
		showMessage(
			`Limite de hóspedes atingido! Nº Máximo de hóspedes (${place.guests} pessoas)`,
			"error"
		);
		setGuests(place.guests);
	}

	if (guests <= 0) {
		showMessage(`Atenção! Nº Mínimo de hóspedes (1 pessoa)`, "error");
		setGuests(1);
	}

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	return (
		<>
			<div
				className={`container__place p-8 w-full bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] `}
			>
				{!moblie && (
					<div className=" py-4 w-fit px-15 bg-white shadow-lg rounded-2xl max-w-full lg:max-w-7xl  mx-auto shadow-primary-500/25 absolute -bottom-12 mt-4 text-gray-500 flex flex-col justify-center items-center gap-5">
						<div className="text-4xl font-bold text-gray-700 ">
							{place.title}
						</div>
						<div className="flex gap-4 items-center">
							<div className="flex gap-2">
								<MapPin />
								<span>{place.city}</span>
							</div>
							<span className="flex gap-2 border-l-1 px-5 items-center">
								<Users size={18} />
								{place.guests} Hóspedes
							</span>
							<span className="flex gap-2 items-center border-l-1  px-5">
								<Home size={18} />2 Quartos
							</span>
							<span className="flex gap-2 items-center border-l-1  px-5">
								<BedDouble size={18} />2 Camas
							</span>
							<span className="flex gap-2 items-center border-l-1  px-5">
								<Bath size={18} />2 Banheiros
							</span>
						</div>
					</div>
				)}
			</div>
			<div className="container__infos lg:max-w-7xl mx-auto flex flex-col gap-2">
				{moblie && (
					<div className="max-w-dvw  mx-auto mt-4 text-gray-500 flex flex-col justify-start items-center gap-5">
						<div className="text-2xl text-center font-bold text-gray-700 ">
							{place.title}
						</div>
						<div className="flex gap-2">
							<MapPin />
							<span>{place.city}</span>
						</div>
					</div>
				)}
				<div
					className={`${
						moblie ? "mt-5" : "mt-20"
					} relative grid sm:grid-cols-[2fr_1fr] aspect-square sm:grid-rows-2 sm:aspect-[3/2] gap-5 overflow-hidden rounded-2xl hover:opacity-95 cursor-pointer`}
				>
					{place.photos
						.filter((photo, index) => index < 3)
						.map((photo, index) => (
							<img
								key={index}
								className={`${
									index === 0 ? "row-span-2 h-full object-center " : ""
								} aspect-square w-full object-cover cursor-pointer hover:opacity-90 transition-opacity sm:object-cover`}
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

				{moblie && (
					<div className="flex flex-wrap gap-2 justify-between items-center">
						<span className="flex gap-2 items-center">
							<Users size={18} />
							{place.guests} Hóspedes
						</span>
						<span className="flex gap-2 items-center ">
							<Home size={18} />2 Quartos
						</span>
						<span className="flex gap-2 items-center ">
							<BedDouble size={18} />2 Camas
						</span>
						<span className="flex gap-2 items-center  ">
							<Bath size={18} />2 Banheiros
						</span>
					</div>
				)}

				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-1 gap-20 md:grid-cols-2">
					<div className="order-2 md:order-none px-4 description sm:px-0">
						<div>
							<p className="sm:text-2xl text-large font-bold">Descrição</p>
							<p
								dangerouslySetInnerHTML={{
									__html: md.render(place.description),
								}}
							></p>
						</div>
						<div className="my-4">
							<p className="sm:text-2xl text-large font-bold">Diferenciais</p>
							<div className="my-2 flex flex-col gap-2">
								{place.perks.map((perk, index) => (
									<div
										key={index}
										className="flex w-fit items-center gap-2 hover:scale-110 ease-in-out duration-500 transition-all px-3 py-2 rounded-xl border-1 border-gray-300"
									>
										<Perk perk={perk} />
									</div>
								))}
							</div>
						</div>
						<div className="my-4">
							<p className="sm:text-2xl text-large font-bold">
								Horário e Restrições
							</p>
							<div className="my-2">
								<span className="flex items-center gap-2">
									<CalendarArrowUpIcon size={20} className="text-primary-500" />{" "}
									Check-in: {place.checkin}
								</span>
								<span className="flex items-center gap-2">
									<CalendarArrowUpIcon size={20} color="gray" />
									Check-out: {place.checkout}
								</span>
							</div>
							<span className="flex gap-2 items-center">
								<Users color="black" size={20} />
								Nº máximo de hóspedes: {place.guests}
							</span>
						</div>
						<div className="bg-primary-100/50 p-4 rounded-md">
							<p className="sm:text-2xl text-large font-bold pb-1">
								Informações Extras
							</p>
							<p>{place.extras}</p>
						</div>
					</div>

					{console.log(booking)}

					{/* Booking */}
					{booking ? (
						<></>
					) : (
						<form className="form__place order-1 md:order-none justify-self-end border-1 self-start sticky top-20 flex flex-col  gap-4 border-gray-200 rounded-2xl p-10">
							<h2 className="font-bold">Faça sua reserva</h2>
							<p className="max-sm:text-xl text-2xl sm:text-start text-gray-600">
								Preço:{" "}
								<span className="font-bold text-primary-500">
									R$ {place.price}
								</span>{" "}
								por noite
							</p>
							{/* Checkin e Checkout */}
							<div className="column__check flex justify-center sm:justify-start">
								<div className="flex flex-col gap-4">
									{/* Check-in */}
									<div className="">
										<p className="font-bold mb-2">Check-in</p>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full cursor-pointer justify-start text-left max-w-xl font-normal",
														!checkin && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{checkin ? (
														format(checkin, "dd/MM/yyyy")
													) : (
														<span>Selecione data de Check-in</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={checkin}
													onSelect={handleCheckin}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>

									{/* Check-out */}
									<div className="py-2">
										<p className="font-bold mb-2">Check-out</p>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-fit cursor-pointer  justify-start text-left font-normal",
														!checkout && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{checkout ? (
														format(checkout, "dd/MM/yyyy")
													) : (
														<span>Selecione data de Check-out</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={checkout}
													onSelect={handleCheckout}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							</div>

							{/* Hóspedes */}
							<div className="py-2 flex flex-col gap-2 justify-center sm:mx-auto sm:w-full ">
								<p className="font-bold px-3 sm:px-0">Nº Hóspedes</p>
								<input
									type="number"
									value={guests ? guests : 1}
									placeholder="2"
									min={1}
									max={place.guests}
									className="border border-primay-200 w-20 rounded-2xl px-4 py-2"
									onChange={(e) => {
										setGuests(e.target.value);
									}}
								/>
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
