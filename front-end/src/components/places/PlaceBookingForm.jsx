import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import DatePickerAirbnb from "./DatePickerAirbnb";
import { useUserContext } from "../contexts/UserContext";
import { useAuthModalContext } from "../contexts/AuthModalContext";
import { useMessage } from "../contexts/MessageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StripeTransparentCheckoutWrapper from "../StripeTransparentCheckout";
import { useNavigate } from "react-router-dom";

const slideRight = {
	hidden: { opacity: 0, x: 48 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};

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

function numberOfDays(date1, date2) {
	const d1 = new Date(date1 + "GMT-03:00");
	const d2 = new Date(date2 + "GMT-03:00");
	return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
}

export default function PlaceBookingForm({
	place,
	placeId,
	bookingsPlace,
	formRef,
	asPopup = false,
	onPopupBook,
	minimalData,
	onFormDataChange,
}) {
	const { user } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { showMessage } = useMessage();
	const navigate = useNavigate();

	const today = new Date();
	const [checkin, setCheckin] = useState(today);
	const [checkout, setCheckout] = useState(addDays(today, 5));
	const [guests, setGuests] = useState(1);
	const [showCheckout, setShowCheckout] = useState(false);
	const [bookingData, setBookingData] = useState(null);

	const nights = checkin && checkout ? numberOfDays(checkin, checkout) : 0;
	const totalPrice = place ? place.price * nights : 0;

	// Sincroniza dados do formulário principal com o Place.jsx
	useEffect(() => {
		if (onFormDataChange && !asPopup) {
			onFormDataChange({
				nights,
				guests,
				totalPrice,
			});
		}
		// eslint-disable-next-line
	}, [nights, guests, totalPrice]);

	const handleDateSelect = ({ checkin: c, checkout: co }) => {
		setCheckin(c);
		setCheckout(co);
	};

	const handleBooking = (e) => {
		setShowCheckout(true);
		e.preventDefault();
		if (!checkin || !checkout || !guests) {
			showMessage("Insira todas as informações!", "warning");
			return;
		}
		const n = Math.max(
			1,
			Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)),
		);
		const pricePerNight = Number(place?.price || 0);
		setBookingData({
			accommodationId: placeId,
			checkIn: checkin.toISOString(),
			checkOut: checkout.toISOString(),
			guests,
			nights: n,
			pricePerNight,
			totalPrice: Number((pricePerNight * n).toFixed(2)),
		});
	};

	const handlePaymentSuccess = (data) => {
		setShowCheckout(false);
		setBookingData(null);
		// Support both Stripe paymentIntent shape and backend response shape
		const pi = data.paymentIntent || data.payment || data;
		const paymentId = data.paymentId || pi?.id || "";
		const status = (data.status || pi?.status || "").toLowerCase();
		if (
			status === "approved" ||
			status === "authorized" ||
			status === "succeeded"
		) {
			navigate(
				`/payment/success?payment_id=${encodeURIComponent(paymentId)}&status=${encodeURIComponent(status)}`,
			);
		} else if (
			status === "pending" ||
			status === "in_process" ||
			status === "processing"
		) {
			showMessage("Pagamento pendente. Aguardando confirmação.", "info");
			navigate(
				`/payment/pending?payment_id=${encodeURIComponent(paymentId)}&status=${encodeURIComponent(status)}`,
			);
		} else {
			showMessage("Pagamento não aprovado.", "error");
			navigate(
				`/payment/failure?payment_id=${encodeURIComponent(paymentId)}&status=${encodeURIComponent(status)}`,
			);
		}
	};

	const handlePaymentError = (message) => {
		setShowCheckout(false);
		setBookingData(null);
		showMessage(message || "Erro ao processar pagamento.", "error");
	};

	if (asPopup && minimalData) {
		// Modo popup minimalista
		return (
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 100, opacity: 0 }}
				transition={{ duration: 0.3 }}
				className="fixed z-50 top-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-6 min-w-[320px] max-w-[95vw]"
				style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
			>
				<div className="flex flex-col gap-1 min-w-0">
					<span className="text-lg font-bold text-gray-900 truncate">
						R$ {minimalData.price}{" "}
						<span className="text-xs font-normal text-gray-500">/noite</span>
					</span>
					<span className="text-xs text-gray-500 truncate">
						{minimalData.nights} noite(s) • {minimalData.guests} hóspede(s)
					</span>
					<span className="text-xs text-gray-700 font-semibold truncate">
						Total: R$ {minimalData.totalPrice}
					</span>
				</div>
				<button
					className="bg-gray-900 text-white px-5 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
					onClick={onPopupBook}
				>
					Reservar
				</button>
			</motion.div>
		);
	}
	// Modo normal (formulário completo)
	return (
		<motion.div
			className="order-2 col-span-full flex-1 w-full max-w-full ml-auto"
			variants={slideRight}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<form
				ref={formRef}
				className="w-full rounded-2xl border border-gray-200 p-6"
			>
				{/* Price */}
				<div className="mb-6">
					<div className="flex items-baseline gap-1">
						<span className="text-4xl font-bold text-gray-900">
							R$ {place?.price}
						</span>
						<span className="text-gray-600">por noite</span>
					</div>
				</div>
				{/* Date picker */}
				<div className="w-full mb-6">
					<DatePickerAirbnb
						onDateSelect={handleDateSelect}
						initialCheckin={checkin}
						initialCheckout={checkout}
						price={place?.price}
						placeId={placeId}
						bookings={bookingsPlace}
					/>
				</div>
				{/* Guests */}
				<div className="mb-6">
					<div className="text-sm font-semibold text-gray-900 mb-3">
						Hóspedes
					</div>
					<div className="text-sm text-gray-600 mb-3">
						Hospedagem para até 2 pessoas.
					</div>
					<div className="flex items-center justify-between border rounded-xl p-3">
						<button
							type="button"
							onClick={() => setGuests(Math.max(1, guests - 1))}
							disabled={guests <= 1}
							className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
						>
							<Minus className="w-4 h-4" />
						</button>
						<span className="text-lg font-medium">{guests}</span>
						<button
							type="button"
							onClick={() => setGuests(Math.min(10, guests + 1))}
							className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
						>
							<Plus className="w-4 h-4" />
						</button>
					</div>
				</div>
				{!user && (
					<button
						className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
						onClick={(e) => {
							e.preventDefault();
							showAuthModal("login");
						}}
					>
						Faça login para reservar
					</button>
				)}
				{user && (
					<StripeTransparentCheckoutWrapper
						place={place}
						checkoutData={(() => {
							const n =
								checkin && checkout
									? Math.max(
											1,
											Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)),
										)
									: 0;
							const pricePerNight = Number(place?.price || 0);
							return {
								accommodationId: placeId,
								checkIn: checkin?.toISOString(),
								checkOut: checkout?.toISOString(),
								guests,
								nights: n,
								pricePerNight,
								totalPrice: Number((pricePerNight * n).toFixed(2)),
								payerEmail: user?.email,
								payerName: user?.name || user?.email,
							};
						})()}
						onResult={(result) => {
							if (!result.success) {
								handlePaymentError(
									result.error || "Erro ao processar pagamento",
								);
							}
						}}
					/>
				)}
			</form>
		</motion.div>
	);
}
