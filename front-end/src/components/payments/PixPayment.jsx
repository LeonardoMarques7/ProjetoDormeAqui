import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";

const PixPayment = ({ bookingData, onSuccess, onError }) => {
	const [loading, setLoading] = useState(true);
	const [pixData, setPixData] = useState(null);
	const [copied, setCopied] = useState(false);
	const [statusMsg, setStatusMsg] = useState("");
	const [approved, setApproved] = useState(false);
	const pollRef = useRef(null);
	const { user } = useUserContext();

	const startPolling = (paymentId) => {
		pollRef.current = setInterval(async () => {
			try {
				const { data } = await axios.get(`/payments/pix/status/${paymentId}`);
				if (data.status === "approved") {
					clearInterval(pollRef.current);
					setApproved(true);
					setStatusMsg("Pagamento confirmado! 🎉");
					onSuccess({ paymentId, status: "approved" });
				} else if (
					data.status === "rejected" ||
					data.status === "cancelled"
				) {
					clearInterval(pollRef.current);
					setStatusMsg("Pix expirado ou recusado.");
					onError("Pagamento Pix não concluído.");
				}
			} catch {
				// ignora erros de poll temporários
			}
		}, 5000);
	};

	useEffect(() => {
		const createPix = async () => {
			try {
				const { data } = await axios.post("/payments/pix", {
					...bookingData,
					email: user?.email,
				});
				if (data.success) {
					setPixData(data);
					startPolling(data.paymentId);
				} else {
					onError(data.message || "Erro ao criar Pix.");
				}
			} catch (err) {
				onError(
					err?.response?.data?.message ||
						err?.message ||
						"Erro ao criar Pix.",
				);
			} finally {
				setLoading(false);
			}
		};

		createPix();
		return () => clearInterval(pollRef.current);
	}, []);

	const copyCode = () => {
		if (!pixData?.qr_code) return;
		navigator.clipboard.writeText(pixData.qr_code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center gap-3 py-10 text-gray-500">
				<div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
				<p className="text-sm">Gerando Pix...</p>
			</div>
		);
	}

	if (!pixData) return null;

	return (
		<div className="flex flex-col items-center gap-4 py-2">
			<p className="text-sm text-gray-600 text-center">
				Escaneie o QR Code ou copie o código Pix
			</p>

			{pixData.qr_code_base64 ? (
				<img
					src={`data:image/png;base64,${pixData.qr_code_base64}`}
					alt="QR Code Pix"
					className="w-44 h-44 border rounded-xl"
				/>
			) : (
				<div className="w-44 h-44 border rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2">
					QR Code indisponível
				</div>
			)}

			{/* Copia e cola */}
			<div className="w-full">
				<p className="text-xs text-gray-500 mb-1 font-medium">
					Pix Copia e Cola
				</p>
				<div className="flex gap-2">
					<input
						readOnly
						value={pixData.qr_code || ""}
						className="flex-1 text-xs p-2.5 border rounded-lg bg-gray-50 truncate focus:outline-none"
					/>
					<button
						type="button"
						onClick={copyCode}
						className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
							copied
								? "bg-green-500 text-white"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{copied ? "✓ Copiado!" : "Copiar"}
					</button>
				</div>
			</div>

			{/* Status */}
			{approved ? (
				<p className="text-sm font-semibold text-green-600">{statusMsg}</p>
			) : statusMsg ? (
				<p className="text-sm font-medium text-red-600">{statusMsg}</p>
			) : (
				<div className="flex items-center gap-2 text-xs text-gray-400">
					<span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
					Aguardando pagamento...
				</div>
			)}

			<p className="text-xs text-gray-400 text-center">
				O código expira em 30 minutos. Após o pagamento a reserva é confirmada
				automaticamente.
			</p>
		</div>
	);
};

export default PixPayment;
