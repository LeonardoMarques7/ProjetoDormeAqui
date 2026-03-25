import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { BOOKING_STATUS_CONFIG } from "@/lib/bookingStatuses.js";

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
					className="relative flex gap-[10px] rounded-[25px] overflow-hidden bg-red-500 shadow-lg max-sm:flex-col"
				>
					{/* Seção de Imagens */}
					<div className="relative h-[410px] w-[707px] max-sm:w-full max-sm:h-[300px] flex-shrink-0">
						{/* Imagem Principal Grande */}
						<div className="absolute left-0 top-0 h-full w-[497px] max-sm:w-[60%] rounded-[25px] overflow-hidden">
							<img
								src={booking.place.photos[0]}
								alt={booking.place.title}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Badge de Status */}
						<div className="absolute top-[16px] left-[16px] z-10">
							<BookingStatusBadge status={booking.status || booking.paymentStatus} />
						</div>

						{/* Imagens Menores Empilhadas à Direita */}
						<div className="absolute right-0 top-0 h-full flex flex-col gap-[10px] p-[10px] max-sm:hidden">
							<div className="relative w-[200px] h-[200px] rounded-[25px] overflow-hidden flex-shrink-0">
								<img
									src={booking.place.photos[1]}
									alt={booking.place.title}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="relative w-[200px] h-[200px] rounded-[25px] overflow-hidden flex-shrink-0">
								<img
									src={booking.place.photos[2]}
									alt={booking.place.title}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</div>

					{/* Seção de Informações */}
					<div className="relative flex flex-col justify-between p-6 flex-1 max-sm:p-4">
						{/* Título e Localização */}
						<div className="flex flex-col gap-3 mb-4">
							<p className="text-primary-700 uppercase text-xs font-semibold tracking-wide">
								{booking.place.city}
							</p>
							<p className="font-bold text-3xl max-sm:text-2xl text-[#0F172B]">
								{booking.place.title}
							</p>
							<div className="flex items-center gap-1 text-xs text-gray-600">
								<MapPin size={14} />
								<span>{booking.place.city}</span>
							</div>
						</div>

						{/* Datas e Detalhes */}
						<div className="flex flex-col gap-3 mb-4 max-sm:gap-2">
							<div className="grid grid-cols-3 gap-4 max-sm:gap-2">
								<div className="flex flex-col gap-1">
									<small className="text-xs uppercase font-semibold text-gray-600">
										Check-In
									</small>
									<span className="text-sm max-sm:text-xs font-medium text-gray-900">
										{formatarData(booking.checkin)}
									</span>
								</div>
								<div className="flex flex-col gap-1">
									<small className="text-xs uppercase font-semibold text-gray-600">
										Check-out
									</small>
									<span className="text-sm max-sm:text-xs font-medium text-gray-900">
										{formatarData(booking.checkout)}
									</span>
								</div>
								<div className="flex flex-col gap-1">
									<small className="text-xs uppercase font-semibold text-gray-600">
										Hóspedes
									</small>
									<span className="text-sm max-sm:text-xs font-medium text-gray-900">
										{booking.guests}
									</span>
								</div>
							</div>
						</div>

						{/* Preço */}
						<div className="flex flex-col gap-1 mb-4 pb-4 border-t border-b border-gray-200 py-3">
							<span className="text-2xl max-sm:text-xl font-bold text-gray-900">
								R$ {booking.price || booking.priceTotal},00
							</span>
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<p className="font-light">{booking.nights} noites</p>
								<span className="w-1 h-1 bg-primary-400 rounded-full"></span>
								<p className="font-light">R$ {booking.place.price}/noite</p>
							</div>
						</div>

						{/* Botões de Ação */}
						<div className="flex flex-col gap-2 max-sm:flex-col">
							<InteractiveHoverButton
								className="w-full rounded-xl text-center font-medium"
								onClick={(e) => {
									e.preventDefault();
									navigate(`/places/${booking.place._id}`);
								}}
							>
								Acessar acomodação
							</InteractiveHoverButton>
							{booking.status === "confirmed" && (
								<CancelButton
									bookingId={booking._id}
									onCanceled={onBookingCanceled}
								/>
							)}
						</div>

						{/* Review Section */}
						{booking.status === "evaluation" && new Date(booking.checkout) < new Date() && (
							<div className="mt-4">
								<Review booking={booking} />
							</div>
						)}
					</div>
				</div>
			))}
		</>
	);
};

export default BookingAll;
