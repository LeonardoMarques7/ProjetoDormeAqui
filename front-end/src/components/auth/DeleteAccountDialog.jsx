import AlertDialog from "@/components/ui/AlertDialog";

export default function DeleteAccountDialog({ onDelete, open, onOpenChange }) {
	return (
		<AlertDialog
			trigger="Deletar conta"
			title="Tem certeza que deseja excluir sua conta?"
			description="Essa ação é irreversível e todos os seus dados serão apagados."
			onConfirm={onDelete}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}
