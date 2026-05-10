import express from "express";
import { stripeClient, webhookSecret } from "../config/stripe.js";
import { createBooking, getBookingByPaymentId } from "../prisma/repositories/bookings.repository.js";
import { getPrismaClient } from "../config/prisma.js";

const prisma = getPrismaClient();
const router = express.Router();

const extractPaymentData = (event) => {
  const obj = event.data?.object;
  if (!obj) return null;

  if (obj.object === "checkout.session" && obj.payment_status === "paid") {
    return { metadata: obj.metadata || {}, paymentId: obj.payment_intent || obj.id, paymentInfo: obj };
  }
  if (obj.object === "payment_intent" && obj.status === "succeeded") {
    return { metadata: obj.metadata || {}, paymentId: obj.id, paymentInfo: obj };
  }
  if (obj.object === "charge" && obj.paid) {
    return { metadata: obj.metadata || {}, paymentId: obj.payment_intent || obj.id, paymentInfo: obj };
  }
  return null;
};

async function upsertStripePayment(bookingId, paymentId, paymentInfo) {
  const providerPaymentId = String(paymentId);
  const amount = Number((paymentInfo.amount_received ?? paymentInfo.amount_total ?? 0) / 100);
  const existing = await prisma.payment.findFirst({
    where: { bookingId, provider: "STRIPE", providerPaymentId },
  });

  if (existing) {
    return prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: "APPROVED",
        amount: amount || existing.amount,
        transactionDetails: paymentInfo,
        approvedAt: new Date(),
      },
    });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  return prisma.payment.create({
    data: {
      bookingId,
      userId: booking.guestId,
      provider: "STRIPE",
      providerPaymentId,
      status: "APPROVED",
      amount: amount || Number(booking.totalPrice),
      transactionDetails: paymentInfo,
      approvedAt: new Date(),
    },
  });
}

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (stripeClient && webhookSecret) {
      const rawBody = req.rawBody || req.body;
      event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ error: "Stripe webhook secret not configured" });
      }
      const body = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err?.message || err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  if (!["checkout.session.completed", "payment_intent.succeeded", "charge.succeeded"].includes(event.type)) {
    return res.status(200).json({ received: true, message: "event-ignored" });
  }

  try {
    const extracted = extractPaymentData(event);
    if (!extracted) {
      return res.status(200).json({ received: true, message: "no-action-needed" });
    }

    const { metadata, paymentId, paymentInfo } = extracted;
    const userId = metadata.userId || metadata.user_id;
    const accommodationId = metadata.accommodationId || metadata.accommodation_id;
    const checkIn = metadata.checkIn || metadata.check_in;
    const checkOut = metadata.checkOut || metadata.check_out;
    const guests = Number(metadata.guests) || 1;

    if (!userId || !accommodationId || !checkIn || !checkOut) {
      return res.status(200).json({ received: true, message: "missing-metadata" });
    }

    let booking = await getBookingByPaymentId(paymentId);
    if (!booking) {
      booking = await createBooking({
        place: accommodationId,
        user: userId,
        checkin: checkIn,
        checkout: checkOut,
        guests,
      });
    }

    const dbBooking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: booking.id },
          { legacyMongoId: String(booking._id || booking.id) },
        ],
      },
    });

    await prisma.booking.update({
      where: { id: dbBooking.id },
      data: {
        legacyMercadoPagoPaymentId: String(paymentId),
        legacyPaymentStatus: "approved",
        legacyPaymentMethod: "stripe",
        legacyTransactionAmount: Number((paymentInfo.amount_received ?? paymentInfo.amount_total ?? 0) / 100),
        legacyTransactionDetails: paymentInfo,
        paymentApprovedAt: new Date(),
        status: "CONFIRMED",
        lastStatusChange: new Date(),
      },
    });

    await upsertStripePayment(dbBooking.id, paymentId, paymentInfo);
    return res.status(200).json({ received: true, bookingId: dbBooking.id });
  } catch (err) {
    console.error("Erro ao processar webhook Stripe:", err?.message || err);
    return res.status(200).json({ received: true, message: "processing-error", error: err?.message });
  }
});

export default router;
