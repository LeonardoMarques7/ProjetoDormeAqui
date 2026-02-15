import { createPixPayment, generatePixPayload } from "./pixService.js";

export const createPixPaymentController = async (req, res, next) => {
  try {
    const result = await createPixPayment(req.body, req.user);
    if (result.success) {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Erro ao criar pagamento PIX." });
  }
};

export const createPixPayloadController = async (req, res, next) => {
  try {
    const { key, amount, merchantName, merchantCity, txid } = req.body || {};
    // generate random key if not provided
    const randomKey = key || Math.random().toString(36).substring(2, 18);
    const payload = generatePixPayload({ key: randomKey, amount, merchantName: merchantName || 'DormeAqui', merchantCity: merchantCity || 'Sao Paulo', txid });
    return res.status(200).json({ success: true, payload, key: randomKey });
  } catch (error) {
    next(error);
  }
};
