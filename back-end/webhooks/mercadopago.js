import { processPaymentNotification } from "../domains/payments/service.js";
import { createBooking, getBookingByPaymentId } from "../prisma/repositories/bookings.repository.js";
import { getPrismaClient } from "../config/prisma.js";
import { saveFailedPayment } from "../domains/payments/failedPaymentsStore.js";
import * as fs from "fs";
import path from "path";

const prisma = getPrismaClient();

const mapPaymentStatus = (mpStatus) => ({
  approved: "approved",
  pending: "pending",
  in_process: "pending",
  in_mediation: "pending",
  rejected: "rejected",
  cancelled: "rejected",
  refunded: "CANCELLED",
  charged_back: "CANCELLED",
}[String(mpStatus || "").toLowerCase()] || "pending");

async function upsertBookingPayment(bookingId, paymentId, paymentInfo, status) {
  const providerPaymentId = String(paymentId);
  const amount = Number(paymentInfo.transaction_amount || 0);

  const existing = await prisma.payment.findFirst({
    where: {
      bookingId,
      provider: "MERCADO_PAGO",
      OR: [
        { providerPaymentId },
        { providerPreferenceId: String(paymentInfo.preference_id || "") },
      ],
    },
  });

  if (existing) {
    return prisma.payment.update({
      where: { id: existing.id },
      data: {
        providerPaymentId,
        providerPreferenceId: paymentInfo.preference_id ? String(paymentInfo.preference_id) : existing.providerPreferenceId,
        amount: Number.isFinite(amount) ? amount : existing.amount,
        status,
        transactionDetails: paymentInfo,
        approvedAt: status === "APPROVED" ? new Date() : existing.approvedAt,
      },
    });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  return prisma.payment.create({
    data: {
      bookingId,
      userId: booking.guestId,
      provider: "MERCADO_PAGO",
      providerPaymentId,
      providerPreferenceId: paymentInfo.preference_id ? String(paymentInfo.preference_id) : null,
      status,
      amount: Number.isFinite(amount) ? amount : Number(booking.totalPrice),
      transactionDetails: paymentInfo,
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });
}

async function finalizeApprovedPayment({ paymentId, paymentInfo, metadata }) {
  const existingBooking = await getBookingByPaymentId(paymentId);
  if (existingBooking) {
    return existingBooking;
  }

  const createdBooking = await createBooking({
    place: metadata.accommodationId,
    user: metadata.userId,
    checkin: metadata.checkIn,
    checkout: metadata.checkOut,
    guests: metadata.guests || 1,
  });

  const dbBooking = await prisma.booking.findFirst({
    where: {
      OR: [
        { id: createdBooking.id },
        { legacyMongoId: String(createdBooking._id || createdBooking.id) },
      ],
    },
  });

  await prisma.booking.update({
    where: { id: dbBooking.id },
    data: {
      legacyMercadoPagoPaymentId: String(paymentId),
      legacyPaymentStatus: "approved",
      legacyPaymentMethod: String(paymentInfo.payment_method_id || paymentInfo.payment_type_id || "mercado_pago"),
      legacyTransactionAmount: Number(paymentInfo.transaction_amount || createdBooking.totalPrice || 0),
      legacyTransactionDetails: paymentInfo,
      paymentApprovedAt: new Date(),
      status: "CONFIRMED",
      lastStatusChange: new Date(),
    },
  });

  await upsertBookingPayment(dbBooking.id, paymentId, paymentInfo, "APPROVED");
  return { ...createdBooking, id: dbBooking.id };
}

export const handleMercadoPagoWebhook = async (req, res) => {
  try {
    try {
      const logPath = path.resolve("tmp", "mp_notifications.log");
      fs.appendFileSync(logPath, `${JSON.stringify({ timestamp: new Date().toISOString(), notification: req.body })}\n`);
    } catch {}

    const mpType = req.body.type || req.body.topic || (req.body.action ? String(req.body.action).split(".")[0] : undefined);
    const incomingPaymentId = req.body?.data?.id || req.body?.id || req.body?.resource;

    if (!mpType || String(mpType).toLowerCase() !== "payment") {
      return res.status(200).json({ received: true, message: "Notificacao ignorada" });
    }

    if (!incomingPaymentId) {
      return res.status(200).json({ received: true, message: "Notificacao sem paymentId" });
    }

    const paymentData = await processPaymentNotification({ data: { id: incomingPaymentId } });
    const paymentStatus = mapPaymentStatus(paymentData.status);

    if (paymentStatus === "rejected") {
      await saveFailedPayment({
        provider: "mercado_pago",
        paymentId: paymentData.paymentId,
        status: paymentStatus,
        statusDetail: paymentData.paymentInfo?.status_detail || null,
        reason: paymentData.paymentInfo?.status_detail || null,
        metadata: paymentData.metadata || {},
        paymentInfo: paymentData.paymentInfo || {},
      });
      return res.status(200).json({ received: true, message: "Pagamento rejeitado registrado", paymentStatus });
    }

    if (paymentStatus !== "approved") {
      return res.status(200).json({ received: true, message: "Pagamento ainda nao aprovado", paymentStatus });
    }

    const { userId, accommodationId, totalPrice } = paymentData.metadata || {};
    if (!userId || !accommodationId || totalPrice === undefined || totalPrice === null) {
      return res.status(200).json({ received: true, message: "Metadata incompleta para criacao da reserva" });
    }

    const booking = await finalizeApprovedPayment({
      paymentId: paymentData.paymentId,
      paymentInfo: paymentData.paymentInfo,
      metadata: paymentData.metadata,
    });

    return res.status(200).json({
      received: true,
      message: "Reserva criada ou reconciliada com sucesso",
      bookingId: booking.id || booking._id,
      paymentStatus: "approved",
    });
  } catch (error) {
    console.error("Erro ao processar webhook Mercado Pago:", error);
    return res.status(200).json({
      received: true,
      message: "Notificacao recebida mas houve erro no processamento",
      error: error.message,
    });
  }
};

export const verifyWebhook = async (req, res) => {
  res.status(200).json({
    status: "Webhook ativo",
    timestamp: new Date().toISOString(),
  });
};
