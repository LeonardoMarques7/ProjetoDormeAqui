import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	XCircle,
	AlertTriangle,
	RefreshCw,
	ArrowLeft,
	HelpCircle,
} from "lucide-react";
import { useMessage } from "../components/contexts/MessageContext";

const PaymentFailure = () => {
	const [searchParams] = useSearchParams();
	const { showMessage } = useMessage();

	// Parâmetros retornados pelo Mercado Pago
	const paymentId = searchParams.get("payment_id");
	const externalReference = searchParams.get("external_reference");

	useEffect(() => {
		showMessage(
			"Pagamento não aprovado. Tente novamente ou use outro método.",
			"error",
		);
	}, [showMessage]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full bg-white rounded-3xl shadow-lg p-8 md:p-12">
				{/* Header com ícone de erro */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<XCircle className="w-10 h-10 text-red-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Pagamento Não Aprovado
					</h1>
					<p className="text-gray-600">
						Infelizmente não conseguimos processar seu pagamento.
					</p>
				</div>

				{/* Alerta informativo */}
				<div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
						<div>
							<h3 className="font-semibold text-red-800 mb-1">
								Possíveis causas:
							</h3>
							<ul className="text-red-700 text-sm leading-relaxed list-disc list-inside space-y-1">
								<li>Cartão com saldo insuficiente</li>
								<li>Dados do cartão incorretos</li>
								<li>Transação bloqueada pelo banco</li>
								<li>Problemas técnicos temporários</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Detalhes do pagamento */}
				<div className="bg-gray-50 rounded-2xl p-6 mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Detalhes da Tentativa
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
							<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
								Rejeitado
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

				{/* Opções de ação */}
				<div className="space-y-4 mb-8">
					<h3 className="text-lg font-semibold text-gray-900">
						O que você pode fazer:
					</h3>

					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
							<RefreshCw className="w-5 h-5 text-primary-600" />
						</div>
						<div>
							<p className="font-medium text-gray-900">Tentar novamente</p>
							<p className="text-sm text-gray-600">
								Volte para a página da acomodação e tente fazer a reserva
								novamente. Verifique se os dados do cartão estão corretos.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
							<HelpCircle className="w-5 h-5 text-primary-600" />
						</div>
						<div>
							<p className="font-medium text-gray-900">
								Outros métodos de pagamento
							</p>
							<p className="text-sm text-gray-600">
								Tente usar outro cartão ou método de pagamento como Pix ou
								Boleto Bancário.
							</p>
						</div>
					</div>
				</div>

				{/* Botões de ação */}
				<div className="flex flex-col sm:flex-row gap-4">
					<button
						onClick={() => window.history.back()}
						className="flex-1 bg-primary-900 text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
					>
						<ArrowLeft className="w-5 h-5" />
						Voltar e Tentar Novamente
					</button>

					<Link
						to="/"
						className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
					>
						Voltar para Home
					</Link>
				</div>

				{/* Informação adicional */}
				<div className="mt-8 pt-6 border-t border-gray-200">
					<p className="text-center text-sm text-gray-500 mb-2">
						Nenhuma cobrança foi realizada em seu cartão.
					</p>
					<p className="text-center text-sm text-gray-500">
						Precisa de ajuda? Entre em contato com nosso suporte em{" "}
						<a
							href="mailto:suporte@dormeaqui.com"
							className="text-primary-600 hover:underline"
						>
							suporte@dormeaqui.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default PaymentFailure;
