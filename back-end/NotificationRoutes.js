import { Router } from "express";
import { requireAuth } from "./domains/middleware.js";
import {
  clearAllNotifications,
  dismissNotification,
  getUnreadCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./NotificationService.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    res.json(await getUserNotifications(req.user._id, page, limit));
  } catch (error) {
    console.error("[Notifications Route] Erro ao buscar:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    res.json({ unreadCount: await getUnreadCount(req.user._id) });
  } catch (error) {
    console.error("[Notifications Route] Erro ao contar:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    res.json(await markNotificationAsRead(req.params.id));
  } catch (error) {
    console.error("[Notifications Route] Erro ao marcar como lida:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.patch("/mark-all-read", async (req, res) => {
  try {
    res.json({
      success: true,
      ...(await markAllNotificationsAsRead(req.user._id)),
    });
  } catch (error) {
    console.error("[Notifications Route] Erro ao marcar todas:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/dismiss", async (req, res) => {
  try {
    res.json(await dismissNotification(req.params.id));
  } catch (error) {
    console.error("[Notifications Route] Erro ao descartar:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    res.json(await dismissNotification(req.params.id));
  } catch (error) {
    console.error("[Notifications Route] Erro ao remover:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    res.json({
      success: true,
      ...(await clearAllNotifications(req.user._id)),
    });
  } catch (error) {
    console.error("[Notifications Route] Erro ao limpar:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
