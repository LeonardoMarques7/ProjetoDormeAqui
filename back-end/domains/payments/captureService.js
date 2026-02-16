import { paymentClient } from "../../config/mercadopago.js";

export const capturePayment = async (paymentId) => {
  try {
    console.log("=== MP CAPTURE REQUEST ===", paymentId);

    const response = await paymentClient.update({
      id: paymentId,
      body: { capture: true },
    });

    console.log("=== MP CAPTURE RESULT ===", {
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      captured: response.captured,
    });

    return response;
  } catch (error) {
    console.error("❌ MP CAPTURE ERROR:", error.response?.data || error.message);
    throw error;
  }
};
