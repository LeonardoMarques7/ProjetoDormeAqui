import { model, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "reservation_created",
        "reservation_confirmed",
        "reservation_cancelled",
        "reservation_reminder_5days",
        "reservation_reminder_1day",
        "place_created",
        "place_updated",
        "price_updated",
        "user_login",
        "user_logout",
        "payment_success",
        "payment_failed",
        "payment_pending",
        "review_received",
        "message_received",
        "booking_request",
        "booking_approved",
        "booking_declined",
        "system_announcement",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      required: false,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["reservation", "place", "payment", "user", "review", "system"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    dismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: { userId: 1, type: 1, entityId: 1, dismissed: -1 },
        unique: false,
        name: "idx_dedup_notifications",
      },
    ],
  }
);

// Index para evitar duplicatas: mesma notificação não ativa não pode ser criada
notificationSchema.index(
  { userId: 1, type: 1, entityId: 1 },
  {
    name: "idx_notification_dedup",
    partialFilterExpression: { dismissed: false },
  }
);

notificationSchema.statics.findOrCreate = async function (
  userId,
  type,
  entityId,
  notificationData
) {
  const Notification = this;

  try {
    // Busca notificação existente e não descartada
    const existing = await Notification.findOne({
      userId,
      type,
      entityId: entityId || null,
      dismissed: false,
    });

    if (existing) {
      // Se existe, atualiza o timestamp mas não cria duplicata
      existing.updatedAt = new Date();
      await existing.save();
      return { notification: existing, created: false };
    }

    // Se não existe, cria nova
    const newNotification = new Notification({
      userId,
      type,
      entityId: entityId || null,
      ...notificationData,
    });

    await newNotification.save();
    return { notification: newNotification, created: true };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - tenta buscar novamente
      const existing = await Notification.findOne({
        userId,
        type,
        entityId: entityId || null,
        dismissed: false,
      });
      return { notification: existing, created: false };
    }
    throw error;
  }
};

export default model("Notification", notificationSchema);
