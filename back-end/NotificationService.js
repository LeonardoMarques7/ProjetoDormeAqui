import { EventEmitter } from "events";
import { getPrismaClient } from "./config/prisma.js";

const prisma = getPrismaClient();

export const notificationEventEmitter = new EventEmitter();

const notificationShape = (notification) => ({
  _id: notification.id,
  id: notification.id,
  userId: notification.userId,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  entityId: notification.entityId,
  entityType: notification.entityType,
  link: notification.link,
  read: notification.read,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export async function createNotification(userId, type, entityId, notificationData = {}) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      entityId: entityId ? String(entityId) : null,
    },
  });

  if (existing) {
    return { notification: notificationShape(existing), created: false };
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      entityId: entityId ? String(entityId) : null,
      title: notificationData.title || "Nova notificacao",
      message: notificationData.message || "",
      entityType: notificationData.entityType || "system",
      link: notificationData.link || null,
    },
  });

  const shaped = notificationShape(notification);
  notificationEventEmitter.emit("notification:created", { userId, notification: shaped });
  return { notification: shaped, created: true };
}

export async function getUserNotifications(userId, page = 1, limit = 10) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications: notifications.map(notificationShape),
    total,
    page: safePage,
    hasMore: skip + safeLimit < total,
  };
}

export async function markNotificationAsRead(notificationId) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return notificationShape(notification);
}

export async function markAllNotificationsAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { modifiedCount: result.count };
}

export async function dismissNotification(notificationId) {
  const notification = await prisma.notification.delete({
    where: { id: notificationId },
  });

  notificationEventEmitter.emit("notification:dismissed", {
    userId: notification.userId,
    notificationId,
  });

  return notificationShape(notification);
}

export async function clearAllNotifications(userId) {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return { deletedCount: result.count };
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
