import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AlertCircle, CreditCard, Lock } from "lucide-react";
import QRCode from "qrcode";
import { useUserContext } from "@/components/contexts/UserContext";
import { z } from "zod";

import visaIcon from "@/assets/cards/visa.svg";
import mcIcon from "@/assets/cards/mastercard.svg";
import eloIcon from "@/assets/cards/elo.svg";
import hipercardIcon from "@/assets/cards/hipercard.svg";
import maestroIcon from "@/assets/cards/maestro.svg";

/* ======================================================
   BANDEIRA DETECÇÃO BRASIL
====================================================== */
function detectBrand(num) {
	if (!num || num.length < 2) return "unknown";

	const bin = parseInt(num.slice(0, 6), 10);

	if (/^4/.test(num)) return "visa";

	if ((bin >= 510000 && bin <= 559999) || (bin >= 222100 && bin <= 272099))
		return "mastercard";

	if (/^(606282|3841)/.test(num)) return "hipercard";

	const eloBins = [
		401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 504175,
		506699, 506770, 506771, 506772, 506773, 506774, 506775, 506776, 506777,
		506778, 509000, 509999, 627780, 636297, 636368,
	];
	if (eloBins.includes(bin)) return "elo";

	if (/^(50|56|57|58|6)/.test(num)) return "maestro";

	return "unknown";
}

/* ======================================================
   LUHN
====================================================== */
function luhnCheck(num) {
	let sum = 0;
	let double = false;

	for (let i = num.length - 1; i >= 0; i--) {
		let d = parseInt(num[i], 10);
		if (double) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		sum += d;
		double = !double;
	}

	return sum % 10 === 0;
}

/* ======================================================
   VALIDADE
====================================================== */
function validExpiry(value) {
	// Expect MM/YY
	const m = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
	if (!m) return false;

	const month = parseInt(m[1], 10);
	const year = parseInt(m[2], 10); // two-digit year

	const now = new Date();
	const currentFullYear = now.getFullYear();
	const currentTwoDigit = currentFullYear % 100;
	const currentMonth = now.getMonth() + 1;

	// Build full year (2000 + yy). This will be valid for cards in reasonable range
	const fullYear = 2000 + year;

	// Month already ensured by regex (01-12)
	if (month < 1 || month > 12) return false;

	// Year must be current year or in the future
	if (fullYear < currentFullYear) return false;

	// If same year, month must be current or later
	if (fullYear === currentFullYear && month < currentMonth) return false;

	// Prevent unrealistically far future expiration (e.g., > 20 years)
	if (fullYear > currentFullYear + 20) return false;

	return true;
}

/* ======================================================
   ZOD SCHEMA
====================================================== */
const cardSchema = z.object({
	cardNumber: z
		.string()
		.regex(/^\d{13,16}$/)
		.refine(luhnCheck, "Número do cartão inválido")
		.refine((n) => detectBrand(n) !== "unknown", "Bandeira não suportada"),

	cardName: z
		.string()
		.min(3, "Nome inválido")
		.max(60)
		.regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome inválido"),

	cardExpiry: z.string().refine(validExpiry, "Validade inválida"),

	cardCvv: z.string().regex(/^\d{3,4}$/, "CVV inválido (3 ou 4 dígitos)"),

	email: z.string().email("Email inválido"),
});

/* ======================================================
   ICONES
====================================================== */
const brandIcons = {
	visa: visaIcon,
	mastercard: mcIcon,
	elo: eloIcon,
	hipercard: hipercardIcon,
	maestro: maestroIcon,
};

/* ======================================================
   MASK
====================================================== */
function formatCardNumber(digits) {
	const clean = digits.replace(/\D/g, "").slice(0, 16);

	const parts = [];

	for (let i = 0; i < clean.length; i += 4) {
		parts.push(clean.slice(i, i + 4));
	}

	return parts.join(" ");
}

