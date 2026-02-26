import { useState } from "react";
import { cancelBooking } from "@/services/bookingService";

const CancelButton = ({ bookingId, onCanceled }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [confirming, setConfirming] = useState(false);

	const handleCancel = async () => {
		if (!confirming) {
			setConfirming(true);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			await cancelBooking(bookingId);
			onCanceled?.();
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Erro ao cancelar reserva.";
			setError(msg);
			setConfirming(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-end gap-1">
			{confirming && !loading && (
				<p className="text-xs text-red-600 font-medium">
					Confirmar cancelamento e estorno?
				</p>
			)}
			{error && <p className="text-xs text-red-600">{error}</p>}
			<div className="flex gap-2">
				{confirming && !loading && (
					<button
						onClick={() => setConfirming(false)}
						className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
					>
						Voltar
					</button>
				)}
				<button
					onClick={handleCancel}
					disabled={loading}
					className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
						confirming
							? "bg-red-500 text-white hover:bg-red-600"
							: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
					}`}
				>
					{loading
						? "Cancelando..."
						: confirming
						? "Sim, cancelar"
						: "Cancelar reserva"}
				</button>
			</div>
		</div>
	);
};

export default CancelButton;
