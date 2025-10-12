// src/components/ui/AlertDialog.jsx
import {
	AlertDialog as ShadAlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function AlertDialog({
	title,
	description,
	onConfirm,
	trigger,
}) {
	return (
		<ShadAlertDialog>
			<AlertDialogTrigger className="cursor-pointer hover:bg-red-600 transition-all bg-red-500 text-white font-bold w-fit px-5 py-2.5 rounded-md">
				{trigger}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex justify-end mt-5 gap-2">
					<AlertDialogCancel className="cursor-pointer">
						Cancelar
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-600 hover:bg-red-700 cursor-pointer"
						onClick={onConfirm}
					>
						Confirmar
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</ShadAlertDialog>
	);
}
