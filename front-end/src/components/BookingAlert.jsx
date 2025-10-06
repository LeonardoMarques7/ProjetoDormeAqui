import { useEffect } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

function BookingAlert() {
	useEffect(() => {
		// Quando o componente é montado, exibe o alerta
		toast("Você já possui uma reserva", {
			description: "Verifique suas reservas no painel do usuário.",
			icon: <Info size={18} className="text-primary-600" />,
			duration: Infinity, // Mantém o alerta fixo até ser fechado
			closeButton: true,
			style: {
				backgroundColor: "rgb(240 249 255)", // bg-primary-100
				border: "1px solid rgb(191 219 254)", // border-primary-100
				borderRadius: "1rem",
				padding: "10px 16px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				color: "rgb(30 64 175)", // text-primary-600
				fontWeight: "500",
			},
		});
	}, []);

	return null;
}

export default BookingAlert;
