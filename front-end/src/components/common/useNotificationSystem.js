import { useNotification } from "@/components/contexts/NotificationContext";
import { useNotificationTemplates } from "@/components/common/NotificationTemplate";

// Hook customizado que combina notificações com templates
export const useNotificationSystem = () => {
	const context = useNotification();
	const templates = useNotificationTemplates(context.addNotification);

	return {
		...context,
		...templates,
		// Função auxiliar para notificações personalizadas
		notify: (title, message, type = "system", icon = null) => {
			return context.addNotification({
				title,
				message,
				type,
				titleType: "sistema",
			});
		},
		// Função auxiliar para sucesso
		success: (title, message = "") => {
			return context.addNotification({
				title,
				message,
				type: "success",
				titleType: "sucesso",
			});
		},
		// Função auxiliar para erro
		error: (title, message = "") => {
			return context.addNotification({
				title,
				message,
				type: "error",
				titleType: "erro",
			});
		},
		// Função auxiliar para aviso
		warning: (title, message = "") => {
			return context.addNotification({
				title,
				message,
				type: "warning",
				titleType: "aviso",
			});
		},
		// Função auxiliar para informação
		info: (title, message = "") => {
			return context.addNotification({
				title,
				message,
				type: "info",
				titleType: "informações",
			});
		},
	};
};

export default useNotificationSystem;
