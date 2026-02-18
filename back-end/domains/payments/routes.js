import { Router } from "express";
import { createPaymentPreference, checkPaymentStatus, testMercadoPagoConfig, captureAuthorizedPayment } from "./controller.js";
import { JWTVerify } from "../../ultis/jwt.js";


const router = Router();

// Configuração do cookie baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

/**
 * Middleware de autenticação para rotas de pagamento
 */
const authenticateUser = async (req, res, next) => {
    try {
        const userInfo = await JWTVerify(req, COOKIE_NAME);
        req.user = userInfo;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Usuário não autenticado. Faça login para continuar.",
            error: error.message
        });
    }
};

/**
 * POST /api/payments/create
 * Cria uma preferência de checkout Mercado Pago
 * Requer autenticação
 */
router.post("/create", authenticateUser, createPaymentPreference);

/**
 * GET /api/payments/status/:paymentId
 * Verifica status de um pagamento (para consultas manuais)
 * Requer autenticação
 */
router.get("/status/:paymentId", authenticateUser, checkPaymentStatus);

/**
 * Captura pagamento autorizado
 */
router.post("/capture/:paymentId", authenticateUser, captureAuthorizedPayment);

/**
 * GET /api/payments/test-config
 * Testa a configuração do Mercado Pago (token, autenticação)
 * Endpoint público - não requer autenticação
 */
router.get("/test-config", testMercadoPagoConfig);

// Admin: lista pagamentos rejeitados (failedPayments)
router.get("/failed", authenticateUser, async (req, res) => {
    try {
        const FailedPayment = (await import("./failedPaymentModel.js")).default;
        const page = Math.max(0, parseInt(req.query.page) || 0);
        const limit = Math.min(100, parseInt(req.query.limit) || 50);
        const items = await FailedPayment.find().sort({ receivedAt: -1 }).skip(page * limit).limit(limit);
        return res.status(200).json({ success: true, data: items });
    } catch (err) {
        console.error("Erro ao listar failedPayments:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Retry endpoint para um failedPayment (admin)
router.post('/failed/:paymentId/retry', authenticateUser, async (req, res) => {
    try {
        const { retryFailedPayment } = await import('./controller.js');
        return await retryFailedPayment(req, res);
    } catch (err) {
        console.error('Erro no endpoint de retry:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

import transparentRoutes from "./transparentRoutes.js";
import pixRoutes from "./pixRoutes.js";
router.use(transparentRoutes);
router.use(pixRoutes);

export default router;
