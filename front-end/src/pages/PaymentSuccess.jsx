import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, Home, ArrowRight } from "lucide-react";
import axios from "axios";
import { useMessage } from "../components/contexts/MessageContext";
const PaymentSuccess = () => {
	const [searchParams] = useSearchParams();
	const [bookingDetails, setBookingDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const { showMessage } = useMessage();
	// Flags para garantir idempotência no frontend
	const hasShownMessage = useRef(false);
	const hasCreatedBooking = useRef(false);

	// Parâmetros retornados pelo Mercado Pago
	const paymentId = searchParams.get("payment_id");
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
			(status || "").toLowerCase() === "authorized"
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
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full bg-white rounded-3xl shadow-lg p-8 md:p-12">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="w-10 h-10 text-green-600" />
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Pagamento Aprovado!
					</h1>

					<p className="text-gray-600">
						Sua reserva foi confirmada com sucesso.
					</p>
				</div>

				{/* Detalhes */}
				<div className="bg-gray-50 rounded-2xl p-6 mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Detalhes do Pagamento
					</h2>

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">ID do Pagamento:</span>
							<span className="font-medium text-gray-900">
								{paymentId || "N/A"}
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-gray-600">Status:</span>
							<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
								{status || "Aprovado"}
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-gray-600">Referência:</span>
							<span className="font-medium text-gray-900 text-sm">
								{externalReference || "N/A"}
							</span>
						</div>
					</div>
				</div>

				{/* Próximos passos */}
				<div className="space-y-4 mb-8">
					<h3 className="text-lg font-semibold text-gray-900">
						O que acontece agora?
					</h3>

					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
							<Calendar className="w-5 h-5 text-primary-600" />
						</div>
						<div>
							<p className="font-medium text-gray-900">Confirmação enviada</p>
							<p className="text-sm text-gray-600">
								Você receberá um email com todos os detalhes da sua reserva.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
							<Home className="w-5 h-5 text-primary-600" />
						</div>
						<div>
							<p className="font-medium text-gray-900">Prepare sua estadia</p>
							<p className="text-sm text-gray-600">
								Entre em contato com o anfitrião para combinar o check-in.
							</p>
						</div>
					</div>
				</div>

				{/* Ações */}
				<div className="flex flex-col sm:flex-row gap-4">
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
				</div>

				<p className="text-center text-sm text-gray-500 mt-6">
					Dúvidas? Entre em contato com nosso suporte em{" "}
					<a
						href="mailto:suporte@dormeaqui.com"
						className="text-primary-600 hover:underline"
					>
						suporte@dormeaqui.com
					</a>
				</p>
			</div>
		</div>
	);
};
export default PaymentSuccess;
