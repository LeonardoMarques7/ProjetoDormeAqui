import { processTransparentPayment } from "./transparentService.js";

export const createTransparentPayment = async (req, res, next) => {
  try {
    // Allow guest payments (req.user can be null when using optionalAuthenticate middleware)
    // The service already handles optional user with optional chaining (user?._id)
    const user = req.user || null;
    
    if (user) {
      console.log("💳 Pagamento iniciado por usuário autenticado:", user.email || user._id);
    } else {
      console.log("💳 Pagamento iniciado por guest (sem autenticação)");
    }

    const paymentResult = await processTransparentPayment(req.body, user);
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
