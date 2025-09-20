import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Terminal, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const Message = ({ type = "info", message, open, onOpenChange }) => {
	if (!message) return null;

	const config = {
		info: {
			icon: <Terminal className="h-5 w-5" />,
			title: "Aviso",
			style: "",
		},
		success: {
			icon: <CheckCircle className="h-5 w-5 text-green-600" />,
			title: "Sucesso!",
			style: "text-green-600 border-green-600",
		},
		warning: {
			icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
			title: "Atenção!",
			style: "text-yellow-600 !border-yellow-500",
		},
		error: {
			icon: <XCircle className="h-5 w-5 text-red-600" />,
			title: "Erro",
			style: "text-red-600 border-red-600",
		},
	};

	const { icon, title, style } = config[type] || config.info;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className={`!max-w-sm w-full !border-3 ${style}`}>
				<AlertDialogHeader>
					<div className="flex items-center gap-2">
						{icon}
						<AlertDialogTitle className={style}>{title}</AlertDialogTitle>
					</div>
					<AlertDialogDescription>{message}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="cursor-pointer text-gray-700">
						Fechar
					</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Message;