/* ======================================================
   COMPONENT
====================================================== */
const TransparentCheckoutForm = ({ bookingData, onSuccess, onError }) => {
	const { user } = useUserContext();

	const [paymentMethod, setPaymentMethod] = useState("card");

	const [cardNumber, setCardNumber] = useState("");
	const [cardBrand, setCardBrand] = useState("unknown");
	const [cardName, setCardName] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvv, setCardCvv] = useState("");
	const [email, setEmail] = useState(user?.email || "");

	const [errors, setErrors] = useState({});
	const [isFormValid, setIsFormValid] = useState(false);

	const [pixResult, setPixResult] = useState(null);
	const [generatedQr, setGeneratedQr] = useState(null);
	const [loading, setLoading] = useState(false);
	const isSubmittingRef = useRef(false);

	/* ============================= */
	const handleCardNumber = (value) => {
		const digits = value.replace(/\D/g, "").slice(0, 16);
		const brand = detectBrand(digits);

		setCardBrand(brand);
		setCardNumber(formatCardNumber(digits));
	};

	const formatExpiry = (val) => {
		const d = val.replace(/\D/g, "").slice(0, 4);
		if (d.length <= 2) return d;
		return d.slice(0, 2) + "/" + d.slice(2);
	};

	/* ============================= */
	useEffect(() => {
		const clean = cardNumber.replace(/\s+/g, "");

		const r = cardSchema.safeParse({
			cardNumber: clean,
			cardName,
			cardExpiry,
			cardCvv,
			email,
		});

		setIsFormValid(r.success);

		if (!r.success) {
			const e = {};
			r.error.issues.forEach((i) => {
				e[i.path[0]] = i.message;
			});
			setErrors(e);
		} else setErrors({});
	}, [cardNumber, cardName, cardExpiry, cardCvv, email]);

	/* ============================= */
	useEffect(() => {
		if (!pixResult?.qr_code) return setGeneratedQr(null);

		QRCode.toDataURL(pixResult.qr_code)
			.then(setGeneratedQr)
			.catch(() => setGeneratedQr(null));
	}, [pixResult?.qr_code]);

	/* ============================= */
	const onConfirm = async () => {
		if (paymentMethod !== "card") return;

		// Prevent sending if form invalid
		if (!isFormValid) {
			onError("Dados do cartão inválidos.");
			return;
		}

		// prevent double submission
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;
		setLoading(true);

		const clean = cardNumber.replace(/\s+/g, "");

		const parsed = cardSchema.safeParse({
			cardNumber: clean,
			cardName,
			cardExpiry,
			cardCvv,
			email,
		});

		if (!parsed.success) {
			onError(parsed.error.issues.map((i) => i.message).join(", "));
			isSubmittingRef.current = false;
			setLoading(false);
			return;
		}

		try {
			if (!window.MercadoPago) {
				await new Promise((res, rej) => {
					const s = document.createElement("script");
					s.src = "https://sdk.mercadopago.com/js/v2";
					s.onload = res;
					s.onerror = () => rej(new Error("SDK Mercado Pago"));
					document.head.appendChild(s);
				});
			}

			const mp = new window.MercadoPago(
				import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
				{ locale: "pt-BR" },
			);

			const [month, year] = cardExpiry.split("/");

			const tokenResponse = await mp.createCardToken({
				cardNumber: clean,
				cardExpirationMonth: month,
				cardExpirationYear: year,
				securityCode: cardCvv,
				cardholderName: cardName,
				identificationType: "CPF",
				identificationNumber: "00000000000",
			});

			const token = tokenResponse?.id;
			if (!token) throw new Error("Token não gerado");

			// Additional defensive validation: ensure token card info matches user input when available
			const cardInfo =
				tokenResponse?.card ||
				tokenResponse?.cardholder ||
				tokenResponse?.cardholder_info ||
				null;
			if (cardInfo) {
				const expMonthRaw =
					cardInfo.expiration_month ||
					cardInfo.exp_month ||
					cardInfo.expirationMonth ||
					cardInfo.exp_months;
				const expYearRaw =
					cardInfo.expiration_year ||
					cardInfo.exp_year ||
					cardInfo.expirationYear ||
					cardInfo.exp_years;
				const expMonth = expMonthRaw ? Number(expMonthRaw) : null;
				let expYear = null;
				if (expYearRaw) {
					const s = String(expYearRaw);
					expYear = s.length === 4 ? Number(s.slice(-2)) : Number(s);
				}

				const inputMonth = Number(month);
				const inputYear = Number(year);

				if (expMonth && expMonth !== inputMonth) {
					throw new Error(
						"Validade do cartão (mês) não corresponde ao token gerado",
					);
				}
				if (expYear && expYear !== inputYear) {
					throw new Error(
						"Validade do cartão (ano) não corresponde ao token gerado",
					);
				}

				const last4 = clean.slice(-4);
				const tokenLast4 =
					cardInfo.last_four || cardInfo.last4 || cardInfo.lastDigits;
				if (tokenLast4 && String(tokenLast4) !== String(last4)) {
					throw new Error(
						"Últimos dígitos do cartão não correspondem ao token gerado",
					);
				}
			}

			const bin = clean.slice(0, 6);
			const pm = await mp.getPaymentMethods({ bin });
			const paymentMethodId = pm?.results?.[0]?.id;

			if (!paymentMethodId) throw new Error("Bandeira não identificada");

			const payload = {
				...bookingData,
				token,
				paymentMethodId,
				issuerId: null,
				installments: 1,
				identificationType: "CPF",
				identificationNumber: "00000000000",
				email,
			};

			const { data } = await axios.post("/api/payments/transparent", payload);

			// Use backend authoritative response: success + booking indicate success
			if (data && data.success === true && data.booking) {
				onSuccess(data);
			} else {
				onError(data?.message || "Pagamento não aprovado");
			}
		} catch (err) {
			onError(
				err?.response?.data?.message ||
					err?.message ||
					"Erro ao processar pagamento",
			);
		} finally {
			setLoading(false);
			isSubmittingRef.current = false;
		}
	};
	/* ======================================================
     UI
  ====================================================== */
	return (
		<div className="p-8 w-full max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-6">Pagamento</h2>

			<div className="grid grid-cols-2 gap-3 mb-6">
				<button
					onClick={() => setPaymentMethod("card")}
					className={`p-4 rounded-xl border-2 ${
						paymentMethod === "card" ? "border-black" : "border-gray-300"
					}`}
				>
					<CreditCard className="w-6 h-6 mx-auto mb-2" />
					Cartão
				</button>

				<button
					onClick={() => setPaymentMethod("pix")}
					className={`p-4 rounded-xl border-2 ${
						paymentMethod === "pix" ? "border-black" : "border-gray-300"
					}`}
				>
					PIX
				</button>
			</div>

			{paymentMethod === "card" ? (
				<div className="space-y-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Número do cartão"
							value={cardNumber}
							onChange={(e) => handleCardNumber(e.target.value)}
							className="w-full p-3 border rounded-xl"
						/>
						{cardBrand !== "unknown" && (
							<img
								src={brandIcons[cardBrand]}
								alt={cardBrand}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-6 object-contain"
							/>
						)}
					</div>

					{errors.cardNumber && (
						<p className="text-red-500 flex gap-1 items-center text-sm">
							<AlertCircle size={18} /> {errors.cardNumber}
						</p>
					)}

					<input
						type="text"
						placeholder="Nome no cartão"
						value={cardName}
						onChange={(e) => setCardName(e.target.value)}
						className="w-full p-3 border rounded-xl"
					/>
					{errors.cardName && (
						<p className="text-red-500 flex gap-1 items-center text-sm">
							<AlertCircle size={18} /> {errors.cardName}
						</p>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col space-y-4">
							<input
								type="text"
								placeholder="MM/AA"
								value={cardExpiry}
								onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
								className="w-full p-3 border rounded-xl"
							/>
							{errors.cardExpiry && (
								<p className="text-red-500 flex gap-1 items-center text-sm">
									<AlertCircle size={18} /> {errors.cardExpiry}
								</p>
							)}
						</div>

						<div className="flex flex-col space-y-4">
							<input
								type="text"
								placeholder="CVV"
								value={cardCvv}
								onChange={(e) =>
									setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
								}
								className="w-full p-3 border rounded-xl"
							/>

							{errors.cardCvv && (
								<p className="text-red-500 flex gap-1 items-center text-sm">
									<AlertCircle size={18} /> {errors.cardCvv}
								</p>
							)}
						</div>
					</div>

					<button
						onClick={onConfirm}
						disabled={!isFormValid || loading}
						className="w-full bg-black text-white p-4 rounded-xl"
					>
						{loading ? "Processando..." : "Confirmar Pagamento"}
					</button>
				</div>
			) : (
				<div className="text-center">
					{generatedQr ? (
						<img src={generatedQr} alt="QR PIX" className="w-48 h-48 mx-auto" />
					) : (
						<p>Gerando QR Code...</p>
					)}
				</div>
			)}

			<div className="flex justify-center mt-4 text-sm text-gray-500">
				<Lock className="w-4 h-4 mr-2" />
				Transação segura
			</div>
		</div>
	);
};

export default TransparentCheckoutForm;
