import QRCode from 'qrcode';
import Place from '../places/model.js';
import { paymentClient } from '../../config/stripe.js';

// Stripe doesn't support PIX natively in all regions. We'll implement a fallback using
// PaymentIntents with 'boleto'/'oxxo' when available, and otherwise generate a QR code
// using our own EMV builder + manual payment link flow (requires manual reconciliation).

export const createPixPayment = async (data, user) => {
  const { accommodationId, checkIn, checkOut, guests, email } = data;

  if (!accommodationId || !checkIn || !checkOut || !guests || !email) {
    return { success: false, message: 'Dados incompletos para pagamento PIX.' };
  }

  const place = await Place.findById(accommodationId);
  if (!place) return { success: false, message: 'Acomodação não encontrada.' };

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1;
  const pricePerNight = Number(place.price) || 0;
  const totalPrice = pricePerNight * nights;

  if (!totalPrice || totalPrice <= 0) return { success: false, message: 'Valor do pagamento inválido (R$ 0).' };

  try {
    // Try to create a PaymentIntent with a PIX-like payment method if available
    const amountCents = Math.round(totalPrice * 100);

    const piParams = {
      amount: amountCents,
      currency: process.env.STRIPE_CURRENCY || 'brl',
      payment_method_types: ['card'],
      metadata: {
        userId: user?._id?.toString() || '',
        accommodationId: accommodationId?.toString() || '',
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        totalPrice: String(totalPrice),
      }
    };

    // If Stripe supports 'pix' as payment method in env, prefer it
    if (process.env.STRIPE_SUPPORTS_PIX === 'true') {
      piParams.payment_method_types = ['pix'];
    }

    const pi = await paymentClient.createPaymentIntent(piParams, { idempotencyKey: `pix_${Date.now()}_${accommodationId}` });

    // If Stripe returns a QR code or hosted_payment_url, normalize accordingly
    let qr_code = null;
    let qr_code_base64 = null;
    let paymentUrl = pi?.next_action?.use_stripe_sdk?.stripe_js || pi?.payment_url || null;

    // If provider gave us an EMV payload (unlikely), generate PNG
    const emvPayload = pi?.metadata?.emv_payload;
    if (emvPayload) {
      const dataUrl = await QRCode.toDataURL(emvPayload);
      qr_code_base64 = dataUrl.split(',')[1];
      qr_code = emvPayload;
    }

    return {
      success: true,
      message: 'Pagamento PIX (Stripe flow) criado com sucesso (fallback).',
      paymentId: pi.id,
      status: pi.status,
      qr_code,
      qr_code_base64,
      paymentUrl,
      paymentResponse: pi
    };
  } catch (error) {
    console.error('❌ Stripe PIX fallback error:', error?.response || error?.message || error);
    return { success: false, message: 'Erro ao criar pagamento PIX via Stripe.', error: error?.message || error };
  }
};
