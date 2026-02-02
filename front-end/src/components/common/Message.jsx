import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import icon__default from "@/assets/icons/icon__default.png";
import icon__success from "@/assets/icons/icon__success.png";
import icon__warning from "@/assets/icons/icon__warning.png";
import icon__error from "@/assets/icons/icon__error.png";

const Message = ({ type, message, open, onOpenChange }) => {
	useEffect(() => {
		// Só dispara o toast quando open for true
		if (!open || !message) return;

		const config = {
			info: {
				icon: icon__default,
				title: "Notificação",
				className: "border-blue-500",
			},
			success: {
				icon: icon__success,
				title: "Sucesso!",
				className: "border-green-500",
			},
			warning: {
				icon: icon__warning,
				title: "Atenção!",
				className: "border-yellow-500",
			},
			error: {
				icon: icon__error,
				title: "Erro",
				className: "border-red-500",
			},
		};
		const { icon, title, className } = config[type] || config.info;

		toast.custom(
			(t) => (
				<div
					className={`bg-white rounded-lg shadow-lg p-4 max-w-sm w-full border-l-4 ${className}
					`}
				>
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0">
							<img src={icon} className="w-8 h-8" alt="Icon da notificação" />
						</div>
						<div className="flex-1 text-gray-500">
							<h6>{title}</h6>
							<p className="text-sm ">{message}</p>
						</div>
						<button
							onClick={() => toast.dismiss(t)}
							className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			),
			{
				duration: 5000,
				onDismiss: () => onOpenChange(false),
				onAutoClose: () => onOpenChange(false),
			},
		);

		// Reseta o estado após mostrar
		onOpenChange(false);
	}, [open, message, type, onOpenChange]);

	return null;
};

export default Message;
