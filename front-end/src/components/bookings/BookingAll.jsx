import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

import "./Booking.css";

import Review from "@/components/reviews/Review";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import CancelButton from "@/components/bookings/CancelButton";

const BookingAll = ({ bookingsArray, bookingId, onBookingCanceled }) => {
	const [sortOrder, setSortOrder] = useState("closest"); // 'closest' or 'furthest'
	const navigate = useNavigate();

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Reordena o array para que o booking com o ID do param apareça primeiro, depois por data
	const sortedBookings = [...bookingsArray].sort((a, b) => {
		if (bookingId) {
			if (a._id === bookingId) return -1;
			if (b._id === bookingId) return 1;
		}
		// Sort by checkin date
		const dateA = new Date(a.checkin);
		const dateB = new Date(b.checkin);
		if (sortOrder === "closest") {
			return dateA - dateB; // Ascending: closest first
		} else {
			return dateB - dateA; // Descending: furthest first
		}
	});

	// Filtra bookings válidos (com place e user não nulos)
	const validBookings = sortedBookings.filter(
		(booking) => booking && booking.place && booking.user,
	);

	function formatarData(dataISO) {
		const data = new Date(dataISO);
		return data.toLocaleDateString("pt-BR");
	}

	return (
		<>
			{/* Filter Controls */}
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => setSortOrder("closest")}
					className={`px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-colors ${
						sortOrder === "closest"
							? "bg-primary-500 text-white"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					Data mais próxima
				</button>
				<button
					onClick={() => setSortOrder("furthest")}
					className={`px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-colors ${
						sortOrder === "furthest"
							? "bg-primary-500 text-white"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					Data mais distante
				</button>
			</div>

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
								<div className="flex items-center gap-2">
									<BookingStatusBadge status={booking.paymentStatus} />
									<span className="px-4 max-sm:hidden py-2 h-fit border rounded-md text-xs">
										ID: {booking._id.slice(0, 8)}
									</span>
								</div>
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
										R$ {booking.price || booking.priceTotal},00
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
							<div className="flex flex-col items-end gap-2 max-sm:w-full">
								<InteractiveHoverButton
									className="w-fit rounded-xl max-sm:w-full text-center font-medium"
									onClick={(e) => {
										e.preventDefault();
										navigate(`/places/${booking.place._id}`);
									}}
								>
									Acessar acomodação
								</InteractiveHoverButton>
								{booking.paymentStatus === "approved" && (
									<CancelButton
										bookingId={booking._id}
										onCanceled={onBookingCanceled}
									/>
								)}
							</div>
						</div>
						{/* Review Section */}
						{new Date(booking.checkout) < new Date() && (
							<Review booking={booking} />
						)}
					</div>
				</div>
			))}
		</>
	);
};

export default BookingAll;
