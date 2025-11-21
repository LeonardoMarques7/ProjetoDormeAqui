import { useEffect } from "react";
import { toast } from "sonner";
import { Terminal, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

const Message = ({ type, message, open, onOpenChange }) => {
	useEffect(() => {
		// Só dispara o toast quando open for true
		if (!open || !message) return;

		const config = {
			info: {
				icon: <Terminal className="h-5 w-5" />,
				title: "Aviso",
				className: "",
			},
			success: {
				icon: <CheckCircle className="h-5 w-5 text-green-600" />,
				title: "Sucesso!",
				className: "border-green-600",
			},
			warning: {
				icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
				title: "Atenção!",
				className: "border-yellow-500",
			},
			error: {
				icon: <XCircle className="h-5 w-5 text-red-600" />,
				title: "Erro",
				className: "border-red-600",
			},
		};

		const { icon, title, className } = config[type] || config.info;

		toast.custom(
			(t) => (
				<div
					className={`bg-white rounded-lg shadow-lg p-4 max-w-sm w-full border-l-4 ${className}`}
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">{icon}</div>
						<div className="flex-1">
							<h3 className="font-semibold text-sm mb-1">{title}</h3>
							<p className="text-sm text-gray-600">{message}</p>
						</div>
						<button
							onClick={() => toast.dismiss(t)}
							className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="mt-3 flex justify-end">
						<button
							onClick={() => toast.dismiss(t)}
							className="text-sm text-gray-700 hover:text-gray-900 font-medium"
						>
							Fechar
						</button>
					</div>
				</div>
			),
			{
				duration: 5000,
				onDismiss: () => onOpenChange(false),
				onAutoClose: () => onOpenChange(false),
			}
		);

		// Reseta o estado após mostrar
		onOpenChange(false);
	}, [open, message, type, onOpenChange]);

	return null;
};

export default Message;
