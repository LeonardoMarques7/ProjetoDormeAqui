import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  getUnreadCount,
} from "../NotificationService.js";

const router = Router();

/**
 * GET /notifications
 * Obtém notificações do usuário autenticado
 * Query params:
 *   - page: número da página (padrão 1)
 *   - limit: itens por página (padrão 10)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.id;

    const result = await getUserNotifications(userId, page, limit);

    res.json(result);
  } catch (error) {
    console.error("[Notifications Route] Erro ao buscar:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notifications/unread-count
 * Obtém contagem de notificações não lidas
 */
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("[Notifications Route] Erro ao contar:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /notifications/:id/read
 * Marca uma notificação como lida
 */
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await markNotificationAsRead(notificationId);

    res.json(notification);
  } catch (error) {
    console.error("[Notifications Route] Erro ao marcar como lida:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

/**
 * PATCH /notifications/mark-all-read
 * Marca todas as notificações como lidas
 */
router.patch("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[Notifications Route] Erro ao marcar todas:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /notifications/:id/dismiss
 * Descarta uma notificação
 */
router.patch("/:id/dismiss", authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await dismissNotification(notificationId);

    res.json(notification);
  } catch (error) {
    console.error("[Notifications Route] Erro ao descartar:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;
