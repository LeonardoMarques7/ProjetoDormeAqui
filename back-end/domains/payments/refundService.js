import { paymentClient } from '../../config/stripe.js';

export const refundPayment = async (chargeId, amount = null, opts = {}) => {
  try {
    console.log('=== Stripe REFUND REQUEST ===', { chargeId, amount });

    const data = { charge: chargeId };
    if (amount) data.amount = amount; // in cents

    const response = await paymentClient.refund(data, opts);

    console.log('=== Stripe REFUND RESULT ===', { id: response.id, status: response.status });

    return { success: true, refund: response };
  } catch (error) {
    console.error('❌ Stripe REFUND ERROR:', error?.response || error.message);
    throw error;
  }
};
