import { processTransparentPayment } from "./transparentService.js";

export const createTransparentPayment = async (req, res, next) => {
  try {
    // Require authenticated user to ensure userId is present in metadata
    if (!req.user || !req.user._id) {
      console.error("Pagamento transparente sem autenticação: rejeitado.");
      return res.status(401).json({ success: false, message: "Usuário não autenticado. Faça login para prosseguir com o pagamento." });
    }

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
