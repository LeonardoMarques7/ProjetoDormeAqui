import {
	CalendarArrowDown,
	CalendarArrowUp,
	DollarSign,
	MapPin,
	Moon,
	TicketIcon,
	User,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import imageDormeAqui from "../assets/logo__primary.png";
import imageQrCode from "../assets/qrcode_leonardomdev.png";
import "./Booking.css";

import Marquee from "react-fast-marquee";

const BookingAll = ({ booking, place = false }) => {
	const { action } = useParams();
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => setIsMoblie(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="section__booking bg-white backdrop-blur-2xl mx-auto lg:max-w-5xl shadow-xl shadow-primary-200/50 rounded-2xl">
			<Link
				to={`/place/${booking.place._id}`}
				key={booking.place._id}
				className="ticket__booking bg-white/80 relative cursor-pointer pointer-events-none flex rounded-2xl border  border-primary-100 gap-5 "
			>
				<div className="flex flex-col items-start gap-2 w-full  text-gray-500 p-5">
					<div className="flex flex-col gap-1 w-full text-start header__ticket">
						<h5 className="text-primary-600 font-medium uppercase">
							Seu Ticket de Reserva
						</h5>
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
							<span className="flex gap-5  items-start flex-col">
								<span className="item-3 flex gap-2 flex-col items-start">
									<p className="uppercase ">Anfitrião</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<User size={18} className="text-primary-500" />
										{booking.place.owner.name}
									</p>
								</span>
								<span className="item-1 flex gap-2 flex-col items-start">
									<p className="uppercase ">Hóspede</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<User size={18} className="text-primary-500" />
										{booking.user.name}
									</p>
								</span>
							</span>
							<span className="flex gap-5 items-start flex-col">
								<span className="item-2 flex gap-2  flex-col items-start">
									<p className="uppercase ">Check-in</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<CalendarArrowUp size={18} className="text-primary-500" />
										{new Date(booking.checkin).toLocaleDateString("pt-br")}
									</p>
								</span>
								<span className="item-4 flex gap-2  flex-col items-start">
									<p className="uppercase ">Check-out</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<CalendarArrowDown size={20} className="text-primary-500" />
										{new Date(booking.checkout).toLocaleDateString("pt-br")}
									</p>
								</span>
							</span>
							<span className="flex gap-5  items-start flex-col">
								<span className="item-5 flex gap-2 flex-col items-start">
									<p className="uppercase ">Noites</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<Moon size={18} className="text-primary-500" />
										{booking.nights}
									</p>
								</span>
								<span className="flex gap-2 item-6  flex-col items-start">
									<p className="uppercase ">Nº máximo de hóspedes</p>
									<p className="flex items-center gap-2 text-gray-700 font-medium">
										<Users size={18} className="text-primary-500" />
										{booking.guests}
									</p>
								</span>
							</span>
						</div>
					</div>
				</div>
				<div className="container__qrcode m-2 bg-primary-100/5  backdrop-blur-lg p-4 border-3 rounded-2xl min-h-full w-100 border-dashed flex items-center justify-center flex-col">
					<img src={imageDormeAqui} alt="Logo do DormeAqui" className="w-50" />
					<div className="relative">
						<img src={imageQrCode} alt="" className="w-50" />
						<div className="absolute -bottom-1 text-sm text-gray-500 text-center w-full left-0">
							EasterEgg
						</div>
					</div>
					<span className="flex  items-center flex-col ">
						<p className="text-primary-500 font-bold">Valor total </p>
						{booking.priceTotal?.toLocaleString("pt-BR", {
							style: "currency",
							currency: "BRL",
						})}
					</span>
				</div>
				<span className="footer__ticket hidden max-w-full w-fit">
					<Marquee className="marquee" speed={50} loop={false}>
						<strong>Fim do seu Ticket</strong>
						<code>/</code>
						<strong>Fim do seu Ticket </strong>
						<code>/</code>
						<strong>Fim do seu Ticket </strong>
						<code>/</code>
					</Marquee>
				</span>
			</Link>
		</div>
	);
};

export default BookingAll;
