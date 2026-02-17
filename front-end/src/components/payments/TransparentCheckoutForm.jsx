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
	const [formError, setFormError] = useState("");
	const isSubmittingRef = useRef(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!window.MercadoPago) {
			console.error("SDK MercadoPago não carregado");
			return;
		}

		const mp = new window.MercadoPago(
			import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
			{
				locale: "pt-BR",
			},
		);

		mpRef.current = mp;

		const amount = String(amountValue);
		console.log("Inicializando cardForm com amount:", amount);

		// valida containers obrigatórios
		const required = [
			"form-checkout__cardNumber",
			"form-checkout__expirationDate",
			"form-checkout__securityCode",
			"form-checkout__installments",
			"form-checkout__issuer",
			"form-checkout__identificationType",
			"form-checkout__identificationNumber",
		];

		const missing = required.filter((id) => !document.getElementById(id));
		if (missing.length) {
			console.error("Missing MP containers:", missing);
			return;
		}

		cardFormRef.current = mp.cardForm({
			amount,
			iframe: true,
			form: {
				id: "form-checkout",
				cardholderName: {
					id: "form-checkout__cardholderName",
					placeholder: "Nome no cartao",
				},
				cardholderEmail: {
					id: "form-checkout__cardholderEmail",
					placeholder: "Email",
				},
				cardNumber: {
					id: "form-checkout__cardNumber",
					placeholder: "Numero do cartao",
				},
				expirationDate: {
					id: "form-checkout__expirationDate",
					placeholder: "MM/AAAA",
				},
				securityCode: {
					id: "form-checkout__securityCode",
					placeholder: "CVV",
				},
				installments: {
					id: "form-checkout__installments",
				},
				issuer: {
					id: "form-checkout__issuer",
				},
				identificationType: {
					id: "form-checkout__identificationType",
				},
				identificationNumber: {
					id: "form-checkout__identificationNumber",
					placeholder: "CPF",
				},
			},
			callbacks: {
				onFormMounted: (error) => {
					if (error) {
						console.error("Erro ao montar cardForm:", error);
						return;
					}

					console.log("CardForm montado com sucesso!");

					setTimeout(() => {
						const iframes = {
							cardNumber: !!document.querySelector(
								"#form-checkout__cardNumber iframe",
							),
							expiration: !!document.querySelector(
								"#form-checkout__expirationDate iframe",
							),
							securityCode: !!document.querySelector(
								"#form-checkout__securityCode iframe",
							),
						};
						console.log("Iframes detectados:", iframes);
					}, 500);
				},

				onSubmit: async (event) => {
					event.preventDefault();

					if (isSubmittingRef.current) return;
					isSubmittingRef.current = true;
					setLoading(true);
					setFormError("");

					try {
						const cardForm = cardFormRef.current;
						if (!cardForm?.getCardFormData) {
							throw new Error("Formulario do cartao nao inicializado.");
						}

						const {
							token,
							paymentMethodId,
							issuerId,
							installments,
							identificationType,
							identificationNumber,
							cardholderEmail,
						} = cardForm.getCardFormData();

						if (!token) {
							throw new Error("Token nao gerado pelos campos seguros.");
						}

						const payload = {
							...bookingData,
							token,
							paymentMethodId,
							issuerId: issuerId || null,
							installments: Number(installments) || 1,
							identificationType,
							identificationNumber,
							email: cardholderEmail,
						};

						const { data } = await axios.post("/payments/transparent", payload);

						if (data?.success === true) {
							onSuccess(data);
						} else {
							throw new Error(data?.message || "Pagamento nao aprovado");
						}
					} catch (err) {
						const message =
							err?.response?.data?.message ||
							err?.message ||
							"Erro ao processar pagamento";

						setFormError(message);
						onError(message);
					} finally {
						setLoading(false);
						isSubmittingRef.current = false;
					}
				},
			},
		});

		return () => {
			if (cardFormRef.current) {
				cardFormRef.current.unmount();
			}
		};
	}, [amountValue]);

	return (
		<form
			id="form-checkout"
			className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow space-y-4"
		>
			<h2 className="text-xl font-semibold">Pagamento</h2>

			<div>
				<label className="block text-sm font-medium">Nome no cartão</label>
				<input
					id="form-checkout__cardholderName"
					className="w-full p-3 border rounded-xl"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium">Email</label>
				<input
					id="form-checkout__cardholderEmail"
					type="email"
					aria-placeholder="11/2030"
					placeholder="MM/AAAA"
					className="w-full p-3 border h-12.5 rounded-xl"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium">Número do cartão</label>
				<div
					id="form-checkout__cardNumber"
					aria-placeholder="11/2030"
					placeholder="XXXX XXXX XXXX XXXX"
					className="w-full p-3 border h-12.5 rounded-xl"
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="flex-col flex gap-2">
					<label className="block text-sm font-medium">Validade</label>
					<div
						id="form-checkout__expirationDate"
						aria-placeholder="11/2030"
						placeholder="MM/AAAA"
						className="w-full p-3 border h-12.5 rounded-xl"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium">CVV</label>
					<div
						id="form-checkout__securityCode"
						aria-placeholder="11/2030"
						placeholder="XXX"
						className="w-full p-3 border h-12.5 rounded-xl"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium">Banco emissor</label>
				<select
					id="form-checkout__issuer"
					className="w-full p-3 border h-12.5 rounded-xl"
				>
					<option value="">Selecione</option>
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium">Parcelas</label>
				<select
					id="form-checkout__installments"
					className="w-full p-3 border rounded-xl"
				>
					<option value="">Selecione</option>
				</select>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm font-medium">Tipo documento</label>
					<select
						id="form-checkout__identificationType"
						className="w-full p-3 border rounded-xl"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium">Número documento</label>
					<input
						id="form-checkout__identificationNumber"
						className="w-full p-3 border rounded-xl"
					/>
				</div>
			</div>

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
