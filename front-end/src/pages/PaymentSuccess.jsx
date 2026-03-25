import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	CheckCircle,
	Calendar,
	Home,
	ArrowRight,
	LucideCheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useMessage } from "../components/contexts/MessageContext";
import { motion } from "framer-motion";
import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
const PaymentSuccess = () => {
	const [searchParams] = useSearchParams();
	const [bookingDetails, setBookingDetails] = useState(null);
	const [loading, setLoading] = useState(true);
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
	}, []); // ← roda apenas uma vez

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-600">Carregando...</p>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center p-4">
			<motion.div
				className="max-w-2xl w-full flex items-center justify-center p-8 md:p-12"
				initial={{ opacity: 0, y: 40, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* Header */}
				<div className="text-center w-full  mb-8">
					<motion.div
						className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							delay: 0.3,
							type: "spring",
							stiffness: 300,
							damping: 15,
						}}
					>
						<LucideCheckCircle2 className="w-10 h-10 text-white" />
					</motion.div>

					<motion.p
						className="text-3xl font-medium text-gray-900 mb-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4 }}
					>
						Pagamento Aprovado
					</motion.p>

					<p className="text-center text-5xl font-bold text-gray-900">
						<span className="text-2xl align-top">R$</span>
						{bookingDetails?.pricePerNight || "0"},00
					</p>

					<motion.p
						className="text-gray-600"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.4 }}
					>
						Sua reserva foi confirmada com sucesso.
					</motion.p>
				</div>
				<div className="flex flex-col gap-6">
					<div className="bg-primary-100 text-center rounded-4xl">
						<img
							className="rounded-4xl aspect-video object-cover"
							src={bookingDetails?.place?.photos[0]}
							alt=""
						/>
						<div className=" m-3">{bookingDetails?.place?.title}</div>
					</div>
					<div className="bg-primary-100 uppercase text-center rounded-4xl">
						Check-in: {formatDate(bookingDetails?.checkin)} às{" "}
						{bookingDetails?.place?.checkin}
					</div>

					{/* Ações */}
					<motion.div
						className="flex flex-col gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.85 }}
					>
						<Link
							to="/account/bookings"
							className="flex-1 bg-primary-900 text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-800 transition-colors
   flex items-center justify-center gap-2"
						>
							Ver Minhas Reservas
							<ArrowRight className="w-5 h-5" />
						</Link>

						<Link
							to="/"
							className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors
  text-center"
						>
							Voltar para Home
						</Link>
					</motion.div>
					<p className="text-center text-sm text-gray-500 ">
						Dúvidas? Entre em contato com nosso suporte em{" "}
						<a
							href="mailto:suporte@dormeaqui.com"
							className="text-primary-600 hover:underline"
						>
							suporte@dormeaqui.com
						</a>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default PaymentSuccess;
