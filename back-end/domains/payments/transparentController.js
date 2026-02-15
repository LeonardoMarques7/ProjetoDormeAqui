import { processTransparentPayment } from "./transparentService.js";

export const createTransparentPayment = async (req, res, next) => {
  try {
    const paymentResult = await processTransparentPayment(req.body, req.user);
    if (paymentResult.success) {
      return res.status(200).json(paymentResult);
    }
    return res.status(400).json(paymentResult);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erro ao processar pagamento transparente.",
    });
  }
};
