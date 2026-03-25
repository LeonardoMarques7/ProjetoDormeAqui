/**
 * Mapeamento de status de booking para exibição e funcionalidades frontend
 */

export const BOOKING_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  EVALUATION: "evaluation",
  REVIEW: "review",
  COMPLETED: "completed",
  CANCELED: "canceled",
  REJECTED: "rejected",
};

export const BOOKING_STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    description: "Aguardando confirmação de pagamento",
    color: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
    borderClass: "border-yellow-200",
    canCancel: false,
    canEvaluate: false,
    canReview: false,
  },
  confirmed: {
    label: "Confirmado",
    description: "Pagamento aprovado, pronto para check-in",
    color: "green",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
    borderClass: "border-green-200",
    canCancel: true,
    canEvaluate: false,
    canReview: false,
  },
  in_progress: {
    label: "Em Andamento",
    description: "Hospedagem em progresso",
    color: "blue",
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
    borderClass: "border-blue-200",
    canCancel: false,
    canEvaluate: false,
    canReview: false,
  },
  evaluation: {
    label: "Avaliação",
    description: "Aguardando avaliação do hóspede",
    color: "purple",
    bgClass: "bg-purple-100",
    textClass: "text-purple-800",
    borderClass: "border-purple-200",
    canCancel: false,
    canEvaluate: true,
    canReview: true,
  },
  review: {
    label: "Revisão",
    description: "Sob revisão do moderador",
    color: "orange",
    bgClass: "bg-orange-100",
    textClass: "text-orange-800",
    borderClass: "border-orange-200",
    canCancel: false,
    canEvaluate: false,
    canReview: true,
  },
  completed: {
    label: "Finalizado",
    description: "Reserva finalizada",
    color: "gray",
    bgClass: "bg-gray-100",
    textClass: "text-gray-800",
    borderClass: "border-gray-200",
    canCancel: false,
    canEvaluate: false,
    canReview: false,
  },
  canceled: {
    label: "Cancelado",
    description: "Reserva cancelada",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    borderClass: "border-red-200",
    canCancel: false,
    canEvaluate: false,
    canReview: false,
  },
  rejected: {
    label: "Rejeitado",
    description: "Pagamento foi rejeitado",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    borderClass: "border-red-200",
    canCancel: false,
    canEvaluate: false,
    canReview: false,
  },
};

/**
 * Define transições de estado permitidas
 * Formato: { fromStatus: [allowedToStatuses] }
 */
export const BOOKING_STATE_TRANSITIONS = {
  pending: ["confirmed", "rejected"],
  confirmed: ["in_progress", "canceled"],
  in_progress: ["evaluation"],
  evaluation: ["review", "completed"],
  review: ["completed"],
  completed: [],
  canceled: [],
  rejected: [],
};

/**
 * Retorna a configuração visual de um status
 */
export const getStatusConfig = (status) => {
  return BOOKING_STATUS_CONFIG[status] || BOOKING_STATUS_CONFIG.pending;
};

/**
 * Verifica se uma transição de estado é permitida
 */
export const isTransitionAllowed = (fromStatus, toStatus) => {
  const allowedTransitions = BOOKING_STATE_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

/**
 * Retorna os estados para os quais uma reserva pode transicionar
 */
export const getAllowedTransitions = (currentStatus) => {
  return BOOKING_STATE_TRANSITIONS[currentStatus] || [];
};
