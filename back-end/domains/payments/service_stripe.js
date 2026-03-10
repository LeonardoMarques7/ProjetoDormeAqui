import { stripeClient, paymentClient } from '../../config/stripe.js';
import Place from '../places/model.js';

// Utility: map Stripe status to internal style
const mapStripeStatus = (stripeStatus) => {
  if (!stripeStatus) return 'unknown';
  const s = String(stripeStatus).toLowerCase();
  if (s === 'succeeded' || s === 'paid') return 'approved';
  if (s === 'requires_capture' || s === 'requires_action' || s === 'requires_confirmation') return 'authorized';
  if (s === 'processing') return 'pending';
  if (s === 'canceled' || s === 'failed') return 'rejected';
  return s;
};

export const createCheckoutPreference = async ({ accommodationId, userId, checkIn, checkOut, guests, frontendUrl, payerEmail }) => {
  // Validate inputs similar to mercadopago flow
  if (!accommodationId || !userId || !checkIn || !checkOut || !guests) {
    const err = new Error('Dados incompletos para criar preferência (Stripe)');
    err.statusCode = 400;
    throw err;
  }

  let place = await Place.findById(accommodationId);
  if (!place) {
    const err = new Error('Acomodação não encontrada');
    err.statusCode = 404;
    throw err;
  }

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = Number(place.price) * nights;

  // Build session params compatible with config/stripe.createPreferenceWithBackUrls
  const sessionData = {
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'brl',
          product_data: { name: place.title, description: place.description },
          unit_amount: Math.round(Number(place.price) * 100),
        },
        quantity: nights,
      }
    ],
    metadata: {
      userId: userId?.toString?.() || userId,
      accommodationId: accommodationId?.toString?.() || accommodationId,
      checkIn: checkIn.toISOString ? checkIn.toISOString() : new Date(checkIn).toISOString(),
      checkOut: checkOut.toISOString ? checkOut.toISOString() : new Date(checkOut).toISOString(),
      guests: String(guests),
      nights: String(nights),
      totalPrice: String(totalPrice),
    },
    extra: {},
  };

  const backUrls = {
    success: `${(frontendUrl || '').replace(/\/$/, '')}/payment/success`,
    cancel: `${(frontendUrl || '').replace(/\/$/, '')}/payment/failure`,
  };

  // Create checkout session
  const session = await paymentClient.createPreferenceWithBackUrls(sessionData, backUrls, { idempotencyKey: `pref_${Date.now()}_${accommodationId}` });

  return {
    id: session.id,
    initPoint: session.url || session.payment_url || null,
    sandboxInitPoint: session.url || null,
    totalPrice,
    nights,
    pricePerNight: place.price,
    accommodationTitle: place.title,
    backUrls: backUrls
  };
};

export const verifyStripeConfig = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, message: 'STRIPE_SECRET_KEY not configured' };
  }
  try {
    // Try a harmless call
    const apiVersion = stripeClient._apiVersion || 'unknown';
    return { success: true, apiVersion };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getPaymentInfo = async (paymentId) => {
  if (!paymentId) throw new Error('paymentId required');

  // Handle Stripe Checkout Session IDs (cs_...)
  if (String(paymentId).startsWith('cs_')) {
    try {
      const session = await stripeClient.checkout.sessions.retrieve(paymentId);
      const status = session.payment_status === 'paid' ? 'approved' : mapStripeStatus(session.payment_status);
      return {
        id: session.payment_intent || session.id,
        status,
        metadata: session.metadata || {},
        external_reference: null,
        transaction_amount: session.amount_total ? Number(session.amount_total / 100) : undefined,
        date_created: new Date((session.created || Date.now()) * 1000).toISOString(),
        date_approved: session.payment_status === 'paid' ? new Date((session.created || Date.now()) * 1000).toISOString() : undefined,
        raw: session,
      };
    } catch (err) {
      console.error('Error retrieving Stripe Checkout Session:', err.message);
      throw err;
    }
  }

  // Try to retrieve PaymentIntent
  try {
    const pi = await stripeClient.paymentIntents.retrieve(paymentId);
    // Map to a structure compatible with processPaymentNotification expectations
    const mapped = {
      id: pi.id,
      status: mapStripeStatus(pi.status),
      metadata: pi.metadata || {},
      external_reference: pi.metadata?.external_reference || null,
      transaction_amount: (pi.amount_received || pi.amount) ? Number((pi.amount_received || pi.amount) / 100) : undefined,
      date_created: new Date((pi.created || Date.now()) * 1000).toISOString(),
      date_approved: pi.status === 'succeeded' ? new Date((pi.created || Date.now()) * 1000).toISOString() : undefined,
      // include raw object for downstream inspection
      raw: pi
    };
    return mapped;
  } catch (err) {
    // If not a paymentIntent, try charge
    try {
      const ch = await stripeClient.charges.retrieve(paymentId);
      const mapped = {
        id: ch.id,
        status: mapStripeStatus(ch.status),
        metadata: ch.metadata || {},
        external_reference: ch.metadata?.external_reference || null,
        transaction_amount: ch.amount ? Number(ch.amount / 100) : undefined,
        date_created: new Date((ch.created || Date.now()) * 1000).toISOString(),
        date_approved: ch.paid ? new Date((ch.created || Date.now()) * 1000).toISOString() : undefined,
        raw: ch
      };
      return mapped;
    } catch (err2) {
      console.error('Error retrieving payment info from Stripe:', err.message, err2?.message);
      throw err;
    }
  }
};

export default {
  createCheckoutPreference,
  verifyStripeConfig,
  getPaymentInfo,
};
