// src/components/account/DeleteAccountDialog.jsx
import AlertDialog from "../components/ui/AlerDialog";

export default function DeleteAccountDialog({ onDelete }) {
	return (
		<AlertDialog
			trigger="Excluir Conta"
			title="Tem certeza que deseja excluir sua conta?"
			description="Essa ação é irreversível e todos os seus dados serão apagados."
			onConfirm={onDelete}
		/>
	);
}
