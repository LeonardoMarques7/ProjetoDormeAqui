import { Calendar, ChevronDown, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function formatDate(date, format = "dd/MM/yyyy") {
	if (!date) return "";
	const dateObj = date instanceof Date ? date : new Date(date);
	if (isNaN(dateObj.getTime())) return "";
	const day = String(dateObj.getDate()).padStart(2, "0");
	const month = String(dateObj.getMonth() + 1).padStart(2, "0");
	const year = dateObj.getFullYear();
	const monthNames = [
		"Jan",
		"Fev",
		"Mar",
		"Abr",
		"Mai",
		"Jun",
		"Jul",
		"Ago",
		"Set",
		"Out",
		"Nov",
		"Dez",
	];
	if (format === "dd de MMM")
		return `${day} de ${monthNames[dateObj.getMonth()]}`;
	return `${day}/${month}/${year}`;
}

export default function PlaceExistingBooking({ booking, place }) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="mb-4 w-full transition-all duration-700 mx-auto max-sm:mb-5">
			<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
				{/* Collapsed header */}
				<div
					className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-3 h-3 rounded-full bg-green-500" />
							<div>
								<div className="text-sm font-semibold text-gray-900">
									Reserva Confirmada
								</div>
								<div className="text-xs text-gray-500">
									#{booking._id.slice(-6).toUpperCase()}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-right">
								<div className="text-sm font-semibold text-gray-900">
									{formatDate(booking.checkin)}
								</div>
								<div className="text-xs text-gray-500">Check-in</div>
							</div>
							<ChevronDown
								className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
							/>
						</div>
					</div>
				</div>

				{/* Expanded details */}
				{isExpanded && (
					<div className="px-4 pb-4 border-t border-gray-100">
						<div className="grid grid-cols-2 gap-4 my-4">
							<div className="bg-gray-50 rounded-lg p-3">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs text-gray-500 uppercase">
										Check-in
									</span>
								</div>
								<div className="text-base font-semibold text-gray-900 mb-1">
									{formatDate(booking.checkin)}
								</div>
								<div className="text-sm text-gray-600 flex items-center gap-1">
									{place.checkin}
								</div>
							</div>
							<div className="bg-gray-50 rounded-lg p-3">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="w-4 h-4 text-gray-500" />
									<span className="text-xs text-gray-500 uppercase">
										Check-out
									</span>
								</div>
								<div className="text-base font-semibold text-gray-900 mb-1">
									{formatDate(booking.checkout)}
								</div>
								<div className="text-sm text-gray-600 flex items-center gap-1">
									<Clock className="w-3 h-3" />
									{place.checkout}
								</div>
							</div>
						</div>
						<Link
							to={`../account/bookings/${booking._id}`}
							className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
						>
							Acessar Reserva
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
