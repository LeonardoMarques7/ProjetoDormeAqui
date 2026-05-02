import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Home, Waves, Dumbbell } from "lucide-react";
import axios from "axios";
import { useMessage } from "../components/contexts/MessageContext";
import { twMerge } from "tailwind-merge";
import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import PlaceLocation from "../components/places/PlaceLocation";
import Perk from "../components/common/Perk";
const PaymentSuccess = ({ className, ...props }) => {
	const [searchParams] = useSearchParams();
	const [bookingDetails, setBookingDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isTransactionOpen, setIsTransactionOpen] = useState(false);
	const { showMessage } = useMessage();
	// Flags para garantir idempotência no frontend
	const hasShownMessage = useRef(false);
	const hasCreatedBooking = useRef(false);

	// Parâmetros retornados pelo Stripe Checkout ou Mercado Pago
	const paymentId =
		searchParams.get("payment_id") || searchParams.get("session_id");
	const status = searchParams.get("status");
	const externalReference = searchParams.get("external_reference");

	useEffect(() => {
		const fetchBookingDetails = async () => {
			try {
				setLoading(false);
			} catch (error) {
				console.error("Erro ao buscar detalhes:", error);
				setLoading(false);
			}
		};

		fetchBookingDetails();

		if (!hasShownMessage.current) {
			showMessage("Pagamento aprovado! Sua reserva foi confirmada.", "success");
			hasShownMessage.current = true;
		}

		const createBookingFromPayment = async () => {
			if (!paymentId) return;
			if (hasCreatedBooking.current) return;

			try {
				try {
					const { data: ownerBookings } = await axios.get("/bookings/owner");
					const existing = Array.isArray(ownerBookings)
						? ownerBookings.find(
								(b) => String(b.mercadopagoPaymentId) === String(paymentId),
							)
						: null;
					if (existing) {
						setBookingDetails(existing);
						hasCreatedBooking.current = true;
						return;
					}
				} catch (err) {}

				const resp = await axios.post("/bookings/from-payment", { paymentId });
				if (resp?.data) {
					if (resp.status === 202) {
						showMessage("Reserva aguardando confirmacao do webhook de pagamento.", "info");
						hasCreatedBooking.current = true;
						return;
					}
					setBookingDetails(resp.data);
					showMessage("Reserva criada com sucesso.", "success");
					hasCreatedBooking.current = true;
				}
			} catch (err) {
				const httpStatus = err?.response?.status;
				const msg =
					err?.response?.data?.message ||
					err.message ||
					"Erro ao criar reserva.";
				if (httpStatus === 409) {
					showMessage(msg || "Conflito: datas indisponíveis.", "error");
					hasCreatedBooking.current = true;
				} else {
					console.error("Erro criando booking a partir do pagamento:", err);
					showMessage(
						"Reserva está sendo processada; se não aparecer em alguns instantes verifique sua página de reservas.",
						"info",
					);
				}
			} finally {
				setLoading(false);
			}
		};

		if (
			(status || "").toLowerCase() === "approved" ||
			(status || "").toLowerCase() === "authorized" ||
			(status || "").toLowerCase() === "succeeded"
		) {
			createBookingFromPayment();
		}
	}, []);

	useEffect(() => {
		const fetchBookingDetails = async () => {
			try {
				// Caso queira buscar detalhes reais depois:
				// const { data } = await axios.get(`/bookings/by-payment/${paymentId}`);
				// setBookingDetails(data);

				setLoading(false);
			} catch (error) {
				console.error("Erro ao buscar detalhes:", error);
				setLoading(false);
			}
		};

		fetchBookingDetails();

		// 🔥 Garante que a mensagem só aparece UMA vez
		if (!hasShownMessage.current) {
			showMessage("Pagamento aprovado! Sua reserva foi confirmada.", "success");
			hasShownMessage.current = true;
		}

		// Tenta criar/confirmar a reserva automaticamente quando o pagamento estiver aprovado.
		// Estratégia:
		// 1) Verifica se o webhook já criou a booking consultando /bookings/owner (idempotente).
		// 2) Caso não exista, delega ao backend a criação a partir do paymentId via POST /bookings/from-payment.
		//    (o endpoint /bookings/from-payment deve implementar criação idempotente/segura; se não existir,
		//     a chamada cairá em erro e será exibida mensagem informativa).
		const createBookingFromPayment = async () => {
			if (!paymentId) return;
			if (hasCreatedBooking.current) return;

			try {
				// 1) Tenta obter reserva já criada pelo webhook (se o webhook já rodou)
				try {
					const { data: ownerBookings } = await axios.get("/bookings/owner");
					const existing = Array.isArray(ownerBookings)
						? ownerBookings.find(
								(b) => String(b.mercadopagoPaymentId) === String(paymentId),
							)
						: null;
					if (existing) {
						setBookingDetails(existing);
						hasCreatedBooking.current = true;
						return;
					}
				} catch (err) {
					// ignora erro ao listar reservas do dono (ex: usuário não autenticado)
				}

				// 2) Pede ao backend para criar a booking a partir do paymentId (delegar lógica de criação e idempotência)
				// Endpoint esperado: POST /bookings/from-payment { paymentId }
				// (O backend pode usar esse endpoint para buscar metadata/payment info e criar a booking de forma segura)
				const resp = await axios.post("/bookings/from-payment", { paymentId });
				if (resp?.data) {
					if (resp.status === 202) {
						showMessage("Reserva aguardando confirmacao do webhook de pagamento.", "info");
						hasCreatedBooking.current = true;
						return;
					}
					setBookingDetails(resp.data);
					showMessage("Reserva criada com sucesso.", "success");
					hasCreatedBooking.current = true;
				}
			} catch (err) {
				const httpStatus = err?.response?.status;
				const msg =
					err?.response?.data?.message ||
					err.message ||
					"Erro ao criar reserva.";
				if (httpStatus === 409) {
					// Conflito de datas
					showMessage(msg || "Conflito: datas indisponíveis.", "error");
					hasCreatedBooking.current = true; // marca como tentado para evitar retrys infinitos
				} else {
					// Se endpoint não existir ou outro erro, apenas informa ao usuário e loga
					console.error("Erro criando booking a partir do pagamento:", err);
					showMessage(
						"Reserva está sendo processada; se não aparecer em alguns instantes verifique sua página de reservas.",
						"info",
					);
				}
			} finally {
				setLoading(false);
			}
		};

		if (
			(status || "").toLowerCase() === "approved" ||
			(status || "").toLowerCase() === "authorized" ||
			(status || "").toLowerCase() === "succeeded"
		) {
			createBookingFromPayment();
		}
	}, []);

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
		});
	};

	const formatDateTime = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<p className="text-gray-600">Carregando...</p>
			</div>
		);
	}

	const bookingData = bookingDetails
		? {
				place: {
					name: bookingDetails.place?.title || "Resort Paradise Tropical",
					address:
						bookingDetails.place?.location ||
						"Av. Beira Mar, 1500 - Praia do Forte, BA",
					photoUrl:
						bookingDetails.place?.photos?.[0] ||
						"https://images.unsplash.com/photo-1690199827629-552c41f6450f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnQlMjBob3RlbCUyMGV4dGVyaW9yJTIwdHJvcGljYWx8ZW58MXx8fHwxNzc0NDc3NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
				},
				user: {
					name: "Visitante", // Derive from auth if available
				},
				pricePerNight: bookingDetails.pricePerNight || 450,
				priceTotal:
					bookingDetails.totalPrice || bookingDetails.pricePerNight || 1350,
				checkin: bookingDetails.checkin || "2026-04-10",
				checkout: bookingDetails.checkout || "2026-04-13",
				guests: bookingDetails.guests || 2,
				nights: bookingDetails.nights || 3,
				paymentStatus: "approved",
				mercadopagoPaymentId: paymentId,
			}
		: null;

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<p className="text-gray-600">Carregando...</p>
			</div>
		);
	}

	const totalAmount =
		bookingDetails?.totalPrice || bookingDetails?.pricePerNight || 1450;
	const formattedAmount = totalAmount.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const reservaTotal = bookingDetails?.pricePerNight || 1300;
	const taxa = 150;
	const now = new Date();

	const createdAt = bookingDetails?.createdAt;

	return (
		<div data-slot="booking-success" className="">
			<div className="flex items-end justify-between max-w-7xl px-8 max-sm:mb-5 max-sm:items-start max-sm:flex-col max-sm:p-0 mx-auto w-full mt-5">
				<span className="text-gray-700 text-xs tracking-wider uppercase">
					{bookingData?.place?.name || bookingDetails?.place?.title}
				</span>
				<span className="text-gray-500 text-xs tracking-wider uppercase">
					Reserva confirmada em {formatDateTime(createdAt)}
				</span>
			</div>
			<div className=" w-full mx-auto items-center justify-center">
				<div className="w-full mx-auto max-w-7xl grid grid-cols-3 gap-0 max-md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] overflow-hidden">
					{/* Left Column - Booking Details */}
					<div className=" p-8 max-sm:p-0 flex flex-col rounded-l-4xl">
						<div className="mb-8">
							<h1 className="text-2xl font-semibold text-gray-900 mb-1">
								Olá, {bookingDetails?.user?.name?.split(" ")[0] || "Visitante"}!
							</h1>
							<p className="text-blue-600 text-sm">
								Ficamos felizes em recebê-lo(a)!
							</p>
						</div>

						{/* Booking Info */}
						<div className="space-y-6 mb-8">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-xs text-gray-500 mb-1">CHECK-IN</div>
									<div className="font-semibold text-gray-900">
										{formatDate(
											bookingData?.checkin ||
												bookingDetails?.checkin ||
												"2026-04-10",
										)}{" "}
										às {bookingDetails?.place?.checkin}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">CHECK-OUT</div>
									<div className="font-semibold text-gray-900">
										{formatDate(
											bookingData?.checkout ||
												bookingDetails?.checkout ||
												"2026-04-18",
										)}{" "}
										às {bookingDetails?.place?.checkout}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-xs text-gray-500 mb-1">HÓSPEDES</div>
									<div className="font-semibold text-gray-900">
										{bookingData?.guests || bookingDetails?.guests || 2}{" "}
										{bookingData?.guests === 1 ? "Pessoa" : "Pessoas"}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">NOITES</div>
									<div className="font-semibold text-gray-900">
										{bookingData?.nights || bookingDetails?.nights || 3}{" "}
										{bookingData?.nights === 1 ? "Noite" : "Noites"}
									</div>
								</div>
							</div>

							<div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Valor por noite</span>
									<span className="font-semibold text-gray-900">
										R${" "}
										{(
											bookingData?.pricePerNight ||
											bookingDetails?.pricePerNight ||
											450
										).toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Total</span>
									<span className="font-semibold text-gray-900">
										R${" "}
										{(
											bookingData?.priceTotal ||
											bookingDetails?.totalPrice ||
											bookingDetails?.pricePerNight ||
											1350
										).toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Status</span>
									<span className="font-semibold text-emerald-600">
										Confirmado
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Pagamento via</span>
									<span className="font-semibold text-gray-900">Stripe</span>
								</div>
								{paymentId && (
									<div className="pt-4  border-t border-gray-200">
										<p className="text-xs break-all leading-tight">
											<span className="text-xs text-gray-500">ID: </span>{" "}
											{paymentId}
										</p>
									</div>
								)}
							</div>
							{/* 
								<button
									className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
									aria-label="Baixar comprovante"
									onClick={() => window.print()}
								>
									Baixar Comprovante
									<ArrowRight className="size-4" />
								</button> */}
						</div>

						{/* Footer Text */}
					</div>
					<div className="p-8  max-sm:p-0">
						<div className="overflow-hidden">
							<p className="text-primary-500 uppercase font-light">
								Comodidades
							</p>
						</div>
						<div className="overflow-hidden pb-6">
							<p className="text-3xl font-bold">O que esse lugar oferece</p>
						</div>
						<div className="space-y-6 mb-12 ">
							{bookingDetails?.place?.perks?.slice(0, 3).map((perk) => (
								<div key={perk} className="flex gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-primary-100/50  rounded-full flex items-center justify-center">
										<Perk perk={perk} minimal />
									</div>
									<div>
										<h3 className="font-semibold mb-1 capitalize">
											{perk.replace(/_/g, " ").toUpperCase()}
										</h3>
										<p className="text-sm text-primary-400 leading-relaxed">
											Inclui {perk.replace(/_/g, " ")}.
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="bg-primary-100/50 rounded-lg p-6">
							<h3 className="font-semibold mb-4">Números Importantes</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm">Recepção 24h</span>
									<span className="text-sm font-mono">(75) 3676-1234</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Serviço de Quarto</span>
									<span className="text-sm font-mono">(75) 3676-1235</span>
								</div>
							</div>
						</div>
					</div>
					<div className=" px-8 max-sm:px-0 flex flex-col rounded-r-4xl">
						<div className="w-full h-100">
							<PlaceLocation
								city={
									bookingDetails?.place?.city ||
									bookingDetails?.place?.location ||
									"Praia do Forte, BA"
								}
								minimal={true}
							/>
						</div>
						<div className="pt-6 border-t mt-0 border-gray-200">
							<p className="text-xs text-gray-500 leading-relaxed">
								Sua reserva foi confirmada com sucesso! Prepare-se para uma
								experiência inesquecível. Nossa equipe está à disposição para
								tornar sua estadia perfeita. Em caso de dúvidas, entre em
								contato através dos nossos canais de atendimento.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PaymentSuccess;
