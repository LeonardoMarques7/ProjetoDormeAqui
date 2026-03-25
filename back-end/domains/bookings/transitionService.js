import Booking from "./model.js";
import mongoose from "mongoose";

/**
 * Define as transições de estado permitidas
 */
const ALLOWED_TRANSITIONS = {
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
 * Valida se uma transição é permitida
 */
export const isTransitionAllowed = (fromStatus, toStatus) => {
  const allowedTransitions = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

/**
 * Transiciona o status de uma reserva com auditoria
 * @param {string} bookingId - ID da reserva
 * @param {string} toStatus - Novo status
 * @param {Object} options - Opções adicionais
 * @param {string} options.reason - Motivo da transição
 * @param {string} options.changedBy - ID do usuário que mudou o status (para auditoria)
 * @returns {Object} Booking atualizado
 */
export const transitionBookingStatus = async (bookingId, toStatus, options = {}) => {
  const { reason = "", changedBy = null } = options;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = booking.status || "pending";

    // Validar transição
    if (!isTransitionAllowed(currentStatus, toStatus)) {
      const err = new Error(
        `Transição inválida: não é possível ir de '${currentStatus}' para '${toStatus}'.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Adicionar entrada no histórico
    if (!booking.statusHistory) {
      booking.statusHistory = [];
    }

    booking.statusHistory.push({
      status: toStatus,
      changedAt: new Date(),
      changedBy: changedBy ? new mongoose.Types.ObjectId(changedBy) : null,
      reason: reason,
    });

    // Atualizar status
    booking.status = toStatus;
    booking.lastStatusChange = new Date();

    // Lógica específica para estado de revisão
    if (toStatus === "review") {
      booking.reviewRequestedAt = new Date();
      booking.reviewRequestedBy = changedBy ? new mongoose.Types.ObjectId(changedBy) : null;
    }

    await booking.save();
    return booking;
  } catch (error) {
    throw error;
  }
};

/**
 * Solicita revisão de um booking (transição para review)
 * @param {string} bookingId - ID da reserva
 * @param {string} moderatorId - ID do moderador
 * @param {string} reviewReason - Motivo da revisão
 * @returns {Object} Booking atualizado
 */
export const requestBookingReview = async (bookingId, moderatorId, reviewReason = "") => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    // Só pode solicitar revisão se estiver em avaliação
    if (booking.status !== "evaluation") {
      const err = new Error(
        `Não é possível solicitar revisão de uma reserva em status '${booking.status}'. Deve estar em 'evaluation'.`
      );
      err.statusCode = 400;
      throw err;
    }

    booking.reviewReason = reviewReason;

    return transitionBookingStatus(bookingId, "review", {
      reason: `Revisão solicitada: ${reviewReason}`,
      changedBy: moderatorId,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Finaliza uma reserva (transição para completed)
 * @param {string} bookingId - ID da reserva
 * @param {string} completedBy - ID do usuário que finaliza (moderador, admin, sistema)
 * @returns {Object} Booking atualizado
 */
export const completeBooking = async (bookingId, completedBy = null) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = booking.status || "pending";

    // Pode completar de evaluation ou review
    if (!["evaluation", "review"].includes(currentStatus)) {
      const err = new Error(
        `Não é possível completar uma reserva em status '${currentStatus}'. Deve estar em 'evaluation' ou 'review'.`
      );
      err.statusCode = 400;
      throw err;
    }

    return transitionBookingStatus(bookingId, "completed", {
      reason: "Reserva finalizada",
      changedBy: completedBy,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Cancela uma reserva (transição para canceled)
 * @param {string} bookingId - ID da reserva
 * @param {string} cancelledBy - ID do usuário que cancela
 * @param {string} reason - Motivo do cancelamento
 * @returns {Object} Booking atualizado
 */
export const cancelBooking = async (bookingId, cancelledBy, reason = "") => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    // Só pode cancelar reservas confirmadas
    if (booking.status !== "confirmed") {
      const err = new Error(
        `Não é possível cancelar uma reserva em status '${booking.status}'. Só é possível cancelar reservas 'confirmed'.`
      );
      err.statusCode = 400;
      throw err;
    }

    return transitionBookingStatus(bookingId, "canceled", {
      reason: reason || "Cancelado pelo usuário",
      changedBy: cancelledBy,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Rejusta uma reserva (falha no pagamento - transição para rejected)
 * @param {string} bookingId - ID da reserva
 * @param {string} reason - Motivo da rejeição
 * @returns {Object} Booking atualizado
 */
export const rejectBooking = async (bookingId, reason = "Pagamento rejeitado") => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    // Só pode rejeitar reservas pending
    if (booking.status !== "pending") {
      const err = new Error(
        `Não é possível rejeitar uma reserva em status '${booking.status}'. Só é possível rejeitar reservas 'pending'.`
      );
      err.statusCode = 400;
      throw err;
    }

    return transitionBookingStatus(bookingId, "rejected", {
      reason: reason,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Confirma uma reserva (transição de pending para confirmed)
 * Geralmente chamada após validação de pagamento bem-sucedido
 * @param {string} bookingId - ID da reserva
 * @returns {Object} Booking atualizado
 */
export const confirmBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error("Reserva não encontrada.");
      err.statusCode = 404;
      throw err;
    }

    // Só pode confirmar reservas pending
    if (booking.status !== "pending") {
      const err = new Error(
        `Não é possível confirmar uma reserva em status '${booking.status}'. Só é possível confirmar reservas 'pending'.`
      );
      err.statusCode = 400;
      throw err;
    }

    return transitionBookingStatus(bookingId, "confirmed", {
      reason: "Pagamento aprovado, reserva confirmada",
    });
  } catch (error) {
    throw error;
  }
};

export default {
  isTransitionAllowed,
  transitionBookingStatus,
  requestBookingReview,
  completeBooking,
  cancelBooking,
  rejectBooking,
  confirmBooking,
};
