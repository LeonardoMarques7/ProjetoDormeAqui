import React, { useState } from "react";
import { Lock } from "lucide-react";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import CheckoutPreview from "./CheckoutPreview";
import iconPix from "@/assets/icons/icons8-pix-50.png";
import iconsBrands from "@/assets/icons/iconsBrands.png";

const iconCard = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="size-6"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
		/>
	</svg>
);

const PAYMENT_BADGES = [
	{
		icon: <img src={iconsBrands} alt="Ícones de bandeiras de cartão" />,
	},
];

function CheckoutForm({ checkoutData, onResult, place }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user } = useUserContext();
	const { showAuthModal } = useAuthModalContext();

	const handleCheckout = async () => {
		setError(null);

		// Check authentication before proceeding
		if (!user) {
			showAuthModal("login");
			setLoading(false);
			return;
		}

		if (
			!checkoutData?.checkIn ||
			!checkoutData?.checkOut ||
			!checkoutData?.accommodationId
		) {
			setError(
				"Selecione as datas de check-in e check-out antes de continuar.",
			);
			return;
		}

		setLoading(true);

		try {
			const { data: json } = await axios.post(
				"/payments/checkout-session",
				checkoutData,
			);

			if (!json.sessionUrl) {
				throw new Error(json.message || "Erro ao iniciar checkout");
			}

			// Redireciona para a página segura do Stripe
			window.location.href = json.sessionUrl;
		} catch (err) {
			console.error("Stripe checkout error:", err);
			
			// Handle 401 Unauthorized
			if (err.response?.status === 401) {
				setError("Sua sessão expirou. Por favor, faça login novamente.");
				showAuthModal("login");
				setLoading(false);
				onResult?.({ success: false, error: "Sessão expirada" });
				return;
			}
			
			const msg =
				err?.response?.data?.message || err.message || String(err);
			setError(msg);
			setLoading(false);
			onResult?.({ success: false, error: msg });
		}
	};

	return (
		<div className="space-y-4">
			{/* Preview da reserva */}
			<CheckoutPreview checkoutData={checkoutData} place={place} />

			{/* Métodos disponíveis */}
			<div>
				<p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
					Formas de pagamento aceitas
				</p>
				<div className="flex gap-2">
					{PAYMENT_BADGES.map((b) => (
						<span
							key={b.label}
							title={b.title}
							className="flex items-center w-fit gap-1 h-10  rounded-lg  text-xs font-medium text-gray-700"
						>
							{b.icon}
							{b.label}
						</span>
					))}
				</div>
			</div>

			{error && (
				<div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
					{error}
				</div>
			)}

			<button
				id="transparent-confirm-btn"
				type="button"
				onClick={handleCheckout}
				disabled={loading}
				className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{loading
					? "Redirecionando..."
					: `Pagar R$ ${checkoutData?.totalPrice?.toFixed?.(2) ?? checkoutData?.totalPrice ?? ""}`}
			</button>
		</div>
	);
}

export default function StripeTransparentCheckoutWrapper(props) {
	return <CheckoutForm {...props} />;
}
