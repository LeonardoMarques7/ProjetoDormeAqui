import React, { useState } from "react";
import { Lock } from "lucide-react";
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

function CheckoutForm({ checkoutData, onResult }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleCheckout = async () => {
		setError(null);

		if (!checkoutData?.checkIn || !checkoutData?.checkOut || !checkoutData?.accommodationId) {
			setError("Selecione as datas de check-in e check-out antes de continuar.");
			return;
		}

		setLoading(true);

		try {
			const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

			const resp = await fetch(`${apiBase}/payments/checkout-session`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(checkoutData),
			});

			const json = await resp.json();

			if (!resp.ok || !json.sessionUrl) {
				throw new Error(json.message || "Erro ao iniciar checkout");
			}

			// Redireciona para a página segura do Stripe
			window.location.href = json.sessionUrl;
		} catch (err) {
			console.error("Stripe checkout error:", err);
			const msg = err.message || String(err);
			setError(msg);
			setLoading(false);
			onResult?.({ success: false, error: msg });
		}
	};

	return (
		<div className="space-y-4">
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

			{/* Info segurança */}
			<div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
				<Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
				<span>Você será redirecionado para o checkout seguro do Stripe.</span>
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
