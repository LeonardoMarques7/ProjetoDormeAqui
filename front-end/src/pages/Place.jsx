import axios from "axios";
import {
	CalendarArrowUpIcon,
	Expand,
	ImagePlus,
	LocateIcon,
	MapPin,
	Users,
} from "lucide-react";
import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useParams } from "react-router-dom";
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

const Place = () => {
	const { id } = useParams();
	const { user } = useUserContext();
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);
	const lightGalleryRef = useRef(null);
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [guests, setGuests] = useState("");

	useEffect(() => {
		if (id) {
			const axiosGet = async () => {
				const { data } = await axios.get(`/places/${id}`);

				console.log(data);
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

	const handleBooking = (e) => {
		e.preventDefault();

		if (checkin && checkout && guests) {
			console.log("Fez a reserva");
		} else {
			showMessage("Complete todas as informações", "warning");
		}
	};

	if (!place) return <></>;

	return (
		<section>
			<div className="sm:px-8 max-w-7xl mx-auto flex flex-col gap-4">
				{/* Títulos da acomodação */}
				<div className="flex flex-col gap-2">
					<div className="sm:text-2xl text-large font-bold">{place.title}</div>
					<div className="flex gap-2">
						<MapPin />
						<span>{place.city}</span>
					</div>
				</div>

				{/* Imagens da acomodação */}
				<div className="relative grid sm:grid-cols-[2fr_1fr] aspect-square sm:grid-rows-2 sm:aspect-[3/2] gap-5 overflow-hidden rounded-2xl hover:opacity-95 cursor-pointer">
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

				{/* Conteúdo da acomodação */}
				<div className="grid grid-cols-1 md:grid-cols-2">
					<div className="order-2 md:order-none px-4 description sm:px-0">
						<div>
							<p className="sm:text-2xl text-large font-bold">Descrição</p>
							<p>{place.description}</p>
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
								Nº máximo de convidados: {place.guests}
							</span>
						</div>
						<div className="bg-primary-100/50 p-4 rounded-md">
							<p className="sm:text-2xl text-large font-bold pb-1">
								Informações Extras
							</p>
							<p>{place.extras}</p>
						</div>
					</div>

					<form className="form__place order-1 md:order-none sm:border-0 justify-self-end self-start sticky top-4 flex flex-col gap-4 border-gray-200 border rounded-2xl px-8 sm:px-0 py-4 ">
						<p className="sm:text-2xl text-large font-bold text-center sm:text-start">
							Preço: R$ {place.price} por noite
						</p>
						{/* Checkin e Checkout */}
						<div className="column__check flex justify-center sm:justify-start">
							<div className="border border-primay-200 rounded-tl-2xl rounded-bl-2xl px-4 py-2">
								<p className="font-bold">Check-in</p>
								<input
									type="date"
									value={checkin}
									onChange={(e) => {
										setCheckin(e.target.value);
									}}
								/>
							</div>
							<div className="border border-primay-200 border-l-0 rounded-tr-2xl rounded-br-2xl px-4 py-2">
								<p className="font-bold">Check-out</p>
								<input
									type="date"
									value={checkout}
									onChange={(e) => {
										setCheckout(e.target.value);
									}}
								/>
							</div>
						</div>

						{/* Convidados */}
						<div className="py-2 flex flex-col gap-2 justify-center sm:mx-auto sm:w-full ">
							<p className="font-bold px-3 sm:px-0">Nº Convidados</p>
							<input
								type="number"
								value={guests}
								placeholder="2"
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
				</div>
			</div>
		</section>
	);
};

export default Place;
