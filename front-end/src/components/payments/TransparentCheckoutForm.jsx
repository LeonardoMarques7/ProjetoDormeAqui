import { useEffect, useRef, useState } from "react";
import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

export default function TransparentCheckoutForm({
	bookingData,
	amountValue = 1,
	onSuccess,
	onError,
}) {
	const mpRef = useRef(null);
	const cardFormRef = useRef(null);
	const isSubmittingRef = useRef(false);

	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState("");

	// NOVOS CAMPOS ANTIFRAUDE
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [streetNumber, setStreetNumber] = useState("");

	useEffect(() => {
		if (!window.MercadoPago) return;

		const mp = new window.MercadoPago(
			import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
			{ locale: "pt-BR" },
		);

		mpRef.current = mp;

		cardFormRef.current = mp.cardForm({
			amount: String(amountValue),
			iframe: true,
			form: {
				id: "form-checkout",
				cardholderName: { id: "form-checkout__cardholderName" },
				cardholderEmail: { id: "form-checkout__cardholderEmail" },
				cardNumber: { id: "form-checkout__cardNumber" },
				expirationDate: { id: "form-checkout__expirationDate" },
				securityCode: { id: "form-checkout__securityCode" },
				installments: { id: "form-checkout__installments" },
				issuer: { id: "form-checkout__issuer" },
				identificationType: { id: "form-checkout__identificationType" },
				identificationNumber: { id: "form-checkout__identificationNumber" },
			},
			callbacks: {
				onSubmit: async (event) => {
					event.preventDefault();
					if (isSubmittingRef.current) return;

					setLoading(true);
					setFormError("");
					isSubmittingRef.current = true;

					try {
						const cardForm = cardFormRef.current;
						const data = cardForm.getCardFormData();

						if (!data.token) throw new Error("Token não gerado");

						// separa telefone
						const phoneDigits = phone.replace(/\D/g, "");
						const areaCode = phoneDigits.slice(0, 2);
						const number = phoneDigits.slice(2);

						const payload = {
							...bookingData,
							token: data.token,
							paymentMethodId: data.paymentMethodId,
							issuerId: data.issuerId || null,
							installments: Number(data.installments) || 1,
							identificationType: data.identificationType,
							identificationNumber: data.identificationNumber,
							email: data.cardholderEmail,

							// ANTIFRAUDE
							fullName,
							phoneAreaCode: areaCode,
							phoneNumber: number,
							zipCode,
							streetNumber,
						};

						const { data: response } = await api.post(
							"/payments/transparent",
							payload,
						);

						if (response?.success) {
							onSuccess(response);
						} else {
							throw new Error(response?.message);
						}
					} catch (err) {
						const msg =
							err?.response?.data?.message ||
							err?.message ||
							"Erro ao processar pagamento";

						setFormError(msg);
						onError(msg);
					} finally {
						setLoading(false);
						isSubmittingRef.current = false;
					}
				},
			},
		});

		return () => cardFormRef.current?.unmount();
	}, [amountValue, fullName, phone, zipCode, streetNumber]);

	return (
		<form
			id="form-checkout"
			className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow space-y-4"
		>
			<h2 className="text-xl font-semibold">Pagamento</h2>

			{/* NOME COMPLETO */}
			<div>
				<label className="block text-sm">Nome completo</label>
				<input
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					className="w-full p-3 border rounded-xl"
					required
				/>
			</div>

			{/* TELEFONE */}
			<div>
				<label className="block text-sm">Telefone</label>
				<input
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="11999999999"
					className="w-full p-3 border rounded-xl"
					required
				/>
			</div>

			{/* CEP */}
			<div>
				<label className="block text-sm">CEP</label>
				<input
					value={zipCode}
					onChange={(e) => setZipCode(e.target.value)}
					className="w-full p-3 border rounded-xl"
					required
				/>
			</div>

			{/* NUMERO */}
			<div>
				<label className="block text-sm">Número</label>
				<input
					value={streetNumber}
					onChange={(e) => setStreetNumber(e.target.value)}
					className="w-full p-3 border rounded-xl"
					required
				/>
			</div>

			{/* CAMPOS MP */}
			<input id="form-checkout__cardholderName" hidden />
			<input id="form-checkout__cardholderEmail" hidden />

			<div id="form-checkout__cardNumber" className="p-3 border rounded-xl" />
			<div
				id="form-checkout__expirationDate"
				className="p-3 border rounded-xl"
			/>
			<div id="form-checkout__securityCode" className="p-3 border rounded-xl" />

			<select id="form-checkout__issuer" className="p-3 border rounded-xl" />
			<select
				id="form-checkout__installments"
				className="p-3 border rounded-xl"
			/>
			<select
				id="form-checkout__identificationType"
				className="p-3 border rounded-xl"
			/>
			<input
				id="form-checkout__identificationNumber"
				className="p-3 border rounded-xl"
			/>

			{formError && <div className="text-red-600 text-sm">{formError}</div>}

			<button
				type="submit"
				disabled={loading}
				className="w-full bg-blue-600 text-white p-3 rounded-xl"
			>
				{loading ? "Processando..." : `Pagar R$ ${amountValue}`}
			</button>
		</form>
	);
}
