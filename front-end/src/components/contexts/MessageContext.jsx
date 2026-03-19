// MessageContext.jsx - COMPATIBILIDADE
// Este arquivo mantém a API antiga compatível com o novo sistema de notificações
// Qualquer chamada a showMessage() será redirecionada para addNotification() com templates

import { createContext, useContext } from "react";
import { useNotification } from "./NotificationContext";
import { notificationTemplates } from "../common/NotificationTemplate";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
	return (
		<MessageContext.Provider value={{}}>{children}</MessageContext.Provider>
	);
};

export const useMessage = () => {
	const { addNotification } = useNotification();

	const showMessage = (message, type = "info", title = null) => {
		// Mapa de tipos antigos para templates novos
		const templateMap = {
			success: () => ({
				title: title || "Sucesso",
				message: message,
				type: "success",
			}),
			error: () => ({
				title: title || "Erro",
				message: message,
				type: "error",
			}),
			warning: () => ({
				title: title || "Aviso",
				message: message,
				type: "warning",
			}),
			info: () => ({
				title: title || "Informação",
				message: message,
				type: "info",
			}),
		};

		// Se houver template para este tipo, usar; senão, criar padrão
		const notificationData = templateMap[type]
			? templateMap[type]()
			: {
					title: title || "Notificação",
					message: message,
					type: "system",
				};

		addNotification(notificationData);
	};

	return { showMessage };
};
