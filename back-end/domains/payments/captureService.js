import { paymentClient } from "../../config/mercadopago.js";

export const capturePayment = async (paymentId) => {
  try {
    console.log("=== MP CAPTURE REQUEST ===", paymentId);

    const response = await paymentClient.capture({ id: paymentId });

    console.log("=== MP CAPTURE RESULT ===", {
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      captured: response.captured,
    });

    return {
      success: true,
      status: response.status,
      payment: response,
    };
  } catch (error) {
    console.error("❌ MP CAPTURE ERROR:", error.response?.data || error.message);
    throw error;
  }
};
