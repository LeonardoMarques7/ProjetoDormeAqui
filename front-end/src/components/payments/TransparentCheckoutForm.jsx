import { useEffect, useRef, useState } from "react";
import axios from "axios";
import React from "react";
import { useUserContext } from "@/components/contexts/UserContext";

// Usa axios global (withCredentials + Authorization já configurados em main.jsx)
const api = axios;

export default function TransparentCheckoutForm({
	bookingData,
	amountValue = 1,
	paymentMethod = "credit",
	onSuccess,
	onError,
}) {
	const mpRef = useRef(null);
	const cardFormRef = useRef(null);
	const isSubmittingRef = useRef(false);
	const { user } = useUserContext();

	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState("");

	// 🔐 ANTIFRAUDE
	const fullNameRef = useRef(null);
	const phoneRef = useRef(null);
	const zipCodeRef = useRef(null);
	const streetNumberRef = useRef(null);

	const email = user.email || "";

	useEffect(() => {
		if (!window.MercadoPago) return;

		if (cardFormRef.current) {
			try {
				cardFormRef.current.unmount();
			} catch (e) {}
			cardFormRef.current = null;
		}

		const ids = [
			"form-checkout__cardNumber",
			"form-checkout__expirationDate",
			"form-checkout__securityCode",
		];

		ids.forEach((id) => {
			const el = document.getElementById(id);
			if (el) el.innerHTML = "";
		});

		const mp = new window.MercadoPago(
			import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
			{ locale: "pt-BR" },
		);

		mpRef.current = mp;

		const cardForm = mp.cardForm({
			amount: String(amountValue),
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
					placeholder: "Número do cartão",
				},
				expirationDate: {
					id: "form-checkout__expirationDate",
					placeholder: "MM/AA",
				},
				securityCode: { id: "form-checkout__securityCode", placeholder: "CVV" },
				installments: { id: "form-checkout__installments" },
				issuer: { id: "form-checkout__issuer" },
				identificationType: { id: "form-checkout__identificationType" },
				identificationNumber: {
					id: "form-checkout__identificationNumber",
					placeholder: "Número do documento",
				},
			},

			callbacks: {
				onFormMounted: (error) => {
					if (error) {
						console.error("MP mount error:", error);
						return;
					}
					console.log("MP mounted OK");
				},

				onSubmit: async (event) => {
					event.preventDefault();
					if (isSubmittingRef.current) return;

					setLoading(true);
					isSubmittingRef.current = true;
					setFormError("");

					try {
						const data = cardForm.getCardFormData();
						if (!data.token) throw new Error("Token não gerado");

						const fullName = fullNameRef.current?.value?.trim();
						const phone = phoneRef.current?.value?.replace(/\D/g, "");
						const streetNumber = streetNumberRef.current?.value?.trim();
						const cpf = data.identificationNumber;
						const emailValue = email?.trim();

						if (!fullName || !phone || !streetNumber || !cpf || !emailValue) {
							setFormError("Preencha todos os dados obrigatórios");
							return;
						}

						// separa nome e sobrenome
						const [firstName, ...rest] = fullName.split(" ");
						const lastName = rest.join(" ") || " ";

						const payload = {
							...bookingData,

							token: data.token,
							payment_method_id: data.paymentMethodId,
							issuer_id: data.issuerId || null,
							installments: Number(data.installments) || 1,

							payer: {
								email: emailValue,
								first_name: firstName,
								last_name: lastName,

								identification: {
									type: data.identificationType,
									number: cpf,
								},

								phone: {
									area_code: phone.slice(0, 2),
									number: phone.slice(2),
								},

								address: {
									street_number: streetNumber,
								},
							},
						};

						console.log("📤 Payload enviado:", payload);

						const { data: response } = await api.post(
							"/payments/transparent",
							payload,
						);

						if (response?.success) onSuccess(response);
						else throw new Error(response?.message || "Pagamento não aprovado");
						console.log("✅ Resposta do servidor:", response);
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

		cardFormRef.current = cardForm;

		return () => {
			try {
				cardFormRef.current?.unmount();
			} catch (e) {}
			cardFormRef.current = null;
		};
	}, [amountValue]);

	return (
		<form
			id="form-checkout"
			className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow space-y-4"
		>
			<h2 className="text-xl font-semibold">
				{paymentMethod === "debit" ? "Cartão de Débito" : "Cartão de Crédito"}
			</h2>

			{/* NOME COMPLETO - ID movido para cá para o MP capturar corretamente */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Nome completo</label>
				<input
					id="form-checkout__cardholderName"
					ref={fullNameRef}
					className="w-full p-3 border rounded-xl h-12"
					required
				/>
			</div>

			{/* TELEFONE */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Telefone</label>
				<input
					ref={phoneRef}
					placeholder="11999999999"
					className="w-full p-3 border rounded-xl h-12"
					required
				/>
			</div>

			{/* CEP */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">CEP</label>
				<input
					ref={zipCodeRef}
					className="w-full p-3 border rounded-xl h-12"
					required
				/>
			</div>

			{/* NÚMERO */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Número</label>
				<input
					ref={streetNumberRef}
					className="w-full p-3 border rounded-xl h-12"
					required
				/>
			</div>

			{/* NÚMERO DO CARTÃO */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Número do cartão</label>
				<div
					id="form-checkout__cardNumber"
					className="w-full p-3 border rounded-xl h-12"
				/>
			</div>

			{/* VALIDADE + CVV */}
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium">Validade</label>
					<div
						id="form-checkout__expirationDate"
						className="w-full p-3 border rounded-xl h-12"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium">CVV</label>
					<div
						id="form-checkout__securityCode"
						className="w-full p-3 border rounded-xl h-12"
					/>
				</div>
			</div>

			{/* DOCUMENTO */}
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium">Tipo documento</label>
					<select
						id="form-checkout__identificationType"
						className="w-full p-3 border rounded-xl h-12"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium">Número documento</label>
					<input
						id="form-checkout__identificationNumber"
						className="w-full p-3 border rounded-xl h-12"
					/>
				</div>
			</div>

			{/* PARCELAS (apenas crédito) */}
			{paymentMethod === "credit" && (
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium">Parcelas</label>
					<select
						id="form-checkout__installments"
						className="w-full p-3 border rounded-xl h-12 bg-white"
					/>
				</div>
			)}

			{/* HIDDEN MP - Email com defaultValue e selects necessários */}
			<input
				id="form-checkout__cardholderEmail"
				defaultValue={email}
				style={{ display: "none" }}
			/>

			<select id="form-checkout__issuer" style={{ display: "none" }} />
			{paymentMethod !== "credit" && (
				<select id="form-checkout__installments" style={{ display: "none" }} />
			)}

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
