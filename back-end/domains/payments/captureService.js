import { paymentClient } from "../../config/stripe.js";

export const capturePayment = async (paymentId) => {
  try {
    console.log("=== Stripe CAPTURE REQUEST ===", paymentId);

    // Stripe: capture a PaymentIntent
    const response = await paymentClient.capture('paymentIntents', paymentId);

    console.log("=== Stripe CAPTURE RESULT ===", {
      id: response.id,
      status: response.status,
      // Stripe doesn't expose status_detail similarly; include full object when needed
      captured: response.status === 'succeeded',
    });

    return {
      success: true,
      status: response.status,
      payment: response,
    };
  } catch (error) {
    console.error("❌ Stripe CAPTURE ERROR:", error?.response || error.message);
    throw error;
  }
};
