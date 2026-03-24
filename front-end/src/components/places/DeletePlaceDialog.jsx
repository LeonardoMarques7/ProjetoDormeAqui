import { useState } from "react";
import {
	AlertDialog as ShadAlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export default function DeletePlaceDialog({
	onDelete,
	open,
	onOpenChange,
	placeName,
}) {
	const [confirmText, setConfirmText] = useState("");
	const isConfirmed = confirmText.toLowerCase() === "deletar";

	const handleConfirm = () => {
		if (isConfirmed) {
			onDelete();
			setConfirmText("");
		}
	};

	const handleOpenChange = (newOpen) => {
		if (!newOpen) {
			setConfirmText("");
		}
		onOpenChange(newOpen);
	};

	return (
		<ShadAlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent className="max-w-md! bg-gradient-to-br from-slate-50 to-slate-100">
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<AlertDialogTitle className="text-xl font-bold text-gray-900">
							Excluir Acomodação
						</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="text-gray-700 mt-3 space-y-3">
						<p className="font-semibold text-gray-800">
							Você está prestes a excluir:{" "}
							<span className="text-red-600">
								"{placeName || "este lugar"}"
							</span>
						</p>
						<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
							<p className="font-medium mb-1">⚠️ Aviso importante:</p>
							<p>
								Esta ação é irreversível. Todas as reservas e avaliações
								associadas serão mantidas no histórico, mas a acomodação não
								será mais visível para novos hóspedes.
							</p>
						</div>
						<p className="text-gray-600 text-sm">
							Para confirmar a exclusão, digite{" "}
							<span className="font-mono font-bold bg-gray-200 px-2 py-1 rounded">
								deletar
							</span>{" "}
							abaixo:
						</p>
						<input
							type="text"
							placeholder="Digite 'deletar' para confirmar"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-500"
						/>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="flex justify-end gap-3 mt-6">
					<AlertDialogCancel
						className="px-4 py-2 rounded-lg  bg-white text-gray-900 font-medium hover:bg-gray-100 cursor-pointer transition-colors"
						onClick={() => setConfirmText("")}
					>
						Cancelar
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={!isConfirmed}
						className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all ${
							isConfirmed
								? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
								: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
						}`}
					>
						Excluir Permanentemente
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</ShadAlertDialog>
	);
}
