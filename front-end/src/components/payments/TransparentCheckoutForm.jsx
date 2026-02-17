import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AlertCircle, CreditCard, Lock } from "lucide-react";
import QRCode from "qrcode";
import { useUserContext } from "@/components/contexts/UserContext";

const loadMercadoPagoSdk = () =>
	new Promise((resolve, reject) => {
		if (window.MercadoPago) return resolve();

		const script = document.createElement("script");
		script.src = "https://sdk.mercadopago.com/js/v2";
		script.onload = resolve;
		script.onerror = () => reject(new Error("SDK Mercado Pago"));
		document.head.appendChild(script);
	});

const TransparentCheckoutForm = ({ bookingData, onSuccess, onError }) => {
	const { user } = useUserContext();
	const amountValue = bookingData?.totalPrice
		? Number(bookingData.totalPrice)
		: 0;

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [email, setEmail] = useState(user?.email || "");
	const [cardholderName, setCardholderName] = useState("");
	const [formError, setFormError] = useState("");
	const [pixResult, setPixResult] = useState(null);
	const [generatedQr, setGeneratedQr] = useState(null);
	const [loading, setLoading] = useState(false);

	const isSubmittingRef = useRef(false);
	const cardFormRef = useRef(null);

	// Adicionar estilos globais para iframes do Mercado Pago
	useEffect(() => {
		const style = document.createElement("style");
		style.textContent = `
			#form-checkout__cardNumber iframe,
			#form-checkout__expirationDate iframe,
			#form-checkout__securityCode iframe {
				width: 100% !important;
				height: 48px !important;
				border: none !important;
				display: block !important;
				visibility: visible !important;
			}
		`;
		document.head.appendChild(style);
		return () => document.head.removeChild(style);
	}, []);

	useEffect(() => {
		if (!pixResult?.qr_code) return setGeneratedQr(null);

		QRCode.toDataURL(pixResult.qr_code)
			.then(setGeneratedQr)
			.catch(() => setGeneratedQr(null));
	}, [pixResult?.qr_code]);

	useEffect(() => {
		if (paymentMethod !== "card") return;

		let isMounted = true;
		const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

		const setupCardForm = async () => {
			try {
				setFormError("");
				if (!publicKey) {
					setFormError("Chave publica do Mercado Pago nao configurada.");
					return;
				}
				if (cardFormRef.current?.unmount) {
					cardFormRef.current.unmount();
					cardFormRef.current = null;
				}

				await loadMercadoPagoSdk();
				if (!isMounted) return;
				if (!amountValue || Number.isNaN(amountValue)) {
					setFormError("Valor da reserva indisponivel para calcular parcelas.");
					return;
				}

				// Aguardar elementos estarem no DOM
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Verificar se elementos existem
				const requiredElements = [
					"form-checkout__cardNumber",
					"form-checkout__expirationDate",
					"form-checkout__securityCode",
					"form-checkout__installments",
				];

				const missingElements = requiredElements.filter(
					(id) => !document.getElementById(id),
				);

				if (missingElements.length > 0) {
					console.error("Elementos faltando no DOM:", missingElements);
					setFormError("Formulario nao carregado completamente.");
					return;
				}

				const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
				const amount = String(amountValue);

				console.log("Inicializando cardForm com amount:", amount);

				cardFormRef.current = mp.cardForm({
					amount,
					autoMount: true,
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
							placeholder: "MM/AA",
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
								setFormError(
									error?.message ||
										"Falha ao carregar os campos seguros do cartao.",
								);
							} else {
								console.log("CardForm montado com sucesso!");
								// Verificar se iframes foram criados
								setTimeout(() => {
									const cardNumberIframe = document.querySelector('#form-checkout__cardNumber iframe');
									const expirationIframe = document.querySelector('#form-checkout__expirationDate iframe');
									const securityCodeIframe = document.querySelector('#form-checkout__securityCode iframe');
									console.log("Iframes detectados:", {
										cardNumber: !!cardNumberIframe,
										expiration: !!expirationIframe,
										securityCode: !!securityCodeIframe
									});
									if (cardNumberIframe) {
										console.log("CardNumber iframe:", cardNumberIframe.style.cssText);
									}
								}, 500);
							}
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

								const { data } = await axios.post(
									"/payments/transparent",
									payload,
								);

								if (data && data.success === true) {
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

			} catch (error) {
				console.error("Erro ao configurar o checkout:", error);
				setFormError(error?.message || "Erro ao configurar o checkout.");
			}
		};

		setupCardForm();

		return () => {
			isMounted = false;
			cardFormRef.current?.unmount?.();
			cardFormRef.current = null;
		};
	}, [paymentMethod, amountValue]);

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
					Cartao
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
				<form id="form-checkout" className="space-y-4">
					<div className="text-sm text-gray-600">
						Preencha os dados do cartao e do titular para concluir o pagamento.
					</div>

					<label className="block text-sm font-medium text-gray-700">
						Nome no cartao
					</label>
					<input
						id="form-checkout__cardholderName"
						type="text"
						placeholder="Nome no cartao"
						value={cardholderName}
						onChange={(event) => setCardholderName(event.target.value)}
						className="w-full p-3 border rounded-xl"
					/>

					<label className="block text-sm font-medium text-gray-700">
						Email do titular
					</label>
					<input
						id="form-checkout__cardholderEmail"
						type="email"
						placeholder="Email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full p-3 border rounded-xl"
					/>

					<label className="block text-sm font-medium text-gray-700">
						Numero do cartao
					</label>
					<input
						id="form-checkout__cardNumber"
						type="text"
						placeholder="Numero do cartao"
						className="w-full p-3 border rounded-xl"
					/>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Validade (MM/AA)
							</label>
							<input
								id="form-checkout__expirationDate"
								type="text"
								placeholder="MM/AA"
								className="w-full p-3 border rounded-xl"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								CVV
							</label>
							<input
								id="form-checkout__securityCode"
								type="text"
								placeholder="CVV"
								className="w-full p-3 border rounded-xl"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Tipo de documento
							</label>
							<select
								id="form-checkout__identificationType"
								className="w-full p-3 border rounded-xl"
								defaultValue="CPF"
							>
								<option value="CPF">CPF</option>
								<option value="CNPJ">CNPJ</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Numero do documento
							</label>
							<input
								id="form-checkout__identificationNumber"
								type="text"
								placeholder="CPF"
								className="w-full p-3 border rounded-xl"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="col-span-2">
							<label className="block text-sm font-medium text-gray-700">
								Parcelas
							</label>
							<select
								id="form-checkout__installments"
								className="w-full p-3 border rounded-xl"
							>
								<option value="" disabled>
									Selecione
								</option>
							</select>
							<p className="text-xs text-gray-500 mt-1">
								As parcelas sao carregadas automaticamente pelo Mercado Pago.
							</p>
						</div>
					</div>

					<select
						id="form-checkout__issuer"
						className="hidden"
						aria-hidden="true"
						tabIndex={-1}
					/>

					{formError && (
						<p className="text-red-500 flex gap-1 items-center text-sm">
							<AlertCircle size={18} /> {formError}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-black text-white p-4 rounded-xl"
					>
						{loading ? "Processando..." : "Confirmar Pagamento"}
					</button>
				</form>
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
				Transacao segura
			</div>
		</div>
	);
};

export default TransparentCheckoutForm;
