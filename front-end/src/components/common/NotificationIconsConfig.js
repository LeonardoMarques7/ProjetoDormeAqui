import {
	AlertCircle,
	CheckCircle,
	Info,
	AlertTriangle,
	MessageSquare,
	Home,
	CreditCard,
	Gift,
	Calendar,
	LogOut,
	LogIn,
	Zap,
	Settings,
	Bell,
} from "lucide-react";

export const NOTIFICATION_ICONS_CONFIG = {
	// Sistema
	system: {
		icon: Info,
		primaryColor: "#3b82f6", // azul
		secondaryColor: "#ffffff", // branco
		bgColor: "#dbeafe", // azul claro
	},

	// Informação
	info: {
		icon: Info,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#3b82f6", // azul
		bgColor: "#dbeafe", // azul claro
	},

	// Sucesso
	success: {
		icon: CheckCircle,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#10b981", // verde
		bgColor: "#d1fae5", // verde claro
	},

	// Aviso
	warning: {
		icon: AlertTriangle,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#f59e0b", // âmbar
		bgColor: "#fef3c7", // âmbar claro
	},

	// Erro
	error: {
		icon: AlertCircle,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#ef4444", // vermelho
		bgColor: "#fee2e2", // vermelho claro
	},

	// Reserva
	reservation: {
		icon: Calendar,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#8b5cf6", // roxo
		bgColor: "#ede9fe", // roxo claro
	},

	// Pagamento
	payment: {
		icon: CreditCard,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#ec4899", // rosa
		bgColor: "#fce7f3", // rosa claro
	},

	// Mensagem
	message: {
		icon: MessageSquare,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#06b6d4", // cyan
		bgColor: "#cffafe", // cyan claro
	},

	// Plataforma
	platform: {
		icon: Zap,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#f59e0b", // âmbar
		bgColor: "#fef3c7", // âmbar claro
	},

	// Boas-vindas
	welcome: {
		icon: LogIn,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#10b981", // verde
		bgColor: "#d1fae5", // verde claro
	},

	// Despedida
	goodbye: {
		icon: LogOut,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#64748b", // cinza
		bgColor: "#f1f5f9", // cinza claro
	},

	// Promoção
	promotion: {
		icon: Gift,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#dc2626", // vermelho
		bgColor: "#fee2e2", // vermelho claro
	},

	// Default
	default: {
		icon: Bell,
		primaryColor: "#ffffff", // branco
		secondaryColor: "#3b82f6", // azul
		bgColor: "#dbeafe", // azul claro
	},
};

export const getNotificationConfig = (type) => {
	return NOTIFICATION_ICONS_CONFIG[type] || NOTIFICATION_ICONS_CONFIG.default;
};
