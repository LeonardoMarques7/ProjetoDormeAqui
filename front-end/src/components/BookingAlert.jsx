import React, { useEffect } from "react";
import { useUserContext } from "./contexts/UserContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
	CalendarArrowDown,
	CalendarArrowUp,
	CalendarIcon,
	InfoIcon,
} from "lucide-react";

const BookingAlert = ({ booking }) => {
	const { user } = useUserContext();

	useEffect(() => {
		if (booking) {
			toast(
				<div className="flex flex-col gap-2 w-full">
					<div className="flex items-center gap-2">
						<span className="flex items-center w-full">
							<p>
								Olá <strong>{user.name}</strong>, você já possue reserva nessa
								acomodação
							</p>
						</span>
					</div>
					<div className="flex flex-col gap-1 text-sm pt-2">
						<span className="flex items-center gap-2">
							<CalendarArrowUp size={16} />
							Check-in: {new Date(booking.checkin).toLocaleDateString("pt-br")}
						</span>
						<span className="flex items-center gap-2">
							<CalendarArrowDown size={16} />
							Check-out:{" "}
							{new Date(booking.checkout).toLocaleDateString("pt-br")}
						</span>
					</div>
					<p className="text-sm text-gray-600">
						Total de {booking.nights} noite{booking.nights > 1 ? "s" : ""} •
						{booking.priceTotal?.toLocaleString("pt-BR", {
							style: "currency",
							currency: "BRL",
						})}
					</p>
				</div>,
				{
					duration: Infinity,
					position: "bottom-right",
				}
			);
		}
	}, [booking]);

	return null;
};

export default BookingAlert;
