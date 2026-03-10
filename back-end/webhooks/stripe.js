import express from 'express';
import { stripeClient, webhookSecret } from '../config/stripe.js';
import Booking from '../domains/bookings/model.js';

// NOTE: This route uses express.raw middleware to preserve the raw body required for
// Stripe signature verification. When mounting this router in your main routes,
// ensure it is mounted like: router.use('/webhook/stripe', stripeWebhookRouter);

const router = express.Router();

/**
 * Extrai metadata e paymentId de eventos relevantes do Stripe.
 * Suporta: checkout.session.completed, payment_intent.succeeded, charge.succeeded
 */
const extractPaymentData = (event) => {
  const obj = event.data?.object;
  if (!obj) return null;

  let metadata = null;
  let paymentId = null;
  let approved = false;

  if (obj.object === 'checkout.session') {
    // Checkout Session: metadata está diretamente no objeto da sessão
    if (obj.payment_status === 'paid') {
      metadata = obj.metadata || {};
      paymentId = obj.payment_intent || obj.id;
      approved = true;
    }
  } else if (obj.object === 'payment_intent' && obj.status === 'succeeded') {
    // PaymentIntent: metadata propagada via payment_intent_data.metadata
    metadata = obj.metadata || {};
    paymentId = obj.id;
    approved = true;
  } else if (obj.object === 'charge' && obj.paid) {
    metadata = obj.metadata || {};
    paymentId = obj.payment_intent || obj.id;
    approved = true;
  }

  if (!approved || !paymentId) return null;
  return { metadata, paymentId };
};

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    if (stripeClient && webhookSecret) {
      // req.body is a Buffer because of express.raw
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback for environments where stripe is not configured (e.g., tests)
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed:', err && err.message ? err.message : err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  console.log('🔔 Stripe webhook received:', event.type);

  // Ignora eventos que não criam reservas
  const handledTypes = ['checkout.session.completed', 'payment_intent.succeeded', 'charge.succeeded'];
  if (!handledTypes.includes(event.type)) {
    return res.status(200).json({ received: true, message: 'event-ignored' });
  }

  try {
    const extracted = extractPaymentData(event);
    if (!extracted) {
      console.log('⚠️ Stripe webhook: sem dados de pagamento acionáveis em:', event.type);
      return res.status(200).json({ received: true, message: 'no-action-needed' });
    }

    const { metadata, paymentId } = extracted;

    const userId = metadata.userId || metadata.user_id;
    const accommodationId = metadata.accommodationId || metadata.accommodation_id;
    const checkIn = metadata.checkIn || metadata.check_in;
    const checkOut = metadata.checkOut || metadata.check_out;
    const guests = Number(metadata.guests) || 1;
    const nights = Number(metadata.nights) || 1;
    const rawTotalPrice = Number(metadata.totalPrice || metadata.total_price);
    const rawPricePerNight = Number(metadata.pricePerNight || metadata.price_per_night);
    const totalPrice = isNaN(rawTotalPrice) ? 0 : rawTotalPrice;
    const pricePerNight = isNaN(rawPricePerNight) ? 0 : rawPricePerNight;

    if (!userId || !accommodationId || !checkIn || !checkOut) {
      console.error('❌ Stripe webhook: metadata incompleta', { userId, accommodationId, checkIn, checkOut, paymentId });
      return res.status(200).json({ received: true, message: 'missing-metadata' });
    }

    if (totalPrice <= 0) {
      console.error('❌ Stripe webhook: totalPrice inválido na metadata', { totalPrice, paymentId });
      return res.status(200).json({ received: true, message: 'invalid-price-metadata' });
    }

    // Idempotência: não cria reserva duplicada para o mesmo pagamento
    const existing = await Booking.findOne({ mercadopagoPaymentId: String(paymentId) });
    if (existing) {
      console.log(`✅ Reserva já existe para o pagamento ${paymentId}: ${existing._id}`);
      return res.status(200).json({ received: true, message: 'booking-already-exists', bookingId: existing._id });
    }

    const createdBooking = await Booking.createFromPayment({
      place: accommodationId,
      user: userId,
      pricePerNight,
      priceTotal: totalPrice,
      checkin: checkIn,
      checkout: checkOut,
      guests,
      nights,
      mercadopagoPaymentId: paymentId.toString(),
      paymentStatus: 'approved',
    });

    console.log(`✅ Reserva criada via webhook Stripe: ${createdBooking._id} (pagamento: ${paymentId})`);
    return res.status(200).json({ received: true, bookingId: createdBooking._id });
  } catch (err) {
    console.error('❌ Erro ao processar webhook Stripe:', err && err.message ? err.message : err);
    // Retorna 200 para conflitos de data (não deve retentar — é um erro de negócio)
    if (err?.statusCode === 409 || (err?.message || '').toLowerCase().includes('conflitantes')) {
      return res.status(200).json({ received: true, message: 'date-conflict', error: err.message });
    }
    // Para outros erros, retorna 200 também para evitar retentativas infinitas do Stripe
    return res.status(200).json({ received: true, message: 'processing-error', error: err?.message });
  }
});

export default router;
