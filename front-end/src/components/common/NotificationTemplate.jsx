// Sistema de templates para notificações personalizadas
// Cada template pode ser customizado com emojis, títulos e mensagens amigáveis

export const notificationTemplates = {
	// Boas-vindas
	welcome: {
		title: "👋 Bem-vindo ao DormeAqui!",
		message: "Esperamos que você encontre o lugar perfeito para descansar.",
		type: "welcome",
		icon: "👋",
	},

	// Login
	loginSuccess: {
		title: "Olá novamente!",
		message: "Que bom ver você de volta ao DormeAqui.",
		type: "system",
		icon: "👋",
	},

	// Logout
	logoutSuccess: {
		title: "Até logo 👋",
		message:
			"Esperamos que tenha curtido sua experiência no DormeAqui. Volte sempre que precisar de um lugar para descansar.",
		type: "goodbye",
		icon: "👋",
	},

	// Cadastro de acomodação
	accommodationCreated: {
		title: "🏠 Sua acomodação foi cadastrada!",
		message: "Agora ela já pode ser encontrada por viajantes.",
		type: "system",
		icon: "🏠",
	},

	// Atualização de preço
	priceUpdated: {
		title: "💸 Boa notícia!",
		message: "O valor de uma acomodação ficou mais barato. Talvez seja um ótimo momento para reservar.",
		type: "platform",
		icon: "💸",
	},

	// Reserva confirmada
	reservationConfirmed: {
		title: "🎉 Reserva confirmada!",
		message: "Sua estadia está garantida.",
		type: "reservation",
		icon: "🎉",
	},

	// Reserva cancelada
	reservationCanceled: {
		title: "❌ Reserva cancelada",
		message: "A sua reserva foi cancelada. Se foi engano, você ainda pode fazer uma nova reserva.",
		type: "reservation",
		icon: "❌",
	},

	// Lembretes de reserva - 5 dias
	reservationReminder5Days: {
		title: "📅 Sua viagem está chegando!",
		message: "Faltam 5 dias para sua reserva. Aproveite os últimos dias para planejar sua viagem!",
		type: "reservation",
		icon: "📅",
	},

	// Lembretes de reserva - 1 dia
	reservationReminder1Day: {
		title: "🧳 Amanhã é o dia!",
		message: "Prepare suas malas e aproveite sua estadia.",
		type: "reservation",
		icon: "🧳",
	},

	// Pagamento bem-sucedido
	paymentSuccess: {
		title: "💳 Pagamento recebido!",
		message: "Seu pagamento foi processado com sucesso.",
		type: "payment",
		icon: "💳",
	},

	// Pagamento falhou
	paymentFailed: {
		title: "⚠️ Erro no pagamento",
		message: "Não conseguimos processar seu pagamento. Tente novamente.",
		type: "error",
		icon: "⚠️",
	},

	// Avaliação solicitada
	reviewRequested: {
		title: "⭐ Como foi sua estadia?",
		message: "Sua avaliação ajuda outros viajantes a encontrar ótimos lugares.",
		type: "message",
		icon: "⭐",
	},

	// Mensagem de hospedeiro
	hostMessage: {
		title: "💬 Você recebeu uma mensagem",
		message: "Um hospedeiro respondeu sua mensagem.",
		type: "message",
		icon: "💬",
	},

	// Documentos pendentes
	documentsPending: {
		title: "📄 Documentos pendentes",
		message: "Complete seu perfil enviando os documentos necessários.",
		type: "system",
		icon: "📄",
	},

	// Sucesso genérico
	success: {
		title: "✅ Sucesso!",
		message: "Operação realizada com sucesso.",
		type: "success",
		icon: "✅",
	},

	// Erro genérico
	error: {
		title: "❌ Erro",
		message: "Ocorreu um erro na operação. Tente novamente.",
		type: "error",
		icon: "❌",
	},

	// Aviso genérico
	warning: {
		title: "⚠️ Atenção",
		message: "Verifique sua ação e tente novamente.",
		type: "warning",
		icon: "⚠️",
	},

	// Informação genérica
	info: {
		title: "ℹ️ Informação",
		message: "Aqui está a informação que você solicitou.",
		type: "info",
		icon: "ℹ️",
	},
};

// Função auxiliar para criar notificações a partir de templates
export const createNotificationFromTemplate = (templateKey, overrides = {}) => {
	const template = notificationTemplates[templateKey];

	if (!template) {
		console.warn(`Template '${templateKey}' não encontrado`);
		return null;
	}

	return {
		...template,
		...overrides,
		id: overrides.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		createdAt: overrides.createdAt || new Date().toISOString(),
		read: overrides.read ?? false,
	};
};

// Hook custom para usar templates facilmente
export const useNotificationTemplates = (addNotification) => {
	return {
		showWelcome: (overrides) =>
			addNotification(
				createNotificationFromTemplate("welcome", overrides)
			),
		showLoginSuccess: (overrides) =>
			addNotification(
				createNotificationFromTemplate("loginSuccess", overrides)
			),
		showLogoutSuccess: (overrides) =>
			addNotification(
				createNotificationFromTemplate("logoutSuccess", overrides)
			),
		showAccommodationCreated: (overrides) =>
			addNotification(
				createNotificationFromTemplate("accommodationCreated", overrides)
			),
		showPriceUpdated: (overrides) =>
			addNotification(
				createNotificationFromTemplate("priceUpdated", overrides)
			),
		showReservationConfirmed: (overrides) =>
			addNotification(
				createNotificationFromTemplate("reservationConfirmed", overrides)
			),
		showReservationCanceled: (overrides) =>
			addNotification(
				createNotificationFromTemplate("reservationCanceled", overrides)
			),
		showReservationReminder5Days: (overrides) =>
			addNotification(
				createNotificationFromTemplate("reservationReminder5Days", overrides)
			),
		showReservationReminder1Day: (overrides) =>
			addNotification(
				createNotificationFromTemplate("reservationReminder1Day", overrides)
			),
		showPaymentSuccess: (overrides) =>
			addNotification(
				createNotificationFromTemplate("paymentSuccess", overrides)
			),
		showPaymentFailed: (overrides) =>
			addNotification(
				createNotificationFromTemplate("paymentFailed", overrides)
			),
		showReviewRequested: (overrides) =>
			addNotification(
				createNotificationFromTemplate("reviewRequested", overrides)
			),
		showHostMessage: (overrides) =>
			addNotification(
				createNotificationFromTemplate("hostMessage", overrides)
			),
		showDocumentsPending: (overrides) =>
			addNotification(
				createNotificationFromTemplate("documentsPending", overrides)
			),
		showSuccess: (overrides) =>
			addNotification(
				createNotificationFromTemplate("success", overrides)
			),
		showError: (overrides) =>
			addNotification(
				createNotificationFromTemplate("error", overrides)
			),
		showWarning: (overrides) =>
			addNotification(
				createNotificationFromTemplate("warning", overrides)
			),
		showInfo: (overrides) =>
			addNotification(
				createNotificationFromTemplate("info", overrides)
			),
	};
};

export default notificationTemplates;
