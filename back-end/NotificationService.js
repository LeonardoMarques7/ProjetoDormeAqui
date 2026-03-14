import Notification from "./NotificationModel.js";
import { EventEmitter } from "events";

// Sistema centralizado de eventos de notificação
export const notificationEventEmitter = new EventEmitter();

/**
 * Cria uma notificação usando o padrão findOrCreate para evitar duplicatas
 * @param {string} userId - ID do usuário
 * @param {string} type - Tipo de evento
 * @param {string} entityId - ID da entidade relacionada (reserva, lugar, etc)
 * @param {object} notificationData - Dados da notificação (title, message, link, etc)
 * @returns {Promise<{notification: object, created: boolean}>}
 */
export async function createNotification(
  userId,
  type,
  entityId,
  notificationData
) {
  try {
    const { notification, created } = await Notification.findOrCreate(
      userId,
      type,
      entityId,
      {
        title: notificationData.title || "Nova notificação",
        message: notificationData.message || "",
        entityType: notificationData.entityType || "system",
        link: notificationData.link || null,
        metadata: notificationData.metadata || {},
      }
    );

    if (created) {
      // Emite evento para WebSocket enviar para o cliente
      notificationEventEmitter.emit("notification:created", {
        userId,
        notification: notification.toObject(),
      });

      console.log(`[Notification] Criada: ${type} para usuário ${userId}`);
    } else {
      console.log(`[Notification] Duplicada detectada: ${type} para usuário ${userId}`);
    }

    return { notification, created };
  } catch (error) {
    console.error("[Notification] Erro ao criar notificação:", error);
    throw error;
  }
}

/**
 * Obtém notificações do usuário
 * @param {string} userId - ID do usuário
 * @param {number} page - Página (padrão 1)
 * @param {number} limit - Limite de notificações por página (padrão 10)
 * @returns {Promise<{notifications: array, total: number, page: number}>}
 */
export async function getUserNotifications(userId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      userId,
      dismissed: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({
      userId,
      dismissed: false,
    });

    return {
      notifications,
      total,
      page,
      hasMore: skip + limit < total,
    };
  } catch (error) {
    console.error("[Notification] Erro ao buscar notificações:", error);
    throw error;
  }
}

/**
 * Marca uma notificação como lida
 * @param {string} notificationId - ID da notificação
 * @returns {Promise<object>}
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      const error = new Error("Notificação não encontrada");
      error.statusCode = 404;
      throw error;
    }

    return notification;
  } catch (error) {
    console.error("[Notification] Erro ao marcar como lida:", error);
    throw error;
  }
}

/**
 * Marca todas as notificações como lidas
 * @param {string} userId - ID do usuário
 * @returns {Promise<{modifiedCount: number}>}
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const result = await Notification.updateMany(
      { userId, read: false, dismissed: false },
      { read: true, updatedAt: new Date() }
    );

    return result;
  } catch (error) {
    console.error("[Notification] Erro ao marcar todas como lidas:", error);
    throw error;
  }
}

/**
 * Descarta uma notificação
 * @param {string} notificationId - ID da notificação
 * @returns {Promise<object>}
 */
export async function dismissNotification(notificationId) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { dismissed: true, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      const error = new Error("Notificação não encontrada");
      error.statusCode = 404;
      throw error;
    }

    notificationEventEmitter.emit("notification:dismissed", {
      userId: notification.userId,
      notificationId,
    });

    return notification;
  } catch (error) {
    console.error("[Notification] Erro ao descartar:", error);
    throw error;
  }
}

/**
 * Obtém contagem de notificações não lidas
 * @param {string} userId - ID do usuário
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  try {
    const count = await Notification.countDocuments({
      userId,
      read: false,
      dismissed: false,
    });

    return count;
  } catch (error) {
    console.error("[Notification] Erro ao contar não lidas:", error);
    throw error;
  }
}

/**
 * Limpa notificações antigas (mais de X dias)
 * @param {number} daysOld - Número de dias (padrão 30)
 * @returns {Promise<{deletedCount: number}>}
 */
export async function cleanupOldNotifications(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      dismissed: true, // Só deleta notificações descartadas
    });

    console.log(`[Notification] Limpeza: ${result.deletedCount} notificações antigas removidas`);
    return result;
  } catch (error) {
    console.error("[Notification] Erro ao limpar:", error);
    throw error;
  }
}
