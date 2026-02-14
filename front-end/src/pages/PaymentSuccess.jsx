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

	const hasShownMessage = useRef(false);

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
						className="flex-1 bg-primary-900 text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
					>
						Ver Minhas Reservas
						<ArrowRight className="w-5 h-5" />
					</Link>

					<Link
						to="/"
						className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
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
