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
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import imageDormeAqui from "../assets/logo__primary.png";
import imageQrCode from "../assets/qrcode_leonardomdev.png";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

import { useMobileContext } from "./contexts/MobileContext";
import "./Booking.css";

import Marquee from "react-fast-marquee";
import Status from "./Status";

const BookingAll = ({ bookingsArray, bookingId }) => {
	const [mobile, setIsMobile] = useState(window.innerWidth <= 768);
	const navigate = useNavigate();

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Reordena o array para que o booking com o ID do param apareça primeiro
	const sortedBookings = [...bookingsArray].sort((a, b) => {
		if (bookingId) {
			if (a._id === bookingId) return -1;
			if (b._id === bookingId) return 1;
		}
		return 0;
	});

	// Filtra bookings válidos (com place e user não nulos)
	const validBookings = sortedBookings.filter(
		(booking) => booking && booking.place && booking.user
	);

	function formatarData(dataISO) {
		const data = new Date(dataISO);
		return data.toLocaleDateString("pt-BR");
	}

	return (
		<>
			{validBookings.map((booking) => (
				<div
					key={booking._id}
					className="  max-sm:flex-col bg-white/80 h-fit relative w-full flex-1 flex rounded-3xl border  border-primary-100 gap-5 "
				>
					<div className="w-125 h-90 max-sm:aspect-square max-sm:w-full max-sm:h-full ">
						<img
							src={booking.place.photos[0]}
							alt={booking.place.title}
							className="object-cover w-full h-full max-sm:rounded-3xl max-sm:rounded-b-none rounded-l-3xl"
						/>
					</div>
					<div className="p-4 mr-4 max-sm:py-0 flex flex-col justify-between w-full">
						<div className="">
							<div className="flex justify-between max-sm:mb-3 leading-5">
								<p className="text-[1.2rem] font-light text-gray-900">
									{booking.place.title}
								</p>
								<span className="px-4 max-sm:hidden py-2 h-fit border rounded-md text-xs">
									ID: {booking.place._id.slice(0, 8)}
								</span>
							</div>
							<div className="flex items-center gap-4">
								<div className="flex items-center flex-1 gap-1 text-xs w-full text-gray-600">
									<MapPin size={14} />
									<span>{booking.place.city}</span>
								</div>
							</div>
							<div className="mt-5 ">
								<div className="leading-5 flex justify-start gap-8 flex-1 w-full">
									<span className="text-[1rem] max-sm:text-sm uppercase flex flex-col gap-1 font-light text-gray-900">
										<small>Check-In</small> {formatarData(booking.checkin)}
									</span>
									<span className="text-[1rem]  max-sm:text-sm uppercase flex flex-col gap-1 font-light text-gray-900">
										<small>Check-out</small> {formatarData(booking.checkout)}
									</span>
									<span className="text-[1rem]  max-sm:text-sm uppercase flex flex-col gap-1 font-light text-gray-900">
										<small>Hóspedes</small> {booking.guests}
									</span>
								</div>
							</div>
						</div>
						<div className="mt-4 border-t flex max-sm:flex-col max-sm:items-start items-center py-4">
							<div className="flex flex-col max-sm:pb-4 flex-1">
								<div className="flex items-baseline flex-col gap-1">
									<span className="text-2xl font-normal text-gray-900">
										R$ {booking.price},00
									</span>
									<div className="flex items-center gap-2">
										<p className="font-light text-gray-700">
											{booking.nights} noites
										</p>
										<span className="w-1 h-1 bg-primary-400 rounded-full"></span>
										<p className="font-light text-gray-700">
											R$ {booking.place.price}/noite
										</p>
									</div>
								</div>
							</div>
							<InteractiveHoverButton
								className="w-fit rounded-xl max-sm:w-full text-center font-medium"
								onClick={(e) => {
									e.preventDefault();
									navigate(`/places/${booking.place._id}`);
								}}
							>
								Acessar acomodação
							</InteractiveHoverButton>
						</div>
					</div>
				</div>
			))}
		</>
	);
};

export default BookingAll;
